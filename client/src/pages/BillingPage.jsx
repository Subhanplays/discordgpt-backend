import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { CreditCard, Package, History, ArrowLeft, Loader2, Zap, ExternalLink } from 'lucide-react'

const CREDIT_PACKS = [
  { id: 'credits_100', credits: 100, priceCents: 200, label: '100 Credits', price: '$2.00' },
  { id: 'credits_500', credits: 500, priceCents: 900, label: '500 Credits', price: '$9.00' },
  { id: 'credits_1000', credits: 1000, priceCents: 1600, label: '1,000 Credits', price: '$16.00' }
]

export default function BillingPage() {
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [sub, setSub] = useState(null)
  const [loading, setLoading] = useState(true)
  const [buyingPack, setBuyingPack] = useState(null)

  const fetchSub = useCallback(async () => {
    try {
      const res = await fetch('/api/billing/subscription', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) setSub(await res.json())
    } catch {} finally { setLoading(false) }
  }, [token])

  useEffect(() => { fetchSub() }, [fetchSub])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('session_id')) {
      setTimeout(fetchSub, 2000)
      window.history.replaceState({}, '', '/billing')
    }
  }, [fetchSub])

  const handleBuyPack = async (packId) => {
    setBuyingPack(packId)
    try {
      const res = await fetch('/api/billing/checkout-credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ packId })
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else alert(data.error || 'Failed')
    } catch { alert('Network error') } finally { setBuyingPack(null) }
  }

  const handleCancel = async () => {
    if (!confirm('Cancel your subscription?')) return
    try {
      await fetch('/api/billing/cancel', { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
      fetchSub()
    } catch {}
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#71717a' }}>
      <Loader2 size={20} className="spinner" /> Loading billing...
    </div>
  )

  const plan = sub?.plan || { id: 'free', display_name: 'Free', credits_per_month: 50 }
  const credits = sub?.credits || { balance: 0, used_this_month: 0 }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a' }}>
      <div style={{ padding: '20px 32px', borderBottom: '1px solid #1e1e22', display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer', fontFamily: 'inherit' }}><ArrowLeft size={18} /></button>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: '#fff', margin: 0 }}>Billing & Credits</h1>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>
        {/* Current Plan */}
        <div style={{ background: '#111113', border: '1px solid #1e1e22', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#fff', margin: 0 }}>Current Plan</h2>
            <button onClick={() => navigate('/pricing')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: '1px solid #3b82f6', background: 'transparent', color: '#3b82f6', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
              <ExternalLink size={14} /> View Plans
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={24} style={{ color: '#3b82f6' }} />
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 600, color: '#fff' }}>{plan.display_name}</div>
              <div style={{ fontSize: 13, color: '#71717a' }}>{plan.credits_per_month} credits/month included</div>
            </div>
            {sub?.subscription?.status && sub.subscription.status !== 'active' && (
              <span style={{ marginLeft: 'auto', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 500, background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>{sub.subscription.status}</span>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ background: '#0a0a0a', borderRadius: 10, padding: 16 }}>
              <div style={{ fontSize: 12, color: '#71717a', marginBottom: 4 }}>Credits Remaining</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: credits.balance > 0 ? '#22c55e' : '#ef4444' }}>{credits.balance}</div>
            </div>
            <div style={{ background: '#0a0a0a', borderRadius: 10, padding: 16 }}>
              <div style={{ fontSize: 12, color: '#71717a', marginBottom: 4 }}>Used This Period</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#a1a1aa' }}>{credits.used_this_month}</div>
            </div>
          </div>

          {sub?.subscription?.current_period_end && (
              <div style={{ marginTop: 12, fontSize: 13, color: '#71717a' }}>
              {sub.subscription.status === 'canceled' ? 'Cancels' : 'Renews'}: {new Date(sub.subscription.current_period_end).toLocaleDateString()}
            </div>
          )}

          {plan.id !== 'free' && sub?.subscription?.status === 'active' && (
            <button onClick={handleCancel} style={{ marginTop: 16, padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)', background: 'transparent', color: '#ef4444', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
              Cancel Subscription
            </button>
          )}
        </div>

        {/* Buy Credits */}
        <div style={{ background: '#111113', border: '1px solid #1e1e22', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#fff', margin: '0 0 16px' }}>Buy Credits</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {CREDIT_PACKS.map(pack => (
              <div key={pack.id} style={{ background: '#0a0a0a', border: '1px solid #1e1e22', borderRadius: 10, padding: 20, textAlign: 'center', transition: 'border-color 150ms' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#3b82f6'} onMouseLeave={e => e.currentTarget.style.borderColor = '#1e1e22'}>
                <Package size={24} style={{ color: '#3b82f6', marginBottom: 8 }} />
                <div style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 4 }}>{pack.credits}</div>
                <div style={{ fontSize: 13, color: '#71717a', marginBottom: 12 }}>credits</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 12 }}>{pack.price}</div>
                <button onClick={() => handleBuyPack(pack.id)} disabled={buyingPack === pack.id} style={{
                  width: '100%', padding: '10px 0', borderRadius: 8, border: 'none', background: '#3b82f6', color: '#fff',
                  fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
                  opacity: buyingPack === pack.id ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                }}>
                  {buyingPack === pack.id ? <><Loader2 size={14} className="spinner" /> Processing...</> : 'Buy Now'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Purchase History */}
        <div style={{ background: '#111113', border: '1px solid #1e1e22', borderRadius: 12, padding: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#fff', margin: '0 0 16px' }}>Transaction History</h2>
          {(sub?.transactions || []).length === 0 ? (
            <p style={{ color: '#71717a', fontSize: 14 }}>No transactions yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {sub.transactions.map(t => (
                <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#0a0a0a', borderRadius: 8, border: '1px solid #1e1e22' }}>
                  <div>
                    <div style={{ fontSize: 14, color: '#fff' }}>{t.description || t.type}</div>
                    <div style={{ fontSize: 12, color: '#71717a' }}>{t.created_at ? new Date(t.created_at).toLocaleString() : ''}</div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: t.amount > 0 ? '#22c55e' : '#ef4444' }}>
                    {t.amount > 0 ? '+' : ''}{t.amount} credits
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
