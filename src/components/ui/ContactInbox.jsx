import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Mail, Phone, Trash2, ArrowLeft, MessageSquare, AlertTriangle,
  Mailbox, ChevronDown,
} from 'lucide-react'
import { Card } from './Card'
import Badge from './Badge'
import Button from './Button'
import Modal from './Modal'
import EmptyState from './EmptyState'
import { Skeleton } from './Skeleton'
import { useToast } from './Toast'
import { contacts as initialContacts, statusConfig, countByStatus, relativeTime } from '../../data/contactData'
import { cn } from '../../lib/utils'

const filters = ['All', 'New', 'Read', 'Replied']
const statusFilterKey = { All: 'All', New: 'new', Read: 'read', Replied: 'replied' }

export default function ContactInbox({ siteName }) {
  const [contacts, setContacts] = useState(initialContacts)
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('All')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [mobileView, setMobileView] = useState('list')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [statusMenuOpen, setStatusMenuOpen] = useState(false)
  const toast = useToast()

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(false)
      setSelectedId(initialContacts[0]?.id ?? null)
    }, 900)
    return () => clearTimeout(t)
  }, [])

  const counts = useMemo(() => countByStatus(contacts), [contacts])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return contacts.filter((m) => {
      if (activeFilter !== 'All' && m.status !== statusFilterKey[activeFilter]) return false
      if (q && !m.sender.toLowerCase().includes(q) && !m.subject.toLowerCase().includes(q)) return false
      return true
    })
  }, [contacts, activeFilter, query])

  const selected = useMemo(
    () => contacts.find((m) => m.id === selectedId) || null,
    [contacts, selectedId],
  )

  useEffect(() => {
    if (loading) return
    if (!selected && filtered.length > 0) setSelectedId(filtered[0].id)
  }, [loading, selected, filtered])

  const openMessage = (id) => {
    setSelectedId(id)
    setMobileView('detail')
    setContacts((prev) =>
      prev.map((m) => (m.id === id && m.status === 'new' ? { ...m, status: 'read' } : m)),
    )
  }

  const changeStatus = (newStatus) => {
    if (!selected) return
    setStatusMenuOpen(false)
    if (selected.status === newStatus) return
    setContacts((prev) => prev.map((m) => (m.id === selected.id ? { ...m, status: newStatus } : m)))
    toast.success(`Marked as ${statusConfig[newStatus].label}.`)
  }

  const confirmDelete = () => {
    setContacts((prev) => prev.filter((m) => m.id !== deleteTarget.id))
    toast.success(`Message from ${deleteTarget.sender} was deleted.`)
    setDeleteTarget(null)
  }

  const replyMailto = selected ? `mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}` : '#'

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Messages</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {contacts.length} messages · {counts.new} new
        </p>
      </div>

      {/* Filters + search */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={cn(
                'inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-all duration-200',
                activeFilter === f
                  ? 'bg-amber-600 text-white shadow-sm shadow-amber-600/20'
                  : 'bg-white text-slate-600 ring-1 ring-inset ring-slate-200 hover:bg-slate-50 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700 dark:hover:bg-slate-700',
              )}
            >
              {f}
              <span
                className={cn(
                  'inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-xs font-semibold',
                  activeFilter === f ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500',
                )}
              >
                {counts[statusFilterKey[f]] ?? 0}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search sender or subject..."
            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
          />
        </div>
      </div>

      {/* Split layout */}
      <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
        {/* List panel */}
        <div className={cn('lg:block', mobileView === 'list' ? 'block' : 'hidden')}>
          <Card className="flex h-[640px] flex-col overflow-hidden">
            <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-700">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Inbox</p>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              {loading ? (
                <MessageListSkeleton />
              ) : filtered.length === 0 ? (
                <div className="p-6">
                  <EmptyState
                    icon={Mailbox}
                    title="No messages"
                    description={query ? 'No messages match your search.' : 'There are no messages in this folder.'}
                  />
                </div>
              ) : (
                <ul className="divide-y divide-slate-100 dark:divide-slate-700">
                  <AnimatePresence initial={false}>
                    {filtered.map((m) => {
                      const cfg = statusConfig[m.status]
                      const isSelected = m.id === selectedId
                      const isUnread = cfg.markUnread
                      return (
                        <motion.li
                          key={m.id}
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <button
                            onClick={() => openMessage(m.id)}
                            className={cn(
                              'flex w-full gap-3 px-4 py-3.5 text-left transition-colors',
                              isSelected ? 'bg-amber-50/70' : 'hover:bg-slate-50',
                            )}
                          >
                            <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', cfg.dot)} />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <p className={cn(
                                  'truncate text-sm',
                                  isUnread ? 'font-semibold text-slate-900' : 'font-medium text-slate-700',
                                )}>
                                  {m.sender}
                                </p>
                                <span className="shrink-0 text-xs text-slate-400">{relativeTime(m.minutesAgo)}</span>
                              </div>
                              <p className={cn(
                                'mt-0.5 truncate text-sm',
                                isUnread ? 'font-medium text-slate-800' : 'text-slate-600',
                              )}>
                                {m.subject}
                              </p>
                              <p className="mt-0.5 truncate text-xs text-slate-400">{m.preview}</p>
                            </div>
                          </button>
                        </motion.li>
                      )
                    })}
                  </AnimatePresence>
                </ul>
              )}
            </div>
          </Card>
        </div>

        {/* Detail panel */}
        <div className={cn('lg:block', mobileView === 'detail' ? 'block' : 'hidden')}>
          <Card className="flex h-[640px] flex-col overflow-hidden">
            {loading ? (
              <DetailSkeleton />
            ) : !selected ? (
              <div className="flex h-full items-center justify-center p-6">
                <EmptyState
                  icon={MessageSquare}
                  title="No message selected"
                  description="Select a message from the list to read it here."
                />
              </div>
            ) : (
              <DetailPanel
                message={selected}
                onBack={() => setMobileView('list')}
                onChangeStatus={changeStatus}
                onDelete={() => setDeleteTarget(selected)}
                statusMenuOpen={statusMenuOpen}
                setStatusMenuOpen={setStatusMenuOpen}
                replyMailto={replyMailto}
              />
            )}
          </Card>
        </div>
      </div>

      {/* Delete confirmation */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete message"
        description="This will permanently remove this message from your inbox."
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" onClick={confirmDelete}>
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-3 rounded-xl bg-red-50 p-4 ring-1 ring-inset ring-red-100">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <p className="text-sm text-red-800">
            You're about to delete the message from <span className="font-semibold">{deleteTarget?.sender}</span>.
            This action cannot be undone.
          </p>
        </div>
      </Modal>
    </div>
  )
}

function DetailPanel({ message, onBack, onChangeStatus, onDelete, statusMenuOpen, setStatusMenuOpen, replyMailto }) {
  const cfg = statusConfig[message.status]
  return (
    <div className="flex h-full flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors lg:hidden"
          aria-label="Back to list"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <span className={cn('h-2 w-2 rounded-full', cfg.dot)} />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{cfg.label}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Status select */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setStatusMenuOpen((o) => !o)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Status <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <AnimatePresence>
              {statusMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97, y: -2 }}
                  transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute right-0 z-30 mt-1.5 min-w-[160px] overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-card-hover dark:border-slate-700 dark:bg-slate-800"
                >
                  {Object.entries(statusConfig).map(([key, c]) => (
                    <button
                      key={key}
                      onClick={() => onChangeStatus(key)}
                      className={cn(
                        'flex w-full items-center gap-2.5 px-3 py-2 text-sm font-medium transition-colors hover:bg-slate-50',
                        message.status === key ? 'text-amber-600 dark:text-amber-400' : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white',
                      )}
                    >
                      <span className={cn('h-2 w-2 rounded-full', c.dot)} />
                      {c.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={onDelete}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-red-500/10 dark:hover:text-red-400"
          >
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        <h3 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">{message.subject}</h3>

        {/* Sender info */}
        <div className="mt-4 flex flex-wrap items-start gap-4 rounded-xl bg-slate-50/70 p-4 ring-1 ring-inset ring-slate-100 dark:bg-slate-900/40 dark:ring-slate-700">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-semibold text-amber-700">
            {initials(message.sender)}
          </div>
          <div className="min-w-0 flex-1 space-y-1.5">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{message.sender}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
              <a href={`mailto:${message.email}`} className="inline-flex items-center gap-1.5 hover:text-amber-600 transition-colors">
                <Mail className="h-3.5 w-3.5" /> {message.email}
              </a>
              {message.phone && (
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" /> {message.phone}
                </span>
              )}
            </div>
          </div>
          <div className="shrink-0">
            <Badge tone={cfg.badge} dot>{cfg.label}</Badge>
          </div>
        </div>

        {/* Message body */}
        <div className="mt-5 whitespace-pre-wrap rounded-xl border border-slate-100 bg-white p-5 text-sm leading-relaxed text-slate-700 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300">
          {message.body}
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 dark:border-slate-700">
        <span className="text-xs text-slate-400 dark:text-slate-500">Received {relativeTime(message.minutesAgo)}</span>
        <a href={replyMailto}>
          <Button size="sm">
            <Mail className="h-4 w-4" /> Reply via Email
          </Button>
        </a>
      </div>
    </div>
  )
}

function initials(name) {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function MessageListSkeleton() {
  return (
    <div className="divide-y divide-slate-100">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex gap-3 px-4 py-3.5">
          <Skeleton className="mt-1.5 h-2 w-2 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-3 w-10" />
            </div>
            <Skeleton className="h-3.5 w-3/4" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className="space-y-5 p-5">
      <Skeleton className="h-6 w-2/3" />
      <div className="flex gap-4 rounded-xl bg-slate-50/70 p-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
          <Skeleton className="h-3 w-40" />
        </div>
      </div>
      <div className="space-y-2 rounded-xl border border-slate-100 p-5">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-11/12" />
        <Skeleton className="h-3 w-10/12" />
        <Skeleton className="h-3 w-3/4" />
      </div>
    </div>
  )
}
