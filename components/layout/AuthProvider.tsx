"use client"
import { createContext, useContext, useEffect, useState, ReactNode } from "react"

interface AdminUser {
  id: string
  email: string
  name: string
}

interface AuthContextType {
  isAdmin: boolean
  admin: AdminUser | null
  loading: boolean
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  isAdmin: false, admin: null, loading: true, refresh: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    try {
      const res = await fetch("/api/auth/me")
      const data = await res.json()
      if (data.isLoggedIn && data.admin) setAdmin(data.admin)
      else setAdmin(null)
    } catch { setAdmin(null) }
    finally { setLoading(false) }
  }

  useEffect(() => { refresh() }, [])

  return (
    <AuthContext.Provider value={{ isAdmin: !!admin, admin, loading, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
