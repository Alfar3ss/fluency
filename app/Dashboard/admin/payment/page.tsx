"use client";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface PaymentStats {
  totalStudentRevenue: number;
  totalTeacherPayouts: number;
  pendingPayouts: number;
  profit: number;
}

export default function PaymentDashboard() {
  const [stats, setStats] = useState<PaymentStats>({
    totalStudentRevenue: 0,
    totalTeacherPayouts: 0,
    pendingPayouts: 0,
    profit: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Get total student revenue
      const { data: studentPayments } = await supabase
        .from("student_payments")
        .select("amount_paid");

      const totalRevenue = studentPayments?.reduce((sum, p) => sum + Number(p.amount_paid || 0), 0) || 0;

      // Get total teacher payouts (completed)
      const { data: completedPayouts } = await supabase
        .from("teacher_payments")
        .select("amount_earned")
        .eq("payment_status", "completed");

      const totalPayouts = completedPayouts?.reduce((sum, p) => sum + Number(p.amount_earned || 0), 0) || 0;

      // Get pending teacher payouts
      const { data: pendingPayouts } = await supabase
        .from("teacher_payments")
        .select("amount_earned")
        .eq("payment_status", "pending");

      const totalPending = pendingPayouts?.reduce((sum, p) => sum + Number(p.amount_earned || 0), 0) || 0;

      setStats({
        totalStudentRevenue: totalRevenue,
        totalTeacherPayouts: totalPayouts,
        pendingPayouts: totalPending,
        profit: totalRevenue - (totalPayouts + totalPending),
      });
    } catch (err: any) {
      console.error("Error fetching payment stats:", err?.message || err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-white text-gray-900 min-h-screen">
      <div className="border-b border-gray-200 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/Dashboard/admin" className="text-blue-600 hover:text-blue-700">
              ← Back to Admin
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Payment Management</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Cards */}
        <div className="mb-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
            <p className="text-sm text-gray-600 mb-2">Total Student Revenue</p>
            <p className="text-3xl font-bold text-green-700">{stats.totalStudentRevenue.toFixed(2)} MAD</p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-2xl p-6">
            <p className="text-sm text-gray-600 mb-2">Teacher Payouts</p>
            <p className="text-3xl font-bold text-orange-700">{stats.totalTeacherPayouts.toFixed(2)} MAD</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl p-6">
            <p className="text-sm text-gray-600 mb-2">Pending Payouts</p>
            <p className="text-3xl font-bold text-yellow-700">{stats.pendingPayouts.toFixed(2)} MAD</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
            <p className="text-sm text-gray-600 mb-2">Net Profit</p>
            <p className="text-3xl font-bold text-blue-700">{stats.profit.toFixed(2)} MAD</p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link href="/Dashboard/admin/payment/students">
            <div className="bg-white border border-gray-200 rounded-3xl p-8 hover:shadow-lg transition cursor-pointer">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-3xl">
                  👨‍🎓
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Student Payments</h3>
                  <p className="text-gray-600 text-sm">Manage student payment records</p>
                </div>
              </div>
              <p className="text-blue-600 font-medium">View All Student Payments →</p>
            </div>
          </Link>

          <Link href="/Dashboard/admin/payment/teachers">
            <div className="bg-white border border-gray-200 rounded-3xl p-8 hover:shadow-lg transition cursor-pointer">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center text-3xl">
                  👨‍🏫
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Teacher Payments</h3>
                  <p className="text-gray-600 text-sm">Manage teacher commissions & payouts</p>
                </div>
              </div>
              <p className="text-purple-600 font-medium">View All Teacher Payments →</p>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
