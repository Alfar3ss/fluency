"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface ClassDetail {
  id: string;
  name: string;
  language: string;
  level: string;
  schedule: string | null;
  max_students: number | null;
  current_students: number | null;
  status: string | null;
}

interface StudentRow {
  user_id: string;
  full_name: string;
  email: string;
  skill_level: string | null;
  timezone: string | null;
  native_language: string | null;
  target_languages: string[] | null;
}

export default function ClassStudentsPage() {
  const params = useParams<{ classId: string }>();
  const router = useRouter();
  const classId = params?.classId;

  const [classInfo, setClassInfo] = useState<ClassDetail | null>(null);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        if (!classId) return;
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        if (!token) {
          router.push("/auth/admin");
          return;
        }

        const res = await fetch(`/api/admin/classes/${classId}/students`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error || "Failed to load class");
        }

        const body = await res.json();
        if (!active) return;
        setClassInfo(body.class);
        setStudents(body.students || []);
        setError("");
      } catch (err: any) {
        if (!active) return;
        setError(err?.message || "Failed to load class");
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [classId, router]);

  const seatsInfo = useMemo(() => {
    const max = classInfo?.max_students ?? 0;
    const current = classInfo?.current_students ?? 0;
    const remaining = Math.max(max - current, 0);
    return { max, current, remaining };
  }, [classInfo]);

  return (
    <main className="bg-white text-gray-900 min-h-screen">
      <div className="border-b border-gray-200 bg-white sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/Dashboard/admin/classes" className="text-blue-600 hover:text-blue-700">
              ← Back to Classes
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Class Students</h1>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-gray-500">Loading class...</div>
        ) : !classInfo ? (
          <div className="text-gray-700">Class not found.</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4">
                <p className="text-sm text-gray-600 mb-1">Class</p>
                <p className="text-xl font-bold text-blue-700">{classInfo.name}</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4">
                <p className="text-sm text-gray-600 mb-1">Language / Level</p>
                <p className="text-lg font-semibold text-green-700">{classInfo.language} • {classInfo.level}</p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-4">
                <p className="text-sm text-gray-600 mb-1">Schedule</p>
                <p className="text-base font-medium text-orange-700">{classInfo.schedule || "-"}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 border border-purple-200 rounded-2xl p-4">
                <p className="text-sm text-gray-600 mb-1">Seats</p>
                <p className="text-lg font-semibold text-purple-700">
                  {seatsInfo.current} / {seatsInfo.max} (left: {seatsInfo.remaining})
                </p>
              </div>
            </div>

            <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              {students.length === 0 ? (
                <div className="p-6 text-gray-600">No students assigned to this class.</div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Student</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Level</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Languages</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Timezone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => {
                      const targets = student.target_languages ?? [];
                      return (
                        <tr key={student.user_id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{student.full_name}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{student.email}</td>
                          <td className="px-6 py-4 text-sm">
                            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                              {student.skill_level || "N/A"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            <div className="flex gap-2 flex-wrap">
                              {targets.length > 0 ? (
                                Array.from(new Set(targets)).map((lang, idx) => (
                                  <span
                                    key={`${lang}-${idx}`}
                                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                                  >
                                    {lang}
                                  </span>
                                ))
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{student.timezone || "-"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
