-- Migration: 20260923000003_atomic_rpcs.sql
-- Proyek: Kopdes Merah Putih di Ladang Laweh (Tahap 09)
-- Deskripsi: Fungsi SQL RPC multi-tabel atomik (Penerimaan Gudang, Transaksi Kasir POS, dan Jurnal Seimbang)
-- Acuan: docs/ACCESS_MATRIX.md dan Prinsip Ketelitian Uang & Imutabilitas

-- ============================================================================
-- 1. RPC: PENERIMAAN BARANG FISIK DI GUDANG DENGAN PENAMBAHAN STOK ATOMIK
-- ============================================================================
CREATE OR REPLACE FUNCTION public.rpc_receive_goods_shipment(
  p_po_id UUID,
  p_delivery_note_number TEXT,
  p_received_date DATE,
  p_items JSONB,
  p_notes TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_po RECORD;
  v_receipt_id UUID;
  v_receipt_number TEXT;
  v_item RECORD;
  v_prod RECORD;
  v_prev_stock INT;
  v_new_stock INT;
  v_all_completed BOOLEAN := TRUE;
  v_new_po_status po_status;
BEGIN
  -- 1. Verifikasi Status Dokumen PO
  SELECT * INTO v_po FROM public.purchase_orders WHERE id = p_po_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Surat Pesanan (PO) dengan ID % tidak ditemukan.', p_po_id;
  END IF;

  IF v_po.status NOT IN ('disetujui', 'diterima_sebagian') THEN
    RAISE EXCEPTION 'PO berstatus "%", penerimaan fisik hanya dapat dilakukan untuk PO yang telah disetujui.', v_po.status;
  END IF;

  -- 2. Buat Header Penerimaan Barang
  v_receipt_number := 'RCV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 6);
  INSERT INTO public.goods_receipts (
    po_id, receipt_number, delivery_note_number, received_date, status, received_by, notes, posted_at
  ) VALUES (
    p_po_id, v_receipt_number, p_delivery_note_number, p_received_date, 'posted', auth.uid(), p_notes, NOW()
  ) RETURNING id INTO v_receipt_id;

  -- 3. Loop Item & Eksekusi Mutasi Fisik Atomik
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(
    product_id UUID, accepted_qty INT, damaged_qty INT, notes TEXT
  ) LOOP
    IF v_item.accepted_qty < 0 OR COALESCE(v_item.damaged_qty, 0) < 0 THEN
      RAISE EXCEPTION 'Kuantitas penerimaan barang tidak boleh bernilai negatif.';
    END IF;

    -- Kunci baris produk
    SELECT * INTO v_prod FROM public.products WHERE id = v_item.product_id FOR UPDATE;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Produk dengan ID % tidak ditemukan dalam katalog.', v_item.product_id;
    END IF;

    v_prev_stock := v_prod.current_stock;
    v_new_stock := v_prev_stock + v_item.accepted_qty;

    -- Update stok fisik produk
    UPDATE public.products 
    SET current_stock = v_new_stock, updated_at = NOW() 
    WHERE id = v_item.product_id;

    -- Masukkan rincian tanda terima
    INSERT INTO public.goods_receipt_items (
      receipt_id, product_id, ordered_qty, accepted_qty, damaged_qty, notes
    ) VALUES (
      v_receipt_id, v_item.product_id, 0, v_item.accepted_qty, COALESCE(v_item.damaged_qty, 0), v_item.notes
    );

    -- Catat kartu mutasi stok fisik (imutabel)
    IF v_item.accepted_qty > 0 THEN
      INSERT INTO public.stock_mutations (
        product_id, mutation_type, qty, previous_stock, new_stock,
        reference_type, reference_id, reference_number, actor_id, notes
      ) VALUES (
        v_item.product_id, 'masuk_po', v_item.accepted_qty, v_prev_stock, v_new_stock,
        'goods_receipt', v_receipt_id, v_receipt_number, auth.uid(),
        'Penerimaan kiriman supplier Surat Jalan: ' || p_delivery_note_number
      );
    END IF;

    -- Update kuantitas akumulasi diterima di PO item
    UPDATE public.purchase_order_items 
    SET received_qty = received_qty + v_item.accepted_qty 
    WHERE po_id = p_po_id AND product_id = v_item.product_id;
  END LOOP;

  -- 4. Periksa apakah seluruh item PO telah terpenuhi
  IF EXISTS (
    SELECT 1 FROM public.purchase_order_items 
    WHERE po_id = p_po_id AND received_qty < ordered_qty
  ) THEN
    v_new_po_status := 'diterima_sebagian';
  ELSE
    v_new_po_status := 'selesai';
  END IF;

  UPDATE public.purchase_orders 
  SET status = v_new_po_status, updated_at = NOW() 
  WHERE id = p_po_id;

  -- 5. Catat Audit Log
  INSERT INTO public.audit_logs (
    actor_id, action, entity_type, entity_id, payload
  ) VALUES (
    auth.uid(), 'RECEIVE_GOODS', 'goods_receipt', v_receipt_id,
    jsonb_build_object('po_id', p_po_id, 'receipt_number', v_receipt_number, 'new_po_status', v_new_po_status)
  );

  RETURN jsonb_build_object(
    'receipt_id', v_receipt_id,
    'receipt_number', v_receipt_number,
    'new_po_status', v_new_po_status
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- ============================================================================
-- 2. RPC: PROSES PENJUALAN KASIR POS DENGAN PENGURANGAN STOK & JURNAL ATOMIK
-- ============================================================================
CREATE OR REPLACE FUNCTION public.rpc_process_pos_sale(
  p_shift_id UUID,
  p_customer_type TEXT,
  p_member_id UUID,
  p_payment_method payment_method_type,
  p_cash_received NUMERIC,
  p_reference_number TEXT,
  p_items JSONB
) RETURNS JSONB AS $$
DECLARE
  v_shift RECORD;
  v_tx_id UUID;
  v_tx_number TEXT;
  v_subtotal NUMERIC(15, 2) := 0.00;
  v_grand_total NUMERIC(15, 2) := 0.00;
  v_cash_change NUMERIC(15, 2) := 0.00;
  v_item RECORD;
  v_prod RECORD;
  v_prev_stock INT;
  v_new_stock INT;
  v_item_subtotal NUMERIC(15, 2);
  v_journal_id UUID;
  v_journal_number TEXT;
  v_cash_acc TEXT;
BEGIN
  -- 1. Verifikasi Shift Kasir Aktif
  SELECT * INTO v_shift FROM public.cashier_shifts WHERE id = p_shift_id AND status = 'aktif' FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Shift kasir tidak aktif atau tidak ditemukan.';
  END IF;

  v_tx_number := 'POS-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 6);

  -- 2. Hitung Total & Validasi Ketersediaan Stok Fisik
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(product_id UUID, quantity INT) LOOP
    IF v_item.quantity <= 0 THEN
      RAISE EXCEPTION 'Kuantitas belanja minimal 1.';
    END IF;

    SELECT * INTO v_prod FROM public.products WHERE id = v_item.product_id FOR UPDATE;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Produk dengan ID % tidak ditemukan.', v_item.product_id;
    END IF;

    IF v_prod.current_stock < v_item.quantity THEN
      RAISE EXCEPTION 'Stok fisik komoditas "%" tidak mencukupi (Tersedia: %, Diminta: %).',
        v_prod.name, v_prod.current_stock, v_item.quantity;
    END IF;

    v_item_subtotal := v_prod.selling_price * v_item.quantity;
    v_subtotal := v_subtotal + v_item_subtotal;
  END LOOP;

  v_grand_total := v_subtotal;

  IF p_payment_method = 'tunai' THEN
    IF p_cash_received < v_grand_total THEN
      RAISE EXCEPTION 'Uang tunai diterima (Rp%) kurang dari total tagihan (Rp%).', p_cash_received, v_grand_total;
    END IF;
    v_cash_change := p_cash_received - v_grand_total;
  ELSE
    v_cash_change := 0.00;
  END IF;

  -- 3. Catat Header Transaksi POS
  INSERT INTO public.pos_transactions (
    transaction_number, shift_id, customer_type, member_id, payment_method,
    subtotal, grand_total, cash_received, cash_change, reference_number, cashier_id
  ) VALUES (
    v_tx_number, p_shift_id, p_customer_type, p_member_id, p_payment_method,
    v_subtotal, v_grand_total, p_cash_received, v_cash_change, p_reference_number, auth.uid()
  ) RETURNING id INTO v_tx_id;

  -- 4. Pengurangan Stok Fisik & Pencatatan Detail
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(product_id UUID, quantity INT) LOOP
    SELECT * INTO v_prod FROM public.products WHERE id = v_item.product_id FOR UPDATE;
    v_prev_stock := v_prod.current_stock;
    v_new_stock := v_prev_stock - v_item.quantity;
    v_item_subtotal := v_prod.selling_price * v_item.quantity;

    -- Update stok
    UPDATE public.products 
    SET current_stock = v_new_stock, updated_at = NOW() 
    WHERE id = v_item.product_id;

    -- Masukkan baris transaksi
    INSERT INTO public.pos_transaction_items (
      transaction_id, product_id, product_sku, product_name, unit_price, cost_price, quantity, subtotal
    ) VALUES (
      v_tx_id, v_item.product_id, v_prod.sku, v_prod.name, v_prod.selling_price, v_prod.cost_price, v_item.quantity, v_item_subtotal
    );

    -- Kartu mutasi stok fisik (pengurangan penjualan)
    INSERT INTO public.stock_mutations (
      product_id, mutation_type, qty, previous_stock, new_stock,
      reference_type, reference_id, reference_number, actor_id, notes
    ) VALUES (
      v_item.product_id, 'keluar_penjualan', -v_item.quantity, v_prev_stock, v_new_stock,
      'pos_transaction', v_tx_id, v_tx_number, auth.uid(),
      'Penjualan kasir struk: ' || v_tx_number
    );
  END LOOP;

  -- 5. Terbitkan Jurnal Akuntansi Otomatis Seimbang
  v_journal_number := 'JRN-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 6);
  v_cash_acc := CASE 
    WHEN p_payment_method = 'tunai' THEN '1101' -- Kas Kasir Gerai Sembako
    WHEN p_payment_method = 'qris_manual' THEN '1102' -- Kas Bank / QRIS
    ELSE '1102' -- Kas Bank Transfer
  END;

  -- Pastikan akun kas dan akun penjualan terdaftar
  INSERT INTO public.chart_of_accounts (account_code, account_name, account_type, normal_balance)
  VALUES 
    (v_cash_acc, 'Kas Operasional Gerai', 'aset', 'debit'),
    ('4101', 'Pendapatan Penjualan Gerai Sembako', 'pendapatan', 'kredit')
  ON CONFLICT (account_code) DO NOTHING;

  INSERT INTO public.journal_entries (
    journal_number, entry_date, reference_type, reference_id, description, total_debit, total_credit, status, created_by
  ) VALUES (
    v_journal_number, CURRENT_DATE, 'pos_transaction', v_tx_id,
    'Penjualan kasir POS struk ' || v_tx_number, v_grand_total, v_grand_total, 'posted', auth.uid()
  ) RETURNING id INTO v_journal_id;

  -- Baris Debit Kas
  INSERT INTO public.journal_lines (journal_id, account_code, debit, credit, memo)
  VALUES (v_journal_id, v_cash_acc, v_grand_total, 0.00, 'Penerimaan pembayaran ' || p_payment_method);

  -- Baris Kredit Pendapatan
  INSERT INTO public.journal_lines (journal_id, account_code, debit, credit, memo)
  VALUES (v_journal_id, '4101', 0.00, v_grand_total, 'Pendapatan ritel sembako ' || v_tx_number);

  RETURN jsonb_build_object(
    'transaction_id', v_tx_id,
    'transaction_number', v_tx_number,
    'grand_total', v_grand_total,
    'cash_change', v_cash_change,
    'journal_number', v_journal_number
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- ============================================================================
-- 3. RPC: PEMBUATAN JURNAL AKUNTANSI DENGAN VALIDASI SEIMBANG (DEBIT = KREDIT)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.rpc_create_balanced_journal(
  p_entry_date DATE,
  p_description TEXT,
  p_reference_type TEXT,
  p_reference_id UUID,
  p_lines JSONB
) RETURNS JSONB AS $$
DECLARE
  v_journal_id UUID;
  v_journal_number TEXT;
  v_total_debit NUMERIC(15, 2) := 0.00;
  v_total_credit NUMERIC(15, 2) := 0.00;
  v_line RECORD;
BEGIN
  -- 1. Hitung Akumulasi Debit dan Kredit
  FOR v_line IN SELECT * FROM jsonb_to_recordset(p_lines) AS x(
    account_code TEXT, debit NUMERIC, credit NUMERIC, memo TEXT
  ) LOOP
    IF COALESCE(v_line.debit, 0) < 0 OR COALESCE(v_line.credit, 0) < 0 THEN
      RAISE EXCEPTION 'Nilai debit dan kredit tidak boleh bernilai negatif.';
    END IF;
    v_total_debit := v_total_debit + COALESCE(v_line.debit, 0.00);
    v_total_credit := v_total_credit + COALESCE(v_line.credit, 0.00);
  END LOOP;

  -- 2. Validasi Keseimbangan Mutlak Pembukuan Berpasangan
  IF v_total_debit <> v_total_credit THEN
    RAISE EXCEPTION 'Jurnal tidak seimbang: Total Debit (Rp%) tidak sama dengan Total Kredit (Rp%).',
      v_total_debit, v_total_credit;
  END IF;

  IF v_total_debit = 0.00 THEN
    RAISE EXCEPTION 'Jurnal pembukuan tidak boleh bernilai Rp0.';
  END IF;

  -- 3. Simpan Header Jurnal
  v_journal_number := 'JRN-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 6);
  INSERT INTO public.journal_entries (
    journal_number, entry_date, reference_type, reference_id, description,
    total_debit, total_credit, status, created_by
  ) VALUES (
    v_journal_number, p_entry_date, p_reference_type, p_reference_id, p_description,
    v_total_debit, v_total_credit, 'posted', auth.uid()
  ) RETURNING id INTO v_journal_id;

  -- 4. Simpan Baris Jurnal
  FOR v_line IN SELECT * FROM jsonb_to_recordset(p_lines) AS x(
    account_code TEXT, debit NUMERIC, credit NUMERIC, memo TEXT
  ) LOOP
    INSERT INTO public.journal_lines (
      journal_id, account_code, debit, credit, memo
    ) VALUES (
      v_journal_id, v_line.account_code, COALESCE(v_line.debit, 0.00), COALESCE(v_line.credit, 0.00), v_line.memo
    );
  END LOOP;

  -- 5. Catat Audit Log
  INSERT INTO public.audit_logs (
    actor_id, action, entity_type, entity_id, payload
  ) VALUES (
    auth.uid(), 'POST_JOURNAL', 'journal_entries', v_journal_id,
    jsonb_build_object('journal_number', v_journal_number, 'total', v_total_debit)
  );

  RETURN jsonb_build_object(
    'journal_id', v_journal_id,
    'journal_number', v_journal_number,
    'total_amount', v_total_debit
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
