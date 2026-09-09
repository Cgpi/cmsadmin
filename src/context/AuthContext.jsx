import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

const API_BASE_URL = 'https://www.cgpisoftware.com/vpconstruction/api'
const AUTH_TOKEN_KEY = 'vp_auth_token'
const AUTH_USER_KEY = 'vp_auth_user'

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
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      })

      const payload = await response.json().catch(() => null)

      if (!response.ok || !payload?.token || !payload?.user) {
        return { success: false, error: payload?.message || 'Invalid email or password' }
      }

      const authenticatedUser = payload.user
      window.localStorage.setItem(AUTH_TOKEN_KEY, payload.token)
      window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authenticatedUser))
      setToken(payload.token)
      setUser(authenticatedUser)

      return { success: true, user: authenticatedUser, token: payload.token }
    } catch {
      return { success: false, error: 'Unable to sign in right now. Please try again.' }
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
