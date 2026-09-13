import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { Search, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useChat } from '../contexts/ChatContext'

export default function SearchModal({ open, onClose }) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef(null)
  const listRef = useRef(null)
  const navigate = useNavigate()
  const { conversations, loadConversation } = useChat()

  const filtered = useMemo(() => {
    if (!query.trim()) return conversations
    const q = query.toLowerCase()
    return conversations.filter(c => (c.title || '').toLowerCase().includes(q))
  }, [conversations, query])

  useEffect(() => {
    if (open) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, filtered.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, 0))
      } else if (e.key === 'Enter' && filtered[selectedIndex]) {
        e.preventDefault()
        handleSelect(filtered[selectedIndex]._id || filtered[selectedIndex].id)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, filtered, selectedIndex, onClose])

  useEffect(() => {
    if (listRef.current) {
      const selectedEl = listRef.current.children[selectedIndex]
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [selectedIndex])

  const handleSelect = useCallback((id) => {
    loadConversation(id)
    navigate(`/c/${id}`)
    onClose()
  }, [loadConversation, navigate, onClose])

  if (!open) return null

  return (
    <div className="search-modal-overlay" onClick={onClose}>
      <div className="search-modal" onClick={e => e.stopPropagation()}>
        <div className="search-modal-input-wrapper">
          <Search size={20} className="search-modal-icon" />
          <input
            ref={inputRef}
            className="search-modal-input"
            type="text"
            placeholder="Search conversations..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button className="search-modal-close" onClick={onClose} aria-label="Close search">
            <X size={18} />
          </button>
        </div>
        <div className="search-modal-list" ref={listRef}>
          {filtered.length === 0 ? (
            <div className="search-modal-empty">No conversations found</div>
          ) : (
            filtered.map((conv, i) => (
              <div
                key={conv._id || conv.id}
                className={`search-modal-item ${i === selectedIndex ? 'selected' : ''}`}
                onClick={() => handleSelect(conv._id || conv.id)}
                onMouseEnter={() => setSelectedIndex(i)}
              >
                <span className="search-modal-item-title">{conv.title || 'New Conversation'}</span>
                {conv.created_at && (
                  <span className="search-modal-item-date">
                    {new Date(conv.created_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
