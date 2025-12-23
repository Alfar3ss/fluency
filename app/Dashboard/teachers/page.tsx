"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Teacher = {
  user_id: string;
  full_name: string;
  email: string;
  languages_taught: string[] | string | null;
  hourly_rate: number | null;
  is_verified: boolean;
};

type ClassRow = {
  id: string;
  name: string;
  language: string;
  level: string;
  schedule: string | null;
  max_students: number | null;
  status: string;
  current_students?: number | null;
  teacher_id?: string | null;
};

type StudentRow = {
  user_id: string;
  full_name: string;
  skill_level: string | null;
  status?: string | null;
  class_id: string | null;
};

export default function TeacherDashboardPage() {
  const router = useRouter();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      setError(null);

      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        router.push("/auth/teacher");
        if (isMounted) setLoading(false);
        return;
      }

      const { data: teacherRow, error: teacherError } = await supabase
        .from("teacher_users")
        .select("user_id, full_name, email, languages_taught, hourly_rate, is_verified")
        .eq("user_id", authData.user.id)
        .maybeSingle();

      if (teacherError) throw teacherError;
      if (!teacherRow) throw new Error("No teacher profile found for this account.");

      const { data: classRows, error: classError } = await supabase
        .from("classes")
        .select("id, name, language, level, schedule, max_students, status, current_students, teacher_id")
        .eq("teacher_id", teacherRow.user_id)
        .order("name", { ascending: true });

      if (classError) throw classError;

      let studentRows: StudentRow[] = [];
      if (classRows && classRows.length > 0) {
        const classIds = classRows.map((c) => c.id);
        const { data: studentData, error: studentError } = await supabase
          .from("student_users")
          .select("user_id, full_name, skill_level, class_id")
          .in("class_id", classIds);

        if (studentError) throw studentError;
        studentRows = studentData ?? [];
      }

      if (!isMounted) return;

      setTeacher(teacherRow);
      setClasses(classRows ?? []);
      setStudents(studentRows);
      setSelectedClassId((prev) => prev ?? classRows?.[0]?.id ?? null);
      setLoading(false);
    };

    loadData().catch((err: any) => {
      console.error("Teacher dashboard load error", err);
      if (!isMounted) return;
      setError(err?.message || "Failed to load teacher data.");
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [router]);

  const studentsByClass = useMemo(() => {
    const map: Record<string, StudentRow[]> = {};
    students.forEach((student) => {
      if (!student.class_id) return;
      if (!map[student.class_id]) map[student.class_id] = [];
      map[student.class_id].push(student);
    });
    return map;
  }, [students]);

  const stats = useMemo(
    () => {
      const activeClasses = classes.filter((c) => c.status === "Active").length;
      const totalStudents = students.length;
      const totalCapacity = classes.reduce((sum, c) => sum + (c.max_students || 0), 0);
      const openSeats = classes.reduce((sum, c) => {
        const currentCount = studentsByClass[c.id]?.length || 0;
        return sum + Math.max(0, (c.max_students || 0) - currentCount);
      }, 0);

      return [
        { label: "Active classes", value: String(activeClasses), color: "bg-[#e6f4ff] text-[#127db2]" },
        { label: "Total students", value: String(totalStudents), color: "bg-[#fff5ef] text-[#f1753d]" },
        { label: "Total capacity", value: String(totalCapacity), color: "bg-emerald-50 text-emerald-700" },
        { label: "Open seats", value: String(openSeats), color: "bg-amber-50 text-amber-700" },
      ];
    },
    [classes, students, studentsByClass]
  );

  const selectedClass = selectedClassId ? classes.find((c) => c.id === selectedClassId) || null : null;
  const selectedClassStudents = selectedClass ? studentsByClass[selectedClass.id] || [] : [];

  return (
    <main className="bg-[#f3f6f8] min-h-screen py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-10">
        <section className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 bg-white rounded-3xl shadow-xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-sm text-gray-500">Teacher home</p>
                <h2 className="text-2xl font-bold text-[#127db2]">
                  {loading ? "Loading teacher..." : teacher ? `Welcome back, ${teacher.full_name}` : "Teacher dashboard"}
                </h2>
                <p className="text-sm text-gray-600">Live data from your Supabase tables.</p>
              </div>
              <div className="flex gap-2">
                <button
                  className="px-4 py-2 rounded-xl bg-[#127db2] text-white font-semibold shadow hover:brightness-95 disabled:opacity-60"
                  disabled
                >
                  Add homework
                </button>
                <button
                  className="px-4 py-2 rounded-xl border border-gray-200 font-semibold text-gray-700 hover:border-[#127db2] disabled:opacity-60"
                  disabled
                >
                  Upload docs
                </button>
              </div>
            </div>

            {error && <div className="text-red-600 text-sm">{error}</div>}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {stats.map((s) => (
                <div key={s.label} className={`rounded-2xl p-4 border border-gray-100 ${s.color}`}>
                  <p className="text-xs opacity-80">{s.label}</p>
                  <p className="text-xl font-bold">{loading ? "--" : s.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Account status</p>
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    teacher?.is_verified ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {teacher?.is_verified ? "Verified teacher" : "Pending verification"}
                </span>
                {teacher?.email && <p className="text-sm text-gray-700">{teacher.email}</p>}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-[#127db2]">Profile</h3>
            {loading ? (
              <p className="text-sm text-gray-600">Loading profile...</p>
            ) : teacher ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-800 font-semibold">{teacher.full_name}</p>
                  <p className="text-sm text-gray-600">{teacher.email}</p>
                <div>
                  <p className="text-xs text-gray-500">Languages taught</p>
                  <p className="font-semibold text-gray-800">{Array.isArray(teacher.languages_taught) ? teacher.languages_taught.join(", ") : teacher.languages_taught || "Not set"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Hourly rate</p>
                  <p className="font-semibold text-gray-800">{teacher.hourly_rate ? `$${teacher.hourly_rate}` : "Not set"}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-600">No teacher profile found.</p>
            )}
          </div>
        </section>

        <section className="bg-white rounded-3xl shadow-xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <p className="text-sm text-gray-500">My classes</p>
              <h3 className="text-xl font-bold text-[#127db2]">Class roster</h3>
            </div>
            <span className="text-xs text-gray-500">{classes.length} classes</span>
          </div>

          {loading ? (
            <p className="text-sm text-gray-600">Loading classes...</p>
          ) : classes.length === 0 ? (
            <p className="text-sm text-gray-600">No classes assigned yet.</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {classes.map((c) => {
                const studentCount = studentsByClass[c.id]?.length || 0;
                const capacity = c.max_students || 0;
                const statusColor = c.status === "Active" ? "bg-[#e6f4ff]" : "bg-gray-100";

                return (
                  <div key={c.id} className="rounded-2xl border border-gray-100 p-4 shadow-sm bg-white hover:shadow-md transition">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-gray-500">{c.language} · {c.level}</p>
                        <p className="font-semibold text-gray-800">{c.name}</p>
                        <p className="text-sm text-gray-500">{c.schedule || "Schedule not set"}</p>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full ${statusColor} border border-white/50`}>{c.status}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-sm text-gray-700">Students</p>
                      <p className="font-semibold text-[#127db2]">{studentCount} / {capacity}</p>
                    </div>
                    <button
                      className="mt-3 w-full py-2 rounded-xl font-semibold bg-[#127db2] text-white shadow hover:scale-[1.01] transition"
                      onClick={() => router.push(`/Dashboard/teachers/${c.id}`)}
                    >
                      View class
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="bg-white rounded-3xl shadow-xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <p className="text-sm text-gray-500">Class details</p>
              <h3 className="text-xl font-bold text-[#127db2]">{selectedClass ? selectedClass.name : "Select a class"}</h3>
              {selectedClass && <p className="text-sm text-gray-600">{selectedClass.schedule || "Schedule not set"}</p>}
            </div>
          </div>

          {!selectedClass ? (
            <p className="text-sm text-gray-600">Choose a class above to see enrolled students.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-gray-100 p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-800">Students</h4>
                  <span className="text-xs text-gray-500">{selectedClassStudents.length} enrolled</span>
                </div>
                <div className="space-y-3">
                  {selectedClassStudents.length === 0 ? (
                    <p className="text-sm text-gray-600">No students enrolled yet.</p>
                  ) : (
                    selectedClassStudents.map((s) => (
                      <div key={s.user_id} className="rounded-xl border border-gray-200 bg-white p-3">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-gray-800">{s.full_name}</p>
                          <span className="text-xs px-2 py-1 rounded-full bg-[#e6f4ff] text-[#127db2]">{s.skill_level || "Level N/A"}</span>
                        </div>
                        <p className="text-xs text-gray-500">Status: {s.status ?? "Active"}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-800">Class summary</h4>
                </div>
                <div className="space-y-2 text-sm text-gray-700">
                  <p><span className="font-semibold">Language:</span> {selectedClass.language}</p>
                  <p><span className="font-semibold">Level:</span> {selectedClass.level}</p>
                  <p><span className="font-semibold">Max students:</span> {selectedClass.max_students ?? "N/A"}</p>
                  <p><span className="font-semibold">Status:</span> {selectedClass.status}</p>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}