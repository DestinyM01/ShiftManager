import { useEffect, useState } from "react"
import { auth, db } from "../firebase"
import { doc, getDoc } from "firebase/firestore"
import type { User } from "firebase/auth"
import type { UserRole } from "../types"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      setUser(u)
      if (u) {
        try {
          const snap = await getDoc(doc(db, "employees", u.uid))
          setRole(snap.exists() ? ((snap.data().role as UserRole) ?? null) : null)
        } catch {
          setRole(null)
        }
      } else {
        setRole(null)
      }
      setLoading(false)
    })
    return () => unsub()
  }, [])

  return { user, role, loading }
}
