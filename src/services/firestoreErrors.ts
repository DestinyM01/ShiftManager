export function mapFirestoreError(e: unknown, fallback: string): string {
  const err = e as { code?: string; message?: string }
  if (err?.code === "permission-denied") {
    return "Permiso denegado. Revisa tu rol y las reglas de Firestore."
  }
  if (err?.code === "failed-precondition") {
    return "Falta un índice en Firestore para esta consulta. Créalo desde el enlace en la consola del navegador."
  }
  return err?.message || fallback
}
