import { getApiBaseUrl, getAuthHeaders } from '../context/AuthContext'

export function normalizeAdminUser(item) {
  const isActive = item.is_active ?? item.active ?? item.status === 'active'
  const createdAt = item.created_at
    ? String(item.created_at).split('T')[0]
    : item.createdAt
      ? String(item.createdAt).split('T')[0]
      : new Date().toISOString().split('T')[0]

  return {
    id: item.id,
    siteName: item.site_name || item.siteName || item.site || '',
    contactName: item.name || item.contact_name || item.contactName || '',
    email: item.email || '',
    status: isActive ? 'active' : 'inactive',
    active: Boolean(isActive),
    createdAt,
    images: item.images ?? 0,
    messages: item.messages ?? 0,
    raw: item,
  }
}

async function parseJson(response) {
  try {
    return await response.json()
  } catch {
    return null
  }
}

export async function fetchAdminUsers() {
  const res = await fetch(`${getApiBaseUrl()}/admin/users`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch sites: ${res.status}`)
  }

  const payload = await parseJson(res)
  if (!Array.isArray(payload)) {
    return []
  }

  return payload.map(normalizeAdminUser)
}

export async function fetchAdminUser(id) {
  if (!id) return null

  const res = await fetch(`${getApiBaseUrl()}/admin/users/${id}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })

  if (!res.ok) {
    return null
  }

  const payload = await parseJson(res)
  return payload ? normalizeAdminUser(payload) : null
}

export async function createAdminUser({ siteName, contactName, email, password, active = true }) {
  const res = await fetch(`${getApiBaseUrl()}/admin/users`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: contactName,
      email,
      password,
      site_name: siteName,
      is_active: active,
    }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `Failed to create site: ${res.status}`)
  }

  const payload = await parseJson(res)
  return normalizeAdminUser(payload)
}

export async function updateAdminUser(id, { contactName, email, active }) {
  if (!id) return null
  const body = {
    name: contactName,
    is_active: active,
  }
  if (email) body.email = email

  const res = await fetch(`${getApiBaseUrl()}/admin/users/${id}`, {
    method: 'PUT',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `Failed to update site: ${res.status}`)
  }

  const payload = await parseJson(res)
  return normalizeAdminUser(payload)
}

export async function deleteAdminUser(id) {
  if (!id) return false

  const res = await fetch(`${getApiBaseUrl()}/admin/users/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })

  return res.ok
}
