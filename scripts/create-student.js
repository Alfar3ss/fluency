// One-off script to create a student auth user + DB row
// Usage:
//   node scripts/create-student.js --email user@example.com --name "John Doe" --password "Passw0rd!" --language "English" --level "A1"

const { createClient } = require("@supabase/supabase-js");
const path = require("path");

// Load env from .env.local
try {
  require("dotenv").config({ path: path.resolve(__dirname, "../.env.local") });
} catch (e) {
  console.warn("dotenv not found; ensure env is loaded manually if this fails.");
}

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < args.length; i += 1) {
    const a = args[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const val = args[i + 1];
      out[key] = val;
      i += 1;
    }
  }
  return out;
}

(async () => {
  const { email, name, password, language, level } = parseArgs();
  if (!email || !name || !password) {
    console.error("Missing required args: --email --name --password [--language] [--level]");
    process.exit(1);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey);

  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError || !authData?.user) {
      throw new Error(authError?.message || "Failed to create auth user");
    }

    const userId = authData.user.id;

    // Insert student row
    const { data: studentData, error: studentError } = await supabase
      .from("student_users")
      .insert({
        user_id: userId,
        full_name: name,
        email,
        language: language || null,
        level: level || null,
        status: "Active",
      })
      .select()
      .single();

    if (studentError) {
      throw new Error(studentError.message);
    }

    console.log("Success:\n", {
      auth_user_id: userId,
      student_id: studentData?.id,
      email,
      name,
      language: studentData?.language,
      level: studentData?.level,
      status: studentData?.status,
    });
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
})();
