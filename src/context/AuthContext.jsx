import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getMe, login as loginApi } from '../api/auth'
import { post } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (credentials) => {
    const { user } = await loginApi(credentials)
    setUser(user)
    return user
  }, [])

  const logout = useCallback(async () => {
    try { await post('/auth/logout') } catch {}
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
