"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface Student {
  user_id: string;
  full_name: string;
  email: string;
  native_language: string | null;
  target_languages: string[] | null;
  skill_level: string | null;
  learning_goals: string | null;
  timezone: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
}

type LevelCounts = Record<string, number>;

export default function ManageStudentsPage() {
  const router = useRouter();

  const [students, setStudents] = useState<Student[]>([]);
  const [levelCounts, setLevelCounts] = useState<LevelCounts>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [skillFilter, setSkillFilter] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    native_language: "",
    target_languages: "",
    skill_level: "A1",
    learning_goals: "",
    timezone: "",
    phone: "",
  });

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          router.push("/auth/admin");
          return;
        }
        if (!active) return;
        setAccessToken(session.access_token);
        await fetchStudents(session.access_token);
      } catch (err: any) {
        if (!active) return;
        setError(err?.message || "Unable to load session");
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [router]);

  const fetchStudents = async (token?: string) => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/admin/students", {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "Failed to load students");
      }

      const body = await res.json();
      setStudents(body.students || []);
      setLevelCounts(body.stats?.byLevel || {});
      setSuccess("");
    } catch (err: any) {
      setError(err?.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (!editingId) {
        setError("No student selected for editing");
        return;
      }

      const { error: updateError } = await supabase
        .from("student_users")
        .update({
          full_name: formData.full_name,
          email: formData.email,
          native_language: formData.native_language,
          target_languages: formData.target_languages
            .split(",")
            .map((l) => l.trim())
            .filter(Boolean),
          skill_level: formData.skill_level,
          learning_goals: formData.learning_goals,
          timezone: formData.timezone,
          phone: formData.phone,
        })
        .eq("user_id", editingId);

      if (updateError) throw updateError;

      setShowForm(false);
      setEditingId(null);
      setFormData({
        full_name: "",
        email: "",
        native_language: "",
        target_languages: "",
        skill_level: "A1",
        learning_goals: "",
        timezone: "",
        phone: "",
      });
      setSuccess("Student updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
      await fetchStudents(accessToken || undefined);
    } catch (err) {
      console.error("Error saving student:", err);
      setError(err instanceof Error ? err.message : "Failed to save student");
    }
  };

  const handleEdit = (student: Student) => {
    setFormData({
      full_name: student.full_name,
      email: student.email,
      native_language: student.native_language || "",
      target_languages: student.target_languages?.join(", ") || "",
      skill_level: student.skill_level || "A1",
      learning_goals: student.learning_goals || "",
      timezone: student.timezone || "",
      phone: student.phone || "",
    });
    setEditingId(student.user_id);
    setShowForm(true);
  };

  const handleDelete = async (user_id: string) => {
    if (confirm("Are you sure you want to delete this student? This action cannot be undone.")) {
      try {
        const { error: deleteError } = await supabase
          .from("student_users")
          .delete()
          .eq("user_id", user_id);

        if (deleteError) throw deleteError;
        setSuccess("Student deleted successfully!");
        setTimeout(() => setSuccess(""), 3000);
        await fetchStudents(accessToken || undefined);
      } catch (err) {
        console.error("Error deleting student:", err);
        setError("Failed to delete student");
      }
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesText =
        student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLevel =
        skillFilter === "all" || (student.skill_level || "").toLowerCase() === skillFilter.toLowerCase();
      return matchesText && matchesLevel;
    });
  }, [students, searchTerm, skillFilter]);

  const skillLevels = ["A1", "A2", "B1", "B2", "C1", "C2"];

  return (
    <main className="bg-white text-gray-900 min-h-screen">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/Dashboard/admin" className="text-blue-600 hover:text-blue-700">
              ← Back to Admin
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Manage Students</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Bar */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search students by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            {success}
          </div>
        )}

        {/* Edit Form Modal */}
        {showForm && editingId && (
          <div className="mb-8 bg-gray-50 border border-gray-200 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Edit Student</h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Native Language
                  </label>
                  <input
                    type="text"
                    name="native_language"
                    value={formData.native_language}
                    onChange={handleInputChange}
                    placeholder="e.g., Arabic, French"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Languages (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="target_languages"
                    value={formData.target_languages}
                    onChange={handleInputChange}
                    placeholder="e.g., English, French, Spanish"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skill Level
                  </label>
                  <select
                    name="skill_level"
                    value={formData.skill_level}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
                  >
                    {skillLevels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timezone
                  </label>
                  <input
                    type="text"
                    name="timezone"
                    value={formData.timezone}
                    onChange={handleInputChange}
                    placeholder="e.g., GMT+1, EST"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Learning Goals
                  </label>
                  <textarea
                    name="learning_goals"
                    value={formData.learning_goals}
                    onChange={handleInputChange}
                    placeholder="What does the student want to achieve?"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:shadow-lg transition"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                  className="flex-1 px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Students Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading students...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {searchTerm ? "No students found matching your search" : "No students registered yet"}
              </p>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Native Language
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Target Languages
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Level
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Timezone
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr
                      key={student.user_id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {student.full_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {student.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {student.native_language || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex gap-2 flex-wrap">
                          {student.target_languages && student.target_languages.length > 0 ? (
                            Array.from(new Set(student.target_languages)).map((lang, idx) => (
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
                      <td className="px-6 py-4 text-sm">
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                          {student.skill_level || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {student.timezone || "-"}
                      </td>
                      <td className="px-6 py-4 text-right text-sm">
                        <button
                          onClick={() => handleEdit(student)}
                          className="text-blue-600 hover:text-blue-700 font-medium mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(student.user_id)}
                          className="text-red-600 hover:text-red-700 font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
            <p className="text-gray-600 text-sm mb-2">Total Students</p>
            <p className="text-4xl font-bold text-blue-600">{students.length}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
            <p className="text-gray-600 text-sm mb-2">Beginner (A1-A2)</p>
            <p className="text-4xl font-bold text-green-600">
              {students.filter((s) => ["A1", "A2"].includes(s.skill_level || "")).length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-2xl p-6">
            <p className="text-gray-600 text-sm mb-2">Advanced (B1+)</p>
            <p className="text-4xl font-bold text-orange-600">
              {students.filter((s) => !["A1", "A2"].includes(s.skill_level || "")).length}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
