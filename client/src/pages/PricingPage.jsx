import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Check, Zap, Crown, Building2, Loader2 } from 'lucide-react'

const PLAN_ICONS = { free: Zap, pro: Crown, enterprise: Building2 }
const PLAN_COLORS = { free: '#71717a', pro: '#3b82f6', enterprise: '#f59e0b' }

export default function PricingPage() {
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState(null)

  useEffect(() => {
    fetch('/api/billing/plans')
      .then(r => r.json())
      .then(data => { setPlans(Array.isArray(data) ? data : []) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleUpgrade = async (planId) => {
    if (planId === 'free') return
    setCheckoutLoading(planId)
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ planId })
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || 'Failed to start checkout')
      }
    } catch {
      alert('Network error')
    } finally {
      setCheckoutLoading(null)
    }
  }

  const features = {
    free: ['50 credits/month', '3 server blueprints', 'Basic AI models', 'Community support'],
    pro: ['500 credits/month', '25 server blueprints', 'All AI providers', 'Priority support', 'Advanced blueprints'],
    enterprise: ['5,000 credits/month', 'Unlimited blueprints', 'All AI providers', 'Dedicated support', 'Custom integrations', 'SLA guarantee']
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px 32px', borderBottom: '1px solid #1e1e22' }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' }}>
          ← Back to Chat
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 24px' }}>
        <h1 style={{ fontSize: 36, fontWeight: 700, color: '#fff', marginBottom: 8, textAlign: 'center' }}>Choose Your Plan</h1>
        <p style={{ fontSize: 16, color: '#71717a', marginBottom: 48, textAlign: 'center', maxWidth: 500 }}>
          Pay for what you use. Each AI message costs 1 credit.
        </p>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#71717a' }}><Loader2 size={20} className="spinner" /> Loading plans...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, maxWidth: 1000, width: '100%' }}>
            {plans.map(plan => {
              const Icon = PLAN_ICONS[plan.name] || Zap
              const color = PLAN_COLORS[plan.name] || '#71717a'
              const isCurrent = user?.plan_id === plan.name
              const isPopular = plan.name === 'pro'

              return (
                <div key={plan.id} style={{
                  background: '#111113',
                  border: `2px solid ${isCurrent ? color : isPopular ? 'rgba(59,130,246,0.3)' : '#1e1e22'}`,
                  borderRadius: 16,
                  padding: 32,
                  position: 'relative',
                  transition: 'border-color 150ms, transform 150ms',
                  display: 'flex',
                  flexDirection: 'column'
                }} onMouseEnter={e => e.currentTarget.style.borderColor = color} onMouseLeave={e => e.currentTarget.style.borderColor = isCurrent ? color : isPopular ? 'rgba(59,130,246,0.3)' : '#1e1e22'}>
                  {isPopular && (
                    <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#3b82f6', color: '#fff', fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 20, textTransform: 'uppercase' }}>Most Popular</div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={20} style={{ color }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 600, color: '#fff' }}>{plan.display_name}</div>
                    </div>
                  </div>

                  <div style={{ marginBottom: 24 }}>
                    <span style={{ fontSize: 36, fontWeight: 700, color: '#fff' }}>
                      {plan.credit_price_cents === 0 ? 'Free' : `$${(plan.credit_price_cents / 100).toFixed(2)}`}
                    </span>
                    {plan.credit_price_cents > 0 && <span style={{ fontSize: 14, color: '#71717a' }}>/credit</span>}
                  </div>

                  <div style={{ fontSize: 14, color: '#a1a1aa', marginBottom: 24, lineHeight: 1.6 }}>
                    {plan.credits_per_month} credits/month included
                  </div>

                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, marginBottom: 32, flex: 1 }}>
                    {(features[plan.name] || []).map((f, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: 14, color: '#d4d4d8' }}>
                        <Check size={16} style={{ color, flexShrink: 0 }} /> {f}
                      </li>
                    ))}
                  </ul>

                  {isCurrent ? (
                    <button disabled style={{
                      width: '100%', padding: '12px 0', borderRadius: 10, border: `1px solid ${color}`, background: 'transparent',
                      color: color, fontSize: 14, fontWeight: 500, cursor: 'default', fontFamily: 'inherit'
                    }}>Current Plan</button>
                  ) : (
                    <button onClick={() => handleUpgrade(plan.id)} disabled={checkoutLoading === plan.id} style={{
                      width: '100%', padding: '12px 0', borderRadius: 10, border: 'none',
                      background: isPopular ? '#3b82f6' : color, color: '#fff', fontSize: 14, fontWeight: 500,
                      cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      opacity: checkoutLoading === plan.id ? 0.7 : 1
                    }}>
                      {checkoutLoading === plan.id ? <><Loader2 size={16} className="spinner" /> Processing...</> : plan.name === 'free' ? 'Downgrade' : 'Upgrade'}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
