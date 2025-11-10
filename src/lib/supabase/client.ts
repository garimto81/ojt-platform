import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Supabase 환경 변수는 인증에 필수
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables')
    console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing')
    console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? `✅ Set (${supabaseKey.substring(0, 20)}...)` : '❌ Missing')
    throw new Error('Server configuration error. Supabase credentials not configured.')
  }

  // Key 형식 검증
  if (!supabaseKey.startsWith('eyJ')) {
    console.error('Invalid Supabase Anon Key format. Should start with "eyJ"')
    console.error('Current key starts with:', supabaseKey.substring(0, 10))
    throw new Error('Invalid Supabase Anon Key format')
  }

  return createBrowserClient(supabaseUrl, supabaseKey)
}