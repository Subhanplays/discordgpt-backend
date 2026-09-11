import React, { useEffect } from 'react'
import { Check } from 'lucide-react'
import { useChat } from '../contexts/ChatContext'

export default function ServerSelect() {
  const { servers, selectedServer, setSelectedServer, fetchServers, botConnected } = useChat()

  useEffect(() => {
    if (botConnected) fetchServers()
  }, [botConnected, fetchServers])

  if (!botConnected) return null

  return (
    <div className="server-select-wrapper slide-up">
      <div className="server-select-card">
        <div className="server-select-header">
          <h3>Select a Server</h3>
        </div>
        {servers.length === 0 ? (
          <div style={{ padding: '32px 20px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px' }}>No servers found. Invite your bot to a server first.</p>
            <button className="btn btn-primary" onClick={() => {
              if (selectedServer?.id) {
                const url = `https://discord.com/api/oauth2/authorize?client_id=${selectedServer.botClientId || ''}&permissions=8&scope=bot%20applications.commands`
                window.open(url, '_blank')
              }
            }}>
              Generate Invite Link
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
                {selectedServer?.id === server.id && <Check size={18} color="var(--accent)" />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
