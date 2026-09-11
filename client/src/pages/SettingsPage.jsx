import React from 'react'
import { Monitor, Bot, User, LogOut, Shield, Palette, Globe } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import { useChat } from '../contexts/ChatContext'

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const { botConnected, botInfo, disconnectBot, servers } = useChat()

  return (
    <div className="settings-page">
      <h1>Settings</h1>

      <div className="settings-section">
        <div className="settings-section-title"><Palette size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />Appearance</div>
        <div className="settings-row">
          <div>
            <div className="settings-row-label">Dark Mode</div>
            <div className="settings-row-desc">Currently using {theme} theme</div>
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
                <div className="settings-row-label">Connected Bot</div>
                <div className="settings-row-desc">{botInfo.username} (ID: {botInfo.id})</div>
              </div>
              <span className="badge badge-success">Connected</span>
            </div>
            <div className="settings-row">
              <div>
                <div className="settings-row-label">Servers Available</div>
                <div className="settings-row-desc">{servers.length} server(s) found</div>
              </div>
            </div>
            <div className="settings-row">
              <button className="btn btn-danger btn-sm" onClick={disconnectBot}>Disconnect Bot</button>
            </div>
          </>
        ) : (
          <div className="settings-row">
            <div>
              <div className="settings-row-label">No bot connected</div>
              <div className="settings-row-desc">Go to the chat page to connect your bot</div>
            </div>
            <span className="badge badge-default">Offline</span>
          </div>
        )}
      </div>

      <div className="settings-section">
        <div className="settings-section-title"><User size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />Account</div>
        <div className="settings-row">
          <div>
            <div className="settings-row-label">{user?.username || 'User'}</div>
            <div className="settings-row-desc">{user?.email || 'No email set'}</div>
          </div>
        </div>
        <div className="settings-row">
          <button className="btn btn-danger btn-sm" onClick={logout}>
            <LogOut size={14} /> Log Out
          </button>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-section-title"><Shield size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />Security</div>
        <div className="settings-row">
          <div>
            <div className="settings-row-label">Session</div>
            <div className="settings-row-desc">Your session is stored securely in memory only</div>
          </div>
          <span className="badge badge-success">Secure</span>
        </div>
      </div>
    </div>
  )
}
