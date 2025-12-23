import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
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
      .select("user_id")
      .eq("user_id", userData.user.id)
      .single();

    if (adminError || !adminRow) {
      return Response.json({ error: "Admin access required" }, { status: 403 });
    }

    const { class_id, student_id } = await request.json();
    if (!class_id || !student_id) {
      return Response.json({ error: "Invalid request" }, { status: 400 });
    }

    // Remove enrollment and clear legacy class_id
    const { error: unenrollError } = await supabase
      .from("class_enrollments")
      .delete()
      .eq("class_id", class_id)
      .eq("student_id", student_id);

    if (unenrollError) {
      return Response.json({ error: unenrollError.message }, { status: 400 });
    }

    await supabase.from("student_users").update({ class_id: null }).eq("user_id", student_id);

    // Recompute current_students from active enrollments
    const { count: activeCount } = await supabase
      .from("class_enrollments")
      .select("student_id", { count: "exact", head: true })
      .eq("class_id", class_id)
      .eq("status", "active");

    const nextCount = activeCount || 0;
    const { error: updateError } = await supabase
      .from("classes")
      .update({ current_students: nextCount })
      .eq("id", class_id);

    if (updateError) {
      return Response.json({ error: updateError.message }, { status: 400 });
    }

    return Response.json({ ok: true });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
