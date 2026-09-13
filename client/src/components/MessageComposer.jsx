import React, { useState, useRef, useEffect } from 'react'
import { ArrowUp, Paperclip, Mic, Globe, ChevronDown, Check } from 'lucide-react'

export default function MessageComposer({ onSend, disabled, usage }) {
  const [text, setText] = useState('')
  const [modelOpen, setModelOpen] = useState(false)
  const textareaRef = useRef(null)
  const dropdownRef = useRef(null)

  const isLimitReached = usage && usage.remaining <= 0

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 180) + 'px'
    }
  }, [text])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setModelOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSend = () => {
    const trimmed = text.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setText('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const hasText = text.trim().length > 0

  return (
    <div className="composer-area">
      <div className="composer-wrapper">
        <textarea
          ref={textareaRef}
          className="composer"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isLimitReached ? 'Daily message limit reached. Resets at midnight UTC.' : 'Describe the Discord server you want to create...'}
          rows={1}
          disabled={disabled || isLimitReached}
        />
        <button
          className={`composer-send ${hasText && !isLimitReached ? 'active' : ''}`}
          onClick={handleSend}
          disabled={!hasText || disabled || isLimitReached}
          aria-label="Send"
        >
          <ArrowUp size={16} />
        </button>
        <div className="composer-actions">
          <button className="composer-action-btn" title="Attach file">
            <Paperclip size={14} />
          </button>
          <button className="composer-action-btn disabled" title="Web search (coming soon)">
            <Globe size={14} />
          </button>
          <button className="composer-action-btn disabled" title="Voice input (coming soon)">
            <Mic size={14} />
          </button>
          <div className="model-selector-wrapper" ref={dropdownRef}>
            <button
              className="model-selector"
              onClick={() => setModelOpen(!modelOpen)}
            >
              <img
                src="/logo.svg"
                alt=""
                style={{ width: 12, height: 12, borderRadius: 2, color: 'var(--text)' }}
              />
              DiscordGPT
              <ChevronDown size={12} style={{
                transform: modelOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease'
              }} />
            </button>
            {modelOpen && (
              <div className="model-dropdown">
                <div className="model-dropdown-item active">
                  <img
                    src="/logo.svg"
                    alt=""
                    style={{ width: 14, height: 14, borderRadius: 3, color: 'var(--text)' }}
                  />
                  <div>
                    <div className="model-dropdown-name">DiscordGPT</div>
                    <div className="model-dropdown-desc">AI-powered server builder</div>
                  </div>
                  <Check size={14} className="model-dropdown-check" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {usage && (
        <div className="composer-usage">
          <span className={`composer-usage-count ${isLimitReached ? 'limit-reached' : ''}`}>
            {usage.count}/{usage.limit} messages today
          </span>
          {usage.remaining > 0 && usage.remaining <= 10 && (
            <span className="composer-usage-warning">{usage.remaining} remaining</span>
          )}
        </div>
      )}
    </div>
  )
}
