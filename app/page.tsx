import Link from "next/link"

// Dummy avatars for ratings
const avatars = [
  "https://randomuser.me/api/portraits/men/32.jpg",
  "https://randomuser.me/api/portraits/women/44.jpg",
  "https://randomuser.me/api/portraits/men/45.jpg",
  "https://randomuser.me/api/portraits/women/46.jpg",
];

const features = [
  {
    icon: "video",
    title: "Live 1-on-1 Sessions",
    desc: "Real conversations with certified native speakers tailored to your level.",
  },
  {
    icon: "chat",
    title: "Group Conversations",
    desc: "Join free community sessions to practice with learners worldwide.",
  },
  {
    icon: "assessment",
    title: "Progress Tracking",
    desc: "Track your improvement with structured assessments and detailed feedback.",
  },
  {
    icon: "teacher",
    title: "Expert Teachers",
    desc: "Learn from verified native speakers with proven teaching experience.",
  },
];

export default function Home() {
  return (
    <main className="bg-white text-gray-900">
      {/* HERO */}
      <section className="relative overflow-hidden">
  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-indigo-500/10 to-orange-400/10" />

  <div className="relative max-w-7xl mx-auto px-6 py-28 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
    {/* Left */}
    <div>
      <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-600 mb-6">
        ● Trusted by 10,000+ learners
      </span>

      <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
        Speak languages
        <br />
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
          with confidence
        </span>
      </h1>

      <p className="mt-6 text-lg text-gray-600 max-w-xl">
        Learn through real conversations with certified native speakers.
        Structured lessons, real progress, and measurable fluency.
      </p>

      <div className="mt-10 flex gap-4">
        <Link
          href="/auth/register"
          className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg hover:scale-[1.02] transition"
        >
          Start learning
        </Link>

        <Link
          href="/test"
          className="px-8 py-4 rounded-xl border border-gray-300 font-medium hover:bg-gray-50 transition"
        >
          Placement test
        </Link>
      </div>

      {/* Rating */}
      <div className="mt-10 flex items-center gap-4">
        <div className="flex -space-x-2">
          {avatars.map((src, i) => (
            <img
              key={i}
              src={src}
              className="w-9 h-9 rounded-full border-2 border-white"
            />
          ))}
        </div>
        <div>
          <div className="text-orange-400">★★★★★</div>
          <p className="text-sm text-gray-500">4.9/5 from real students</p>
        </div>
      </div>
    </div>

    {/* Right */}
    <div className="relative">
      <div className="rounded-3xl overflow-hidden shadow-2xl">
        <img
          src="hero.jpg?auto=format&fit=crop&w=900&q=80"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  </div>
</section>


      {/* TRUST BAR */}
      <section className="bg-gray-50 border-t border-b">
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 text-center gap-8">
          <Stat title="10,000+" subtitle="Active Learners" />
          <Stat title="500+" subtitle="Native Teachers" />
          <Stat title="15+" subtitle="Languages" />
          <Stat title="95%" subtitle="Success Rate" />
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-7xl mx-auto px-6 py-28">
  <h2 className="text-4xl font-bold text-center">
    Built for real <span className="text-blue-600">fluency</span>
  </h2>

  <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-8">
    {features.map((f, i) => (
      <div
        key={i}
        className="p-8 rounded-3xl bg-white/70 backdrop-blur shadow-lg hover:shadow-xl transition"
      >
        <div className="mb-6">{f.icon}</div>
        <h3 className="text-xl font-semibold">{f.title}</h3>
        <p className="mt-3 text-gray-600">{f.desc}</p>
      </div>
    ))}
  </div>
</section>

      {/* STEPS */}
      <section className="bg-gray-50 py-24">
        <h2 className="text-4xl font-bold text-center mb-12">
          Your Path to <span className="text-orange-500">Fluency</span>
        </h2>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-6 text-center">
          {[
            { step: "01", title: "Register", desc: "Create your free account in seconds" },
            { step: "02", title: "Take Test", desc: "Complete our placement assessment" },
            { step: "03", title: "Start Learning", desc: "Begin classes with native teachers" },
            { step: "04", title: "Practice", desc: "Join free conversation sessions" },
            { step: "05", title: "Advance", desc: "Pass assessments to level up" },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-8 shadow-sm border">
              <div className="text-3xl font-bold text-orange-300 mb-2">{s.step}</div>
              <div className="font-bold text-lg mb-1">{s.title}</div>
              <div className="text-gray-500 text-sm">{s.desc}</div>
              {i < 4 && <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 text-orange-200 text-3xl">→</div>}
            </div>
          ))}
        </div>
      </section>
      {/* PRICING */}
      <section className="max-w-5xl mx-auto my-24">
        <div className="text-center mb-4">
          <span className="inline-block px-4 py-1 rounded-full bg-blue-50 text-blue-600 font-semibold text-xs mb-4">Simple Pricing</span>
          <h2 className="text-4xl font-bold mb-2">Invest in Your <span className="text-blue-600">Future</span></h2>
          <p className="text-gray-500 mb-8">Choose the plan that fits your learning goals</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 3 Months Card */}
          <div className="rounded-3xl bg-white shadow-xl p-10 flex flex-col items-center border border-gray-200">
            <h3 className="text-2xl font-bold mb-2">3 Months</h3>
            <div className="text-5xl font-extrabold mb-2 text-gray-800">700 <span className="text-lg font-medium">MAD</span></div>
            <div className="text-gray-500 mb-6">233 MAD/month</div>
            <ul className="mb-8 space-y-2 text-left w-full">
              <li className="flex items-center gap-2 text-gray-700"><span className="text-green-500">✔</span> 1-on-1 lessons with native teachers</li>
              <li className="flex items-center gap-2 text-gray-700"><span className="text-green-500">✔</span> Free communication classes</li>
              <li className="flex items-center gap-2 text-gray-700"><span className="text-green-500">✔</span> Quarterly level assessments</li>
              <li className="flex items-center gap-2 text-gray-700"><span className="text-green-500">✔</span> Progress tracking dashboard</li>
              <li className="flex items-center gap-2 text-gray-700"><span className="text-green-500">✔</span> 24/7 support</li>
            </ul>
            <button className="w-full py-3 rounded-xl border-2 border-blue-600 text-blue-600 font-semibold hover:bg-blue-50 transition">Get Started</button>
          </div>
          {/* 6 Months Card */}
          <div className="rounded-3xl bg-white shadow-xl p-10 flex flex-col items-center border-2 border-orange-400 relative scale-105 z-10">
            <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-100 text-orange-500 px-4 py-1 rounded-full text-xs font-semibold shadow">Most Popular</span>
            <h3 className="text-2xl font-bold mb-2">6 Months</h3>
            <div className="text-5xl font-extrabold mb-2 text-gray-800">1200 <span className="text-lg font-medium">MAD</span></div>
            <div className="text-gray-500 mb-6">200 MAD/month</div>
            <ul className="mb-8 space-y-2 text-left w-full">
              <li className="flex items-center gap-2 text-gray-700"><span className="text-green-500">✔</span> 1-on-1 lessons with native teachers</li>
              <li className="flex items-center gap-2 text-gray-700"><span className="text-green-500">✔</span> Free communication classes</li>
              <li className="flex items-center gap-2 text-gray-700"><span className="text-green-500">✔</span> Quarterly level assessments</li>
              <li className="flex items-center gap-2 text-gray-700"><span className="text-green-500">✔</span> Progress tracking dashboard</li>
              <li className="flex items-center gap-2 text-gray-700"><span className="text-green-500">✔</span> 24/7 support</li>
            </ul>
            <button className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-400 to-orange-500 text-white font-semibold shadow hover:scale-[1.03] transition">Get Started</button>
          </div>
          {/* 9 Months Card */}
          <div className="rounded-3xl bg-white shadow-xl p-10 flex flex-col items-center border border-gray-200">
            <h3 className="text-2xl font-bold mb-2">9 Months</h3>
            <div className="text-5xl font-extrabold mb-2 text-gray-800">1700 <span className="text-lg font-medium">MAD</span></div>
            <div className="text-gray-500 mb-6">189 MAD/month</div>
            <ul className="mb-8 space-y-2 text-left w-full">
              <li className="flex items-center gap-2 text-gray-700"><span className="text-green-500">✔</span> 1-on-1 lessons with native teachers</li>
              <li className="flex items-center gap-2 text-gray-700"><span className="text-green-500">✔</span> Free communication classes</li>
              <li className="flex items-center gap-2 text-gray-700"><span className="text-green-500">✔</span> Quarterly level assessments</li>
              <li className="flex items-center gap-2 text-gray-700"><span className="text-green-500">✔</span> Progress tracking dashboard</li>
              <li className="flex items-center gap-2 text-gray-700"><span className="text-green-500">✔</span> 24/7 support</li>
            </ul>
            <button className="w-full py-3 rounded-xl border-2 border-blue-600 text-blue-600 font-semibold hover:bg-blue-50 transition">Get Started</button>
          </div>
        </div>
        <div className="text-center mt-8">
          <Link href="/pricing" className="text-blue-600 font-semibold hover:underline inline-flex items-center gap-1">
            View Full Pricing Details <span>→</span>
          </Link>
        </div>
      </section>
      




      {/* TESTIMONIALS */}
      <section className="bg-gray-50 py-24">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1 rounded-full bg-orange-100 text-orange-500 font-semibold text-xs mb-4">Testimonials</span>
          <h2 className="text-4xl font-bold mb-2">Loved by <span className="text-orange-500">Thousands</span></h2>
          <p className="text-gray-500">See what our learners say about their Fluency experience</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Card 1 */}
          <div className="bg-white rounded-3xl shadow-xl p-8 flex flex-col h-full">
            <div className="flex items-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-orange-400 text-xl">★</span>
              ))}
            </div>
            <p className="text-gray-800 text-lg mb-6">"Fluency transformed my French learning. The native teachers are amazing!"</p>
            <div className="flex items-center gap-3 mt-auto">
              <img src="https://randomuser.me/api/portraits/women/68.jpg" alt="Sarah M." className="w-12 h-12 rounded-full object-cover" />
              <div>
                <p className="font-bold text-gray-900">Sarah M.</p>
                <p className="text-sm text-gray-500">Learning French</p>
              </div>
            </div>
          </div>
          {/* Card 2 */}
          <div className="bg-white rounded-3xl shadow-xl p-8 flex flex-col h-full">
            <div className="flex items-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-orange-400 text-xl">★</span>
              ))}
            </div>
            <p className="text-gray-800 text-lg mb-6">"The free speaking classes helped me gain confidence in English conversations."</p>
            <div className="flex items-center gap-3 mt-auto">
              <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Ahmed K." className="w-12 h-12 rounded-full object-cover" />
              <div>
                <p className="font-bold text-gray-900">Ahmed K.</p>
                <p className="text-sm text-gray-500">Learning English</p>
              </div>
            </div>
          </div>
          {/* Card 3 */}
          <div className="bg-white rounded-3xl shadow-xl p-8 flex flex-col h-full">
            <div className="flex items-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-orange-400 text-xl">★</span>
              ))}
            </div>
            <p className="text-gray-800 text-lg mb-6">"I went from A1 to B2 in just 9 months. The assessment system keeps me motivated!"</p>
            <div className="flex items-center gap-3 mt-auto">
              <img src="https://randomuser.me/api/portraits/women/65.jpg" alt="Maria L." className="w-12 h-12 rounded-full object-cover" />
              <div>
                <p className="font-bold text-gray-900">Maria L.</p>
                <p className="text-sm text-gray-500">Learning Spanish</p>
              </div>
            </div>
          </div>
        </div>
      </section>
            {/* CTA */}
      <section className="bg-indigo-600">
        <div className="max-w-7xl mx-auto px-6 py-20 text-center text-white">
          <h2 className="text-4xl font-bold">
            Start speaking today
          </h2>
          <p className="mt-4 text-lg opacity-90">
            Join Fluency and experience language learning the way it should be.
          </p>

          <Link
            href="/auth/register"
            className="inline-block mt-8 px-10 py-4 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-gray-100 transition"
          >
            Create your free account
          </Link>
        </div>
      </section>

    </main>
  )
}

/* ---------------- COMPONENTS ---------------- */

function Stat({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <p className="text-3xl font-bold">{title}</p>
      <p className="text-gray-600 mt-1">{subtitle}</p>
    </div>
  )
}

// Feature component with icon
function Feature({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="p-8 rounded-2xl border hover:shadow-lg transition flex flex-col items-center text-center">
      <div className="mb-4">
        {icon === "video" && (
          <span className="inline-block bg-blue-100 text-blue-500 p-3 rounded-full">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><rect x="3" y="7" width="15" height="10" rx="2" stroke="#3b82f6" strokeWidth="2"/><path d="M21 9v6" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/></svg>
          </span>
        )}
        {icon === "chat" && (
          <span className="inline-block bg-blue-100 text-blue-500 p-3 rounded-full">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-1.9.73A8.5 8.5 0 1 1 12 3.5c1.61 0 3.13.46 4.4 1.26" stroke="#3b82f6" strokeWidth="2"/><path d="M22 4.5v6h-6" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/></svg>
          </span>
        )}
        {icon === "assessment" && (
          <span className="inline-block bg-blue-100 text-blue-500 p-3 rounded-full">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" stroke="#3b82f6" strokeWidth="2"/><path d="M8 17v-4m4 4V7m4 10v-2" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/></svg>
          </span>
        )}
        {icon === "teacher" && (
          <span className="inline-block bg-blue-100 text-blue-500 p-3 rounded-full">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="7" r="4" stroke="#3b82f6" strokeWidth="2"/><path d="M5.5 21a6.5 6.5 0 0 1 13 0" stroke="#3b82f6" strokeWidth="2"/></svg>
          </span>
        )}
      </div>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="mt-3 text-gray-600">{description}</p>
    </div>
  )
}

function Testimonial({ quote, name, language }: { quote: string; name: string; language: string }) {
  return (
    <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-50 via-white to-orange-50 border-0 shadow-lg flex flex-col items-center text-center transition-transform hover:scale-105">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="mb-4 text-blue-400"><circle cx="12" cy="12" r="12" fill="#e0e7ff"/><path d="M8.5 13c0-2.5 2-4.5 4.5-4.5S17.5 10.5 17.5 13c0 2.5-2 4.5-4.5 4.5S8.5 15.5 8.5 13Z" fill="#60a5fa"/><path d="M10 10h.01M14 10h.01" stroke="#2563eb" strokeWidth="2" strokeLinecap="round"/></svg>
      <p className="text-lg text-gray-800 mb-4 font-medium italic">“{quote}”</p>
      <div className="mt-4">
        <span className="font-bold text-blue-600">{name}</span>
        <span className="block text-sm text-orange-500 mt-1">Learning {language}</span>
      </div>
    </div>
  )
}
