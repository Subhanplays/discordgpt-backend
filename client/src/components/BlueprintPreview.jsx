import React, { useEffect, useState } from 'react'
import { useChat } from '../contexts/ChatContext'
import { Loader2, AlertTriangle } from 'lucide-react'
import ServerSelect from './ServerSelect'
import BotSetup from './BotSetup'

export default function BlueprintPreview() {
  const { blueprint, setBlueprint, createServer, botConnected, selectedServer, creationProgress, connectBot } = useChat()
  const [creating, setCreating] = useState(false)
  const [showBotSetup, setShowBotSetup] = useState(false)

  if (!blueprint) return null

  const handleCreate = async () => {
    setCreating(true)
    await createServer(blueprint)
    setCreating(false)
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
          <span className="badge badge-success">Ready</span>
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
        </div>

        {!botConnected && (
          <div style={{ padding: '12px 24px', background: 'rgba(245,158,11,0.1)', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--warning)', marginBottom: 10 }}>
              <AlertTriangle size={16} />
              Connect your Discord bot first to create this server.
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setShowBotSetup(true)}>
              Connect Discord Bot
            </button>
          </div>
        )}

        {botConnected && (
          <div style={{ padding: '12px 24px', borderTop: '1px solid var(--border-color)' }}>
            <ServerSelect compact />
          </div>
        )}

        <div className="blueprint-actions">
          <button className="btn btn-ghost" onClick={() => setBlueprint(null)}>Cancel</button>
          <button
            className="btn btn-primary"
            onClick={handleCreate}
            disabled={creating || !botConnected || !selectedServer || (creationProgress && creationProgress.status !== 'error')}
          >
            {creating ? <><Loader2 size={14} className="spinner" /> Queuing...</> : 'Create Server'}
          </button>
        </div>
      </div>

      {showBotSetup && !botConnected && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, background: 'rgba(0,0,0,0.5)' }}>
          <BotSetup onComplete={() => setShowBotSetup(false)} />
        </div>
      )}
    </div>
  )
}
