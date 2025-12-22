"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface Teacher {
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  bio: string;
  languages_taught: string[];
  experience_years: number;
  qualifications: string;
  hourly_rate: number;
  availability: string;
  timezone: string;
  avatar_url: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export default function ManageTeachersPage() {
  const router = useRouter();

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
    bio: "",
    languages_taught: "",
    experience_years: 0,
    qualifications: "",
    hourly_rate: 0,
    availability: "",
    timezone: "",
  });

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("teacher_users")
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
      setTeachers(data || []);
    } catch (err: any) {
      console.error("Error fetching teachers:", err?.message || err);
      setError(`Failed to load teachers: ${err?.message || 'Unknown error'}`);
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
      [name]: 
        name === "hourly_rate" || name === "experience_years"
          ? parseFloat(value)
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (editingId) {
        // Update existing teacher
        const { error: updateError } = await supabase
          .from("teacher_users")
          .update({
            full_name: formData.full_name,
            email: formData.email,
            phone: formData.phone,
            bio: formData.bio,
            languages_taught: formData.languages_taught.split(",").map((l) => l.trim()),
            experience_years: formData.experience_years,
            qualifications: formData.qualifications,
            hourly_rate: formData.hourly_rate,
            availability: formData.availability,
            timezone: formData.timezone,
          })
          .eq("user_id", editingId);

        if (updateError) throw updateError;
      } else {
        // Create new teacher with auth account
        if (!formData.password || formData.password.length < 8) {
          setError("Password must be at least 8 characters");
          return;
        }

        const response = await fetch("/api/admin/create-teacher", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            full_name: formData.full_name,
            email: formData.email,
            password: formData.password,
            phone: formData.phone || null,
            bio: formData.bio || null,
            languages_taught: formData.languages_taught
              .split(",")
              .map((l) => l.trim())
              .filter(Boolean),
            experience_years: formData.experience_years || 0,
            qualifications: formData.qualifications || null,
            hourly_rate: formData.hourly_rate || 0,
            availability: formData.availability || null,
            timezone: formData.timezone || null,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create teacher");
        }
      }

      setShowForm(false);
      setEditingId(null);
      setFormData({
        full_name: "",
        email: "",
        password: "",
        phone: "",
        bio: "",
        languages_taught: "",
        experience_years: 0,
        qualifications: "",
        hourly_rate: 0,
        availability: "",
        timezone: "",
      });
      setSuccess(editingId ? "Teacher updated successfully!" : "Teacher account created successfully!");
      setTimeout(() => setSuccess(""), 3000);
      await fetchTeachers();
    } catch (err) {
      console.error("Error saving teacher:", err);
      setError(err instanceof Error ? err.message : "Failed to save teacher");
    }
  };

  const handleEdit = (teacher: Teacher) => {
    setFormData({
      full_name: teacher.full_name,
      email: teacher.email,      
      password: "", // Password not editable      
      phone: teacher.phone,
      bio: teacher.bio || "",
      languages_taught: teacher.languages_taught.join(", "),
      experience_years: teacher.experience_years || 0,
      qualifications: teacher.qualifications || "",
      hourly_rate: teacher.hourly_rate || 0,
      availability: teacher.availability || "",
      timezone: teacher.timezone || "",
    });
    setEditingId(teacher.user_id);
    setShowForm(true);
  };

  const handleDelete = async (user_id: string) => {
    if (confirm("Are you sure you want to delete this teacher?")) {
      try {
        const { error: deleteError } = await supabase
          .from("teacher_users")
          .delete()
          .eq("user_id", user_id);

        if (deleteError) throw deleteError;
        await fetchTeachers();
      } catch (err) {
        console.error("Error deleting teacher:", err);
        setError("Failed to delete teacher");
      }
    }
  };

  const filteredTeachers = teachers.filter((teacher) =>
    teacher.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="bg-white text-gray-900 min-h-screen">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/Dashboard/admin" className="text-blue-600 hover:text-blue-700">
              ← Back to Admin
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Manage Teachers</h1>
          </div>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
              setFormData({
                full_name: "",
                email: "",
                password: "",
                phone: "",
                bio: "",
                languages_taught: "",
                experience_years: 0,
                qualifications: "",
                hourly_rate: 0,
                availability: "",
                timezone: "",
              });
            }}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:shadow-lg transition"
          >
            + Add Teacher
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Bar */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search teachers by name or email..."
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

        {/* Form Modal */}
        {showForm && (
          <div className="mb-8 bg-gray-50 border border-gray-200 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingId ? "Edit Teacher" : "Create New Teacher"}
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

                {!editingId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password (min 8 characters)
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
                      required={!editingId}
                      minLength={8}
                    />
                  </div>
                )}

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
                    Hourly Rate (MAD)
                  </label>
                  <input
                    type="number"
                    name="hourly_rate"
                    value={formData.hourly_rate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Languages Taught (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="languages_taught"
                    value={formData.languages_taught}
                    onChange={handleInputChange}
                    placeholder="e.g., English, French, Spanish"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    name="experience_years"
                    value={formData.experience_years}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Qualifications
                  </label>
                  <input
                    type="text"
                    name="qualifications"
                    value={formData.qualifications}
                    onChange={handleInputChange}
                    placeholder="e.g., MA in English, TESOL"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
                  />
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
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Teach about yourself..."
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
                    rows={3}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Availability
                  </label>
                  <textarea
                    name="availability"
                    value={formData.availability}
                    onChange={handleInputChange}
                    placeholder="e.g., Monday-Friday 2PM-10PM"
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
                  {editingId ? "Update Teacher" : "Create Teacher"}
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

        {/* Teachers Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading teachers...</p>
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No teachers found</p>
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold"
              >
                Create First Teacher
              </button>
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
                      Languages
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Experience
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Rate (MAD/hr)
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Verified
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeachers.map((teacher) => (
                    <tr
                      key={teacher.user_id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {teacher.full_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {teacher.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex gap-2 flex-wrap">
                          {teacher.languages_taught.map((lang) => (
                            <span
                              key={lang}
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                            >
                              {lang}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {teacher.experience_years} yrs
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {teacher.hourly_rate}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            teacher.is_verified
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {teacher.is_verified ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm">
                        <button
                          onClick={() => handleEdit(teacher)}
                          className="text-blue-600 hover:text-blue-700 font-medium mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(teacher.user_id)}
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

        {/* Summary */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
            <p className="text-gray-600 text-sm mb-2">Total Teachers</p>
            <p className="text-4xl font-bold text-blue-600">{teachers.length}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
            <p className="text-gray-600 text-sm mb-2">Verified Teachers</p>
            <p className="text-4xl font-bold text-green-600">
              {teachers.filter((t) => t.is_verified).length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6">
            <p className="text-gray-600 text-sm mb-2">Avg Experience</p>
            <p className="text-4xl font-bold text-purple-600">
              {teachers.length > 0
                ? Math.round(
                    teachers.reduce((sum, t) => sum + (t.experience_years || 0), 0) /
                      teachers.length
                  )
                : 0}{" "}
              yrs
            </p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-2xl p-6">
            <p className="text-gray-600 text-sm mb-2">Average Hourly Rate</p>
            <p className="text-4xl font-bold text-orange-600">
              {teachers.length > 0
                ? Math.round(
                    teachers.reduce((sum, t) => sum + (t.hourly_rate || 0), 0) /
                      teachers.length
                  )
                : 0}{" "}
              MAD
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
