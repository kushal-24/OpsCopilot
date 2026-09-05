import { createContext, useContext } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import * as authApi from '../api/auth.api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const queryClient = useQueryClient()

  // TanStack Query: hydrates the current user on mount via GET /users/me.
  // Cookies are httpOnly, so this call is the only way to know a session
  // already exists; a 401 (no session) just leaves `user` undefined.
  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: authApi.getMe,
    retry: false,
    staleTime: Infinity,
  })
  // ['currentUser'] → { id: 123, name: "Kushal", ... }
  // Because useQuery() returns an object containing multiple things, and you're extracting the two you care about.

  const login = async (credentials) => {
    const { user: loggedInUser } = await authApi.login(credentials)
    queryClient.setQueryData(['currentUser'], loggedInUser)
    return loggedInUser
  }

  const logout = async () => {
    await authApi.logout()
    queryClient.setQueryData(['currentUser'], null)
  }

  return (
    <AuthContext.Provider
      value={{ user: user ?? null, isLoading, isAuthenticated: Boolean(user), login, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
