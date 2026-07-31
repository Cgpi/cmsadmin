import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Eye, Images, MessageSquare } from 'lucide-react'
import AppShell from '../components/layout/AppShell'
import { Card } from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import ImageGallery from '../components/ui/ImageGallery'
import ContactInbox from '../components/ui/ContactInbox'
import { sites } from '../data/adminData'
import { useAuth } from '../context/AuthContext'
import { cn } from '../lib/utils'

const superAdminUser = {
  name: 'Adrian Vasquez',
  role: 'Super Admin',
  avatar: 'https://i.pravatar.cc/80?img=33',
}

const tabs = [
  { id: 'images', label: 'Images', icon: Images },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
]

export default function ManageSite() {
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState('images')

  const site = sites.find((s) => s.id === Number(id))

  return (
    <AppShell pageTitle="Manage Site" user={superAdminUser}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-6"
      >
        {/* Back link */}
        <Link
          to="/admin/users"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Sites
        </Link>

        {!site ? (
          <Card className="p-12 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">This site could not be found.</p>
            <Link to="/admin/users" className="mt-3 inline-block text-sm font-medium text-amber-600 hover:text-amber-700">
              Return to all sites
            </Link>
          </Card>
        ) : (
          <>
            {/* Viewing-as banner */}
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-500/30 dark:bg-amber-500/10">
              <Eye className="h-4 w-4 shrink-0 text-amber-600" />
              <p className="text-sm font-medium text-amber-800 dark:text-amber-400">
                Viewing as: <span className="font-bold">{site.siteName}</span>
              </p>
              <Badge tone="amberSolid" size="sm" className="ml-auto">Super Admin Mode</Badge>
            </div>

            {/* Site header */}
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">{site.siteName}</h2>
                <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
                  <span>Contact: <span className="font-medium text-slate-700 dark:text-slate-300">{site.contactName}</span></span>
                  <span>Email: <span className="font-medium text-slate-700 dark:text-slate-300">{site.email}</span></span>
                </div>
              </div>
              <Badge tone={site.status === 'active' ? 'green' : 'neutral'} dot>
                {site.status === 'active' ? 'Active' : 'Inactive'}
              </Badge>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const active = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'relative inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors',
                      active
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                    {active && (
                      <motion.span
                        layoutId="manage-tab"
                        className="absolute inset-x-0 -bottom-px h-0.5 bg-amber-600"
                      />
                    )}
                  </button>
                )
              })}
            </div>

            {/* Tab content */}
            <div>
              {activeTab === 'images' && <ImageGallery siteName={site.siteName} />}
              {activeTab === 'messages' && <ContactInbox siteName={site.siteName} />}
            </div>
          </>
        )}
      </motion.div>
    </AppShell>
  )
}
