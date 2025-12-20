"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

export default function LoginPage() {
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
        setSuccess(true);
        // Redirect to dashboard or home after successful login
        setTimeout(() => {
          router.push("/Dashboard/students");
        }, 1000);
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-[#f3f6f8] min-h-screen flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
        <h1 className="text-3xl font-extrabold text-[#127db2] mb-2 text-center">Welcome back</h1>
        <p className="text-[#f1753d] font-medium mb-6 text-center">Log in to your account</p>
        <div className="flex flex-col gap-3 mb-6">
          <button className="w-full py-2 rounded-xl font-semibold bg-[#f1753d] text-white flex items-center justify-center gap-2 hover:opacity-90 transition">
            <svg width="20" height="20" viewBox="0 0 48 48"><g><circle fill="#fff" cx="24" cy="24" r="24"/><path fill="#4285F4" d="M34.6 24.2c0-.7-.1-1.4-.2-2H24v4.1h6c-.3 1.5-1.3 2.7-2.7 3.5v2.9h4.4c2.6-2.4 4.1-5.9 4.1-10.5z"/><path fill="#34A853" d="M24 36c3.6 0 6.6-1.2 8.8-3.2l-4.4-2.9c-1.2.8-2.7 1.3-4.4 1.3-3.4 0-6.2-2.3-7.2-5.3h-4.5v3.3C15.5 33.8 19.4 36 24 36z"/><path fill="#FBBC05" d="M16.8 25.9c-.2-.6-.3-1.3-.3-1.9s.1-1.3.3-1.9v-3.3h-4.5C11.5 20.2 11 22 11 24s.5 3.8 1.3 5.3l4.5-3.4z"/><path fill="#EA4335" d="M24 18.7c1.9 0 3.6.6 4.9 1.7l3.7-3.7C30.6 14.7 27.6 13.5 24 13.5c-4.6 0-8.5 2.2-10.5 5.5l4.5 3.4c1-3 3.8-5.3 7.2-5.3z"/></g></svg>
            Log in with Google
          </button>
          <button className="w-full py-2 rounded-xl font-semibold bg-[#127db2] text-white flex items-center justify-center gap-2 hover:opacity-90 transition">
            <svg width="20" height="20" viewBox="0 0 48 48"><g><circle fill="#fff" cx="24" cy="24" r="24"/><path fill="#1877F2" d="M34.5 24H27v-4.5c0-.8.7-1.5 1.5-1.5h3V13h-4.5C24.7 13 24 13.7 24 14.5V24h-3v4h3v10h5v-10h3.2l.3-4z"/></g></svg>
            Log in with Facebook
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-1 font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
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
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#127db2] focus:ring-2 focus:ring-[#127db2]/20 outline-none transition text-gray-900 font-bold"
              placeholder="Your password"
              required
              minLength={8}
            />
            <button type="button" className="absolute right-3 top-9 text-sm text-[#127db2]" tabIndex={-1} onClick={() => setShowPassword((v) => !v)}>{showPassword ? "Hide" : "Show"}</button>
          </div>
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          {success && <div className="text-green-600 text-sm text-center">Login successful! Redirecting...</div>}
          <button
            type="submit"
            className="w-full py-3 rounded-xl font-semibold bg-[#127db2] text-white shadow hover:scale-[1.03] transition disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>
        <div className="mt-6 text-center text-gray-500 text-sm">
          Don't have an account?{' '}
          <Link href="/auth/register" className="text-[#127db2] font-semibold hover:underline">Sign up</Link>
        </div>
        <div className="mt-2 text-center">
          <Link href="/auth/forgot" className="text-xs text-[#f1753d] hover:underline">Forgot your password?</Link>
        </div>
      </div>
    </main>
  );
}
