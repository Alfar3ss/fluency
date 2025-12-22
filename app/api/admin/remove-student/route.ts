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

    // Unassign student from class
    const { error: unassignError } = await supabase
      .from("student_users")
      .update({ class_id: null })
      .eq("user_id", student_id);

    if (unassignError) {
      return Response.json({ error: unassignError.message }, { status: 400 });
    }

    // Decrement current_students (prevent negative)
    const { data: classData, error: classError } = await supabase
      .from("classes")
      .select("current_students")
      .eq("id", class_id)
      .single();

    if (classError || !classData) {
      return Response.json({ error: "Class not found" }, { status: 404 });
    }

    const nextCount = Math.max((classData.current_students || 0) - 1, 0);
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
