import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ToastProvider, useToast } from './components/ui/Toast'
import { ThemeProvider } from './components/ui/ThemeProvider'
import RouteProgress from './components/ui/RouteProgress'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import MyImages from './pages/MyImages'
import ContactMessages from './pages/ContactMessages'
import Settings from './pages/Settings'
import SuperAdminDashboard from './pages/SuperAdminDashboard'
import ManageSites from './pages/ManageSites'
import ManageSite from './pages/ManageSite'
import ComponentsDemo from './pages/ComponentsDemo'
import Forbidden from './pages/Forbidden'
import NotFound from './pages/NotFound'

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

const pageTransition = { duration: 0.28, ease: [0.16, 1, 0.3, 1] }

function RequireAuth({ role, children }) {
  const { user } = useAuth()
  const location = useLocation()
  const toast = useToast()

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (role && user.role !== role) {
    const home = user.role === 'super_admin' ? '/admin/dashboard' : '/dashboard'
    setTimeout(() => toast.warning("You don't have access to that area."), 0)
    return <Navigate to={home} replace />
  }

  return children
}

function RootRoute() {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Navigate to={user.role === 'super_admin' ? '/admin/dashboard' : '/dashboard'} replace />
}

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
          <Route path="/" element={<RootRoute />} />
          <Route path="/login" element={<Login />} />
          {/* Sub-admin section */}
          <Route path="/dashboard" element={<RequireAuth role="user"><Dashboard /></RequireAuth>} />
          <Route path="/dashboard/images" element={<RequireAuth role="user"><MyImages /></RequireAuth>} />
          <Route path="/dashboard/contacts" element={<RequireAuth role="user"><ContactMessages /></RequireAuth>} />
          <Route path="/dashboard/settings" element={<RequireAuth role="user"><Settings /></RequireAuth>} />
          {/* Super Admin section */}
          <Route path="/admin/dashboard" element={<RequireAuth role="super_admin"><SuperAdminDashboard /></RequireAuth>} />
          <Route path="/admin/users" element={<RequireAuth role="super_admin"><ManageSites /></RequireAuth>} />
          <Route path="/admin/users/:id/manage" element={<RequireAuth role="super_admin"><ManageSite /></RequireAuth>} />
          <Route path="/admin/settings" element={<RequireAuth role="super_admin"><Settings /></RequireAuth>} />
          <Route path="/components-demo" element={<ComponentsDemo />} />
          <Route path="/403" element={<Forbidden />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

function RoutesWithToast() {
  return (
    <ToastProvider>
      <RouteProgress />
      <AnimatedRoutes />
    </ToastProvider>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RoutesWithToast />
      </AuthProvider>
    </ThemeProvider>
  )
}

