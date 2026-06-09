import { db } from "../firebase"
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
  type DocumentData,
  type FirestoreError,
} from "firebase/firestore"
import type { Shift } from "../types"

const shiftsRef = collection(db, "shifts")

function docToShift(id: string, data: DocumentData): Shift {
  return {
    id,
    title: data.title as string,
    start: data.start?.toDate ? (data.start.toDate() as Date) : new Date(data.start as string),
    end: data.end?.toDate ? (data.end.toDate() as Date) : new Date(data.end as string),
    employeeId: data.employeeId as string,
    createdBy: data.createdBy as string | undefined,
  }
}

export function subscribeToShifts(
  role: string,
  userId: string,
  onUpdate: (shifts: Shift[]) => void,
  onError: (e: FirestoreError) => void
): () => void {
  const q =
    role === "admin"
      ? query(shiftsRef, orderBy("start", "desc"))
      : query(shiftsRef, where("employeeId", "==", userId), orderBy("start", "desc"))

  return onSnapshot(q, (snap) => onUpdate(snap.docs.map((d) => docToShift(d.id, d.data()))), onError)
}

export async function addShift(data: Omit<Shift, "id">): Promise<void> {
  await addDoc(shiftsRef, data)
}

export async function updateShift(id: string, data: Partial<Omit<Shift, "id">>): Promise<void> {
  await updateDoc(doc(db, "shifts", id), data as DocumentData)
}

export async function deleteShift(id: string): Promise<void> {
  await deleteDoc(doc(db, "shifts", id))
}
