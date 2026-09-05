import { Navigate, Outlet } from 'react-router-dom'

// TEMP: reads the token directly from localStorage until auth.context.js
// lands in Phase 2 — swap this check for the auth context there.
function PrivateRoute() {
  const isAuthenticated = Boolean(localStorage.getItem('token'))

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

export default PrivateRoute
