import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  LayoutDashboard, Users, Bot, FileText, Settings, Activity,
  AlertCircle, ArrowLeft, BarChart3, Sparkles, Plus, Trash2,
  Edit3, Power, PowerOff, Save, X, Loader2, Server, Copy,
  Ban, Shield, ShieldOff, Globe, RotateCcw, UserX, UserCheck, Key
} from 'lucide-react'

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'bots', label: 'Bots', icon: Bot },
  { id: 'ai', label: 'AI Providers', icon: Sparkles },
  { id: 'templates', label: 'Templates', icon: FileText },
  { id: 'logs', label: 'Logs', icon: Activity },
  { id: 'usage', label: 'Usage Limits', icon: BarChart3 },
  { id: 'ipbans', label: 'IP Bans', icon: Globe },
  { id: 'settings', label: 'Settings', icon: Settings }
]

const PROVIDER_TYPES = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic' },
  { value: 'google', label: 'Google AI' },
  { value: 'mistral', label: 'Mistral' },
  { value: 'groq', label: 'Groq' },
  { value: 'openrouter', label: 'OpenRouter' },
  { value: 'custom', label: 'Custom API' }
]

const DEFAULT_MODELS = {
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
  anthropic: ['claude-3.5-sonnet', 'claude-3-haiku', 'claude-3-opus'],
  google: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro'],
  mistral: ['mistral-large', 'mistral-medium', 'mistral-small'],
  groq: ['llama-3.1-70b', 'llama-3.1-8b', 'mixtral-8x7b'],
  openrouter: ['auto'],
  custom: []
}

export default function AdminPanel() {
  const navigate = useNavigate()
  const { token, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [bots, setBots] = useState([])
  const [logs, setLogs] = useState([])
  const [aiProviders, setAiProviders] = useState([])
  const [templates, setTemplates] = useState([])
  const [usageLimits, setUsageLimits] = useState({ limit: 50, usage: [] })
  const [newLimit, setNewLimit] = useState(50)
  const [ipBans, setIpBans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }

  const showSuccess = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3000) }

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [statsRes, usersRes, botsRes, logsRes, aiRes, tplRes, usageRes, ipRes] = await Promise.all([
        fetch('/api/admin/stats', { headers }),
        fetch('/api/admin/users', { headers }),
        fetch('/api/admin/bots', { headers }),
        fetch('/api/admin/logs?limit=50', { headers }),
        fetch('/api/admin/ai-providers', { headers }),
        fetch('/api/admin/templates', { headers }),
        fetch('/api/admin/usage-limits', { headers }),
        fetch('/api/admin/ip-bans', { headers })
      ])

      if (statsRes.ok) setStats(await statsRes.json())
      if (usersRes.ok) setUsers(await usersRes.json())
      if (botsRes.ok) setBots(await botsRes.json())
      if (logsRes.ok) setLogs(await logsRes.json())
      if (aiRes.ok) setAiProviders(await aiRes.json())
      if (tplRes.ok) setTemplates(await tplRes.json())
      if (usageRes.ok) {
        const usageData = await usageRes.json()
        setUsageLimits(usageData)
        setNewLimit(usageData.limit)
      }
      if (ipRes.ok) setIpBans(await ipRes.json())
    } catch (e) {
      setError('Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { fetchData() }, [fetchData])

  const handleBanUser = async (userId, reason) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/ban`, {
        method: 'POST', headers, body: JSON.stringify({ reason: reason || 'Banned by admin' })
      })
      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, is_banned: true, ban_reason: reason || 'Banned by admin' } : u))
        showSuccess('User banned and sessions revoked')
      }
    } catch (e) { setError('Failed to ban user') }
  }

  const handleUnbanUser = async (userId) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/unban`, { method: 'POST', headers })
      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, is_banned: false, ban_reason: null } : u))
        showSuccess('User unbanned')
      }
    } catch (e) { setError('Failed to unban user') }
  }

  const handleResetUserUsage = async (userId) => {
    try {
      await fetch(`/api/admin/users/${userId}/reset-usage`, { method: 'POST', headers })
      showSuccess('User usage reset')
    } catch (e) { setError('Failed to reset usage') }
  }

  const handleToggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin'
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'POST', headers, body: JSON.stringify({ role: newRole })
      })
      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
        showSuccess(`User role changed to ${newRole}`)
      }
    } catch (e) { setError('Failed to change role') }
  }

  const handleDeleteTemplate = async (id) => {
    if (!confirm('Delete this template?')) return
    try {
      await fetch(`/api/admin/templates/${id}`, { method: 'DELETE', headers })
      setTemplates(templates.filter(t => t.id !== id))
    } catch (e) { setError('Failed to delete template') }
  }

  const handleUpdateLimit = async () => {
    try {
      const res = await fetch('/api/admin/usage-limits', {
        method: 'PUT', headers, body: JSON.stringify({ limit: newLimit })
      })
      if (res.ok) {
        setUsageLimits(prev => ({ ...prev, limit: newLimit }))
        showSuccess('Usage limit updated')
      } else {
        const err = await res.json()
        setError(err.error || 'Failed to update limit')
      }
    } catch (e) { setError('Failed to update limit') }
  }

  const handleResetAllUsage = async () => {
    if (!confirm('Reset ALL users daily usage to 0?')) return
    try {
      await fetch('/api/admin/reset-usage', { method: 'POST', headers })
      showSuccess('All daily usage counts reset')
      fetchData()
    } catch (e) { setError('Failed to reset usage') }
  }

  const handleBanIp = async (ip, reason) => {
    try {
      const res = await fetch('/api/admin/ip-bans', {
        method: 'POST', headers, body: JSON.stringify({ ip, reason })
      })
      if (res.ok) {
        showSuccess(`IP ${ip} banned`)
        fetchData()
      }
    } catch (e) { setError('Failed to ban IP') }
  }

  const handleUnbanIp = async (ip) => {
    try {
      const res = await fetch(`/api/admin/ip-bans/${encodeURIComponent(ip)}`, { method: 'DELETE', headers })
      if (res.ok) {
        setIpBans(ipBans.filter(b => b.ip !== ip))
        showSuccess(`IP ${ip} unbanned`)
      }
    } catch (e) { setError('Failed to unban IP') }
  }

  const handleClearSessions = async () => {
    if (!confirm('Force ALL users to re-login?')) return
    try {
      await fetch('/api/admin/clear-sessions', { method: 'POST', headers })
      showSuccess('All sessions cleared')
    } catch (e) { setError('Failed to clear sessions') }
  }

  const handleDeleteAiProvider = async (id) => {
    if (!confirm('Delete this AI provider?')) return
    try {
      await fetch(`/api/admin/ai-providers/${id}`, { method: 'DELETE', headers })
      setAiProviders(aiProviders.filter(p => p.id !== id))
    } catch (e) { setError('Failed to delete provider') }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0a0a0a' }}>
      <aside style={{
        width: 260, background: '#111113', borderRight: '1px solid #1e1e22',
        display: 'flex', flexDirection: 'column', flexShrink: 0
      }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid #1e1e22', display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/logo.svg" alt="" style={{ width: 28, height: 28, borderRadius: 8, color: 'var(--text)' }} />
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#ffffff', margin: 0 }}>Admin Panel</h2>
        </div>
        <nav style={{ flex: 1, padding: '8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 12px', background: 'transparent', border: 'none', borderRadius: 8, cursor: 'pointer', color: '#a1a1aa', fontSize: 14, fontFamily: 'var(--font-family)', textAlign: 'left', transition: 'all 150ms ease' }}
            onMouseEnter={e => { e.target.style.background = '#1a1a1e'; e.target.style.color = '#ffffff' }}
            onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = '#a1a1aa' }}>
            <ArrowLeft size={18} /> Back to App
          </button>
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 12px',
              background: activeTab === tab.id ? 'rgba(59,130,246,0.1)' : 'transparent',
              border: activeTab === tab.id ? '1px solid rgba(59,130,246,0.2)' : '1px solid transparent',
              borderRadius: 8, cursor: 'pointer',
              color: activeTab === tab.id ? '#3b82f6' : '#a1a1aa',
              fontSize: 14, fontFamily: 'var(--font-family)', textAlign: 'left',
              fontWeight: activeTab === tab.id ? 500 : 400, transition: 'all 150ms ease'
            }}
              onMouseEnter={e => { if (activeTab !== tab.id) { e.currentTarget.style.background = '#1a1a1e'; e.currentTarget.style.color = '#ffffff' } }}
              onMouseLeave={e => { if (activeTab !== tab.id) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#a1a1aa' } }}>
              <tab.icon size={18} /> {tab.label}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <button onClick={() => { logout(); navigate('/') }} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 12px', background: 'transparent', border: '1px solid transparent', borderRadius: 8, cursor: 'pointer', color: '#a1a1aa', fontSize: 14, fontFamily: 'var(--font-family)', textAlign: 'left', transition: 'all 150ms ease' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#ef4444' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#a1a1aa' }}>
            <PowerOff size={18} /> Log Out
          </button>
        </nav>
      </aside>

      <main style={{ flex: 1, overflow: 'auto', padding: '24px 32px' }}>
        {error && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, marginBottom: 20, fontSize: 14, color: '#ef4444' }}>
            <span>{error}</span>
            <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 4 }}><X size={14} /></button>
          </div>
        )}
        {success && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 10, marginBottom: 20, fontSize: 14, color: '#22c55e' }}>
            <span>{success}</span>
            <button onClick={() => setSuccess('')} style={{ background: 'none', border: 'none', color: '#22c55e', cursor: 'pointer', padding: 4 }}><X size={14} /></button>
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', color: '#71717a', gap: 8 }}>
            <Loader2 size={20} className="spinner" /> Loading...
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && <DashboardTab stats={stats} />}
            {activeTab === 'users' && <UsersTab users={users} onBan={handleBanUser} onUnban={handleUnbanUser} onResetUsage={handleResetUserUsage} onToggleRole={handleToggleRole} currentUserId={null} />}
            {activeTab === 'bots' && <BotsTab bots={bots} />}
            {activeTab === 'ai' && <AiProvidersTab providers={aiProviders} setProviders={setAiProviders} token={token} headers={headers} onDelete={handleDeleteAiProvider} setError={setError} />}
            {activeTab === 'templates' && <TemplatesTab templates={templates} setTemplates={setTemplates} token={token} headers={headers} onDelete={handleDeleteTemplate} setError={setError} />}
            {activeTab === 'logs' && <LogsTab logs={logs} />}
            {activeTab === 'usage' && <UsageTab usageLimits={usageLimits} newLimit={newLimit} setNewLimit={setNewLimit} onUpdateLimit={handleUpdateLimit} onResetAll={handleResetAllUsage} />}
            {activeTab === 'ipbans' && <IpBansTab ipBans={ipBans} onBan={handleBanIp} onUnban={handleUnbanIp} />}
            {activeTab === 'settings' && <SettingsTab onClearSessions={handleClearSessions} />}
          </>
        )}
      </main>
    </div>
  )
}

function DashboardTab({ stats }) {
  return (
    <>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24, color: '#ffffff' }}>Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: '#3b82f6' },
          { label: 'Connected Bots', value: stats?.totalBots || 0, icon: Bot, color: '#22c55e' },
          { label: 'Servers Generated', value: stats?.totalServers || 0, icon: Server, color: '#f59e0b' },
          { label: 'Templates', value: stats?.totalTemplates || 0, icon: FileText, color: '#ec4899' },
          { label: 'AI Providers', value: stats?.totalAiProviders || 0, icon: Sparkles, color: '#06b6d4' },
          { label: 'AI Requests', value: stats?.totalAiRequests || 0, icon: Activity, color: '#ef4444' }
        ].map((stat, i) => (
          <div key={i} style={{ background: '#111113', border: '1px solid #1e1e22', borderRadius: 12, padding: 20, transition: 'border-color 150ms ease' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = stat.color}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#1e1e22'}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontSize: 13, color: '#a1a1aa', fontWeight: 500 }}>{stat.label}</div>
              <stat.icon size={18} style={{ color: stat.color }} />
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#ffffff' }}>{stat.value}</div>
          </div>
        ))}
      </div>
    </>
  )
}

function UsersTab({ users, onBan, onUnban, onResetUsage, onToggleRole }) {
  const [banModal, setBanModal] = useState(null)
  const [banReason, setBanReason] = useState('')

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: '#ffffff' }}>Users</h2>
        <span className="badge badge-default">{users.length} total</span>
      </div>
      <div style={{ background: '#111113', border: '1px solid #1e1e22', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1e1e22' }}>
              {['User', 'Discord ID', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} style={{ borderBottom: '1px solid #1e1e22', transition: 'background 150ms' }}
                onMouseEnter={e => e.currentTarget.style.background = '#1a1a1e'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '14px 16px', fontWeight: 500, color: '#ffffff', fontSize: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {u.discord_avatar && <img src={u.discord_avatar} alt="" style={{ width: 28, height: 28, borderRadius: '50%' }} />}
                    <div>
                      <div>{u.username}</div>
                      {u.email && <div style={{ fontSize: 12, color: '#71717a' }}>{u.email}</div>}
                    </div>
                  </div>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <code style={{ fontSize: 12, background: '#0a0a0a', padding: '3px 8px', borderRadius: 6, color: '#a1a1aa', border: '1px solid #1e1e22' }}>{u.discord_id || '-'}</code>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span className={`badge ${u.role === 'admin' ? 'badge-warning' : 'badge-default'}`}>{u.role}</span>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  {u.is_banned ? (
                    <span className="badge badge-error" title={u.ban_reason}>Banned</span>
                  ) : (
                    <span className="badge badge-success">Active</span>
                  )}
                </td>
                <td style={{ padding: '14px 16px', color: '#a1a1aa', fontSize: 14 }}>{u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}</td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {u.is_banned ? (
                      <button className="btn btn-ghost btn-sm" onClick={() => onUnban(u.id)} title="Unban" style={{ color: '#22c55e' }}>
                        <UserCheck size={14} />
                      </button>
                    ) : (
                      <button className="btn btn-ghost btn-sm" onClick={() => setBanModal(u)} title="Ban user" style={{ color: '#ef4444' }}>
                        <Ban size={14} />
                      </button>
                    )}
                    <button className="btn btn-ghost btn-sm" onClick={() => onResetUsage(u.id)} title="Reset usage">
                      <RotateCcw size={14} />
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => onToggleRole(u.id, u.role)} title={u.role === 'admin' ? 'Demote to user' : 'Promote to admin'}>
                      <Key size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {banModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}
          onClick={() => setBanModal(null)}>
          <div style={{ background: '#111113', border: '1px solid #1e1e22', borderRadius: 16, padding: 24, width: 420, maxWidth: '90vw' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: '#ef4444', marginBottom: 16 }}>Ban {banModal.username}</h3>
            <div className="input-group">
              <label className="input-label">Reason</label>
              <input className="input-field" placeholder="Reason for ban..." value={banReason} onChange={e => setBanReason(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { onBan(banModal.id, banReason); setBanModal(null); setBanReason('') } }} />
            </div>
            <p style={{ fontSize: 13, color: '#71717a', marginBottom: 16 }}>This will revoke all active sessions.</p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => { setBanModal(null); setBanReason('') }}>Cancel</button>
              <button className="btn btn-danger btn-sm" onClick={() => { onBan(banModal.id, banReason); setBanModal(null); setBanReason('') }}>Ban User</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function BotsTab({ bots }) {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: '#ffffff' }}>Bot Connections</h2>
        <span className="badge badge-default">{bots.length} connected</span>
      </div>
      <div style={{ background: '#111113', border: '1px solid #1e1e22', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1e1e22' }}>
              {['Bot', 'Bot ID', 'Owner', 'Status', 'Connected'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bots.map((b) => (
              <tr key={b.id} style={{ borderBottom: '1px solid #1e1e22', transition: 'background 150ms' }}
                onMouseEnter={e => e.currentTarget.style.background = '#1a1a1e'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '14px 16px', fontWeight: 500, color: '#ffffff', fontSize: 14 }}>{b.bot_username || 'Unknown'}</td>
                <td style={{ padding: '14px 16px' }}><code style={{ fontSize: 12, background: '#0a0a0a', padding: '3px 8px', borderRadius: 6, color: '#a1a1aa', border: '1px solid #1e1e22' }}>{b.bot_id || '-'}</code></td>
                <td style={{ padding: '14px 16px', color: '#a1a1aa', fontSize: 14 }}>{b.username || '-'}</td>
                <td style={{ padding: '14px 16px' }}><span className={`badge ${b.is_active ? 'badge-success' : 'badge-error'}`}>{b.is_active ? 'Active' : 'Inactive'}</span></td>
                <td style={{ padding: '14px 16px', color: '#a1a1aa', fontSize: 14 }}>{b.created_at ? new Date(b.created_at).toLocaleDateString() : '-'}</td>
              </tr>
            ))}
            {bots.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', padding: 48, color: '#71717a' }}>No bots connected</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  )
}

function LogsTab({ logs }) {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: '#ffffff' }}>Generation Logs</h2>
        <span className="badge badge-default">{logs.length} entries</span>
      </div>
      <div style={{ background: '#111113', border: '1px solid #1e1e22', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1e1e22' }}>
              {['User', 'Prompt', 'Status', 'Duration', 'Time'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} style={{ borderBottom: '1px solid #1e1e22', transition: 'background 150ms' }}
                onMouseEnter={e => e.currentTarget.style.background = '#1a1a1e'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '14px 16px', fontWeight: 500, color: '#ffffff', fontSize: 14 }}>{log.username || '-'}</td>
                <td style={{ padding: '14px 16px', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#a1a1aa', fontSize: 14 }}>{log.prompt || '-'}</td>
                <td style={{ padding: '14px 16px' }}><span className={`badge ${log.status === 'success' ? 'badge-success' : log.status === 'error' ? 'badge-error' : 'badge-warning'}`}>{log.status}</span></td>
                <td style={{ padding: '14px 16px', color: '#a1a1aa', fontSize: 14 }}>{log.duration_ms ? `${log.duration_ms}ms` : '-'}</td>
                <td style={{ padding: '14px 16px', color: '#a1a1aa', fontSize: 14 }}>{log.created_at ? new Date(log.created_at).toLocaleString() : '-'}</td>
              </tr>
            ))}
            {logs.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', padding: 48, color: '#71717a' }}>No logs yet</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  )
}

function UsageTab({ usageLimits, newLimit, setNewLimit, onUpdateLimit, onResetAll }) {
  return (
    <>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24, color: '#ffffff' }}>Usage Limits</h1>
      <div style={{ background: '#111113', border: '1px solid #1e1e22', borderRadius: 12, padding: 20, marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#ffffff', marginBottom: 16 }}>Daily Message Limit</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <input type="number" value={newLimit} onChange={(e) => setNewLimit(parseInt(e.target.value) || 50)} min={1} max={10000}
            style={{ background: '#0a0a0a', border: '1px solid #1e1e22', borderRadius: 8, padding: '10px 14px', color: '#ffffff', fontSize: 14, width: 120 }} />
          <button className="btn btn-primary btn-sm" onClick={onUpdateLimit}>Save Limit</button>
          <button className="btn btn-danger btn-sm" onClick={onResetAll} style={{ marginLeft: 'auto' }}>
            <RotateCcw size={14} /> Reset All Usage
          </button>
        </div>
        <div style={{ fontSize: 13, color: '#71717a' }}>Users can send this many messages per day (resets at midnight UTC)</div>
      </div>
      <div style={{ background: '#111113', border: '1px solid #1e1e22', borderRadius: 12, padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#ffffff', marginBottom: 16 }}>Today's Usage</div>
        {usageLimits.usage.length === 0 ? (
          <div style={{ fontSize: 13, color: '#71717a' }}>No usage today</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {usageLimits.usage.map((u) => (
              <div key={u.userId} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #1e1e22' }}>
                <span style={{ fontSize: 14, color: '#ffffff' }}>{u.username}</span>
                <span style={{ fontSize: 14, color: u.count >= usageLimits.limit ? '#ef4444' : '#a1a1aa' }}>{u.count}/{usageLimits.limit}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

function IpBansTab({ ipBans, onBan, onUnban }) {
  const [ip, setIp] = useState('')
  const [reason, setReason] = useState('')

  const handleBan = () => {
    if (!ip.trim()) return
    onBan(ip.trim(), reason)
    setIp('')
    setReason('')
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: '#ffffff' }}>IP Bans</h2>
        <span className="badge badge-default">{ipBans.length} banned</span>
      </div>
      <div style={{ background: '#111113', border: '1px solid #1e1e22', borderRadius: 12, padding: 20, marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#ffffff', marginBottom: 16 }}>Ban IP Address</div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
          <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
            <label className="input-label">IP Address</label>
            <input className="input-field" placeholder="192.168.1.1" value={ip} onChange={e => setIp(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleBan() }} />
          </div>
          <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
            <label className="input-label">Reason</label>
            <input className="input-field" placeholder="Optional reason" value={reason} onChange={e => setReason(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleBan() }} />
          </div>
          <button className="btn btn-danger btn-sm" onClick={handleBan} style={{ height: 40 }}>
            <Ban size={14} /> Ban IP
          </button>
        </div>
      </div>
      <div style={{ background: '#111113', border: '1px solid #1e1e22', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1e1e22' }}>
              {['IP Address', 'Reason', 'Banned By', 'Date', 'Action'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ipBans.map((b) => (
              <tr key={b.ip} style={{ borderBottom: '1px solid #1e1e22', transition: 'background 150ms' }}
                onMouseEnter={e => e.currentTarget.style.background = '#1a1a1e'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '14px 16px' }}><code style={{ fontSize: 13, background: '#0a0a0a', padding: '3px 8px', borderRadius: 6, color: '#ef4444', border: '1px solid #1e1e22' }}>{b.ip}</code></td>
                <td style={{ padding: '14px 16px', color: '#a1a1aa', fontSize: 14 }}>{b.reason || '-'}</td>
                <td style={{ padding: '14px 16px', color: '#a1a1aa', fontSize: 14 }}>{b.banned_by || '-'}</td>
                <td style={{ padding: '14px 16px', color: '#a1a1aa', fontSize: 14 }}>{b.created_at ? new Date(b.created_at).toLocaleDateString() : '-'}</td>
                <td style={{ padding: '14px 16px' }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => onUnban(b.ip)} style={{ color: '#22c55e' }}><ShieldOff size={14} /> Unban</button>
                </td>
              </tr>
            ))}
            {ipBans.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', padding: 48, color: '#71717a' }}>No IP bans</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  )
}

function SettingsTab({ onClearSessions }) {
  return (
    <>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24, color: '#ffffff' }}>Admin Settings</h1>
      <div style={{ background: '#111113', border: '1px solid #1e1e22', borderRadius: 12, padding: 20, marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#ffffff', marginBottom: 16 }}>System</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #1e1e22' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#ffffff' }}>Maintenance Mode</div>
            <div style={{ fontSize: 13, color: '#71717a', marginTop: 2 }}>Temporarily disable public access</div>
          </div>
          <div className="toggle-switch" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#ffffff' }}>Allow New Registrations</div>
            <div style={{ fontSize: 13, color: '#71717a', marginTop: 2 }}>Allow new users to create accounts</div>
          </div>
          <div className="toggle-switch active" />
        </div>
      </div>
      <div style={{ background: '#111113', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#ef4444', marginBottom: 16 }}>Danger Zone</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#ffffff' }}>Clear All Sessions</div>
            <div style={{ fontSize: 13, color: '#71717a', marginTop: 2 }}>Force all users to re-login</div>
          </div>
          <button className="btn btn-danger btn-sm" onClick={onClearSessions}>Clear Sessions</button>
        </div>
      </div>
    </>
  )
}

function AiProvidersTab({ providers, setProviders, token, headers, onDelete, setError }) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ name: '', provider: 'openai', api_key: '', base_url: '', models: [] })
  const [saving, setSaving] = useState(false)

  const resetForm = () => { setForm({ name: '', provider: 'openai', api_key: '', base_url: '', models: [] }); setEditingId(null); setShowForm(false) }
  const startEdit = (p) => { setForm({ name: p.name, provider: p.provider, api_key: '', base_url: p.base_url || '', models: p.models || [] }); setEditingId(p.id); setShowForm(true) }
  const handleProviderChange = (provider) => { setForm(f => ({ ...f, provider, models: DEFAULT_MODELS[provider] || [] })) }
  const toggleModel = (model) => { setForm(f => ({ ...f, models: f.models.includes(model) ? f.models.filter(m => m !== model) : [...f.models, model] })) }

  const handleSave = async () => {
    if (!form.name || !form.provider) { setError('Name and provider are required'); return }
    setSaving(true)
    try {
      const body = { ...form }; if (!body.api_key) delete body.api_key
      const url = editingId ? `/api/admin/ai-providers/${editingId}` : '/api/admin/ai-providers'
      const method = editingId ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers, body: JSON.stringify(body) })
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Failed to save') }
      const saved = await res.json()
      if (editingId) { setProviders(providers.map(p => p.id === editingId ? { ...p, ...saved, api_key: saved.api_key || '***' + saved.api_key?.slice(-4) } : p)) }
      else { setProviders([saved, ...providers]) }
      resetForm()
    } catch (e) { setError(e.message) } finally { setSaving(false) }
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: '#ffffff' }}>AI Providers</h2>
        <button className="btn btn-primary btn-sm" onClick={() => { resetForm(); setShowForm(true) }}><Plus size={14} /> Add Provider</button>
      </div>
      {showForm && (
        <div style={{ background: '#111113', border: '1px solid #1e1e22', borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#ffffff', margin: 0 }}>{editingId ? 'Edit' : 'Add'} AI Provider</h3>
            <button className="btn btn-ghost btn-sm" onClick={resetForm}><X size={16} /></button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="input-group"><label className="input-label">Name</label><input className="input-field" placeholder="My OpenAI" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="input-group"><label className="input-label">Type</label>
              <select className="settings-select" style={{ width: '100%' }} value={form.provider} onChange={e => handleProviderChange(e.target.value)}>
                {PROVIDER_TYPES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
          </div>
          <div className="input-group"><label className="input-label">API Key {editingId && '(blank to keep)'}</label><input className="input-field" type="password" placeholder="sk-..." value={form.api_key} onChange={e => setForm(f => ({ ...f, api_key: e.target.value }))} /></div>
          {form.provider === 'custom' && <div className="input-group"><label className="input-label">Base URL</label><input className="input-field" placeholder="https://api.example.com/v1" value={form.base_url} onChange={e => setForm(f => ({ ...f, base_url: e.target.value }))} /></div>}
          {DEFAULT_MODELS[form.provider]?.length > 0 && (
            <div className="input-group"><label className="input-label">Models</label>
              <div className="ai-provider-models">{DEFAULT_MODELS[form.provider].map(m => (<button key={m} className={`ai-provider-model ${form.models.includes(m) ? 'active' : ''}`} onClick={() => toggleModel(m)}>{m}</button>))}</div>
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
            <button className="btn btn-secondary btn-sm" onClick={resetForm}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
              {saving ? <><Loader2 size={14} className="spinner" /> Saving...</> : <><Save size={14} /> {editingId ? 'Update' : 'Create'}</>}
            </button>
          </div>
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {providers.map(p => (
          <div key={p.id} style={{ background: '#111113', border: '1px solid #1e1e22', borderRadius: 12, padding: '16px 20px', transition: 'border-color 150ms ease' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#3b82f6'} onMouseLeave={e => e.currentTarget.style.borderColor = '#1e1e22'}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: '#ffffff' }}>{p.name}</span>
                <span style={{ fontSize: 12, background: '#1a1a1e', padding: '2px 8px', borderRadius: 6, color: '#71717a' }}>{PROVIDER_TYPES.find(t => t.value === p.provider)?.label || p.provider}</span>
                {!p.is_active && <span className="badge badge-error">Disabled</span>}
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => startEdit(p)}><Edit3 size={14} /></button>
                <button className="btn btn-ghost btn-sm" onClick={() => onDelete(p.id)} style={{ color: '#ef4444' }}><Trash2 size={14} /></button>
              </div>
            </div>
            {p.models?.length > 0 && <div className="ai-provider-models">{p.models.map(m => <span key={m} className="ai-provider-model">{m}</span>)}</div>}
          </div>
        ))}
      </div>
      {providers.length === 0 && !showForm && (
        <div style={{ textAlign: 'center', padding: 48, color: '#71717a', background: '#111113', border: '1px solid #1e1e22', borderRadius: 12 }}>
          <Sparkles size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
          <p>No AI providers configured yet.</p>
        </div>
      )}
    </>
  )
}

function TemplatesTab({ templates, setTemplates, token, headers, onDelete, setError }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', description: '' })
  const [saving, setSaving] = useState(false)
  const [blueprintText, setBlueprintText] = useState('')

  const handleSave = async () => {
    if (!form.name) { setError('Template name is required'); return }
    let blueprint
    try { blueprint = JSON.parse(blueprintText) } catch { setError('Invalid JSON in blueprint'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/templates', { method: 'POST', headers, body: JSON.stringify({ name: form.name, description: form.description, blueprint_json: blueprint }) })
      if (!res.ok) throw new Error('Failed to create')
      const saved = await res.json()
      setTemplates([saved, ...templates])
      setForm({ name: '', description: '' }); setBlueprintText(''); setShowForm(false)
    } catch (e) { setError(e.message) } finally { setSaving(false) }
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: '#ffffff' }}>Templates</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}><Plus size={14} /> Create Template</button>
      </div>
      {showForm && (
        <div style={{ background: '#111113', border: '1px solid #1e1e22', borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#ffffff', margin: 0 }}>Create Template</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}><X size={16} /></button>
          </div>
          <div className="input-group"><label className="input-label">Name</label><input className="input-field" placeholder="Template name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
          <div className="input-group"><label className="input-label">Description</label><input className="input-field" placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
          <div className="input-group"><label className="input-label">Blueprint JSON</label>
            <textarea className="textarea-field" style={{ minHeight: 200, fontFamily: 'monospace', fontSize: 12, background: '#0a0a0a', border: '1px solid #1e1e22', borderRadius: 8, color: '#ffffff' }}
              placeholder='{"serverName":"My Server","categories":[],"roles":[]}' value={blueprintText} onChange={e => setBlueprintText(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
              {saving ? <><Loader2 size={14} className="spinner" /> Saving...</> : <><Save size={14} /> Create</>}
            </button>
          </div>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {templates.map(t => (
          <div key={t.id} style={{ background: '#111113', border: '1px solid #1e1e22', borderRadius: 12, padding: 20, transition: 'border-color 150ms ease' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#3b82f6'} onMouseLeave={e => e.currentTarget.style.borderColor = '#1e1e22'}>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#ffffff', marginBottom: 6 }}>{t.name}</div>
            <div style={{ fontSize: 13, color: '#71717a', marginBottom: 12 }}>{t.description || 'No description'}</div>
            <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#a1a1aa', marginBottom: 16 }}>
              <span>{t.blueprint_json?.categories?.length || 0} categories</span>
              <span>{t.blueprint_json?.roles?.length || 0} roles</span>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => onDelete(t.id)} style={{ color: '#ef4444' }}><Trash2 size={14} /> Delete</button>
          </div>
        ))}
      </div>
      {templates.length === 0 && !showForm && (
        <div style={{ textAlign: 'center', padding: 48, color: '#71717a', background: '#111113', border: '1px solid #1e1e22', borderRadius: 12 }}>
          <FileText size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
          <p>No templates yet.</p>
        </div>
      )}
    </>
  )
}
