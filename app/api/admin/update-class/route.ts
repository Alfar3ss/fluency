import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function PUT(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();

    // Verify token and get user
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) {
      return Response.json({ error: "Invalid token" }, { status: 401 });
    }

    // Check if user is admin
    const { data: adminRow, error: adminError } = await supabase
      .from("admin_users")
      .select("id")
      .eq("user_id", userData.user.id)
      .single();

    if (adminError || !adminRow) {
      return Response.json({ error: "Admin access required" }, { status: 403 });
    }

    const { class_id, name, language, level, schedule, max_students } = await request.json();

    if (!class_id || !name || !language || !level) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Update class
    const { data: updatedClass, error: updateError } = await supabase
      .from("classes")
      .update({
        name,
        language,
        level,
        schedule,
        max_students,
      })
      .eq("id", class_id)
      .select()
      .single();

    if (updateError) {
      return Response.json({ error: updateError.message }, { status: 400 });
    }

    return Response.json({ ok: true, class: updatedClass });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
