import { createClient } from '@supabase/supabase-js'

// Create a function to get the Supabase client instead of creating it at module level
// This prevents build-time errors when env vars aren't available
export function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
  
  return createClient(supabaseUrl, supabaseAnonKey)
}
