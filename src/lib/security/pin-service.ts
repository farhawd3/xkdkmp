import { createClient } from "@/lib/supabase/server";

export const PIN_COOKIE_NAME = "kopdes_pin_session";
export const DEFAULT_PIN = "1234";
export const DEFAULT_RECOVERY_PHONE = "081267890123";

/**
 * Membuat token sesi sederhana dan aman untuk cookie.
 */
export function generateSessionToken(pin: string): string {
  const secretSalt = process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 16) || "kopdes-ladang-laweh-salt";
  let hash = 0;
  const str = `pin:${pin}:${secretSalt}`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `kpd_${Math.abs(hash).toString(36)}`;
}

/**
 * Mengambil PIN manajer dan nomor WhatsApp pemulihan dari database Supabase.
 * Fallback ke default ('1234') jika database belum memiliki kolom manager_pin.
 */
export async function getManagerPinData(): Promise<{
  pin: string;
  recoveryPhone: string;
  columnExists: boolean;
}> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("organization_profile")
      .select("manager_pin, phone, recovery_phone")
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return {
        pin: DEFAULT_PIN,
        recoveryPhone: DEFAULT_RECOVERY_PHONE,
        columnExists: false,
      };
    }

    const row = data as Record<string, unknown>;
    const pin = (row.manager_pin as string) || DEFAULT_PIN;
    const recoveryPhone =
      (row.recovery_phone as string) || (row.phone as string) || DEFAULT_RECOVERY_PHONE;

    return {
      pin,
      recoveryPhone,
      columnExists: "manager_pin" in row && row.manager_pin !== undefined,
    };
  } catch {
    return {
      pin: DEFAULT_PIN,
      recoveryPhone: DEFAULT_RECOVERY_PHONE,
      columnExists: false,
    };
  }
}

/**
 * Verifikasi apakah PIN yang dimasukkan cocok dengan PIN manajer.
 */
export async function verifyManagerPin(inputPin: string): Promise<boolean> {
  const cleanInput = inputPin.trim();
  if (!cleanInput) return false;
  const { pin } = await getManagerPinData();
  return cleanInput === pin.trim();
}

/**
 * Memperbarui PIN manajer di database Supabase.
 */
export async function updateManagerPin(
  currentPin: string,
  newPin: string,
  newRecoveryPhone?: string
): Promise<{ success: boolean; error?: string }> {
  const isMatch = await verifyManagerPin(currentPin);
  if (!isMatch) {
    return { success: false, error: "PIN saat ini tidak cocok." };
  }

  const cleanNewPin = newPin.trim();
  if (!/^\d{4,8}$/.test(cleanNewPin)) {
    return { success: false, error: "PIN baru harus berupa 4 hingga 8 digit angka." };
  }

  try {
    const supabase = await createClient();
    const { data: existing } = await supabase
      .from("organization_profile")
      .select("id")
      .limit(1)
      .maybeSingle();

    const updates: Record<string, unknown> = {
      manager_pin: cleanNewPin,
      updated_at: new Date().toISOString(),
    };
    if (newRecoveryPhone && newRecoveryPhone.trim()) {
      updates.recovery_phone = newRecoveryPhone.trim();
    }

    if (existing?.id) {
      const { error } = await supabase
        .from("organization_profile")
        .update(updates)
        .eq("id", existing.id);

      if (error) {
        return {
          success: false,
          error: "Gagal memperbarui PIN di database: " + error.message,
        };
      }
    } else {
      const { error } = await supabase.from("organization_profile").insert({
        display_name: "Kopdes Merah Putih — Ladang Laweh",
        manager_name: "Abdul Halim",
        manager_pin: cleanNewPin,
        recovery_phone: newRecoveryPhone || DEFAULT_RECOVERY_PHONE,
      });
      if (error) {
        return { success: false, error: "Gagal menyimpan PIN baru: " + error.message };
      }
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Kesalahan sistem.";
    return { success: false, error: msg };
  }
}

/**
 * Menghasilkan tautan WhatsApp resmi untuk konfirmasi ganti/lupa PIN.
 */
export function buildWhatsAppResetUrl(phone: string): string {
  // Format nomor WhatsApp internasional Indonesia (ubah 08... menjadi 628...)
  let cleanPhone = phone.replace(/[^0-9]/g, "");
  if (cleanPhone.startsWith("0")) {
    cleanPhone = "62" + cleanPhone.slice(1);
  } else if (!cleanPhone.startsWith("62")) {
    cleanPhone = "62" + cleanPhone;
  }

  const message = encodeURIComponent(
    "Halo Pengurus Kopdes Merah Putih Ladang Laweh,\n\n" +
      "Saya Manajer Koperasi (Abdul Halim) membutuhkan bantuan konfirmasi/reset PIN akses aplikasi Kopdes.\n\n" +
      "Waktu pengajuan: " +
      new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }) +
      " WIB\nMohon bantuannya untuk instruksi reset PIN."
  );

  return `https://wa.me/${cleanPhone}?text=${message}`;
}
