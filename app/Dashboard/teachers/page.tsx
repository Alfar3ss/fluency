const stats = [
  { label: "Active classes", value: "4", color: "bg-[#e6f4ff] text-[#127db2]" },
  { label: "Total students", value: "38", color: "bg-[#fff5ef] text-[#f1753d]" },
  { label: "Today’s lessons", value: "3", color: "bg-emerald-50 text-emerald-700" },
  { label: "Pending uploads", value: "2", color: "bg-amber-50 text-amber-700" },
];

const adminNotices = [
  { title: "Syllabus update", body: "Upload Week 6 materials by Friday." },
  { title: "Holiday", body: "No classes next Monday (public holiday)." },
];

const classes = [
  { name: "English B1 – Group 3", students: "10/10", schedule: "Mon & Wed · 6:00 PM", status: "Assigned", color: "bg-[#e6f4ff]" },
  { name: "French A2 – Group 2", students: "8/10", schedule: "Tue & Thu · 5:00 PM", status: "Assigned", color: "bg-[#fff5ef]" },
  { name: "Arabic B2 – Group 1", students: "6/8", schedule: "Sat · 11:00 AM", status: "Assigned", color: "bg-[#e6f4ff]" },
  { name: "Spanish A1 – Cohort", students: "14/15", schedule: "Sun · 4:00 PM", status: "Assigned", color: "bg-[#fff5ef]" },
];

const classDetails = {
  name: "English B1 – Group 3",
  schedule: "Mon & Wed · 6:00 PM (UTC+1)",
  link: "https://meet.google.com/abc-defg-hij",
  students: [
    { name: "Mina", level: "B1", attendance: 92, note: "Strong speaking, needs writing practice." },
    { name: "Alex", level: "B1", attendance: 88, note: "Good grammar, build confidence." },
    { name: "Sara", level: "B1", attendance: 95, note: "Excellent participation." },
    { name: "Youssef", level: "B1", attendance: 81, note: "Focus on listening comprehension." },
  ],
  lessons: [
    { title: "Lesson 12 – Phrasal Verbs", status: "Upcoming", when: "Wed, 7 May – 6:00 PM" },
    { title: "Lesson 11 – Past Tenses Review", status: "Completed", when: "Mon, 5 May – 6:00 PM" },
    { title: "Lesson 10 – Listening Practice", status: "Completed", when: "Wed, 1 May – 6:00 PM" },
    { title: "Lesson 9 – Speaking Drills", status: "Rescheduled", when: "Fri, 26 Apr – 6:00 PM" },
  ],
  documents: [
    { name: "Week 6 Slides", type: "Slides", due: "Upload pending" },
    { name: "Homework – Phrasal Verbs", type: "Homework", due: "Due Sun, 11 May" },
    { name: "Listening Clips", type: "Materials", due: "Ready" },
  ],
  announcements: [
    { from: "Teacher", title: "Reminder", body: "Bring 3 phrasal verb examples to next class." },
    { from: "Admin", title: "Policy", body: "Mark attendance within 24h of class." },
  ],
};

const profile = {
  name: "Emily Carter",
  bio: "CELTA-certified. 8 years teaching English, focus on speaking confidence.",
  languages: ["English (C2)", "French (B2)"],
  levels: ["A2", "B1", "B2"],
  availability: "Weekdays 4–8 PM UTC+1",
};

function badge(status: string) {
  const map: Record<string, string> = {
    Upcoming: "bg-[#e6f4ff] text-[#127db2]",
    Completed: "bg-emerald-50 text-emerald-700",
    Rescheduled: "bg-amber-50 text-amber-700",
  };
  return map[status] || "bg-gray-100 text-gray-700";
}

export default function TeacherDashboardPage() {
  return (
    <main className="bg-[#f3f6f8] min-h-screen py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Overview */}
        <section className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 bg-white rounded-3xl shadow-xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-sm text-gray-500">Teacher home</p>
                <h2 className="text-2xl font-bold text-[#127db2]">Welcome back, {profile.name}</h2>
                <p className="text-sm text-gray-600">Class-centric view of what matters today.</p>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 rounded-xl bg-[#127db2] text-white font-semibold shadow hover:brightness-95">Add homework</button>
                <button className="px-4 py-2 rounded-xl border border-gray-200 font-semibold text-gray-700 hover:border-[#127db2]">Upload docs</button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {stats.map((s) => (
                <div key={s.label} className={`rounded-2xl p-4 border border-gray-100 ${s.color}`}>
                  <p className="text-xs opacity-80">{s.label}</p>
                  <p className="text-xl font-bold">{s.value}</p>
                </div>
              ))}
            </div>
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Admin notices</p>
              <div className="space-y-2">
                {adminNotices.map((n) => (
                  <div key={n.title} className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-[#f1753d]" />
                    <div>
                      <p className="font-semibold text-gray-800">{n.title}</p>
                      <p className="text-sm text-gray-600">{n.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-[#127db2]">Profile & availability</h3>
            <p className="text-sm text-gray-700">{profile.bio}</p>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-500">Languages</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {profile.languages.map((l) => (
                    <span key={l} className="px-3 py-1 rounded-full bg-[#e6f4ff] text-[#127db2] text-xs">{l}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500">Levels taught</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {profile.levels.map((l) => (
                    <span key={l} className="px-3 py-1 rounded-full bg-[#fff5ef] text-[#f1753d] text-xs">{l}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500">Availability</p>
                <p className="font-semibold text-gray-800">{profile.availability}</p>
              </div>
            </div>
          </div>
        </section>

        {/* My Classes */}
        <section className="bg-white rounded-3xl shadow-xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <p className="text-sm text-gray-500">My classes</p>
              <h3 className="text-xl font-bold text-[#127db2]">Class roster</h3>
            </div>
            <button className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:border-[#127db2]">View calendar</button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {classes.map((c) => (
              <div key={c.name} className="rounded-2xl border border-gray-100 p-4 shadow-sm bg-white hover:shadow-md transition">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Language · Level</p>
                    <p className="font-semibold text-gray-800">{c.name}</p>
                    <p className="text-sm text-gray-500">{c.schedule}</p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full ${c.color} border border-white/50`}>{c.status}</span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-sm text-gray-700">Students</p>
                  <p className="font-semibold text-[#127db2]">{c.students}</p>
                </div>
                <button className="mt-3 w-full py-2 rounded-xl font-semibold bg-[#127db2] text-white shadow hover:scale-[1.01] transition">
                  View class
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Class Details */}
        <section className="bg-white rounded-3xl shadow-xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <p className="text-sm text-gray-500">Class details</p>
              <h3 className="text-xl font-bold text-[#127db2]">{classDetails.name}</h3>
              <p className="text-sm text-gray-600">{classDetails.schedule}</p>
            </div>
            <a className="text-[#127db2] font-semibold hover:underline" href={classDetails.link} target="_blank" rel="noreferrer">
              Join class link
            </a>
          </div>

          {/* Students */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-gray-100 p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-800">Students</h4>
                <span className="text-xs text-gray-500">Read-only</span>
              </div>
              <div className="space-y-3">
                {classDetails.students.map((s) => (
                  <div key={s.name} className="rounded-xl border border-gray-200 bg-white p-3">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-gray-800">{s.name}</p>
                      <span className="text-xs px-2 py-1 rounded-full bg-[#e6f4ff] text-[#127db2]">{s.level}</span>
                    </div>
                    <p className="text-xs text-gray-500">Attendance: {s.attendance}%</p>
                    <p className="text-sm text-gray-600 mt-1">Note: {s.note}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Lessons & schedule */}
            <div className="rounded-2xl border border-gray-100 p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-800">Lessons & schedule</h4>
                <button className="text-xs px-3 py-1 rounded-full border border-gray-200 font-semibold text-gray-700 hover:border-[#127db2]">
                  Request reschedule
                </button>
              </div>
              <div className="space-y-3">
                {classDetails.lessons.map((l) => (
                  <div key={l.title} className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-3">
                    <div>
                      <p className="font-semibold text-gray-800">{l.title}</p>
                      <p className="text-xs text-gray-500">{l.when}</p>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${badge(l.status)}`}>{l.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Documents & homework */}
          <div className="rounded-2xl border border-gray-100 p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-semibold text-gray-800">Documents & Homework</h4>
                <p className="text-xs text-gray-500">Upload files, links, set due dates.</p>
              </div>
              <div className="flex gap-2">
                <button className="text-xs px-3 py-2 rounded-xl bg-[#127db2] text-white font-semibold shadow hover:brightness-95">Upload file</button>
                <button className="text-xs px-3 py-2 rounded-xl border border-gray-200 font-semibold text-gray-700 hover:border-[#127db2]">Add link</button>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {classDetails.documents.map((d) => (
                <div key={d.name} className="rounded-xl border border-gray-200 bg-white p-3">
                  <p className="font-semibold text-gray-800">{d.name}</p>
                  <p className="text-xs text-gray-500">{d.type}</p>
                  <p className="text-xs text-[#f1753d] mt-1">{d.due}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Announcements */}
          <div className="rounded-2xl border border-gray-100 p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-800">Announcements</h4>
              <button className="text-xs px-3 py-2 rounded-xl border border-gray-200 font-semibold text-gray-700 hover:border-[#127db2]">
                Post announcement
              </button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {classDetails.announcements.map((a, idx) => (
                <div key={idx} className="p-3 rounded-xl border border-gray-200 bg-white">
                  <p className="text-xs text-gray-500">{a.from}</p>
                  <p className="font-semibold text-gray-800">{a.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{a.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}