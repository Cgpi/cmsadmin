import { motion } from 'framer-motion'
import AppShell from '../components/layout/AppShell'
import ImageGallery from '../components/ui/ImageGallery'

export default function MyImages() {
  return (
    <AppShell pageTitle="My Images">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <ImageGallery />
      </motion.div>
    </AppShell>
  )
}
