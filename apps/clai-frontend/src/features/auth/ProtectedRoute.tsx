import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth'

export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    // guarda de onde veio, para voltar depois do login
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}