import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(req: NextRequest) {
  try {
    const { teacher_id, class_id } = await req.json();

    if (!teacher_id || !class_id) {
      return NextResponse.json(
        { error: "Missing teacher_id or class_id" },
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
        { error: "Only admins can assign teachers" },
        { status: 403 }
      );
    }

    // Assign teacher to class
    const { data: updatedClass, error: updateError } = await adminClient
      .from("classes")
      .update({ teacher_id })
      .eq("id", class_id)
      .select()
      .single();

    if (updateError) {
      console.error("Error assigning teacher:", updateError);
      return NextResponse.json(
        { error: "Failed to assign teacher" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      class: updatedClass,
    });
  } catch (error) {
    console.error("Error in assign-teacher:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
