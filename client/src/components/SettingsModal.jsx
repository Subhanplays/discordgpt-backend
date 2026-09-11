import React from 'react'
import { X, Monitor, Moon, Sun, Shield, Bot, Server, User, LogOut } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import { useChat } from '../contexts/ChatContext'

export default function SettingsModal({ open, onClose }) {
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const { botConnected, botInfo, disconnectBot, servers } = useChat()

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
                    <div className="settings-row-label">Connected Bot</div>
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
                <div className="settings-row">
                  <button className="btn btn-danger btn-sm" onClick={disconnectBot}>Disconnect Bot</button>
                </div>
              </>
            ) : (
              <div className="settings-row">
                <div>
                  <div className="settings-row-label">No bot connected</div>
                  <div className="settings-row-desc">Connect a bot from the chat interface</div>
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
                <div className="settings-row-desc">{user?.email || ''}</div>
              </div>
            </div>
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
