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
        <img src="/logo.svg" alt="" style={{ width: 14, height: 14, borderRadius: 3, color: 'var(--text)' }} />
        {current.name}
        <ChevronDown size={14} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', bottom: 'calc(100% + 4px)', right: 0,
          background: '#111113', border: '1px solid #1e1e22',
          borderRadius: 10, padding: '4px', minWidth: '220px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)', zIndex: 50, animation: 'slideUp 150ms ease'
        }}>
          {models.map((m) => (
            <button
              key={m.id}
              onClick={() => { onChange(m.id); setOpen(false) }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                width: '100%', padding: '10px 12px',
                background: value === m.id ? 'rgba(59,130,246,0.1)' : 'transparent',
                border: 'none', borderRadius: 8, cursor: 'pointer',
                color: '#ffffff', fontSize: '14px', fontFamily: 'var(--font-family)',
                textAlign: 'left', transition: 'background 150ms ease'
              }}
            >
              <div>
                <div style={{ fontWeight: 500 }}>{m.name}</div>
                <div style={{ fontSize: '12px', color: '#71717a' }}>{m.desc}</div>
              </div>
              {value === m.id && <Check size={16} color="#3b82f6" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
