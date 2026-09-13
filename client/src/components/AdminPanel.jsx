import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  LayoutDashboard, Users, Bot, FileText, Settings, Activity,
  AlertCircle, ArrowLeft, BarChart3, Sparkles, Plus, Trash2,
  Edit3, Power, PowerOff, Save, X, Loader2, Server, Copy
} from 'lucide-react'

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'bots', label: 'Bots', icon: Bot },
  { id: 'ai', label: 'AI Providers', icon: Sparkles },
  { id: 'templates', label: 'Templates', icon: FileText },
  { id: 'logs', label: 'Logs', icon: Activity },
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [statsRes, usersRes, botsRes, logsRes, aiRes, tplRes] = await Promise.all([
        fetch('/api/admin/stats', { headers }),
        fetch('/api/admin/users', { headers }),
        fetch('/api/admin/bots', { headers }),
        fetch('/api/admin/logs?limit=50', { headers }),
        fetch('/api/admin/ai-providers', { headers }),
        fetch('/api/admin/templates', { headers })
      ])

      if (statsRes.ok) setStats(await statsRes.json())
      if (usersRes.ok) setUsers(await usersRes.json())
      if (botsRes.ok) setBots(await botsRes.json())
      if (logsRes.ok) setLogs(await logsRes.json())
      if (aiRes.ok) setAiProviders(await aiRes.json())
      if (tplRes.ok) setTemplates(await tplRes.json())
    } catch (e) {
      setError('Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { fetchData() }, [fetchData])

  const handleDisableUser = async (userId) => {
    try {
      await fetch(`/api/admin/users/${userId}/disable`, { method: 'PUT', headers })
      setUsers(users.filter(u => u.id !== userId))
    } catch (e) {
      setError('Failed to disable user')
    }
  }

  const handleDeleteTemplate = async (id) => {
    if (!confirm('Delete this template?')) return
    try {
      await fetch(`/api/admin/templates/${id}`, { method: 'DELETE', headers })
      setTemplates(templates.filter(t => t.id !== id))
    } catch (e) {
      setError('Failed to delete template')
    }
  }

  const handleDeleteAiProvider = async (id) => {
    if (!confirm('Delete this AI provider?')) return
    try {
      await fetch(`/api/admin/ai-providers/${id}`, { method: 'DELETE', headers })
      setAiProviders(aiProviders.filter(p => p.id !== id))
    } catch (e) {
      setError('Failed to delete provider')
    }
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/logo.svg" alt="" className="admin-logo" />
            <h2>DiscordGPT Admin</h2>
          </div>
        </div>
        <nav className="admin-sidebar-nav">
          <button className="admin-nav-item" onClick={() => navigate('/')}>
            <ArrowLeft size={18} /> Back to App
          </button>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`admin-nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <button className="admin-nav-item" onClick={() => { logout(); navigate('/') }}>
            <PowerOff size={18} /> Log Out
          </button>
        </nav>
      </aside>

      <main className="admin-main">
        {error && (
          <div className="auth-error" style={{ marginBottom: 16 }}>{error}
            <button onClick={() => setError('')} style={{ marginLeft: 8, background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}><X size={14} /></button>
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', color: 'var(--text-muted)', gap: 8 }}>
            <Loader2 size={20} className="spinner" /> Loading...
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <>
                <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Dashboard</h1>
                <div className="admin-stats">
                  {[
                    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'var(--accent)' },
                    { label: 'Connected Bots', value: stats?.totalBots || 0, icon: Bot, color: 'var(--success)' },
                    { label: 'Servers Generated', value: stats?.totalServers || 0, icon: Server, color: 'var(--warning)' },
                    { label: 'Templates', value: stats?.totalTemplates || 0, icon: FileText, color: '#ec4899' },
                    { label: 'AI Providers', value: stats?.totalAiProviders || 0, icon: Sparkles, color: '#06b6d4' },
                    { label: 'AI Requests', value: stats?.totalAiRequests || 0, icon: Activity, color: 'var(--error)' }
                  ].map((stat, i) => (
                    <div key={i} className="stat-card">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div className="stat-card-label">{stat.label}</div>
                        <stat.icon size={16} style={{ color: stat.color }} />
                      </div>
                      <div className="stat-card-value">{stat.value}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Activity (Last 7 Days)</h3>
                  <div className="chart-placeholder">
                    {[40, 65, 45, 80, 55, 70, 90].map((h, i) => (
                      <div key={i} className="chart-bar" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'users' && (
              <>
                <div className="admin-section-header">
                  <h2>Users</h2>
                  <span className="badge badge-default">{users.length} total</span>
                </div>
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Joined</th>
                        <th>Last Login</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id}>
                          <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{u.username}</td>
                          <td>{u.email}</td>
                          <td><span className={`badge ${u.role === 'admin' ? 'badge-warning' : 'badge-default'}`}>{u.role}</span></td>
                          <td>{u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}</td>
                          <td>{u.last_login ? new Date(u.last_login).toLocaleDateString() : 'Never'}</td>
                          <td>
                            {u.role !== 'admin' && (
                              <button className="btn btn-danger btn-sm" onClick={() => handleDisableUser(u.id)}>
                                Disable
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {users.length === 0 && (
                        <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No users found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {activeTab === 'bots' && (
              <>
                <div className="admin-section-header">
                  <h2>Bot Connections</h2>
                  <span className="badge badge-default">{bots.length} connected</span>
                </div>
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Bot</th>
                        <th>Bot ID</th>
                        <th>Owner</th>
                        <th>Status</th>
                        <th>Connected</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bots.map((b) => (
                        <tr key={b.id}>
                          <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{b.bot_username || 'Unknown'}</td>
                          <td><code style={{ fontSize: 12, background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: 4 }}>{b.bot_id || '-'}</code></td>
                          <td>{b.username || '-'}</td>
                          <td><span className={`badge ${b.is_active ? 'badge-success' : 'badge-error'}`}>{b.is_active ? 'Active' : 'Inactive'}</span></td>
                          <td>{b.created_at ? new Date(b.created_at).toLocaleDateString() : '-'}</td>
                        </tr>
                      ))}
                      {bots.length === 0 && (
                        <tr><td colSpan={5} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No bots connected</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {activeTab === 'ai' && (
              <AiProvidersTab
                providers={aiProviders}
                setProviders={setAiProviders}
                token={token}
                headers={headers}
                onDelete={handleDeleteAiProvider}
                setError={setError}
              />
            )}

            {activeTab === 'templates' && (
              <TemplatesTab
                templates={templates}
                setTemplates={setTemplates}
                token={token}
                headers={headers}
                onDelete={handleDeleteTemplate}
                setError={setError}
              />
            )}

            {activeTab === 'logs' && (
              <>
                <div className="admin-section-header">
                  <h2>Generation Logs</h2>
                  <span className="badge badge-default">{logs.length} entries</span>
                </div>
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Prompt</th>
                        <th>Status</th>
                        <th>Duration</th>
                        <th>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log) => (
                        <tr key={log.id}>
                          <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{log.username || '-'}</td>
                          <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.prompt || '-'}</td>
                          <td><span className={`badge ${log.status === 'success' ? 'badge-success' : log.status === 'error' ? 'badge-error' : 'badge-warning'}`}>{log.status}</span></td>
                          <td>{log.duration_ms ? `${log.duration_ms}ms` : '-'}</td>
                          <td>{log.created_at ? new Date(log.created_at).toLocaleString() : '-'}</td>
                        </tr>
                      ))}
                      {logs.length === 0 && (
                        <tr><td colSpan={5} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No logs yet</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {activeTab === 'settings' && (
              <>
                <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Admin Settings</h1>
                <div className="settings-section">
                  <div className="settings-section-title">System</div>
                  <div className="settings-row">
                    <div>
                      <div className="settings-row-label">Maintenance Mode</div>
                      <div className="settings-row-desc">Temporarily disable public access</div>
                    </div>
                    <div className="toggle-switch" />
                  </div>
                  <div className="settings-row">
                    <div>
                      <div className="settings-row-label">Allow New Registrations</div>
                      <div className="settings-row-desc">Allow new users to create accounts</div>
                    </div>
                    <div className="toggle-switch active" />
                  </div>
                </div>
                <div className="settings-section">
                  <div className="settings-section-title">Danger Zone</div>
                  <div className="settings-row">
                    <div>
                      <div className="settings-row-label">Clear All Sessions</div>
                      <div className="settings-row-desc">Force all users to re-login</div>
                    </div>
                    <button className="btn btn-danger btn-sm">Clear Sessions</button>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  )
}

function AiProvidersTab({ providers, setProviders, token, headers, onDelete, setError }) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ name: '', provider: 'openai', api_key: '', base_url: '', models: [] })
  const [saving, setSaving] = useState(false)

  const resetForm = () => {
    setForm({ name: '', provider: 'openai', api_key: '', base_url: '', models: [] })
    setEditingId(null)
    setShowForm(false)
  }

  const startEdit = (p) => {
    setForm({ name: p.name, provider: p.provider, api_key: '', base_url: p.base_url || '', models: p.models || [] })
    setEditingId(p.id)
    setShowForm(true)
  }

  const handleProviderChange = (provider) => {
    setForm(f => ({ ...f, provider, models: DEFAULT_MODELS[provider] || [] }))
  }

  const toggleModel = (model) => {
    setForm(f => ({
      ...f,
      models: f.models.includes(model) ? f.models.filter(m => m !== model) : [...f.models, model]
    }))
  }

  const handleSave = async () => {
    if (!form.name || !form.provider) {
      setError('Name and provider are required')
      return
    }
    setSaving(true)
    try {
      const body = { ...form }
      if (!body.api_key) delete body.api_key
      const url = editingId ? `/api/admin/ai-providers/${editingId}` : '/api/admin/ai-providers'
      const method = editingId ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers, body: JSON.stringify(body) })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to save')
      }
      const saved = await res.json()
      if (editingId) {
        setProviders(providers.map(p => p.id === editingId ? { ...p, ...saved, api_key: saved.api_key || '***' + saved.api_key?.slice(-4) } : p))
      } else {
        setProviders([saved, ...providers])
      }
      resetForm()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="admin-section-header">
        <h2>AI Providers</h2>
        <button className="btn btn-primary btn-sm" onClick={() => { resetForm(); setShowForm(true) }}>
          <Plus size={14} /> Add Provider
        </button>
      </div>

      {showForm && (
        <div className="admin-template-form">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3>{editingId ? 'Edit AI Provider' : 'Add AI Provider'}</h3>
            <button className="btn btn-ghost btn-sm" onClick={resetForm}><X size={16} /></button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="input-group">
              <label className="input-label">Provider Name</label>
              <input className="input-field" placeholder="My OpenAI" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="input-group">
              <label className="input-label">Provider Type</label>
              <select className="settings-select" style={{ width: '100%' }} value={form.provider} onChange={e => handleProviderChange(e.target.value)}>
                {PROVIDER_TYPES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">API Key {editingId && '(leave blank to keep current)'}</label>
            <input className="input-field" type="password" placeholder="sk-..." value={form.api_key} onChange={e => setForm(f => ({ ...f, api_key: e.target.value }))} />
          </div>

          {form.provider === 'custom' && (
            <div className="input-group">
              <label className="input-label">Base URL</label>
              <input className="input-field" placeholder="https://api.example.com/v1" value={form.base_url} onChange={e => setForm(f => ({ ...f, base_url: e.target.value }))} />
            </div>
          )}

          {DEFAULT_MODELS[form.provider]?.length > 0 && (
            <div className="input-group">
              <label className="input-label">Models</label>
              <div className="ai-provider-models">
                {DEFAULT_MODELS[form.provider].map(m => (
                  <button key={m} className={`ai-provider-model ${form.models.includes(m) ? 'active' : ''}`} onClick={() => toggleModel(m)}>
                    {m}
                  </button>
                ))}
              </div>
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

      {providers.map(p => (
        <div key={p.id} className="ai-provider-card">
          <div className="ai-provider-header">
            <div className="ai-provider-name">
              {p.name}
              <span className="ai-provider-type">{PROVIDER_TYPES.find(t => t.value === p.provider)?.label || p.provider}</span>
              {!p.is_active && <span className="badge badge-error" style={{ marginLeft: 4 }}>Disabled</span>}
            </div>
            <div className="ai-provider-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => startEdit(p)} title="Edit"><Edit3 size={14} /></button>
              <button className="btn btn-ghost btn-sm" onClick={() => onDelete(p.id)} title="Delete" style={{ color: 'var(--error)' }}><Trash2 size={14} /></button>
            </div>
          </div>
          {p.api_key && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>API Key: {p.api_key}</div>}
          {p.models?.length > 0 && (
            <div className="ai-provider-models">
              {p.models.map(m => <span key={m} className="ai-provider-model">{m}</span>)}
            </div>
          )}
        </div>
      ))}

      {providers.length === 0 && !showForm && (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
          <Sparkles size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
          <p>No AI providers configured yet.</p>
          <p style={{ fontSize: 13 }}>Add one to enable AI-powered server generation.</p>
        </div>
      )}
    </>
  )
}

function TemplatesTab({ templates, setTemplates, token, headers, onDelete, setError }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', blueprint_json: '' })
  const [saving, setSaving] = useState(false)
  const [blueprintText, setBlueprintText] = useState('')

  const handleSave = async () => {
    if (!form.name) {
      setError('Template name is required')
      return
    }
    let blueprint
    try {
      blueprint = JSON.parse(blueprintText || form.blueprint_json)
    } catch {
      setError('Invalid JSON in blueprint')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/templates', {
        method: 'POST',
        headers,
        body: JSON.stringify({ name: form.name, description: form.description, blueprint_json: blueprint })
      })
      if (!res.ok) throw new Error('Failed to create')
      const saved = await res.json()
      setTemplates([saved, ...templates])
      setForm({ name: '', description: '', blueprint_json: '' })
      setBlueprintText('')
      setShowForm(false)
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const duplicateTemplate = async (t) => {
    try {
      const res = await fetch('/api/admin/templates', {
        method: 'POST',
        headers,
        body: JSON.stringify({ name: t.name + ' (Copy)', description: t.description, blueprint_json: t.blueprint_json })
      })
      if (!res.ok) throw new Error('Failed to duplicate')
      const saved = await res.json()
      setTemplates([saved, ...templates])
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <>
      <div className="admin-section-header">
        <h2>Templates</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
          <Plus size={14} /> Create Template
        </button>
      </div>

      {showForm && (
        <div className="admin-template-form">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3>Create Template</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}><X size={16} /></button>
          </div>
          <div className="input-group">
            <label className="input-label">Template Name</label>
            <input className="input-field" placeholder="Minecraft Hosting Server" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="input-group">
            <label className="input-label">Description</label>
            <input className="input-field" placeholder="A professional Minecraft hosting server template" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="input-group">
            <label className="input-label">Blueprint JSON</label>
            <textarea className="textarea-field" style={{ minHeight: 200, fontFamily: 'monospace', fontSize: 12 }} placeholder={'{"server":{"name":"My Server"},"roles":[],"categories":[],"channels":[]}'} value={blueprintText} onChange={e => setBlueprintText(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
              {saving ? <><Loader2 size={14} className="spinner" /> Saving...</> : <><Save size={14} /> Create</>}
            </button>
          </div>
        </div>
      )}

      <div className="template-grid">
        {templates.map(t => (
          <div key={t.id} className="template-card">
            <div className="template-card-name">{t.name}</div>
            <div className="template-card-desc">{t.description || 'No description'}</div>
            <div className="template-card-meta">
              <span>{t.blueprint_json?.categories?.length || 0} categories</span>
              <span>{t.blueprint_json?.channels?.length || 0} channels</span>
              <span>{t.blueprint_json?.roles?.length || 0} roles</span>
            </div>
            <div className="template-card-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => duplicateTemplate(t)}><Copy size={14} /> Duplicate</button>
              <button className="btn btn-ghost btn-sm" onClick={() => onDelete(t.id)} style={{ color: 'var(--error)' }}><Trash2 size={14} /> Delete</button>
            </div>
          </div>
        ))}
      </div>

      {templates.length === 0 && !showForm && (
        <div className="template-empty">
          <FileText size={48} />
          <p>No templates created yet.</p>
          <p style={{ fontSize: 13 }}>Create a template from the blueprint generator or manually here.</p>
        </div>
      )}
    </>
  )
}
