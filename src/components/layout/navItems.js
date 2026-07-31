export default [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', to: '/dashboard' },
  { id: 'images', label: 'My Images', icon: 'Images', to: '/dashboard/images' },
  { id: 'messages', label: 'Contact Messages', icon: 'MessageSquare', to: '/dashboard/contacts' },
  { id: 'settings', label: 'Settings', icon: 'Settings', to: '/dashboard/settings' },
]

export const superAdminNav = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', to: '/admin/dashboard' },
  { id: 'users', label: 'Manage Sites', icon: 'Building2', to: '/admin/users' },
  { id: 'settings', label: 'Settings', icon: 'Settings', to: '/admin/settings' },
]
