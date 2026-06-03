import { lazy, Suspense } from "react"
import { Routes, Route, Link, useNavigate } from "react-router-dom"
import { useAuth } from "./hooks/useAuth.js"
import { signOut } from "firebase/auth"
import { auth } from "./firebase"
import ErrorBoundary from "./components/ErrorBoundary.jsx"

const Login = lazy(() => import("./pages/Login.jsx"))
const Register = lazy(() => import("./pages/Register.jsx"))
const ResetPassword = lazy(() => import("./pages/ResetPassword.jsx"))
const Dashboard = lazy(() => import("./pages/Dashboard.jsx"))

export default function App() {
  const { user, role } = useAuth()
  const navigate = useNavigate()

  const logout = async () => {
    await signOut(auth)
    navigate("/")
  }

  return (
    <div>
      <nav className="bg-panel border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="font-semibold text-xl text-white">Shift Scheduler</Link>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm text-gray-300">{user.displayName || user.email} ({role || "..."})</span>
                <button onClick={logout} className="btn-secondary">Salir</button>
              </>
            ) : (
              <>
                <Link className="btn-secondary" to="/">Login</Link>
                <Link className="btn" to="/register">Registro</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <ErrorBoundary>
          <Suspense fallback={<p className="text-center py-10">Cargando…</p>}>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  )
}
