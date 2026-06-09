import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Spinner from "./Spinner"
import type { ReactNode } from "react"

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />
  if (!user) return <Navigate to="/" replace />
  return <>{children}</>
}

export function PublicRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />
  if (user) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}
