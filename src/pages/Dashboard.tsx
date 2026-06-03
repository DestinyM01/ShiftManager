import { useEffect } from "react"
import EmployeeManager from "../components/EmployeeManager"
import ShiftCalendar from "../components/ShiftCalendar"
import StatsBar from "../components/StatsBar"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import { useStats } from "../hooks/useStats"

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, role, loading } = useAuth()
  const stats = useStats()

  useEffect(() => {
    if (!loading && !user) navigate("/")
  }, [user, loading, navigate])

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-2 border-accent2 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user || !role) return null

  return (
    <div className="grid gap-6">
      {role === "admin" && (
        <>
          <StatsBar {...stats} />
          <section className="card">
            <h2 className="text-xl font-semibold mb-3">Gestión de empleados</h2>
            <EmployeeManager />
          </section>
        </>
      )}
      <section className="card">
        <h2 className="text-xl font-semibold mb-3">Calendario de turnos</h2>
        <ShiftCalendar role={role} userId={user.uid} />
      </section>
    </div>
  )
}
