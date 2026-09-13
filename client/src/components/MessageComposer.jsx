import React, { useState, useRef, useEffect } from 'react'
import { ArrowUp, Paperclip, Mic, Globe, ChevronDown } from 'lucide-react'

export default function MessageComposer({ onSend, disabled }) {
  const [text, setText] = useState('')
  const textareaRef = useRef(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 180) + 'px'
    }
  }, [text])

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
          placeholder="Describe the Discord server you want to create..."
          rows={1}
          disabled={disabled}
        />
        <button
          className={`composer-send ${hasText ? 'active' : ''}`}
          onClick={handleSend}
          disabled={!hasText || disabled}
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
          <button className="model-selector">
            <img src="/logo.svg" alt="" style={{ width: 12, height: 12, borderRadius: 2, filter: 'var(--logo-filter)' }} />
            DiscordGPT
            <ChevronDown size={12} />
          </button>
        </div>
      </div>
    </div>
  )
}
