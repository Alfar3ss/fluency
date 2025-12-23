"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type ClassRow = {
  id: string;
  name: string;
  level: string;
  language: string;
  current_students: number | null;
  max_students: number | null;
  status: string | null;
  updated_at: string;
};

export default function AttendancePage() {
  const [rows, setRows] = useState<ClassRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    const load = async () => {
      try {
        setError("");
        setLoading(true);
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        if (!token) {
          setError("You must be logged in as admin.");
          return;
        }

        const res = await fetch("/api/admin/attendance", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error || "Failed to load attendance");
        }

        const body = await res.json();
        if (!active) return;
        setRows(body.classes || []);
      } catch (err: any) {
        if (!active) return;
        if (err.name === "AbortError") return;
        setError(err?.message || "Failed to load attendance");
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="border-b border-gray-200 bg-white sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Attendance Reports</h1>
          <p className="text-sm text-gray-500">Select a class to view detailed attendance.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
        )}

        <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-6 text-gray-600">Loading attendance…</div>
          ) : rows.length === 0 ? (
            <div className="p-6 text-gray-600">No classes found.</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Class</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Language</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Level</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Enrolled</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Last Updated</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{row.language}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{row.level}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {row.current_students ?? 0} / {row.max_students ?? 0}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          row.status?.toLowerCase() === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {row.status || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {row.updated_at ? new Date(row.updated_at).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-6 py-4 text-right text-sm">
                      <Link
                        href={`/Dashboard/admin/attendance/${row.id}`}
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:shadow-lg transition"
                      >
                        Show Report
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  );
}
