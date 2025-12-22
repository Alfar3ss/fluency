"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface TeacherPayment {
  id: string;
  teacher_id: string;
  class_id: string | null;
  total_revenue: number;
  commission_percentage: number;
  amount_earned: number;
  sessions_taught: number;
  payment_status: string;
  payment_date: string | null;
  payment_method: string | null;
  notes: string | null;
  teacher_users: { full_name: string; email: string } | null;
  classes: { name: string } | null;
}

interface Teacher {
  user_id: string;
  full_name: string;
  email: string;
}

interface ClassItem {
  id: string;
  name: string;
}

export default function TeacherPaymentsPage() {
  const [payments, setPayments] = useState<TeacherPayment[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    teacher_id: "",
    class_id: "",
    total_revenue: 0,
    commission_percentage: 50,
    sessions_taught: 8,
    notes: "",
  });

  useEffect(() => {
    fetchPayments();
    fetchTeachers();
    fetchClasses();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("teacher_payments")
        .select(`
          *,
          teacher_users(full_name, email),
          classes(name)
        `)
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
      setPayments(data || []);
    } catch (err: any) {
      console.error("Error fetching payments:", err?.message || err);
      setError(`Failed to load payments: ${err?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    const { data } = await supabase
      .from("teacher_users")
      .select("user_id, full_name, email")
      .order("full_name");
    setTeachers(data || []);
  };

  const fetchClasses = async () => {
    const { data } = await supabase
      .from("classes")
      .select("id, name")
      .order("name");
    setClasses(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const amountEarned = (formData.total_revenue * formData.commission_percentage) / 100;

      const { error: insertError } = await supabase.from("teacher_payments").insert({
        teacher_id: formData.teacher_id,
        class_id: formData.class_id || null,
        total_revenue: formData.total_revenue,
        commission_percentage: formData.commission_percentage,
        amount_earned: amountEarned,
        sessions_taught: formData.sessions_taught,
        payment_status: "pending",
        notes: formData.notes || null,
      });

      if (insertError) throw insertError;

      setSuccess("Teacher payment recorded successfully!");
      setTimeout(() => setSuccess(""), 3000);
      setShowForm(false);
      setFormData({
        teacher_id: "",
        class_id: "",
        total_revenue: 0,
        commission_percentage: 50,
        sessions_taught: 8,
        notes: "",
      });
      await fetchPayments();
    } catch (err) {
      console.error("Error recording payment:", err);
      setError("Failed to record payment");
    }
  };

  const handleMarkPaid = async (paymentId: string, amount: number, method: string = "bank_transfer") => {
    try {
      const { error: updateError } = await supabase
        .from("teacher_payments")
        .update({
          payment_status: "completed",
          payment_date: new Date().toISOString(),
          payment_method: method,
        })
        .eq("id", paymentId);

      if (updateError) throw updateError;
      setSuccess("Payment marked as completed");
      setTimeout(() => setSuccess(""), 2000);
      await fetchPayments();
    } catch (err) {
      console.error("Error updating payment:", err);
      setError("Failed to update payment");
    }
  };

  const filteredPayments = payments.filter((payment) => {
    const teacherName = payment.teacher_users?.full_name || "";
    const teacherEmail = payment.teacher_users?.email || "";
    const className = payment.classes?.name || "";
    const search = searchTerm.toLowerCase();
    return (
      teacherName.toLowerCase().includes(search) ||
      teacherEmail.toLowerCase().includes(search) ||
      className.toLowerCase().includes(search)
    );
  });

  const totalPending = payments
    .filter((p) => p.payment_status === "pending")
    .reduce((sum, p) => sum + Number(p.amount_earned || 0), 0);
  const totalPaid = payments
    .filter((p) => p.payment_status === "completed")
    .reduce((sum, p) => sum + Number(p.amount_earned || 0), 0);

  return (
    <main className="bg-white text-gray-900 min-h-screen">
      <div className="border-b border-gray-200 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/Dashboard/admin/payment" className="text-blue-600 hover:text-blue-700">
              ← Back to Payments
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Teacher Payments</h1>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-lg transition"
          >
            + Record Commission
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl p-6">
            <p className="text-sm text-gray-600 mb-2">Pending Payouts</p>
            <p className="text-3xl font-bold text-yellow-700">{totalPending.toFixed(2)} MAD</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
            <p className="text-sm text-gray-600 mb-2">Total Paid</p>
            <p className="text-3xl font-bold text-green-700">{totalPaid.toFixed(2)} MAD</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6">
            <p className="text-sm text-gray-600 mb-2">Total Payments</p>
            <p className="text-3xl font-bold text-purple-700">{payments.length}</p>
          </div>
        </div>

        <div className="mb-8">
          <input
            type="text"
            placeholder="Search by teacher name, email, or class..."
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
              <h2 className="text-2xl font-bold text-gray-900">Record Teacher Commission</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700 text-2xl">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Teacher</label>
                  <select
                    value={formData.teacher_id}
                    onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
                    required
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map((t) => (
                      <option key={t.user_id} value={t.user_id}>
                        {t.full_name} ({t.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Class (Optional)</label>
                  <select
                    value={formData.class_id}
                    onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
                  >
                    <option value="">Select Class</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Total Class Revenue (MAD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.total_revenue}
                    onChange={(e) => setFormData({ ...formData, total_revenue: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Commission %</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.commission_percentage}
                    onChange={(e) => setFormData({ ...formData, commission_percentage: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sessions Taught</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.sessions_taught}
                    onChange={(e) => setFormData({ ...formData, sessions_taught: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Calculated Earning</label>
                  <div className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-lg font-bold text-purple-700">
                    {((formData.total_revenue * formData.commission_percentage) / 100).toFixed(2)} MAD
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
                    rows={2}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-lg transition"
                >
                  Record Commission
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
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
              <p className="text-gray-500">Loading payments...</p>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No teacher payments recorded yet</p>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Teacher</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Class</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Revenue</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Commission</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Earned</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Sessions</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {payment.teacher_users?.full_name || "Unknown"}
                          </p>
                          <p className="text-xs text-gray-600">{payment.teacher_users?.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{payment.classes?.name || "-"}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {Number(payment.total_revenue).toFixed(2)} MAD
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {Number(payment.commission_percentage).toFixed(0)}%
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-purple-700">
                        {Number(payment.amount_earned).toFixed(2)} MAD
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{payment.sessions_taught}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            payment.payment_status === "completed"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {payment.payment_status === "completed" ? "Paid" : "Pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm">
                        {payment.payment_status === "pending" && (
                          <button
                            onClick={() => handleMarkPaid(payment.id, payment.amount_earned)}
                            className="text-green-600 hover:text-green-700 font-medium"
                          >
                            Mark Paid
                          </button>
                        )}
                        {payment.payment_status === "completed" && payment.payment_date && (
                          <span className="text-xs text-gray-500">
                            {new Date(payment.payment_date).toLocaleDateString()}
                          </span>
                        )}
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
