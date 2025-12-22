"use client";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

// Force dynamic rendering - prevent static generation at build time
export const dynamic = 'force-dynamic';

const PASSWORD_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789";

function generatePassword(length = 8) {
  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += PASSWORD_CHARS[Math.floor(Math.random() * PASSWORD_CHARS.length)];
  }
  return out;
}

function barWidth(count: number, max: number) {
  return `${Math.min(100, Math.round((count / max) * 100))}%`;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  // Create supabase client inside component to prevent issues during build
  const supabase = useMemo(() => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  ), []);
  const [adminName, setAdminName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsData, setStatsData] = useState({
    totalStudents: 0,
    waiting: 0,
    classesActive: 0,
    teachersActive: 0,
    alerts: 0,
  });
  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const [savingTeacher, setSavingTeacher] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [showCreateClass, setShowCreateClass] = useState(false);
  const [savingClass, setSavingClass] = useState(false);
  const [classFormError, setClassFormError] = useState("");
  const [classFormSuccess, setClassFormSuccess] = useState("");
  const [classForm, setClassForm] = useState({
    name: "",
    language: "",
    level: "",
    schedule: "",
    max_students: "10",
  });
  const [teacherForm, setTeacherForm] = useState({
    full_name: "",
    email: "",
    languages: "",
    levels: "",
    hourly_rate: "",
    password: generatePassword(),
  });
  const [waitingPool, setWaitingPool] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [editingClass, setEditingClass] = useState<any>(null);
  const [editingClassForm, setEditingClassForm] = useState({ name: "", language: "", level: "", schedule: "", max_students: "10" });
  const [savingEditClass, setSavingEditClass] = useState(false);
  const [editClassError, setEditClassError] = useState("");
  const [assigningClass, setAssigningClass] = useState<any>(null);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [assigningStudents, setAssigningStudents] = useState(false);
  const [assignError, setAssignError] = useState("");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [studentActionModal, setStudentActionModal] = useState<{ type: 'assign' | 'move' | null, student: any }>({ type: null, student: null });
  const [selectedClassForStudent, setSelectedClassForStudent] = useState<string>("");
  const [savingStudentAction, setSavingStudentAction] = useState(false);
  const [studentActionError, setStudentActionError] = useState("");
  const [assigningTeacherModal, setAssigningTeacherModal] = useState<any>(null);
  const [selectedClassForTeacher, setSelectedClassForTeacher] = useState<string>("");
  const [savingTeacherAssignment, setSavingTeacherAssignment] = useState(false);
  const [teacherAssignmentError, setTeacherAssignmentError] = useState("");

  const fetchDashboardData = useCallback(
    async (token?: string) => {
      setStatsLoading(true);
      setDataLoading(true);
      try {
        const res = await fetch("/api/admin/dashboard", {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (res.status === 401 || res.status === 403) {
          setError("Unauthorized. Admin access required.");
          setStatsLoading(false);
          setDataLoading(false);
          return;
        }

        const payload = await res.json();

        setAdminName(payload.admin?.full_name || "Admin");
        setStatsData(payload.stats ?? statsData);
        setWaitingPool(payload.waitingPool ?? []);
        setClasses(payload.classes ?? []);
        setStudents((payload.students ?? []).map((s: any) => ({ ...s, id: s.user_id || s.id })));
        setTeachers((payload.teachers ?? []).map((t: any) => ({ ...t, id: t.user_id || t.id })));
        setStatsLoading(false);
        setDataLoading(false);
      } catch (err: any) {
        console.error("Dashboard fetch error:", err);
        setError(err?.message || "Unable to load dashboard data.");
        setStatsLoading(false);
        setDataLoading(false);
      }
    },
    [statsData]
  );

  useEffect(() => {
    let active = true;
    const run = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          router.push("/auth/admin");
          return;
        }

        if (!active) return;
        setSession(session);
        setAccessToken(session.access_token || null);

        await fetchDashboardData(session.access_token || undefined);
        if (active) setLoading(false);
      } catch (err: any) {
        if (!active) return;
        setError(err?.message || "Unable to load admin session.");
        setLoading(false);
      }
    };

    run();
    return () => {
      active = false;
    };
  }, [router, supabase, fetchDashboardData]);

  const openAddTeacher = useCallback(() => {
    setTeacherForm({
      full_name: "",
      email: "",
      languages: "",
      levels: "",
      hourly_rate: "",
      password: generatePassword(),
    });
    setFormError("");
    setShowAddTeacher(true);
  }, []);

  const openCreateClass = useCallback(() => {
    setClassForm({
      name: "",
      language: "",
      level: "",
      schedule: "",
      max_students: "10",
    });
    setClassFormError("");
    setClassFormSuccess("");
    setShowCreateClass(true);
  }, []);

  const updateClassField = useCallback((field: keyof typeof classForm, value: string) => {
    setClassForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const updateField = useCallback((field: keyof typeof teacherForm, value: string) => {
    setTeacherForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const openEditClass = useCallback((classData: any) => {
    setEditingClass(classData);
    setEditingClassForm({
      name: classData.name || "",
      language: classData.language || "",
      level: classData.level || "",
      schedule: classData.schedule || "",
      max_students: String(classData.max_students) || "10",
    });
    setEditClassError("");
  }, []);

  const handleEditClass = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingClass) return;

    setSavingEditClass(true);
    setEditClassError("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch("/api/admin/update-class", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          class_id: editingClass.id,
          name: editingClassForm.name,
          language: editingClassForm.language,
          level: editingClassForm.level,
          schedule: editingClassForm.schedule,
          max_students: parseInt(editingClassForm.max_students) || 10,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to update class");
      }

      // Refetch classes
      const { data: classesData } = await supabase.from("classes").select("*");
      setClasses(classesData || []);
      setEditingClass(null);
    } catch (err: any) {
      setEditClassError(err?.message || "Unable to update class.");
    } finally {
      setSavingEditClass(false);
    }
  };

  const openAssignStudents = useCallback((classData: any) => {
    setAssigningClass(classData);
    setSelectedStudents([]);
    setAssignError("");
  }, []);

  const handleAssignStudents = async () => {
    if (!assigningClass || selectedStudents.length === 0) return;

    setAssigningStudents(true);
    setAssignError("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch("/api/admin/assign-students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          class_id: assigningClass.id,
          student_ids: selectedStudents,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to assign students");
      }

      // Refresh dashboard data
      await fetchDashboardData(token);
      setAssigningClass(null);
      setSelectedStudents([]);
    } catch (err: any) {
      setAssignError(err?.message || "Unable to assign students.");
    } finally {
      setAssigningStudents(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowProfileModal(false);
    router.push("/auth/admin");
  };

  const copyEmail = () => {
    if (session?.user?.email) {
      navigator.clipboard.writeText(session.user.email);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const openAssignStudentModal = useCallback((student: any) => {
    setStudentActionModal({ type: 'assign', student });
    setSelectedClassForStudent("");
    setStudentActionError("");
  }, []);

  const openMoveStudentModal = useCallback((student: any) => {
    setStudentActionModal({ type: 'move', student });
    setSelectedClassForStudent(student.class_id || "");
    setStudentActionError("");
  }, []);

  const handleAssignOrMoveStudent = async () => {
    if (!studentActionModal.student || !selectedClassForStudent) return;

    setSavingStudentAction(true);
    setStudentActionError("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch("/api/admin/assign-student", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          student_id: studentActionModal.student.id,
          class_id: selectedClassForStudent,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to assign student");
      }

      // Refresh dashboard data
      await fetchDashboardData(token);
      setStudentActionModal({ type: null, student: null });
    } catch (err: any) {
      setStudentActionError(err?.message || "Unable to assign student.");
    } finally {
      setSavingStudentAction(false);
    }
  };

  const handleMarkStudentInactive = async (student: any) => {
    if (!student) return;

    setSavingStudentAction(true);
    setStudentActionError("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch("/api/admin/mark-student-inactive", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          student_id: student.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to mark student inactive");
      }

      // Refresh dashboard data
      await fetchDashboardData(token);
    } catch (err: any) {
      alert(err?.message || "Unable to mark student inactive.");
    } finally {
      setSavingStudentAction(false);
    }
  };

  const openAssignTeacherModal = useCallback((teacher: any) => {
    setAssigningTeacherModal(teacher);
    setSelectedClassForTeacher("");
    setTeacherAssignmentError("");
  }, []);

  const handleAssignTeacherToClass = async () => {
    if (!assigningTeacherModal || !selectedClassForTeacher) return;

    setSavingTeacherAssignment(true);
    setTeacherAssignmentError("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch("/api/admin/assign-teacher", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          teacher_id: assigningTeacherModal.id,
          class_id: selectedClassForTeacher,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to assign teacher");
      }

      // Refresh dashboard data
      await fetchDashboardData(token);
      setAssigningTeacherModal(null);
    } catch (err: any) {
      setTeacherAssignmentError(err?.message || "Unable to assign teacher.");
    } finally {
      setSavingTeacherAssignment(false);
    }
  };

  
  if (error) {
    return (
      <main className="bg-[#f3f6f8] min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow p-6 space-y-3 text-center">
          <div className="text-red-600 font-semibold">{error}</div>
          <button
            className="w-full py-3 rounded-xl bg-[#127db2] text-white font-semibold hover:brightness-95"
            onClick={() => router.push("/auth/admin")}
          >
            Go to admin login
          </button>
        </div>
      </main>
    );
  }

  const statsCards = [
    { label: "Total students", value: statsLoading ? "…" : String(statsData.totalStudents), color: "bg-[#e6f4ff] text-[#127db2]" },
    { label: "Waiting for class", value: statsLoading ? "…" : String(statsData.waiting), color: "bg-[#fff5ef] text-[#f1753d]" },
    { label: "Classes active", value: statsLoading ? "…" : String(statsData.classesActive), color: "bg-emerald-50 text-emerald-700" },
    { label: "Teachers active", value: statsLoading ? "…" : String(statsData.teachersActive), color: "bg-blue-50 text-[#127db2]" },
    { label: "Alerts", value: statsLoading ? "…" : String(statsData.alerts), color: "bg-amber-50 text-amber-700" },
  ];

  const handleTeacherSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!teacherForm.full_name || !teacherForm.email) {
      setFormError("Name and email are required.");
      return;
    }

    setSavingTeacher(true);
    setFormError("");
    setFormSuccess("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch("/api/admin/create-teacher", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          full_name: teacherForm.full_name,
          email: teacherForm.email,
          password: teacherForm.password,
          languages: teacherForm.languages,
          levels: teacherForm.levels,
          hourly_rate: teacherForm.hourly_rate,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to create teacher");
      }

      setFormSuccess("Teacher created successfully.");
      
      // Refresh dashboard data
      await fetchDashboardData(token);

      // Reset form for adding another teacher
      setTeacherForm((prev) => ({
        ...prev,
        full_name: "",
        email: "",
        languages: "",
        levels: "",
        hourly_rate: "",
        password: generatePassword(),
      }));
    } catch (err: any) {
      setFormError(err?.message || "Unable to save teacher.");
    } finally {
      setSavingTeacher(false);
    }
  };

  const handleCreateClass = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!classForm.name || !classForm.language || !classForm.level) {
      setClassFormError("Name, language, and level are required.");
      return;
    }

    setSavingClass(true);
    setClassFormError("");
    setClassFormSuccess("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch("/api/admin/create-class", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: classForm.name,
          language: classForm.language,
          level: classForm.level,
          schedule: classForm.schedule,
          max_students: parseInt(classForm.max_students) || 10,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to create class");
      }

      setClassFormSuccess("Class created successfully.");
      
      // Refresh dashboard data
      await fetchDashboardData(token);

      // Reset form
      setClassForm({
        name: "",
        language: "",
        level: "",
        schedule: "",
        max_students: "10",
      });
    } catch (err: any) {
      setClassFormError(err?.message || "Unable to create class.");
    } finally {
      setSavingClass(false);
    }
  };

  return (
    <main className="bg-[#f3f6f8] min-h-screen py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Admin Header with Profile Icon */}
        <div className="flex items-center justify-between bg-white rounded-3xl shadow-xl p-6">
          <div>
            <p className="text-sm text-gray-500">Admin overview</p>
            <h1 className="text-2xl font-bold text-[#127db2]">Control room</h1>
            <p className="text-sm text-gray-600">Welcome, {adminName || "Admin"}. Balance classes, monitor quality, scale operations.</p>
          </div>
          
        </div>

        {/* Overview */}
        <section className="bg-white rounded-3xl shadow-xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-sm text-gray-500">Key metrics</p>
              <h2 className="text-xl font-bold text-[#127db2]">Dashboard</h2>
            </div>
            <div className="flex gap-2">
              <button
                className="px-4 py-2 rounded-xl bg-[#127db2] text-white font-semibold shadow hover:brightness-95"
                onClick={openCreateClass}
              >
                Create class
              </button>
              <button
                className="px-4 py-2 rounded-xl border border-gray-200 font-semibold text-gray-700 hover:border-[#127db2]"
                onClick={openAddTeacher}
              >
                Add teacher
              </button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {statsCards.map((s) => (
              <div key={s.label} className={`rounded-2xl p-4 border border-gray-100 ${s.color}`}>
                <p className="text-xs opacity-80">{s.label}</p>
                <p className="text-xl font-bold">{s.value}</p>
              </div>
            ))}
          </div>
        </section>

     

        {/* Classes management */}
        <section className="bg-white rounded-3xl shadow-xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <p className="text-sm text-gray-500">Classes management</p>
              <h3 className="text-xl font-bold text-[#127db2]">Backbone</h3>
            </div>
            <button className="px-4 py-2 rounded-xl bg-[#f1753d] text-white font-semibold shadow hover:brightness-95" onClick={openCreateClass}>New class</button>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {dataLoading ? (
              <div className="col-span-3 text-center py-8 text-gray-500">Loading...</div>
            ) : classes.length === 0 ? (
              <div className="col-span-3 text-center py-8 text-gray-500">No classes yet</div>
            ) : (
              classes.map((c) => (
                <div key={c.id || c.name} className="rounded-2xl border border-gray-100 p-4 shadow-sm bg-white hover:shadow-md transition">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-gray-500">{c.language || "Language"} · {c.level || "Level"}</p>
                      <p className="font-semibold text-gray-800">{c.name || `${c.language} ${c.level} Class`}</p>
                      <p className="text-sm text-gray-500">{c.schedule || "Schedule TBD"}</p>
                    </div>
                    <span className="text-xs px-3 py-1 rounded-full bg-[#e6f4ff] text-[#127db2] border border-white/50">{c.status || "Active"}</span>
                  </div>
                  <div className="mt-3 text-sm text-gray-700">Students: <span className="font-semibold text-[#127db2]">{c.current_students || 0}/{c.max_students || 10}</span></div>
                  <div className="text-sm text-gray-700">Teacher: {c.teacher_name || "Unassigned"}</div>
                  <div className="mt-3 flex gap-2">
                    <button className="flex-1 py-2 rounded-xl font-semibold bg-[#127db2] text-white hover:brightness-95" onClick={() => openAssignStudents(c)}>Assign students</button>
                    <button className="flex-1 py-2 rounded-xl font-semibold border border-gray-200 text-gray-700 hover:border-[#127db2]" onClick={() => openEditClass(c)}>Edit</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Students management */}
        <section className="bg-white rounded-3xl shadow-xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <p className="text-sm text-gray-500">Students management</p>
              <h3 className="text-xl font-bold text-[#127db2]">Assign and move</h3>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:border-[#127db2]">Export CSV</button>
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-gray-100">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-4 py-3">Name</th>
                  <th className="text-left px-4 py-3">Language</th>
                  <th className="text-left px-4 py-3">Level</th>
                  <th className="text-left px-4 py-3">Placement</th>
                  <th className="text-left px-4 py-3">Class</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dataLoading ? (
                  <tr><td colSpan={7} className="text-center py-8 text-gray-500">Loading...</td></tr>
                ) : students.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-8 text-gray-500">No students yet</td></tr>
                ) : (
                  students.map((s) => (
                    <tr key={s.id || s.email} className="bg-white">
                      <td className="px-4 py-3 font-semibold text-gray-800">{s.full_name || s.email}</td>
                      <td className="px-4 py-3 text-gray-700">{s.language || "—"}</td>
                      <td className="px-4 py-3 text-gray-700">{s.level || "—"}</td>
                      <td className="px-4 py-3 text-gray-700">{s.placement_level || "—"}</td>
                      <td className="px-4 py-3 text-gray-700">{s.class_name || "Waiting"}</td>
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${s.class_id ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                          {s.class_id ? "Active" : "Waiting"}
                        </span>
                      </td>
                      <td className="px-4 py-3 flex flex-wrap gap-2">
                        <button 
                          onClick={() => openAssignStudentModal(s)}
                          className="px-3 py-1 rounded-lg bg-[#127db2] text-white text-xs font-semibold hover:brightness-95"
                        >
                          {s.class_id ? "Change" : "Assign"}
                        </button>
                        {s.class_id && (
                          <button 
                            onClick={() => openMoveStudentModal(s)}
                            className="px-3 py-1 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:border-[#127db2]"
                          >
                            Move
                          </button>
                        )}
                        <button 
                          onClick={() => handleMarkStudentInactive(s)}
                          className="px-3 py-1 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:border-[#127db2]"
                        >
                          Mark inactive
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Teachers management */}
        <section className="bg-white rounded-3xl shadow-xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <p className="text-sm text-gray-500">Teachers management</p>
              <h3 className="text-xl font-bold text-[#127db2]">Assign teachers</h3>
            </div>
            <button
              className="px-4 py-2 rounded-xl bg-[#127db2] text-white font-semibold shadow hover:brightness-95"
              onClick={openAddTeacher}
            >
              Add teacher
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {dataLoading ? (
              <div className="col-span-2 text-center py-8 text-gray-500">Loading...</div>
            ) : teachers.length === 0 ? (
              <div className="col-span-2 text-center py-8 text-gray-500">No teachers yet</div>
            ) : (
              teachers.map((t) => (
                <div key={t.id || t.email} className="rounded-2xl border border-gray-100 p-4 bg-white shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-800">{t.full_name || t.email}</p>
                      <p className="text-xs text-gray-500">Languages: {Array.isArray(t.languages_taught) ? t.languages_taught.join(", ") : t.languages_taught || "—"}</p>
                      <p className="text-xs text-gray-500">Levels: {t.qualifications || "—"}</p>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full ${t.is_verified ? "bg-emerald-50 text-emerald-700" : "bg-gray-200 text-gray-700"}`}>
                      {t.is_verified ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">Rate: ${t.hourly_rate || "—"}/hr</p>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => openAssignTeacherModal(t)} className="px-3 py-2 rounded-xl bg-[#127db2] text-white text-xs font-semibold hover:brightness-95">Assign class</button>
                    <button className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:border-[#127db2]">Set max</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {showCreateClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => !savingClass && setShowCreateClass(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-gray-500">Create class</p>
                <h3 className="text-xl font-bold text-[#127db2]">New cohort</h3>
              </div>
              <button
                type="button"
                className="text-sm text-gray-500 hover:text-gray-700"
                onClick={() => !savingClass && setShowCreateClass(false)}
              >
                Close
              </button>
            </div>

            {classFormError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-xl">
                {classFormError}
              </div>
            )}
            {classFormSuccess && (
              <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-xl">
                {classFormSuccess}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleCreateClass}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700">Class name</label>
                  <input
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-[#127db2] focus:outline-none"
                    value={classForm.name}
                    onChange={(e) => updateClassField("name", e.target.value)}
                    placeholder="e.g. English B1 – Group 3"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700">Language</label>
                  <input
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-[#127db2] focus:outline-none"
                    value={classForm.language}
                    onChange={(e) => updateClassField("language", e.target.value)}
                    placeholder="English"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700">Level</label>
                  <input
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-[#127db2] focus:outline-none"
                    value={classForm.level}
                    onChange={(e) => updateClassField("level", e.target.value)}
                    placeholder="A1"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700">Schedule</label>
                  <input
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-[#127db2] focus:outline-none"
                    value={classForm.schedule}
                    onChange={(e) => updateClassField("schedule", e.target.value)}
                    placeholder="Mon & Wed · 6:00 PM"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-semibold text-gray-700">Max students</label>
                  <input
                    type="number"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-[#127db2] focus:outline-none"
                    value={classForm.max_students}
                    onChange={(e) => updateClassField("max_students", e.target.value)}
                    min="1"
                    max="50"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl border border-gray-200 font-semibold text-gray-700 hover:border-[#127db2]"
                  onClick={() => !savingClass && setShowCreateClass(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingClass}
                  className="px-4 py-2 rounded-xl bg-[#127db2] text-white font-semibold shadow hover:brightness-95 disabled:opacity-60"
                >
                  {savingClass ? "Creating…" : "Create class"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => !savingTeacher && setShowAddTeacher(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-gray-500">Add teacher</p>
                <h3 className="text-xl font-bold text-[#127db2]">Create account</h3>
              </div>
              <button
                type="button"
                className="text-sm text-gray-500 hover:text-gray-700"
                onClick={() => !savingTeacher && setShowAddTeacher(false)}
              >
                Close
              </button>
            </div>

            {formError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-xl">
                {formError}
              </div>
            )}
            {formSuccess && (
              <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-xl">
                {formSuccess}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleTeacherSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700">Full name</label>
                  <input
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-[#127db2] focus:outline-none"
                    value={teacherForm.full_name}
                    onChange={(e) => updateField("full_name", e.target.value)}
                    placeholder="e.g. Emily Carter"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700">Email</label>
                  <input
                    type="email"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-[#127db2] focus:outline-none"
                    value={teacherForm.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="name@school.com"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700">Languages</label>
                  <input
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-[#127db2] focus:outline-none"
                    value={teacherForm.languages}
                    onChange={(e) => updateField("languages", e.target.value)}
                    placeholder="English, French"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700">Levels</label>
                  <input
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-[#127db2] focus:outline-none"
                    value={teacherForm.levels}
                    onChange={(e) => updateField("levels", e.target.value)}
                    placeholder="A1-B2"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700">Hourly rate (optional)</label>
                  <input
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-[#127db2] focus:outline-none"
                    value={teacherForm.hourly_rate}
                    onChange={(e) => updateField("hourly_rate", e.target.value)}
                    placeholder="30"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700">Password</label>
                  <div className="flex gap-2">
                    <input
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-[#127db2] focus:outline-none"
                      value={teacherForm.password}
                      onChange={(e) => updateField("password", e.target.value)}
                      minLength={8}
                    />
                    <button
                      type="button"
                      className="px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:border-[#127db2]"
                      onClick={() => updateField("password", generatePassword())}
                    >
                      Regenerate
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">Prefilled with 8 characters; edit if needed.</p>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl border border-gray-200 font-semibold text-gray-700 hover:border-[#127db2]"
                  onClick={() => !savingTeacher && setShowAddTeacher(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingTeacher}
                  className="px-4 py-2 rounded-xl bg-[#127db2] text-white font-semibold shadow hover:brightness-95 disabled:opacity-60"
                >
                  {savingTeacher ? "Saving…" : "Save teacher"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => !savingEditClass && setEditingClass(null)} />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-gray-500">Edit class</p>
                <h3 className="text-xl font-bold text-[#127db2]">Update details</h3>
              </div>
              <button
                type="button"
                className="text-sm text-gray-500 hover:text-gray-700"
                onClick={() => !savingEditClass && setEditingClass(null)}
              >
                Close
              </button>
            </div>

            {editClassError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-xl">
                {editClassError}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleEditClass}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700">Class name</label>
                  <input
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-[#127db2] focus:outline-none"
                    value={editingClassForm.name}
                    onChange={(e) => setEditingClassForm({ ...editingClassForm, name: e.target.value })}
                    placeholder="e.g. English B1 – Group 3"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700">Language</label>
                  <input
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-[#127db2] focus:outline-none"
                    value={editingClassForm.language}
                    onChange={(e) => setEditingClassForm({ ...editingClassForm, language: e.target.value })}
                    placeholder="English"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700">Level</label>
                  <input
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-[#127db2] focus:outline-none"
                    value={editingClassForm.level}
                    onChange={(e) => setEditingClassForm({ ...editingClassForm, level: e.target.value })}
                    placeholder="A1"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700">Schedule</label>
                  <input
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-[#127db2] focus:outline-none"
                    value={editingClassForm.schedule}
                    onChange={(e) => setEditingClassForm({ ...editingClassForm, schedule: e.target.value })}
                    placeholder="Mon & Wed · 6:00 PM"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-semibold text-gray-700">Max students</label>
                  <input
                    type="number"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-[#127db2] focus:outline-none"
                    value={editingClassForm.max_students}
                    onChange={(e) => setEditingClassForm({ ...editingClassForm, max_students: e.target.value })}
                    min="1"
                    max="50"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl border border-gray-200 font-semibold text-gray-700 hover:border-[#127db2]"
                  onClick={() => !savingEditClass && setEditingClass(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEditClass}
                  className="px-4 py-2 rounded-xl bg-[#127db2] text-white font-semibold shadow hover:brightness-95 disabled:opacity-60"
                >
                  {savingEditClass ? "Updating…" : "Update class"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {assigningClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => !assigningStudents && setAssigningClass(null)} />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-gray-500">Assign students</p>
                <h3 className="text-xl font-bold text-[#127db2]">{assigningClass.name}</h3>
              </div>
              <button
                type="button"
                className="text-sm text-gray-500 hover:text-gray-700"
                onClick={() => !assigningStudents && setAssigningClass(null)}
              >
                Close
              </button>
            </div>

            {assignError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-xl">
                {assignError}
              </div>
            )}

            <div className="space-y-3 max-h-96 overflow-y-auto">
              <p className="text-sm text-gray-600">Select students to assign to this class:</p>
              {students.filter(s => !s.class_id).length === 0 ? (
                <div className="text-center py-6 text-gray-500 text-sm">All students are already assigned to classes</div>
              ) : (
                students
                  .filter(s => !s.class_id)
                  .map((s) => (
                    <label key={s.id || s.email} className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(s.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStudents([...selectedStudents, s.id]);
                          } else {
                            setSelectedStudents(selectedStudents.filter(id => id !== s.id));
                          }
                        }}
                        className="w-4 h-4 rounded"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-gray-800">{s.full_name || s.email}</p>
                        <p className="text-xs text-gray-500">{s.language} · {s.level}</p>
                      </div>
                    </label>
                  ))
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="px-4 py-2 rounded-xl border border-gray-200 font-semibold text-gray-700 hover:border-[#127db2]"
                onClick={() => !assigningStudents && setAssigningClass(null)}
              >
                Cancel
              </button>
              <button
                onClick={handleAssignStudents}
                disabled={assigningStudents || selectedStudents.length === 0}
                className="px-4 py-2 rounded-xl bg-[#127db2] text-white font-semibold shadow hover:brightness-95 disabled:opacity-60"
              >
                {assigningStudents ? "Assigning…" : `Assign ${selectedStudents.length} student${selectedStudents.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fadein" onClick={() => setShowProfileModal(false)}>
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 animate-scaleup" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Admin Profile</h2>
              <button
                onClick={() => setShowProfileModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col items-center gap-4 mb-6">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white font-bold text-xl">
                {getInitials(adminName || "Admin")}
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-gray-800">{adminName || "Admin"}</p>
                <p className="text-sm text-gray-500">Administrator</p>
              </div>
            </div>

            <div className="space-y-4 mb-6 bg-gray-50 p-4 rounded-2xl">
              <div>
                <p className="text-xs text-gray-600 font-semibold mb-1">Email</p>
                <p className="text-sm text-gray-800 break-all">{session?.user?.email}</p>
              </div>

              <div>
                <p className="text-xs text-gray-600 font-semibold mb-1">Role</p>
                <p className="text-sm text-gray-800">System Administrator</p>
              </div>

              <div>
                <p className="text-xs text-gray-600 font-semibold mb-1">Member Since</p>
                <p className="text-sm text-gray-800">
                  {session?.user?.created_at ? new Date(session.user.created_at).toLocaleDateString() : "N/A"}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={copyEmail}
                className="w-full px-4 py-3 rounded-xl border border-[#127db2] text-[#127db2] font-semibold hover:bg-blue-50 transition"
              >
                Copy Email
              </button>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition"
              >
                Logout
              </button>
            </div>
          </div>
          <style jsx global>{`
            @keyframes fadein {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes scaleup {
              from { transform: scale(0.95); opacity: 0; }
              to { transform: scale(1); opacity: 1; }
            }
            .animate-fadein {
              animation: fadein 0.2s ease-out;
            }
            .animate-scaleup {
              animation: scaleup 0.2s ease-out;
            }
          `}</style>
        </div>
      )}

      {studentActionModal.type && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => !savingStudentAction && setStudentActionModal({ type: null, student: null })} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-gray-500">
                  {studentActionModal.type === "assign" ? "Assign student" : "Move student"}
                </p>
                <h3 className="text-xl font-bold text-[#127db2]">
                  {studentActionModal.student?.name || studentActionModal.student?.email}
                </h3>
              </div>
              <button
                type="button"
                className="text-sm text-gray-500 hover:text-gray-700"
                onClick={() => !savingStudentAction && setStudentActionModal({ type: null, student: null })}
              >
                Close
              </button>
            </div>

            {studentActionError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-xl">
                {studentActionError}
              </div>
            )}

            <div className="space-y-3">
              {studentActionModal.type === "move" && studentActionModal.student?.class_id && (
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-600 font-semibold mb-1">Current class</p>
                  <p className="text-sm text-gray-800">
                    {classes.find(c => c.id === studentActionModal.student?.class_id)?.name || "Unknown"}
                  </p>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Select class</label>
                <select
                  value={selectedClassForStudent || ""}
                  onChange={(e) => setSelectedClassForStudent(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-[#127db2] focus:outline-none text-sm"
                >
                  <option value="">-- Choose a class --</option>
                  {classes
                    .filter(c => c.id !== studentActionModal.student?.class_id)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.language} - {c.level})
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="px-4 py-2 rounded-xl border border-gray-200 font-semibold text-gray-700 hover:border-[#127db2]"
                onClick={() => !savingStudentAction && setStudentActionModal({ type: null, student: null })}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAssignOrMoveStudent}
                disabled={savingStudentAction || !selectedClassForStudent}
                className="px-4 py-2 rounded-xl bg-[#127db2] text-white font-semibold shadow hover:brightness-95 disabled:opacity-60"
              >
                {savingStudentAction ? "Saving…" : studentActionModal.type === "assign" ? "Assign" : "Move"}
              </button>
            </div>
          </div>
        </div>
      )}

      {assigningTeacherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => !savingTeacherAssignment && setAssigningTeacherModal(null)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-gray-500">Assign teacher</p>
                <h3 className="text-xl font-bold text-[#127db2]">
                  {assigningTeacherModal?.full_name || assigningTeacherModal?.email}
                </h3>
              </div>
              <button
                type="button"
                className="text-sm text-gray-500 hover:text-gray-700"
                onClick={() => !savingTeacherAssignment && setAssigningTeacherModal(null)}
              >
                Close
              </button>
            </div>

            {teacherAssignmentError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-xl">
                {teacherAssignmentError}
              </div>
            )}

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Select class</label>
                <select
                  value={selectedClassForTeacher || ""}
                  onChange={(e) => setSelectedClassForTeacher(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-[#127db2] focus:outline-none text-sm"
                >
                  <option value="">-- Choose a class --</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.language} - {c.level})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="px-4 py-2 rounded-xl border border-gray-200 font-semibold text-gray-700 hover:border-[#127db2]"
                onClick={() => !savingTeacherAssignment && setAssigningTeacherModal(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAssignTeacherToClass}
                disabled={savingTeacherAssignment || !selectedClassForTeacher}
                className="px-4 py-2 rounded-xl bg-[#127db2] text-white font-semibold shadow hover:brightness-95 disabled:opacity-60"
              >
                {savingTeacherAssignment ? "Assigning…" : "Assign"}
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}