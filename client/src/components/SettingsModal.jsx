import React from 'react'
import { X, Monitor, Shield, Bot, User, LogOut, Globe } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import { useChat } from '../contexts/ChatContext'

export default function SettingsModal({ open, onClose }) {
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const { botConnected, botInfo, servers } = useChat()

  if (!open) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Settings</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          <div className="settings-section">
            <div className="settings-section-title"><User size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />Discord Profile</div>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '16px 0' }}>
              <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-full)', overflow: 'hidden', background: 'var(--accent-gradient)', flexShrink: 0 }}>
                {user?.discord_avatar ? (
                  <img src={user.discord_avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 700, fontSize: 18 }}>
                    {user?.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.username || 'User'}
                  {user?.discord_discriminator && user.discord_discriminator !== '0' && (
                    <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)' }}>#{user.discord_discriminator}</span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{user?.email || ''}</div>
              </div>
              {user?.two_fa_enabled && (
                <span className="badge badge-success" style={{ fontSize: 11 }}><Shield size={10} style={{ marginRight: 3 }} /> 2FA</span>
              )}
            </div>
            {user?.discord_locale && (
              <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <Globe size={12} /> {user.discord_locale}
              </div>
            )}
          </div>

          <div className="settings-section">
            <div className="settings-section-title"><Monitor size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />General</div>
            <div className="settings-row">
              <div>
                <div className="settings-row-label">Appearance</div>
                <div className="settings-row-desc">Switch between dark and light themes</div>
              </div>
              <div className={`toggle-switch ${theme === 'light' ? 'active' : ''}`} onClick={toggleTheme} />
            </div>
          </div>

          <div className="settings-section">
            <div className="settings-section-title"><Bot size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />Discord Bot</div>
            {botConnected && botInfo ? (
              <>
                <div className="settings-row">
                  <div>
                    <div className="settings-row-label">DiscordGPT Bot</div>
                    <div className="settings-row-desc">{botInfo.username} (ID: {botInfo.id})</div>
                  </div>
                  <span className="badge badge-success">Connected</span>
                </div>
                <div className="settings-row">
                  <div>
                    <div className="settings-row-label">Connected Servers</div>
                    <div className="settings-row-desc">{servers.length} server(s)</div>
                  </div>
                </div>
              </>
            ) : (
              <div className="settings-row">
                <div>
                  <div className="settings-row-label">DiscordGPT Bot</div>
                  <div className="settings-row-desc">Bot is connecting...</div>
                </div>
                <span className="badge badge-default">Connecting</span>
              </div>
            )}
          </div>

          <div className="settings-section" style={{ marginBottom: 0 }}>
            <div className="settings-row">
              <button className="btn btn-danger btn-sm" onClick={() => { logout(); onClose(); }}>
                <LogOut size={14} /> Log Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
