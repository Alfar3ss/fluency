export default function AboutPage() {
  const offers = [
    "Live One-on-One Lessons tailored to your level and goals",
    "Group Conversation Classes that build confidence and communication skills",
    "Structured Learning Programs focused on real-life usage, not memorization",
    "Progress Tracking & Feedback to help you see continuous improvement",
  ];

  const whyChoose = [
    "Experienced Teachers who understand Moroccan learners",
    "Personalized Learning adapted to your goals and pace",
    "Supportive Learning Environment that encourages confidence",
    "Real Communication Skills you can use immediately",
  ];

  return (
    <main className="bg-white text-gray-900">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-indigo-500/10 to-orange-400/10" />
        <div className="relative max-w-5xl mx-auto px-6 py-20 text-center">
          <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
            Welcome to <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Fluency</span>
          </h1>
          <p className="mt-6 text-xl text-gray-700">
            At Fluency, we believe language is the key to opportunity, confidence, and connection — especially here in Morocco. Our mission is to help learners across Morocco develop real-world language skills through practical conversation and personalized learning.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-16 space-y-14">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-gray-900">Who We Are</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            Fluency is a Morocco-based language learning centre dedicated to helping students, professionals, and lifelong learners speak languages with confidence. We work with certified, experienced teachers who understand the needs, goals, and challenges of Moroccan learners.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            Whether you want to improve your language for school, university, work, travel, or personal growth, Fluency provides the guidance and support you need to succeed.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-gray-900">What We Offer</h2>
          <ul className="space-y-2 text-lg text-gray-700 list-disc list-inside">
            {offers.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
          <p className="text-lg text-gray-700 leading-relaxed">
            Our teaching approach combines clear structure, interactive lessons, and real conversation to help learners improve faster and speak naturally.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            Our mission is to empower learners in Morocco by making language learning effective, accessible, and practical. We focus on building confidence, fluency, and strong communication skills that can be used in everyday life.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-gray-900">Why Choose Fluency</h2>
          <ul className="space-y-2 text-lg text-gray-700 list-disc list-inside">
            {whyChoose.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="space-y-4 pb-6">
          <h2 className="text-3xl font-bold text-gray-900">Our Vision</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            We envision a Morocco where language is no longer a barrier to education, career growth, or global communication. At Fluency, we are committed to helping learners unlock their potential and communicate with confidence.
          </p>
        </div>
      </section>
    </main>
  );
}
