import { useState } from "react"
import { employeeSchema } from "../validation/schemas"
import { addEmployee, deleteEmployee, updateEmployee } from "../services/employeeService"
import { mapFirestoreError } from "../services/firestoreErrors"
import { useToast } from "../context/ToastContext"
import type { Employee, UserRole } from "../types"

interface EmployeeManagerProps {
  employees: Employee[]
}

export default function EmployeeManager({ employees }: EmployeeManagerProps) {
  const [form, setForm] = useState({ name: "", email: "", role: "employee" as UserRole })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: "", role: "employee" as UserRole })
  const { toast } = useToast()

  const add = async () => {
    const v = employeeSchema.safeParse(form)
    if (!v.success) return toast(v.error.errors[0].message, "error")
    try {
      await addEmployee(v.data)
      setForm({ name: "", email: "", role: "employee" })
      toast("Empleado agregado.", "success")
    } catch (e) {
      toast(mapFirestoreError(e, "No se pudo agregar el empleado."), "error")
    }
  }

  const startEdit = (emp: Employee) => {
    setEditingId(emp.id)
    setEditForm({ name: emp.name, role: emp.role })
  }

  const saveEdit = async (id: string) => {
    if (!editForm.name.trim()) return toast("El nombre no puede estar vacío.", "error")
    try {
      await updateEmployee(id, editForm)
      setEditingId(null)
      toast("Empleado actualizado.", "success")
    } catch (e) {
      toast(mapFirestoreError(e, "No se pudo actualizar el empleado."), "error")
    }
  }

  const removeEmp = async (id: string) => {
    try {
      await deleteEmployee(id)
      toast("Empleado eliminado.", "success")
    } catch (e) {
      toast(mapFirestoreError(e, "No se pudo eliminar el empleado."), "error")
    }
  }

  return (
    <div>
      <div className="flex gap-2 mb-4 flex-wrap">
        <input placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
          className="text-black rounded-md px-3 py-2"
        >
          <option value="employee">Empleado</option>
          <option value="admin">Admin</option>
        </select>
        <button className="btn" onClick={add}>Agregar</button>
      </div>

      <table className="w-full text-sm">
        <thead className="text-left text-gray-400 border-b border-gray-700">
          <tr>
            <th className="pb-2">Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) =>
            editingId === emp.id ? (
              <tr key={emp.id} className="border-t border-gray-700 bg-gray-800/40">
                <td className="py-2 pr-2">
                  <input
                    className="w-full text-sm"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                </td>
                <td className="text-gray-500 text-xs">{emp.email}</td>
                <td>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value as UserRole })}
                    className="text-black rounded px-2 py-1 text-sm"
                  >
                    <option value="employee">Empleado</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="text-right space-x-1 py-2">
                  <button className="btn py-1 px-2 text-xs" onClick={() => saveEdit(emp.id)}>Guardar</button>
                  <button className="btn-secondary py-1 px-2 text-xs" onClick={() => setEditingId(null)}>Cancelar</button>
                </td>
              </tr>
            ) : (
              <tr key={emp.id} className="border-t border-gray-700 hover:bg-gray-800/20">
                <td className="py-2 font-medium">{emp.name}</td>
                <td className="text-gray-400">{emp.email}</td>
                <td>
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-medium ${
                      emp.role === "admin" ? "bg-accent text-white" : "bg-gray-700 text-gray-300"
                    }`}
                  >
                    {emp.role}
                  </span>
                </td>
                <td className="text-right space-x-1 py-2">
                  <button className="btn-secondary py-1 px-2 text-xs" onClick={() => startEdit(emp)}>Editar</button>
                  <button className="btn-secondary py-1 px-2 text-xs" onClick={() => removeEmp(emp.id)}>Eliminar</button>
                </td>
              </tr>
            )
          )}
          {employees.length === 0 && (
            <tr>
              <td className="py-4 text-gray-500 text-center" colSpan={4}>Sin empleados aún.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
