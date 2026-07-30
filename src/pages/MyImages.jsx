import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Pencil, Trash2, Power, PowerOff, GripVertical, ImageIcon, AlertTriangle,
} from 'lucide-react'
import AppShell from '../components/layout/AppShell'
import { Card } from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import EmptyState from '../components/ui/EmptyState'
import UploadImageModal from '../components/admin/UploadImageModal'
import { useToast } from '../components/ui/Toast'
import { images as initialImages, locations, countByLocation } from '../data/imageData'
import { cn } from '../lib/utils'

const subAdminUser = {
  name: 'Rohan Deshpande',
  role: 'Site Admin',
  avatar: 'https://i.pravatar.cc/80?img=12',
}

const tabs = ['All', ...locations]

export default function MyImages() {
  const [images, setImages] = useState(initialImages)
  const [activeTab, setActiveTab] = useState('All')
  const [activeOnly, setActiveOnly] = useState(false)
  const [uploadModal, setUploadModal] = useState({ open: false, mode: 'create', initial: null })
  const [deleteTarget, setDeleteTarget] = useState(null)
  const toast = useToast()

  const counts = useMemo(() => countByLocation(images), [images])

  const filtered = useMemo(() => {
    return images.filter((img) => {
      if (activeTab !== 'All' && img.location !== activeTab) return false
      if (activeOnly && !img.active) return false
      return true
    }).sort((a, b) => a.order - b.order)
  }, [images, activeTab, activeOnly])

  const openCreate = () => setUploadModal({ open: true, mode: 'create', initial: null })
  const openEdit = (img) => setUploadModal({ open: true, mode: 'edit', initial: img })

  const handleSubmit = (formData) => {
    if (uploadModal.mode === 'create') {
      const locImages = images.filter((i) => i.location === formData.location)
      const newImg = {
        ...formData,
        id: Date.now(),
        url: formData.url,
        order: locImages.length + 1,
      }
      setImages((prev) => [newImg, ...prev])
      toast.success(`Image added to ${formData.location}.`, { title: 'Image uploaded' })
    } else {
      setImages((prev) => prev.map((i) => (i.id === uploadModal.initial.id ? { ...i, ...formData } : i)))
      toast.success('Image details updated.', { title: 'Changes saved' })
    }
    setUploadModal({ open: false, mode: 'create', initial: null })
  }

  const toggleActive = (img) => {
    setImages((prev) => prev.map((i) => (i.id === img.id ? { ...i, active: !i.active } : i)))
    toast.info(`"${img.title || 'Untitled'}" is now ${img.active ? 'inactive' : 'active'}.`)
  }

  const confirmDelete = () => {
    setImages((prev) => prev.filter((i) => i.id !== deleteTarget.id))
    toast.success(`"${deleteTarget.title || 'Untitled'}" was deleted.`)
    setDeleteTarget(null)
  }

  const tabCount = (tab) => (tab === 'All' ? images.length : counts[tab] || 0)

  return (
    <AppShell pageTitle="My Images" user={subAdminUser}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">My Images</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{images.length} images across {locations.length} locations</p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> Upload Image
          </Button>
        </div>

        {/* Filter tabs + active toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-all duration-200',
                  activeTab === tab
                    ? 'bg-amber-600 text-white shadow-sm shadow-amber-600/20'
                    : 'bg-white text-slate-600 ring-1 ring-inset ring-slate-200 hover:bg-slate-50 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700 dark:hover:bg-slate-700',
                )}
              >
                {tab}
                <span
                  className={cn(
                    'inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-xs font-semibold',
                    activeTab === tab ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500',
                  )}
                >
                  {tabCount(tab)}
                </span>
              </button>
            ))}
          </div>

          <label className="inline-flex cursor-pointer items-center gap-2.5 rounded-xl bg-white px-3.5 py-2 text-sm font-medium text-slate-600 ring-1 ring-inset ring-slate-200 transition-colors hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700 dark:hover:bg-slate-700">
            <Toggle checked={activeOnly} onChange={setActiveOnly} />
            Active only
          </label>
        </div>

        {/* Grid or empty state */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={ImageIcon}
            title={activeOnly ? 'No active images here' : 'No images yet'}
            description={
              activeOnly
                ? `There are no active images in ${activeTab === 'All' ? 'any location' : activeTab}. Toggle the filter off or upload a new image.`
                : `Upload your first image to ${activeTab === 'All' ? 'get started' : activeTab}.`
            }
            action={<Button size="sm" onClick={openCreate}><Plus className="h-4 w-4" /> Upload Image</Button>}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((img) => (
                <motion.div
                  key={img.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                >
                  <ImageCard
                    image={img}
                    onEdit={() => openEdit(img)}
                    onToggle={() => toggleActive(img)}
                    onDelete={() => setDeleteTarget(img)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* Upload / Edit modal */}
      <UploadImageModal
        open={uploadModal.open}
        mode={uploadModal.mode}
        initial={uploadModal.initial}
        onClose={() => setUploadModal({ open: false, mode: 'create', initial: null })}
        onSubmit={handleSubmit}
      />

      {/* Delete confirmation */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete image"
        description="This will permanently remove this image from your site."
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
            You're about to delete <span className="font-semibold">{deleteTarget?.title || 'this image'}</span>.
            This action cannot be undone.
          </p>
        </div>
      </Modal>
    </AppShell>
  )
}

function ImageCard({ image, onEdit, onToggle, onDelete }) {
  return (
    <Card className="group overflow-hidden transition-shadow duration-200 hover:shadow-card-hover">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <img
          src={image.url}
          alt={image.title || 'Site image'}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/10 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

        {/* drag handle */}
        <div className="absolute left-2 top-2 flex h-7 w-7 cursor-grab items-center justify-center rounded-lg bg-white/90 text-slate-500 opacity-0 shadow-sm backdrop-blur transition-opacity duration-200 group-hover:opacity-100" title="Drag to reorder">
          <GripVertical className="h-4 w-4" />
        </div>

        {/* hover actions */}
        <div className="absolute right-2 top-2 flex gap-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <ActionBtn label="Edit" onClick={onEdit}><Pencil className="h-3.5 w-3.5" /></ActionBtn>
          <ActionBtn label={image.active ? 'Deactivate' : 'Activate'} onClick={onToggle}>
            {image.active ? <PowerOff className="h-3.5 w-3.5" /> : <Power className="h-3.5 w-3.5" />}
          </ActionBtn>
          <ActionBtn label="Delete" danger onClick={onDelete}><Trash2 className="h-3.5 w-3.5" /></ActionBtn>
        </div>

        {/* sort order chip */}
        <div className="absolute bottom-2 left-2 rounded-lg bg-white/90 px-2 py-0.5 text-xs font-semibold text-slate-600 shadow-sm backdrop-blur">
          #{image.order}
        </div>
      </div>

      <div className="p-3">
        <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{image.title || 'Untitled'}</p>
        <div className="mt-2 flex items-center justify-between">
          <Badge tone="blue" size="sm">{image.location}</Badge>
          <Badge tone={image.active ? 'green' : 'neutral'} size="sm" dot>
            {image.active ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </div>
    </Card>
  )
}

function ActionBtn({ children, label, danger, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={cn(
        'flex h-7 w-7 items-center justify-center rounded-lg bg-white/90 text-slate-600 shadow-sm backdrop-blur transition-colors hover:bg-white',
        danger && 'hover:text-red-600',
      )}
    >
      {children}
    </button>
  )
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:ring-offset-2',
        checked ? 'bg-amber-600' : 'bg-slate-300',
      )}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200',
          checked ? 'translate-x-4' : 'translate-x-0.5',
        )}
      />
    </button>
  )
}
