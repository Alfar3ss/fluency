
"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const skillLevels = ["Beginner", "Intermediate", "Advanced"];
const languages = ["English", "French", "Spanish", "German", "Arabic", "Italian", "Other"];

function validatePassword(pw: string) {
  return pw.length >= 8 && /[0-9!@#$%^&*]/.test(pw);
}

export default function RegisterPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    nativeLanguage: "",
    targetLanguages: [] as string[],
    targetLanguageProficiencies: {} as {[key: string]: string},
    skillLevel: "",
    learningGoals: "",
    timezone: "",
    phone: "",
    marketing: false,
    profilePhoto: null as File | null,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Inline validation
  const [touched, setTouched] = useState<{[k:string]:boolean}>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked, files } = e.target as any;
    if (type === "checkbox") {
      setForm((f) => ({ ...f, [name]: checked }));
    } else if (type === "file") {
      setForm((f) => ({ ...f, profilePhoto: files[0] }));
    } else if (name === "targetLanguages") {
      const arr = Array.from((e.target as HTMLSelectElement).selectedOptions).map((o) => o.value);
      setForm((f) => ({ ...f, targetLanguages: arr }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setTouched((t) => ({ ...t, [e.target.name]: true }));
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setTouched({ name: true, email: true, password: true, confirmPassword: true });
  setLoading(true);
  setError("");
  setSuccess(false);

  // basic client-side checks
  if (!form.name || !form.email || !validatePassword(form.password) || form.password !== form.confirmPassword) {
    setLoading(false);
    setError("Please fill in all required fields correctly.");
    return;
  }

  try {
    // 1) sign up via Supabase Auth (email/password)
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth/login` : undefined,
      },
    });
    if (signUpError) throw signUpError;

    const user = signUpData.user;
    if (!user) throw new Error("Sign up succeeded but no user returned.");

    // 2) optional: upload avatar to a storage bucket if selected
    let avatarUrl: string | null = null;
    if (form.profilePhoto) {
      const fileExt = form.profilePhoto.name.split(".").pop();
      const filePath = `avatars/${user.id}.${fileExt}`;
      const { error: uploadErr } = await supabase.storage
        .from("avatars")
        .upload(filePath, form.profilePhoto, { upsert: true });
      if (uploadErr) {
        // do not block registration if avatar upload fails
        console.warn("Avatar upload failed:", uploadErr.message);
      } else {
        const { data: pubUrl } = supabase.storage.from("avatars").getPublicUrl(filePath);
        avatarUrl = pubUrl?.publicUrl ?? null;
      }
    }

    // 3) insert profile row
    const profileRow = {
      user_id: user.id,
      full_name: form.name,
      email: form.email,
      native_language: form.nativeLanguage || null,
      target_languages: form.targetLanguages.filter(Boolean),
      skill_level: form.skillLevel || null,
      learning_goals: form.learningGoals || null,
      timezone: form.timezone || null,
      phone: form.phone || null,
      avatar_url: avatarUrl,
    };

    console.log("Inserting student profile:", profileRow);
    const { error: profileErr } = await supabase.from("student_users").insert(profileRow);
    if (profileErr) {
      console.error("Student profile insert error:", profileErr);
      throw new Error(`Database error: ${profileErr.message} (${profileErr.code})`);
    }

    // 4) success UI message; email verification may be required by your Supabase settings
    setSuccess(true);
  } catch (err: any) {
    console.error("Registration error:", err);
    setError(err?.message || "Registration failed. Please try again.");
  } finally {
    setLoading(false);
  }
};

  // Password validation
  const passwordError =
    touched.password && !validatePassword(form.password)
      ? "Password must be 8+ chars, include a number or symbol."
      : "";
  const confirmError =
    touched.confirmPassword && form.password !== form.confirmPassword
      ? "Passwords do not match."
      : "";

  return (
    <main className="bg-[#f3f6f8] min-h-screen flex items-center justify-center py-10 px-2">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl p-8">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-extrabold text-[#127db2] mb-1">Create your account</h1>
          <p className="text-[#f1753d] font-medium mb-2">You’re 1 step away from speaking your first sentence!</p>
          <p className="text-gray-600 text-sm">Start your journey to fluency today.</p>
        </div>
        <div className="flex flex-col gap-3 mb-6">
          <button className="w-full py-2 rounded-xl font-semibold bg-[#f1753d] text-white flex items-center justify-center gap-2 hover:opacity-90 transition">
            <svg width="20" height="20" viewBox="0 0 48 48"><g><circle fill="#fff" cx="24" cy="24" r="24"/><path fill="#4285F4" d="M34.6 24.2c0-.7-.1-1.4-.2-2H24v4.1h6c-.3 1.5-1.3 2.7-2.7 3.5v2.9h4.4c2.6-2.4 4.1-5.9 4.1-10.5z"/><path fill="#34A853" d="M24 36c3.6 0 6.6-1.2 8.8-3.2l-4.4-2.9c-1.2.8-2.7 1.3-4.4 1.3-3.4 0-6.2-2.3-7.2-5.3h-4.5v3.3C15.5 33.8 19.4 36 24 36z"/><path fill="#FBBC05" d="M16.8 25.9c-.2-.6-.3-1.3-.3-1.9s.1-1.3.3-1.9v-3.3h-4.5C11.5 20.2 11 22 11 24s.5 3.8 1.3 5.3l4.5-3.4z"/><path fill="#EA4335" d="M24 18.7c1.9 0 3.6.6 4.9 1.7l3.7-3.7C30.6 14.7 27.6 13.5 24 13.5c-4.6 0-8.5 2.2-10.5 5.5l4.5 3.4c1-3 3.8-5.3 7.2-5.3z"/></g></svg>
            Sign up with Google
          </button>
          <button className="w-full py-2 rounded-xl font-semibold bg-[#127db2] text-white flex items-center justify-center gap-2 hover:opacity-90 transition">
            <svg width="20" height="20" viewBox="0 0 48 48"><g><circle fill="#fff" cx="24" cy="24" r="24"/><path fill="#1877F2" d="M34.5 24H27v-4.5c0-.8.7-1.5 1.5-1.5h3V13h-4.5C24.7 13 24 13.7 24 14.5V24h-3v4h3v10h5v-10h3.2l.3-4z"/></g></svg>
            Sign up with Facebook
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-7">
          {/* Basic Info */}
          <div>
            <h2 className="text-lg font-bold text-[#127db2] mb-2">Basic Info</h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-1 font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#127db2] focus:ring-2 focus:ring-[#127db2]/20 outline-none transition text-gray-900 font-bold"
                  placeholder="Your name"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#127db2] focus:ring-2 focus:ring-[#127db2]/20 outline-none transition text-gray-900 font-bold"
                  placeholder="you@email.com"
                  required
                />
              </div>
              <div className="relative">
                <label className="block mb-1 font-medium text-gray-700">Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-3 rounded-xl border ${passwordError ? "border-red-400" : "border-gray-200"} focus:border-[#127db2] focus:ring-2 focus:ring-[#127db2]/20 outline-none transition text-gray-900 font-bold`}
                  placeholder="Create a password"
                  required
                  minLength={8}
                />
                <button type="button" className="absolute right-3 top-9 text-sm text-[#127db2]" tabIndex={-1} onClick={() => setShowPassword((v) => !v)}>{showPassword ? "Hide" : "Show"}</button>
                {passwordError && <div className="text-red-500 text-xs mt-1">{passwordError}</div>}
              </div>
              <div className="relative">
                <label className="block mb-1 font-medium text-gray-700">Confirm Password</label>
                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-3 rounded-xl text-gray-900 font-bold border ${confirmError ? "border-red-400" : "border-gray-200"} focus:border-[#127db2] focus:ring-2 focus:ring-[#127db2]/20 outline-none transition`}
                  placeholder="Re-enter your password"
                  required
                  minLength={8}
                />
                <button type="button" className="absolute right-3 top-9 text-sm text-[#127db2]" tabIndex={-1} onClick={() => setShowConfirm((v) => !v)}>{showConfirm ? "Hide" : "Show"}</button>
                {confirmError && <div className="text-red-500 text-xs mt-1">{confirmError}</div>}
              </div>
            </div>
          </div>

          {/* Learning Preferences */}
          <div>
            <h2 className="text-lg font-bold text-[#127db2] mb-2">Learning Preferences</h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-1 font-medium text-gray-700">Native Language</label>
                <select
                  name="nativeLanguage"
                  value={form.nativeLanguage}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full px-4 py-3 text-gray-900 rounded-xl border border-gray-200 focus:border-[#127db2] focus:ring-2 focus:ring-[#127db2]/20 outline-none transition"
                  required
                >
                  <option value="">Select your native language</option>
                  {languages.map((lang) => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">Target Language</label>
                <select
                  name="targetLanguageMain"
                  value={form.targetLanguages[0] || ""}
                  onChange={e => {
                    const val = e.target.value;
                    setForm(f => ({ ...f, targetLanguages: [val, f.targetLanguages[1] || ""] }));
                  }}
                  onBlur={handleBlur}
                  className="w-full px-4 py-3 text-gray-900 rounded-xl border border-gray-200 focus:border-[#127db2] focus:ring-2 focus:ring-[#127db2]/20 outline-none transition"
                  required
                >
                  <option value="">Select your main target language</option>
                  {languages.map((lang) => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">Secondary Target Language <span className="text-xs text-gray-400">(optional)</span></label>
                <select
                  name="targetLanguageSecondary"
                  value={form.targetLanguages[1] || ""}
                  onChange={e => {
                    const val = e.target.value;
                    setForm(f => ({ ...f, targetLanguages: [f.targetLanguages[0] || "", val] }));
                  }}
                  onBlur={handleBlur}
                  className="w-full px-4 py-3 text-gray-900 rounded-xl border border-gray-200 focus:border-[#127db2] focus:ring-2 focus:ring-[#127db2]/20 outline-none transition"
                >
                  <option value="">None</option>
                  {languages.map((lang) => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">Skill Level</label>
                <select
                  name="skillLevel"
                  value={form.skillLevel}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#127db2] focus:ring-2 focus:ring-[#127db2]/20 outline-none transition"
                  required
                >
                  <option value="">Select your level</option>
                  {skillLevels.map((level) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">Learning Goals <span className="text-xs text-gray-400">(optional)</span></label>
                <input
                  type="text"
                  name="learningGoals"
                  value={form.learningGoals}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full px-4 py-3 text-gray-900 rounded-xl border border-gray-200 focus:border-[#127db2] focus:ring-2 focus:ring-[#127db2]/20 outline-none transition"
                  placeholder="e.g. Travel, Business, Fluency"
                />
              </div>
            </div>
          </div>

          {/* Optional Fields */}
          <div>
            <h2 className="text-lg font-bold text-[#127db2] mb-2">Optional</h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-1 font-medium text-gray-700">Profile Photo <span className="text-xs text-gray-400">(optional)</span></label>
                <input
                  type="file"
                  name="profilePhoto"
                  accept="image/*"
                  onChange={handleChange}
                  className="w-full px-4 py-2  text-gray-900 rounded-xl border border-gray-200 focus:border-[#127db2] focus:ring-2 focus:ring-[#127db2]/20 outline-none transition bg-white"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">Timezone <span className="text-xs text-gray-400">(optional)</span></label>
                <input
                  type="text"
                  name="timezone"
                  value={form.timezone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full px-4 py-3 text-gray-900 rounded-xl border border-gray-200 focus:border-[#127db2] focus:ring-2 focus:ring-[#127db2]/20 outline-none transition"
                  placeholder="e.g. GMT+1, UTC, EST"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">Phone Number <span className="text-xs text-gray-400">(optional)</span></label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full px-4 py-3 text-gray-900 rounded-xl border border-gray-200 focus:border-[#127db2] focus:ring-2 focus:ring-[#127db2]/20 outline-none transition"
                  placeholder="e.g. +212 6 12 34 56 78"
                />
              </div>
            </div>
          </div>

          {/* Legal & Submit */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="marketing"
                checked={form.marketing}
                onChange={handleChange}
                className="rounded border-gray-300 text-[#127db2] focus:ring-[#127db2]"
              />
              <label className="text-sm text-gray-600">I want to receive updates and offers (optional)</label>
            </div>
            <div className="text-xs text-gray-500">
              By signing up, you agree to our{' '}
              <Link href="/terms" className="text-[#127db2] underline">Terms & Conditions</Link> and{' '}
              <Link href="/privacy" className="text-[#127db2] underline">Privacy Policy</Link>.
            </div>
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            {success && <div className="text-green-600 text-sm text-center">Account created! Check your email to verify.</div>}
            <button
              type="submit"
              className="w-full py-3 rounded-xl font-semibold bg-[#127db2] text-white shadow hover:scale-[1.03] transition disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </div>
        </form>
        <div className="mt-6 text-center text-gray-500 text-sm">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-[#127db2] font-semibold hover:underline">Log in</Link>
        </div>
      </div>
    </main>
  );
}
