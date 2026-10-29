import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export function ProtectedRoute({ children }) {
  const { user, token } = useAuthStore()
  const location = useLocation()

  if (!user || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  return children
}

export function AdminRoute({ children }) {
  const { user, token } = useAuthStore()
  const location = useLocation()

  if (!user || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  if (user.role !== 'admin') {
    return <Navigate to="/" replace />
  }
  return children
}

export function GuestRoute({ children }) {
  const { user, token } = useAuthStore()

  if (user && token) {
    return <Navigate to="/" replace />
  }
  return children
}
