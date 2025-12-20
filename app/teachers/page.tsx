import TeacherCard from "@/components/teacher-card"

const teachers = [
  {
    name: "Maria",
    language: "Spanish",
    country: "Spain",
    bio: "Helping students speak confidently through real conversation.",
  },
  {
    name: "Youssef",
    language: "Arabic",
    country: "Morocco",
    bio: "Modern Arabic for daily life and travel.",
  },
]

export default function TeachersPage() {
  return (
    <main className="max-w-7xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-bold mb-12">Native Teachers</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {teachers.map((t, i) => (
          <TeacherCard key={i} teacher={t} />
        ))}
      </div>
    </main>
  )
}
