export const API_BASE_URL = 'https://www.cgpisoftware.com/vpconstruction/api'
export const AUTH_TOKEN_KEY = 'vp_auth_token'

export function getAuthHeaders() {
  const existingToken = typeof window !== 'undefined' ? window.localStorage.getItem(AUTH_TOKEN_KEY) : null
  const token = existingToken ? existingToken : ''
  const bearer = token.startsWith('Bearer ') ? token : token ? `Bearer ${token}` : ''
  const headers = {}

  if (bearer) {
    headers['X-authorization'] = bearer
    headers.Authorization = bearer
  }

  return headers
}

export function getApiBaseUrl() {
  return API_BASE_URL
}
