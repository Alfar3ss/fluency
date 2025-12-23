import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

// Decode JWT payload locally
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

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ classId: string; sessionDate: string }> }
) {
  try {
    const { classId, sessionDate } = await context.params;

    if (!classId || !sessionDate) {
      return NextResponse.json({ error: "Missing classId or sessionDate" }, { status: 400 });
    }

    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Decode JWT to get user
    const payload = decodeJWTPayload(token);
    if (!payload || !payload.sub) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();

    // Verify admin access
    const { data: adminRow, error: adminError } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", payload.sub)
      .single();

    if (adminError || !adminRow) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Fetch attendance records for this class + date with student details
    const { data: records, error: recordsError } = await supabase
      .from("attendance")
      .select(
        `
        student_id,
        status,
        student_users:student_id (
          user_id,
          full_name,
          email
        )
      `
      )
      .eq("class_id", classId)
      .eq("session_date", sessionDate);

    if (recordsError) {
      return NextResponse.json({ error: recordsError.message }, { status: 500 });
    }

    // Transform the data to flatten student info
    const students = (records || [])
      .map((record: any) => {
        const student = Array.isArray(record.student_users) 
          ? record.student_users[0] 
          : record.student_users;
        return {
          user_id: student?.user_id || record.student_id,
          full_name: student?.full_name || "Unknown",
          email: student?.email,
          status: record.status,
        };
      })
      .sort((a, b) => a.full_name.localeCompare(b.full_name));

    return NextResponse.json(
      { classId, sessionDate, students },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
