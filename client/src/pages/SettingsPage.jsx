import React, { useState } from 'react'
import { Monitor, Bot, User, LogOut, Shield, Palette, Globe, Copy, Check, Loader2, QrCode, KeyRound, X } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import { useChat } from '../contexts/ChatContext'

function DiscordFlags({ flags }) {
  const flagNames = {
    1: 'Staff', 2: 'Partner', 4: 'Hypesquad', 8: 'BugHunter1',
    16: 'BugHunter2', 32: 'HypesquadBravery', 64: 'HypesquadBrilliance',
    128: 'HypesquadBalance', 256: 'EarlySupporter', 512: 'TeamUser',
    1024: 'System', 4096: 'BugHunterGold', 8192: 'VerifiedBot',
    16384: 'VerifiedDeveloper', 32768: 'CertifiedModerator', 65536: 'BotHTTPInteractions'
  }
  if (!flags) return null
  const badges = []
  for (const [bit, name] of Object.entries(flagNames)) {
    if (flags & parseInt(bit)) badges.push(name)
  }
  if (badges.length === 0) return null
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
      {badges.map(b => (
        <span key={b} className="badge badge-default" style={{ fontSize: 11 }}>{b}</span>
      ))}
    </div>
  )
}

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme()
  const { user, token, logout } = useAuth()
  const { botConnected, botInfo, servers } = useChat()
  const [twoFAState, setTwoFAState] = useState(null)
  const [twoFACode, setTwoFACode] = useState('')
  const [twoFALoading, setTwoFALoading] = useState(false)
  const [twoFAError, setTwoFAError] = useState('')
  const [twoFASuccess, setTwoFASuccess] = useState('')
  const [copiedSecret, setCopiedSecret] = useState(false)

  const handleSetup2FA = async () => {
    setTwoFALoading(true)
    setTwoFAError('')
    try {
      const res = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (res.ok) {
        setTwoFAState({ step: 'verify', secret: data.secret, qrCode: data.qrCode })
      } else {
        setTwoFAError(data.error || 'Setup failed')
      }
    } catch {
      setTwoFAError('Network error')
    } finally {
      setTwoFALoading(false)
    }
  }

  const handleEnable2FA = async () => {
    if (!twoFACode || twoFACode.length !== 6) return
    setTwoFALoading(true)
    setTwoFAError('')
    try {
      const res = await fetch('/api/auth/2fa/enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code: twoFACode })
      })
      const data = await res.json()
      if (res.ok) {
        setTwoFASuccess('2FA enabled successfully!')
        setTwoFAState(null)
        setTwoFACode('')
        setTimeout(() => setTwoFASuccess(''), 3000)
      } else {
        setTwoFAError(data.error || 'Failed to enable')
      }
    } catch {
      setTwoFAError('Network error')
    } finally {
      setTwoFALoading(false)
    }
  }

  const handleDisable2FA = async () => {
    if (!twoFACode || twoFACode.length !== 6) return
    setTwoFALoading(true)
    setTwoFAError('')
    try {
      const res = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code: twoFACode })
      })
      const data = await res.json()
      if (res.ok) {
        setTwoFASuccess('2FA disabled successfully!')
        setTwoFAState(null)
        setTwoFACode('')
        setTimeout(() => setTwoFASuccess(''), 3000)
      } else {
        setTwoFAError(data.error || 'Failed to disable')
      }
    } catch {
      setTwoFAError('Network error')
    } finally {
      setTwoFALoading(false)
    }
  }

  const handleCopySecret = () => {
    if (twoFAState?.secret) {
      navigator.clipboard.writeText(twoFAState.secret)
      setCopiedSecret(true)
      setTimeout(() => setCopiedSecret(false), 2000)
    }
  }

  const discordBannerStyle = user?.discord_banner
    ? { background: `url(https://cdn.discordapp.com/banners/${user.discord_id}/${user.discord_banner}.${user.discord_banner.startsWith('a_') ? 'gif' : 'png'}?size=600) center/cover`, height: 100 }
    : user?.discord_accent_color
      ? { background: `#${user.discord_accent_color.toString(16).padStart(6, '0')}`, height: 80 }
      : { background: 'var(--text-primary)', height: 50 }

  return (
    <div className="settings-page">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <img src="/logo.svg" alt="" className="page-header-logo" />
        <h1 style={{ margin: 0 }}>Settings</h1>
      </div>

      <div className="settings-section">
        <div className="settings-section-title"><User size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Discord Profile</div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
          <div style={discordBannerStyle} />
          <div style={{ padding: '16px 20px', display: 'flex', gap: 14, alignItems: 'flex-start', marginTop: -30 }}>
            <div style={{ width: 60, height: 60, borderRadius: 'var(--r-lg)', border: '3px solid var(--bg-card)', overflow: 'hidden', flexShrink: 0, background: 'var(--text-primary)' }}>
              {user?.discord_avatar ? (
                <img src={user.discord_avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bg-primary)', fontWeight: 700, fontSize: 22 }}>
                  {user?.username?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
            </div>
            <div style={{ flex: 1, paddingTop: 28 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                {user?.username || 'User'}
                {user?.discord_discriminator && user.discord_discriminator !== '0' && (
                  <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-muted)', marginLeft: 4 }}>#{user.discord_discriminator}</span>
                )}
              </div>
              {user?.discord_id && (
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                  ID: {user.discord_id}
                </div>
              )}
              <DiscordFlags flags={user?.discord_public_flags} />
            </div>
          </div>
          <div style={{ padding: '0 24px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
            {user?.discord_locale && (
              <div style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Locale</div>
                <div style={{ fontSize: 13, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}><Globe size={14} /> {user.discord_locale}</div>
              </div>
            )}
            {user?.created_at && (
              <div style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Joined</div>
                <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{new Date(user.created_at).toLocaleDateString()}</div>
              </div>
            )}
            <div style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Discord 2FA</div>
              <div style={{ fontSize: 13, color: user?.discord_mfa_enabled ? 'var(--success)' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                {user?.discord_mfa_enabled ? '🔒 Enabled' : '🔓 Disabled'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-section-title"><Shield size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />Panel Security (2FA)</div>
        {twoFASuccess && (
          <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--success-subtle)', color: 'var(--success)', fontSize: 13, marginBottom: 14, border: '1px solid rgba(52,211,153,0.2)' }}>
            {twoFASuccess}
          </div>
        )}
        <div style={{ background: 'var(--bg-glass)', backdropFilter: 'blur(20px)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-xl)', padding: 24, boxShadow: 'var(--shadow-glass)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Two-Factor Authentication</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                {user?.two_fa_enabled ? 'Your account is protected with TOTP 2FA' : 'Add an extra layer of security to your account'}
              </div>
            </div>
            {user?.two_fa_enabled ? (
              <span className="badge badge-success"><Shield size={12} style={{ marginRight: 4 }} /> Enabled</span>
            ) : (
              <span className="badge badge-default">Disabled</span>
            )}
          </div>

          {!user?.two_fa_enabled && !twoFAState && (
            <button className="btn btn-primary btn-sm" onClick={handleSetup2FA} disabled={twoFALoading}>
              {twoFALoading ? <><Loader2 size={14} className="spinner" /> Setting up...</> : <><KeyRound size={14} /> Enable 2FA</>}
            </button>
          )}

          {user?.two_fa_enabled && !twoFAState && (
            <button className="btn btn-danger btn-sm" onClick={() => setTwoFAState({ step: 'disable' })}>
              Disable 2FA
            </button>
          )}

          {twoFAState?.step === 'verify' && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
                Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
              </div>
              {twoFAState.qrCode && (
                <div style={{ marginBottom: 14, textAlign: 'center' }}>
                  <img src={twoFAState.qrCode} alt="2FA QR Code" style={{ width: 200, height: 200, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }} />
                </div>
              )}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Or enter this secret manually:</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-primary)', letterSpacing: 1 }}>
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{twoFAState.secret}</span>
                  <button onClick={handleCopySecret} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, display: 'flex', flexShrink: 0 }}>
                    {copiedSecret ? <Check size={14} style={{ color: 'var(--success)' }} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>Enter the 6-digit code from your app:</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  className="input-field"
                  placeholder="000000"
                  value={twoFACode}
                  onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: 18, letterSpacing: 4, textAlign: 'center', flex: 1 }}
                  autoFocus
                />
                <button className="btn btn-primary btn-sm" onClick={handleEnable2FA} disabled={twoFACode.length !== 6 || twoFALoading}>
                  {twoFALoading ? <Loader2 size={14} className="spinner" /> : 'Verify & Enable'}
                </button>
              </div>
              {twoFAError && <div style={{ color: 'var(--error)', fontSize: 12, marginTop: 8 }}>{twoFAError}</div>}
              <button className="btn btn-ghost btn-sm" onClick={() => { setTwoFAState(null); setTwoFACode(''); setTwoFAError('') }} style={{ marginTop: 8 }}>
                <X size={14} /> Cancel
              </button>
            </div>
          )}

          {twoFAState?.step === 'disable' && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
                Enter your 2FA code to disable:
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  className="input-field"
                  placeholder="000000"
                  value={twoFACode}
                  onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: 18, letterSpacing: 4, textAlign: 'center', flex: 1 }}
                  autoFocus
                />
                <button className="btn btn-danger btn-sm" onClick={handleDisable2FA} disabled={twoFACode.length !== 6 || twoFALoading}>
                  {twoFALoading ? <Loader2 size={14} className="spinner" /> : 'Disable'}
                </button>
              </div>
              {twoFAError && <div style={{ color: 'var(--error)', fontSize: 12, marginTop: 8 }}>{twoFAError}</div>}
              <button className="btn btn-ghost btn-sm" onClick={() => { setTwoFAState(null); setTwoFACode(''); setTwoFAError('') }} style={{ marginTop: 8 }}>
                <X size={14} /> Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-section-title"><Palette size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />Appearance</div>
        <div className="settings-row">
          <div>
            <div className="settings-row-label">Dark Mode</div>
            <div className="settings-row-desc">Currently using {theme} theme</div>
          </div>
          <div className={`toggle-switch ${theme === 'light' ? 'active' : ''}`} onClick={toggleTheme} />
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-section-title"><Bot size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />Discord Bot</div>
        {botConnected && botInfo ? (
          <>
            <div className="settings-row">
              <div>
                <div className="settings-row-label">DiscordGPT Bot</div>
                <div className="settings-row-desc">{botInfo.username} (ID: {botInfo.id})</div>
              </div>
              <span className="badge badge-success">Connected</span>
            </div>
            <div className="settings-row">
              <div>
                <div className="settings-row-label">Servers Available</div>
                <div className="settings-row-desc">{servers.length} server(s) found</div>
              </div>
            </div>
          </>
        ) : (
          <div className="settings-row">
            <div>
              <div className="settings-row-label">DiscordGPT Bot</div>
              <div className="settings-row-desc">Bot is connecting...</div>
            </div>
            <span className="badge badge-default">Connecting</span>
          </div>
        )}
      </div>

      <div className="settings-section">
        <div className="settings-section-title"><User size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />Account</div>
        <div className="settings-row">
          <div>
            <div className="settings-row-label">{user?.username || 'User'}</div>
            <div className="settings-row-desc">{user?.email || ''}</div>
          </div>
        </div>
        <div className="settings-row">
          <button className="btn btn-danger btn-sm" onClick={logout}>
            <LogOut size={14} /> Log Out
          </button>
        </div>
      </div>
    </div>
  )
}
