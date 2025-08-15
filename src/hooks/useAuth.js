import { useEffect, useState } from "react"
import { auth, db } from "../firebase"
import { doc, getDoc } from "firebase/firestore"

export function useAuth() {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      setUser(u)
      if (u) {
        try {
          const snap = await getDoc(doc(db, "employees", u.uid))
          if (snap.exists()) setRole(snap.data().role || null)
          else setRole(null)
        } catch { setRole(null) }
      } else {
        setRole(null)
      }
    })
    return () => unsub()
  }, [])

  return { user, role }
}
