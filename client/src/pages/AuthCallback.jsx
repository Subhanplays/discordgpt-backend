import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Loader2, KeyRound } from 'lucide-react'

export default function AuthCallback() {
  const { restoreToken, isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()
  const [status, setStatus] = useState('loading')
  const [errorMsg, setErrorMsg] = useState('')
  const [pending2FA, setPending2FA] = useState(false)
  const [twoFACode, setTwoFACode] = useState('')
  const [twoFAUserId, setTwoFAUserId] = useState('')
  const [twoFALoading, setTwoFALoading] = useState(false)
  const [twoFAError, setTwoFAError] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const urlToken = params.get('token')
    const urlError = params.get('error')
    const pending2fa = params.get('pending_2fa')
    const tempToken = params.get('temp')
    const userId = params.get('user_id')

    if (urlError) {
      setStatus('error')
      setErrorMsg(urlError)
      return
    }

    if (pending2fa === 'true' && userId) {
      setPending2FA(true)
      setTwoFAUserId(userId)
      setStatus('2fa')
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

  const handleVerify2FA = async () => {
    if (!twoFACode || twoFACode.length !== 6) return
    setTwoFALoading(true)
    setTwoFAError('')
    try {
      const res = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: twoFAUserId, code: twoFACode })
      })
      const data = await res.json()
      if (res.ok) {
        restoreToken(data.token).then(() => {
          setStatus('done')
        }).catch(() => {
          setStatus('error')
          setErrorMsg('Session restore failed')
        })
      } else {
        setTwoFAError(data.error || 'Invalid code')
        setTwoFALoading(false)
      }
    } catch {
      setTwoFAError('Network error')
      setTwoFALoading(false)
    }
  }

  if (status === 'error') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>Login failed</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>Error: {errorMsg}</div>
        <button onClick={() => window.location.href = '/auth'} style={{ padding: '10px 20px', background: '#000', color: 'white', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontFamily: 'var(--font-family)', fontWeight: 600 }}>Back to Login</button>
      </div>
    )
  }

  if (pending2FA) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <div style={{ width: 72, height: 72, borderRadius: 'var(--radius-xl)', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, boxShadow: 'var(--shadow-glow-lg)' }}>
          <KeyRound size={32} style={{ color: '#000' }} />
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 6, letterSpacing: '-0.02em' }}>Two-Factor Authentication</div>
        <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 28 }}>Enter the 6-digit code from your authenticator app</div>
        <div style={{ width: '100%', maxWidth: 320 }}>
          <input
            type="text"
            className="input-field"
            placeholder="000000"
            value={twoFACode}
            onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            onKeyDown={(e) => e.key === 'Enter' && handleVerify2FA()}
            maxLength={6}
            style={{ fontFamily: 'var(--font-mono)', fontSize: 24, letterSpacing: 6, textAlign: 'center', padding: '16px 20px' }}
            autoFocus
          />
          {twoFAError && <div style={{ color: 'var(--error)', fontSize: 13, marginTop: 10, textAlign: 'center' }}>{twoFAError}</div>}
          <button
            className="btn btn-primary"
            onClick={handleVerify2FA}
            disabled={twoFACode.length !== 6 || twoFALoading}
            style={{ width: '100%', marginTop: 16, padding: '14px 24px' }}
          >
            {twoFALoading ? <><Loader2 size={18} className="spinner" /> Verifying...</> : 'Verify'}
          </button>
          <button
            onClick={() => window.location.href = '/auth'}
            style={{ width: '100%', marginTop: 10, padding: '10px', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-family)' }}
          >
            Back to login
          </button>
        </div>
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
