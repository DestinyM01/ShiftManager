import { describe, it, expect } from "vitest"
import {
  authLoginSchema,
  authRegisterSchema,
  employeeSchema,
  shiftSchema,
} from "../validation/schemas"

describe("employeeSchema", () => {
  it("accepts a valid employee", () => {
    expect(employeeSchema.safeParse({ name: "Ana", email: "ana@test.com", role: "employee" }).success).toBe(true)
  })
  it("rejects an empty name", () => {
    expect(employeeSchema.safeParse({ name: "", email: "a@b.com", role: "employee" }).success).toBe(false)
  })
  it("rejects an invalid email", () => {
    expect(employeeSchema.safeParse({ name: "Ana", email: "not-an-email", role: "employee" }).success).toBe(false)
  })
  it("rejects an unknown role", () => {
    expect(employeeSchema.safeParse({ name: "Ana", email: "a@b.com", role: "manager" }).success).toBe(false)
  })
})

describe("shiftSchema", () => {
  it("accepts a valid shift", () => {
    expect(
      shiftSchema.safeParse({
        title: "Turno mañana",
        start: "2026-06-10T09:00",
        end: "2026-06-10T17:00",
        employeeId: "abc123",
      }).success
    ).toBe(true)
  })
  it("rejects end before start", () => {
    const result = shiftSchema.safeParse({
      title: "Turno",
      start: "2026-06-10T17:00",
      end: "2026-06-10T09:00",
      employeeId: "abc123",
    })
    expect(result.success).toBe(false)
  })
  it("rejects a missing employeeId", () => {
    const result = shiftSchema.safeParse({
      title: "Turno",
      start: "2026-06-10T09:00",
      end: "2026-06-10T17:00",
      employeeId: "",
    })
    expect(result.success).toBe(false)
    expect(result.error?.errors[0].message).toBe("Selecciona un empleado")
  })
  it("rejects a missing title", () => {
    expect(
      shiftSchema.safeParse({ title: "", start: "2026-06-10T09:00", end: "2026-06-10T17:00", employeeId: "x" }).success
    ).toBe(false)
  })
})

describe("authLoginSchema", () => {
  it("accepts valid credentials", () => {
    expect(authLoginSchema.safeParse({ email: "user@example.com", password: "password123" }).success).toBe(true)
  })
  it("rejects an invalid email", () => {
    expect(authLoginSchema.safeParse({ email: "notanemail", password: "password123" }).success).toBe(false)
  })
  it("rejects a password that is too short", () => {
    expect(authLoginSchema.safeParse({ email: "user@example.com", password: "12345" }).success).toBe(false)
  })
})

describe("authRegisterSchema", () => {
  it("accepts a valid registration", () => {
    expect(
      authRegisterSchema.safeParse({
        name: "Juan Pérez",
        email: "juan@example.com",
        password: "SecurePass1",
        confirm: "SecurePass1",
      }).success
    ).toBe(true)
  })
  it("rejects mismatched passwords", () => {
    const result = authRegisterSchema.safeParse({
      name: "Juan",
      email: "juan@example.com",
      password: "SecurePass1",
      confirm: "Different1",
    })
    expect(result.success).toBe(false)
    expect(result.error?.errors[0].message).toBe("Las contraseñas no coinciden")
  })
  it("rejects a password with no uppercase", () => {
    expect(
      authRegisterSchema.safeParse({
        name: "Juan",
        email: "j@e.com",
        password: "weakpass1",
        confirm: "weakpass1",
      }).success
    ).toBe(false)
  })
})
