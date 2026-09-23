import { NextResponse } from "next/server";
import { verifyPrivateApiAccess } from "@/lib/security/private-access";
import { createClient } from "@/lib/supabase/server";
import { SimpleMemberSchema, SimpleMemberUpdateSchema } from "@/lib/validations/simple-schemas";
import { getTodayWIB } from "@/lib/utils";

export async function GET(request: Request) {
  try {
    const access = verifyPrivateApiAccess(request);
    if (!access.allowed) {
      return NextResponse.json({ error: access.error || "Akses ditolak." }, { status: access.status || 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const query = searchParams.get("q") || "";
    const status = searchParams.get("status");

    const supabase = await createClient();

    if (id) {
      const { data, error } = await supabase
        .from("members")
        .select("id, member_number, full_name, phone, status, join_date, notes, created_at, is_archived")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        return NextResponse.json({ error: "Gagal memuat rincian anggota dari Supabase: " + error.message }, { status: 500 });
      }
      if (!data) {
        return NextResponse.json({ error: "Anggota tidak ditemukan." }, { status: 404 });
      }
      return NextResponse.json({ member: data }, { headers: { "Cache-Control": "no-store" } });
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

    const queryError = membersRes.error || totalRes.error || activeRes.error || calonRes.error;
    if (queryError) {
      return NextResponse.json({ error: "Data anggota belum dapat dibaca dari Supabase: " + queryError.message }, { status: 500 });
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
    const access = verifyPrivateApiAccess(request);
    if (!access.allowed) {
      return NextResponse.json({ error: access.error || "Akses ditolak." }, { status: access.status || 403 });
    }

    const body = await request.json();
    const parsed = SimpleMemberSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data anggota tidak valid." }, { status: 400 });
    }

    const member = parsed.data;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("members")
      .insert({
        member_number: member.member_number,
        full_name: member.full_name,
        phone: member.phone || null,
        status: member.status,
        join_date: member.join_date || getTodayWIB(),
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
    const access = verifyPrivateApiAccess(request);
    if (!access.allowed) {
      return NextResponse.json({ error: access.error || "Akses ditolak." }, { status: access.status || 403 });
    }

    const body = await request.json();
    const parsed = SimpleMemberUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Pembaruan anggota tidak valid." }, { status: 400 });
    }
    const { id, ...fields } = parsed.data;
    const updates: Record<string, unknown> = {
      ...fields,
      updated_at: new Date().toISOString(),
    };

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("members")
      .update(updates)
      .eq("id", id)
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
