import { useContext } from 'react'
import { AuthStateContext } from './AuthStateContext'

export function useAuth() {
  const ctx = useContext(AuthStateContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}