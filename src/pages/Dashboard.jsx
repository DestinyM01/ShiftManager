import { useEffect, useState } from "react"
import { auth, db } from "../firebase"
import { doc, getDoc } from "firebase/firestore"
import EmployeeManager from "../components/EmployeeManager.jsx"
import ShiftCalendar from "../components/ShiftCalendar.jsx"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth.js"

export default function Dashboard() {
  const [profile, setProfile] = useState(null)
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      if (!u) return navigate("/")
      const snap = await getDoc(doc(db, "employees", u.uid))
      if (snap.exists()) setProfile({ id: u.uid, ...snap.data() })
    })
    return () => unsub()
  }, [navigate])

  if (!profile) return <p>Cargando…</p>

  return (
    <div className="grid gap-6">
      {profile.role === "admin" && (
        <section className="card">
          <h2 className="text-xl font-semibold mb-3">Gestión de empleados</h2>
          <EmployeeManager />
        </section>
      )}

      <section className="card">
        <h2 className="text-xl font-semibold mb-3">Calendario de turnos</h2>
        <ShiftCalendar role={profile.role} userId={profile.id} />
      </section>
    </div>
  )
}
