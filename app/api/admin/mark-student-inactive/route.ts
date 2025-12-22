import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(req: NextRequest) {
  try {
    const { student_id } = await req.json();

    if (!student_id) {
      return NextResponse.json(
        { error: "Missing student_id" },
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
      .select("id")
      .eq("id", userData.user.id)
      .single();

    if (!adminData) {
      return NextResponse.json(
        { error: "Only admins can update student status" },
        { status: 403 }
      );
    }

    // Mark student as inactive
    const { data: updatedStudent, error: updateError } = await adminClient
      .from("student_users")
      .update({ status: "Inactive" })
      .eq("id", student_id)
      .select()
      .single();

    if (updateError) {
      console.error("Error marking student inactive:", updateError);
      return NextResponse.json(
        { error: "Failed to update student status" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      student: updatedStudent,
    });
  } catch (error) {
    console.error("Error in mark-student-inactive:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
