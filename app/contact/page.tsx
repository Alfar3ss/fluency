"use client";
import { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    // TODO: Replace with real contact logic (e.g., email or API)
    setTimeout(() => {
      setLoading(false);
      if (form.name && form.email && form.message) {
        setSuccess(true);
        setForm({ name: "", email: "", subject: "", message: "" });
      } else {
        setError("Please fill in all fields.");
      }
    }, 1000);
  };

  return (
    <main className="bg-[#f3f6f8] min-h-screen py-12 px-2">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
        {/* Left: Form */}
        <div className="md:col-span-2 bg-white rounded-3xl shadow-xl p-8">
          <h1 className="text-3xl font-extrabold text-[#127db2] mb-2">Get in Touch</h1>
          <h2 className="text-xl font-semibold text-[#f1753d] mb-4">We'd Love to Hear From You</h2>
          <p className="text-gray-600 mb-8">Have questions about our platform? Need help getting started? Our team is here to help you on your language learning journey.</p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-1 font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#127db2] focus:ring-2 focus:ring-[#127db2]/20 outline-none transition text-gray-900"
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
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#127db2] focus:ring-2 focus:ring-[#127db2]/20 outline-none transition text-gray-900"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700">Subject</label>
              <input
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#127db2] focus:ring-2 focus:ring-[#127db2]/20 outline-none transition text-gray-900"
                placeholder="How can we help?"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700">Message</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#127db2] focus:ring-2 focus:ring-[#127db2]/20 outline-none transition text-gray-900 min-h-[120px] resize-vertical"
                placeholder="Tell us more about your inquiry..."
                required
              />
            </div>
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            {success && <div className="text-green-600 text-sm text-center">Thank you! We'll be in touch soon.</div>}
            <button
              type="submit"
              className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-[#127db2] to-[#0e5e8c] text-white shadow hover:scale-[1.03] transition disabled:opacity-60 flex items-center justify-center gap-2"
              disabled={loading}
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" className="mr-2"><path d="M2 21l21-9-9 21-2-8-8-2z" fill="#fff"/></svg>
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
        {/* Right: Info & Quick Answers */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-2xl shadow p-6 flex items-start gap-4">
            <div className="bg-[#127db2]/10 p-3 rounded-full">
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M21 6.5V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6.5M21 6.5l-9 6.5-9-6.5" stroke="#127db2" strokeWidth="2"/></svg>
            </div>
            <div>
              <div className="font-bold text-gray-900">Email Us</div>
              <div className="text-gray-500 text-sm mb-1">We'll respond within 24 hours</div>
              <a href="mailto:hello@fluency.center" className="text-[#127db2] font-semibold hover:underline">hello@fluency.center</a>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow p-6 flex items-start gap-4">
            <div className="bg-[#127db2]/10 p-3 rounded-full">
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.11-.21c1.21.49 2.53.76 3.88.76a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.07 21 3 13.93 3 5a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.35.27 2.67.76 3.88a1 1 0 0 1-.21 1.11l-2.2 2.2z" stroke="#127db2" strokeWidth="2"/></svg>
            </div>
            <div>
              <div className="font-bold text-gray-900">Call Us</div>
              <a href="tel:" className="text-[#127db2] font-semibold hover:underline">Namra</a>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow p-6 flex items-start gap-4">
            <div className="bg-[#127db2]/10 p-3 rounded-full">
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12c0 5.52 4.48 10 10 10s10-4.48 10-10c0-5.52-4.48-10-10-10zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" fill="#127db2"/></svg>
            </div>
            <div>
              <div className="font-bold text-gray-900">Visit Us</div>
              <div className="text-gray-500 text-sm mb-1">Come say hello</div>
              <a href="#" className="text-[#127db2] font-semibold hover:underline">Benimellal, Morocco</a>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow p-6">
            <div className="flex items-center gap-2 mb-3">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#f1753d"/><path d="M8 12h8M12 8v8" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
              <span className="font-bold text-[#f1753d]">Quick Answers</span>
            </div>
            <div className="mb-3">
              <div className="font-semibold text-gray-900">How do I book my first lesson?</div>
              <div className="text-gray-500 text-sm">After registering, take our placement test to determine your level. Then browse our teachers and book a lesson that fits your schedule.</div>
            </div>
            <div className="mb-3">
              <div className="font-semibold text-gray-900">Can I reschedule or cancel a lesson?</div>
              <div className="text-gray-500 text-sm">Yes, you can reschedule or cancel a lesson up to 24 hours before the scheduled time without any penalty.</div>
            </div>
            <div>
              <div className="font-semibold text-gray-900">Are the speaking classes really free?</div>
              <div className="text-gray-500 text-sm">Yes! All our subscription plans include unlimited access to group speaking practice sessions with native speakers.</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
