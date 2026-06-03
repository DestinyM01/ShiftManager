import { useEffect, useState } from "react"
import { employeeSchema } from "../validation/schemas.js"
import { getEmployees, addEmployee, deleteEmployee } from "../services/employeeService.js"

export default function EmployeeManager() {
  const [employees, setEmployees] = useState([])
  const [form, setForm] = useState({ name: "", email: "", role: "employee" })
  const [err, setErr] = useState("")

  const load = async () => {
    try {
      setEmployees(await getEmployees())
    } catch (e) {
      setErr(e?.message || "No se pudieron cargar los empleados.")
    }
  }

  useEffect(() => { load() }, [])

  const add = async () => {
    setErr("")
    const v = employeeSchema.safeParse(form)
    if (!v.success) return setErr(v.error.errors[0].message)
    try {
      await addEmployee(v.data)
      setForm({ name: "", email: "", role: "employee" })
      load()
    } catch (e) {
      setErr(
        e?.code === "permission-denied"
          ? "Permiso denegado al agregar empleado."
          : e?.message || "No se pudo agregar el empleado."
      )
    }
  }

  const removeEmp = async (id) => {
    setErr("")
    try {
      await deleteEmployee(id)
      load()
    } catch (e) {
      setErr(
        e?.code === "permission-denied"
          ? "Permiso denegado al eliminar empleado."
          : e?.message || "No se pudo eliminar el empleado."
      )
    }
  }

  return (
    <div>
      <div className="flex gap-2 mb-3">
        <input placeholder="Nombre" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="text-black rounded-md px-3 py-2">
          <option value="employee">Empleado</option>
          <option value="admin">Admin</option>
        </select>
        <button className="btn" onClick={add}>Agregar</button>
      </div>
      {err && <p className="text-red-400 mb-2">{err}</p>}

      <table className="w-full text-sm">
        <thead className="text-left text-gray-300">
          <tr><th className="py-2">Nombre</th><th>Email</th><th>Rol</th><th></th></tr>
        </thead>
        <tbody>
          {employees.map(e => (
            <tr key={e.id} className="border-t border-gray-700">
              <td className="py-2">{e.name}</td>
              <td>{e.email}</td>
              <td>{e.role}</td>
              <td className="text-right">
                <button className="btn-secondary" onClick={() => removeEmp(e.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
          {employees.length === 0 && (
            <tr><td className="py-3 text-gray-400" colSpan={4}>Sin empleados aún.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
