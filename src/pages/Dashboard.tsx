import { useEffect, useMemo, useState } from "react"
import { isSameWeek } from "date-fns"
import EmployeeManager from "../components/EmployeeManager"
import ShiftCalendar from "../components/ShiftCalendar"
import StatsBar from "../components/StatsBar"
import { useAuth } from "../context/AuthContext"
import { useToast } from "../context/ToastContext"
import { subscribeToEmployees } from "../services/employeeService"
import { subscribeToShifts } from "../services/shiftService"
import { mapFirestoreError } from "../services/firestoreErrors"
import type { Employee, Shift } from "../types"

export default function Dashboard() {
  const { user, role } = useAuth()
  const { toast } = useToast()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [shifts, setShifts] = useState<Shift[]>([])
  const [loadError, setLoadError] = useState("")

  const isAdmin = role === "admin"

  // Firestore rules only allow admins to list the employees collection,
  // and only the admin UI needs it — skip the listener entirely otherwise.
  useEffect(() => {
    if (!isAdmin) return
    return subscribeToEmployees(setEmployees, (e) =>
      toast(mapFirestoreError(e, "No se pudieron cargar los empleados."), "error")
    )
  }, [isAdmin, toast])

  useEffect(() => {
    if (!user || !role) return
    return subscribeToShifts(
      role,
      user.uid,
      (s) => {
        setShifts(s)
        setLoadError("")
      },
      (e) => setLoadError(mapFirestoreError(e, "No se pudieron cargar los turnos."))
    )
  }, [user, role])

  // Monday week start to match the calendar's Spanish locale
  const stats = useMemo(
    () => ({
      employeeCount: employees.length,
      shiftCount: shifts.length,
      weekShiftCount: shifts.filter((s) => isSameWeek(s.start, new Date(), { weekStartsOn: 1 })).length,
    }),
    [employees, shifts]
  )

  if (!user) return null

  if (!role) {
    return (
      <div className="max-w-md mx-auto card text-center">
        <p className="text-gray-400">Tu perfil no está configurado. Contacta a un administrador.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      {isAdmin && (
        <>
          <StatsBar {...stats} />
          <section className="card">
            <h2 className="text-xl font-semibold mb-3">Gestión de empleados</h2>
            <EmployeeManager employees={employees} />
          </section>
        </>
      )}
      <section className="card">
        <h2 className="text-xl font-semibold mb-3">Calendario de turnos</h2>
        <ShiftCalendar
          role={role}
          userId={user.uid}
          events={shifts}
          employees={employees}
          loadError={loadError}
        />
      </section>
    </div>
  )
}
