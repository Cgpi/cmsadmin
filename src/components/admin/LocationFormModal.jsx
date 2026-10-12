import { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { ImagePlus } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'

const emptyForm = {
  name: '',
  slug: '',
  description: '',
  isActive: true,
  sortOrder: 0,
}

export default function LocationFormModal({ open, mode = 'create', initial, onClose, onSubmit }) {
  const [form, setForm] = useState(emptyForm)
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (!open) return
    setForm({
      ...emptyForm,
      name: initial?.name || '',
      slug: initial?.slug || '',
      description: initial?.description || '',
      isActive: initial?.active ?? true,
      sortOrder: initial?.sortOrder ?? 0,
    })
    setImage(null)
  }, [open, mode, initial])

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.name.trim() || loading) return
    setLoading(true)
    try {
      const result = await onSubmit?.({ ...form, image })
      if (result !== false) onClose?.()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === 'create' ? 'Add Location' : 'Edit Location'}
      description={mode === 'create' ? 'Create a location for organizing site images.' : 'Update this location.'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Name">
          <input
            required
            autoFocus
            value={form.name}
            onChange={(event) => set('name', event.target.value)}
            placeholder="Downtown Project"
            className={inputClass}
          />
        </Field>
        <Field label="Slug" optional>
          <input
            value={form.slug}
            onChange={(event) => set('slug', event.target.value)}
            placeholder="Leave blank to generate automatically"
            className={inputClass}
          />
        </Field>
        <Field label="Description" optional>
          <textarea
            rows={3}
            value={form.description}
            onChange={(event) => set('description', event.target.value)}
            placeholder="Main commercial project"
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Sort order">
            <input
              type="number"
              min="0"
              value={form.sortOrder}
              onChange={(event) => set('sortOrder', Number(event.target.value))}
              className={inputClass}
            />
          </Field>
          <Field label="Image" optional>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-11 w-full items-center gap-2 overflow-hidden rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              <ImagePlus className="h-4 w-4 shrink-0" />
              <span className="truncate">{image?.name || 'Choose image'}</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => setImage(event.target.files?.[0] || null)}
            />
          </Field>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/40">
          <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Active</span>
          <button
            type="button"
            role="switch"
            aria-label="Active location"
            aria-checked={form.isActive}
            onClick={() => set('isActive', !form.isActive)}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:ring-offset-2 ${form.isActive ? 'bg-amber-600' : 'bg-slate-300'}`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${form.isActive ? 'translate-x-5' : 'translate-x-0.5'}`}
            />
          </button>
        </div>
        <div className="flex justify-end gap-3 pt-1">
          <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>
            {mode === 'create' ? 'Create Location' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

LocationFormModal.propTypes = {
  open: PropTypes.bool.isRequired,
  mode: PropTypes.oneOf(['create', 'edit']),
  initial: PropTypes.shape({
    name: PropTypes.string,
    slug: PropTypes.string,
    description: PropTypes.string,
    active: PropTypes.bool,
    sortOrder: PropTypes.number,
  }),
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
}

const inputClass = 'h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'

Field.propTypes = {
  label: PropTypes.string.isRequired,
  optional: PropTypes.bool,
  children: PropTypes.node.isRequired,
}

function Field({ label, optional, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}{optional && <span className="ml-1 font-normal text-slate-400">(optional)</span>}
      </label>
      {children}
    </div>
  )
}