import React from 'react'
import { Check } from 'lucide-react'
import { useChat } from '../contexts/ChatContext'

export default function ServerSelect({ compact = false }) {
  const { servers, selectedServer, setSelectedServer, botConnected } = useChat()

  if (!botConnected) return null

  if (compact) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 13, color: '#a1a1aa', flexShrink: 0 }}>Target:</span>
        {servers.length === 0 ? (
          <span style={{ fontSize: 13, color: '#f59e0b' }}>No servers found. Invite the bot first.</span>
        ) : (
          <select
            className="settings-select"
            style={{ flex: 1, minWidth: 0, padding: '6px 10px', fontSize: 13 }}
            value={selectedServer?.id || ''}
            onChange={(e) => {
              const s = servers.find(s => s.id === e.target.value)
              setSelectedServer(s || null)
            }}
          >
            <option value="">Select a server...</option>
            {servers.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        )}
      </div>
    )
  }

  return (
    <div className="server-select-wrapper slide-up">
      <div className="server-select-card">
        <div className="server-select-header">
          <h3>Select a Server</h3>
        </div>
        {servers.length === 0 ? (
          <div style={{ padding: '32px 20px', textAlign: 'center' }}>
            <p style={{ color: '#a1a1aa', fontSize: 14, marginBottom: 16 }}>No servers found. Invite DiscordGPT bot to your server first.</p>
            <button className="btn btn-primary" onClick={() => {
              window.open(`https://discord.com/api/oauth2/authorize?client_id=1547979894548336720&permissions=8&scope=bot%20applications.commands`, '_blank')
            }}>
              Invite Bot to Server
            </button>
          </div>
        ) : (
          <div className="server-list">
            {servers.map((server) => (
              <div
                key={server.id}
                className={`server-option ${selectedServer?.id === server.id ? 'selected' : ''}`}
                onClick={() => setSelectedServer(server)}
              >
                <div className="server-icon">
                  {server.icon ? (
                    <img src={`https://cdn.discordapp.com/icons/${server.id}/${server.icon}.png`} alt="" />
                  ) : (
                    server.name?.[0] || 'S'
                  )}
                </div>
                <div className="server-info">
                  <div className="server-name">{server.name}</div>
                  <div className="server-id">ID: {server.id}</div>
                </div>
                {selectedServer?.id === server.id && <Check size={18} color="#3b82f6" />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
