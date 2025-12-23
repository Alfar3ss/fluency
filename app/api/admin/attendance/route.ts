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
      global: { headers: authHeader ? { Authorization: authHeader } : {} },
    });

    const { data: userData, error: authErr } = await supabaseAuth.auth.getUser();
    if (authErr || !userData?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: adminRow, error: adminErr } = await supabaseAuth
      .from("admin_users")
      .select("user_id")
      .eq("user_id", userData.user.id)
      .maybeSingle();

    if (adminErr || !adminRow) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("classes")
      .select("id, name, language, level, current_students, max_students, status, updated_at")
      .order("updated_at", { ascending: false })
      .limit(200);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { classes: data ?? [] },
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
