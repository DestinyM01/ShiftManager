import { useState } from "react"
import { Link } from "react-router-dom"
import { sendPasswordResetEmail } from "firebase/auth"
import { auth } from "../firebase"
import { emailOnlySchema } from "../validation/schemas"

export default function ResetPassword() {
  const [email, setEmail] = useState("")
  const [err, setErr] = useState("")
  const [msg, setMsg] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr("")
    setMsg("")
    const v = emailOnlySchema.safeParse({ email })
    if (!v.success) {
      setErr(v.error.errors[0].message)
      return
    }
    try {
      setSubmitting(true)
      await sendPasswordResetEmail(auth, email)
      setMsg("Te enviamos un enlace de recuperación a tu correo.")
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
        <input
          placeholder="Email"
          type="email"
          autoComplete="email"
          required
          maxLength={120}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {err && <p className="text-red-400">{err}</p>}
        {msg && <p className="text-green-400">{msg}</p>}
        <button className="btn" disabled={submitting}>{submitting ? "Enviando..." : "Enviar enlace"}</button>
      </form>
      <div className="mt-3 text-sm">
        <Link to="/" className="underline text-gray-400 hover:text-white">Volver a login</Link>
      </div>
    </div>
  )
}
