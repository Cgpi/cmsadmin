import { getApiBaseUrl, getAuthHeaders } from '../context/authApi'

function capitalize(value) {
  return String(value)
    .toLowerCase()
    .replace(/(^|\s)\w/g, (match) => match.toUpperCase())
}

function normalizeLocation(item) {
  const activeValue = item.is_active ?? item.active ?? item.status
  const active = typeof activeValue === 'string'
    ? !['0', 'false', 'inactive'].includes(activeValue.trim().toLowerCase())
    : activeValue == null ? true : Boolean(activeValue)

  return {
    id: item.id,
    name: capitalize(item.name || item.slug || 'Untitled location'),
    slug: item.slug || '',
    description: item.description || '',
    imagePath: item.image_path || null,
    active,
    sortOrder: item.sort_order ?? 0,
    imagesCount: item.images_count ?? 0,
    raw: item,
  }
}

async function responseError(response, fallback) {
  const payload = await response.json().catch(() => null)
  const validationErrors = Object.values(payload?.errors || {}).flat().join(' ')
  return new Error(validationErrors || payload?.message || payload?.error || `${fallback}: ${response.status}`)
}

function unwrapLocation(payload) {
  return payload?.data?.location || payload?.data || payload?.location || payload
}

export async function fetchLocations({ userId, activeOnly = true } = {}) {
  const params = new URLSearchParams()
  if (userId != null) params.set('user_id', String(userId))
  params.set('active_only', activeOnly ? '1' : '0')
  const endpoint = userId == null ? '/locations' : '/public/locations'
  const response = await fetch(`${getApiBaseUrl()}${endpoint}?${params.toString()}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      ...getAuthHeaders(),
    },
  })

  if (!response.ok) {
    throw await responseError(response, 'Failed to fetch locations')
  }

  const payload = await response.json().catch(() => null)
  const records = Array.isArray(payload) ? payload : payload?.data || payload?.locations
  if (!Array.isArray(records)) {
    throw new Error('The locations service returned an unexpected response.')
  }
  return records.map(normalizeLocation)
}

export async function fetchLocationById(id) {
  if (id == null || id === '') throw new Error('A location ID is required.')

  const response = await fetch(`${getApiBaseUrl()}/locations/${encodeURIComponent(id)}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      ...getAuthHeaders(),
    },
  })

  if (!response.ok) {
    throw await responseError(response, 'Failed to fetch location')
  }

  const payload = await response.json().catch(() => null)
  const location = unwrapLocation(payload)
  if (!location || typeof location !== 'object' || location.id == null) {
    throw new Error('The location service returned an unexpected response.')
  }
  return normalizeLocation(location)
}

function locationFormData({ name, slug, description, image, isActive = true, sortOrder = 0 }) {
  const form = new FormData()
  form.append('name', name.trim())
  form.append('slug', slug.trim())
  form.append('description', description.trim())
  if (image) form.append('image', image)
  form.append('is_active', isActive ? '1' : '0')
  form.append('sort_order', String(sortOrder))
  return form
}

async function saveLocation(url, method, fields, fallback) {
  const response = await fetch(`${getApiBaseUrl()}${url}`, {
    method,
    headers: {
      Accept: 'application/json',
      ...getAuthHeaders(),
    },
    body: locationFormData(fields),
  })

  if (!response.ok) {
    throw await responseError(response, fallback)
  }

  const payload = await response.json().catch(() => null)
  const location = unwrapLocation(payload)
  return location ? normalizeLocation(location) : null
}

export function createLocation(fields) {
  return saveLocation('/locations', 'POST', fields, 'Failed to create location')
}

export async function updateLocation(id, fields) {
  if (id == null || id === '') throw new Error('A location ID is required to update a location.')

  const response = await fetch(`${getApiBaseUrl()}/locations/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({
      name: fields.name.trim(),
      description: fields.description.trim(),
      is_active: Boolean(fields.isActive),
    }),
  })

  if (!response.ok) {
    throw await responseError(response, 'Failed to update location')
  }

  const payload = await response.json().catch(() => null)
  const updatedLocation = unwrapLocation(payload)
  return normalizeLocation(updatedLocation?.id != null ? updatedLocation : {
    id,
    name: fields.name,
    slug: fields.slug,
    description: fields.description,
    is_active: fields.isActive,
    sort_order: fields.sortOrder,
  })
}

export async function deleteLocation(id) {
  if (id == null || id === '') throw new Error('A location ID is required.')

  const response = await fetch(`${getApiBaseUrl()}/locations/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      ...getAuthHeaders(),
    },
  })

  if (!response.ok) {
    throw await responseError(response, 'Failed to delete location')
  }

  return true
}