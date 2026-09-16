import React, { useState, useRef, useEffect } from 'react'
import { ArrowUp, Paperclip, Mic, Globe, Sparkles } from 'lucide-react'
import PersonalitySelector from './PersonalitySelector'

const PERSONALITY_KEY = 'discordgpt_personality'

const RANDOM_PROMPTS = [
  'Create a gaming server with voice channels, a tournament bracket channel, and role-based access for different game teams',
  'Build a study group server with subject-specific channels, a homework help bot, and a resource library',
  'Set up a community server with welcome rules, off-topic channels, event announcements, and a suggestion box',
  'Design a content creator server with fan zones, exclusive patron channels, and a stream schedule board',
  'Make a startup team server with project boards, meeting rooms, file sharing, and department-specific channels',
  'Create an art community server with portfolio showcases, critique channels, commission tracking, and gallery roles',
  'Build a music production server with collab channels, sample libraries, feedback sections, and producer directories',
  'Set up a fitness community with workout tracking, nutrition tips, challenge boards, and progress check-ins',
  'Design a book club server with reading lists, discussion threads, author Q&A channels, and genre-based groups',
  'Create a developer community with code review channels, project showcases, job board, and tech discussion rooms',
  'Build a movie night server with watch party scheduling, review channels, genre discussions, and recommendation boards',
  'Set up a language learning server with practice channels, tutoring sessions, resource sharing, and progress tracking',
]

export default function MessageComposer({ onSend, onCreate, disabled, usage }) {
  const [text, setText] = useState('')
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

  const handleCreate = () => {
    const trimmed = text.trim()
    if (disabled || isLimitReached) return

    if (!trimmed) {
      const random = RANDOM_PROMPTS[Math.floor(Math.random() * RANDOM_PROMPTS.length)]
      setText(random)
      setTimeout(() => {
        onCreate(random, personality)
        setText('')
      }, 100)
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
          className={`composer-create active`}
          onClick={handleCreate}
          disabled={disabled || isLimitReached}
          title={hasText ? 'Create server blueprint' : 'Generate random prompt & create'}
          aria-label="Create blueprint"
        >
          <Sparkles size={15} />
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
