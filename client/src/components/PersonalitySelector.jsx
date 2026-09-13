import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Briefcase, Smile, Cpu } from 'lucide-react'

const PERSONALITIES = [
  {
    id: 'professional',
    label: 'Professional',
    icon: Briefcase,
    description: 'Formal, detailed responses'
  },
  {
    id: 'casual',
    label: 'Casual',
    icon: Smile,
    description: 'Friendly, relaxed tone'
  },
  {
    id: 'expert',
    label: 'Expert',
    icon: Cpu,
    description: 'Technical, concise'
  }
]

export default function PersonalitySelector({ selected, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const current = PERSONALITIES.find(p => p.id === selected) || PERSONALITIES[0]
  const Icon = current.icon

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="personality-selector" ref={ref}>
      <button
        className="personality-trigger"
        onClick={() => setOpen(!open)}
        title="AI Personality"
        aria-label="Select AI personality"
      >
        <Icon size={14} />
        <span className="personality-trigger-label">{current.label}</span>
        <ChevronDown size={12} />
      </button>
      {open && (
        <div className="personality-dropdown">
          {PERSONALITIES.map(p => {
            const PIcon = p.icon
            return (
              <button
                key={p.id}
                className={`personality-dropdown-item ${selected === p.id ? 'active' : ''}`}
                onClick={() => { onChange(p.id); setOpen(false) }}
              >
                <PIcon size={16} />
                <div>
                  <div className="personality-dropdown-name">{p.label}</div>
                  <div className="personality-dropdown-desc">{p.description}</div>
                </div>
                {selected === p.id && <span className="personality-dropdown-check">&#10003;</span>}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
