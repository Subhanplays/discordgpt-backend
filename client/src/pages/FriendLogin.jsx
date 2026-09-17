import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'

const API_BASE = 'https://b.discordgpt.bond'

export default function FriendLogin() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (token) {
      handleLogin()
    }
  }, [token])

  const handleLogin = async () => {
    if (!token) {
      setError('Invalid link — no token found')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch(`${API_BASE}/api/auth/friend-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Login failed')
        setLoading(false)
        return
      }

      localStorage.setItem('dgpt_token', data.token)
      localStorage.setItem('dgpt_user', JSON.stringify(data.user))

      setSuccess(`Welcome, ${data.user.username}! Redirecting...`)
      setTimeout(() => navigate('/chat'), 1500)
    } catch (err) {
      setError('Network error — please try again')
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#09090b',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif',
      color: '#fafafa',
    }}>
      <div style={{
        width: 380,
        padding: 40,
        background: '#111113',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 16,
        textAlign: 'center',
      }}>
        <img src="/logo.svg" alt="" style={{ width: 48, height: 48, borderRadius: 12, marginBottom: 20 }} />
        <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Friend Access</h1>
        <p style={{ fontSize: 14, color: '#71717a', marginBottom: 24 }}>
          {loading ? 'Logging you in...' : error ? 'Something went wrong' : success || 'Preparing your account...'}
        </p>

        {loading && (
          <div style={{
            width: 24, height: 24, border: '3px solid rgba(59,130,246,0.2)',
            borderTopColor: '#3b82f6', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px',
          }} />
        )}

        {error && (
          <div style={{
            padding: '12px 16px', background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.15)', borderRadius: 10,
            fontSize: 13, color: '#ef4444', marginBottom: 16,
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            padding: '12px 16px', background: 'rgba(34,197,94,0.08)',
            border: '1px solid rgba(34,197,94,0.15)', borderRadius: 10,
            fontSize: 13, color: '#22c55e', marginBottom: 16,
          }}>
            {success}
          </div>
        )}

        {error && (
          <button
            onClick={handleLogin}
            style={{
              padding: '10px 24px', background: '#3b82f6', color: '#fff',
              border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Try Again
          </button>
        )}

        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    </div>
  )
}
