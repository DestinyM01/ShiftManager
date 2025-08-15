import { useEffect, useState } from "react"
import { db } from "../firebase"
import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore"
import { employeeSchema } from "../validation/schemas.js"

export default function EmployeeManager() {
  const [employees, setEmployees] = useState([])
  const [form, setForm] = useState({ name: "", email: "", role: "employee" })
  const [err, setErr] = useState("")

  const load = async () => {
    const snap = await getDocs(collection(db, "employees"))
    setEmployees(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  }

  useEffect(() => { load() }, [])

  const add = async () => {
    setErr("")
    const v = employeeSchema.safeParse(form)
    if (!v.success) return setErr(v.error.errors[0].message)
    await addDoc(collection(db, "employees"), v.data)
    setForm({ name: "", email: "", role: "employee" })
    load()
  }

  const removeEmp = async (id) => {
    await deleteDoc(doc(db, "employees", id))
    load()
  }

  return (
    <div>
      <div className="flex gap-2 mb-3">
        <input placeholder="Nombre" value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/>
        <input placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})}/>
        <select value={form.role} onChange={e=>setForm({...form, role:e.target.value})} className="text-black rounded-md px-3 py-2">
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
                <button className="btn-secondary" onClick={()=>removeEmp(e.id)}>Eliminar</button>
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
