import React from 'react'

const ACTIONS = [
  { emoji: '\uD83C\uDFAE', label: 'Create a Gaming Server', message: 'Create a Discord server for a gaming community' },
  { emoji: '\uD83D\uDCDA', label: 'Create a Study Group', message: 'Create a Discord server for studying and education' },
  { emoji: '\uD83D\uDCBC', label: 'Create a Business Server', message: 'Create a Discord server for a business team' },
  { emoji: '\uD83C\uDFA8', label: 'Create an Art Community', message: 'Create a Discord server for artists and creators' },
  { emoji: '\uD83D\uDEE1\uFE0F', label: 'Setup Moderation', message: 'Help me set up moderation for my server' },
  { emoji: '\uD83D\uDC65', label: 'Create Roles', message: 'Help me create a role hierarchy for my server' }
]

export default function QuickActions({ onAction }) {
  return (
    <div className="quick-actions">
      {ACTIONS.map((action, i) => (
        <button
          key={i}
          className="quick-action-btn"
          onClick={() => onAction(action.message)}
        >
          <span className="quick-action-emoji">{action.emoji}</span>
          <span className="quick-action-label">{action.label}</span>
        </button>
      ))}
    </div>
  )
}
