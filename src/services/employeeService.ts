import { db } from "../firebase"
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
  type DocumentData,
  type FirestoreError,
} from "firebase/firestore"
import type { Employee, UserRole } from "../types"

const employeesRef = collection(db, "employees")

export function subscribeToEmployees(
  onUpdate: (employees: Employee[]) => void,
  onError: (e: FirestoreError) => void
): () => void {
  return onSnapshot(
    employeesRef,
    (snap) => {
      const list: Employee[] = snap.docs.map((d) => ({
        id: d.id,
        name: (d.data().name as string) || "(sin nombre)",
        email: (d.data().email as string) || "",
        role: ((d.data().role as UserRole) || "employee"),
      }))
      list.sort((a, b) => a.name.localeCompare(b.name))
      onUpdate(list)
    },
    onError
  )
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
