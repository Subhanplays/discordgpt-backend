import React from 'react'
import { Download } from 'lucide-react'
import { useChat } from '../contexts/ChatContext'

function formatTimestamp(ts) {
  if (!ts) return ''
  try {
    return new Date(ts).toLocaleString()
  } catch {
    return ''
  }
}

function escapeMd(text) {
  return text
    .replace(/\|/g, '\\|')
}

export default function ChatExport() {
  const { activeConversation, messages, blueprint } = useChat()

  const handleExport = () => {
    const title = activeConversation?.title || 'Untitled Conversation'
    const lines = []
    lines.push(`# ${title}`)
    lines.push('')
    lines.push(`*Exported on ${new Date().toLocaleString()}*`)
    lines.push('')

    if (blueprint) {
      lines.push('## Blueprint')
      lines.push('')
      if (blueprint.serverName || blueprint.name) {
        lines.push(`**Server:** ${blueprint.serverName || blueprint.name}`)
      }
      if (blueprint.description) {
        lines.push(`**Description:** ${blueprint.description}`)
      }
      if (blueprint.categories) {
        lines.push('')
        lines.push('### Structure')
        lines.push('```')
        blueprint.categories.forEach(cat => {
          lines.push(`├── ${cat.name}`)
          if (cat.channels) {
            cat.channels.forEach((ch, i) => {
              const isLast = i === cat.channels.length - 1
              lines.push(`${isLast ? '└── ' : '├── '}#${ch.name}`)
            })
          }
        })
        lines.push('```')
      }
      if (blueprint.roles && blueprint.roles.length > 0) {
        lines.push('')
        lines.push('### Roles')
        lines.push('```')
        blueprint.roles.forEach(role => {
          lines.push(`@${role.name}${role.color ? ` (${role.color})` : ''}`)
        })
        lines.push('```')
      }
      lines.push('')
    }

    if (messages.length > 0) {
      lines.push('## Conversation')
      lines.push('')
      messages.forEach(msg => {
        const role = msg.role === 'user' ? 'You' : 'Assistant'
        const time = formatTimestamp(msg.timestamp)
        lines.push(`**${role}**${time ? ` — ${time}` : ''}`)
        lines.push('')
        lines.push(msg.content || '')
        lines.push('')
        lines.push('---')
        lines.push('')
      })
    }

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-').slice(0, 60)}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <button className="btn btn-ghost btn-sm" onClick={handleExport} title="Export as Markdown">
      <Download size={14} />
    </button>
  )
}
