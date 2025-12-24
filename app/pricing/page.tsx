import Link from "next/link";

const faqs = [
  {
    q: "What's included in one-on-one lessons?",
    a: "Each lesson is a 45-minute session with a certified native teacher. Lessons are personalized to your level and learning goals.",
  },
  {
    q: "What are free speaking classes?",
    a: "Speaking classes are group sessions where you practice conversation with native speakers and other learners. Perfect for building confidence!",
  },
  {
    q: "How do quarterly assessments work?",
    a: "Every 3 months, you take a comprehensive test covering grammar, vocabulary, and speaking. Pass to advance to the next level!",
  },
  {
    q: "Can I change my plan later?",
    a: "Yes! You can upgrade your plan at any time. Contact support and we'll help you transition smoothly.",
  },
];

export default function PricingPage() {
  return (
    <main className="bg-white text-gray-900">
      <section className="max-w-5xl mx-auto px-6 py-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2">Invest in Your <span className="text-blue-600">Future</span></h1>
          <p className="text-gray-500 mb-8">Choose the plan that fits your learning goals</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 3 Months Card */}
          <div className="rounded-3xl bg-white shadow-xl p-10 flex flex-col items-center border border-gray-200">
            <h3 className="text-2xl font-bold mb-2">3 Months</h3>
            <div className="text-5xl font-extrabold mb-2 text-gray-800">700 <span className="text-lg font-medium">MAD</span></div>
            <ul className="mb-8 space-y-2 text-left w-full">
              <li className="flex items-center gap-2 text-gray-700"><span className="text-green-500">✔</span> 1-on-1 lessons with native teachers</li>
              <li className="flex items-center gap-2 text-gray-700"><span className="text-green-500">✔</span> Free communication classes</li>
              <li className="flex items-center gap-2 text-gray-700"><span className="text-green-500">✔</span> Quarterly level assessments</li>
              <li className="flex items-center gap-2 text-gray-700"><span className="text-green-500">✔</span> Progress tracking dashboard</li>
              <li className="flex items-center gap-2 text-gray-700"><span className="text-green-500">✔</span> 24/7 support</li>
            </ul>
            <Link href="/auth/register" className="w-full py-3 text-center rounded-xl border-2 border-blue-600 text-blue-600 font-semibold hover:bg-blue-50 transition">Get Started</Link>
          </div>
          {/* 6 Months Card */}
          <div className="rounded-3xl bg-white shadow-xl p-10 flex flex-col items-center border-2 border-orange-400 relative scale-105 z-10">
            <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-100 text-orange-500 px-4 py-1 rounded-full text-xs font-semibold shadow">Most Popular</span>
            <h3 className="text-2xl font-bold mb-2">6 Months</h3>
            <div className="text-5xl font-extrabold mb-2 text-gray-800">1200 <span className="text-lg font-medium">MAD</span></div>
            <ul className="mb-8 space-y-2 text-left w-full">
              <li className="flex items-center gap-2 text-gray-700"><span className="text-green-500">✔</span> 1-on-1 lessons with native teachers</li>
              <li className="flex items-center gap-2 text-gray-700"><span className="text-green-500">✔</span> Free communication classes</li>
              <li className="flex items-center gap-2 text-gray-700"><span className="text-green-500">✔</span> Quarterly level assessments</li>
              <li className="flex items-center gap-2 text-gray-700"><span className="text-green-500">✔</span> Progress tracking dashboard</li>
              <li className="flex items-center gap-2 text-gray-700"><span className="text-green-500">✔</span> 24/7 support</li>
            </ul>
            <Link href="/auth/register" className="w-full py-3 text-center rounded-xl bg-gradient-to-r from-orange-400 to-orange-500 text-white font-semibold shadow hover:scale-[1.03] transition">Get Started</Link>
          </div>
          {/* 9 Months Card */}
          <div className="rounded-3xl bg-white shadow-xl p-10 flex flex-col items-center border border-gray-200">
            <h3 className="text-2xl font-bold mb-2">9 Months</h3>
            <div className="text-5xl font-extrabold mb-2 text-gray-800">1700 <span className="text-lg font-medium">MAD</span></div>
            <ul className="mb-8 space-y-2 text-left w-full">
              <li className="flex items-center gap-2 text-gray-700"><span className="text-green-500">✔</span> 1-on-1 lessons with native teachers</li>
              <li className="flex items-center gap-2 text-gray-700"><span className="text-green-500">✔</span> Free communication classes</li>
              <li className="flex items-center gap-2 text-gray-700"><span className="text-green-500">✔</span> Quarterly level assessments</li>
              <li className="flex items-center gap-2 text-gray-700"><span className="text-green-500">✔</span> Progress tracking dashboard</li>
              <li className="flex items-center gap-2 text-gray-700"><span className="text-green-500">✔</span> 24/7 support</li>
            </ul>
            <Link href="/auth/register" className="w-full py-3 text-center rounded-xl border-2 border-blue-600 text-blue-600 font-semibold hover:bg-blue-50 transition">Get Started</Link>
          </div>
        </div>
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 bg-gray-50 rounded-full px-6 py-3 shadow-sm text-gray-800 font-semibold text-lg">
            <span role="img" aria-label="guarantee">💯</span> 7-Day Money-Back Guarantee
          </div>
          <p className="mt-4 text-gray-500 text-sm">Not satisfied? Get a full refund within 7 days of your purchase.</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <h3 className="text-3xl font-bold mb-8 text-gray-900 text-center">Frequently Asked Questions</h3>
        <div className="space-y-6">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white rounded-3xl shadow-xl p-6 border border-gray-200">
              <h4 className="font-bold text-gray-900 mb-2">{faq.q}</h4>
              <p className="text-gray-600">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
