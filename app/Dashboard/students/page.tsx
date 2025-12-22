"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const lessons = [
  { title: "Lesson 12 – Phrasal Verbs", status: "Upcoming", when: "Wed, 7 May – 6:00 PM", type: "Online" },
  { title: "Lesson 11 – Past Tenses Review", status: "Completed", when: "Mon, 5 May – 6:00 PM", type: "Online" },
  { title: "Lesson 10 – Listening Practice", status: "Completed", when: "Wed, 1 May – 6:00 PM", type: "Online" },
  { title: "Lesson 9 – Speaking Drills", status: "Rescheduled", when: "Fri, 26 Apr – 6:00 PM", type: "Online" },
];

const documents = [
  { name: "Lesson 12 Slides (PDF)", type: "Slides", size: "2.3 MB" },
  { name: "Homework – Phrasal Verbs", type: "Homework", size: "350 KB" },
  { name: "Vocabulary List – Travel", type: "Vocab", size: "210 KB" },
];

const announcements = [
  { from: "Teacher", title: "Reminder", body: "Bring 3 examples of phrasal verbs to next class." },
  { from: "Admin", title: "Holiday", body: "No classes on Monday, 12 May (public holiday)." },
];

const placement = {
  initialScore: "B1 (Intermediate)",
  teacherNote: "You’re solid on grammar; focus on spoken confidence.",
  nextRequirement: "Complete 6 more speaking assignments to move to B2.",
};

function statusBadge(status: string) {
  const map: Record<string, string> = {
    Upcoming: "bg-[#e6f4ff] text-[#127db2]",
    Completed: "bg-emerald-50 text-emerald-700",
    Rescheduled: "bg-amber-50 text-amber-700",
    Cancelled: "bg-rose-50 text-rose-700",
  };
  return map[status] || "bg-gray-100 text-gray-700";
}

export default function StudentDashboardPage() {  const router = useRouter();
  const supabase = useMemo(() => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  ), []);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [currentClass, setCurrentClass] = useState<any>(null);
  const [studentData, setStudentData] = useState<any>(null);
  const [classmates, setClassmates] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    const run = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          router.push("/auth/login");
          return;
        }

        // Fetch student data
        const { data: student, error: studentErr } = await supabase
          .from("student_users")
          .select("*")
          .eq("user_id", session.user.id)
          .single();

        if (studentErr || !student) {
          setError("Student profile not found.");
          setLoading(false);
          return;
        }

        if (!active) return;
        setStudentData(student);

        // Fetch class details if assigned
        if (student.class_id) {
          const { data: classData, error: classErr } = await supabase
            .from("classes")
            .select("*")
            .eq("id", student.class_id)
            .single();

          if (!classErr && classData) {
            // Fetch teacher info
            let teacherData = null;
            if (classData.teacher_id) {
              const { data: tData } = await supabase
                .from("teacher_users")
                .select("*")
                .eq("id", classData.teacher_id)
                .single();
              teacherData = tData;
            }

            // Fetch classmates
            const { data: classmatesData } = await supabase
              .from("student_users")
              .select("full_name")
              .eq("class_id", student.class_id)
              .neq("id", student.id);

            if (active) {
              setCurrentClass({
                ...classData,
                teacher: teacherData ? {
                  name: teacherData.full_name,
                  photo: `https://i.pravatar.cc/100?img=${Math.floor(Math.random() * 70)}`,
                } : null,
                progress: 64,
                latestMessage: {
                  from: teacherData?.full_name || "Teacher",
                  text: "Great job last session! Please review the material before next class.",
                  time: "2h ago",
                },
                classmates: classmatesData?.map((c: any) => c.full_name) || [],
              });
              setClassmates(classmatesData?.map((c: any) => c.full_name) || []);
            }
          }
        }

        if (active) setLoading(false);
      } catch (err: any) {
        if (active) {
          setError(err?.message || "Failed to load student data.");
          setLoading(false);
        }
      }
    };

    run();
    return () => {
      active = false;
    };
  }, [router, supabase]);

  return (
    <main className="bg-[#f3f6f8] min-h-screen py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-10">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-3xl p-6 text-red-700">
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading your dashboard...</div>
        ) : !currentClass ? (
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 text-amber-700">
            <p className="font-semibold">You haven't been assigned to a class yet.</p>
            <p className="text-sm mt-1">Your admin will assign you to a class soon.</p>
          </div>
        ) : (
        <>
        <section className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 bg-white rounded-3xl shadow-xl p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-gray-500">Current class</p>
                <h2 className="text-xl font-bold text-[#127db2]">{currentClass.name}</h2>
                <p className="text-sm text-gray-600 mt-1">{currentClass.level}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Next lesson</p>
                <p className="font-semibold">{currentClass.nextLesson}</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 bg-[#f8fbff] border border-[#e6f4ff] rounded-2xl p-4">
                <img src={currentClass.teacher.photo} alt={currentClass.teacher.name} className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <p className="text-xs text-gray-500">Assigned teacher</p>
                  <p className="font-semibold text-gray-800">{currentClass.teacher.name}</p>
                  <p className="text-xs text-gray-500">{currentClass.schedule}</p>
                </div>
              </div>
              <div className="bg-[#fff5ef] border border-[#fde7da] rounded-2xl p-4">
                <p className="text-xs text-gray-500 mb-1">Progress</p>
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-800">{currentClass.progress}% to next level</p>
                  <span className="text-xs text-[#f1753d] font-semibold">Keep going!</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-gray-200 overflow-hidden">
                  <div className="h-full bg-[#127db2]" style={{ width: `${currentClass.progress}%` }} />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Latest teacher message</p>
              <p className="font-semibold text-gray-800 mb-1">“{currentClass.latestMessage.text}”</p>
              <p className="text-xs text-gray-500">
                {currentClass.latestMessage.from} • {currentClass.latestMessage.time}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-[#127db2]">Quick access</h3>
            <div className="space-y-3">
              <a className="block p-3 rounded-xl border border-gray-200 hover:border-[#127db2] transition" href={currentClass.meetLink} target="_blank" rel="noreferrer">
                <div className="text-sm text-gray-500">Join class</div>
                <div className="font-semibold">Meet Link</div>
              </a>
              <div className="p-3 rounded-xl border border-gray-200">
                <div className="text-sm text-gray-500">Classmates</div>
                <div className="flex flex-wrap gap-2 mt-2">
                    {currentClass.classmates.map((name: string) => (
                      <span key={name} className="text-xs px-3 py-1 rounded-full bg-[#e6f4ff] text-[#127db2]">
                        {name}
                      </span>
                    ))}
                  </div>
              </div>
              <button className="w-full py-3 rounded-xl font-semibold bg-[#127db2] text-white shadow hover:scale-[1.02] transition">
                Message class
              </button>
            </div>
          </div>
        </section>

        {/* My Class */}
        <section className="bg-white rounded-3xl shadow-xl p-6 space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-500">My class</p>
              <h3 className="text-xl font-bold text-[#127db2]">{currentClass.name}</h3>
            </div>
            <div className="text-sm text-gray-600">{currentClass.schedule}</div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 rounded-2xl border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Teacher</p>
              <div className="flex items-center gap-3">
                <img src={currentClass.teacher.photo} alt={currentClass.teacher.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <p className="font-semibold text-gray-800">{currentClass.teacher.name}</p>
                  <p className="text-xs text-gray-500">Lead Instructor</p>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-2xl border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Zoom / Meet</p>
              <a className="text-[#127db2] font-semibold hover:underline" href={currentClass.meetLink} target="_blank" rel="noreferrer">
                {currentClass.meetLink}
              </a>
            </div>
            <div className="p-4 rounded-2xl border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Classmates</p>
              <div className="flex flex-wrap gap-2">
                {currentClass.classmates.map((name: string) => (
                  <span key={name} className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Lessons & Schedule */}
        <section className="bg-white rounded-3xl shadow-xl p-6 space-y-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-500">Lessons & Schedule</p>
              <h3 className="text-xl font-bold text-[#127db2]">Your lessons</h3>
            </div>
            <button className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:border-[#127db2]">
              Request reschedule
            </button>
          </div>
          <div className="space-y-3">
            {lessons.map((lesson) => (
              <div key={lesson.title} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-2xl border border-gray-100">
                <div>
                  <p className="font-semibold text-gray-800">{lesson.title}</p>
                  <p className="text-sm text-gray-500">{lesson.when} • {lesson.type}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadge(lesson.status)}`}>
                  {lesson.status}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Documents & Materials */}
        <section className="bg-white rounded-3xl shadow-xl p-6 space-y-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-500">Documents & Materials</p>
              <h3 className="text-xl font-bold text-[#127db2]">From your teacher</h3>
            </div>
            <button className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:border-[#127db2]">
              Submit homework
            </button>
          </div>
          <div className="space-y-3">
            {documents.map((doc) => (
              <div key={doc.name} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-2xl border border-gray-100">
                <div>
                  <p className="font-semibold text-gray-800">{doc.name}</p>
                  <p className="text-xs text-gray-500">{doc.type} • {doc.size}</p>
                </div>
                <button className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[#127db2] hover:brightness-95 shadow">
                  Download
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Placement Test & Level */}
        <section className="bg-white rounded-3xl shadow-xl p-6 space-y-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-500">Placement & Level</p>
              <h3 className="text-xl font-bold text-[#127db2]">Your level</h3>
            </div>
            <button className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:border-[#127db2]">
              Request re-evaluation
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 rounded-2xl border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Initial placement</p>
              <p className="font-semibold text-gray-800">{placement.initialScore}</p>
            </div>
            <div className="p-4 rounded-2xl border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Teacher recommendation</p>
              <p className="font-semibold text-gray-800">{placement.teacherNote}</p>
            </div>
            <div className="p-4 rounded-2xl border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Next level requirement</p>
              <p className="font-semibold text-gray-800">{placement.nextRequirement}</p>
            </div>
          </div>
        </section>

        {/* Messages / Announcements */}
        <section className="bg-white rounded-3xl shadow-xl p-6 space-y-4">
          <div>
            <p className="text-sm text-gray-500">Messages / Announcements</p>
            <h3 className="text-xl font-bold text-[#127db2]">Class updates</h3>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {announcements.map((msg, idx) => (
              <div key={idx} className="p-4 rounded-2xl border border-gray-100 bg-gray-50">
                <p className="text-xs text-gray-500 mb-1">{msg.from}</p>
                <p className="font-semibold text-gray-800">{msg.title}</p>
                <p className="text-sm text-gray-600 mt-1">{msg.body}</p>
              </div>
            ))}
          </div>
        </section>
        </>
        )}
      </div>
    </main>
  );
}