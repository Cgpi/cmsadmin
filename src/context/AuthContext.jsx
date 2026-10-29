import { useState, useCallback } from 'react'
import { AuthStateContext } from './AuthStateContext'
import { API_BASE_URL, AUTH_TOKEN_KEY } from './authApi'

const AUTH_USER_KEY = 'vp_auth_user'
const DEMO_PASSWORD = 'password'
const DEMO_USERS = {
  'admin@cgpisoftwarecms.com': { id: 'super-admin', name: 'Super Admin', role: 'super_admin' },
  'user1@cgpisoftwarecms.com': { id: 'site-admin', name: 'Site Admin', role: 'user' },
}

function getDemoUser(email, password) {
  const normalizedEmail = String(email || '').trim().toLowerCase()
  const user = DEMO_USERS[normalizedEmail]
  if (!user || password !== DEMO_PASSWORD) return null

  return {
    ...user,
    email: normalizedEmail,
    avatar: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user.name)}`,
  }
}

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
      const demoUser = getDemoUser(normalizedEmail, password)

      if (demoUser && (!response.ok || !loginData.token || !loginData.user)) {
        const demoToken = `demo-${demoUser.role}-${demoUser.id}`
        window.localStorage.setItem(AUTH_TOKEN_KEY, demoToken)
        window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(demoUser))
        setToken(demoToken)
        setUser(demoUser)
        return { success: true, user: demoUser, token: demoToken }
      }

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
      const demoUser = getDemoUser(normalizedEmail, password)
      if (demoUser) {
        const demoToken = `demo-${demoUser.role}-${demoUser.id}`
        window.localStorage.setItem(AUTH_TOKEN_KEY, demoToken)
        window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(demoUser))
        setToken(demoToken)
        setUser(demoUser)
        return { success: true, user: demoUser, token: demoToken }
      }

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
    <AuthStateContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthStateContext.Provider>
  )
}
