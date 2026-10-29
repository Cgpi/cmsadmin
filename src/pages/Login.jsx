import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, HardHat, ArrowRight } from 'lucide-react'
import Button from '../components/ui/Button'
import { useToast } from '../components/ui/useToast'
import { useAuth } from '../context/useAuth'

const heroImg = 'https://images.pexels.com/photos/17297091/pexels-photo-17297091.jpeg?auto=compress&cs=tinysrgb&h=1200&w=900'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const submittingRef = useRef(false)
  const navigate = useNavigate()
  const toast = useToast()
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submittingRef.current || !email.trim() || !password) return
    submittingRef.current = true
    setLoading(true)

    try {
      const result = await login({ email, password })
      if (result.success) {
        toast.success(`Welcome back, ${result.user.name}.`, { title: 'Signed in successfully' })
        navigate(result.user.role === 'super_admin' ? '/admin/dashboard' : '/dashboard')
      } else {
        toast.error(result.error || 'Invalid email or password.')
        setPassword('')
      }
    } finally {
      submittingRef.current = false
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      {/* Left: form */}
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12 dark:bg-slate-950">
        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-600 text-white shadow-lg shadow-amber-600/30">
              <HardHat className="h-6 w-6" />
            </div>
            <div>
              <p className="text-base font-bold tracking-tight text-slate-900 dark:text-white">CGPI Software CMS</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">Admin Platform</p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
          >
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Sign in to your account</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Enter your credentials to access the dashboard.</p>
          </motion.div>

          <motion.form
            onSubmit={handleSubmit}
            className="mt-8 space-y-5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16 }}
          >
            <Field
              label="Email"
              icon={Mail}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
            />
            <Field
              label="Password"
              icon={Lock}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500" defaultChecked />
                Remember me
              </label>
              <a href="#" className="text-sm font-medium text-amber-700 hover:text-amber-800 transition-colors dark:text-amber-400">Forgot password?</a>
            </div>

            <Button type="submit" size="lg" loading={loading} className="w-full">
              {!loading && <>Sign in <ArrowRight className="h-4 w-4" /></>}
              {loading && 'Signing in...'}
            </Button>
          </motion.form>

          {/* Demo credentials helper */}
          {/* <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
          > */}
            {/* <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Demo Credentials</p>
            <div className="mt-2 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
              <p><span className="font-medium text-slate-700 dark:text-slate-300">Super Admin:</span> admin@cgpisoftwarecms.com</p>
              <p><span className="font-medium text-slate-700 dark:text-slate-300">Sub-Admin:</span> user1@cgpisoftwarecms.com</p>
              <p className="pt-1 text-slate-400 dark:text-slate-500">Password for both: <span className="font-mono font-medium text-amber-600">password</span></p>
            </div> */}
          {/* </motion.div> */}
        </motion.div>
      </div>

      {/* Right: visual panel */}
      <div className="relative hidden overflow-hidden lg:block">
        <img src={heroImg} alt="Construction cranes against a clear sky" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/50 to-slate-900/20" />
        <motion.div
          className="absolute inset-x-0 bottom-0 p-12"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-sm font-medium uppercase tracking-widest text-amber-400">Building since 2009</p>
          <h2 className="mt-3 max-w-md text-3xl font-bold leading-tight text-white">
            Managing projects, crews, and equipment — all in one place.
          </h2>
          <p className="mt-4 max-w-md text-sm text-slate-300">
            CGPI Software CMS&apos;s internal platform gives your team real-time visibility across every job site.
          </p>
        </motion.div>
      </div>
    </div>
  )
}

function Field({ label, icon: Icon, ...props }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          {...props}
          className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
        />
      </div>
    </div>
  )
}
