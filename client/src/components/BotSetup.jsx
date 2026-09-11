import React, { useState } from 'react'
import { Eye, EyeOff, AlertTriangle, CheckCircle2, Wifi } from 'lucide-react'
import { useChat } from '../contexts/ChatContext'

export default function BotSetup({ onComplete }) {
  const [botToken, setBotToken] = useState('')
  const [showToken, setShowToken] = useState(false)
  const [error, setError] = useState('')
  const { connectBot, botConnected, botInfo, loading } = useChat()

  const handleConnect = async () => {
    if (!botToken.trim()) {
      setError('Please enter a bot token')
      return
    }
    setError('')
    try {
      await connectBot(botToken.trim())
    } catch (err) {
      setError(err.message || 'Failed to connect bot')
    }
  }

  if (botConnected && botInfo) {
    return (
      <div className="bot-connect-card slide-up">
        <h3>Bot Connected</h3>
        <div className="bot-status">
          <div className="bot-status-avatar">
            {botInfo.avatar ? <img src={botInfo.avatar} alt="" /> : (botInfo.username?.[0] || 'B')}
          </div>
          <div className="bot-status-info">
            <div className="bot-status-name">{botInfo.username || 'Bot'}</div>
            <div className="bot-status-id">ID: {botInfo.id || 'N/A'}</div>
          </div>
          <div className="bot-status-dot">
            <span className="status-dot online" />
            Online
          </div>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '12px 0' }}>
          Make sure your bot is in the server you want to configure.
        </p>
        {botInfo.id && (
          <button className="btn btn-secondary" style={{ width: '100%', marginBottom: 8 }} onClick={() => {
            window.open(`https://discord.com/api/oauth2/authorize?client_id=${botInfo.id}&permissions=8&scope=bot%20applications.commands`, '_blank')
          }}>
            Invite Bot to Server
          </button>
        )}
        <button className="btn btn-primary" style={{ width: '100%' }} onClick={onComplete}>
          Done
        </button>
      </div>
    )
  }

  return (
    <div className="bot-connect-card slide-up">
      <h3>Connect Your Discord Bot</h3>
      <p className="subtitle">Enter your Discord bot token to get started.</p>

      <div className="bot-connect-info">
        <AlertTriangle size={18} />
        <p>Never share your bot token with anyone. It provides full access to your bot.</p>
      </div>

      <div className="input-group">
        <label className="input-label">Bot Token</label>
        <div style={{ position: 'relative' }}>
          <input
            type={showToken ? 'text' : 'password'}
            className="input-field"
            value={botToken}
            onChange={(e) => setBotToken(e.target.value)}
            placeholder="Enter your bot token..."
            onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
            style={{ paddingRight: '40px' }}
          />
          <button
            onClick={() => setShowToken(!showToken)}
            style={{
              position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px'
            }}
          >
            {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-md)', marginBottom: '16px', fontSize: '13px', color: 'var(--error)' }}>
          {error}
        </div>
      )}

      <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={handleConnect} disabled={loading || !botToken.trim()}>
        {loading ? (
          <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2, borderStyle: 'solid', borderColor: 'transparent', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block' }} /> Connecting...</>
        ) : (
          <><Wifi size={16} /> Connect Bot</>
        )}
      </button>
    </div>
  )
}
