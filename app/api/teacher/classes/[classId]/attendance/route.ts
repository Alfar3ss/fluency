import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

// Decode JWT payload without verification (payload is just base64-encoded JSON)
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

export async function POST(request: NextRequest, context: { params: Promise<{ classId: string }> }) {
  try {
    const { classId } = await context.params;
    console.log("[teacher/attendance] POST /api/teacher/classes/", classId, "/attendance");

    if (!classId) {
      console.log("[teacher/attendance] Missing classId");
      return NextResponse.json({ error: "Missing classId" }, { status: 400 });
    }

    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) {
      console.log("[teacher/attendance] Missing authorization token");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Decode JWT locally without network call
    const payload = decodeJWTPayload(token);
    if (!payload || !payload.sub) {
      console.log("[teacher/attendance] Invalid token payload");
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    const userId = payload.sub;
    console.log("[teacher/attendance] Token decoded for user:", userId);

    const supabase = getSupabaseAdmin();

    // Verify this class belongs to the teacher
    const { data: classRow, error: classError } = await supabase
      .from("classes")
      .select("id, teacher_id")
      .eq("id", classId)
      .single();

    if (classError) {
      console.log("[teacher/attendance] Error fetching class:", classError.message);
      return NextResponse.json({ error: classError.message }, { status: 500 });
    }
    if (!classRow) {
      console.log("[teacher/attendance] Class not found:", classId);
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }
    if (classRow.teacher_id !== userId) {
      console.log("[teacher/attendance] Access denied - teacher mismatch");
      return NextResponse.json({ error: "Access denied - you are not the teacher for this class" }, { status: 403 });
    }

    console.log("[teacher/attendance] Class verified, loading enrollments");

    const { data: enrollments, error: enrollError } = await supabase
      .from("class_enrollments")
      .select("student_id")
      .eq("class_id", classId)
      .eq("status", "active");

    if (enrollError) {
      console.log("[teacher/attendance] Enrollment query error:", enrollError.message);
      return NextResponse.json({ error: "Failed to load enrollments" }, { status: 500 });
    }

    const allowedStudents = new Set((enrollments || []).map((e) => e.student_id));

    const body = await request.json().catch((e) => {
      console.log("[teacher/attendance] JSON parse error:", e.message);
      return null;
    });

    const records: Array<{ student_id: string; session_date: string; status: string; class_id: string }> = body?.records || [];
    if (!Array.isArray(records) || records.length === 0) {
      console.log("[teacher/attendance] No records or invalid format");
      return NextResponse.json({ error: "No attendance records provided" }, { status: 400 });
    }

    console.log("[teacher/attendance] Processing", records.length, "records");

    // Validate basic fields
    for (let i = 0; i < records.length; i++) {
      const r = records[i];
      if (!r.student_id || !r.session_date || !r.status || !r.class_id) {
        console.log("[teacher/attendance] Invalid record at index", i, ":", r);
        return NextResponse.json({ error: "Invalid record payload at index " + i }, { status: 400 });
      }
      if (r.class_id !== classId) {
        console.log("[teacher/attendance] Class ID mismatch at index", i);
        return NextResponse.json({ error: "Record class_id mismatch at index " + i }, { status: 400 });
      }
      if (!allowedStudents.has(r.student_id)) {
        console.log("[teacher/attendance] Student not enrolled in class at index", i, r.student_id);
        return NextResponse.json({ error: "Student is not enrolled in this class" }, { status: 400 });
      }
    }

    console.log("[teacher/attendance] All records valid, upserting...");

    // Upsert attendance records using service role
    const { data: upsertData, error: upsertError } = await supabase
      .from("attendance")
      .upsert(records, {
        onConflict: "class_id,student_id,session_date",
      });

    if (upsertError) {
      console.log("[teacher/attendance] Upsert error:", upsertError.message, upsertError.code);
      return NextResponse.json({ error: "Database error: " + upsertError.message }, { status: 500 });
    }

    console.log("[teacher/attendance] Upsert successful, returning ok");
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    console.error("[teacher/attendance] Unexpected error:", err.message, err);
    return NextResponse.json({ error: "Server error: " + (err?.message || "Unknown") }, { status: 500 });
  }
}
