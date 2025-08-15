import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { authLoginSchema } from "../validation/schemas";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const validate = (partial = false) => {
    const data = partial ? { ...form } : form;
    const res = authLoginSchema.safeParse(data);
    if (!res.success) {
      const map = {};
      res.error.errors.forEach(e => map[e.path[0]] = e.message);
      setErrors(map);
      return false;
    }
    setErrors({});
    return true;
  };

  const onChange = (k, v) => {
    setForm(prev => ({ ...prev, [k]: v }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setSubmitting(true);
      await signInWithEmailAndPassword(auth, form.email, form.password);
      navigate("/dashboard");
    } catch {
      setErrors({ password: "Credenciales inválidas" });
    } finally {
      setSubmitting(false);
    }
  };

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
            onChange={(e)=>onChange("email", e.target.value)}
            onBlur={()=>validate(true)}
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
            onChange={(e)=>onChange("password", e.target.value)}
            onBlur={()=>validate(true)}
          />
          {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
        </div>

        <button className="btn" disabled={submitting || Object.keys(errors).length>0}>
          {submitting ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <div className="flex justify-between mt-3 text-sm text-gray-300">
        <Link to="/register" className="underline">Crear cuenta</Link>
        <Link to="/reset-password" className="underline">¿Olvidaste tu contraseña?</Link>
      </div>
    </div>
  );
}
