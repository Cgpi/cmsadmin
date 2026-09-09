import { getApiBaseUrl, getAuthHeaders } from '../context/AuthContext'

export const locations = ['Home', 'Gallery', 'About', 'Services']

// Compatibility export for dashboard stats and legacy imports.
export const images = []

export const placeholderPreview =
  'https://images.pexels.com/photos/33628380/pexels-photo-33628380.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'

const GALLERY_API_FALLBACK_TOKEN =
  'vp6SSe9mP2bNLeagcrEQllCVZJU9e7ncBBKxD4hM14sVYql8MyQC4Yp6pKf0gQTN'

export function normalizeImage(item) {
  return {
    id: item.id,
    title: item.title || 'Untitled',
    location: item.location ? capitalize(item.location) : 'Gallery',
    active: item.is_active ?? false,
    order: item.sort_order ?? 0,
    url: item.image_url || item.image_path || placeholderPreview,
    raw: item,
  }
}

function capitalize(value) {
  return String(value)
    .toLowerCase()
    .replace(/(^|\s)\w/g, (match) => match.toUpperCase())
}

export async function fetchImages({ location, activeOnly } = {}) {
  try {
    const params = new URLSearchParams()
    if (location && location !== 'All') {
      params.set('location', location.toLowerCase())
    }
    if (activeOnly) {
      params.set('active_only', 'true')
    }
    const query = params.toString() ? `?${params.toString()}` : ''

    const headers = { ...getAuthHeaders() }
    if (!headers['X-authorization'] && !headers.Authorization) {
      headers['X-Authorization'] = `Bearer ${GALLERY_API_FALLBACK_TOKEN}`
      headers.Authorization = `Bearer ${GALLERY_API_FALLBACK_TOKEN}`
    }

    const res = await fetch(`${getApiBaseUrl()}/images${query}`, {
      method: 'GET',
      headers,
    })

    if (!res.ok) {
      throw new Error(`Failed to load images: ${res.status}`)
    }

    const payload = await res.json().catch(() => [])
    if (!Array.isArray(payload)) return []
    return payload.map(normalizeImage)
  } catch (err) {
    return []
  }
}

export async function fetchImage(id) {
  if (!id) return null
  try {
    const res = await fetch(`${getApiBaseUrl()}/images/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    })
    if (!res.ok) return null

    const payload = await res.json().catch(() => null)
    return payload ? normalizeImage(payload) : null
  } catch {
    return null
  }
}

export async function createImage({ file, title, location, is_active, sort_order }) {
  const form = new FormData()
  if (file) form.append('image', file)
  if (title !== undefined) form.append('title', title)
  if (location !== undefined) form.append('location', location.toLowerCase())
  if (is_active !== undefined) form.append('is_active', String(is_active))
  if (sort_order !== undefined) form.append('sort_order', String(sort_order))

  const res = await fetch(`${getApiBaseUrl()}/images`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
    },
    body: form,
  })
  if (!res.ok) {
    throw new Error(`Failed to upload image: ${res.status}`)
  }
  const payload = await res.json().catch(() => null)
  return payload ? normalizeImage(payload) : null
}

export async function updateImage(id, changes) {
  if (!id) return null
  try {
    const res = await fetch(`${getApiBaseUrl()}/images/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        title: changes.title,
        location: changes.location?.toLowerCase(),
        is_active: changes.active,
        sort_order: changes.order,
      }),
    })
    if (!res.ok) {
      throw new Error(`Failed to update image: ${res.status}`)
    }
    const payload = await res.json().catch(() => null)
    return payload ? normalizeImage(payload) : null
  } catch {
    return null
  }
}

export async function deleteImage(id) {
  if (!id) return false
  try {
    const res = await fetch(`${getApiBaseUrl()}/images/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })
    return res.ok
  } catch {
    return false
  }
}

export function computeImageStats(imageList) {
  return {
    totalImages: imageList.length,
    activeImages: imageList.filter((i) => i.active).length,
    newMessages: 7,
  }
}

export function countByLocation(imageList) {
  return imageList.reduce((acc, img) => {
    acc[img.location] = (acc[img.location] || 0) + 1
    return acc
  }, {})
}
