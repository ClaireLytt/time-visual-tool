import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  sendPasswordResetEmail,
  signOut,
  type User,
} from 'firebase/auth'
import { auth } from '../firebase'
import { clearFirestoreCache } from '../hooks/useFirestore'

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  switchAccount: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let didAnonymousAttempt = false
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u)
        setLoading(false)
      } else if (!didAnonymousAttempt) {
        // No user — try anonymous sign-in as fallback
        didAnonymousAttempt = true
        signInAnonymously(auth).catch(() => {
          // Anonymous auth failed (e.g. not enabled in Firebase console)
          // Degrade gracefully — app works without auth, data stays in-memory
          setLoading(false)
        })
      } else {
        setUser(null)
        setLoading(false)
      }
    })
    const timeout = setTimeout(() => setLoading(false), 5000)
    return () => { unsubscribe(); clearTimeout(timeout) }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }, [])

  const register = useCallback(async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password)
  }, [])

  const logout = useCallback(async () => {
    clearFirestoreCache()
    await signOut(auth)
  }, [])

  const switchAccount = useCallback(async () => {
    localStorage.removeItem('time-visual-saved-email')
    clearFirestoreCache()
    await signOut(auth)
  }, [])

  const resetPassword = useCallback(async (email: string) => {
    await sendPasswordResetEmail(auth, email)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, switchAccount, resetPassword }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
