import React, { useState } from 'react'
import { ChevronDown, RotateCcw } from 'lucide-react'

export default function BlueprintVersionSelector({ versions, activeVersion, onRestore }) {
  const [open, setOpen] = useState(false)

  if (!versions || versions.length < 2) return null

  return (
    <div className="bp-version-selector">
      <button className="bp-version-toggle" onClick={() => setOpen(!open)}>
        <span>Version {activeVersion || versions.length}</span>
        <ChevronDown size={14} />
      </button>
      {open && (
        <div className="bp-version-dropdown">
          {versions.map((v, i) => (
            <button
              key={i}
              className={`bp-version-item ${(activeVersion || versions.length) === i + 1 ? 'active' : ''}`}
              onClick={() => { onRestore?.(i); setOpen(false) }}
            >
              <span>Version {i + 1}</span>
              {v.timestamp && <span className="bp-version-time">{new Date(v.timestamp).toLocaleString()}</span>}
              {i < (activeVersion || versions.length) - 1 && <RotateCcw size={12} />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
