import { useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { AuthContext } from './authContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  // começa com o token salvo, assim o login sobrevive a um F5
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))

  const signIn = useCallback((novoToken: string) => {
    localStorage.setItem('token', novoToken)
    setToken(novoToken)
  }, [])

  const signOut = useCallback(() => {
    localStorage.removeItem('token')
    setToken(null)
  }, [])

  const value = useMemo(
    () => ({ token, isAuthenticated: token !== null, signIn, signOut }),
    [token, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}