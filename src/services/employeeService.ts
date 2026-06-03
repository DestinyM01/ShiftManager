import { db } from "../firebase"
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
  type DocumentData,
} from "firebase/firestore"
import type { Employee, UserRole } from "../types"

const employeesRef = collection(db, "employees")

export async function getEmployees(): Promise<Employee[]> {
  const snap = await getDocs(employeesRef)
  const list: Employee[] = snap.docs.map((d) => ({
    id: d.id,
    name: (d.data().name as string) || "(sin nombre)",
    email: (d.data().email as string) || "",
    role: ((d.data().role as UserRole) || "employee"),
  }))
  list.sort((a, b) => a.name.localeCompare(b.name))
  return list
}

export async function addEmployee(data: Omit<Employee, "id">): Promise<void> {
  await addDoc(employeesRef, data)
}

export async function updateEmployee(id: string, data: Pick<Employee, "name" | "role">): Promise<void> {
  await updateDoc(doc(db, "employees", id), data as DocumentData)
}

export async function deleteEmployee(id: string): Promise<void> {
  await deleteDoc(doc(db, "employees", id))
}
