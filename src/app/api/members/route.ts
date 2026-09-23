import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { SimpleMemberSchema } from "@/lib/validations/simple-schemas";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Sesi masuk diperlukan." }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const status = searchParams.get("status");

    const { createAdminClient } = await import("@/lib/supabase/admin");
    let supabase;
    try {
      supabase = createAdminClient();
    } catch {
      supabase = await createClient();
    }

    let membersQuery = supabase
      .from("members")
      .select("id, member_number, full_name, phone, status, join_date, notes, created_at")
      .eq("is_archived", false)
      .order("member_number", { ascending: true });

    if (status && status !== "semua") {
      membersQuery = membersQuery.eq("status", status);
    }
    if (query.trim()) {
      membersQuery = membersQuery.or(`full_name.ilike.%${query.trim()}%,member_number.ilike.%${query.trim()}%`);
    }

    const [membersRes, totalRes, activeRes, calonRes] = await Promise.all([
      membersQuery,
      supabase.from("members").select("id", { count: "exact", head: true }).eq("is_archived", false),
      supabase.from("members").select("id", { count: "exact", head: true }).eq("is_archived", false).eq("status", "aktif"),
      supabase.from("members").select("id", { count: "exact", head: true }).eq("is_archived", false).eq("status", "calon"),
    ]);

    if (membersRes.error) {
      return NextResponse.json({ error: "Data anggota belum dapat dibaca dari Supabase: " + membersRes.error.message }, { status: 500 });
    }

    return NextResponse.json({
      members: membersRes.data ?? [],
      summary: {
        total: totalRes.count ?? 0,
        aktif: activeRes.count ?? 0,
        calon: calonRes.count ?? 0,
      },
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan sistem.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Sesi masuk diperlukan." }, { status: 401 });

    const body = await request.json();
    const parsed = SimpleMemberSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data anggota tidak valid." }, { status: 400 });
    }

    const member = parsed.data;
    const { createAdminClient } = await import("@/lib/supabase/admin");
    let supabase;
    try {
      supabase = createAdminClient();
    } catch {
      supabase = await createClient();
    }

    const { data, error } = await supabase
      .from("members")
      .insert({
        member_number: member.member_number,
        full_name: member.full_name,
        phone: member.phone || null,
        status: member.status,
        join_date: member.join_date || new Date().toISOString().split("T")[0],
        notes: member.notes || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Gagal menyimpan data anggota ke Supabase: " + error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, member: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan sistem.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Sesi masuk diperlukan." }, { status: 401 });

    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ error: "ID anggota diperlukan untuk pembaruan." }, { status: 400 });
    }

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (body.full_name !== undefined) updates.full_name = body.full_name;
    if (body.phone !== undefined) updates.phone = body.phone;
    if (body.status !== undefined) updates.status = body.status;
    if (body.notes !== undefined) updates.notes = body.notes;

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("members")
      .update(updates)
      .eq("id", body.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Gagal memperbarui data anggota di Supabase: " + error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, member: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan sistem.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
