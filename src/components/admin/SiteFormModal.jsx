import { useState, useEffect } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { useToast } from '../ui/useToast'
import { cn } from '../../lib/utils'

const empty = { siteName: '', contactName: '', email: '', password: '', active: true }

export default function SiteFormModal({ open, onClose, mode = 'create', initial, onSubmit }) {
  const toast = useToast()
  const [form, setForm] = useState(() => ({ ...empty, ...initial }))
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)

  // reset internal state whenever the modal is (re)opened
  const handleOpenChange = (next) => {
    if (next) {
      setForm({ ...empty, ...initial })
      setErrors({})
      setShowPw(false)
    }
  }

  // ensure the internal form is reset whenever the modal opens or `initial` changes
  // so the edit mode shows prefilled values.
  useEffect(() => {
    if (open) {
      setForm({ ...empty, ...initial })
      setErrors({})
      setShowPw(false)
    }
  }, [open, initial])

  const set = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const validate = () => {
    const e = {}
    if (!form.siteName.trim()) e.siteName = 'Site name is required'
    if (!form.contactName.trim()) e.contactName = 'Contact name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address'
    if (mode === 'create' && !form.password.trim()) e.password = 'Password is required'
    else if (mode === 'create' && form.password.length < 6) e.password = 'Use at least 6 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    if (!validate()) return
    if (loading) return
    setLoading(true)

    try {
      // Delegate actual API work to parent and wait for it to finish.
      await onSubmit?.(form)
    } catch (err) {
      const msg = err?.message || 'Unable to save site. Please try again.'
      toast.error(msg)
      setLoading(false)
      return
    }

    // Parent typically closes the modal by updating props; ensure loading turns off.
    setLoading(false)
  }

  return (
    <Modal
      open={open}
      onClose={() => { handleOpenChange(false); onClose?.() }}
      title={mode === 'create' ? 'Create New Site' : 'Edit Site'}
      description={mode === 'create' ? 'Provision a new sub-admin account for a client site.' : 'Update this sub-admin account details.'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <FormField
          label="Site Name"
          error={errors.siteName}
          helper="Used as the unique site identifier (e.g. vp-construction-pune). Lowercase, hyphens only."
        >
          <input
            type="text"
            value={form.siteName}
            onChange={(e) => set('siteName', e.target.value)}
            placeholder="vp-construction-pune"
            className={inputCls(!!errors.siteName)}
          />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Contact Name" error={errors.contactName}>
            <input
              type="text"
              value={form.contactName}
              onChange={(e) => set('contactName', e.target.value)}
              placeholder="Rohan Deshpande"
              className={inputCls(!!errors.contactName)}
            />
          </FormField>

          <FormField label="Email" error={errors.email}>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="rohan@vpcon-pune.in"
              className={inputCls(!!errors.email)}
            />
          </FormField>
        </div>

        {mode === 'create' && (
          <FormField label="Password" error={errors.password}>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
                placeholder="Min. 6 characters"
                className={cn(inputCls(!!errors.password), 'pr-10')}
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </FormField>
        )}

        {/* Active toggle */}
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/40">
          <div>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Active</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Inactive sites are hidden from the public and cannot be logged into.</p>
          </div>
          <Toggle checked={form.active} onChange={(v) => set('active', v)} />
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 pt-1">
          <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>
            {loading
              ? (mode === 'create' ? 'Creating...' : 'Saving...')
              : (mode === 'create' ? 'Create Site' : 'Save Changes')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function inputCls(hasError) {
  return cn(
    'h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-slate-900 placeholder-slate-400 transition-colors',
    'focus:outline-none focus:ring-2',
    hasError
      ? 'border-red-300 focus:border-red-400 focus:ring-red-500/25'
      : 'border-slate-200 focus:border-amber-500 focus:ring-amber-500/30',
    'dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500',
    hasError ? 'dark:border-red-500/40' : 'dark:border-slate-700',
  )
}

function FormField({ label, helper, error, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
      {children}
      {error ? (
        <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">{error}</p>
      ) : helper ? (
        <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">{helper}</p>
      ) : null}
    </div>
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
