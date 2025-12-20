export default function Testimonial({
  quote,
  name,
  language,
}: {
  quote: string
  name: string
  language: string
}) {
  return (
    <div className="p-8 rounded-2xl bg-gray-50">
      <p className="text-gray-700">"{quote}"</p>

      <p className="mt-4 font-semibold">
        {name}
        <span className="block text-sm text-gray-500">
          Learning {language}
        </span>
      </p>
    </div>
  )
}
