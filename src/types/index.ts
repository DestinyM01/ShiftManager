export type UserRole = "admin" | "employee"

export interface Employee {
  id: string
  name: string
  email: string
  role: UserRole
}

export interface Shift {
  id: string
  title: string
  start: Date
  end: Date
  employeeId: string
  createdBy?: string
}

export interface ShiftInput {
  title: string
  start: string
  end: string
  employeeId: string
}

export interface EditorState extends ShiftInput {
  id: string
}
