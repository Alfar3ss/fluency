import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { full_name, email, password, languages, levels, hourly_rate } = body ?? {};

    if (!full_name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify admin authentication
    const cookieStore = await cookies();
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

    // 1) Create auth user (email confirmed)
    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: "teacher", full_name },
    });

    if (createErr) {
      return NextResponse.json({ error: createErr.message }, { status: 400 });
    }

    const userId = created?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "User creation failed" }, { status: 500 });
    }

    // 2) Insert row into teacher_users
    const languagesArray: string[] = typeof languages === "string"
      ? languages.split(",").map((s) => s.trim()).filter(Boolean)
      : Array.isArray(languages) ? languages : [];

    const parsedRate = hourly_rate !== undefined && hourly_rate !== null && `${hourly_rate}`.length
      ? Number(hourly_rate)
      : null;

    const { error: insertErr } = await supabase.from("teacher_users").insert({
      user_id: userId,
      full_name,
      email,
      languages_taught: languagesArray.length ? languagesArray : null,
      qualifications: levels || null,
      hourly_rate: parsedRate,
      is_verified: true,
    });

    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, user_id: userId });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Unexpected error" }, { status: 500 });
  }
}
