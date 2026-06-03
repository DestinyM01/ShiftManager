// src/components/ShiftCalendar.tsx
import "react-big-calendar/lib/css/react-big-calendar.css"
import { Calendar, dateFnsLocalizer } from "react-big-calendar"
import { format, getDay, parse, startOfWeek } from "date-fns"
import { es } from "date-fns/locale"
import { useEffect, useMemo, useState } from "react"
import { shiftSchema } from "../validation/schemas"
import { addShift, deleteShift, subscribeToShifts, updateShift } from "../services/shiftService"
import { getEmployees } from "../services/employeeService"
import { useToast } from "../context/ToastContext"
import type { EditorState, Employee, Shift, ShiftInput } from "../types"

const locales = { es }
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales })

type CalendarShift = Shift & { resource?: unknown }

export default function ShiftCalendar({ role, userId }: { role: string; userId: string }) {
  const [events, setEvents] = useState<Shift[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [form, setForm] = useState<ShiftInput>({ title: "", start: "", end: "", employeeId: "" })
  const [editor, setEditor] = useState<EditorState | null>(null)
  const [err, setErr] = useState("")
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const employeeMap = useMemo(() => {
    const m = new Map<string, Employee>()
    for (const e of employees) m.set(e.id, e)
    return m
  }, [employees])

  useEffect(() => {
    getEmployees().then(setEmployees).catch(console.error)

    const unsub = subscribeToShifts(
      role,
      userId,
      (shifts) => { setEvents(shifts); setErr("") },
      (e) => {
        const error = e as { code?: string; message?: string }
        if (error?.code === "failed-precondition") {
          setErr("Falta un índice en Firestore. Ábrelo desde el link azul en la consola del navegador.")
        } else if (error?.code === "permission-denied") {
          setErr("Permisos insuficientes para leer turnos.")
        } else {
          setErr(error?.message || "No se pudieron cargar los turnos.")
        }
      }
    )

    return () => unsub()
  }, [role, userId])

  const overlaps = (aS: Date, aE: Date, bS: Date, bE: Date) => aS < bE && bS < aE

  const add = async () => {
    if (role !== "admin") return
    setSaving(true)
    try {
      const parsed = shiftSchema.safeParse(form)
      if (!parsed.success) { toast(parsed.error.errors[0].message, "error"); return }

      const start = new Date(parsed.data.start)
      const end = new Date(parsed.data.end)

      if (events.some((ev) => ev.employeeId === parsed.data.employeeId && overlaps(start, end, ev.start, ev.end))) {
        toast("El empleado ya tiene un turno solapado en ese rango.", "error")
        return
      }

      await addShift({ title: parsed.data.title.trim(), start, end, employeeId: parsed.data.employeeId, createdBy: userId })
      setForm({ title: "", start: "", end: "", employeeId: "" })
      toast("Turno agregado.", "success")
    } catch (e) {
      const error = e as { code?: string; message?: string }
      toast(error?.code === "permission-denied" ? "Permiso denegado (solo admin)." : error?.message || "No se pudo crear el turno.", "error")
    } finally {
      setSaving(false)
    }
  }

  const onSelectEvent = (ev: CalendarShift) => {
    if (role !== "admin") return
    setEditor({
      id: ev.id,
      title: ev.title,
      start: format(ev.start, "yyyy-MM-dd'T'HH:mm"),
      end: format(ev.end, "yyyy-MM-dd'T'HH:mm"),
      employeeId: ev.employeeId,
    })
  }

  const saveEdit = async () => {
    if (!editor) return
    setSaving(true)
    try {
      const parsed = shiftSchema.safeParse(editor)
      if (!parsed.success) { toast(parsed.error.errors[0].message, "error"); return }

      const start = new Date(parsed.data.start)
      const end = new Date(parsed.data.end)

      if (events.some((ev) => ev.id !== editor.id && ev.employeeId === parsed.data.employeeId && overlaps(start, end, ev.start, ev.end))) {
        toast("El empleado ya tiene un turno solapado en ese rango.", "error")
        return
      }

      await updateShift(editor.id, { title: parsed.data.title.trim(), start, end, employeeId: parsed.data.employeeId })
      setEditor(null)
      toast("Turno actualizado.", "success")
    } catch (e) {
      const error = e as { code?: string; message?: string }
      toast(error?.code === "permission-denied" ? "Permiso denegado (solo admin)." : error?.message || "No se pudo actualizar.", "error")
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id: string) => {
    try {
      await deleteShift(id)
      if (editor?.id === id) setEditor(null)
      toast("Turno eliminado.", "success")
    } catch (e) {
      const error = e as { code?: string; message?: string }
      toast(error?.code === "permission-denied" ? "Permiso denegado (solo admin)." : error?.message || "No se pudo eliminar.", "error")
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      {role === "admin" && (
        <div className="flex flex-wrap gap-3 mb-4">
          <input className="w-full sm:w-56 h-11 px-4 rounded-lg border border-gray-300 text-gray-900"
            placeholder="Título" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input type="datetime-local" className="w-full sm:w-64 h-11 px-4 rounded-lg border border-gray-300 text-gray-900"
            value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} />
          <input type="datetime-local" className="w-full sm:w-64 h-11 px-4 rounded-lg border border-gray-300 text-gray-900"
            value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} />
          <select className="w-full sm:w-80 h-11 px-3 rounded-lg border border-gray-300 text-gray-900"
            value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })}>
            <option value="">Selecciona empleado…</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>{emp.name} {emp.email ? `(${emp.email})` : ""}</option>
            ))}
          </select>
          <button className="btn disabled:opacity-60 w-full sm:w-auto" onClick={add} disabled={saving}>
            {saving ? "Guardando..." : "Agregar turno"}
          </button>
        </div>
      )}

      {err && <p className="text-red-400 mb-3 text-sm">{err}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 min-w-0">
          <div className="card overflow-hidden">
            <Calendar<CalendarShift>
              localizer={localizer}
              culture="es"
              events={events as CalendarShift[]}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 520, background: "white", color: "black" }}
              views={["month", "week", "day", "agenda"]}
              popup
              onSelectEvent={onSelectEvent}
              messages={{ month: "Mes", week: "Semana", day: "Día", agenda: "Agenda", today: "Hoy", previous: "Atrás", next: "Siguiente" }}
              components={{
                event: ({ event }) => {
                  const emp = employeeMap.get(event.employeeId)
                  const label = role === "admin"
                    ? `${event.title}${emp ? ` — ${emp.name}${emp.email ? ` (${emp.email})` : ""}` : ""}`
                    : event.title
                  return <div className="text-xs truncate"><strong>{label}</strong></div>
                },
              }}
            />
          </div>
        </div>

        {role === "admin" && (
          <aside className="min-w-0">
            <div className="card h-[520px] overflow-auto">
              <h3 className="text-lg font-semibold mb-3">Editor de turno</h3>
              {!editor ? (
                <p className="text-sm text-gray-400">Selecciona un evento del calendario para editar o eliminar.</p>
              ) : (
                <div className="grid gap-3">
                  <input className="w-full h-11 px-3 rounded-lg border border-gray-300 text-gray-900"
                    value={editor.title} onChange={(e) => setEditor({ ...editor, title: e.target.value })} />
                  <input type="datetime-local" className="w-full h-11 px-3 rounded-lg border border-gray-300 text-gray-900"
                    value={editor.start} onChange={(e) => setEditor({ ...editor, start: e.target.value })} />
                  <input type="datetime-local" className="w-full h-11 px-3 rounded-lg border border-gray-300 text-gray-900"
                    value={editor.end} onChange={(e) => setEditor({ ...editor, end: e.target.value })} />
                  <select className="w-full h-11 px-3 rounded-lg border border-gray-300 text-gray-900"
                    value={editor.employeeId} onChange={(e) => setEditor({ ...editor, employeeId: e.target.value })}>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>{emp.name} {emp.email ? `(${emp.email})` : ""}</option>
                    ))}
                  </select>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button className="btn disabled:opacity-60 w-full sm:w-auto" onClick={saveEdit} disabled={saving}>
                      {saving ? "Guardando..." : "Guardar cambios"}
                    </button>
                    <button className="btn-secondary w-full sm:w-auto" onClick={() => remove(editor.id)}>
                      Eliminar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}
