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

export async function GET(request: NextRequest, context: { params: Promise<{ classId: string }> }) {
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

    // Fetch attendance records grouped by session_date with status counts
    const { data: sessions, error: sessionsError } = await supabase
      .from("attendance")
      .select("session_date, status")
      .eq("class_id", classId);

    if (sessionsError) {
      return NextResponse.json({ error: sessionsError.message }, { status: 500 });
    }

    // Group by date and count statuses
    const grouped = (sessions || []).reduce<Record<string, Record<string, number>>>((acc, record) => {
      const date = record.session_date;
      if (!acc[date]) {
        acc[date] = { present: 0, absent: 0, late: 0 };
      }
      const status = record.status as "present" | "absent" | "late";
      if (status in acc[date]) {
        acc[date][status]++;
      }
      return acc;
    }, {});

    // Convert to array and sort by date descending
    const result = Object.entries(grouped)
      .map(([date, counts]) => ({
        date,
        present: counts.present || 0,
        absent: counts.absent || 0,
        late: counts.late || 0,
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({ sessions: result }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Unexpected error" }, { status: 500 });
  }
}
