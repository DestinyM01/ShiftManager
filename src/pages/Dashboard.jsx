import { useEffect } from "react"
import EmployeeManager from "../components/EmployeeManager.jsx"
import ShiftCalendar from "../components/ShiftCalendar.jsx"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth.js"

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, role, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user) navigate("/")
  }, [user, loading, navigate])

  if (loading) return <p>Cargando…</p>
  if (!user || !role) return null

  return (
    <div className="grid gap-6">
      {role === "admin" && (
        <section className="card">
          <h2 className="text-xl font-semibold mb-3">Gestión de empleados</h2>
          <EmployeeManager />
        </section>
      )}
      <section className="card">
        <h2 className="text-xl font-semibold mb-3">Calendario de turnos</h2>
        <ShiftCalendar role={role} userId={user.uid} />
      </section>
    </div>
  )
}
