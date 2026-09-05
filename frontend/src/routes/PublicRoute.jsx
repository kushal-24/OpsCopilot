import { Navigate, Outlet } from 'react-router-dom'

// TEMP: reads the token directly from localStorage until auth.context.js
// lands in Phase 2 — swap this check for the auth context there.
function PublicRoute() {
  const isAuthenticated = Boolean(localStorage.getItem('token'))

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />
}

export default PublicRoute
