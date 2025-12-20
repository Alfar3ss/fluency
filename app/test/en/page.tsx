"use client";

import { useState } from "react";

/* =======================
   QUESTIONS
======================= */

const questions = [
  { q: "She ___ from Canada.", options: ["come", "comes", "coming", "came"], answer: 1 },
  { q: "We ___ finished our homework yet.", options: ["haven’t", "don’t", "didn’t", "aren’t"], answer: 0 },
  { q: "There isn’t ___ milk left in the fridge.", options: ["many", "much", "few", "several"], answer: 1 },
  { q: "He was tired ___ he stayed up late.", options: ["because", "but", "although", "however"], answer: 0 },
  { q: "Which sentence is correct?", options: ["I am agree with you", "I agree with you", "I agreeing with you", "I am agreed with you"], answer: 1 },

  { q: "If I ___ more time, I would learn another language.", options: ["have", "had", "will have", "would have"], answer: 1 },
  { q: "She speaks ___ than her sister.", options: ["more confidently", "most confidently", "confident", "confidence"], answer: 0 },
  { q: "This is the book ___ I told you about.", options: ["who", "where", "which", "whose"], answer: 2 },
  { q: "He apologized ___ being late.", options: ["for", "about", "of", "to"], answer: 0 },
  { q: "The meeting was postponed ___ the manager was ill.", options: ["despite", "although", "because", "however"], answer: 2 },

  { q: "Hardly had we arrived ___ it started raining.", options: ["than", "when", "then", "while"], answer: 1 },
  { q: "The proposal was rejected, ___ surprised everyone.", options: ["that", "which", "what", "who"], answer: 1 },
  { q: "She is not only intelligent ___ extremely hardworking.", options: ["but also", "and also", "as well", "even"], answer: 0 },
  { q: "He spoke so quietly that his words were barely ___.", options: ["audible", "visible", "readable", "sensible"], answer: 0 },
  { q: "It’s high time you ___ responsibility.", options: ["take", "took", "have taken", "will take"], answer: 1 },

  { q: "What is the main idea of the text?", options: [
      "Remote work should be avoided",
      "Remote work has both benefits and drawbacks",
      "Office work is more productive",
      "Employees dislike flexibility",
    ], answer: 1, reading: true },

  { q: "What does “blurred boundaries” most likely mean?", options: [
      "Confusing job roles",
      "Difficulty separating work and personal life",
      "Poor communication",
      "Lack of structure",
    ], answer: 1, reading: true },
];

const readingText =
  "In recent years, remote work has transformed the traditional workplace. While it offers flexibility and autonomy, it also presents challenges such as isolation and blurred boundaries between professional and personal life.";

/* =======================
   LEVEL LOGIC
======================= */

function getLevel(score: number) {
  if (score <= 5) return { level: "A1", desc: "Beginner" };
  if (score <= 8) return { level: "A2", desc: "Elementary" };
  if (score <= 12) return { level: "B1", desc: "Intermediate" };
  if (score <= 15) return { level: "B2", desc: "Upper-Intermediate" };
  return { level: "C1", desc: "Advanced" };
}

/* =======================
   PAGE
======================= */

export default function EnglishTestPage() {
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);

  const score = answers.reduce(
    (acc, a, i) => acc + (a === questions[i]?.answer ? 1 : 0),
    0
  );
  const level = getLevel(score);
  const q = questions[current];

  /* =======================
     INTRO
  ======================= */

  if (!started) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#f3f6f8] px-4">
        <div className="bg-white max-w-lg w-full rounded-3xl shadow-xl p-8 text-center">
          <h1 className="text-3xl font-extrabold text-[#127db2] mb-3">
            English Placement Test
          </h1>
          <p className="text-gray-600 mb-6">
            Discover your real English level. CEFR aligned.
          </p>

          <ul className="text-gray-700 text-left mb-6 space-y-2">
            <li>• 17 questions</li>
            <li>• Approx. 30 minutes</li>
            <li>• Instant result</li>
          </ul>

          <button
            onClick={() => setStarted(true)}
            className="w-full py-3 rounded-xl font-semibold bg-[#127db2] text-white"
          >
            Start Test
          </button>
        </div>
      </main>
    );
  }

  /* =======================
     RESULT
  ======================= */

  if (finished) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#f3f6f8] px-4">
        <div className="bg-white max-w-xl w-full rounded-3xl shadow-xl p-10 text-center">
          <h2 className="text-3xl font-extrabold text-[#127db2] mb-4">
            Your English Level
          </h2>

          <div className="text-6xl font-bold text-[#f1753d] mb-2">
            {level.level}
          </div>

          <p className="text-lg text-gray-700 mb-6">{level.desc}</p>

          <div className="bg-gray-50 rounded-xl p-4 text-gray-600 mb-6">
            {level.level === "A1" && "You can understand basic phrases and introduce yourself."}
            {level.level === "A2" && "You can communicate in simple everyday situations."}
            {level.level === "B1" && "You can handle most travel and work conversations."}
            {level.level === "B2" && "You can communicate fluently in most situations."}
            {level.level === "C1" && "You have strong professional and academic English."}
          </div>

          <button className="px-8 py-3 rounded-xl bg-[#127db2] text-white font-semibold">
            Book a Trial Lesson
          </button>
        </div>
      </main>
    );
  }

  /* =======================
     TEST
  ======================= */

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f3f6f8] px-4">
      <div className="bg-white max-w-2xl w-full rounded-3xl shadow-xl p-8">
        <div className="text-sm text-gray-500 mb-2">
          Question {current + 1} of {questions.length}
        </div>

        {q.reading && (
          <div className="bg-blue-50 rounded-xl p-4 mb-4 text-gray-800">
            <strong>Reading passage</strong>
            <p className="mt-2">{readingText}</p>
          </div>
        )}

        <h2 className="text-lg font-semibold mb-4">{q.q}</h2>

        <div className="space-y-2">
          {q.options.map((opt, i) => (
            <label
              key={i}
              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition
              ${
                answers[current] === i
                  ? "bg-[#127db2] text-white border-[#127db2]"
                  : "bg-gray-50 border-gray-200 hover:bg-blue-50"
              }`}
            >
              <input
                type="radio"
                checked={answers[current] === i}
                onChange={() => {
                  const copy = [...answers];
                  copy[current] = i;
                  setAnswers(copy);
                }}
              />
              {opt}
            </label>
          ))}
        </div>

        <div className="flex justify-between mt-6">
          <button
            disabled={current === 0}
            onClick={() => setCurrent(c => c - 1)}
            className="px-6 py-2 rounded-xl border"
          >
            Back
          </button>

          {current < questions.length - 1 ? (
            <button
              disabled={answers[current] === undefined}
              onClick={() => setCurrent(c => c + 1)}
              className="px-6 py-2 rounded-xl bg-[#127db2] text-white"
            >
              Next
            </button>
          ) : (
            <button
              onClick={() => setFinished(true)}
              className="px-6 py-2 rounded-xl bg-[#127db2] text-white"
            >
              Submit Test
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
