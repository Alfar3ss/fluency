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
      .select("id")
      .eq("user_id", userData.user.id)
      .single();

    if (adminError || !adminRow) {
      return Response.json({ error: "Admin access required" }, { status: 403 });
    }

    const { class_id, student_ids } = await request.json();

    if (!class_id || !Array.isArray(student_ids) || student_ids.length === 0) {
      return Response.json({ error: "Invalid request" }, { status: 400 });
    }

    // Get current class to check capacity
    const { data: classData, error: classError } = await supabase
      .from("classes")
      .select("max_students, current_students")
      .eq("id", class_id)
      .single();

    if (classError || !classData) {
      return Response.json({ error: "Class not found" }, { status: 404 });
    }

    const availableSpots = classData.max_students - (classData.current_students || 0);
    if (student_ids.length > availableSpots) {
      return Response.json({
        error: `Class has only ${availableSpots} available spot${availableSpots !== 1 ? 's' : ''}`,
      }, { status: 400 });
    }

    // Assign students to class
    const { error: assignError } = await supabase
      .from("student_users")
      .update({ class_id })
      .in("id", student_ids);

    if (assignError) {
      return Response.json({ error: assignError.message }, { status: 400 });
    }

    // Update class current_students count
    const { error: updateError } = await supabase
      .from("classes")
      .update({
        current_students: (classData.current_students || 0) + student_ids.length,
      })
      .eq("id", class_id);

    if (updateError) {
      return Response.json({ error: updateError.message }, { status: 400 });
    }

    return Response.json({ ok: true, assigned_count: student_ids.length });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
