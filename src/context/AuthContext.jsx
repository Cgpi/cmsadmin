import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

const API_BASE_URL = 'https://www.cgpisoftware.com/vpconstruction/api'
const AUTH_TOKEN_KEY = 'vp_auth_token'
const AUTH_USER_KEY = 'vp_auth_user'

function getLoginData(payload) {
  const sources = [payload, payload?.data, payload?.result, payload?.auth].filter(Boolean)
  const token = sources.map((source) => source.token || source.access_token || source.accessToken).find(Boolean)
  const user = sources.map((source) => source.user || source.profile).find(Boolean)
  return { token, user }
}

function getResponseError(payload, fallback) {
  const validationErrors = Object.values(payload?.errors || {}).flat().join(' ')
  return validationErrors || payload?.message || payload?.error || fallback
}

function readStoredUser() {
  if (typeof window === 'undefined') return null

  try {
    const storedUser = window.localStorage.getItem(AUTH_USER_KEY)
    return storedUser ? JSON.parse(storedUser) : null
  } catch {
    return null
  }
}

function readStoredToken() {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(AUTH_TOKEN_KEY)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStoredUser())
  const [token, setToken] = useState(() => readStoredToken())

  const login = useCallback(async ({ email, password }) => {
    const normalizedEmail = email?.trim().toLowerCase()
    if (!normalizedEmail || !password) {
      return { success: false, error: 'Enter your email and password.' }
    }

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          email: normalizedEmail,
          password,
        }),
      })

      const payload = await response.json().catch(() => null)
      const loginData = getLoginData(payload)

      if (!response.ok) {
        return { success: false, error: getResponseError(payload, 'Unable to sign in.') }
      }
      if (!loginData.token || !loginData.user) {
        return { success: false, error: getResponseError(payload, 'The login response did not include an access token and user.') }
      }

      const authenticatedUser = loginData.user
      window.localStorage.setItem(AUTH_TOKEN_KEY, loginData.token)
      window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authenticatedUser))
      setToken(loginData.token)
      setUser(authenticatedUser)

      return { success: true, user: authenticatedUser, token: loginData.token }
    } catch {
      return { success: false, error: 'Could not reach the sign-in service. Check your connection and try again.' }
    }
  }, [])

  const logout = useCallback(() => {
    window.localStorage.removeItem(AUTH_TOKEN_KEY)
    window.localStorage.removeItem(AUTH_USER_KEY)
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

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
