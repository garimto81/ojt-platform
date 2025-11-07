'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  BookOpen,
  FileText,
  Trophy,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  User,
  Bell,
  Target,
  Sparkles,
  Shield
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  badge?: string
  adminOnly?: boolean
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: <Home className="h-5 w-5" /> },
  { label: 'Learning', href: '/dashboard/learning', icon: <BookOpen className="h-5 w-5" />, badge: 'Day 3' },
  { label: 'Content', href: '/dashboard/content', icon: <FileText className="h-5 w-5" /> },
  { label: 'Assessment', href: '/dashboard/assessment', icon: <Target className="h-5 w-5" /> },
  { label: 'Leaderboard', href: '/dashboard/leaderboard', icon: <Trophy className="h-5 w-5" /> },
  { label: 'Community', href: '/dashboard/community', icon: <Users className="h-5 w-5" /> },
]

const adminNavItems: NavItem[] = [
  { label: 'Lesson Content', href: '/dashboard/admin/lessons', icon: <BookOpen className="h-5 w-5" />, adminOnly: true },
  { label: 'AI Quiz Generator', href: '/dashboard/admin/quizzes', icon: <Sparkles className="h-5 w-5" />, adminOnly: true },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userRole, setUserRole] = useState<string>('trainee') // TODO: Fetch from profile
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-900 border-r shadow-lg transform transition-transform z-50 lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Logo */}
        <div className="p-6 border-b">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-ggp-primary to-ggp-secondary rounded-lg flex items-center justify-center text-white font-bold text-xl">
              G
            </div>
            <div>
              <h2 className="font-bold text-lg">GGP Platform</h2>
              <p className="text-xs text-gray-500">Knowledge Hub</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          {/* Main Navigation */}
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = mounted && (pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href)))

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-ggp-primary text-white'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* Admin Section */}
          {(userRole === 'admin' || userRole === 'trainer') && (
            <div className="mt-6">
              <div className="px-3 py-2 text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Admin
              </div>
              <ul className="space-y-1 mt-2">
                {adminNavItems.map((item) => {
                  const isActive = mounted && (pathname === item.href ||
                    (item.href !== '/dashboard/admin' && pathname.startsWith(item.href)))

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-wsop-red text-white'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {item.icon}
                          <span className="font-medium">{item.label}</span>
                        </div>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </nav>

        {/* User Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">John Doe</p>
              <p className="text-xs text-gray-500">Trainee</p>
            </div>
          </div>
          <div className="mt-2 space-y-1">
            <Link href="/dashboard/profile" className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <Settings className="h-4 w-4" />
              Profile & Settings
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Bar */}
        <header className="bg-white dark:bg-gray-900 border-b shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Breadcrumb */}
            <div className="hidden lg:flex items-center gap-2 text-sm">
              <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
                Dashboard
              </Link>
              {pathname !== '/dashboard' && (
                <>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">
                    {navItems.find(item => pathname.startsWith(item.href))?.label}
                  </span>
                </>
              )}
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
              {/* Points Display */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
                <Trophy className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">
                  1,250 pts
                </span>
              </div>

              {/* Notifications */}
              <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Avatar */}
              <button className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main>{children}</main>
      </div>
    </div>
  )
}