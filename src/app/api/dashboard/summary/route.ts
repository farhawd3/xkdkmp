import { NextResponse } from "next/server";
import { verifyPrivateApiAccess } from "@/lib/security/private-access";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const access = verifyPrivateApiAccess(request);
    if (!access.allowed) {
      return NextResponse.json({ error: access.error || "Akses ditolak." }, { status: access.status || 403 });
    }

    const supabase = await createClient();
    const [members, products, tasks, profile] = await Promise.all([
      supabase.from("members").select("id", { count: "exact", head: true }).eq("is_archived", false),
      supabase.from("products").select("id", { count: "exact", head: true }).eq("is_archived", false),
      supabase.from("tasks").select("id", { count: "exact", head: true }),
      supabase.from("organization_profile").select("business_status").limit(1).maybeSingle(),
    ]);

    const failed = [members, products, tasks, profile].find((result) => result.error);
    if (failed?.error) {
      return NextResponse.json({ error: "Data ringkasan belum dapat dibaca dari Supabase." }, { status: 503 });
    }

    return NextResponse.json({
      members: members.count ?? 0,
      products: products.count ?? 0,
      tasks: tasks.count ?? 0,
      businessStatus: profile.data?.business_status ?? "persiapan",
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Hak akses atau koneksi database belum dapat diverifikasi." }, { status: 503 });
  }
}
