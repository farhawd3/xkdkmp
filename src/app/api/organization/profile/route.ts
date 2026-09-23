import { NextResponse } from "next/server";
import { verifyPrivateApiAccess } from "@/lib/security/private-access";
import { createClient } from "@/lib/supabase/server";
import { OrganizationProfileUpdateSchema } from "@/lib/validations/simple-schemas";

const DEFAULT_PROFILE = {
  display_name: "Kopdes Merah Putih — Ladang Laweh",
  legal_name: null,
  business_status: "persiapan",
  manager_name: "Abdul Halim",
  manager_title: "Manajer Koperasi",
  region: "Nagari Ladang Laweh, Kec. Banuhampu, Agam",
  full_address: "Simpang Tiga Ladang Laweh, Kec. Banuhampu, Kab. Agam, Sumatera Barat",
  fiscal_year: "2026/2027",
  operational_target_date: null,
  phone: null,
  email: null,
  legal_doc_status: "belum_diunggah",
  npwp_koperasi: null,
  bank_name: null,
  bank_account_number: null,
  bank_account_holder: null,
  notes: null,
};

export async function GET(request: Request) {
  try {
    const access = verifyPrivateApiAccess(request);
    if (!access.allowed) {
      return NextResponse.json({ error: access.error || "Akses ditolak." }, { status: access.status || 403 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("organization_profile")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: "Gagal membaca profil organisasi dari Supabase: " + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { profile: data ?? DEFAULT_PROFILE },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan sistem.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const access = verifyPrivateApiAccess(request);
    if (!access.allowed) {
      return NextResponse.json({ error: access.error || "Akses ditolak." }, { status: access.status || 403 });
    }

    const body = await request.json();
    const parsed = OrganizationProfileUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Data profil organisasi tidak valid." },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: existing, error: existingError } = await supabase
      .from("organization_profile")
      .select("id")
      .limit(1)
      .maybeSingle();

    if (existingError) {
      return NextResponse.json(
        { error: "Gagal memeriksa profil organisasi: " + existingError.message },
        { status: 500 }
      );
    }

    let saveResult;
    const now = new Date().toISOString();

    if (existing?.id) {
      saveResult = await supabase
        .from("organization_profile")
        .update({
          ...parsed.data,
          updated_at: now,
        })
        .eq("id", existing.id)
        .select()
        .single();
    } else {
      saveResult = await supabase
        .from("organization_profile")
        .insert({
          ...parsed.data,
          created_at: now,
          updated_at: now,
        })
        .select()
        .single();
    }

    if (saveResult.error) {
      return NextResponse.json(
        { error: "Gagal menyimpan profil organisasi ke Supabase: " + saveResult.error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: saveResult.data,
      message: "Profil organisasi berhasil disimpan secara permanen di database Supabase.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan sistem.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
