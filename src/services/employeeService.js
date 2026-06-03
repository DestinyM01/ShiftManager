import { db } from "../firebase"
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
} from "firebase/firestore"

const employeesRef = collection(db, "employees")

export async function getEmployees() {
  const snap = await getDocs(employeesRef)
  const list = snap.docs.map((d) => ({
    id: d.id,
    name: d.data().name || "(sin nombre)",
    email: d.data().email || "",
    role: d.data().role || "employee",
  }))
  list.sort((a, b) => a.name.localeCompare(b.name))
  return list
}

export async function addEmployee(data) {
  return addDoc(employeesRef, data)
}

export async function deleteEmployee(id) {
  return deleteDoc(doc(db, "employees", id))
}
