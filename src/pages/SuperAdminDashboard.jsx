import { motion } from 'framer-motion'
import {
  Building2, CheckCircle2, ImageIcon, MessageSquare,
  TrendingUp, TrendingDown, ArrowUpRight, ArrowRight,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import AppShell from '../components/layout/AppShell'
import { Card } from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { sites, recentActivity, computeStats, relativeTime } from '../data/adminData'
import { useAuth } from '../context/AuthContext'

const stats = computeStats(sites)

const statCards = [
  { label: 'Total Sites', value: stats.totalSites, icon: Building2, trend: '+2', trendUp: true, sub: 'this month', tone: 'bg-amber-50 text-amber-700' },
  { label: 'Active Sites', value: stats.activeSites, icon: CheckCircle2, trend: '88%', trendUp: true, sub: 'uptime rate', tone: 'bg-emerald-50 text-emerald-700' },
  { label: 'Images Across Sites', value: stats.totalImages.toLocaleString(), icon: ImageIcon, trend: '+128', trendUp: true, sub: 'this week', tone: 'bg-sky-50 text-sky-700' },
  { label: 'New Contact Messages', value: stats.newMessages, icon: MessageSquare, trend: '-3', trendUp: false, sub: 'vs last week', tone: 'bg-violet-50 text-violet-700' },
]

const activityIcon = {
  message: MessageSquare,
  site: Building2,
  status: CheckCircle2,
}
const activityTone = {
  message: 'bg-sky-50 text-sky-600',
  site: 'bg-amber-50 text-amber-600',
  status: 'bg-slate-100 text-slate-500',
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
}
const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
}

export default function SuperAdminDashboard() {
  const { user } = useAuth()
  const firstName = (user?.name || 'Adrian').split(' ')[0]
  return (
    <AppShell pageTitle="Dashboard">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {/* Welcome */}
        <motion.div variants={item}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Welcome back, {firstName}</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Here's the platform overview across all client sites.</p>
            </div>
            <Badge tone="amberSolid" dot>Super Admin</Badge>
          </div>
        </motion.div>

        {/* Stat cards */}
        <motion.div variants={item} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.label} className="p-5 transition-shadow duration-200 hover:shadow-card-hover">
                <div className="flex items-start justify-between">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.tone}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                      stat.trendUp ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {stat.trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {stat.trend}
                  </span>
                </div>
                <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{stat.value}</p>
                <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-300">{stat.label}</p>
                <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{stat.sub}</p>
              </Card>
            )
          })}
        </motion.div>

        {/* Recent activity */}
        <motion.div variants={item}>
          <Card>
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-700">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">Recent Activity</h3>
                <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Latest events across all client sites.</p>
              </div>
              <Link to="/admin/users">
                <Button variant="ghost" size="sm">
                  View all sites <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <ul className="divide-y divide-slate-100 dark:divide-slate-700">
              {recentActivity.map((act) => {
                const Icon = activityIcon[act.type]
                return (
                  <li key={act.id} className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-700/30">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${activityTone[act.type]}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="min-w-0 flex-1 truncate text-sm text-slate-700 dark:text-slate-300">{act.text}</p>
                    <span className="shrink-0 text-xs font-medium text-slate-400 dark:text-slate-500">{relativeTime(act.minutesAgo)}</span>
                  </li>
                )
              })}
            </ul>
          </Card>
        </motion.div>
      </motion.div>
    </AppShell>
  )
}
