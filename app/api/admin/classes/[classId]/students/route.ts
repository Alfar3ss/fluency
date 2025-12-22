import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(
  request: Request,
  context: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await context.params;
    const authHeader = request.headers.get("authorization");
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !anonKey) {
      return NextResponse.json({ error: "Missing Supabase env vars" }, { status: 500 });
    }

    const supabaseAuth = createClient(supabaseUrl, anonKey, {
      global: {
        headers: authHeader ? { Authorization: authHeader } : {},
      },
    });

    const { data: userData, error: authErr } = await supabaseAuth.auth.getUser();
    if (authErr || !userData?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: adminRow, error: adminErr } = await supabaseAuth
      .from("admin_users")
      .select("full_name, role")
      .eq("user_id", userData.user.id)
      .maybeSingle();

    if (adminErr || !adminRow) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const supabase = getSupabaseAdmin();

    const [classRes, studentsRes] = await Promise.all([
      supabase
        .from("classes")
        .select("id, name, language, level, schedule, max_students, current_students, status")
        .eq("id", classId)
        .maybeSingle(),
      supabase
        .from("student_users")
        .select("user_id, full_name, email, skill_level, timezone, native_language, target_languages")
        .eq("class_id", classId)
        .order("full_name", { ascending: true }),
    ]);

    if (classRes.error) {
      return NextResponse.json({ error: classRes.error.message }, { status: 400 });
    }
    if (!classRes.data) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }
    if (studentsRes.error) {
      return NextResponse.json({ error: studentsRes.error.message }, { status: 400 });
    }

    return NextResponse.json({
      admin: { full_name: adminRow.full_name },
      class: classRes.data,
      students: studentsRes.data ?? [],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Unexpected error" }, { status: 500 });
  }
}
