"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ClassAttendancePage() {
  const params = useParams();
  const className = (params as { className?: string })?.className;

  const [classDisplayName, setClassDisplayName] = useState<string>("");
  const [isLoadingClass, setIsLoadingClass] = useState(true);
  const [sessions, setSessions] = useState<Array<{ date: string; present: number; absent: number; late: number }>>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [sessionsError, setSessionsError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [studentRows, setStudentRows] = useState<AttendanceStudent[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  const summaryFromSessions = useMemo(() => {
    const present = sessions.reduce((acc, s) => acc + s.present, 0);
    const absent = sessions.reduce((acc, s) => acc + s.absent, 0);
    const late = sessions.reduce((acc, s) => acc + s.late, 0);
    return { present, absent, late, totalSessions: sessions.length };
  }, [sessions]);

  const summary = summaryFromSessions;

  useEffect(() => {
    if (!className) return;

    const controller = new AbortController();

    (async () => {
      try {
        setIsLoadingSessions(true);
        setSessionsError(null);
        
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        if (!token) {
          console.error("No auth token available");
          setClassDisplayName(className);
          setIsLoadingClass(false);
          return;
        }

        // Fetch class info and sessions in parallel
        const [classRes, sessionsRes] = await Promise.all([
          fetch(`/api/admin/attendance`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }),
          fetch(`/api/admin/attendance/${className}/sessions`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }),
        ]);

        if (classRes.ok) {
          const classesData = await classRes.json();
          const matchingClass = classesData.classes?.find((c: any) => c.id === className);
          if (matchingClass) {
            setClassDisplayName(matchingClass.name);
          } else {
            setClassDisplayName(className);
          }
        } else {
          setClassDisplayName(className);
        }

        if (sessionsRes.ok) {
          const sessionsData = await sessionsRes.json();
          setSessions(sessionsData.sessions || []);
        } else {
          setSessionsError("Failed to load attendance sessions");
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Failed to load data:", err);
          setSessionsError(err.message || "Failed to load sessions");
          setClassDisplayName(className || "");
        }
      } finally {
        setIsLoadingClass(false);
        setIsLoadingSessions(false);
      }
    })();

    return () => controller.abort();
  }, [className]);

  useEffect(() => {
    if (!className || !selectedDate) return;

    const controller = new AbortController();

    (async () => {
      try {
        setIsLoadingDetails(true);
        setDetailsError(null);

        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        if (!token) {
          setDetailsError("No auth token available");
          return;
        }

        const res = await fetch(`/api/admin/attendance/${encodeURIComponent(className)}/${selectedDate}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        if (!res.ok) throw new Error(`Failed to load students (${res.status})`);
        const data_response = (await res.json()) as AttendanceDetailsResponse;
        setStudentRows(data_response.students ?? []);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setDetailsError(err.message || "Failed to load attendance details");
        }
      } finally {
        setIsLoadingDetails(false);
      }
    })();

    return () => controller.abort();
  }, [className, selectedDate]);

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="border-b border-gray-200 bg-white sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/Dashboard/admin/attendance" className="text-blue-600 hover:text-blue-700">
              ← Back to Attendance
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              Attendance • {isLoadingClass ? "Loading..." : classDisplayName || className}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Present" value={summary.present} tone="from-green-50 to-emerald-50" text="text-green-700" />
          <StatCard label="Absent" value={summary.absent} tone="from-rose-50 to-red-50" text="text-red-700" />
          <StatCard label="Late" value={summary.late} tone="from-amber-50 to-yellow-50" text="text-amber-700" />
          <StatCard label="Sessions" value={summary.totalSessions} tone="from-blue-50 to-indigo-50" text="text-blue-700" />
        </div>

        <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Present</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Absent</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Late</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingSessions ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-600">
                    Loading sessions…
                  </td>
                </tr>
              ) : sessionsError ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-red-600">
                    {sessionsError}
                  </td>
                </tr>
              ) : sessions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-600">
                    No attendance records found.
                  </td>
                </tr>
              ) : (
                sessions.map((session) => (
                  <tr key={session.date} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{session.date}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{session.present}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{session.absent}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{session.late}</td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => setSelectedDate(session.date)}
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:shadow-lg transition"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {selectedDate && (
          <DetailsModal
            date={selectedDate}
            onClose={() => {
              setSelectedDate(null);
              setStudentRows([]);
              setDetailsError(null);
            }}
            students={studentRows}
            isLoading={isLoadingDetails}
            error={detailsError}
          />
        )}
      </div>
    </main>
  );
}

function StatCard({ label, value, tone, text }: { label: string; value: number; tone: string; text: string }) {
  return (
    <div className={`bg-gradient-to-br ${tone} border border-gray-200 rounded-2xl p-4`}>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${text}`}>{value}</p>
    </div>
  );
}

type AttendanceStudent = {
  user_id: string;
  full_name: string;
  email?: string;
  status: "present" | "absent" | "late";
};

type AttendanceDetailsResponse = {
  classId: string;
  sessionDate: string;
  students: AttendanceStudent[];
};

function DetailsModal({
  date,
  onClose,
  students,
  isLoading,
  error,
}: {
  date: string;
  onClose: () => void;
  students: AttendanceStudent[];
  isLoading: boolean;
  error: string | null;
}) {
  const grouped = useMemo(() => {
    return students.reduce<Record<string, AttendanceStudent[]>>((acc, student) => {
      const key = student.status;
      acc[key] = acc[key] ? [...acc[key], student] : [student];
      return acc;
    }, {});
  }, [students]);

  const statusOrder: Array<AttendanceStudent["status"]> = ["present", "absent", "late"];

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <p className="text-sm text-gray-500">Session</p>
            <h2 className="text-lg font-semibold text-gray-900">{date}</h2>
          </div>
          <button onClick={onClose} className="text-sm font-semibold text-gray-600 hover:text-gray-900">
            Close
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto max-h-[65vh]">
          {isLoading && <p className="text-sm text-gray-600">Loading students…</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}

          {!isLoading && !error && students.length === 0 && (
            <p className="text-sm text-gray-600">No attendance records found for this date.</p>
          )}

          {!isLoading && !error &&
            statusOrder.map((status) => {
              const list = grouped[status] ?? [];
              if (list.length === 0) return null;

              const tone =
                status === "present"
                  ? "bg-green-50 text-green-800 border-green-100"
                  : status === "absent"
                    ? "bg-rose-50 text-rose-800 border-rose-100"
                    : "bg-amber-50 text-amber-800 border-amber-100";

              const label = status === "present" ? "Present" : status === "absent" ? "Absent" : "Late";

              return (
                <div key={status} className={`border rounded-xl ${tone}`}>
                  <div className="px-4 py-3 flex items-center justify-between">
                    <p className="text-sm font-semibold">{label}</p>
                    <span className="text-xs font-medium bg-white/60 px-2 py-1 rounded-full text-gray-700">{list.length}</span>
                  </div>
                  <div className="divide-y divide-gray-100 bg-white">
                    {list.map((student) => (
                      <div key={student.user_id} className="px-4 py-3 flex items-start justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{student.full_name}</p>
                          {student.email && <p className="text-xs text-gray-600">{student.email}</p>}
                        </div>
                        <span className="text-xs font-medium text-gray-700">{student.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
