import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

// Single, fast payload for admin student management
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !anonKey) {
      return NextResponse.json({ error: "Missing Supabase env vars" }, { status: 500 });
    }

    const supabaseAuth = createClient(supabaseUrl, anonKey, {
      global: { headers: authHeader ? { Authorization: authHeader } : {} },
    });

    const { data: userData, error: authErr } = await supabaseAuth.auth.getUser();
    if (authErr || !userData?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: adminRow, error: adminErr } = await supabaseAuth
      .from("admin_users")
      .select("full_name")
      .eq("user_id", userData.user.id)
      .maybeSingle();

    if (adminErr || !adminRow) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const supabase = getSupabaseAdmin();

    const [studentsRes, countsRes] = await Promise.all([
      supabase
        .from("student_users")
        .select(
          "user_id, full_name, email, native_language, target_languages, skill_level, learning_goals, timezone, phone, avatar_url, created_at"
        )
        .order("created_at", { ascending: false }),
      // supabase-js v2 removed .group(), so use aggregated select to get per-level counts
      supabase
        .from("student_users")
        .select("skill_level, count:skill_level"),
    ]);

    const levelCounts: Record<string, number> = {};
    countsRes.data?.forEach((row: any) => {
      levelCounts[row.skill_level || "Unknown"] = row.count;
    });

    return NextResponse.json({
      admin: adminRow,
      students: studentsRes.data ?? [],
      stats: {
        total: studentsRes.count ?? studentsRes.data?.length ?? 0,
        byLevel: levelCounts,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Unexpected error" }, { status: 500 });
  }
}