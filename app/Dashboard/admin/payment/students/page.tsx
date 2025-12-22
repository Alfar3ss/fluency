"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface StudentPayment {
  id: string;
  student_id: string;
  class_id: string | null;
  amount_paid: number;
  sessions_purchased: number;
  sessions_used: number;
  payment_method: string | null;
  payment_status: string;
  payment_date: string;
  notes: string | null;
  student_users: { full_name: string; email: string } | null;
  classes: { name: string } | null;
}

interface Student {
  user_id: string;
  full_name: string;
  email: string;
}

interface ClassItem {
  id: string;
  name: string;
}

export default function StudentPaymentsPage() {
  const [payments, setPayments] = useState<StudentPayment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    student_id: "",
    class_id: "",
    amount_paid: 0,
    sessions_purchased: 8,
    payment_method: "cash",
    notes: "",
  });

  useEffect(() => {
    fetchPayments();
    fetchStudents();
    fetchClasses();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("student_payments")
        .select(`
          *,
          student_users(full_name, email),
          classes(name)
        `)
        .order("payment_date", { ascending: false });

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

  const fetchStudents = async () => {
    const { data } = await supabase
      .from("student_users")
      .select("user_id, full_name, email")
      .order("full_name");
    setStudents(data || []);
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
      const { error: insertError } = await supabase.from("student_payments").insert({
        student_id: formData.student_id,
        class_id: formData.class_id || null,
        amount_paid: formData.amount_paid,
        sessions_purchased: formData.sessions_purchased,
        sessions_used: 0,
        payment_method: formData.payment_method,
        payment_status: "completed",
        notes: formData.notes || null,
      });

      if (insertError) throw insertError;

      setSuccess("Payment recorded successfully!");
      setTimeout(() => setSuccess(""), 3000);
      setShowForm(false);
      setFormData({
        student_id: "",
        class_id: "",
        amount_paid: 0,
        sessions_purchased: 8,
        payment_method: "cash",
        notes: "",
      });
      await fetchPayments();
    } catch (err) {
      console.error("Error recording payment:", err);
      setError("Failed to record payment");
    }
  };

  const handleUseSession = async (paymentId: string, currentUsed: number, maxSessions: number) => {
    if (currentUsed >= maxSessions) {
      setError("All sessions have been used");
      return;
    }

    try {
      const { error: updateError } = await supabase
        .from("student_payments")
        .update({ sessions_used: currentUsed + 1 })
        .eq("id", paymentId);

      if (updateError) throw updateError;
      setSuccess("Session marked as used");
      setTimeout(() => setSuccess(""), 2000);
      await fetchPayments();
    } catch (err) {
      console.error("Error updating session:", err);
      setError("Failed to update session");
    }
  };

  const filteredPayments = payments.filter((payment) => {
    const studentName = payment.student_users?.full_name || "";
    const studentEmail = payment.student_users?.email || "";
    const className = payment.classes?.name || "";
    const search = searchTerm.toLowerCase();
    return (
      studentName.toLowerCase().includes(search) ||
      studentEmail.toLowerCase().includes(search) ||
      className.toLowerCase().includes(search)
    );
  });

  const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount_paid || 0), 0);

  return (
    <main className="bg-white text-gray-900 min-h-screen">
      <div className="border-b border-gray-200 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/Dashboard/admin/payment" className="text-blue-600 hover:text-blue-700">
              ← Back to Payments
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Student Payments</h1>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:shadow-lg transition"
          >
            + Record Payment
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
            <p className="text-sm text-gray-600 mb-2">Total Revenue</p>
            <p className="text-3xl font-bold text-green-700">{totalRevenue.toFixed(2)} MAD</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
            <p className="text-sm text-gray-600 mb-2">Total Payments</p>
            <p className="text-3xl font-bold text-blue-700">{payments.length}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6">
            <p className="text-sm text-gray-600 mb-2">Avg. Payment</p>
            <p className="text-3xl font-bold text-purple-700">
              {payments.length > 0 ? (totalRevenue / payments.length).toFixed(2) : "0.00"} MAD
            </p>
          </div>
        </div>

        <div className="mb-8">
          <input
            type="text"
            placeholder="Search by student name, email, or class..."
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
              <h2 className="text-2xl font-bold text-gray-900">Record Student Payment</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700 text-2xl">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Student</label>
                  <select
                    value={formData.student_id}
                    onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
                    required
                  >
                    <option value="">Select Student</option>
                    {students.map((s) => (
                      <option key={s.user_id} value={s.user_id}>
                        {s.full_name} ({s.email})
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount (MAD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount_paid}
                    onChange={(e) => setFormData({ ...formData, amount_paid: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sessions Purchased</label>
                  <select
                    value={formData.sessions_purchased}
                    onChange={(e) => setFormData({ ...formData, sessions_purchased: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
                  >
                    {[1, 2, 3, 4, 8].map((n) => (
                      <option key={n} value={n}>
                        {n} Session{n > 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                  <select
                    value={formData.payment_method}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
                  >
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="card">Card</option>
                    <option value="mobile">Mobile Payment</option>
                  </select>
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
                  className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:shadow-lg transition"
                >
                  Record Payment
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
              <p className="text-gray-500">No payments recorded yet</p>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Student</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Class</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Sessions</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Method</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {payment.student_users?.full_name || "Unknown"}
                          </p>
                          <p className="text-xs text-gray-600">{payment.student_users?.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {payment.classes?.name || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-green-700">
                        {Number(payment.amount_paid).toFixed(2)} MAD
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-900">
                            {payment.sessions_used}/{payment.sessions_purchased}
                          </span>
                          {payment.sessions_used < payment.sessions_purchased && (
                            <button
                              onClick={() =>
                                handleUseSession(payment.id, payment.sessions_used, payment.sessions_purchased)
                              }
                              className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                            >
                              Use +1
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                        {payment.payment_method || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(payment.payment_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right text-sm">
                        {payment.notes && (
                          <span className="text-gray-500" title={payment.notes}>
                            📝
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
