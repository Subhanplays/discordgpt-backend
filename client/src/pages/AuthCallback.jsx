import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Loader2 } from 'lucide-react'

export default function AuthCallback() {
  const { restoreToken, isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()
  const [status, setStatus] = useState('loading')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const urlToken = params.get('token')
    const urlError = params.get('error')

    if (urlError) {
      setStatus('error')
      setErrorMsg(urlError)
      return
    }

    if (urlToken) {
      setStatus('connecting')
      restoreToken(urlToken).then(() => {
        setStatus('done')
      }).catch(() => {
        setStatus('error')
        setErrorMsg('Session restore failed')
      })
    } else {
      setStatus('error')
      setErrorMsg('No token received')
    }
  }, [])

  useEffect(() => {
    if (status === 'done' && isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [status, isAuthenticated])

  if (status === 'error') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>Login failed</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>Error: {errorMsg}</div>
        <button onClick={() => window.location.href = '/auth'} style={{ padding: '10px 20px', background: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>Back to Login</button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <Loader2 size={32} className="spinner" style={{ marginBottom: 16 }} />
      <div style={{ fontSize: 16, fontWeight: 500 }}>Connecting your Discord account...</div>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>You'll be redirected in a moment</div>
    </div>
  )
}
