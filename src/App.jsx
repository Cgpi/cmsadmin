import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ToastProvider } from './components/ui/Toast'
import { ThemeProvider } from './components/ui/ThemeProvider'
import RouteProgress from './components/ui/RouteProgress'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import MyImages from './pages/MyImages'
import ContactMessages from './pages/ContactMessages'
import Settings from './pages/Settings'
import SuperAdminDashboard from './pages/SuperAdminDashboard'
import ManageSites from './pages/ManageSites'
import ComponentsDemo from './pages/ComponentsDemo'
import Forbidden from './pages/Forbidden'
import NotFound from './pages/NotFound'

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

const pageTransition = { duration: 0.28, ease: [0.16, 1, 0.3, 1] }

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={pageTransition}
      >
        <Routes location={location}>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          {/* Sub-admin section */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/images" element={<MyImages />} />
          <Route path="/dashboard/contacts" element={<ContactMessages />} />
          <Route path="/dashboard/settings" element={<Settings />} />
          {/* Super Admin section */}
          <Route path="/admin/dashboard" element={<SuperAdminDashboard />} />
          <Route path="/admin/users" element={<ManageSites />} />
          <Route path="/admin/settings" element={<Settings />} />
          <Route path="/components-demo" element={<ComponentsDemo />} />
          <Route path="/403" element={<Forbidden />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <RouteProgress />
        <AnimatedRoutes />
      </ToastProvider>
    </ThemeProvider>
  )
}
