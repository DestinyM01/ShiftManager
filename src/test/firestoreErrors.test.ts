import { describe, it, expect } from "vitest"
import { mapFirestoreError } from "../services/firestoreErrors"

describe("mapFirestoreError", () => {
  it("maps permission-denied to a friendly message", () => {
    expect(mapFirestoreError({ code: "permission-denied" }, "fallback")).toContain("Permiso denegado")
  })
  it("maps failed-precondition to the index hint", () => {
    expect(mapFirestoreError({ code: "failed-precondition" }, "fallback")).toContain("índice")
  })
  it("uses the error message when there is no known code", () => {
    expect(mapFirestoreError({ message: "boom" }, "fallback")).toBe("boom")
  })
  it("falls back when the error has no code or message", () => {
    expect(mapFirestoreError({}, "fallback")).toBe("fallback")
    expect(mapFirestoreError(null, "fallback")).toBe("fallback")
  })
})
