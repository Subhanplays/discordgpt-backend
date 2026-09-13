import React, { useState, useRef, useEffect } from 'react'
import { ArrowUp, Paperclip, Mic, Globe, Sparkles } from 'lucide-react'

export default function MessageComposer({ onSend, onCreate, disabled, usage }) {
  const [text, setText] = useState('')
  const textareaRef = useRef(null)

  const isLimitReached = usage && (usage.remaining !== undefined ? usage.remaining <= 0 : false)
  const balance = usage?.balance ?? usage?.remaining ?? 0
  const plan = usage?.plan?.display_name || 'Free'

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

  const handleCreate = () => {
    const trimmed = text.trim()
    if (!trimmed || disabled) return
    onCreate(trimmed)
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
          placeholder={isLimitReached ? 'No credits remaining. Purchase more at /billing.' : 'Describe the Discord server you want to create...'}
          rows={1}
          disabled={disabled || isLimitReached}
        />
        <button
          className={`composer-create ${hasText && !isLimitReached ? 'active' : ''}`}
          onClick={handleCreate}
          disabled={!hasText || disabled || isLimitReached}
          title="Create server blueprint"
          aria-label="Create blueprint"
        >
          <Sparkles size={16} />
        </button>
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
        </div>
      </div>
      {usage && (
        <div className="composer-usage">
          <span className={`composer-usage-count ${isLimitReached ? 'limit-reached' : ''}`}>
            {balance} credits remaining · {plan}
          </span>
          {isLimitReached && (
            <span className="composer-usage-warning" style={{ cursor: 'pointer' }} onClick={() => window.location.href = '/billing'}>
              Buy more →
            </span>
          )}
        </div>
      )}
    </div>
  )
}
