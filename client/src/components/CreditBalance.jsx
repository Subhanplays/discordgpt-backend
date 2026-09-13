import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap } from 'lucide-react'

export default function CreditBalance({ user }) {
  const navigate = useNavigate()
  const balance = user?.credits_balance ?? 0
  const isLow = balance > 0 && balance <= 5
  const isZero = balance === 0

  return (
    <button
      onClick={() => navigate('/billing')}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '6px 12px', borderRadius: 8,
        background: isZero ? 'rgba(239,68,68,0.1)' : isLow ? 'rgba(245,158,11,0.1)' : 'rgba(59,130,246,0.1)',
        border: `1px solid ${isZero ? 'rgba(239,68,68,0.2)' : isLow ? 'rgba(245,158,11,0.2)' : 'rgba(59,130,246,0.2)'}`,
        color: isZero ? '#ef4444' : isLow ? '#f59e0b' : '#3b82f6',
        fontSize: 13, fontWeight: 500, cursor: 'pointer',
        fontFamily: 'inherit', transition: 'all 150ms'
      }}
      title="View billing & credits"
    >
      <Zap size={14} />
      <span>{balance}</span>
    </button>
  )
}
