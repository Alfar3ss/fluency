type Teacher = {
  name: string
  language: string
  country: string
  bio: string
}

export default function TeacherCard({ teacher }: { teacher: Teacher }) {
  return (
    <div className="p-6 border rounded-2xl hover:shadow-lg transition">
      <h3 className="text-lg font-semibold">{teacher.name}</h3>

      <p className="text-sm text-gray-500 mt-1">
        Native {teacher.language} • {teacher.country}
      </p>

      <p className="mt-3 text-gray-600 text-sm">
        {teacher.bio}
      </p>

      <button className="mt-4 w-full py-2 bg-indigo-600 text-white rounded-lg">
        View Profile
      </button>
    </div>
  )
}
