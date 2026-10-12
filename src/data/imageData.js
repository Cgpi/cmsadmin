import { getApiBaseUrl, getAuthHeaders } from '../context/AuthContext'

export const locations = ['Home', 'Gallery', 'About', 'Services']

// Compatibility export for dashboard stats and legacy imports.
export const images = []

export const placeholderPreview =
  'https://images.pexels.com/photos/33628380/pexels-photo-33628380.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'

const IMAGE_LOCATION_TYPES = new Set(['home', 'gallery', 'about', 'services'])
const IMAGE_LOCATION_CACHE_KEY = 'vp_image_location_ids'

function readImageLocationCache() {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(window.localStorage.getItem(IMAGE_LOCATION_CACHE_KEY) || '{}')
  } catch {
    return {}
  }
}

function rememberImageLocation(imageId, locationId) {
  if (imageId == null || locationId == null || typeof window === 'undefined') return
  const cache = readImageLocationCache()
  cache[String(imageId)] = String(locationId)
  window.localStorage.setItem(IMAGE_LOCATION_CACHE_KEY, JSON.stringify(cache))
}

function forgetImageLocation(imageId) {
  if (imageId == null || typeof window === 'undefined') return
  const cache = readImageLocationCache()
  delete cache[String(imageId)]
  window.localStorage.setItem(IMAGE_LOCATION_CACHE_KEY, JSON.stringify(cache))
}

function toImageLocationType(location) {
  const value = String(location || '').toLowerCase()
  return IMAGE_LOCATION_TYPES.has(value) ? value : 'gallery'
}

function resolveImageUrl(value) {
  if (!value) return placeholderPreview
  if (/^(https?:|data:|blob:)/i.test(value)) return value

  const applicationBase = getApiBaseUrl().replace(/\/api\/?$/, '')
  try {
    return new URL(value, `${applicationBase}/`).toString()
  } catch {
    return value
  }
}

async function parseImageList(response, locationOptions) {
  if (!response.ok) {
    const body = await response.text().catch(() => '')
    let message = body.slice(0, 400)
    try {
      const payload = JSON.parse(body)
      const validationErrors = Object.values(payload.errors || {}).flat().join(' ')
      message = validationErrors || payload.message || payload.error || message
    } catch {
      message = body.slice(0, 400)
    }
    throw new Error(message || `Image request failed: ${response.status}`)
  }

  const payload = await response.json().catch(() => null)
  const records = Array.isArray(payload) ? payload : payload?.data || payload?.images
  if (!Array.isArray(records)) {
    throw new Error('The image service returned an unexpected response.')
  }
  return records.map((item) => normalizeImage(item, locationOptions))
}

export function normalizeImage(item, locationOptions = [], fallbackLocationId) {
  const imageId = item.id ?? item.image_id
  const responseLocationId = item.location_id ?? item.location?.id
  const cachedLocationId = imageId == null ? null : readImageLocationCache()[String(imageId)]
  const locationId = responseLocationId == null || String(responseLocationId) === '0'
    ? fallbackLocationId ?? cachedLocationId
    : responseLocationId
  const rawLocation = typeof item.location === 'object'
    ? String(item.location?.slug || item.location?.name || '')
    : String(item.location || '')
  const matchedLocation = locationOptions.find((location) => (
    locationId != null && String(location.id) === String(locationId)
  )) || locationOptions.find((location) => (
    location.slug === rawLocation || location.name?.toLowerCase() === rawLocation.toLowerCase()
  ))
  return {
    id: imageId,
    locationId: locationId ?? matchedLocation?.id ?? null,
    title: item.title || 'Untitled',
    location: matchedLocation?.name || (rawLocation ? capitalize(rawLocation.replace(/[-_]/g, ' ')) : 'Gallery'),
    active: item.is_active ?? false,
    order: item.sort_order ?? 0,
    url: resolveImageUrl(item.image_url || item.image_path || item.image?.url || item.url),
    raw: item,
  }
}

function capitalize(value) {
  return String(value)
    .toLowerCase()
    .replace(/(^|\s)\w/g, (match) => match.toUpperCase())
}

export async function fetchImages({ location, activeOnly, locationOptions = [] } = {}) {
  const params = new URLSearchParams()
  if (location && location !== 'All') {
    params.set('location', toImageLocationType(location))
  }
  if (activeOnly) params.set('active_only', '1')
  const query = params.toString() ? `?${params.toString()}` : ''
  const response = await fetch(`${getApiBaseUrl()}/images${query}`, {
    method: 'GET',
    headers: { Accept: 'application/json', ...getAuthHeaders() },
  })
  return parseImageList(response, locationOptions)
}

export async function fetchChooseUsImages(locationOptions = []) {
  const response = await fetch(`${getApiBaseUrl()}/images/location/choose-us`, {
    method: 'GET',
    headers: { Accept: 'application/json', ...getAuthHeaders() },
  })
  return parseImageList(response, locationOptions)
}

export async function fetchImage(id, locationOptions = []) {
  if (!id) throw new Error('An image ID is required.')
  const response = await fetch(`${getApiBaseUrl()}/images/${encodeURIComponent(id)}`, {
    method: 'GET',
    headers: { Accept: 'application/json', ...getAuthHeaders() },
  })
  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.message || body?.error || `Failed to load image: ${response.status}`)
  }

  const payload = await response.json().catch(() => null)
  const image = payload?.data?.image || payload?.data || payload?.image || payload
  if (!image || typeof image !== 'object') {
    throw new Error('The image service returned an unexpected response.')
  }
  return normalizeImage(image, locationOptions)
}

export async function createImage({ file, title, location, is_active, sort_order }, locationOptions = []) {
  if (!file) throw new Error('Choose an image file before uploading.')
  const matchedLocation = locationOptions.find((option) => (
    String(option.id) === String(location) || option.slug === location || option.name === location
  ))
  if (location !== undefined && matchedLocation?.id == null) {
    throw new Error('The selected location is unavailable. Reload locations and try again.')
  }

  const form = new FormData()
  if (file) form.append('image', file)
  if (title !== undefined) form.append('title', title)
  if (location !== undefined) {
    form.append('location', toImageLocationType(matchedLocation?.slug || matchedLocation?.name || location))
  }
  if (matchedLocation?.id != null) form.append('location_id', String(matchedLocation.id))
  if (is_active !== undefined) form.append('is_active', is_active ? 'true' : 'false')
  if (sort_order !== undefined) form.append('sort_order', String(sort_order))

  const res = await fetch(`${getApiBaseUrl()}/images`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      ...getAuthHeaders(),
    },
    body: form,
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    let details = body.slice(0, 400)
    try {
      const payload = JSON.parse(body)
      const validationErrors = Object.values(payload.errors || {}).flat().join(' ')
      details = validationErrors || payload.message || details
    } catch {
      details = body.slice(0, 400)
    }
    throw new Error(details || `Failed to upload image: ${res.status}`)
  }
  const payload = await res.json().catch(() => null)
  const image = payload?.data?.image || payload?.data || payload?.image || payload
  if (image) rememberImageLocation(image.id ?? image.image_id, matchedLocation?.id)
  return image ? normalizeImage(image, locationOptions, matchedLocation?.id) : null
}

export async function updateImage(id, changes, locationOptions = []) {
  if (!id) throw new Error('An image ID is required.')
  const matchedLocation = locationOptions.find((location) => (
    location.id != null && String(location.id) === String(changes.location)
  )) || locationOptions.find((location) => (
    location.slug === changes.location || location.name === changes.location
  ))
  const response = await fetch(`${getApiBaseUrl()}/images/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({
      title: changes.title,
      location: toImageLocationType(matchedLocation?.slug || matchedLocation?.name || changes.location),
      location_id: matchedLocation?.id,
      is_active: changes.active,
      sort_order: changes.order,
    }),
  })
  if (!response.ok) {
    const body = await response.text().catch(() => '')
    let message = body.slice(0, 400)
    try {
      const payload = JSON.parse(body)
      message = Object.values(payload.errors || {}).flat().join(' ') || payload.message || payload.error || message
    } catch {
      message = body.slice(0, 400)
    }
    throw new Error(message || `Failed to update image: ${response.status}`)
  }
  const cachedImage = readImageLocationCache()
  if (matchedLocation?.id != null) {
    cachedImage[String(id)] = String(matchedLocation.id)
    window.localStorage.setItem(IMAGE_LOCATION_CACHE_KEY, JSON.stringify(cachedImage))
  }
  const payload = await response.json().catch(() => null)
  const image = payload?.data?.image || payload?.data || payload?.image || payload
  return image ? normalizeImage(image, locationOptions, matchedLocation?.id) : null
}

export async function deleteImage(id) {
  if (!id) throw new Error('An image ID is required.')
  const response = await fetch(`${getApiBaseUrl()}/images/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { Accept: 'application/json', ...getAuthHeaders() },
  })
  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    throw new Error(payload?.message || payload?.error || `Failed to delete image: ${response.status}`)
  }
  forgetImageLocation(id)
  return true
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
