import { lazy, Suspense } from "react"
import { Routes, Route, Link, useNavigate } from "react-router-dom"
import { useAuth } from "./hooks/useAuth"
import { signOut } from "firebase/auth"
import { auth } from "./firebase"
import ErrorBoundary from "./components/ErrorBoundary"
import { ToastProvider } from "./context/ToastContext"

const Login = lazy(() => import("./pages/Login"))
const Register = lazy(() => import("./pages/Register"))
const ResetPassword = lazy(() => import("./pages/ResetPassword"))
const Dashboard = lazy(() => import("./pages/Dashboard"))
const NotFound = lazy(() => import("./pages/NotFound"))

export default function App() {
  const { user, role } = useAuth()
  const navigate = useNavigate()

  const logout = async () => {
    await signOut(auth)
    navigate("/")
  }

  return (
    <ToastProvider>
      <div>
        <nav className="bg-panel border-b border-gray-700">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link to="/" className="font-semibold text-xl text-white tracking-tight">
              Shift Scheduler
            </Link>
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <span className="text-sm text-gray-400 hidden sm:block">
                    {user.displayName || user.email}
                  </span>
                  <span className="text-xs font-medium px-2 py-1 rounded bg-gray-700 text-accent2 uppercase">
                    {role || "…"}
                  </span>
                  <button onClick={logout} className="btn-secondary text-sm">
                    Salir
                  </button>
                </>
              ) : (
                <>
                  <Link className="btn-secondary text-sm" to="/">Login</Link>
                  <Link className="btn text-sm" to="/register">Registro</Link>
                </>
              )}
            </div>
          </div>
        </nav>

        <div className="max-w-6xl mx-auto px-4 py-6">
          <ErrorBoundary>
            <Suspense fallback={<Spinner />}>
              <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>
    </ToastProvider>
  )
}

function Spinner() {
  return (
    <div className="flex justify-center py-16">
      <div className="w-8 h-8 border-2 border-accent2 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
