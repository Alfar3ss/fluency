"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const nav = [
  { name: "Home", href: "/" },
  { name: "Pricing", href: "/pricing" },
  { name: "Placement Test", href: "/test" },
  { name: "Contact", href: "/contact" },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user?.email) {
        // Try to fetch from student_users first, then teacher_users
        const { data: studentData } = await supabase
          .from("student_users")
          .select("full_name, email, language, level")
          .eq("email", user.email)
          .single();
        
        if (studentData) {
          setProfileData({ ...studentData, role: "Student" });
        } else {
          const { data: teacherData } = await supabase
            .from("teacher_users")
            .select("full_name, email, languages_taught")
            .eq("email", user.email)
            .single();
          
          if (teacherData) {
            setProfileData({ ...teacherData, role: "Teacher" });
          } else {
            setProfileData({ email: user.email, full_name: user.user_metadata?.name || "User", role: "Unknown" });
          }
        }
      }
      
      setLoading(false);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut({ scope: "global" });
      if (error) {
        console.error("Logout error:", error.message);
      }
      setUser(null);
      setProfileData(null);
      setShowProfileModal(false);
      setOpen(false);
      router.replace("/");
    } catch (e) {
      console.error("Unexpected logout error:", e);
    } finally {
      setLoading(false);
    }
  };

  const copyEmail = () => {
    if (user?.email) {
      navigator.clipboard.writeText(user.email);
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

  const avatarUrl =
    (user?.user_metadata?.avatar_url as string) ||
    (user?.user_metadata?.picture as string) ||
    null;

  return (
    <header className="bg-white w-full sticky top-0 z-30 shadow-sm">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* section dial logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-blue-600 text-lg -ml-3">
            <img src="/logo.png" alt="FluencyLogo" className="w-40 h-10"/>
        </Link>
        {/* dial desktop */}
        <div className="flex-1 justify-center hidden md:flex">
          <ul className="flex gap-2 md:gap-6">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`px-5 py-2 rounded-full font-medium transition text-gray-500 hover:text-blue-600 hover:bg-blue-50 ${
                    pathname === item.href ? "bg-blue-100 text-blue-700" : ""
                  }`}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-4">
          {!loading && user ? (
            <>
              <button
                onClick={() => setShowProfileModal(true)}
                className={`relative overflow-hidden flex items-center justify-center w-10 h-10 rounded-full ${
                  avatarUrl ? "" : "bg-gradient-to-br from-blue-500 to-blue-700 text-white"
                } hover:shadow-lg transition`}
                title="Open profile"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Profile" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0Z" stroke="currentColor" strokeWidth="2" />
                    <path d="M12 14a7 7 0 00-7 7h14a7 7 0 0 0-7-7Z" stroke="currentColor" strokeWidth="2" />
                  </svg>
                )}
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => setShowLoginModal(true)}
                className="font-semibold text-gray-800 hover:text-blue-600 transition"
              >
                Log In
              </button>
              <Link
                href="/auth/register"
                className="px-6 py-2 rounded-xl bg-[#127db2] text-white font-semibold shadow hover:scale-[1.04] transition"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
        {/* Hamburger for mobile */}
        <button
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-blue-50 transition"
          aria-label="Open menu"
          onClick={() => setOpen(true)}
        >
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" stroke="#2563eb" strokeWidth="2" strokeLinecap="round"/></svg>
        </button>
        {/* Slide Menu */}
        {open && (
          <div className="fixed inset-0 z-50 bg-black/40 flex">
            <div className="w-72 bg-white h-full shadow-2xl p-6 flex flex-col animate-slidein">
              <div className="flex items-center justify-between mb-8">
                <Link href="/" className="flex items-center gap-2 font-bold text-blue-600 text-lg" onClick={() => setOpen(false)}>
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#3b82f6" strokeWidth="2"/><path d="M8 12h8M12 8v8" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/></svg>
                  Fluency
                </Link>
                <button onClick={() => setOpen(false)} aria-label="Close menu" className="p-2 rounded hover:bg-blue-50">
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M6 6l12 12M6 18L18 6" stroke="#2563eb" strokeWidth="2" strokeLinecap="round"/></svg>
                </button>
              </div>
              <ul className="flex flex-col gap-2 mb-8">
                {nav.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`block px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-blue-50 transition ${
                        pathname === item.href ? "bg-blue-100 text-blue-700" : ""
                      }`}
                      onClick={() => setOpen(false)}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="flex flex-col gap-3 mt-auto">
                {!loading && user ? (
                  <>
                    <button
                      onClick={() => { setShowProfileModal(true); setOpen(false); }}
                      className="w-full text-center font-semibold text-gray-800 hover:text-blue-600 transition py-2"
                    >
                      View Profile
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => { setOpen(false); setShowLoginModal(true); }}
                      className="w-full text-center font-semibold text-gray-800 hover:text-blue-600 transition py-2"
                    >
                      Log In
                    </button>
                    <Link
                      href="/auth/register"
                      className="w-full text-center px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold shadow hover:scale-[1.04] transition"
                      onClick={() => setOpen(false)}
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="flex-1" onClick={() => setOpen(false)} />
            <style jsx global>{`
              @keyframes slidein {
                from { transform: translateX(-100%); }
                to { transform: translateX(0); }
              }
              .animate-slidein {
                animation: slidein 0.25s cubic-bezier(0.4,0,0.2,1);
              }
            `}</style>
          </div>
        )}

        {/* Login Modal */}
        {showLoginModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fadein" onClick={() => setShowLoginModal(false)}>
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 animate-scaleup" onClick={(e) => e.stopPropagation()}>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back!</h2>
                <p className="text-gray-600">Choose how you want to log in</p>
              </div>
              
              <div className="space-y-4">
                <Link
                  href="/auth/login"
                  onClick={() => setShowLoginModal(false)}
                  className="w-full flex items-center justify-between px-6 py-4 rounded-xl border-2 border-[#127db2] hover:bg-[#127db2] hover:text-white text-[#127db2] font-semibold transition group"
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Student Login</span>
                  </div>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>

                <Link
                  href="/auth/teacher"
                  onClick={() => setShowLoginModal(false)}
                  className="w-full flex items-center justify-between px-6 py-4 rounded-xl border-2 border-[#f1753d] hover:bg-[#f1753d] hover:text-white text-[#f1753d] font-semibold transition group"
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span>Teacher Login</span>
                  </div>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              <button
                onClick={() => setShowLoginModal(false)}
                className="mt-6 w-full py-3 text-gray-600 hover:text-gray-800 font-medium transition"
              >
                Cancel
              </button>
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

        {/* Profile Modal */}
        {showProfileModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fadein" onClick={() => setShowProfileModal(false)}>
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 animate-scaleup" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>
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
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white font-bold text-xl overflow-hidden">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
                      <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0Z" stroke="currentColor" strokeWidth="2" />
                      <path d="M12 14a7 7 0 00-7 7h14a7 7 0 0 0-7-7Z" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-gray-800">{profileData?.full_name || user?.email}</p>
                  <p className="text-sm text-gray-500">{profileData?.role || "User"}</p>
                </div>
              </div>

              <div className="space-y-4 mb-6 bg-gray-50 p-4 rounded-2xl">
                <div>
                  <p className="text-xs text-gray-600 font-semibold mb-1">Email</p>
                  <p className="text-sm text-gray-800 break-all">{user?.email}</p>
                </div>

                {profileData?.language && (
                  <div>
                    <p className="text-xs text-gray-600 font-semibold mb-1">Language</p>
                    <p className="text-sm text-gray-800">{profileData.language}</p>
                  </div>
                )}

                {profileData?.level && (
                  <div>
                    <p className="text-xs text-gray-600 font-semibold mb-1">Level</p>
                    <p className="text-sm text-gray-800">{profileData.level}</p>
                  </div>
                )}

                {profileData?.languages_taught && (
                  <div>
                    <p className="text-xs text-gray-600 font-semibold mb-1">Languages Taught</p>
                    <p className="text-sm text-gray-800">
                      {Array.isArray(profileData.languages_taught)
                        ? profileData.languages_taught.join(", ")
                        : profileData.languages_taught}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-xs text-gray-600 font-semibold mb-1">Member Since</p>
                  <p className="text-sm text-gray-800">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
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
                <Link
                  href="/Dashboard/students"
                  onClick={() => setShowProfileModal(false)}
                  className="w-full text-center px-4 py-3 rounded-xl bg-[#127db2] text-white font-semibold hover:brightness-95 transition"
                >
                  Go to Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "Logging out…" : "Logout"}
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
      </nav>
    </header>
  );
}
