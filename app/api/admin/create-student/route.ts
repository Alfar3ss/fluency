import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Create a regular client to verify the token
    const userClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
    );

    // Verify token and get user
    const { data: { user }, error: userError } = await userClient.auth.getUser(token);
    if (userError || !user) {
      return Response.json({ error: "Invalid token" }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();

    // Check if user is admin
    const { data: adminRow, error: adminError } = await supabase
      .from("admin_users")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (adminError || !adminRow) {
      return Response.json({ error: "Admin access required" }, { status: 403 });
    }

    const { full_name, email, password, language, level } = await request.json();

    if (!full_name || !email || !password) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      return Response.json({ error: authError?.message || "Failed to create user" }, { status: 400 });
    }

    // Create student user record
    const { data: studentData, error: studentError } = await supabase
      .from("student_users")
      .insert({
        user_id: authData.user.id,
        full_name,
        email,
        language,
        level,
        status: "Active",
      })
      .select()
      .single();

    if (studentError) {
      return Response.json({ error: studentError.message }, { status: 400 });
    }

    return Response.json({ ok: true, student: studentData });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
