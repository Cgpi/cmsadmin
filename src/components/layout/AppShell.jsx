import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Building2, Users, Truck, FileBarChart,
  CalendarDays, FolderClosed, ChevronLeft, ChevronRight,
  LogOut, HardHat, X, Settings, Bell, Images, MessageSquare, Sun, Moon,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import Badge from '../ui/Badge'
import { useTheme } from '../ui/useTheme'
import { useAuth } from '../../context/useAuth'
import { fetchContacts } from '../../data/contactData'
import navItems, { superAdminNav } from './navItems'

const iconMap = {
  LayoutDashboard, Building2, Users, Truck, FileBarChart,
  CalendarDays, FolderClosed, Settings, Images, MessageSquare,
}

const defaultUser = { name: 'Marcus Vale', role: 'Site Admin', avatar: 'https://i.pravatar.cc/80?img=12' }

const avatarForName = (name) => {
  const seed = encodeURIComponent(name || 'guest')
  return `https://api.dicebear.com/9.x/initials/svg?seed=${seed}&backgroundType=gradientLinear`
}

export default function AppShell({ children, pageTitle = 'Dashboard', user: userProp }) {
  const { user: authUser, logout } = useAuth()
  const navigate = useNavigate()

  const user = userProp || (authUser ? {
    name: authUser.name,
    role: authUser.role === 'super_admin' ? 'Super Admin' : 'Site Admin',
    avatar: avatarForName(authUser.name),
  } : defaultUser)

  const items = user.role === 'Super Admin' ? superAdminNav : navItems
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const { theme } = useTheme()

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
  }, [theme])

  // close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const sidebar = (isMobile = false) => (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className={cn(
        'flex h-16 items-center gap-2.5 border-b border-slate-200 px-4 dark:border-slate-800',
        collapsed && !isMobile && 'justify-center px-0',
      )}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-600 text-white shadow-sm shadow-amber-600/30">
          <HardHat className="h-5 w-5" />
        </div>
        {(!collapsed || isMobile) && (
          <div className="min-w-0">
            <p className="truncate text-sm font-bold tracking-tight text-slate-900 dark:text-white">CGPI Software CMS</p>
            <p className="truncate text-xs text-slate-400 dark:text-slate-500">Admin Platform</p>
          </div>
        )}
        {isMobile && (
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors dark:hover:bg-slate-800 dark:hover:text-slate-300"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto scrollbar-thin px-3 py-4">
        {items.map((item) => {
          const Icon = iconMap[item.icon]
          const active = location.pathname === item.to
          return (
            <Link
              key={item.id}
              to={item.to}
              onClick={() => isMobile && setMobileOpen(false)}
              className={cn(
                'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white',
                (collapsed && !isMobile) && 'justify-center px-0',
              )}
              title={collapsed && !isMobile ? item.label : undefined}
            >
              {active && (
                <motion.span
                  layoutId={isMobile ? 'mobile-active' : 'desktop-active'}
                  className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-amber-600"
                />
              )}
              <Icon className="h-5 w-5 shrink-0" />
              {(!collapsed || isMobile) && <span className="truncate">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="border-t border-slate-200 p-3 dark:border-slate-800">
        <div className={cn(
          'flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800',
          (collapsed && !isMobile) && 'justify-center',
        )}>
          <img
            src={user.avatar}
            alt="User avatar"
            className="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-white dark:ring-slate-700"
          />
          {(!collapsed || isMobile) && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">{user.name}</p>
              <Badge tone={user.role === 'Super Admin' ? 'amberSolid' : 'amber'} size="sm" className="mt-0.5">{user.role}</Badge>
            </div>
          )}
          {(!collapsed || isMobile) && (
            <button
              onClick={() => { logout(); navigate('/login') }}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors dark:hover:bg-slate-700 dark:hover:text-slate-300"
              title="Log out"
              aria-label="Log out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 border-r border-slate-200 bg-white transition-[width] duration-300 ease-in-out dark:border-slate-800 dark:bg-slate-900',
          collapsed ? 'w-[72px]' : 'w-64',
        )}
      >
        {sidebar(false)}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="absolute -right-3 top-20 hidden h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm hover:bg-slate-50 hover:text-slate-700 transition-colors md:flex dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-64 border-r border-slate-200 bg-white md:hidden dark:border-slate-800 dark:bg-slate-900"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              {sidebar(true)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className={cn('transition-[padding] duration-300 ease-in-out', collapsed ? 'md:pl-[72px]' : 'md:pl-64')}>
        <Topbar pageTitle={pageTitle} user={user} onMenuClick={() => setMobileOpen(true)} />
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  )
}

function Topbar({ pageTitle, user, onMenuClick }) {
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [hasNewContacts, setHasNewContacts] = useState(false)

  useEffect(() => {
    let mounted = true
    const refreshNewContacts = async () => {
      const contacts = await fetchContacts()
      if (mounted) setHasNewContacts(contacts.some((contact) => contact.status === 'new'))
    }

    refreshNewContacts()
    const intervalId = window.setInterval(refreshNewContacts, 30000)
    return () => {
      mounted = false
      window.clearInterval(intervalId)
    }
  }, [])

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md sm:px-6 dark:border-slate-800 dark:bg-slate-900/80">
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors md:hidden dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
        aria-label="Open menu"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-lg font-semibold text-slate-900 dark:text-white">{pageTitle}</h1>
      </div>

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
        aria-label="Toggle theme"
      >
        <AnimatePresence mode="wait" initial={false}>
          {theme === 'dark' ? (
            <motion.span key="moon" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }} transition={{ duration: 0.2 }}>
              <Moon className="h-5 w-5" />
            </motion.span>
          ) : (
            <motion.span key="sun" initial={{ opacity: 0, rotate: 90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: -90 }} transition={{ duration: 0.2 }}>
              <Sun className="h-5 w-5" />
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <button
        onClick={() => navigate('/dashboard/contacts')}
        className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
        aria-label="Open contact messages"
        title="Open contact messages"
      >
        <Bell className="h-5 w-5" />
        {hasNewContacts && (
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-slate-900" />
        )}
      </button>
      <img
        src={user.avatar}
        alt="User avatar"
        className="h-9 w-9 rounded-full object-cover ring-2 ring-white shadow-sm md:hidden dark:ring-slate-700"
      />
    </header>
  )
}
