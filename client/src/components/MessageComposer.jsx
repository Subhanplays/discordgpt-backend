import React, { useState, useRef, useEffect } from 'react'
import { ArrowUp, Paperclip, Mic, Globe, Sparkles, Loader2 } from 'lucide-react'
import PersonalitySelector from './PersonalitySelector'

const PERSONALITY_KEY = 'discordgpt_personality'

export default function MessageComposer({ onSend, onCreate, disabled, usage }) {
  const [text, setText] = useState('')
  const [generating, setGenerating] = useState(false)
  const [personality, setPersonality] = useState(() => {
    return localStorage.getItem(PERSONALITY_KEY) || 'professional'
  })
  const textareaRef = useRef(null)

  const isLimitReached = usage && usage.remaining <= 0

  useEffect(() => {
    localStorage.setItem(PERSONALITY_KEY, personality)
  }, [personality])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 180) + 'px'
    }
  }, [text])

  const handleSend = () => {
    const trimmed = text.trim()
    if (!trimmed || disabled) return
    onSend(trimmed, personality)
    setText('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleCreate = async () => {
    const trimmed = text.trim()
    if (disabled || isLimitReached) return

    if (!trimmed) {
      setGenerating(true)
      try {
        const token = localStorage.getItem('discordgpt_token')
        const res = await fetch('/api/chat/generate-prompt', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        })
        const data = await res.json()
        const prompt = data.prompt || 'Create a community server with welcome channels, general chat, and voice rooms'
        setText(prompt)
        setTimeout(() => {
          onCreate(prompt, personality)
          setText('')
        }, 150)
      } catch {
        onCreate('Create a community server with welcome channels, general chat, and voice rooms', personality)
      } finally {
        setGenerating(false)
      }
      return
    }

    onCreate(trimmed, personality)
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
          className={`composer-create ${generating ? 'loading' : 'active'}`}
          onClick={handleCreate}
          disabled={disabled || isLimitReached || generating}
          title={generating ? 'Generating idea...' : hasText ? 'Create server blueprint' : 'AI generates a random server idea'}
          aria-label="Create blueprint"
        >
          {generating ? <Loader2 size={15} className="spin" /> : <Sparkles size={15} />}
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
          <div className="composer-actions-left">
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
          <PersonalitySelector selected={personality} onChange={setPersonality} />
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
