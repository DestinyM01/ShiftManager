// src/components/ShiftCalendar.jsx
import "react-big-calendar/lib/css/react-big-calendar.css";
import moment from "moment";
import { Calendar, momentLocalizer } from "react-big-calendar";
import { useEffect, useMemo, useState } from "react";
import { db } from "../firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { shiftSchema } from "../validation/schemas";

moment.locale("es");
const localizer = momentLocalizer(moment);

export default function ShiftCalendar({ role, userId }) {
  const [events, setEvents] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({ title: "", start: "", end: "", employeeId: "" });
  const [editor, setEditor] = useState(null); // {id,title,start,end,employeeId}
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  const shiftsRef = useMemo(() => collection(db, "shifts"), []);
  const employeesRef = useMemo(() => collection(db, "employees"), []);

  const employeeMap = useMemo(() => {
    const m = new Map();
    for (const e of employees) m.set(e.id, e);
    return m;
  }, [employees]);

  /* ------------ Cargar empleados para el select ------------ */
  const loadEmployees = async () => {
    const snap = await getDocs(employeesRef);
    const list = snap.docs.map((d) => ({
      id: d.id,
      name: d.data().name || "(sin nombre)",
      email: d.data().email || "",
    }));
    list.sort((a, b) => a.name.localeCompare(b.name));
    setEmployees(list);
  };

  /* ------------ Suscripción en tiempo real a shifts ------------ */
  useEffect(() => {
    loadEmployees();

    const baseQ =
      role === "admin"
        ? query(shiftsRef, orderBy("start", "desc"))
        : query(shiftsRef, where("employeeId", "==", userId), orderBy("start", "desc"));

    const unsub = onSnapshot(
      baseQ,
      (snap) => {
        const evs = snap.docs.map((d) => {
          const data = d.data();
          const start = data.start?.toDate ? data.start.toDate() : new Date(data.start);
          const end = data.end?.toDate ? data.end.toDate() : new Date(data.end);
          return {
            id: d.id,
            title: data.title,
            start,
            end,
            employeeId: data.employeeId,
          };
        });
        setEvents(evs);
        setErr("");
      },
      (e) => {
        console.error(e);
        if (e?.code === "failed-precondition") {
          setErr(
            "Falta un índice en Firestore para esta consulta. Ábrelo desde el link azul en la consola del navegador y publícalo."
          );
        } else if (e?.code === "permission-denied") {
          setErr("Permisos insuficientes para leer turnos. Revisa tus reglas y rol.");
        } else {
          setErr(e?.message || "No se pudieron cargar los turnos.");
        }
      }
    );

    return () => unsub();
  }, [role, userId, shiftsRef, employeesRef]);

  /* ------------ Utilidades ------------ */
  const overlaps = (aStart, aEnd, bStart, bEnd) => aStart < bEnd && bStart < aEnd;

  /* ------------ Crear turno (admin) ------------ */
  const add = async () => {
    if (role !== "admin") return;
    setErr("");
    setSaving(true);
    try {
      const parsed = shiftSchema.safeParse({
        title: form.title,
        start: form.start,
        end: form.end,
        employeeId: form.employeeId,
      });
      if (!parsed.success) {
        setErr(parsed.error.errors[0].message);
        return;
      }

      const start = new Date(parsed.data.start);
      const end = new Date(parsed.data.end);

      const hasOverlap = events.some(
        (ev) =>
          ev.employeeId === parsed.data.employeeId &&
          overlaps(start, end, ev.start, ev.end)
      );
      if (hasOverlap) {
        setErr("El empleado ya tiene un turno solapado en ese rango.");
        return;
      }

      await addDoc(shiftsRef, {
        title: parsed.data.title.trim(),
        start,
        end,
        employeeId: parsed.data.employeeId,
        createdBy: userId,
      });

      setForm({ title: "", start: "", end: "", employeeId: "" });
    } catch (e) {
      console.error(e);
      setErr(
        e?.code === "permission-denied"
          ? "Permiso denegado al crear el turno (solo admin)."
          : e?.message || "No se pudo crear el turno."
      );
    } finally {
      setSaving(false);
    }
  };

  /* ------------ Seleccionar evento para editar (admin) ------------ */
  const onSelectEvent = (ev) => {
    if (role !== "admin") return; // empleados no editan
    setEditor({
      id: ev.id,
      title: ev.title,
      start: moment(ev.start).format("YYYY-MM-DDTHH:mm"),
      end: moment(ev.end).format("YYYY-MM-DDTHH:mm"),
      employeeId: ev.employeeId,
    });
  };

  /* ------------ Guardar edición (admin) ------------ */
  const saveEdit = async () => {
    if (!editor) return;
    setErr("");
    setSaving(true);
    try {
      const parsed = shiftSchema.safeParse({
        title: editor.title,
        start: editor.start,
        end: editor.end,
        employeeId: editor.employeeId,
      });
      if (!parsed.success) {
        setErr(parsed.error.errors[0].message);
        return;
      }

      const start = new Date(parsed.data.start);
      const end = new Date(parsed.data.end);

      // solapamiento (excluye el propio)
      const hasOverlap = events.some(
        (ev) =>
          ev.id !== editor.id &&
          ev.employeeId === parsed.data.employeeId &&
          overlaps(start, end, ev.start, ev.end)
      );
      if (hasOverlap) {
        setErr("El empleado ya tiene un turno solapado en ese rango.");
        return;
      }

      await updateDoc(doc(db, "shifts", editor.id), {
        title: parsed.data.title.trim(),
        start,
        end,
        employeeId: parsed.data.employeeId,
      });
      setEditor(null);
    } catch (e) {
      console.error(e);
      setErr(
        e?.code === "permission-denied"
          ? "Permiso denegado al actualizar (solo admin)."
          : e?.message || "No se pudo actualizar el turno."
      );
    } finally {
      setSaving(false);
    }
  };

  /* ------------ Eliminar turno (admin) ------------ */
  const remove = async (id) => {
    setErr("");
    try {
      await deleteDoc(doc(db, "shifts", id));
      if (editor?.id === id) setEditor(null);
    } catch (e) {
      console.error(e);
      setErr(
        e?.code === "permission-denied"
          ? "Permiso denegado al eliminar (solo admin)."
          : e?.message || "No se pudo eliminar el turno."
      );
    }
  };

  /* ------------ Render ------------ */
  return (
    <div className="max-w-6xl mx-auto">
      {/* Controles superiores (solo admin) */}
      {role === "admin" && (
        <div className="flex flex-wrap gap-3 mb-4">
          <input
            className="w-full sm:w-56 h-11 px-4 rounded-lg border border-gray-300 text-gray-900"
            placeholder="Título"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <input
            type="datetime-local"
            className="w-full sm:w-64 h-11 px-4 rounded-lg border border-gray-300 text-gray-900"
            value={form.start}
            onChange={(e) => setForm({ ...form, start: e.target.value })}
          />

          <input
            type="datetime-local"
            className="w-full sm:w-64 h-11 px-4 rounded-lg border border-gray-300 text-gray-900"
            value={form.end}
            onChange={(e) => setForm({ ...form, end: e.target.value })}
          />

          <select
            className="w-full sm:w-80 h-11 px-3 rounded-lg border border-gray-300 text-gray-900"
            value={form.employeeId}
            onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
          >
            <option value="">Selecciona empleado…</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} {emp.email ? `(${emp.email})` : ""}
              </option>
            ))}
          </select>

          <button
            className="btn disabled:opacity-60 w-full sm:w-auto"
            onClick={add}
            disabled={saving}
          >
            {saving ? "Guardando..." : "Agregar turno"}
          </button>
        </div>
      )}

      {err && <p className="text-red-400 mb-3">{err}</p>}

      {/* Layout: calendario + editor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Calendario ocupa 2/3 en pantallas grandes */}
        <div className="lg:col-span-2 min-w-0">
          <div className="card overflow-hidden">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 520, background: "white", color: "black" }}
              views={["month", "week", "day", "agenda"]}
              popup
              onSelectEvent={onSelectEvent}
              messages={{
                month: "Mes",
                week: "Semana",
                day: "Día",
                agenda: "Agenda",
                today: "Hoy",
                previous: "Atrás",
                next: "Siguiente",
              }}
              components={{
                event: ({ event }) => {
                  const emp = employeeMap.get(event.employeeId);
                  const label =
                    role === "admin"
                      ? `${event.title}${
                          emp ? ` — ${emp.name}${emp.email ? ` (${emp.email})` : ""}` : ""
                        }`
                      : event.title;
                  return (
                    <div className="text-xs truncate">
                      <strong>{label}</strong>
                    </div>
                  );
                },
              }}
            />
          </div>
        </div>

        {/* Editor lateral con scroll y ancho controlado (solo admin) */}
        {role === "admin" && (
          <aside className="min-w-0">
            <div className="card h-[520px] overflow-auto">
              <h3 className="text-lg font-semibold mb-3">Editor de turno</h3>

              {!editor ? (
                <p className="text-sm text-gray-300">
                  Selecciona un evento del calendario para editar o eliminar.
                </p>
              ) : (
                <div className="grid gap-3">
                  <input
                    className="w-full h-11 px-3 rounded-lg border border-gray-300 text-gray-900"
                    value={editor.title}
                    onChange={(e) => setEditor({ ...editor, title: e.target.value })}
                  />
                  <input
                    type="datetime-local"
                    className="w-full h-11 px-3 rounded-lg border border-gray-300 text-gray-900"
                    value={editor.start}
                    onChange={(e) => setEditor({ ...editor, start: e.target.value })}
                  />
                  <input
                    type="datetime-local"
                    className="w-full h-11 px-3 rounded-lg border border-gray-300 text-gray-900"
                    value={editor.end}
                    onChange={(e) => setEditor({ ...editor, end: e.target.value })}
                  />
                  <select
                    className="w-full h-11 px-3 rounded-lg border border-gray-300 text-gray-900"
                    value={editor.employeeId}
                    onChange={(e) => setEditor({ ...editor, employeeId: e.target.value })}
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} {emp.email ? `(${emp.email})` : ""}
                      </option>
                    ))}
                  </select>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      className="btn disabled:opacity-60 w-full sm:w-auto"
                      onClick={saveEdit}
                      disabled={saving}
                    >
                      {saving ? "Guardando..." : "Guardar cambios"}
                    </button>
                    <button
                      className="btn-secondary w-full sm:w-auto"
                      onClick={() => remove(editor.id)}
                    >
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
  );
}
