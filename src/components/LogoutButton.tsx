'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogOut } from 'lucide-react'

export default function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 px-4 py-2 border-2 border-wsop-light-gray dark:border-wsop-medium-gray rounded hover:bg-wsop-light-gray dark:hover:bg-wsop-black transition-colors font-semibold text-wsop-black dark:text-white"
    >
      <LogOut className="h-4 w-4" />
      로그아웃
    </button>
  )
}
