import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'

function ProtectedRoute({ children, allowedRole }) {
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRole && user?.role !== allowedRole) {
    console.warn(`[ProtectedRoute] user role "${user?.role}" tried to access a "${allowedRole}"-only route`)
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute
