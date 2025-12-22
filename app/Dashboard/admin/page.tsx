"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  activeUsers: number;
}

export default function AdminDashboard() {
  const router = useRouter();

  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    activeUsers: 0,
  });
  const [adminName, setAdminName] = useState("Admin");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Get current admin user
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/auth/admin");
          return;
        }

        // Get admin profile
        const { data: adminData } = await supabase
          .from("admin_users")
          .select("full_name, role")
          .eq("user_id", user.id)
          .single();

        if (adminData) {
          setAdminName(adminData.full_name);
        }

        // Fetch statistics
        const studentResult = await supabase.from("student_users").select("user_id", { count: "exact" });
        const teacherResult = await supabase.from("teacher_users").select("user_id", { count: "exact" });
        const classResult = await supabase.from("classes").select("id", { count: "exact" });

        const studentCount = studentResult.count || 0;
        const teacherCount = teacherResult.count || 0;
        const classCount = classResult.count || 0;

        setStats({
          totalStudents: studentCount,
          totalTeachers: teacherCount,
          totalClasses: classCount,
          activeUsers: studentCount + teacherCount,
        });

        setLoading(false);
      } catch (err: any) {
        console.error("Error fetching dashboard data:", err?.message || err);
        setError(`Failed to load dashboard data: ${err?.message || 'Unknown error'}`);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const quickActions = [
    {
      title: "Create Student",
      icon: "👨‍🎓",
      href: "/Dashboard/admin/students",
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Create Teacher",
      icon: "👨‍🏫",
      href: "/Dashboard/admin/teachers",
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "Manage Classes",
      icon: "📚",
      href: "/Dashboard/admin/classes",
      color: "from-green-500 to-green-600",
    },
    {
      title: "View Attendance",
      icon: "📋",
      href: "/Dashboard/admin/attendance",
      color: "from-orange-500 to-orange-600",
    },
    {
      title: "Payment Records",
      icon: "💳",
      href: "/Dashboard/admin/payment",
      color: "from-pink-500 to-pink-600",
    },
  ];

  return (
    <main className="bg-white text-gray-900 min-h-screen">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Fluency Admin</h1>
                <p className="text-gray-500 text-sm">System Management</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition text-sm font-medium border border-red-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-3xl p-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome back, {adminName}
            </h2>
            <p className="text-gray-600">
              Manage students, teachers, classes, and monitor system activities.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            {
              label: "Total Students",
              value: stats.totalStudents,
              icon: "👨‍🎓",
              color: "from-blue-600 to-indigo-600",
            },
            {
              label: "Total Teachers",
              value: stats.totalTeachers,
              icon: "👨‍🏫",
              color: "from-purple-600 to-pink-600",
            },
            {
              label: "Total Classes",
              value: stats.totalClasses,
              icon: "📚",
              color: "from-green-600 to-emerald-600",
            },
            {
              label: "Active Users",
              value: stats.activeUsers,
              icon: "👥",
              color: "from-orange-500 to-red-600",
            },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm hover:shadow-lg transition"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 font-medium text-sm">
                  {stat.label}
                </h3>
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center text-xl shadow-lg`}
                >
                  {stat.icon}
                </div>
              </div>
              <div className="text-4xl font-bold text-gray-900">
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {quickActions.map((action, idx) => (
              <Link key={idx} href={action.href}>
                <div
                  className={`bg-gradient-to-br ${action.color} rounded-2xl p-6 cursor-pointer hover:shadow-lg transition transform hover:scale-105 h-full text-white`}
                >
                  <div className="text-4xl mb-3">{action.icon}</div>
                  <h4 className="font-semibold text-sm">
                    {action.title}
                  </h4>
                  <p className="text-white/70 text-xs mt-2">Click to access →</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* System Overview */}
          <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900">System Overview</h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600 text-sm">System Status</span>
                <span className="inline-flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-green-600 text-sm font-medium">
                    Operational
                  </span>
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600 text-sm">Last Updated</span>
                <span className="text-gray-600 text-sm font-medium">
                  Just now
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600 text-sm">Database Status</span>
                <span className="text-green-600 text-sm font-medium">
                  Connected
                </span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Quick Links</h3>
            </div>

            <div className="space-y-2">
              <Link
                href="/Dashboard/admin/students"
                className="block p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition text-gray-700 text-sm font-medium"
              >
                → Manage All Students
              </Link>
              <Link
                href="/Dashboard/admin/teachers"
                className="block p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition text-gray-700 text-sm font-medium"
              >
                → Manage All Teachers
              </Link>
              <Link
                href="/Dashboard/admin/classes"
                className="block p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition text-gray-700 text-sm font-medium"
              >
                → Manage All Classes
              </Link>
              <Link
                href="/Dashboard/admin/attendance"
                className="block p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition text-gray-700 text-sm font-medium"
              >
                → View Attendance Records
              </Link>
              <Link
                href="/Dashboard/admin/payment"
                className="block p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition text-gray-700 text-sm font-medium"
              >
                → View Payment Records
              </Link>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-12 p-6 bg-orange-50 border border-orange-200 rounded-xl text-orange-800 text-sm">
          <div className="flex gap-3">
            <svg
              className="w-5 h-5 flex-shrink-0 mt-0.5 text-orange-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="font-semibold">Security Notice</p>
              <p className="text-orange-700 text-xs mt-1">
                All admin activities are logged and monitored. Ensure you have
                proper authorization before making system changes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
