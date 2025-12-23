import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

function decodeJWTPayload(token: string): Record<string, any> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const decoded = Buffer.from(parts[1], "base64").toString("utf-8");
    return JSON.parse(decoded);
  } catch (e) {
    return null;
  }
}

// In Next.js 16 app routes, `params` is a Promise and must be awaited
export async function GET(request: Request, context: { params: Promise<{ classId: string }> }) {
  try {
    const { classId } = await context.params;
    if (!classId) {
      return NextResponse.json({ error: "Missing classId" }, { status: 400 });
    }

    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = decodeJWTPayload(token);
    if (!payload?.sub) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();

    // Ensure the class belongs to this teacher
    const { data: classRow, error: classError } = await supabase
      .from("classes")
      .select("id, teacher_id")
      .eq("id", classId)
      .single();

    if (classError) {
      return NextResponse.json({ error: classError.message }, { status: 500 });
    }
    if (!classRow || classRow.teacher_id !== payload.sub) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Fetch students via enrollments (active only)
    const { data: enrollments, error: enrollError } = await supabase
      .from("class_enrollments")
      .select(
        `
        student_id,
        status,
        student:student_id (user_id, full_name, skill_level)
      `
      )
      .eq("class_id", classId)
      .eq("status", "active");

    if (enrollError) {
      return NextResponse.json({ error: enrollError.message }, { status: 500 });
    }

    const students = (enrollments || [])
      .map((row: any) => {
        const student = Array.isArray(row.student) ? row.student[0] : row.student;
        return {
          user_id: student?.user_id || row.student_id,
          full_name: student?.full_name || "Unknown",
          skill_level: student?.skill_level || null,
          class_id: classId,
        };
      })
      .sort((a, b) => a.full_name.localeCompare(b.full_name));

    return NextResponse.json({ students }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Unexpected error" }, { status: 500 });
  }
}
