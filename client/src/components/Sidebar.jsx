import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { MessageSquarePlus, MessageSquare, Settings, Shield, Search, X, LogOut, Trash2, Sun, Moon, Pin } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useChat } from '../contexts/ChatContext'
import { useTheme } from '../contexts/ThemeContext'
import FolderList from './FolderList'

export default function Sidebar({ open, onClose, searchInputRef }) {
  const { user, logout } = useAuth()
  const { conversations, activeConversation, loadConversation, deleteConversation, createConversation, togglePinConversation } = useChat()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [search, setSearch] = useState('')
  const [activeFolder, setActiveFolder] = useState(null)
  const localSearchRef = useRef(null)

  const isAdmin = user?.role === 'admin'

  const filtered = conversations.filter(c =>
    (c.title || '').toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => (b.is_pinned || 0) - (a.is_pinned || 0))

  const handleNewChat = useCallback(() => {
    createConversation('New Chat')
    navigate('/')
    onClose()
  }, [createConversation, navigate, onClose])

  const handleSelect = useCallback((id) => {
    loadConversation(id)
    navigate(`/c/${id}`)
    onClose()
  }, [loadConversation, navigate, onClose])

  const handleDelete = useCallback((e, id) => {
    e.stopPropagation()
    deleteConversation(id)
  }, [deleteConversation])

  const handlePin = useCallback((e, id) => {
    e.stopPropagation()
    togglePinConversation(id)
  }, [togglePinConversation])

  const handleNav = useCallback((path) => {
    navigate(path)
    onClose()
  }, [navigate, onClose])

  const isActive = (path) => location.pathname === path

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : '??'

  return (
    <div className={`sidebar ${open ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <img src="/logo.svg" alt="" className="sidebar-logo" />
          <span className="sidebar-brand-text">DiscordGPT</span>
        </div>
        <button className="sidebar-close" onClick={onClose} aria-label="Close menu">
          <X size={18} />
        </button>
      </div>

      <div className="sidebar-nav">
        <button className="sidebar-nav-item" onClick={handleNewChat}>
          <MessageSquarePlus size={18} />
          <span>New Chat</span>
        </button>
        <button className={`sidebar-nav-item ${isActive('/templates') ? 'active' : ''}`} onClick={() => handleNav('/templates')}>
          <MessageSquare size={18} />
          <span>Templates</span>
        </button>
        <button className={`sidebar-nav-item ${isActive('/settings') ? 'active' : ''}`} onClick={() => handleNav('/settings')}>
          <Settings size={18} />
          <span>Settings</span>
        </button>
        {isAdmin && (
          <button className={`sidebar-nav-item ${isActive('/admin') ? 'active' : ''}`} onClick={() => handleNav('/admin')}>
            <Shield size={18} />
            <span>Admin</span>
          </button>
        )}
      </div>

      <div className="sidebar-search">
        <input
          ref={searchInputRef || localSearchRef}
          className="sidebar-search-input"
          type="text"
          placeholder="Search conversations..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <FolderList activeFolder={activeFolder} onFolderSelect={setActiveFolder} />

      <div className="sidebar-history">
        {conversations.length > 0 && <div className="sidebar-history-label">Recent</div>}
        {filtered.map(conv => (
          <div
            key={conv._id || conv.id}
            className={`sidebar-history-item ${(activeConversation?._id || activeConversation?.id) === (conv._id || conv.id) ? 'active' : ''}`}
            onClick={() => handleSelect(conv._id || conv.id)}
          >
            {conv.is_pinned === 1 && <Pin size={12} className="pin-icon" />}
            <span className="title">{conv.title || 'New Conversation'}</span>
            <div className="conversation-actions">
              <button className="pin-btn" onClick={e => handlePin(e, conv._id || conv.id)} aria-label={conv.is_pinned ? 'Unpin conversation' : 'Pin conversation'}>
                <Pin size={14} className={conv.is_pinned ? 'pinned' : ''} />
              </button>
              <button className="delete-btn" onClick={e => handleDelete(e, conv._id || conv.id)} aria-label="Delete conversation">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {conversations.length === 0 && (
          <div style={{ padding: '12px', fontSize: '13px', color: 'var(--text-muted)' }}>
            No conversations yet
          </div>
        )}
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.username || 'User'}</div>
            <div className="sidebar-user-status">{user?.role || 'Member'}</div>
          </div>
          <button className="sidebar-logout" onClick={logout} aria-label="Log out">
            <LogOut size={16} />
          </button>
          <button className="sidebar-theme-toggle" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>
    </div>
  )
}
