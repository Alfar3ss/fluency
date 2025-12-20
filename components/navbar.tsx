"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export default function Navbar() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
  }, [])

  return (
    <nav className="border-b bg-white">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          Fluency
        </Link>

        <div className="flex items-center gap-6">

          {user ? (
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="px-4 py-2 border rounded-lg"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
