"use client";

import { useState } from "react";

const questions = [
  { q: "هي ___ من مصر.", options: ["تأتي", "تجي", "جاءت", "أتت"], answer: 0 },
  { q: "نحن ___ واجباتنا.", options: ["نفعل", "نعمل", "نفتح", "نقول"], answer: 0 },
  { q: "لا يوجد ___ حليب في الثلاجة.", options: ["كثير", "كثيرة", "كثيرين", "كثيرات"], answer: 0 },
  { q: "يتحدث العربية ___ من أخيه.", options: ["بشكل جيد", "أفضل", "أكثر", "جداً"], answer: 1 },
  { q: "لو كان لدي وقت أكثر، ___ لغة أخرى.", options: ["أتعلم", "سأتعلم", "سأكون تعلمت", "تعلمت"], answer: 1 },
];

function getLevel(score: number) {
  if (score <= 1) return { level: "A1", desc: "Beginner" };
  if (score <= 2) return { level: "A2", desc: "Elementary" };
  if (score <= 3) return { level: "B1", desc: "Intermediate" };
  if (score <= 4) return { level: "B2", desc: "Upper-Intermediate" };
  return { level: "C1", desc: "Advanced" };
}

export default function ArabicTestPage() {
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (idx: number, ans: number) => {
    setAnswers((prev) => {
      const copy = [...prev];
      copy[idx] = ans;
      return copy;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowResult(true);
  };

  const score = answers.reduce((acc, ans, i) => acc + (ans === questions[i].answer ? 1 : 0), 0);
  const level = getLevel(score);

  return (
    <main className="bg-[#f3f6f8] min-h-screen flex items-center justify-center py-12 px-2">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-8">
        <h1 className="text-2xl font-extrabold text-[#127db2] mb-2 text-center">FLUENCY – ARABIC PLACEMENT TEST</h1>
        <p className="text-gray-700 text-center mb-6">اختر أفضل إجابة لكل سؤال.</p>
        {!showResult ? (
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {questions.map((q, i) => (
                <div key={i} className="mb-4">
                  <div className="font-semibold mb-2">{i + 1}. {q.q}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt, j) => (
                      <label key={j} className={`flex items-center gap-2 px-4 py-2 rounded-xl border cursor-pointer transition ${answers[i] === j ? "bg-[#127db2] text-white border-[#127db2]" : "bg-gray-50 border-gray-200 hover:bg-blue-50"}`}>
                        <input type="radio" name={`q${i}`} checked={answers[i] === j} onChange={() => handleAnswer(i, j)} className="accent-[#127db2]" />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button type="submit" className="w-full mt-6 py-3 rounded-xl font-semibold bg-[#127db2] text-white shadow hover:scale-[1.03] transition disabled:opacity-60" disabled={answers.length !== questions.length}>
              Submit Test
            </button>
          </form>
        ) : (
          <div className="mt-8 text-center">
            <div className="text-2xl font-bold text-[#127db2] mb-2">Your Score: {score} / 5</div>
            <div className="text-lg font-semibold text-[#f1753d] mb-1">Level: {level.level} – {level.desc}</div>
            <div className="text-gray-600 text-sm">Contact a teacher to begin your personalized lessons!</div>
          </div>
        )}
      </div>
    </main>
  );
}