'use client'

import { signOut } from 'next-auth/react'
import { LogOut } from 'lucide-react'

export default function LogoutButton() {
  const handleLogout = async () => {
    // NextAuth signOut - callbackUrl로 메인 페이지로 이동
    await signOut({ callbackUrl: '/' })
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
