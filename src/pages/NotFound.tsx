import { Link } from "react-router-dom"

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto card text-center mt-16">
      <p className="text-6xl font-bold text-accent2 mb-3">404</p>
      <p className="text-gray-400 mb-6">Página no encontrada.</p>
      <Link to="/" className="btn">Ir al inicio</Link>
    </div>
  )
}
