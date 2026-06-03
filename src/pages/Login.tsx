import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "../firebase"
import { authLoginSchema } from "../validation/schemas"
import { useAuth } from "../hooks/useAuth"
import { useToast } from "../context/ToastContext"

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (!loading && user) navigate("/dashboard")
  }, [user, loading, navigate])

  const validate = () => {
    const res = authLoginSchema.safeParse(form)
    if (!res.success) {
      const map: Record<string, string> = {}
      res.error.errors.forEach((e) => { if (e.path[0]) map[String(e.path[0])] = e.message })
      setErrors(map)
      return false
    }
    setErrors({})
    return true
  }

  const onChange = (k: string, v: string) => setForm((prev) => ({ ...prev, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
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
            onBlur={validate}
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
            onBlur={validate}
          />
          {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
        </div>
        <button className="btn" disabled={submitting || Object.keys(errors).length > 0}>
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
