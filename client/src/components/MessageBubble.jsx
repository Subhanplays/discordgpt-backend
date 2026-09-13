import React, { useState } from 'react'
import { Copy, ThumbsUp, ThumbsDown, Check } from 'lucide-react'

export default function MessageBubble({ message }) {
  const [copied, setCopied] = useState(false)
  const [liked, setLiked] = useState(false)
  const [disliked, setDisliked] = useState(false)
  const [copiedBlock, setCopiedBlock] = useState(null)
  const isUser = message.role === 'user'

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleLike = () => {
    setLiked(!liked)
    if (disliked) setDisliked(false)
  }

  const handleDislike = () => {
    setDisliked(!disliked)
    if (liked) setLiked(false)
  }

  const handleCopyBlock = (code, index) => {
    navigator.clipboard.writeText(code)
    setCopiedBlock(index)
    setTimeout(() => setCopiedBlock(null), 2000)
  }

  const formatContent = (content) => {
    if (!content) return null
    const parts = content.split(/(```[\s\S]*?```)/g)
    return parts.map((part, i) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3)
        const firstNewline = lines.indexOf('\n')
        const lang = firstNewline > -1 ? lines.slice(0, firstNewline).trim() : ''
        const code = firstNewline > -1 ? lines.slice(firstNewline + 1) : lines
        return (
          <div key={i} className="code-block-wrapper">
            <div className="code-block-header">
              {lang && <span className="code-block-lang">{lang}</span>}
              <button
                className="code-block-copy"
                onClick={() => handleCopyBlock(code, i)}
                title="Copy code"
              >
                {copiedBlock === i ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
              </button>
            </div>
            <pre className="code-block"><code className={lang ? `language-${lang}` : ''}>{code}</code></pre>
          </div>
        )
      }
      return <span key={i} dangerouslySetInnerHTML={{ __html: formatInline(part) }} />
    })
  }

  const formatInline = (text) => {
    let result = text
    result = result.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    result = result.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    result = result.replace(/\*(.+?)\*/g, '<em>$1</em>')
    result = result.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
    result = result.replace(/^### (.+)$/gm, '<h3 class="msg-h3">$1</h3>')
    result = result.replace(/^## (.+)$/gm, '<h2 class="msg-h2">$1</h2>')
    result = result.replace(/^# (.+)$/gm, '<h1 class="msg-h1">$1</h1>')
    result = result.replace(/^&gt; (.+)$/gm, '<blockquote class="msg-blockquote">$1</blockquote>')
    result = result.replace(/^- (.+)$/gm, '<li>$1</li>')
    result = result.replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul class="msg-list">${m}</ul>`)
    result = result.replace(/^\d+\. (.+)$/gm, '<li class="msg-ordered">$1</li>')
    result = result.replace(/\n/g, '<br/>')
    return result
  }

  return (
    <div className="message fade-in">
      <div className={`message-avatar ${isUser ? 'user-avatar' : 'assistant-avatar'}`}>
        {isUser ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        ) : (
          <img src="/logo.svg" alt="" className="message-avatar-logo" />
        )}
      </div>
      <div className="message-body">
        <div className="message-header">
          <span className="message-role">{isUser ? 'You' : 'DiscordGPT'}</span>
          <span className="message-time">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <div className="message-content">
          {formatContent(message.content)}
        </div>
        {!isUser && (
          <div className="message-actions">
            <button onClick={handleCopy} className={copied ? 'active' : ''} title="Copy">
              {copied ? <Check size={13} /> : <Copy size={13} />}
            </button>
            <button onClick={handleLike} className={liked ? 'active' : ''} title="Good response">
              <ThumbsUp size={13} />
            </button>
            <button onClick={handleDislike} className={disliked ? 'active' : ''} title="Bad response">
              <ThumbsDown size={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
