import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Lock, Sun, Moon, Check } from 'lucide-react'
import AppShell from '../components/layout/AppShell'
import { Card } from '../components/ui/Card'
import Button from '../components/ui/Button'
import { useToast } from '../components/ui/Toast'
import { useTheme } from '../components/ui/ThemeProvider'
import { useAuth } from '../context/AuthContext'
import { cn } from '../lib/utils'

const inputBase =
  'h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500'

export default function Settings() {
  const { user } = useAuth()
  const toast = useToast()
  const { theme, toggleTheme } = useTheme()

  const defaults = user
    ? { name: user.name, email: user.email, avatar: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user.name)}&backgroundType=gradientLinear` }
    : { name: '', email: '', avatar: '' }

  const [profile, setProfile] = useState({
    name: defaults.name,
    email: defaults.email,
  })
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' })
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  const handleProfileSave = (e) => {
    e.preventDefault()
    setSavingProfile(true)
    setTimeout(() => {
      setSavingProfile(false)
      toast.success('Your profile details have been saved.', { title: 'Profile updated' })
    }, 1300)
  }

  const handlePasswordSave = (e) => {
    e.preventDefault()
    setSavingPassword(true)
    setTimeout(() => {
      setSavingPassword(false)
      setPasswords({ current: '', next: '', confirm: '' })
      toast.success('Your password has been changed successfully.', { title: 'Password updated' })
    }, 1300)
  }

  return (
    <AppShell pageTitle="Settings">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-6"
      >
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Settings</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage your account profile, password, and appearance.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile card */}
          <Card className="lg:col-span-2 p-6 dark:bg-slate-800 dark:border-slate-700">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white">
              <User className="h-5 w-5 text-amber-600" />
              <h3 className="text-base font-semibold">Profile</h3>
            </div>

            <form onSubmit={handleProfileSave} className="mt-5 space-y-5">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <img
                  src={defaults.avatar}
                  alt="Avatar"
                  className="h-16 w-16 rounded-full object-cover ring-2 ring-amber-500/30"
                />
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Avatar</p>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">JPG or PNG. Max 2MB.</p>
                </div>
                <Button type="button" variant="secondary" size="sm" className="ml-auto">Change</Button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full Name">
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                    className={inputBase}
                  />
                </Field>
                <Field label="Email">
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                    className={inputBase}
                  />
                </Field>
              </div>

              <div className="flex justify-end">
                <Button type="submit" loading={savingProfile}>
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Card>

          {/* Appearance */}
          <Card className="p-6 dark:bg-slate-800 dark:border-slate-700">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">Appearance</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Switch between light and dark themes.</p>
            <button
              type="button"
              onClick={toggleTheme}
              className={cn(
                'mt-4 flex w-full items-center justify-between rounded-xl border p-4 transition-colors',
                theme === 'dark'
                  ? 'border-amber-400 bg-amber-50 dark:bg-amber-500/10'
                  : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800',
              )}
            >
              <div className="flex items-center gap-3">
                {theme === 'dark' ? <Moon className="h-5 w-5 text-amber-600" /> : <Sun className="h-5 w-5 text-amber-600" />}
                <div className="text-left">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Click to switch</p>
                </div>
              </div>
              <span className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                theme === 'dark' ? 'bg-amber-600' : 'bg-slate-300',
              )}>
                <span className={cn(
                  'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform',
                  theme === 'dark' ? 'translate-x-5' : 'translate-x-0.5',
                )} />
              </span>
            </button>
          </Card>

          {/* Password card */}
          <Card className="lg:col-span-3 p-6 dark:bg-slate-800 dark:border-slate-700">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white">
              <Lock className="h-5 w-5 text-amber-600" />
              <h3 className="text-base font-semibold">Change Password</h3>
            </div>
            <form onSubmit={handlePasswordSave} className="mt-5 space-y-5">
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Current Password">
                  <input
                    type="password"
                    value={passwords.current}
                    onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
                    placeholder="••••••••"
                    className={inputBase}
                  />
                </Field>
                <Field label="New Password">
                  <input
                    type="password"
                    value={passwords.next}
                    onChange={(e) => setPasswords((p) => ({ ...p, next: e.target.value }))}
                    placeholder="Min. 6 characters"
                    className={inputBase}
                  />
                </Field>
                <Field label="Confirm Password">
                  <input
                    type="password"
                    value={passwords.confirm}
                    onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
                    placeholder="Re-enter new password"
                    className={inputBase}
                  />
                </Field>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-500 dark:bg-slate-900/40 dark:text-slate-400">
                <Check className="h-4 w-4 text-emerald-500" />
                Use at least 6 characters with a mix of letters and numbers.
              </div>
              <div className="flex justify-end">
                <Button type="submit" loading={savingPassword}>
                  {savingPassword ? 'Updating...' : 'Update Password'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </motion.div>
    </AppShell>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
      {children}
    </div>
  )
}
