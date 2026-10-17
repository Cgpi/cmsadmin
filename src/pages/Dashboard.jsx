import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Images, CheckCircle2, MessageSquare, UploadCloud, ArrowRight } from 'lucide-react'
import AppShell from '../components/layout/AppShell'
import { Card } from '../components/ui/Card'
import Button from '../components/ui/Button'
import UploadImageModal from '../components/admin/UploadImageModal'
import { useToast } from '../components/ui/useToast'
import { useAuth } from '../context/useAuth'
import { computeImageStats, fetchImages, createImage } from '../data/imageData'
import { fetchLocations } from '../data/locationData'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
}
const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
}

export default function Dashboard() {
  const [uploadOpen, setUploadOpen] = useState(false)
  const [locations, setLocations] = useState([])
  const [stats, setStats] = useState(() => computeImageStats([]))
  const [apiError, setApiError] = useState('')
  const navigate = useNavigate()
  const toast = useToast()
  const { user } = useAuth()
  const firstName = (user?.name || 'Rohan').split(' ')[0]
  const siteName = user?.site_name || 'vp-construction-pune'

  useEffect(() => {
    if (user?.id == null) return undefined

    let mounted = true
    async function loadSiteData() {
      try {
        const siteLocations = await fetchLocations({ userId: user.id })
        if (!mounted) return
        setLocations(siteLocations)

        const siteImages = await fetchImages({
          locationOptions: siteLocations,
          userId: user.id,
        })
        if (mounted) setStats(computeImageStats(siteImages))
      } catch (error) {
        if (mounted) setApiError(error.message || 'Unable to load site images and locations.')
      }
    }

    loadSiteData()
    return () => {
      mounted = false
    }
  }, [user?.id])

  const statCards = [
    { label: 'Total Images', value: stats.totalImages, icon: Images, tone: 'bg-amber-50 text-amber-700' },
    { label: 'Active Images', value: stats.activeImages, icon: CheckCircle2, tone: 'bg-emerald-50 text-emerald-700' },
    { label: 'New Messages', value: stats.newMessages, icon: MessageSquare, tone: 'bg-sky-50 text-sky-700' },
  ]

  const handleUpload = async (formData) => {
    try {
      const saved = await createImage(formData, locations)
      if (!saved) throw new Error('The image upload returned no image details.')
      setStats((current) => ({
        ...current,
        totalImages: current.totalImages + 1,
        activeImages: current.activeImages + (saved.active ? 1 : 0),
      }))
      setUploadOpen(false)
      toast.success('Your image was uploaded and added to the gallery.', { title: 'Image uploaded' })
      return true
    } catch (error) {
      toast.error(error.message || 'Unable to upload image.')
      return false
    }
  }

  return (
    <AppShell pageTitle="Dashboard">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {apiError && (
          <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            {apiError}
          </p>
        )}
        {/* Welcome */}
        <motion.div variants={item}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Welcome back, {firstName}</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage images and messages for {siteName}.</p>
            </div>
          </div>
        </motion.div>

        {/* Stat cards + quick upload */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => {
            const Icon = stat.icon
            return (
              <motion.div key={stat.label} variants={item}>
                <Card className="p-5 transition-shadow duration-200 hover:shadow-card-hover">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.tone}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{stat.value}</p>
                  <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-300">{stat.label}</p>
                </Card>
              </motion.div>
            )
          })}

          {/* Quick upload shortcut card */}
          <motion.div variants={item}>
            <Card className="flex h-full flex-col items-start justify-between p-5 border-amber-200 bg-gradient-to-br from-amber-50 to-white">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-600 text-white shadow-sm shadow-amber-600/30">
                <UploadCloud className="h-5 w-5" />
              </div>
              <div className="mt-4">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Quick Upload</p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Add a new image to your site.</p>
              </div>
              <Button size="sm" className="mt-4 w-full" onClick={() => setUploadOpen(true)}>
                <UploadCloud className="h-4 w-4" /> Upload Image
              </Button>
            </Card>
          </motion.div>
        </div>

        {/* Go to images */}
        <motion.div variants={item}>
          <Card className="flex flex-col items-center justify-between gap-4 p-6 sm:flex-row">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <Images className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">Manage your image gallery</h3>
                <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Browse, filter, reorder, and organize images across all site locations.</p>
              </div>
            </div>
            <Button variant="secondary" onClick={() => navigate('/dashboard/images')}>
              Go to My Images <ArrowRight className="h-4 w-4" />
            </Button>
          </Card>
        </motion.div>
      </motion.div>

      <UploadImageModal
        open={uploadOpen}
        locations={locations}
        onClose={() => setUploadOpen(false)}
        onSubmit={handleUpload}
      />
    </AppShell>
  )
}
