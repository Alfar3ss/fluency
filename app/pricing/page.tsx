import Link from "next/link";

const plans = [
  {
    name: "3 Months",
    price: "700MAD",
    subPrice: "233 MAD/month",
    features: [
      "8 one-on-one lessons/month",
      "Unlimited free speaking classes",
      "1 quarterly assessment",
      "Progress tracking dashboard",
      "Email support",
      "Priority scheduling",
      "Certificate of completion",
    ],
    cta: "Get Started",
    highlight: false,
  },
  {
    name: "6 Months",
    price: "1200MAD",
    subPrice: "200 MAD/month",
    features: [
      "10 one-on-one lessons/month",
      "Unlimited free speaking classes",
      "2 quarterly assessments",
      "Progress tracking dashboard",
      "Priority email support",
      "Priority scheduling",
      "Certificate of completion",
    ],
    cta: "Get Started",
    highlight: true,
  },
  {
    name: "9 Months",
    price: "1700MAD",
    subPrice: "189 MAD/month",
    features: [
      "12 one-on-one lessons/month",
      "Unlimited free speaking classes",
      "3 quarterly assessments",
      "Progress tracking dashboard",
      "24/7 priority support",
      "Priority scheduling",
      "Certificate of completion",
    ],
    cta: "Get Started",
    highlight: false,
  },
];

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
    <main className="bg-[#f3f6f8] min-h-screen text-gray-900">
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-3 text-[#127db2]">Transparent Pricing</h1>
          <h2 className="text-2xl font-semibold mb-4 text-[#f1753d]">Simple Pricing for Your Goals</h2>
          <p className="text-lg text-gray-600">Choose the plan that matches your learning pace. All plans include access to native teachers and free conversation practice.</p>
        </div>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, idx) => (
            <div
              key={plan.name}
              className={`flex flex-col rounded-3xl border shadow-lg p-8 bg-white relative transition-transform hover:scale-[1.03] ${
                plan.highlight ? "border-[#127db2] shadow-2xl z-10 scale-105" : "border-gray-200"
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#127db2] text-white text-xs font-bold px-4 py-1 rounded-full shadow">Most Popular</span>
              )}
              <h2 className="text-xl font-bold mb-2 text-[#127db2]">{plan.name}</h2>
              <div className="flex flex-col items-center mb-2">
                <span className="text-3xl font-extrabold text-[#f1753d]">{plan.price}</span>
                <span className="text-gray-500 text-sm">{plan.subPrice}</span>
              </div>
              <ul className="mb-8 mt-4 space-y-3 text-left">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#127db2"/><path d="M7 13l3 3 7-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/register"
                className={`block w-full text-center px-6 py-3 rounded-xl font-semibold shadow transition bg-[#127db2] text-white hover:scale-105`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
        <div className="max-w-2xl mx-auto text-center mt-14">
          <div className="inline-flex items-center gap-2 bg-white rounded-full px-6 py-3 shadow text-[#127db2] font-semibold text-lg">
            <span role="img" aria-label="guarantee">💯</span> 7-Day Money-Back Guarantee
          </div>
          <p className="mt-4 text-gray-500 text-sm">Not satisfied? Get a full refund within 7 days of your purchase.</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <h3 className="text-2xl font-bold mb-8 text-[#127db2] text-center">Frequently Asked Questions</h3>
        <div className="space-y-6">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white rounded-2xl shadow p-6">
              <h4 className="font-semibold text-[#f1753d] mb-2">{faq.q}</h4>
              <p className="text-gray-700">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
