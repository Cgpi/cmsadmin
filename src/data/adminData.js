// Dummy data for the Super Admin section. UI-only.

export const sites = [
  { id: 1, siteName: 'vp-construction-pune', contactName: 'Rohan Deshpande', email: 'rohan@vpcon-pune.in', status: 'active', createdAt: '2024-11-02', images: 142, messages: 18 },
  { id: 2, siteName: 'skyline-builders-mumbai', contactName: 'Aisha Khan', email: 'aisha@skylinebuilders.in', status: 'active', createdAt: '2024-08-15', images: 318, messages: 42 },
  { id: 3, siteName: 'patel-infra-nashik', contactName: 'Vikram Patel', email: 'vikram@patelinfra.in', status: 'inactive', createdAt: '2024-05-21', images: 87, messages: 5 },
  { id: 4, siteName: 'megacity-nagpur', contactName: 'Sneha Rao', email: 'sneha@megacityngp.in', status: 'active', createdAt: '2025-01-10', images: 203, messages: 27 },
  { id: 5, siteName: 'horizon-realty-delhi', contactName: 'Arjun Mehta', email: 'arjun@horizonrealty.in', status: 'active', createdAt: '2024-09-30', images: 256, messages: 31 },
  { id: 6, siteName: 'greenleaf-homes-goa', contactName: 'Priya Fernandes', email: 'priya@greenleafhomes.in', status: 'inactive', createdAt: '2024-03-12', images: 64, messages: 2 },
  { id: 7, siteName: 'terrastruct-bengaluru', contactName: 'Kabir Nair', email: 'kabir@terrastruct.in', status: 'active', createdAt: '2025-02-04', images: 178, messages: 23 },
  { id: 8, siteName: 'apex-civil-jaipur', contactName: 'Diya Sharma', email: 'diya@apexcivil.in', status: 'active', createdAt: '2024-12-19', images: 121, messages: 14 },
]

export const recentActivity = [
  { id: 1, type: 'message', text: 'New contact form submission — vp-construction-pune', site: 'vp-construction-pune', minutesAgo: 8 },
  { id: 2, type: 'site', text: 'terrastruct-bengaluru uploaded 12 new project images', site: 'terrastruct-bengaluru', minutesAgo: 46 },
  { id: 3, type: 'site', text: 'skyline-builders-mumbai updated their services page', site: 'skyline-builders-mumbai', minutesAgo: 122 },
  { id: 4, type: 'message', text: 'New contact form submission — megacity-nagpur', site: 'megacity-nagpur', minutesAgo: 180 },
  { id: 5, type: 'status', text: 'greenleaf-homes-goa was deactivated', site: 'greenleaf-homes-goa', minutesAgo: 320 },
  { id: 6, type: 'site', text: 'apex-civil-jaipur published a new blog post', site: 'apex-civil-jaipur', minutesAgo: 480 },
  { id: 7, type: 'message', text: 'New contact form submission — horizon-realty-delhi', site: 'horizon-realty-delhi', minutesAgo: 720 },
]

export function relativeTime(minutesAgo) {
  if (minutesAgo < 1) return 'just now'
  if (minutesAgo < 60) return `${minutesAgo}m ago`
  const hours = Math.floor(minutesAgo / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

// Aggregate stats derived from the sites array
export function computeStats(siteList) {
  return {
    totalSites: siteList.length,
    activeSites: siteList.filter((s) => s.status === 'active').length,
    totalImages: siteList.reduce((sum, s) => sum + s.images, 0),
    newMessages: siteList.reduce((sum, s) => sum + s.messages, 0),
  }
}
