import { getApiBaseUrl, getAuthHeaders } from '../context/authApi'

export const statuses = ['new', 'read', 'replied']

// Start with an empty list; components should call `fetchContacts()` to load real data.
export const contacts = []

export const statusConfig = {
  new: { label: 'New', dot: 'bg-amber-500', text: 'text-amber-600', badge: 'amber', markUnread: true },
  read: { label: 'Read', dot: 'bg-slate-400', text: 'text-slate-500', badge: 'neutral', markUnread: false },
  replied: { label: 'Replied', dot: 'bg-emerald-500', text: 'text-emerald-600', badge: 'green', markUnread: false },
}

export async function fetchContacts() {
  try {
    const res = await fetch(`${getApiBaseUrl()}/contacts`, {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    if (!res.ok) {
      const txt = await res.text().catch(() => '')
      throw new Error(`API error ${res.status}: ${txt}`)
    }

    const payload = await res.json().catch(() => [])

    if (!Array.isArray(payload)) return []

    return payload.map((m) => {
      const created = m.created_at ? new Date(m.created_at).getTime() : Date.now()
      const minutesAgo = Math.max(0, Math.floor((Date.now() - created) / 60000))
      const body = m.message || ''
      const preview = body.length > 120 ? `${body.slice(0, 120)}...` : body
      return {
        id: m.id,
        sender: m.name || m.sender || 'Unknown',
        email: m.email || '',
        phone: m.phone || '',
        subject: m.subject || '',
        preview,
        body,
        status: m.status || 'new',
        minutesAgo,
        raw: m,
      }
    })
  } catch {
    return []
  }
}

export async function fetchContact(id) {
  if (!id) return null
  try {
    const res = await fetch(`${getApiBaseUrl()}/contacts/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    if (!res.ok) {
      return null
    }

    const m = await res.json().catch(() => null)
    if (!m) return null

    const created = m.created_at ? new Date(m.created_at).getTime() : Date.now()
    const minutesAgo = Math.max(0, Math.floor((Date.now() - created) / 60000))
    const body = m.message || ''
    const preview = body.length > 120 ? `${body.slice(0, 120)}...` : body

    return {
      id: m.id,
      sender: m.name || m.sender || 'Unknown',
      email: m.email || '',
      phone: m.phone || '',
      subject: m.subject || '',
      preview,
      body,
      status: m.status || 'new',
      minutesAgo,
      raw: m,
    }
  } catch {
    return null
  }
}

export function relativeTime(minutesAgo) {
  if (minutesAgo < 1) return 'just now'
  if (minutesAgo < 60) return `${minutesAgo}m ago`
  const hours = Math.floor(minutesAgo / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function countByStatus(messageList) {
  return messageList.reduce(
    (acc, m) => {
      acc.All += 1
      acc[m.status] = (acc[m.status] || 0) + 1
      return acc
    },
    { All: 0, new: 0, read: 0, replied: 0 },
  )
}
