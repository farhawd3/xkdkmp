import { NextResponse } from "next/server";
import { verifyPrivateApiAccess } from "@/lib/security/private-access";
import { createClient } from "@/lib/supabase/server";
import { TaskSchema, TaskStatusUpdateSchema } from "@/lib/validations/simple-schemas";

export async function GET(request: Request) {
  try {
    const access = verifyPrivateApiAccess(request);
    if (!access.allowed) {
      return NextResponse.json({ error: access.error || "Akses ditolak." }, { status: access.status || 403 });
    }

    const { searchParams } = new URL(request.url);
    const unitId = searchParams.get("unit_id");
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");

    const supabase = await createClient();
    let query = supabase
      .from("tasks")
      .select("id, title, description, unit_id, pic_name, due_date, priority, status, notes, created_at, updated_at, business_units(name)")
      .order("created_at", { ascending: false });

    if (unitId) query = query.eq("unit_id", unitId);
    if (status) query = query.eq("status", status);
    if (priority) query = query.eq("priority", priority);

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: "Daftar tugas belum dapat dimuat dari Supabase: " + error.message }, { status: 500 });
    }

    return NextResponse.json({ tasks: data ?? [] }, { headers: { "Cache-Control": "no-store" } });
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
    const parsed = TaskSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data tugas tidak valid." }, { status: 400 });
    }

    const task = parsed.data;
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("tasks")
      .insert({
        title: task.title,
        description: task.description || null,
        unit_id: task.unit_id || null,
        pic_name: task.pic_name,
        due_date: task.due_date || null,
        priority: task.priority,
        status: task.status,
        notes: task.notes || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Gagal menyimpan tugas ke Supabase: " + error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, task: data });
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

    // Cek apakah update cepat status saja atau update data penuh
    if (body.id && Object.keys(body).length === 2 && "status" in body) {
      const parsedStatus = TaskStatusUpdateSchema.safeParse(body);
      if (!parsedStatus.success) {
        return NextResponse.json({ error: parsedStatus.error.issues[0]?.message ?? "Status tidak valid." }, { status: 400 });
      }

      const supabase = await createClient();
      const { data, error } = await supabase
        .from("tasks")
        .update({ status: parsedStatus.data.status, updated_at: new Date().toISOString() })
        .eq("id", parsedStatus.data.id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: "Gagal memperbarui status tugas: " + error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, task: data });
    }

    // Update penuh
    const parsed = TaskSchema.safeParse(body);
    if (!parsed.success || !body.id) {
      return NextResponse.json({ error: "Data tugas tidak lengkap untuk pembaruan." }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("tasks")
      .update({
        title: parsed.data.title,
        description: parsed.data.description || null,
        unit_id: parsed.data.unit_id || null,
        pic_name: parsed.data.pic_name,
        due_date: parsed.data.due_date || null,
        priority: parsed.data.priority,
        status: parsed.data.status,
        notes: parsed.data.notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", body.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Gagal memperbarui rincian tugas: " + error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, task: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan sistem.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const access = verifyPrivateApiAccess(request);
    if (!access.allowed) {
      return NextResponse.json({ error: access.error || "Akses ditolak." }, { status: access.status || 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID tugas diperlukan." }, { status: 400 });

    const supabase = await createClient();
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ error: "Gagal menghapus tugas: " + error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan sistem.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
