import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { authRegisterSchema } from "../validation/schemas";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const validate = (partial = false) => {
    const res = authRegisterSchema.safeParse(form);
    if (!res.success) {
      const map = {};
      res.error.errors.forEach(e => map[e.path[0]] = e.message);
      setErrors(map);
      return false;
    }
    setErrors({});
    return true;
  };

  const onChange = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setSubmitting(true);
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await updateProfile(cred.user, { displayName: form.name });
      // Crea el perfil en employees/{uid} con rol employee (reglas lo exigen)
      await setDoc(doc(db, "employees", cred.user.uid), {
        name: form.name,
        email: form.email,
        role: "employee",
      });
      navigate("/dashboard");
    } catch (err) {
      // Mapea algunos códigos comunes
      let msg = "No se pudo crear la cuenta";
      if (err?.code === "auth/email-already-in-use") msg = "Ese email ya está registrado";
      if (err?.code === "permission-denied") msg = "Reglas de Firestore bloquean la creación del perfil";
      setErrors({ submit: msg });
    } finally {
      setSubmitting(false);
    }
  };

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
            onChange={(e)=>onChange("name", e.target.value)}
            onBlur={()=>validate(true)}
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
            onChange={(e)=>onChange("email", e.target.value)}
            onBlur={()=>validate(true)}
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
            onChange={(e)=>onChange("password", e.target.value)}
            onBlur={()=>validate(true)}
          />
          {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
          <p className="text-xs text-gray-400 mt-1">
            Requisitos: mínimo 8 caracteres, 1 mayúscula, 1 minúscula y 1 número.
          </p>
        </div>
        <div>
          <input
            placeholder="Confirmar contraseña"
            type="password"
            autoComplete="new-password"
            required
            maxLength={72}
            value={form.confirm}
            onChange={(e)=>onChange("confirm", e.target.value)}
            onBlur={()=>validate(true)}
          />
          {errors.confirm && <p className="text-red-400 text-sm mt-1">{errors.confirm}</p>}
        </div>

        {errors.submit && <p className="text-red-400">{errors.submit}</p>}
        <button className="btn" disabled={submitting || Object.keys(errors).length>0}>
          {submitting ? "Creando..." : "Registrarme"}
        </button>
      </form>

      <div className="mt-3 text-sm">
        <Link to="/" className="underline">Volver a login</Link>
      </div>
    </div>
  );
}
