import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Compass, ArrowLeft } from 'lucide-react'
import Button from '../components/ui/Button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center dark:bg-slate-950">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-md"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 ring-1 ring-amber-100">
          <Compass className="h-8 w-8" />
        </div>
        <p className="mt-6 text-5xl font-bold tracking-tight text-slate-900 dark:text-white">404</p>
        <h1 className="mt-3 text-lg font-semibold text-slate-900 dark:text-white">Page not found</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          The page you&apos;re looking for doesn&apos;t exist or may have been moved.
        </p>
        <Link to="/dashboard" className="mt-6 inline-block">
          <Button variant="secondary">
            <ArrowLeft className="h-4 w-4" /> Back to dashboard
          </Button>
        </Link>
      </motion.div>
    </div>
  )
}
