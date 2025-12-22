import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(request: Request) {
  try {
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

    const [studentsCount, waitingStudents, classesRes, teachersRes, studentsRes] = await Promise.all([
      supabase.from("student_users").select("user_id", { count: "exact", head: true }),
      supabase.from("student_users").select("language, level").is("class_id", null),
      supabase
        .from("classes")
        .select("id, name, language, level, schedule, max_students, current_students, status, teacher_name, teacher_id")
        .order("name", { ascending: true }),
      supabase
        .from("teacher_users")
        .select("user_id, full_name, email, languages_taught, qualifications, hourly_rate, is_verified")
        .limit(50),
      supabase
        .from("student_users")
        .select("user_id, full_name, email, language, level, placement_level, class_id")
        .limit(50),
    ]);

    const waitingPoolGroups: Record<string, number> = {};
    waitingStudents.data?.forEach((s) => {
      const key = `${s.language || "Unknown"} ${s.level || ""}`;
      waitingPoolGroups[key] = (waitingPoolGroups[key] || 0) + 1;
    });
    const waitingPool = Object.entries(waitingPoolGroups).map(([name, count]) => ({ name, count, max: 10 }));

    return NextResponse.json({
      admin: adminRow,
      stats: {
        totalStudents: studentsCount.count ?? 0,
        waiting: waitingStudents.data?.length ?? 0,
        classesActive: classesRes.count ?? classesRes.data?.length ?? 0,
        teachersActive: teachersRes.data?.length ?? 0,
        alerts: 0,
      },
      waitingPool,
      classes: classesRes.data ?? [],
      students: studentsRes.data ?? [],
      teachers: teachersRes.data ?? [],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Unexpected error" }, { status: 500 });
  }
}