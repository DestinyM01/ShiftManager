import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { auth, db } from "../firebase"
import { doc, getDoc } from "firebase/firestore"
import type { User } from "firebase/auth"
import type { UserRole } from "../types"

interface AuthState {
  user: User | null
  role: UserRole | null
  loading: boolean
}

const AuthContext = createContext<AuthState>({ user: null, role: null, loading: true })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, role: null, loading: true })

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      if (!u) {
        setState({ user: null, role: null, loading: false })
        return
      }
      let role: UserRole | null = null
      try {
        const snap = await getDoc(doc(db, "employees", u.uid))
        role = snap.exists() ? ((snap.data().role as UserRole) ?? null) : null
      } catch {
        role = null
      }
      setState({ user: u, role, loading: false })
    })
    return () => unsub()
  }, [])

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
