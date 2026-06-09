import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "../firebase"
import { authLoginSchema, zodErrorMap } from "../validation/schemas"
import { useToast } from "../context/ToastContext"

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()

  // only surface the error for the field the user just left
  const validateField = (field: keyof typeof form) => {
    const res = authLoginSchema.safeParse(form)
    setErrors((prev) => {
      const next = { ...prev }
      const msg = res.success ? undefined : zodErrorMap(res.error)[field]
      if (msg) next[field] = msg
      else delete next[field]
      return next
    })
  }

  const onChange = (k: keyof typeof form, v: string) => setForm((prev) => ({ ...prev, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = authLoginSchema.safeParse(form)
    if (!res.success) {
      setErrors(zodErrorMap(res.error))
      return
    }
    setErrors({})
    try {
      setSubmitting(true)
      await signInWithEmailAndPassword(auth, form.email, form.password)
      toast("¡Bienvenido!", "success")
      navigate("/dashboard")
    } catch {
      setErrors({ password: "Credenciales inválidas" })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-md mx-auto card">
      <h1 className="text-2xl font-semibold mb-4">Iniciar sesión</h1>
      <form onSubmit={submit} className="grid gap-3" noValidate>
        <div>
          <input
            placeholder="Email"
            type="email"
            autoComplete="email"
            required
            maxLength={120}
            value={form.email}
            onChange={(e) => onChange("email", e.target.value)}
            onBlur={() => validateField("email")}
          />
          {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
        </div>
        <div>
          <input
            placeholder="Contraseña"
            type="password"
            autoComplete="current-password"
            required
            maxLength={72}
            value={form.password}
            onChange={(e) => onChange("password", e.target.value)}
            onBlur={() => validateField("password")}
          />
          {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
        </div>
        <button className="btn" disabled={submitting}>
          {submitting ? "Entrando..." : "Entrar"}
        </button>
      </form>
      <div className="flex justify-between mt-3 text-sm text-gray-400">
        <Link to="/register" className="underline hover:text-white">Crear cuenta</Link>
        <Link to="/reset-password" className="underline hover:text-white">¿Olvidaste tu contraseña?</Link>
      </div>
    </div>
  )
}
