"use client";

import Link from "next/link";
import { useState } from "react";

const planSections = [
  {
    title: "",
    subtitle: "Group classes",
    languages: ["English", "Français", "Spanish", "Italian"],
    plans: [
      {
        name: "Standard",
        price: "700 MAD",
        cadence: "monthly",
        badge: "Starter",
        features: [
          "1 class per week with a native speaker",
          "Progress tracking dashboard",
          "24/7 support from our staff",
          "Free access to recorded classes",
          "Certificate at the end of each level",
        ],
      },
      {
        name: "Plus",
        price: "1200 MAD",
        cadence: "monthly",
        badge: "Most popular",
        features: [
          "2 classes per week with native speakers",
          "Progress tracking dashboard",
          "24/7 support from our staff",
          "Free access to recorded classes",
          "Certificate at the end of each level",
        ],
      },
      {
        name: "Premium",
        price: "1700 MAD",
        cadence: "monthly",
        badge: "Intensive",
        features: [
          "2 classes per week with native speakers",
          "Progress tracking dashboard",
          "24/7 support from our staff",
          "Free access to recorded classes",
          "Semester test and certificate delivery worldwide",
        ],
      },
    ],
  },
  {
    title: "1-to-1 Private Coaching",
    subtitle: "Private coaching",
    languages: ["English", "Français", "Spanish", "Italian"],
    plans: [
      {
        name: "One-to-One",
        price: "1500 MAD",
        cadence: "monthly",
        badge: "Personalized",
        features: [
          "Weekly native speaker 1:1 session",
          "Progress tracking dashboard",
          "24/7 support from our staff",
          "3 live classes per week with a teacher",
          "Free access to recorded classes",
          "Certificate at the end of each level",
        ],
      },
    ],
  },
  {
    title: "German Group Programs",
    subtitle: "Level-based",
    languages: ["German"],
    plans: [
      {
        name: "A1",
        price: "500 MAD",
        cadence: "monthly",
        badge: undefined,
        features: [
          "3 live classes per week (incl. 1 native-led)",
          "Progress tracking dashboard",
          "24/7 support from our staff",
          "Free access to recorded classes",
          "Certificate at the end of each level",
        ],
      },
      {
        name: "A2",
        price: "700 MAD",
        cadence: "monthly",
        badge: undefined,
        features: [
          "3 live classes per week (incl. 1 native-led)",
          "Progress tracking dashboard",
          "24/7 support from our staff",
          "Free access to recorded classes",
          "Certificate at the end of each level",
        ],
      },
      {
        name: "B1 / B2",
        price: "800 MAD",
        cadence: "monthly",
        badge: undefined,
        features: [
          "3 live classes per week (incl. 1 native-led)",
          "Progress tracking dashboard",
          "24/7 support from our staff",
          "Free access to recorded classes",
          "Certificate at the end of each level",
        ],
      },
    ],
  },
  {
    title: "1-to-1 German",
    subtitle: "Private coaching",
    languages: ["German"],
    plans: [
      {
        name: "A1",
        price: "1000 MAD",
        cadence: "monthly",
        badge: undefined,
        features: [
          "3 live classes per week (incl. 1 native-led)",
          "Progress tracking dashboard",
          "24/7 support from our staff",
          "Free access to recorded classes",
          "Certificate at the end of each level",
        ],
      },
      {
        name: "A2",
        price: "1500 MAD",
        cadence: "monthly",
        badge: undefined,
        features: [
          "3 live classes per week (incl. 1 native-led)",
          "Progress tracking dashboard",
          "24/7 support from our staff",
          "Free access to recorded classes",
          "Certificate at the end of each level",
        ],
      },
      {
        name: "B1 / B2",
        price: "2000 MAD",
        cadence: "monthly",
        badge: undefined,
        features: [
          "3 live classes per week (incl. 1 native-led)",
          "Progress tracking dashboard",
          "24/7 support from our staff",
          "Free access to recorded classes",
          "Certificate at the end of each level",
        ],
      },
    ],
  },
];

const highlights = [
  {
    title: "Weekly Native Speaker Class",
    copy: "Practice every week with a native speaker to improve your speaking and listening skills naturally and confidently.",
  },
  {
    title: "Personal Learning Dashboard",
    copy: "Track your progress daily with your own dashboard and clearly see how far you've come.",
  },
  {
    title: "Full Student Support",
    copy: "Our support team is always available. Ask us anything—we're here to help you succeed at every step.",
  },
  {
    title: "Live Classes Each Week",
    copy: "Attend multiple live classes every week, taught by experienced teachers on a high-quality learning platform.",
  },
  {
    title: "Recorded Classes – Free Access",
    copy: "All classes are recorded and available anytime. If you miss a class, watch it later and never fall behind.",
  },
  {
    title: "Semester Test & Certificate",
    copy: "Take an assessment at the end of each semester and receive an official certificate, delivered anywhere inside or outside Morocco.",
  },
];

const faqs = [
  {
    q: "How many live classes do I get per week?",
    a: "Group plans range from 1 to 3 live classes per week depending on the tier. One-to-one plans include a weekly native-led session plus teacher-led classes as listed on each card.",
  },
  {
    q: "Are classes recorded?",
    a: "Yes. Every session is recorded so you can rewatch anytime and never fall behind.",
  },
  {
    q: "Do I get a certificate?",
    a: "All plans include a semester test and an official certificate issued at the end of each level.",
  },
  {
    q: "Can I switch levels or languages?",
    a: "You can upgrade, switch levels, or change languages. Contact support and we'll adjust your plan smoothly.",
  },
];

export default function PricingPage() {
  const [infoOpen, setInfoOpen] = useState<string | null>(null);

  return (
    <main className="bg-white text-gray-900">
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3">
            Pick the language plan that matches your goals
          </h1>
          <p className="text-gray-600">
            Flexible group and one-to-one options for English, Français, Spanish, Italian, and German.
          </p>
        </div>

        <div className="space-y-14">
          {planSections.map((section) => (
            <div key={section.title} className="relative">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-10">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-100 bg-white text-sm font-semibold text-blue-700 shadow-sm">
                  {section.subtitle}
                </span>
              </div>

              <div className="relative rounded-3xl border border-gray-200 bg-white/80 backdrop-blur p-6 md:p-8">
                <div className="flex items-center justify-between flex-col md:flex-row gap-3 mb-6 mt-2">
                  <h2 className="text-2xl font-bold text-gray-900 text-center md:text-left">{section.title}</h2>
                  <div className="flex items-center gap-3 text-sm text-gray-600 bg-blue-50 border border-blue-100 px-4 py-2 rounded-full">
                    <span role="img" aria-label="support">24/7 support on every plan</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {section.plans.map((plan) => (
                  <div
                    key={plan.name + plan.price}
                    className={`relative rounded-3xl bg-white border border-gray-200 shadow-lg p-8 flex flex-col h-full transition duration-200 transform hover:-translate-y-3 hover:shadow-2xl hover:border-blue-200 ${
                      plan.badge === "Most popular" ? "md:scale-[1.05] border-orange-300" : ""
                    }`}
                  >
                    <button
                      aria-label="Show languages in this plan"
                      onClick={() => setInfoOpen(infoOpen === `${section.title}-${plan.name}` ? null : `${section.title}-${plan.name}`)}
                      className="absolute top-3 right-3 w-9 h-9 inline-flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-200 bg-white/90 backdrop-blur transition"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12.01" y2="8" />
                        <path d="M10 12h2v4" />
                      </svg>
                    </button>

                    {infoOpen === `${section.title}-${plan.name}` && (
                      <div className="absolute z-20 top-14 right-3 w-64 rounded-2xl border border-gray-200 bg-white shadow-lg p-4">
                        <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Languages included</p>
                        <div className="flex flex-wrap gap-2">
                          {section.languages.map((lang) => (
                            <span key={lang} className="px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700 border border-blue-100">
                              {lang}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {plan.badge && (
                      <span className={`absolute -top-3 left-4 px-3 py-1 rounded-full text-xs font-semibold shadow ${
                        plan.badge === "Most popular"
                          ? "bg-orange-100 text-orange-600"
                          : "bg-blue-100 text-blue-700"
                      }`}>
                        {plan.badge}
                      </span>
                    )}

                    <div className="mb-6">
                      <p className="text-sm text-gray-500">{plan.cadence}</p>
                      <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                      <div className="text-4xl font-extrabold text-gray-900 mt-2">{plan.price}</div>
                    </div>

                    <ul className="space-y-3 mb-8 text-gray-700">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">✔</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Link
                      href="/auth/register"
                      className={`mt-auto w-full text-center px-6 py-3 rounded-xl font-semibold transition ${
                        plan.badge === "Most popular"
                          ? "bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow hover:scale-[1.02]"
                          : "border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
                      }`}
                    >
                      Get started
                    </Link>
                  </div>
                ))}
                </div>
              </div>
            </div>
          ))}
        </div>

       
      </section>

      <section className="bg-gray-50 border-t border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h3 className="text-3xl font-bold mb-8 text-gray-900 text-center">What you get in every plan</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {highlights.map((item) => (
              <div key={item.title} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h4 className="font-semibold text-gray-900 mb-2">{item.title}</h4>
                <p className="text-gray-600 text-sm">{item.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-16">
        <h3 className="text-3xl font-bold mb-8 text-gray-900 text-center">Frequently Asked Questions</h3>
        <div className="space-y-6">
          {faqs.map((faq) => (
            <div key={faq.q} className="bg-white rounded-3xl shadow-xl p-6 border border-gray-200">
              <h4 className="font-bold text-gray-900 mb-2">{faq.q}</h4>
              <p className="text-gray-600">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
