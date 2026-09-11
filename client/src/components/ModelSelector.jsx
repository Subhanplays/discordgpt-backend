import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

const models = [
  { id: 'discordgpt', name: 'DiscordGPT', desc: 'Optimized for server building' },
  { id: 'gpt4', name: 'GPT-4', desc: 'Most capable model' },
  { id: 'claude', name: 'Claude', desc: 'Anthropic\'s assistant' }
]

export default function ModelSelector({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const current = models.find(m => m.id === value) || models[0]

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button className="model-selector" onClick={() => setOpen(!open)}>
        {current.name}
        <ChevronDown size={14} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', bottom: 'calc(100% + 4px)', right: 0,
          background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)', padding: '4px', minWidth: '200px',
          boxShadow: 'var(--shadow-lg)', zIndex: 50, animation: 'slideUp 150ms ease'
        }}>
          {models.map((m) => (
            <button
              key={m.id}
              onClick={() => { onChange(m.id); setOpen(false) }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                width: '100%', padding: '8px 12px', background: value === m.id ? 'var(--accent-subtle)' : 'transparent',
                border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                color: 'var(--text-primary)', fontSize: '14px', fontFamily: 'var(--font-family)',
                textAlign: 'left', transition: 'background 150ms ease'
              }}
            >
              <div>
                <div style={{ fontWeight: 500 }}>{m.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{m.desc}</div>
              </div>
              {value === m.id && <Check size={16} color="var(--accent)" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
