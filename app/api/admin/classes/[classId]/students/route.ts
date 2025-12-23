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

    const classRes = await supabase
      .from("classes")
      .select("id, name, language, level, schedule, max_students, current_students, status, teacher_id, teacher_name")
      .eq("id", classId)
      .maybeSingle();

    if (classRes.error) {
      return NextResponse.json({ error: classRes.error.message }, { status: 400 });
    }
    if (!classRes.data) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    const [studentsRes, teacherRes] = await Promise.all([
      supabase
        .from("class_enrollments")
        .select(
          `
          student_id,
          status,
          student:student_id (user_id, full_name, email, skill_level, timezone, native_language, target_languages)
        `
        )
        .eq("class_id", classId)
        .eq("status", "active"),
      classRes.data.teacher_id
        ? supabase
            .from("teacher_users")
            .select("user_id, full_name, email, languages_taught, hourly_rate, is_verified")
            .eq("user_id", classRes.data.teacher_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

    if (studentsRes.error) {
      return NextResponse.json({ error: studentsRes.error.message }, { status: 400 });
    }

    const students = (studentsRes.data || [])
      .map((row: any) => {
        const student = Array.isArray(row.student) ? row.student[0] : row.student;
        return {
          user_id: student?.user_id || row.student_id,
          full_name: student?.full_name || "Unknown",
          email: student?.email,
          skill_level: student?.skill_level,
          timezone: student?.timezone,
          native_language: student?.native_language,
          target_languages: student?.target_languages,
          class_id: classId,
          status: row.status,
        };
      })
      .sort((a, b) => a.full_name.localeCompare(b.full_name));

    return NextResponse.json(
      {
        admin: { full_name: adminRow.full_name },
        class: classRes.data,
        students,
        teacher: teacherRes?.data ?? null,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Unexpected error" }, { status: 500 });
  }
}
