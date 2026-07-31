import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, MoreVertical, Pencil, Trash2, Power, PowerOff,
  Plus, Building2, Mail, CalendarDays, AlertTriangle, Settings2,
} from 'lucide-react'
import AppShell from '../components/layout/AppShell'
import { Card } from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import DropdownMenu from '../components/ui/DropdownMenu'
import EmptyState from '../components/ui/EmptyState'
import SiteFormModal from '../components/admin/SiteFormModal'
import { useToast } from '../components/ui/Toast'
import { sites as initialSites } from '../data/adminData'
import { cn } from '../lib/utils'

export default function ManageSites() {
  const navigate = useNavigate()
  const [sites, setSites] = useState(initialSites)
  const [query, setQuery] = useState('')
  const [formModal, setFormModal] = useState({ open: false, mode: 'create', initial: null })
  const [deleteTarget, setDeleteTarget] = useState(null)

  const toast = useToast()

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return sites
    return sites.filter(
      (s) => s.siteName.toLowerCase().includes(q) || s.email.toLowerCase().includes(q),
    )
  }, [sites, query])

  const openCreate = () => setFormModal({ open: true, mode: 'create', initial: null })
  const openEdit = (site) => setFormModal({ open: true, mode: 'edit', initial: site })

  const handleSubmit = (formData) => {
    if (formModal.mode === 'create') {
      const newSite = {
        ...formData,
        id: Date.now(),
        createdAt: new Date().toISOString().slice(0, 10),
        images: 0,
        messages: 0,
        status: formData.active ? 'active' : 'inactive',
      }
      setSites((prev) => [newSite, ...prev])
      toast.success(`Site "${formData.siteName}" was created.`, { title: 'Site created successfully' })
    } else {
      setSites((prev) =>
        prev.map((s) =>
          s.id === formModal.initial.id
            ? { ...s, ...formData, status: formData.active ? 'active' : 'inactive' }
            : s,
        ),
      )
      toast.success(`Site "${formData.siteName}" was updated.`, { title: 'Changes saved' })
    }
    setFormModal({ open: false, mode: 'create', initial: null })
  }

  const toggleStatus = (site) => {
    setSites((prev) =>
      prev.map((s) =>
        s.id === site.id ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' } : s,
      ),
    )
    const nowActive = site.status !== 'active'
    toast.info(`"${site.siteName}" is now ${nowActive ? 'active' : 'inactive'}.`)
  }

  const confirmDelete = () => {
    setSites((prev) => prev.filter((s) => s.id !== deleteTarget.id))
    toast.success(`"${deleteTarget.siteName}" was permanently removed.`)
    setDeleteTarget(null)
  }

  const rowActions = (site) => [
    { label: 'Manage', icon: Settings2, onClick: () => navigate(`/admin/users/${site.id}/manage`) },
    { label: 'Edit', icon: Pencil, onClick: () => openEdit(site) },
    {
      label: site.status === 'active' ? 'Deactivate' : 'Activate',
      icon: site.status === 'active' ? PowerOff : Power,
      onClick: () => toggleStatus(site),
    },
    { label: 'Delete', icon: Trash2, onClick: () => setDeleteTarget(site), danger: true },
  ]

  return (
    <AppShell pageTitle="Manage Sites">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Manage Sites</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {sites.length} sub-admin accounts · {sites.filter((s) => s.status === 'active').length} active
            </p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> Create New Site
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by site name or email..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
          />
        </div>

        {/* Empty state */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No sites found"
            description={query ? "No sites match your search. Try a different term." : "Get started by creating your first site."}
            action={query ? <Button variant="secondary" size="sm" onClick={() => setQuery('')}>Clear search</Button> : <Button size="sm" onClick={openCreate}><Plus className="h-4 w-4" /> Create New Site</Button>}
          />
        ) : (
          <>
            {/* Desktop table */}
            <Card className="hidden overflow-hidden md:block">
              <table className="w-full text-left text-sm dark:text-slate-300">
                <thead className="border-b border-slate-100 bg-slate-50/60 text-xs uppercase tracking-wide text-slate-400 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-500">
                  <tr>
                    <th className="px-6 py-3 font-medium">Site Name</th>
                    <th className="px-6 py-3 font-medium">Contact</th>
                    <th className="px-6 py-3 font-medium">Email</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium">Created</th>
                    <th className="px-6 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((site) => (
                    <tr key={site.id} className="transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-700/30">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900 dark:text-white">{site.siteName}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{site.contactName}</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{site.email}</td>
                      <td className="px-6 py-4">
                        <Badge tone={site.status === 'active' ? 'green' : 'neutral'} dot>
                          {site.status === 'active' ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{formatDate(site.createdAt)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="secondary" size="sm" onClick={() => navigate(`/admin/users/${site.id}/manage`)}>
                            <Settings2 className="h-4 w-4" /> Manage
                          </Button>
                          <DropdownMenu items={rowActions(site)}>
                            <MoreVertical className="h-4 w-4" />
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>

            {/* Mobile stacked cards */}
            <div className="space-y-3 md:hidden">
              {filtered.map((site) => (
                <Card key={site.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-900">{site.siteName}</p>
                      <p className="truncate text-sm text-slate-600">{site.contactName}</p>
                    </div>
                    <DropdownMenu items={rowActions(site)}>
                      <MoreVertical className="h-4 w-4" />
                    </DropdownMenu>
                  </div>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Mail className="h-3.5 w-3.5" /> <span className="truncate">{site.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <CalendarDays className="h-3.5 w-3.5" /> {formatDate(site.createdAt)}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <Badge tone={site.status === 'active' ? 'green' : 'neutral'} dot>
                      {site.status === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                    <Button variant="secondary" size="sm" onClick={() => navigate(`/admin/users/${site.id}/manage`)}>
                      <Settings2 className="h-4 w-4" /> Manage
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </motion.div>

      {/* Create / Edit modal */}
      <SiteFormModal
        open={formModal.open}
        mode={formModal.mode}
        initial={formModal.initial}
        onClose={() => setFormModal({ open: false, mode: 'create', initial: null })}
        onSubmit={handleSubmit}
      />

      {/* Delete confirmation */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete site"
        description="This will permanently remove this site and all its data."
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" onClick={confirmDelete}>
              <Trash2 className="h-4 w-4" /> Delete permanently
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-3 rounded-xl bg-red-50 p-4 ring-1 ring-inset ring-red-100">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <p className="text-sm text-red-800">
            You're about to delete <span className="font-semibold">{deleteTarget?.siteName}</span> along with
            its images, contact messages, and sub-admin account. This action cannot be undone.
          </p>
        </div>
      </Modal>
    </AppShell>
  )
}

function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
