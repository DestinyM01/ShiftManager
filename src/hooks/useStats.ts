import { useEffect, useState } from "react"
import { db } from "../firebase"
import { collection, onSnapshot } from "firebase/firestore"
import { endOfWeek, startOfWeek } from "date-fns"

export function useStats() {
  const [employeeCount, setEmployeeCount] = useState(0)
  const [shiftCount, setShiftCount] = useState(0)
  const [weekShiftCount, setWeekShiftCount] = useState(0)

  useEffect(() => {
    const unsubEmployees = onSnapshot(collection(db, "employees"), (snap) => {
      setEmployeeCount(snap.size)
    })

    const unsubShifts = onSnapshot(collection(db, "shifts"), (snap) => {
      setShiftCount(snap.size)
      const now = new Date()
      const weekStart = startOfWeek(now)
      const weekEnd = endOfWeek(now)
      const count = snap.docs.filter((d) => {
        const raw = d.data().start
        const start: Date = raw?.toDate ? (raw.toDate() as Date) : new Date(raw as string)
        return start >= weekStart && start <= weekEnd
      }).length
      setWeekShiftCount(count)
    })

    return () => {
      unsubEmployees()
      unsubShifts()
    }
  }, [])

  return { employeeCount, shiftCount, weekShiftCount }
}
