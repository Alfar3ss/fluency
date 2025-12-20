import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, language, level, schedule, max_students } = body ?? {};

    if (!name || !language || !level) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify admin authentication
    const authHeader = request.headers.get("authorization");
    
    const clientSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: authHeader ? { Authorization: authHeader } : {},
        },
      }
    );

    const { data: { user }, error: authErr } = await clientSupabase.auth.getUser();
    if (authErr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: adminRow, error: adminErr } = await clientSupabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", user.id)
      .single();

    if (adminErr || !adminRow) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const supabase = getSupabaseAdmin();

    // Create class in database
    const { data: newClass, error: insertErr } = await supabase.from("classes").insert({
      name,
      language,
      level,
      schedule: schedule || null,
      max_students: max_students || 10,
      current_students: 0,
      status: "Active",
    }).select().single();

    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, class: newClass });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Unexpected error" }, { status: 500 });
  }
}
