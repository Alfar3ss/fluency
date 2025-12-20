"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const languages = [
  { name: "English", code: "en" },
  { name: "French", code: "fr" },
  { name: "Spanish", code: "es" },
  { name: "German", code: "de" },
  { name: "Arabic", code: "ar" },
  { name: "Italian", code: "it" },
];

export default function TestPage() {
  const [selected, setSelected] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selected) {
      const lang = languages.find(l => l.name === selected);
      if (lang) {
        router.push(`/test/${lang.code}`);
      }
    }
  };

  return (
    <main className="bg-[#f3f6f8] min-h-screen flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
        <h1 className="text-3xl font-extrabold text-[#127db2] mb-2 text-center">Language Placement Test</h1>
        <p className="text-[#f1753d] font-medium mb-6 text-center">Choose a language to begin your test</p>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block mb-2 font-medium text-gray-700 text-center">Select Language</label>
            <div className="grid grid-cols-2 gap-4">
              {languages.map((lang) => (
                <button
                  type="button"
                  key={lang.name}
                  className={`py-3 rounded-xl font-semibold border transition text-gray-700 hover:bg-[#127db2] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#127db2] ${
                    selected === lang.name ? "bg-[#127db2] text-white border-[#127db2]" : "bg-gray-50 border-gray-200"
                  }`}
                  onClick={() => setSelected(lang.name)}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-xl font-semibold bg-[#127db2] text-white shadow hover:scale-[1.03] transition disabled:opacity-60"
            disabled={!selected}
          >
            {selected ? `Start ${selected} Test` : "Start Test"}
          </button>
        </form>
      </div>
    </main>
  );
}