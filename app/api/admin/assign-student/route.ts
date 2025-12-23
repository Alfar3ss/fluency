import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(req: NextRequest) {
  try {
    const { student_id, class_id } = await req.json();

    if (!student_id || !class_id) {
      return NextResponse.json(
        { error: "Missing student_id or class_id" },
        { status: 400 }
      );
    }

    // Verify authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.slice(7);

    // Verify user and check if admin
    const userClient = createClient(supabaseUrl!, supabaseAnonKey!);
    const { data: userData, error: userError } = await userClient.auth.getUser(
      token
    );

    if (userError || !userData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminClient = createClient(supabaseUrl!, serviceRoleKey!);

    // Check if user is admin
    const { data: adminData } = await adminClient
      .from("admin_users")
      .select("user_id")
      .eq("user_id", userData.user.id)
      .single();

    if (!adminData) {
      return NextResponse.json(
        { error: "Only admins can assign students" },
        { status: 403 }
      );
    }

    // Enroll student (idempotent) and keep legacy class_id in sync for now
    const { data: enrollment, error: enrollError } = await adminClient
      .from("class_enrollments")
      .upsert({ class_id, student_id, status: "active" }, { onConflict: "class_id,student_id" })
      .select()
      .single();

    if (enrollError) {
      console.error("Error assigning student:", enrollError);
      return NextResponse.json(
        { error: "Failed to assign student" },
        { status: 500 }
      );
    }

    // Keep student_users.class_id populated for existing UI that still reads it
    await adminClient.from("student_users").update({ class_id }).eq("user_id", student_id);

    // Recalculate current_students from active enrollments
    const { count: activeCount } = await adminClient
      .from("class_enrollments")
      .select("student_id", { count: "exact", head: true })
      .eq("class_id", class_id)
      .eq("status", "active");

    if (typeof activeCount === "number") {
      await adminClient.from("classes").update({ current_students: activeCount }).eq("id", class_id);
    }

    return NextResponse.json({
      ok: true,
      enrollment,
    });
  } catch (error) {
    console.error("Error in assign-student:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
