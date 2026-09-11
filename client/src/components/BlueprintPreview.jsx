import React from 'react'
import { useChat } from '../contexts/ChatContext'

export default function BlueprintPreview() {
  const { blueprint, setBlueprint } = useChat()

  if (!blueprint) return null

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
          {blueprint.name && (
            <div className="blueprint-section">
              <div className="blueprint-section-title">Server Name</div>
              <div style={{ fontSize: '15px', color: 'var(--text-primary)' }}>{blueprint.name}</div>
            </div>
          )}
          {blueprint.description && (
            <div className="blueprint-section">
              <div className="blueprint-section-title">Description</div>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{blueprint.description}</div>
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
        <div className="blueprint-actions">
          <button className="btn btn-ghost" onClick={() => setBlueprint(null)}>Cancel</button>
          <button className="btn btn-secondary">Edit Blueprint</button>
          <button className="btn btn-primary">Create Server</button>
        </div>
      </div>
    </div>
  )
}
