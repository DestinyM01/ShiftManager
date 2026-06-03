import { useState } from "react"
import { Link } from "react-router-dom"
import { sendPasswordResetEmail } from "firebase/auth"
import { auth } from "../firebase"
import { emailOnlySchema } from "../validation/schemas"
import { useToast } from "../context/ToastContext"

export default function ResetPassword() {
  const [email, setEmail] = useState("")
  const [err, setErr] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr("")
    const v = emailOnlySchema.safeParse({ email })
    if (!v.success) { setErr(v.error.errors[0].message); return }
    try {
      setSubmitting(true)
      await sendPasswordResetEmail(auth, email)
      toast("Te enviamos un enlace de recuperación a tu correo.", "success")
      setEmail("")
    } catch {
      setErr("No se pudo enviar el enlace")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-md mx-auto card">
      <h1 className="text-2xl font-semibold mb-4">Recuperar contraseña</h1>
      <form onSubmit={submit} className="grid gap-3" noValidate>
        <input placeholder="Email" type="email" autoComplete="email" required maxLength={120}
          value={email} onChange={(e) => setEmail(e.target.value)} />
        {err && <p className="text-red-400">{err}</p>}
        <button className="btn" disabled={submitting}>{submitting ? "Enviando..." : "Enviar enlace"}</button>
      </form>
      <div className="mt-3 text-sm">
        <Link to="/" className="underline text-gray-400 hover:text-white">Volver a login</Link>
      </div>
    </div>
  )
}
