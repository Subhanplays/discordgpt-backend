import React, { useEffect } from 'react'
import { Loader2 } from 'lucide-react'

export default function AuthCallback() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    if (token) {
      localStorage.setItem('dgpt_token', token)
      window.location.href = '/'
    } else {
      window.location.href = '/auth'
    }
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <Loader2 size={32} className="spinner" style={{ marginBottom: 16 }} />
      <div style={{ fontSize: 16, fontWeight: 500 }}>Connecting your Discord account...</div>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>You'll be redirected in a moment</div>
    </div>
  )
}
