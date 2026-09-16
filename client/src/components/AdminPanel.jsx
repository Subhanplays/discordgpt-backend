import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  LayoutDashboard, Users, Bot, FileText, Settings, Activity,
  ArrowLeft, BarChart3, Sparkles, Plus, Trash2,
  Edit3, PowerOff, Save, X, Loader2, Server, Copy,
  Ban, ShieldOff, Globe, RotateCcw, UserCheck, Key,
  Search, MessageSquare, Download, Send, Eye, Copy as CopyIcon,
  MessageCircle, Megaphone, Clock, LogOut
} from 'lucide-react'

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'conversations', label: 'Conversations', icon: MessageSquare },
  { id: 'blueprints', label: 'Blueprints', icon: Eye },
  { id: 'deployments', label: 'Deployments', icon: Server },
  { id: 'broadcast', label: 'Broadcast', icon: Megaphone },
  { id: 'bots', label: 'Bots', icon: Bot },
  { id: 'ai', label: 'AI Providers', icon: Sparkles },
  { id: 'templates', label: 'Templates', icon: FileText },
  { id: 'logs', label: 'Logs', icon: Activity },
  { id: 'usage', label: 'Usage', icon: BarChart3 },
  { id: 'ipbans', label: 'IP Bans', icon: Globe },
  { id: 'settings', label: 'Settings', icon: Settings }
]

const PROVIDER_TYPES = [
  { value: 'openai', label: 'OpenAI' }, { value: 'anthropic', label: 'Anthropic' },
  { value: 'google', label: 'Google AI' }, { value: 'mistral', label: 'Mistral' },
  { value: 'groq', label: 'Groq' }, { value: 'openrouter', label: 'OpenRouter' },
  { value: 'custom', label: 'Custom API' }
]

const DEFAULT_MODELS = {
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
  anthropic: ['claude-3.5-sonnet', 'claude-3-haiku', 'claude-3-opus'],
  google: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro'],
  mistral: ['mistral-large', 'mistral-medium', 'mistral-small'],
  groq: ['llama-3.1-70b', 'llama-3.1-8b', 'mixtral-8x7b'],
  openrouter: ['auto'], custom: []
}

const btnBase = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, fontFamily: 'inherit', transition: 'all 150ms ease' }
const btnPrimary = { ...btnBase, background: '#3b82f6', color: '#fff' }
const btnDanger = { ...btnBase, background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }
const btnGhost = { ...btnBase, background: 'transparent', color: '#a1a1aa', border: '1px solid #1e1e22' }
const card = { background: '#111113', border: '1px solid #1e1e22', borderRadius: 12, padding: 20 }
const th = { padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }
const td = { padding: '14px 16px', fontSize: 14 }

export default function AdminPanel() {
  const navigate = useNavigate()
  const { token, logout, user } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [data, setData] = useState({ stats: null, users: [], bots: [], logs: [], aiProviders: [], templates: [], usageLimits: { limit: 50, usage: [] }, ipBans: [], conversations: [], blueprints: [], deployments: [], broadcasts: [] })
  const [newLimit, setNewLimit] = useState(50)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
  const showSuccess = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3000) }

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const urls = ['/api/admin/stats', '/api/admin/users', '/api/admin/bots', '/api/admin/logs?limit=50',
        '/api/admin/ai-providers', '/api/admin/templates', '/api/admin/usage-limits',
        '/api/admin/ip-bans', '/api/admin/all-conversations?limit=50', '/api/admin/blueprints',
        '/api/admin/deployments', '/api/admin/broadcasts']
      const results = await Promise.all(urls.map(u => fetch(u, { headers }).then(r => r.ok ? r.json() : null).catch(() => null)))
      const keys = ['stats', 'users', 'bots', 'logs', 'aiProviders', 'templates', 'usageLimits', 'ipBans', 'conversations', 'blueprints', 'deployments', 'broadcasts']
      const newData = {}
      keys.forEach((k, i) => { if (results[i]) newData[k] = results[i] })
      setData(prev => ({ ...prev, ...newData }))
      if (results[6]) setNewLimit(results[6].limit)
    } catch { setError('Failed to load admin data') } finally { setLoading(false) }
  }, [token])

  useEffect(() => { fetchData() }, [fetchData])

  const update = (key, val) => setData(prev => ({ ...prev, [key]: val }))
  const api = async (url, method = 'GET', body) => {
    const opts = { method, headers }; if (body) opts.body = JSON.stringify(body)
    const res = await fetch(url, opts); return res.ok ? await res.json().catch(() => ({})) : null
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0a0a0a' }}>
      <aside style={{ width: 240, background: '#111113', borderRight: '1px solid #1e1e22', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid #1e1e22', display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/logo.svg" alt="" style={{ width: 28, height: 28, borderRadius: 8, color: 'var(--text)' }} />
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#fff', margin: 0 }}>Admin Panel</h2>
        </div>
        <nav style={{ flex: 1, padding: 8, display: 'flex', flexDirection: 'column', gap: 2, overflow: 'auto' }}>
          <button onClick={() => navigate('/')} style={{ ...btnGhost, width: '100%', justifyContent: 'flex-start', marginBottom: 4 }}><ArrowLeft size={16} /> Back to App</button>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              ...btnGhost, width: '100%', justifyContent: 'flex-start',
              background: activeTab === tab.id ? 'rgba(59,130,246,0.1)' : 'transparent',
              border: activeTab === tab.id ? '1px solid rgba(59,130,246,0.2)' : '1px solid transparent',
              color: activeTab === tab.id ? '#3b82f6' : '#a1a1aa',
              fontWeight: activeTab === tab.id ? 500 : 400
            }}><tab.icon size={16} /> {tab.label}</button>
          ))}
          <div style={{ flex: 1 }} />
          <button onClick={() => { logout(); navigate('/') }} style={{ ...btnGhost, width: '100%', justifyContent: 'flex-start', color: '#ef4444' }}><LogOut size={16} /> Log Out</button>
        </nav>
      </aside>

      <main style={{ flex: 1, overflow: 'auto', padding: '24px 32px' }}>
        {error && <Banner type="error" msg={error} onClose={() => setError('')} />}
        {success && <Banner type="success" msg={success} onClose={() => setSuccess('')} />}
        {loading ? <Loader /> : (
          <>
            {activeTab === 'dashboard' && <DashboardTab data={data} api={api} headers={headers} showSuccess={showSuccess} setError={setError} fetchData={fetchData} />}
            {activeTab === 'users' && <UsersTab data={data} api={api} update={update} setError={setError} showSuccess={showSuccess} />}
            {activeTab === 'conversations' && <ConversationsTab data={data} api={api} update={update} setError={setError} showSuccess={showSuccess} />}
            {activeTab === 'blueprints' && <BlueprintsTab data={data} />}
            {activeTab === 'deployments' && <DeploymentsTab data={data} />}
            {activeTab === 'broadcast' && <BroadcastTab data={data} api={api} update={update} setError={setError} showSuccess={showSuccess} />}
            {activeTab === 'bots' && <BotsTab data={data} />}
            {activeTab === 'ai' && <AiProvidersTab data={data} api={api} update={update} setError={setError} showSuccess={showSuccess} />}
            {activeTab === 'templates' && <TemplatesTab data={data} api={api} update={update} setError={setError} showSuccess={showSuccess} />}
            {activeTab === 'logs' && <LogsTab data={data} />}
            {activeTab === 'usage' && <UsageTab data={data} newLimit={newLimit} setNewLimit={setNewLimit} api={api} setError={setError} showSuccess={showSuccess} fetchData={fetchData} />}
            {activeTab === 'ipbans' && <IpBansTab data={data} api={api} update={update} setError={setError} showSuccess={showSuccess} />}
            {activeTab === 'settings' && <SettingsTab api={api} setError={setError} showSuccess={showSuccess} />}
          </>
        )}
      </main>
    </div>
  )
}

function Banner({ type, msg, onClose }) {
  const isErr = type === 'error'
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: isErr ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)', border: `1px solid ${isErr ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)'}`, borderRadius: 10, marginBottom: 20, fontSize: 14, color: isErr ? '#ef4444' : '#22c55e' }}>
      <span>{msg}</span><button onClick={onClose} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 4 }}><X size={14} /></button>
    </div>
  )
}

function Loader() {
  return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', color: '#71717a', gap: 8 }}><Loader2 size={20} className="spinner" /> Loading...</div>
}

function DashboardTab({ data, api, headers, showSuccess, setError, fetchData }) {
  const stats = data.stats

  const handleCleanupChats = async () => {
    if (!confirm('Delete ALL conversations, messages, and logs? API keys and users will be kept.')) return
    try {
      const res = await fetch('/api/admin/cleanup-chats', { method: 'POST', headers })
      const data = await res.json()
      if (res.ok) { showSuccess('All chat data cleared'); fetchData() } else { setError(data.error || 'Failed') }
    } catch (e) { setError('Network error') }
  }

  return (
    <>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24, color: '#fff' }}>Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 16 }}>
        {[{ l: 'Users', v: stats?.totalUsers || 0, c: '#3b82f6' }, { l: 'Bots', v: stats?.totalBots || 0, c: '#22c55e' }, { l: 'Generated', v: stats?.totalServers || 0, c: '#f59e0b' }, { l: 'Templates', v: stats?.totalTemplates || 0, c: '#ec4899' },
          { l: 'AI Providers', v: stats?.totalAiProviders || 0, c: '#06b6d4' }, { l: 'Requests', v: stats?.totalAiRequests || 0, c: '#ef4444' }, { l: 'Conversations', v: data.conversations?.length || 0, c: '#8b5cf6' }, { l: 'IP Bans', v: data.ipBans?.length || 0, c: '#f97316' }
        ].map((s, i) => (
          <div key={i} style={{ ...card, transition: 'border-color 150ms' }} onMouseEnter={e => e.currentTarget.style.borderColor = s.c} onMouseLeave={e => e.currentTarget.style.borderColor = '#1e1e22'}>
            <div style={{ fontSize: 13, color: '#71717a', marginBottom: 8 }}>{s.l}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#fff' }}>{s.v}</div>
          </div>
        ))}
      </div>
      <div style={{ ...card, marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontWeight: 600, color: '#fff', fontSize: 14 }}>Launch Cleanup</div>
          <div style={{ fontSize: 12, color: '#71717a', marginTop: 2 }}>Delete all conversations, messages, and logs. Keeps users and API keys.</div>
        </div>
        <button style={{ ...btnDanger }} onClick={handleCleanupChats}><Trash2 size={14} /> Clean All Chats</button>
      </div>
    </>
  )
}

function UsersTab({ data, api, update, setError, showSuccess }) {
  const [search, setSearch] = useState('')
  const [filtered, setFiltered] = useState([])
  const [banModal, setBanModal] = useState(null)
  const [banReason, setBanReason] = useState('')
  const [limitModal, setLimitModal] = useState(null)
  const [limitVal, setLimitVal] = useState(50)
  const [userConvs, setUserConvs] = useState(null)

  useEffect(() => {
    if (!search.trim()) { setFiltered(data.users); return }
    const q = search.toLowerCase()
    setFiltered(data.users.filter(u => (u.username || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q) || (u.discord_id || '').includes(q)))
  }, [search, data.users])

  const handleBan = async () => {
    if (!banModal) return
    await api(`/api/admin/users/${banModal.id}/ban`, 'POST', { reason: banReason })
    update('users', data.users.map(u => u.id === banModal.id ? { ...u, is_banned: true, ban_reason: banReason } : u))
    showSuccess(`Banned ${banModal.username}`); setBanModal(null); setBanReason('')
  }

  const handleUnban = async (u) => {
    await api(`/api/admin/users/${u.id}/unban`, 'POST')
    update('users', data.users.map(x => x.id === u.id ? { ...x, is_banned: false } : x))
    showSuccess(`Unbanned ${u.username}`)
  }

  const handleResetUsage = async (u) => {
    await api(`/api/admin/users/${u.id}/reset-usage`, 'POST')
    showSuccess(`Usage reset for ${u.username}`)
  }

  const handleToggleRole = async (u) => {
    const role = u.role === 'admin' ? 'user' : 'admin'
    await api(`/api/admin/users/${u.id}/role`, 'POST', { role })
    update('users', data.users.map(x => x.id === u.id ? { ...x, role } : x))
    showSuccess(`${u.username} → ${role}`)
  }

  const handleSetLimit = async () => {
    if (!limitModal) return
    await api(`/api/admin/users/${limitModal.id}/message-limit`, 'POST', { limit: limitVal })
    showSuccess(`Limit set for ${limitModal.username}`); setLimitModal(null)
  }

  const handleViewConvs = async (u) => {
    const convs = await api(`/api/admin/users/${u.id}/conversations`)
    setUserConvs({ user: u, conversations: convs || [] })
  }

  const handleImpersonate = async (u) => {
    const res = await api('/api/admin/impersonate', 'POST', { userId: u.id })
    if (res?.token) {
      localStorage.setItem('dgpt_token', res.token)
      showSuccess(`Logged in as ${u.username}`)
      setTimeout(() => navigate('/'), 500)
    }
  }

  const handleDeleteConv = async (convId) => {
    await api(`/api/admin/conversations/${convId}`, 'DELETE')
    if (userConvs) setUserConvs(prev => ({ ...prev, conversations: prev.conversations.filter(c => c.id !== convId) }))
    showSuccess('Conversation deleted')
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: '#fff' }}>Users ({filtered.length})</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#71717a' }} />
            <input placeholder="Search name, email, Discord ID..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ background: '#0a0a0a', border: '1px solid #1e1e22', borderRadius: 8, padding: '8px 12px 8px 34px', color: '#fff', fontSize: 13, width: 280 }} />
          </div>
          <a href="/api/admin/export/users" download style={{ ...btnGhost, textDecoration: 'none' }}><Download size={14} /> Export CSV</a>
        </div>
      </div>
      <div style={{ ...card, overflow: 'hidden', padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ borderBottom: '1px solid #1e1e22' }}>
            {['User', 'Discord ID', 'Role', 'Status', 'Joined', 'Actions'].map(h => <th key={h} style={th}>{h}</th>)}
          </tr></thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid #1e1e22' }} onMouseEnter={e => e.currentTarget.style.background = '#1a1a1e'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={td}><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {u.discord_avatar && <img src={u.discord_avatar} alt="" style={{ width: 28, height: 28, borderRadius: '50%' }} />}
                  <div><div style={{ color: '#fff', fontWeight: 500 }}>{u.username}</div><div style={{ fontSize: 12, color: '#71717a' }}>{u.email}</div></div>
                </div></td>
                <td style={td}><code style={{ fontSize: 11, background: '#0a0a0a', padding: '2px 6px', borderRadius: 4, color: '#a1a1aa', border: '1px solid #1e1e22' }}>{u.discord_id || '-'}</code></td>
                <td style={td}><span className={`badge ${u.role === 'admin' ? 'badge-warning' : 'badge-default'}`}>{u.role}</span></td>
                <td style={td}>{u.is_banned ? <span className="badge badge-error" title={u.ban_reason}>Banned</span> : <span className="badge badge-success">Active</span>}</td>
                <td style={{ ...td, color: '#71717a' }}>{u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}</td>
                <td style={td}><div style={{ display: 'flex', gap: 4 }}>
                  {u.is_banned ? <button style={btnGhost} onClick={() => handleUnban(u)} title="Unban"><UserCheck size={14} /></button> : <button style={btnGhost} onClick={() => setBanModal(u)} title="Ban"><Ban size={14} style={{ color: '#ef4444' }} /></button>}
                  <button style={btnGhost} onClick={() => handleResetUsage(u)} title="Reset usage"><RotateCcw size={14} /></button>
                  <button style={btnGhost} onClick={() => handleToggleRole(u)} title="Toggle role"><Key size={14} /></button>
                  <button style={btnGhost} onClick={() => handleViewConvs(u)} title="Conversations"><MessageSquare size={14} /></button>
                  <button style={btnGhost} onClick={() => { setLimitModal(u); setLimitVal(50) }} title="Set message limit"><BarChart3 size={14} /></button>
                  <button style={btnGhost} onClick={() => handleImpersonate(u)} title="Login as user"><LogOut size={14} /></button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {banModal && <Modal title={`Ban ${banModal.username}`} onClose={() => setBanModal(null)}>
        <input className="input-field" placeholder="Ban reason..." value={banReason} onChange={e => setBanReason(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleBan()} style={{ marginBottom: 12 }} />
        <p style={{ fontSize: 13, color: '#71717a', marginBottom: 16 }}>This revokes all sessions.</p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button style={btnGhost} onClick={() => setBanModal(null)}>Cancel</button>
          <button style={btnDanger} onClick={handleBan}>Ban User</button>
        </div>
      </Modal>}

      {limitModal && <Modal title={`Message Limit — ${limitModal.username}`} onClose={() => setLimitModal(null)}>
        <input type="number" className="input-field" value={limitVal} onChange={e => setLimitVal(parseInt(e.target.value) || 0)} min={0} style={{ marginBottom: 12 }} />
        <p style={{ fontSize: 13, color: '#71717a', marginBottom: 16 }}>Set 0 for unlimited.</p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button style={btnGhost} onClick={() => setLimitModal(null)}>Cancel</button>
          <button style={btnPrimary} onClick={handleSetLimit}>Save</button>
        </div>
      </Modal>}

      {userConvs && <Modal title={`Conversations — ${userConvs.user.username}`} onClose={() => setUserConvs(null)} wide>
        {userConvs.conversations.length === 0 ? <p style={{ color: '#71717a' }}>No conversations</p> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {userConvs.conversations.map(c => (
              <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#0a0a0a', borderRadius: 8, border: '1px solid #1e1e22' }}>
                <div><div style={{ color: '#fff', fontSize: 14 }}>{c.title}</div><div style={{ fontSize: 12, color: '#71717a' }}>{c.created_at ? new Date(c.created_at).toLocaleString() : ''}</div></div>
                <button style={{ ...btnGhost, color: '#ef4444', padding: '4px 8px' }} onClick={() => handleDeleteConv(c.id)}><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        )}
      </Modal>}

    </>
  )
}

function ConversationsTab({ data, api, update, setError, showSuccess }) {
  const [search, setSearch] = useState('')
  const convs = data.conversations || []
  const filtered = search.trim() ? convs.filter(c => (c.title || '').toLowerCase().includes(search.toLowerCase()) || (c.username || '').toLowerCase().includes(search.toLowerCase())) : convs

  const handleDelete = async (id) => {
    if (!confirm('Delete this conversation?')) return
    await api(`/api/admin/conversations/${id}`, 'DELETE')
    update('conversations', convs.filter(c => c.id !== id))
    showSuccess('Conversation deleted')
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: '#fff' }}>Conversations ({filtered.length})</h2>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#71717a' }} />
          <input placeholder="Search title or user..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ background: '#0a0a0a', border: '1px solid #1e1e22', borderRadius: 8, padding: '8px 12px 8px 34px', color: '#fff', fontSize: 13, width: 260 }} />
        </div>
      </div>
      <div style={{ ...card, overflow: 'hidden', padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ borderBottom: '1px solid #1e1e22' }}>
            {['Title', 'User', 'Messages', 'Created', ''].map(h => <th key={h} style={th}>{h}</th>)}
          </tr></thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid #1e1e22' }} onMouseEnter={e => e.currentTarget.style.background = '#1a1a1e'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ ...td, color: '#fff', fontWeight: 500, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title || 'Untitled'}</td>
                <td style={{ ...td, color: '#a1a1aa' }}>{c.username || '-'}</td>
                <td style={{ ...td, color: '#a1a1aa' }}>{c.message_count || 0}</td>
                <td style={{ ...td, color: '#71717a' }}>{c.created_at ? new Date(c.created_at).toLocaleDateString() : '-'}</td>
                <td style={td}><button style={{ ...btnGhost, padding: '4px 8px', color: '#ef4444' }} onClick={() => handleDelete(c.id)}><Trash2 size={14} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

function BlueprintsTab({ data }) {
  const bps = data.blueprints || []
  const [view, setView] = useState(null)
  return (
    <>
      <h2 style={{ fontSize: 20, fontWeight: 600, color: '#fff', marginBottom: 20 }}>Blueprint History ({bps.length})</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {bps.map(b => {
          let bp; try { bp = JSON.parse(b.blueprint_json) } catch { bp = {} }
          return (
            <div key={b.id} style={{ ...card, cursor: 'pointer', transition: 'border-color 150ms' }} onClick={() => setView({ ...b, parsed: bp })}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#3b82f6'} onMouseLeave={e => e.currentTarget.style.borderColor = '#1e1e22'}>
              <div style={{ fontWeight: 600, color: '#fff', marginBottom: 4 }}>{bp.serverName || b.title || 'Untitled'}</div>
              <div style={{ fontSize: 12, color: '#71717a', marginBottom: 8 }}>{b.username || 'Unknown'} · {b.created_at ? new Date(b.created_at).toLocaleDateString() : ''}</div>
              <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#a1a1aa' }}>
                <span>{bp.categories?.length || 0} categories</span>
                <span>{bp.roles?.length || 0} roles</span>
              </div>
            </div>
          )
        })}
      </div>
      {view && <Modal title={view.parsed?.serverName || 'Blueprint'} onClose={() => setView(null)} wide>
        <pre style={{ background: '#0a0a0a', border: '1px solid #1e1e22', borderRadius: 8, padding: 16, fontSize: 12, color: '#a1a1aa', overflow: 'auto', maxHeight: 500, margin: 0 }}>{JSON.stringify(view.parsed, null, 2)}</pre>
      </Modal>}
    </>
  )
}

function DeploymentsTab({ data }) {
  const deps = data.deployments || []
  return (
    <>
      <h2 style={{ fontSize: 20, fontWeight: 600, color: '#fff', marginBottom: 20 }}>Server Deployments ({deps.length})</h2>
      <div style={{ ...card, overflow: 'hidden', padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ borderBottom: '1px solid #1e1e22' }}>
            {['Server Name', 'Code', 'User', 'Expires', 'Created'].map(h => <th key={h} style={th}>{h}</th>)}
          </tr></thead>
          <tbody>
            {deps.map(d => {
              const expired = d.expires_at && new Date(d.expires_at) < new Date()
              return (
                <tr key={d.id} style={{ borderBottom: '1px solid #1e1e22' }} onMouseEnter={e => e.currentTarget.style.background = '#1a1a1e'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ ...td, color: '#fff', fontWeight: 500 }}>{d.server_name || 'Untitled'}</td>
                  <td style={td}><code style={{ fontSize: 12, background: '#0a0a0a', padding: '3px 8px', borderRadius: 6, color: expired ? '#ef4444' : '#22c55e', border: '1px solid #1e1e22' }}>{d.code}</code></td>
                  <td style={{ ...td, color: '#a1a1aa' }}>{d.username || '-'}</td>
                  <td style={{ ...td, color: expired ? '#ef4444' : '#71717a' }}>{d.expires_at ? new Date(d.expires_at).toLocaleString() : '-'}{expired ? ' (expired)' : ''}</td>
                  <td style={{ ...td, color: '#71717a' }}>{d.created_at ? new Date(d.created_at).toLocaleDateString() : '-'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}

function BroadcastTab({ data, api, update, setError, showSuccess }) {
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)

  const handleSend = async () => {
    if (!text.trim()) return
    setSending(true)
    await api('/api/admin/broadcast', 'POST', { announcement: text.trim() })
    const broadcasts = await api('/api/admin/broadcasts')
    if (broadcasts) update('broadcasts', broadcasts)
    showSuccess('Broadcast sent'); setText(''); setSending(false)
  }

  return (
    <>
      <h2 style={{ fontSize: 20, fontWeight: 600, color: '#fff', marginBottom: 20 }}>Broadcast Announcements</h2>
      <div style={{ ...card, marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 12 }}>New Announcement</div>
        <textarea className="input-field" placeholder="Type your announcement..." value={text} onChange={e => setText(e.target.value)}
          style={{ minHeight: 100, marginBottom: 12, resize: 'vertical' }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={btnPrimary} onClick={handleSend} disabled={sending || !text.trim()}>
            {sending ? <Loader2 size={14} className="spinner" /> : <Send size={14} />} Send Broadcast
          </button>
        </div>
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 12 }}>Previous Broadcasts</div>
      {(data.broadcasts || []).length === 0 ? <p style={{ color: '#71717a' }}>No broadcasts yet</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(data.broadcasts || []).map((b, i) => (
            <div key={i} style={{ ...card }}>
              <div style={{ fontSize: 14, color: '#fff', marginBottom: 4 }}>{b.announcement}</div>
              <div style={{ fontSize: 12, color: '#71717a' }}>{b.createdAt ? new Date(b.createdAt).toLocaleString() : ''}</div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

function BotsTab({ data }) {
  const bots = data.bots || []
  return (
    <>
      <h2 style={{ fontSize: 20, fontWeight: 600, color: '#fff', marginBottom: 20 }}>Bot Connections ({bots.length})</h2>
      <div style={{ ...card, overflow: 'hidden', padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ borderBottom: '1px solid #1e1e22' }}>
            {['Bot', 'Bot ID', 'Owner', 'Status'].map(h => <th key={h} style={th}>{h}</th>)}
          </tr></thead>
          <tbody>
            {bots.map(b => (
              <tr key={b.id} style={{ borderBottom: '1px solid #1e1e22' }} onMouseEnter={e => e.currentTarget.style.background = '#1a1a1e'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ ...td, color: '#fff', fontWeight: 500 }}>{b.bot_username || 'Unknown'}</td>
                <td style={td}><code style={{ fontSize: 11, background: '#0a0a0a', padding: '2px 6px', borderRadius: 4, color: '#a1a1aa', border: '1px solid #1e1e22' }}>{b.bot_id || '-'}</code></td>
                <td style={{ ...td, color: '#a1a1aa' }}>{b.username || '-'}</td>
                <td style={td}><span className={`badge ${b.is_active ? 'badge-success' : 'badge-error'}`}>{b.is_active ? 'Active' : 'Inactive'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

function AiProvidersTab({ data, api, update, setError, showSuccess }) {
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ name: '', provider: 'openai', api_key: '', base_url: '', models: [] })
  const [saving, setSaving] = useState(false)
  const providers = data.aiProviders || []

  const reset = () => { setForm({ name: '', provider: 'openai', api_key: '', base_url: '', models: [] }); setEditId(null); setShowForm(false) }
  const startEdit = (p) => { setForm({ name: p.name, provider: p.provider, api_key: '', base_url: p.base_url || '', models: p.models || [] }); setEditId(p.id); setShowForm(true) }
  const toggleModel = (m) => setForm(f => ({ ...f, models: f.models.includes(m) ? f.models.filter(x => x !== m) : [...f.models, m] }))

  const handleSave = async () => {
    if (!form.name || !form.provider) { setError('Name and provider required'); return }
    setSaving(true)
    const body = { ...form }; if (!body.api_key) delete body.api_key
    const url = editId ? `/api/admin/ai-providers/${editId}` : '/api/admin/ai-providers'
    const res = await api(url, editId ? 'PUT' : 'POST', body)
    if (res) {
      const providers = await api('/api/admin/ai-providers')
      if (providers) update('aiProviders', providers)
      showSuccess(editId ? 'Provider updated' : 'Provider created'); reset()
    } else { setError('Failed to save provider') }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this provider?')) return
    await api(`/api/admin/ai-providers/${id}`, 'DELETE')
    update('aiProviders', providers.filter(p => p.id !== id)); showSuccess('Deleted')
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: '#fff' }}>AI Providers</h2>
        <button style={btnPrimary} onClick={() => { reset(); setShowForm(true) }}><Plus size={14} /> Add Provider</button>
      </div>
      {showForm && (
        <div style={{ ...card, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#fff', margin: 0 }}>{editId ? 'Edit' : 'Add'} Provider</h3>
            <button style={btnGhost} onClick={reset}><X size={16} /></button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div><label style={{ fontSize: 12, color: '#71717a', display: 'block', marginBottom: 4 }}>Name</label><input className="input-field" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><label style={{ fontSize: 12, color: '#71717a', display: 'block', marginBottom: 4 }}>Type</label>
              <select className="input-field" value={form.provider} onChange={e => setForm(f => ({ ...f, provider: e.target.value, models: DEFAULT_MODELS[e.target.value] || [] }))}>
                {PROVIDER_TYPES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 16 }}><label style={{ fontSize: 12, color: '#71717a', display: 'block', marginBottom: 4 }}>API Key {editId && '(blank to keep)'}</label><input className="input-field" type="password" value={form.api_key} onChange={e => setForm(f => ({ ...f, api_key: e.target.value }))} /></div>
          {form.provider === 'custom' && <div style={{ marginBottom: 16 }}><label style={{ fontSize: 12, color: '#71717a', display: 'block', marginBottom: 4 }}>Base URL</label><input className="input-field" value={form.base_url} onChange={e => setForm(f => ({ ...f, base_url: e.target.value }))} /></div>}
          {DEFAULT_MODELS[form.provider]?.length > 0 && (
            <div style={{ marginBottom: 16 }}><label style={{ fontSize: 12, color: '#71717a', display: 'block', marginBottom: 4 }}>Models</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{DEFAULT_MODELS[form.provider].map(m => (
                <button key={m} onClick={() => toggleModel(m)} style={{ padding: '4px 10px', borderRadius: 6, fontSize: 12, border: '1px solid', borderColor: form.models.includes(m) ? '#3b82f6' : '#1e1e22', background: form.models.includes(m) ? 'rgba(59,130,246,0.15)' : 'transparent', color: form.models.includes(m) ? '#3b82f6' : '#71717a', cursor: 'pointer' }}>{m}</button>
              ))}</div>
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button style={btnGhost} onClick={reset}>Cancel</button>
            <button style={btnPrimary} onClick={handleSave} disabled={saving}>{saving ? <Loader2 size={14} className="spinner" /> : <><Save size={14} /> {editId ? 'Update' : 'Create'}</>}</button>
          </div>
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {providers.map(p => (
          <div key={p.id} style={{ ...card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'border-color 150ms' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#3b82f6'} onMouseLeave={e => e.currentTarget.style.borderColor = '#1e1e22'}>
            <div><span style={{ fontWeight: 600, color: '#fff' }}>{p.name}</span> <span style={{ fontSize: 12, color: '#71717a', marginLeft: 8 }}>{PROVIDER_TYPES.find(t => t.value === p.provider)?.label}</span>
              {!p.is_active && <span className="badge badge-error" style={{ marginLeft: 8 }}>Disabled</span>}
              {p.models?.length > 0 && <div style={{ marginTop: 6, display: 'flex', gap: 4, flexWrap: 'wrap' }}>{p.models.map(m => <span key={m} style={{ fontSize: 11, background: '#0a0a0a', padding: '2px 6px', borderRadius: 4, color: '#71717a', border: '1px solid #1e1e22' }}>{m}</span>)}</div>}
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button style={btnGhost} onClick={() => startEdit(p)}><Edit3 size={14} /></button>
              <button style={{ ...btnGhost, color: '#ef4444' }} onClick={() => handleDelete(p.id)}><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

function TemplatesTab({ data, api, update, setError, showSuccess }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', blueprintText: '' })
  const templates = data.templates || []

  const handleSave = async () => {
    if (!form.name) { setError('Name required'); return }
    let bp; try { bp = JSON.parse(form.blueprintText) } catch { setError('Invalid JSON'); return }
    const res = await api('/api/admin/templates', 'POST', { name: form.name, description: form.description, blueprint_json: bp })
    if (res) {
      const tpls = await api('/api/admin/templates'); if (tpls) update('templates', tpls)
      showSuccess('Template created'); setShowForm(false); setForm({ name: '', description: '', blueprintText: '' })
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete template?')) return
    await api(`/api/admin/templates/${id}`, 'DELETE')
    update('templates', templates.filter(t => t.id !== id)); showSuccess('Deleted')
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: '#fff' }}>Templates</h2>
        <button style={btnPrimary} onClick={() => setShowForm(!showForm)}><Plus size={14} /> Create</button>
      </div>
      {showForm && (
        <div style={{ ...card, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#fff', margin: 0 }}>New Template</h3>
            <button style={btnGhost} onClick={() => setShowForm(false)}><X size={16} /></button>
          </div>
          <input className="input-field" placeholder="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={{ marginBottom: 12 }} />
          <input className="input-field" placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ marginBottom: 12 }} />
          <textarea className="input-field" placeholder='{"serverName":"...","categories":[],"roles":[]}' value={form.blueprintText} onChange={e => setForm(f => ({ ...f, blueprintText: e.target.value }))} style={{ minHeight: 150, fontFamily: 'monospace', fontSize: 12, marginBottom: 12 }} />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button style={btnGhost} onClick={() => setShowForm(false)}>Cancel</button>
            <button style={btnPrimary} onClick={handleSave}><Save size={14} /> Create</button>
          </div>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {templates.map(t => (
          <div key={t.id} style={{ ...card, transition: 'border-color 150ms' }} onMouseEnter={e => e.currentTarget.style.borderColor = '#3b82f6'} onMouseLeave={e => e.currentTarget.style.borderColor = '#1e1e22'}>
            <div style={{ fontWeight: 600, color: '#fff', marginBottom: 4 }}>{t.name}</div>
            <div style={{ fontSize: 13, color: '#71717a', marginBottom: 8 }}>{t.description || 'No description'}</div>
            <div style={{ display: 'flex', gap: 10, fontSize: 12, color: '#a1a1aa', marginBottom: 12 }}>
              <span>{t.blueprint_json?.categories?.length || 0} categories</span>
              <span>{t.blueprint_json?.roles?.length || 0} roles</span>
            </div>
            <button style={{ ...btnGhost, color: '#ef4444' }} onClick={() => handleDelete(t.id)}><Trash2 size={14} /> Delete</button>
          </div>
        ))}
      </div>
    </>
  )
}

function LogsTab({ data }) {
  const logs = data.logs || []
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: '#fff' }}>Logs ({logs.length})</h2>
        <a href="/api/admin/export/logs" download style={{ ...btnGhost, textDecoration: 'none' }}><Download size={14} /> Export CSV</a>
      </div>
      <div style={{ ...card, overflow: 'hidden', padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ borderBottom: '1px solid #1e1e22' }}>
            {['User', 'Prompt', 'Status', 'Time'].map(h => <th key={h} style={th}>{h}</th>)}
          </tr></thead>
          <tbody>
            {logs.map(l => (
              <tr key={l.id} style={{ borderBottom: '1px solid #1e1e22' }} onMouseEnter={e => e.currentTarget.style.background = '#1a1a1e'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ ...td, color: '#fff', fontWeight: 500 }}>{l.username || '-'}</td>
                <td style={{ ...td, color: '#a1a1aa', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.prompt || '-'}</td>
                <td style={td}><span className={`badge ${l.status === 'success' ? 'badge-success' : 'badge-error'}`}>{l.status}</span></td>
                <td style={{ ...td, color: '#71717a' }}>{l.created_at ? new Date(l.created_at).toLocaleString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

function UsageTab({ data, newLimit, setNewLimit, api, setError, showSuccess, fetchData }) {
  const usage = data.usageLimits || { limit: 50, usage: [] }

  const handleUpdateLimit = async () => {
    const res = await api('/api/admin/usage-limits', 'PUT', { limit: newLimit })
    if (res) { showSuccess('Limit updated'); fetchData() } else { setError('Failed') }
  }

  const handleResetAll = async () => {
    if (!confirm('Reset ALL daily usage?')) return
    await api('/api/admin/reset-usage', 'POST'); showSuccess('All usage reset'); fetchData()
  }

  return (
    <>
      <h2 style={{ fontSize: 20, fontWeight: 600, color: '#fff', marginBottom: 20 }}>Usage Limits</h2>
      <div style={{ ...card, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1 }}><label style={{ fontSize: 12, color: '#71717a', display: 'block', marginBottom: 4 }}>Daily Message Limit</label>
            <input type="number" value={newLimit} onChange={e => setNewLimit(parseInt(e.target.value) || 50)} min={1} max={10000} className="input-field" style={{ width: 120 }} />
          </div>
          <button style={btnPrimary} onClick={handleUpdateLimit}><Save size={14} /> Save</button>
          <button style={{ ...btnDanger, marginLeft: 'auto' }} onClick={handleResetAll}><RotateCcw size={14} /> Reset All Usage</button>
        </div>
      </div>
      <div style={{ ...card }}>
        <div style={{ fontWeight: 600, color: '#fff', marginBottom: 12 }}>Today's Usage</div>
        {(usage.usage || []).length === 0 ? <p style={{ color: '#71717a' }}>No usage today</p> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {(usage.usage || []).map(u => (
              <div key={u.userId} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1e1e22' }}>
                <span style={{ color: '#fff' }}>{u.username}</span>
                <span style={{ color: u.count >= usage.limit ? '#ef4444' : '#a1a1aa' }}>{u.count}/{usage.limit}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

function IpBansTab({ data, api, update, setError, showSuccess }) {
  const [ip, setIp] = useState('')
  const [reason, setReason] = useState('')
  const bans = data.ipBans || []

  const handleBan = async () => {
    if (!ip.trim()) return
    await api('/api/admin/ip-bans', 'POST', { ip: ip.trim(), reason })
    const newBans = await api('/api/admin/ip-bans'); if (newBans) update('ipBans', newBans)
    showSuccess(`IP ${ip} banned`); setIp(''); setReason('')
  }

  const handleUnban = async (bannedIp) => {
    await api(`/api/admin/ip-bans/${encodeURIComponent(bannedIp)}`, 'DELETE')
    update('ipBans', bans.filter(b => b.ip !== bannedIp)); showSuccess(`IP ${bannedIp} unbanned`)
  }

  return (
    <>
      <h2 style={{ fontSize: 20, fontWeight: 600, color: '#fff', marginBottom: 20 }}>IP Bans ({bans.length})</h2>
      <div style={{ ...card, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}><label style={{ fontSize: 12, color: '#71717a', display: 'block', marginBottom: 4 }}>IP Address</label><input className="input-field" placeholder="192.168.1.1" value={ip} onChange={e => setIp(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleBan()} /></div>
          <div style={{ flex: 1 }}><label style={{ fontSize: 12, color: '#71717a', display: 'block', marginBottom: 4 }}>Reason</label><input className="input-field" placeholder="Optional" value={reason} onChange={e => setReason(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleBan()} /></div>
          <button style={btnDanger} onClick={handleBan}><Ban size={14} /> Ban IP</button>
        </div>
      </div>
      <div style={{ ...card, overflow: 'hidden', padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ borderBottom: '1px solid #1e1e22' }}>
            {['IP', 'Reason', 'Date', ''].map(h => <th key={h} style={th}>{h}</th>)}
          </tr></thead>
          <tbody>
            {bans.map(b => (
              <tr key={b.ip} style={{ borderBottom: '1px solid #1e1e22' }} onMouseEnter={e => e.currentTarget.style.background = '#1a1a1e'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={td}><code style={{ fontSize: 12, background: '#0a0a0a', padding: '2px 6px', borderRadius: 4, color: '#ef4444', border: '1px solid #1e1e22' }}>{b.ip}</code></td>
                <td style={{ ...td, color: '#a1a1aa' }}>{b.reason || '-'}</td>
                <td style={{ ...td, color: '#71717a' }}>{b.created_at ? new Date(b.created_at).toLocaleDateString() : '-'}</td>
                <td style={td}><button style={{ ...btnGhost, color: '#22c55e' }} onClick={() => handleUnban(b.ip)}><ShieldOff size={14} /> Unban</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

function SettingsTab({ api, setError, showSuccess }) {
  const handleClearSessions = async () => {
    if (!confirm('Force ALL users to re-login?')) return
    await api('/api/admin/clear-sessions', 'POST'); showSuccess('All sessions cleared')
  }

  return (
    <>
      <h2 style={{ fontSize: 20, fontWeight: 600, color: '#fff', marginBottom: 20 }}>Settings</h2>
      <div style={{ ...card, marginBottom: 16 }}>
        <div style={{ fontWeight: 600, color: '#fff', marginBottom: 12 }}>System</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #1e1e22' }}>
          <div><div style={{ color: '#fff', fontWeight: 500 }}>Maintenance Mode</div><div style={{ fontSize: 13, color: '#71717a' }}>Temporarily disable public access</div></div>
          <div className="toggle-switch" />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
          <div><div style={{ color: '#fff', fontWeight: 500 }}>Allow Registrations</div><div style={{ fontSize: 13, color: '#71717a' }}>Allow new user signups</div></div>
          <div className="toggle-switch active" />
        </div>
      </div>
      <div style={{ ...card, border: '1px solid rgba(239,68,68,0.2)' }}>
        <div style={{ fontWeight: 600, color: '#ef4444', marginBottom: 12 }}>Danger Zone</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><div style={{ color: '#fff', fontWeight: 500 }}>Clear All Sessions</div><div style={{ fontSize: 13, color: '#71717a' }}>Force everyone to re-login</div></div>
          <button style={btnDanger} onClick={handleClearSessions}><Trash2 size={14} /> Clear Sessions</button>
        </div>
      </div>
    </>
  )
}

function Modal({ title, children, onClose, wide }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div style={{ background: '#111113', border: '1px solid #1e1e22', borderRadius: 16, padding: 24, width: wide ? 600 : 420, maxWidth: '90vw', maxHeight: '80vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: '#fff', margin: 0 }}>{title}</h3>
          <button style={btnGhost} onClick={onClose}><X size={16} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}
