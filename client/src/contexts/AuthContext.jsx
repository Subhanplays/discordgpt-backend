import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AuthContext = createContext(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => {
    try { return localStorage.getItem('dgpt_token') || sessionStorage.getItem('dgpt_token') } catch { return null }
  })
  const [loading, setLoading] = useState(true)

  const saveToken = (t) => {
    setToken(t)
    try {
      if (t) localStorage.setItem('dgpt_token', t)
      else localStorage.removeItem('dgpt_token')
    } catch {}
  }

  const checkSession = useCallback(async () => {
    if (!token) { setLoading(false); return }
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setUser(data)
      } else {
        saveToken(null)
        setUser(null)
      }
    } catch {
      saveToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    checkSession()
  }, [])

  const login = async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || err.message || 'Login failed')
    }
    const data = await res.json()
    setUser(data.user)
    saveToken(data.token)
    return data
  }

  const register = async (username, email, password) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || err.message || 'Registration failed')
    }
    const data = await res.json()
    setUser(data.user)
    saveToken(data.token)
    return data
  }

  const logout = async () => {
    try {
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        })
      }
    } catch {}
    setUser(null)
    saveToken(null)
  }

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
