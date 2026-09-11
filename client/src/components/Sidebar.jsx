import React, { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { MessageSquarePlus, LayoutGrid, Server, Clock, Settings, Trash2, LogOut, PanelLeftClose, Shield } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useChat } from '../contexts/ChatContext'

export default function Sidebar({ open, onClose }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const { conversations, activeConversation, setActiveConversation, setMessages, fetchConversations, deleteConversation, setBlueprint, setCreationProgress } = useChat()

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  const handleNewChat = () => {
    setActiveConversation(null)
    setMessages([])
    setBlueprint(null)
    setCreationProgress(null)
    navigate('/')
    onClose()
  }

  const handleSelectConversation = (conv) => {
    setActiveConversation(conv)
    setBlueprint(null)
    setCreationProgress(null)
    navigate(`/c/${conv.id}`)
    onClose()
  }

  const handleDeleteConversation = async (e, id) => {
    e.stopPropagation()
    await deleteConversation(id)
  }

  const isActive = (path) => location.pathname === path

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo" onClick={handleNewChat}>
          <img src="/logo.svg" alt="DiscordGPT" className="sidebar-logo-img" />
          <span className="sidebar-logo-text">DiscordGPT</span>
        </div>
        <button className="new-chat-btn" onClick={handleNewChat}>
          <MessageSquarePlus size={16} />
          New chat
        </button>
      </div>

      <nav className="sidebar-nav">
        <button className={`sidebar-nav-item ${isActive('/') ? 'active' : ''}`} onClick={handleNewChat}>
          <MessageSquarePlus size={18} />
          New chat
        </button>
        <button className={`sidebar-nav-item ${isActive('/templates') ? 'active' : ''}`} onClick={() => { navigate('/templates'); onClose() }}>
          <LayoutGrid size={18} />
          Templates
        </button>
        <button className={`sidebar-nav-item ${isActive('/settings') ? 'active' : ''}`} onClick={() => { navigate('/settings'); onClose() }}>
          <Settings size={18} />
          Settings
        </button>
        {user?.role === 'admin' && (
          <button className={`sidebar-nav-item ${isActive('/admin') ? 'active' : ''}`} onClick={() => { navigate('/admin'); onClose() }}>
            <Shield size={18} />
            Admin Panel
          </button>
        )}
      </nav>

      <div className="sidebar-history">
        {conversations.length > 0 && (
          <>
            <div className="sidebar-history-header">Recent</div>
            <div className="sidebar-history-list">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`conv-item ${activeConversation?.id === conv.id ? 'active' : ''}`}
                  onClick={() => handleSelectConversation(conv)}
                >
                  <span className="conv-item-title">{conv.title || 'New conversation'}</span>
                  <div className="conv-item-actions">
                    <button onClick={(e) => handleDeleteConversation(e, conv.id)} title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-footer-avatar">
          {user?.username?.[0]?.toUpperCase() || 'U'}
        </div>
        <div className="sidebar-footer-info">
          <div className="sidebar-footer-name">{user?.username || 'User'}</div>
          <div className="sidebar-footer-plan">Free Plan</div>
        </div>
        <button onClick={() => { navigate('/settings'); onClose() }} title="Settings">
          <Settings size={18} />
        </button>
        <button onClick={logout} title="Log out">
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  )
}
