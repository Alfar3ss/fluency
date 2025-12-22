"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface ClassItem {
  id: string;
  name: string;
  language: string;
  level: string;
  schedule: string | null;
  max_students: number;
  current_students: number;
  status: string;
  created_at: string;
}

interface StudentRow {
  user_id: string;
  full_name: string;
  email: string;
}

const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];

export default function ManageClassesPage() {

  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    language: "",
    level: "A1",
    schedule: "",
    max_students: 10,
    status: "Active",
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      setError("");

      const { data, error: fetchError } = await supabase
        .from("classes")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) {
        console.error("Supabase error details:", {
          message: fetchError.message,
          code: fetchError.code,
          details: fetchError.details,
          hint: fetchError.hint,
        });
        throw fetchError;
      }
      setClasses(data || []);
    } catch (err: any) {
      console.error("Error fetching classes:", err?.message || err);
      setError(`Failed to load classes: ${err?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "max_students" ? Number(value) : value,
    }));
  };

  const getToken = async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const token = await getToken();
      if (!token) {
        setError("You must be logged in as admin to perform this action.");
        return;
      }

      if (editingId) {
        const response = await fetch("/api/admin/update-class", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            class_id: editingId,
            name: formData.name,
            language: formData.language,
            level: formData.level,
            schedule: formData.schedule || null,
            max_students: formData.max_students || 0,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update class");
        }
      } else {
        const response = await fetch("/api/admin/create-class", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: formData.name,
            language: formData.language,
            level: formData.level,
            schedule: formData.schedule || null,
            max_students: formData.max_students || 10,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create class");
        }
      }

      setShowForm(false);
      setEditingId(null);
      setFormData({
        name: "",
        language: "",
        level: "A1",
        schedule: "",
        max_students: 10,
        status: "Active",
      });
      setSuccess(editingId ? "Class updated successfully!" : "Class created successfully!");
      setTimeout(() => setSuccess(""), 3000);
      await fetchClasses();
    } catch (err) {
      console.error("Error saving class:", err);
      setError(err instanceof Error ? err.message : "Failed to save class");
    }
  };

  const handleEdit = (classItem: ClassItem) => {
    setFormData({
      name: classItem.name,
      language: classItem.language,
      level: classItem.level || "A1",
      schedule: classItem.schedule || "",
      max_students: classItem.max_students || 10,
      status: classItem.status || "Active",
    });
    setEditingId(classItem.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this class? This cannot be undone.")) {
      try {
        const { error: deleteError } = await supabase.from("classes").delete().eq("id", id);
        if (deleteError) throw deleteError;
        setSuccess("Class deleted successfully!");
        setTimeout(() => setSuccess(""), 3000);
        await fetchClasses();
      } catch (err) {
        console.error("Error deleting class:", err);
        setError("Failed to delete class");
      }
    }
  };

  const filteredClasses = classes.filter((cls) =>
    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.language.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = useMemo(() => {
    const total = classes.length;
    const active = classes.filter((c) => c.status?.toLowerCase() === "active").length;
    const seats = classes.reduce((sum, c) => sum + (c.max_students || 0), 0);
    const enrolled = classes.reduce((sum, c) => sum + (c.current_students || 0), 0);
    const fillRate = seats ? Math.round((enrolled / seats) * 100) : 0;
    return { total, active, seats, enrolled, fillRate };
  }, [classes]);

  return (
    <main className="bg-white text-gray-900 min-h-screen">
      <div className="border-b border-gray-200 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/Dashboard/admin" className="text-blue-600 hover:text-blue-700">
              ← Back to Admin
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Manage Classes</h1>
          </div>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
              setFormData({
                name: "",
                language: "",
                level: "A1",
                schedule: "",
                max_students: 10,
                status: "Active",
              });
            }}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:shadow-lg transition"
          >
            + Add Class
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4">
            <p className="text-sm text-gray-600 mb-1">Total Classes</p>
            <p className="text-3xl font-bold text-blue-700">{stats.total}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4">
            <p className="text-sm text-gray-600 mb-1">Active Classes</p>
            <p className="text-3xl font-bold text-green-700">{stats.active}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-4">
            <p className="text-sm text-gray-600 mb-1">Total Seats</p>
            <p className="text-3xl font-bold text-orange-700">{stats.seats}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 border border-purple-200 rounded-2xl p-4">
            <p className="text-sm text-gray-600 mb-1">Filled ({stats.fillRate}%)</p>
            <p className="text-3xl font-bold text-purple-700">{stats.enrolled}</p>
          </div>
        </div>

        <div className="mb-8">
          <input
            type="text"
            placeholder="Search classes by name or language..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
          />
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            {success}
          </div>
        )}

        {showForm && (
          <div className="mb-8 bg-gray-50 border border-gray-200 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingId ? "Edit Class" : "Create New Class"}
              </h2>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                  <input
                    type="text"
                    name="language"
                    value={formData.language}
                    onChange={handleInputChange}
                    placeholder="e.g., English, French"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
                  >
                    {levels.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Students</label>
                  <input
                    type="number"
                    name="max_students"
                    value={formData.max_students}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
                    min={1}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Schedule</label>
                  <textarea
                    name="schedule"
                    value={formData.schedule}
                    onChange={handleInputChange}
                    placeholder="e.g., Mondays & Wednesdays, 6-7pm GMT"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
                    rows={2}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:shadow-lg transition"
                >
                  Save Class
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

        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading classes...</p>
            </div>
          ) : filteredClasses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {searchTerm ? "No classes found matching your search" : "No classes created yet"}
              </p>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Language</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Level</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Schedule</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Seats</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Enrolled</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClasses.map((cls) => (
                    <tr key={cls.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{cls.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{cls.language}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                          {cls.level}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {cls.schedule || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {cls.max_students ?? 0}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {cls.current_students ?? 0}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            cls.status?.toLowerCase() === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {cls.status || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm">
                        <button
                          onClick={() => handleEdit(cls)}
                          className="text-blue-600 hover:text-blue-700 font-medium mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(cls.id)}
                          className="text-red-600 hover:text-red-700 font-medium"
                        >
                          Delete
                        </button>
                        <Link
                          href={`/Dashboard/admin/classes/${cls.id}`}
                          className="text-indigo-600 hover:text-indigo-700 font-medium ml-4"
                        >
                          Students List
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
