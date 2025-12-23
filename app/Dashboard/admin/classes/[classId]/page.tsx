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
  teacher_id?: string | null;
  teacher_name?: string | null;
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

interface TeacherRow {
  user_id: string;
  full_name: string;
  email: string;
  languages_taught?: string[] | null;
  hourly_rate?: number | null;
  is_verified?: boolean | null;
}

export default function ClassStudentsPage() {
  const params = useParams<{ classId: string }>();
  const router = useRouter();
  const classId = params?.classId;

  const [authToken, setAuthToken] = useState<string>("");
  const [classInfo, setClassInfo] = useState<ClassDetail | null>(null);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [teacher, setTeacher] = useState<TeacherRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Assign students modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [availableStudents, setAvailableStudents] = useState<StudentRow[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);

  // Assign teacher modal
  const [showAssignTeacherModal, setShowAssignTeacherModal] = useState(false);
  const [availableTeachers, setAvailableTeachers] = useState<TeacherRow[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<string>("");
  const [teacherSearch, setTeacherSearch] = useState("");
  const [teacherLoading, setTeacherLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    const load = async () => {
      try {
        if (!classId) return;
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        if (!token) {
          router.push("/auth/admin");
          return;
        }

        setAuthToken(token);

        const res = await fetch(`/api/admin/classes/${classId}/students`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error || "Failed to load class");
        }

        const body = await res.json();
        if (!active) return;
        setClassInfo(body.class);
        setStudents(body.students || []);
        setTeacher(body.teacher || null);
        setError("");
      } catch (err: any) {
        if (!active) return;
        if (err.name === 'AbortError') return;
        setError(err?.message || "Failed to load class");
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
      controller.abort();
    };
  }, [classId, router]);

  const seatsInfo = useMemo(() => {
    const max = classInfo?.max_students ?? 0;
    const current = classInfo?.current_students ?? 0;
    const remaining = Math.max(max - current, 0);
    return { max, current, remaining };
  }, [classInfo]);

  const fetchAvailableStudents = async () => {
    try {
      setAssignLoading(true);
      setError("");
      const { data, error } = await supabase
        .from("student_users")
        .select("user_id, full_name, email, skill_level, timezone, native_language, target_languages")
        .is("class_id", null)
        .order("full_name", { ascending: true })
        .limit(100);
      
      if (error) throw error;
      setAvailableStudents(data || []);
    } catch (err: any) {
      setError(err?.message || "Failed to load available students");
    } finally {
      setAssignLoading(false);
    }
  };

  const fetchAvailableTeachers = async () => {
    try {
      setTeacherLoading(true);
      setError("");
      const { data, error } = await supabase
        .from("teacher_users")
        .select("user_id, full_name, email, languages_taught, hourly_rate, is_verified")
        .order("full_name", { ascending: true })
        .limit(100);

      if (error) throw error;
      setAvailableTeachers(data || []);
    } catch (err: any) {
      setError(err?.message || "Failed to load teachers");
    } finally {
      setTeacherLoading(false);
    }
  };

  const handleAssignStudents = async () => {
    if (!classId || selectedStudents.length === 0) return;
    
    try {
      setAssignLoading(true);
      setError("");
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        setError("You must be logged in as admin");
        return;
      }

      const assigningCount = selectedStudents.length;
      setShowAssignModal(false);
      setSelectedStudents([]);
      setStudentSearch("");

      const resp = await fetch("/api/admin/assign-students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          class_id: classId, 
          student_ids: selectedStudents 
        }),
      });

      if (!resp.ok) {
        const errorData = await resp.json();
        throw new Error(errorData.error || "Failed to assign students");
      }
      const res = await fetch(`/api/admin/classes/${classId}/students`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const body = await res.json();
        setClassInfo(body.class);
        setStudents(body.students || []);
        setSuccess(`Assigned ${assigningCount} student${assigningCount > 1 ? "s" : ""}`);
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to assign students");
    } finally {
      setAssignLoading(false);
    }
  };

  const handleAssignTeacher = async () => {
    if (!classId || !selectedTeacher) return;

    try {
      setTeacherLoading(true);
      setError("");
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        setError("You must be logged in as admin");
        return;
      }

      const resp = await fetch("/api/admin/assign-teacher", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ class_id: classId, teacher_id: selectedTeacher }),
      });

      if (!resp.ok) {
        const errorData = await resp.json();
        throw new Error(errorData.error || "Failed to assign teacher");
      }

      // Refresh class data
      const res = await fetch(`/api/admin/classes/${classId}/students`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const body = await res.json();
        setClassInfo(body.class);
        setStudents(body.students || []);
        setTeacher(body.teacher || null);
        setSuccess("Teacher assigned successfully");
        setTimeout(() => setSuccess(""), 3000);
      }

      setShowAssignTeacherModal(false);
      setSelectedTeacher("");
      setTeacherSearch("");
    } catch (err: any) {
      setError(err?.message || "Failed to assign teacher");
    } finally {
      setTeacherLoading(false);
    }
  };

  const handleUnassignTeacher = async () => {
    if (!classId || !teacher) return;
    
    if (!confirm("Are you sure you want to unassign this teacher?")) return;

    try {
      setTeacherLoading(true);
      setError("");
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        setError("You must be logged in as admin");
        return;
      }

      const resp = await fetch("/api/admin/unassign-teacher", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ class_id: classId }),
      });

      if (!resp.ok) {
        const errorData = await resp.json();
        throw new Error(errorData.error || "Failed to unassign teacher");
      }

      // Refresh class data
      const res = await fetch(`/api/admin/classes/${classId}/students`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const body = await res.json();
        setClassInfo(body.class);
        setStudents(body.students || []);
        setTeacher(body.teacher || null);
        setSuccess("Teacher unassigned successfully");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to unassign teacher");
    } finally {
      setTeacherLoading(false);
    }
  };

  const handleUnassignStudent = async (studentId: string) => {
    if (!classId) return;
    
    if (!confirm("Are you sure you want to unassign this student?")) return;

    try {
      setAssignLoading(true);
      setError("");
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        setError("You must be logged in as admin");
        return;
      }

      const resp = await fetch("/api/admin/remove-student", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ class_id: classId, student_id: studentId }),
      });

      if (!resp.ok) {
        const errorData = await resp.json();
        throw new Error(errorData.error || "Failed to unassign student");
      }

      // Refresh class data
      const res = await fetch(`/api/admin/classes/${classId}/students`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const body = await res.json();
        setClassInfo(body.class);
        setStudents(body.students || []);
        setSuccess("Student unassigned successfully");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to unassign student");
    } finally {
      setAssignLoading(false);
    }
  };

  const filteredAvailableStudents = useMemo(() => {
    if (!studentSearch) return availableStudents;
    const term = studentSearch.toLowerCase();
    return availableStudents.filter(s => 
      s.full_name.toLowerCase().includes(term) || 
      s.email.toLowerCase().includes(term)
    );
  }, [availableStudents, studentSearch]);

  const filteredTeachers = useMemo(() => {
    if (!teacherSearch) return availableTeachers;
    const term = teacherSearch.toLowerCase();
    return availableTeachers.filter((t) =>
      t.full_name.toLowerCase().includes(term) || t.email.toLowerCase().includes(term)
    );
  }, [availableTeachers, teacherSearch]);

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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Class Overview</h2>
            </div>

            <div className="flex flex-wrap gap-3 mb-2">
              <button
                onClick={() => {
                  setShowAssignModal(true);
                  fetchAvailableStudents();
                }}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:shadow-lg transition"
              >
                + Assign Students
              </button>
              <button
                onClick={() => {
                  setShowAssignTeacherModal(true);
                  fetchAvailableTeachers();
                }}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold hover:shadow-lg transition"
              >
                + Assign Teacher
              </button>
            </div>

            {success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                {success}
              </div>
            )}

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
              <div className="bg-gradient-to-br from-slate-50 to-gray-100 border border-gray-200 rounded-2xl p-4 lg:col-span-2">
                <p className="text-sm text-gray-600 mb-1">Teacher</p>
                {teacher ? (
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-gray-900">{teacher.full_name}</p>
                      <p className="text-sm text-gray-600">{teacher.email}</p>
                      {teacher.languages_taught && teacher.languages_taught.length > 0 && (
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {teacher.languages_taught.map((lang, idx) => (
                            <span key={`${lang}-${idx}`} className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-medium">
                              {lang}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${teacher.is_verified ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {teacher.is_verified ? "Verified" : "Pending"}
                      </span>
                      <button
                        onClick={handleUnassignTeacher}
                        disabled={teacherLoading}
                        className="px-3 py-1 rounded text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Unassign
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">No teacher assigned yet.</p>
                )}
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
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
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
                          <td className="px-6 py-4 text-sm">
                            <button
                              onClick={() => handleUnassignStudent(student.user_id)}
                              disabled={assignLoading}
                              className="px-3 py-1 rounded text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Unassign
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {showAssignModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50">
            <div className="relative w-full max-w-2xl bg-white rounded-2xl p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Assign Students</h2>
                  <p className="text-sm text-gray-600">
                    Available seats: {seatsInfo.remaining}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedStudents([]);
                    setStudentSearch("");
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>

              <input
                type="text"
                placeholder="Search by name or email..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
              />

              <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-xl">
                {assignLoading ? (
                  <div className="p-4 text-sm text-gray-500">Loading available students...</div>
                ) : filteredAvailableStudents.length === 0 ? (
                  <div className="p-4 text-sm text-gray-500">
                    {studentSearch ? "No students found" : "No available students"}
                  </div>
                ) : (
                  filteredAvailableStudents.map((student) => (
                    <label
                      key={student.user_id}
                      className="flex items-start gap-3 p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.user_id)}
                        onChange={(e) => {
                          setSelectedStudents((prev) =>
                            e.target.checked
                              ? [...prev, student.user_id]
                              : prev.filter((id) => id !== student.user_id)
                          );
                        }}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{student.full_name}</p>
                        <p className="text-xs text-gray-600">{student.email}</p>
                        <div className="flex gap-2 mt-1 flex-wrap">
                          {student.skill_level && (
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                              {student.skill_level}
                            </span>
                          )}
                          {student.timezone && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                              {student.timezone}
                            </span>
                          )}
                        </div>
                      </div>
                    </label>
                  ))
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleAssignStudents}
                  disabled={assignLoading || selectedStudents.length === 0 || selectedStudents.length > seatsInfo.remaining}
                  className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Assign {selectedStudents.length > 0 ? `(${selectedStudents.length})` : ""}
                </button>
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedStudents([]);
                    setStudentSearch("");
                  }}
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {showAssignTeacherModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50">
            <div className="relative w-full max-w-2xl bg-white rounded-2xl p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Assign Teacher</h2>
                  <p className="text-sm text-gray-600">
                    Select a teacher for this class.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowAssignTeacherModal(false);
                    setSelectedTeacher("");
                    setTeacherSearch("");
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>

              <input
                type="text"
                placeholder="Search by teacher name or email..."
                value={teacherSearch}
                onChange={(e) => setTeacherSearch(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
              />

              <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-xl">
                {teacherLoading ? (
                  <div className="p-4 text-sm text-gray-500">Loading teachers...</div>
                ) : filteredTeachers.length === 0 ? (
                  <div className="p-4 text-sm text-gray-500">
                    {teacherSearch ? "No teachers found" : "No teachers available"}
                  </div>
                ) : (
                  filteredTeachers.map((teacherRow) => (
                    <label
                      key={teacherRow.user_id}
                      className="flex items-start gap-3 p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="teacher"
                        checked={selectedTeacher === teacherRow.user_id}
                        onChange={() => setSelectedTeacher(teacherRow.user_id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{teacherRow.full_name}</p>
                        <p className="text-xs text-gray-600">{teacherRow.email}</p>
                        <div className="flex gap-2 mt-1 flex-wrap">
                          {teacherRow.languages_taught?.map((lang, idx) => (
                            <span key={`${lang}-${idx}`} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                              {lang}
                            </span>
                          ))}
                          {teacherRow.is_verified !== undefined && (
                            <span className={`px-2 py-0.5 rounded text-xs ${teacherRow.is_verified ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                              {teacherRow.is_verified ? "Verified" : "Pending"}
                            </span>
                          )}
                        </div>
                      </div>
                    </label>
                  ))
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleAssignTeacher}
                  disabled={teacherLoading || !selectedTeacher}
                  className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Assign Teacher
                </button>
                <button
                  onClick={() => {
                    setShowAssignTeacherModal(false);
                    setSelectedTeacher("");
                    setTeacherSearch("");
                  }}
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
