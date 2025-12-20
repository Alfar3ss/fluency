"use client";
import { useState } from "react";
import Link from "next/link";

export default function ForgetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    // TODO: Replace with real password reset logic (e.g., Supabase)
    setTimeout(() => {
      setLoading(false);
      if (email) {
        setSuccess(true);
      } else {
        setError("Please enter your email address.");
      }
    }, 1000);
  };

  return (
    <main className="bg-[#f3f6f8] min-h-screen flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
        <h1 className="text-3xl font-extrabold text-[#127db2] mb-2 text-center">Forgot your password?</h1>
        <p className="text-[#f1753d] font-medium mb-6 text-center">We'll send you a link to reset it.</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-1 font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#127db2] focus:ring-2 focus:ring-[#127db2]/20 outline-none transition text-gray-900 font-bold"
              placeholder="you@email.com"
              required
            />
          </div>
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          {success && <div className="text-green-600 text-sm text-center">Check your email for a reset link.</div>}
          <button
            type="submit"
            className="w-full py-3 rounded-xl font-semibold bg-[#127db2] text-white shadow hover:scale-[1.03] transition disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
        <div className="mt-6 text-center text-gray-500 text-sm">
          Remembered your password?{' '}
          <Link href="/auth/login" className="text-[#127db2] font-semibold hover:underline">Log in</Link>
        </div>
      </div>
    </main>
  );
}
