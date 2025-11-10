import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Supabase 환경 변수는 인증에 필수
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables')
    throw new Error('Server configuration error. Supabase credentials not configured.')
  }

  return createBrowserClient(supabaseUrl, supabaseKey)
}