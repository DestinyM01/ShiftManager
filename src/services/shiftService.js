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
} from "firebase/firestore"

const shiftsRef = collection(db, "shifts")

export function subscribeToShifts(role, userId, onUpdate, onError) {
  const q =
    role === "admin"
      ? query(shiftsRef, orderBy("start", "desc"))
      : query(shiftsRef, where("employeeId", "==", userId), orderBy("start", "desc"))

  return onSnapshot(
    q,
    (snap) => {
      const shifts = snap.docs.map((d) => {
        const data = d.data()
        return {
          id: d.id,
          title: data.title,
          start: data.start?.toDate ? data.start.toDate() : new Date(data.start),
          end: data.end?.toDate ? data.end.toDate() : new Date(data.end),
          employeeId: data.employeeId,
        }
      })
      onUpdate(shifts)
    },
    onError
  )
}

export async function addShift(data) {
  return addDoc(shiftsRef, data)
}

export async function updateShift(id, data) {
  return updateDoc(doc(db, "shifts", id), data)
}

export async function deleteShift(id) {
  return deleteDoc(doc(db, "shifts", id))
}
