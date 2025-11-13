'use client'

import { useState, useEffect, useMemo, memo, useCallback, startTransition } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
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
import { createClient } from '@/lib/supabase/client'

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  adminOnly?: boolean
}

// Define nav items with icon components (not JSX) to prevent re-creation
const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: Home },
  { label: 'Learning', href: '/dashboard/learning', icon: BookOpen, badge: 'Day 3' },
  { label: 'Content', href: '/dashboard/content', icon: FileText },
  { label: 'Assessment', href: '/dashboard/assessment', icon: Target },
  { label: 'Leaderboard', href: '/dashboard/leaderboard', icon: Trophy },
  { label: 'Community', href: '/dashboard/community', icon: Users },
] as const

const adminNavItems = [
  { label: 'Lesson Content', href: '/dashboard/admin/lessons', icon: BookOpen, adminOnly: true },
  { label: 'AI Quiz Generator', href: '/dashboard/admin/quizzes', icon: Sparkles, adminOnly: true },
] as const

// Memoized NavItem Component - prevents re-renders when sidebar state changes
interface NavItemComponentProps {
  item: NavItem
  isActive: boolean
  activeClassName: string
  inactiveClassName: string
  onNavigate: (href: string) => void
}

const NavItemComponent = memo(({ item, isActive, activeClassName, inactiveClassName, onNavigate }: NavItemComponentProps) => {
  const Icon = item.icon

  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    onNavigate(item.href)
  }, [item.href, onNavigate])

  return (
    <a
      href={item.href}
      onClick={handleClick}
      className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors cursor-pointer ${
        isActive ? activeClassName : inactiveClassName
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5" />
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
    </a>
  )
}, (prevProps, nextProps) => {
  // Custom comparison: Only re-render if isActive state actually changed
  // This prevents unnecessary re-renders of inactive nav items during navigation
  return (
    prevProps.isActive === nextProps.isActive &&
    prevProps.item.href === nextProps.item.href &&
    prevProps.activeClassName === nextProps.activeClassName &&
    prevProps.inactiveClassName === nextProps.inactiveClassName &&
    prevProps.onNavigate === nextProps.onNavigate
  )
})
NavItemComponent.displayName = 'NavItemComponent'

// Memoized Navigation List - only re-renders when pathname changes
interface NavigationListProps {
  items: readonly NavItem[]
  pathname: string
  mounted: boolean
  activeClassName: string
  inactiveClassName: string
  onNavigate: (href: string) => void
}

const NavigationList = memo(({ items, pathname, mounted, activeClassName, inactiveClassName, onNavigate }: NavigationListProps) => {
  // Calculate isActive for all items once, only when pathname/mounted changes
  const itemsWithActive = useMemo(() =>
    items.map((item) => ({
      item,
      isActive: mounted && (pathname === item.href ||
        (item.href !== '/dashboard' && pathname.startsWith(item.href)))
    })),
    [items, pathname, mounted]
  )

  return (
    <ul className="space-y-1">
      {itemsWithActive.map(({ item, isActive }) => (
        <li key={item.href}>
          <NavItemComponent
            item={item}
            isActive={isActive}
            activeClassName={activeClassName}
            inactiveClassName={inactiveClassName}
            onNavigate={onNavigate}
          />
        </li>
      ))}
    </ul>
  )
})
NavigationList.displayName = 'NavigationList'

// Memoized Admin Navigation Section
interface AdminNavigationProps {
  userRole: string
  pathname: string
  mounted: boolean
  onNavigate: (href: string) => void
}

const AdminNavigation = memo(({ userRole, pathname, mounted, onNavigate }: AdminNavigationProps) => {
  if (userRole !== 'admin' && userRole !== 'trainer') {
    return null
  }

  return (
    <div className="mt-6">
      <div className="px-3 py-2 text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
        <Shield className="h-4 w-4" />
        Admin
      </div>
      <NavigationList
        items={adminNavItems}
        pathname={pathname}
        mounted={mounted}
        activeClassName="bg-wsop-red text-white"
        inactiveClassName="hover:bg-gray-100 dark:hover:bg-gray-800"
        onNavigate={onNavigate}
      />
    </div>
  )
})
AdminNavigation.displayName = 'AdminNavigation'

// Memoized Breadcrumb Component
interface BreadcrumbProps {
  pathname: string
}

const Breadcrumb = memo(({ pathname }: BreadcrumbProps) => {
  // Simplified: No useMemo needed, direct find is fast enough
  if (pathname === '/dashboard') {
    return (
      <div className="hidden lg:flex items-center gap-2 text-sm">
        <span className="font-medium">Dashboard</span>
      </div>
    )
  }

  const currentNavItem = navItems.find(item =>
    item.href !== '/dashboard' && pathname.startsWith(item.href)
  ) || adminNavItems.find(item => pathname.startsWith(item.href))

  return (
    <div className="hidden lg:flex items-center gap-2 text-sm">
      <Link href="/dashboard" prefetch={false} className="text-gray-500 hover:text-gray-700">
        Dashboard
      </Link>
      {currentNavItem && (
        <>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <span className="font-medium">{currentNavItem.label}</span>
        </>
      )}
    </div>
  )
})
Breadcrumb.displayName = 'Breadcrumb'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  // 개발 모드: 기본 admin 역할 설정 (TODO: 로그인 시스템 활성화 시 'trainee'로 변경)
  const [userRole, setUserRole] = useState<string>('admin')
  const [mounted, setMounted] = useState(false)
  // Debounced pathname to reduce re-renders
  const [debouncedPathname, setDebouncedPathname] = useState(pathname)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Debounce pathname updates to prevent navigation throttling
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      startTransition(() => {
        setDebouncedPathname(pathname)
      })
    }, 50) // 50ms debounce

    return () => clearTimeout(timeoutId)
  }, [pathname])

  // Navigation handler using useRouter instead of Next.js Link
  const handleNavigate = useCallback((href: string) => {
    startTransition(() => {
      router.push(href)
    })
  }, [router])

  // Memoize sidebar toggle handler
  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev)
  }, [])

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-900 border-r shadow-lg transform transition-transform z-50 lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Logo */}
        <div className="p-6 border-b">
          <Link href="/dashboard" prefetch={false} className="flex items-center gap-3">
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
          <NavigationList
            items={navItems}
            pathname={debouncedPathname}
            mounted={mounted}
            activeClassName="bg-ggp-primary text-white"
            inactiveClassName="hover:bg-gray-100 dark:hover:bg-gray-800"
            onNavigate={handleNavigate}
          />

          {/* Admin Section */}
          <AdminNavigation
            userRole={userRole}
            pathname={debouncedPathname}
            mounted={mounted}
            onNavigate={handleNavigate}
          />
        </nav>

        {/* User Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">테스트 관리자</p>
              <p className="text-xs text-gray-500">Admin (개발 모드)</p>
            </div>
          </div>
          <div className="mt-2 space-y-1">
            <Link href="/dashboard/profile" prefetch={false} className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
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
              onClick={toggleSidebar}
              className="lg:hidden"
              aria-label="Toggle sidebar"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Breadcrumb - Memoized */}
            <Breadcrumb pathname={debouncedPathname} />

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