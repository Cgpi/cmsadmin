import { motion } from 'framer-motion'
import AppShell from '../components/layout/AppShell'
import ContactInbox from '../components/ui/ContactInbox'
import { useAuth } from '../context/AuthContext'

export default function ContactMessages() {
  const { user } = useAuth()

  return (
    <AppShell pageTitle="Contact Messages">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <ContactInbox siteName={user?.site_name} />
      </motion.div>
    </AppShell>
  )
}
