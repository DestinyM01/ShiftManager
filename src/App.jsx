import { Routes, Route, Link, useNavigate } from "react-router-dom"
import Login from "./pages/Login.jsx"
import Register from "./pages/Register.jsx"
import ResetPassword from "./pages/ResetPassword.jsx"
import Dashboard from "./pages/Dashboard.jsx"
import { useAuth } from "./hooks/useAuth.js"
import { signOut } from "firebase/auth"
import { auth } from "./firebase"

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
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </div>
  )
}
