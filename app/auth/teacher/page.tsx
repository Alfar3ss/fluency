"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

export default function TeacherLoginPage() {
  const router = useRouter();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    if (!form.email || !form.password) {
      setError("Please enter your email and password.");
      setLoading(false);
      return;
    }

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (signInError) throw signInError;

      if (data.user) {
        // Debug: confirm signed-in user
        console.log("auth user", { id: data.user.id, email: data.user.email });

        // Verify teacher via server route using service role (bypasses RLS issues)
        const resp = await fetch("/api/teacher/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: data.user.id }),
        });
        const verify = await resp.json();
        console.log("teacher verify", { status: resp.status, verify });

        if (!resp.ok || !verify?.exists) {
          await supabase.auth.signOut();
          throw new Error("No teacher account found. Please use the student login or contact admin.");
        }

        setSuccess(true);
        setTimeout(() => {
          router.push("/Dashboard/teachers");
        }, 1000);
      }
    } catch (err: any) {
      console.error("Teacher login error:", err);
      setError(err?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-[#f3f6f8] min-h-screen flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
        <div className="mb-6 text-center">
          <div className="inline-block p-3 bg-[#f1753d]/10 rounded-full mb-3">
            <svg className="w-8 h-8 text-[#f1753d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-[#127db2] mb-2">Teacher Login</h1>
          <p className="text-[#f1753d] font-medium">Access your teaching dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-1 font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#f1753d] focus:ring-2 focus:ring-[#f1753d]/20 outline-none transition text-gray-900 font-bold"
              placeholder="teacher@email.com"
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
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#f1753d] focus:ring-2 focus:ring-[#f1753d]/20 outline-none transition text-gray-900 font-bold"
              placeholder="Your password"
              required
              minLength={8}
            />
            <button 
              type="button" 
              className="absolute right-3 top-9 text-sm text-[#f1753d]" 
              tabIndex={-1} 
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          {success && <div className="text-green-600 text-sm text-center">Login successful! Redirecting...</div>}
          <button
            type="submit"
            className="w-full py-3 rounded-xl font-semibold bg-[#127db2] text-white shadow hover:scale-[1.03] transition disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Log In as Teacher"}
          </button>
        </form>

        <div className="mt-6 text-center text-gray-500 text-sm">
          Are you a student?{' '}
          <Link href="/auth/login" className="text-[#127db2] font-semibold hover:underline">Student Login</Link>
        </div>
        <div className="mt-2 text-center">
          <Link href="/auth/forgot" className="text-xs text-[#f1753d] hover:underline">Forgot your password?</Link>
        </div>
      </div>
    </main>
  );
}
