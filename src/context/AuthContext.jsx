import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

const MOCK_ACCOUNTS = [
  {
    email: 'admin@vpconstruction.com',
    password: 'password',
    user: { id: 1, name: 'Super Admin', email: 'admin@vpconstruction.com', role: 'super_admin', site_name: 'super_admin' },
  },
  {
    email: 'user1@vpconstruction.com',
    password: 'password',
    user: { id: 2, name: 'Site One User', email: 'user1@vpconstruction.com', role: 'user', site_name: 'vp-construction-mumbai' },
  },
]

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  const login = useCallback(({ email, password }) => {
    const match = MOCK_ACCOUNTS.find(
      (a) => a.email === email.trim().toLowerCase() && a.password === password,
    )
    if (match) {
      setUser(match.user)
      return { success: true, user: match.user }
    }
    return { success: false, error: 'Invalid email or password' }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
