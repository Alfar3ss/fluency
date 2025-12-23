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

    const { class_id, student_ids } = await request.json();

    if (!class_id || !Array.isArray(student_ids) || student_ids.length === 0) {
      return Response.json({ error: "Invalid request" }, { status: 400 });
    }

    // Get class and current enrollment count for capacity check
    const [classRes, enrollmentCountRes] = await Promise.all([
      supabase
        .from("classes")
        .select("max_students")
        .eq("id", class_id)
        .single(),
      supabase
        .from("class_enrollments")
        .select("student_id", { count: "exact", head: true })
        .eq("class_id", class_id)
        .eq("status", "active"),
    ]);

    if (classRes.error || !classRes.data) {
      return Response.json({ error: "Class not found" }, { status: 404 });
    }

    const activeCount = enrollmentCountRes.count || 0;
    const availableSpots = (classRes.data.max_students || 0) - activeCount;
    if (student_ids.length > availableSpots) {
      return Response.json({
        error: `Class has only ${availableSpots} available spot${availableSpots !== 1 ? "s" : ""}`,
      }, { status: 400 });
    }

    // Enroll students (idempotent upsert) and keep legacy class_id in sync
    const enrollRows = student_ids.map((student_id: string) => ({ class_id, student_id, status: "active" }));
    const { error: enrollError } = await supabase
      .from("class_enrollments")
      .upsert(enrollRows, { onConflict: "class_id,student_id" });

    if (enrollError) {
      return Response.json({ error: enrollError.message }, { status: 400 });
    }

    await supabase
      .from("student_users")
      .update({ class_id })
      .in("user_id", student_ids);

    // Recompute class current_students from active enrollments
    const { count: newActiveCount } = await supabase
      .from("class_enrollments")
      .select("student_id", { count: "exact", head: true })
      .eq("class_id", class_id)
      .eq("status", "active");

    await supabase
      .from("classes")
      .update({ current_students: newActiveCount || 0 })
      .eq("id", class_id);

    return Response.json({ ok: true, assigned_count: student_ids.length });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
