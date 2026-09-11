import React, { useState } from 'react'
import { useChat } from '../contexts/ChatContext'
import { useAuth } from '../contexts/AuthContext'
import { Loader2, Copy, Check, ExternalLink } from 'lucide-react'

export default function BlueprintPreview() {
  const { blueprint, setBlueprint } = useChat()
  const { token } = useAuth()
  const [deployInfo, setDeployInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState(null)

  if (!blueprint) return null

  const handleGetCode = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/blueprint/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          blueprint,
          serverName: blueprint.serverName || blueprint.name
        })
      })
      if (res.ok) {
        const data = await res.json()
        setDeployInfo(data)
      } else {
        const err = await res.json().catch(() => ({}))
        setError(err.error || 'Failed to generate code')
      }
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyCode = () => {
    if (deployInfo?.code) {
      navigator.clipboard.writeText(deployInfo.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const renderTree = () => {
    if (!blueprint.categories) return null
    return blueprint.categories.map((cat, ci) => {
      const isLastCat = ci === blueprint.categories.length - 1
      const catChar = isLastCat ? '└── ' : '├── '
      const catLines = [
        <span key={`cat-${ci}`}><span className="tree-char">{catChar}</span><span className="category">{cat.name}</span></span>
      ]
      if (cat.channels) {
        cat.channels.forEach((ch, chi) => {
          const isLastCh = chi === cat.channels.length - 1
          const chPrefix = isLastCat ? '    ' : '│   '
          const chChar = isLastCh ? '└── ' : '├── '
          catLines.push(
            <span key={`ch-${ci}-${chi}`}><span className="tree-char">{chPrefix}{chChar}</span><span className="channel">#{ch.name}</span>{ch.type && ch.type !== 'text' ? <span className="tree-char"> ({ch.type})</span> : null}</span>
          )
        })
      }
      return catLines
    }).flat()
  }

  return (
    <div className="blueprint-preview slide-up">
      <div className="blueprint-card">
        <div className="blueprint-header">
          <h3>Server Blueprint</h3>
          {!deployInfo && <span className="badge badge-success">Ready</span>}
          {deployInfo && <span className="badge" style={{ background: '#5865F2', color: 'white' }}>Deploy Code Generated</span>}
        </div>
        <div className="blueprint-body">
          {(blueprint.serverName || blueprint.name) && (
            <div className="blueprint-section">
              <div className="blueprint-section-title">Server Name</div>
              <div style={{ fontSize: 15, color: 'var(--text-primary)' }}>{blueprint.serverName || blueprint.name}</div>
            </div>
          )}
          {blueprint.description && (
            <div className="blueprint-section">
              <div className="blueprint-section-title">Description</div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{blueprint.description}</div>
            </div>
          )}
          {blueprint.categories && blueprint.categories.length > 0 && (
            <div className="blueprint-section">
              <div className="blueprint-section-title">Structure</div>
              <div className="blueprint-tree">{renderTree()}</div>
            </div>
          )}
          {blueprint.roles && blueprint.roles.length > 0 && (
            <div className="blueprint-section">
              <div className="blueprint-section-title">Roles</div>
              <div className="blueprint-tree">
                {blueprint.roles.map((role, i) => (
                  <span key={i}>
                    <span className="tree-char">{i === blueprint.roles.length - 1 ? '└── ' : '├── '}</span>
                    <span className="role">@{role.name}</span>
                    {role.color && <span className="tree-char"> ({role.color})</span>}
                  </span>
                ))}
              </div>
            </div>
          )}

          {deployInfo && (
            <div className="blueprint-section" style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: 16, marginTop: 8 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>
                How to deploy
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ minWidth: 24, height: 24, borderRadius: '50%', background: '#5865F2', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>1</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>Invite the bot to your server</div>
                    <a
                      href={deployInfo.inviteURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#5865F2', marginTop: 4, textDecoration: 'none' }}
                    >
                      Open invite link <ExternalLink size={12} />
                    </a>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ minWidth: 24, height: 24, borderRadius: '50%', background: '#5865F2', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>2</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>In your Discord server, type:</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', border: '1px solid var(--border-color)' }}>
                      <code style={{ fontSize: 14, color: '#5865F2', fontFamily: 'monospace', letterSpacing: 1 }}>/load {deployInfo.code}</code>
                      <button
                        onClick={handleCopyCode}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}
                        title="Copy code"
                      >
                        {copied ? <Check size={14} style={{ color: '#22c55e' }} /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>
                Code expires in 24 hours
              </div>
            </div>
          )}

          {error && (
            <div style={{ padding: 12, borderRadius: 'var(--radius-sm)', background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: 13, marginTop: 8 }}>
              {error}
            </div>
          )}
        </div>

        <div className="blueprint-actions">
          <button className="btn btn-ghost" onClick={() => { setBlueprint(null); setDeployInfo(null) }}>Cancel</button>
          {!deployInfo ? (
            <button
              className="btn btn-primary"
              onClick={handleGetCode}
              disabled={loading}
            >
              {loading ? <><Loader2 size={14} className="spinner" /> Generating...</> : 'Get Deploy Code'}
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={() => { setBlueprint(null); setDeployInfo(null) }}
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
