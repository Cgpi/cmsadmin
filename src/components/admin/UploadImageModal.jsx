import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UploadCloud, ImageIcon, CheckCircle2 } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { cn } from '../../lib/utils'
import { locations, placeholderPreview } from '../../data/imageData'

export default function UploadImageModal({ open, onClose, mode = 'create', initial, onSubmit }) {
  const [form, setForm] = useState(() => ({
    title: '',
    location: 'Gallery',
    order: 1,
    active: true,
    ...initial,
  }))
  const [selected, setSelected] = useState(false)
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef(null)
  const submittingRef = useRef(false)

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const reset = () => {
    setForm({ title: '', location: 'Gallery', order: 1, active: true, ...initial })
    setSelected(false)
    setFile(null)
    setPreviewUrl('')
    setUploading(false)
    setProgress(0)
    submittingRef.current = false
  }

  const handleClose = () => {
    reset()
    onClose?.()
  }

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const openFilePicker = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event) => {
    const picked = event.target.files?.[0]
    if (!picked) return
    setSelected(true)
    setFile(picked)
    setPreviewUrl(URL.createObjectURL(picked))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!selected && mode === 'create') return
    if (uploading || submittingRef.current) return

    submittingRef.current = true
    setUploading(true)
    setProgress(0)

    const tick = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(tick)
          setUploading(false)
          onSubmit?.({
            ...form,
            file,
            url: previewUrl || placeholderPreview,
            is_active: form.active,
            sort_order: form.order,
          })
          reset()
          return 100
        }
        return p + 10
      })
    }, 120)
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={mode === 'create' ? 'Upload Image' : 'Edit Image'}
      description={mode === 'create' ? 'Add a new image to your site.' : 'Update this image details.'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {mode === 'create' && (
          <div>
            {!selected ? (
              <>
                <button
                  type="button"
                  onClick={openFilePicker}
                  onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setDragging(false); openFilePicker() }}
                  className={cn(
                    'flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors',
                    dragging
                      ? 'border-amber-400 bg-amber-50'
                      : 'border-slate-200 bg-slate-50/60 hover:border-amber-300 hover:bg-amber-50/40 dark:border-slate-700 dark:bg-slate-900/40 dark:hover:border-amber-500/40 dark:hover:bg-amber-500/5',
                  )}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm ring-1 ring-slate-200">
                    <UploadCloud className="h-6 w-6" />
                  </div>
                  <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-200">Drag and drop your image here</p>
                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">PNG, JPG up to 5MB</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300">
                    Browse files
                  </span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </>
            ) : (
              <div className="relative overflow-hidden rounded-xl border border-slate-200">
                <img src={previewUrl || placeholderPreview} alt="Selected preview" className="h-48 w-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setSelected(false)
                    setFile(null)
                    setPreviewUrl('')
                  }}
                  className="absolute top-2 right-2 rounded-lg bg-white/90 px-2.5 py-1 text-xs font-medium text-slate-600 shadow-sm backdrop-blur hover:bg-white transition-colors"
                >
                  Remove
                </button>
                <div className="flex items-center gap-2 px-4 py-2.5">
                  <ImageIcon className="h-4 w-4 text-slate-400" />
                  <span className="truncate text-xs text-slate-500">{file?.name || 'Selected image'}</span>
                  <CheckCircle2 className="ml-auto h-4 w-4 text-emerald-500" />
                </div>
              </div>
            )}
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Title <span className="font-normal text-slate-400 dark:text-slate-500">(optional)</span></label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="e.g. Riverside Tower — Aerial"
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Location</label>
            <select
              value={form.location}
              onChange={(e) => set('location', e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 transition-colors focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              {locations.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Sort Order</label>
            <input
              type="number"
              min={1}
              value={form.order}
              onChange={(e) => set('order', Number(e.target.value))}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 transition-colors focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/40">
          <div>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Active</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Inactive images are hidden from your live site.</p>
          </div>
          <Toggle checked={form.active} onChange={(v) => set('active', v)} />
        </div>

        <AnimatePresence>
          {uploading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                <span>Uploading...</span>
                <span>{progress}%</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
                <motion.div
                  className="h-full rounded-full bg-amber-600"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.12, ease: 'linear' }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-end gap-3 pt-1">
          <Button variant="ghost" type="button" onClick={handleClose}>Cancel</Button>
          <Button type="submit" loading={uploading} disabled={mode === 'create' && !file}>
            {uploading ? 'Uploading...' : mode === 'create' ? 'Upload Image' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
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
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:ring-offset-2',
        checked ? 'bg-amber-600' : 'bg-slate-300',
      )}
    >
      <span
        className={cn(
          'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200',
          checked ? 'translate-x-5' : 'translate-x-0.5',
        )}
      />
    </button>
  )
}
