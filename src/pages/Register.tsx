import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { setDoc, doc } from "firebase/firestore"
import { auth, db } from "../firebase"
import { authRegisterSchema, zodErrorMap } from "../validation/schemas"
import { useToast } from "../context/ToastContext"

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()

  const validateField = (field: keyof typeof form) => {
    const res = authRegisterSchema.safeParse(form)
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
    const res = authRegisterSchema.safeParse(form)
    if (!res.success) {
      setErrors(zodErrorMap(res.error))
      return
    }
    setErrors({})
    try {
      setSubmitting(true)
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password)
      await updateProfile(cred.user, { displayName: form.name })
      await setDoc(doc(db, "employees", cred.user.uid), {
        name: form.name,
        email: form.email,
        role: "employee",
      })
      toast("¡Cuenta creada con éxito!", "success")
      navigate("/dashboard")
    } catch (err) {
      const error = err as { code?: string }
      let msg = "No se pudo crear la cuenta"
      if (error?.code === "auth/email-already-in-use") msg = "Ese email ya está registrado"
      if (error?.code === "permission-denied") msg = "Reglas de Firestore bloquean la creación del perfil"
      setErrors({ submit: msg })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-md mx-auto card">
      <h1 className="text-2xl font-semibold mb-4">Registro</h1>
      <form onSubmit={submit} className="grid gap-3" noValidate>
        <div>
          <input
            placeholder="Nombre"
            autoComplete="name"
            required
            maxLength={80}
            value={form.name}
            onChange={(e) => onChange("name", e.target.value)}
            onBlur={() => validateField("name")}
          />
          {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
        </div>
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
            autoComplete="new-password"
            required
            maxLength={72}
            value={form.password}
            onChange={(e) => onChange("password", e.target.value)}
            onBlur={() => validateField("password")}
          />
          {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
          <p className="text-xs text-gray-500 mt-1">Mínimo 8 caracteres, 1 mayúscula, 1 minúscula y 1 número.</p>
        </div>
        <div>
          <input
            placeholder="Confirmar contraseña"
            type="password"
            autoComplete="new-password"
            required
            maxLength={72}
            value={form.confirm}
            onChange={(e) => onChange("confirm", e.target.value)}
            onBlur={() => validateField("confirm")}
          />
          {errors.confirm && <p className="text-red-400 text-sm mt-1">{errors.confirm}</p>}
        </div>
        {errors.submit && <p className="text-red-400">{errors.submit}</p>}
        <button className="btn" disabled={submitting}>
          {submitting ? "Creando..." : "Registrarme"}
        </button>
      </form>
      <div className="mt-3 text-sm">
        <Link to="/" className="underline text-gray-400 hover:text-white">Volver a login</Link>
      </div>
    </div>
  )
}
