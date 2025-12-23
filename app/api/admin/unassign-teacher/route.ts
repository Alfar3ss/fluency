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

    const { class_id } = await request.json();
    if (!class_id) {
      return Response.json({ error: "Invalid request" }, { status: 400 });
    }

    // Unassign teacher from class
    const { error: unassignError } = await supabase
      .from("classes")
      .update({ teacher_id: null, teacher_name: null })
      .eq("id", class_id);

    if (unassignError) {
      return Response.json({ error: unassignError.message }, { status: 400 });
    }

    return Response.json({ success: true });
  } catch (err: any) {
    console.error("Unassign teacher error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
