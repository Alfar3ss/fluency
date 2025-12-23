"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type ClassDetail = {
  id: string;
  name: string;
  language: string;
  level: string;
  schedule: string | null;
  max_students: number | null;
  status: string;
  current_students: number | null;
};

type Student = {
  user_id: string;
  full_name: string;
  skill_level: string | null;
  class_id: string | null;
};

type AttendanceRecord = {
  student_id: string;
  status: "present" | "absent" | "late";
  date: string;
};

export default function ClassAttendancePage() {
  const router = useRouter();
  const params = useParams();
  const classId = params?.classId as string;

  const [classDetail, setClassDetail] = useState<ClassDetail | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceRecord>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!classId) return;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current teacher
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError || !authData.user) {
          router.push("/auth/teacher");
          return;
        }

        // Get class details
        const { data: classData, error: classError } = await supabase
          .from("classes")
          .select("id, name, language, level, schedule, max_students, status, current_students")
          .eq("id", classId)
          .eq("teacher_id", authData.user.id)
          .single();

        if (classError || !classData) {
          setError("Class not found or you don't have access");
          setLoading(false);
          return;
        }

        setClassDetail(classData);

        // Get students via secure API (service role) to bypass RLS
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;
        if (!token) {
          setError("You must be logged in");
          setLoading(false);
          return;
        }

        const resp = await fetch(`/api/teacher/classes/${classId}/students`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!resp.ok) {
          const body = await resp.json().catch(() => ({}));
          throw new Error(body?.error || "Failed to load students");
        }
        const body = await resp.json();
        setStudents(body.students || []);

        setLoading(false);
      } catch (err: any) {
        console.error("Error loading class data:", err);
        setError(err?.message || "Failed to load class data");
        setLoading(false);
      }
    };

    loadData();
  }, [classId, router]);

  const handleAttendanceChange = (studentId: string, status: "present" | "absent" | "late") => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: {
        student_id: studentId,
        status,
        date: selectedDate,
      },
    }));
  };

  const handleSaveAttendance = async () => {
    if (Object.keys(attendance).length === 0) {
      setError("Please mark attendance for at least one student");
      return;
    }

    try {
      setSaving(true);
      setError("");

      // Prepare attendance records (match schema: no marked_at)
      const records = Object.values(attendance).map((record) => ({
        student_id: record.student_id,
        session_date: record.date,
        status: record.status,
        class_id: classId,
      }));

      // Save attendance via secure API to bypass RLS
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error("You must be logged in");

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      try {
        const resp = await fetch(`/api/teacher/classes/${classId}/attendance`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ records }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!resp.ok) {
          const body = await resp.json().catch(() => ({}));
          throw new Error(body?.error || `Save failed: ${resp.statusText}`);
        }

        const body = await resp.json();
        if (!body.ok) {
          throw new Error(body?.error || "Save returned error");
        }
      } catch (fetchErr: any) {
        clearTimeout(timeoutId);
        if (fetchErr.name === "AbortError") {
          throw new Error("Save request timed out. Please try again.");
        }
        throw fetchErr;
      }

      setSuccess("Attendance saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
      setAttendance({});
    } catch (err: any) {
      console.error("Error saving attendance:", err);
      setError(err?.message || "Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="bg-[#f3f6f8] min-h-screen py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-gray-600">Loading class details...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-[#f3f6f8] min-h-screen py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <Link href="/Dashboard/teachers" className="text-[#127db2] hover:underline text-sm font-medium">
              ← Back to Classes
            </Link>
            {classDetail && (
              <div className="mt-3">
                <h1 className="text-3xl font-bold text-gray-900">{classDetail.name}</h1>
                <p className="text-gray-600">
                  {classDetail.language} · Level {classDetail.level}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Error/Success */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            {success}
          </div>
        )}

        {/* Attendance Section */}
        <div className="bg-white rounded-3xl shadow-lg p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Mark Attendance</h2>
              <p className="text-gray-600 text-sm">Record student attendance for the selected date</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Session Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#127db2] focus:border-transparent outline-none"
              />
            </div>
          </div>

          {students.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No students enrolled in this class yet.</p>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm font-semibold text-gray-700 pb-3 border-b border-gray-200">
                <div>Student Name</div>
                <div>Skill Level</div>
                <div>Status</div>
              </div>

              {students.map((student) => (
                <div key={student.user_id} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <div>
                    <p className="font-medium text-gray-900">{student.full_name}</p>
                  </div>
                  <div>
                    <span className="text-xs px-3 py-1 rounded-full bg-[#e6f4ff] text-[#127db2]">
                      {student.skill_level || "Level N/A"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {(["present", "absent", "late"] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => handleAttendanceChange(student.user_id, status)}
                        className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${
                          attendance[student.user_id]?.status === status
                            ? status === "present"
                              ? "bg-green-600 text-white"
                              : status === "absent"
                                ? "bg-red-600 text-white"
                                : "bg-yellow-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {students.length > 0 && (
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={handleSaveAttendance}
                disabled={saving || Object.keys(attendance).length === 0}
                className="flex-1 px-6 py-3 rounded-lg bg-[#127db2] text-white font-semibold hover:brightness-95 disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {saving ? "Saving..." : "Save Attendance"}
              </button>
              <button
                onClick={() => setAttendance({})}
                disabled={saving}
                className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 disabled:opacity-60 transition"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Class Summary */}
        {classDetail && (
          <div className="bg-white rounded-3xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Class Summary</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500">Language</p>
                <p className="font-semibold text-gray-800">{classDetail.language}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Level</p>
                <p className="font-semibold text-gray-800">{classDetail.level}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Students</p>
                <p className="font-semibold text-gray-800">
                  {students.length} / {classDetail.max_students || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <p className={`font-semibold ${classDetail.status === "Active" ? "text-green-600" : "text-gray-600"}`}>
                  {classDetail.status}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
