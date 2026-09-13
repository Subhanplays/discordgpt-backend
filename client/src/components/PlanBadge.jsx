import React from 'react'

const PLAN_STYLES = {
  free: { bg: 'rgba(113,113,122,0.15)', color: '#a1a1aa', border: 'rgba(113,113,122,0.3)' },
  pro: { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6', border: 'rgba(59,130,246,0.3)' },
  enterprise: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: 'rgba(245,158,11,0.3)' }
}

export default function PlanBadge({ plan }) {
  const id = plan?.id || plan?.name || 'free'
  const s = PLAN_STYLES[id] || PLAN_STYLES.free
  const label = plan?.display_name || plan?.name || 'Free'

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 6,
      fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em',
      background: s.bg, color: s.color, border: `1px solid ${s.border}`
    }}>
      {label}
    </span>
  )
}
