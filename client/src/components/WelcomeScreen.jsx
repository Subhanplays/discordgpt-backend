import React from 'react'
import { useChat } from '../contexts/ChatContext'
import QuickActions from './QuickActions'

export default function WelcomeScreen({ onPrompt }) {
  const { botConnected, selectedServer } = useChat()

  return (
    <div className="welcome-screen">
      <div className="welcome-content">
        <div className="welcome-logo">
          <img src="/logo.svg" alt="DiscordGPT" />
        </div>
        <h1 className="welcome-title">DiscordGPT</h1>
        <p className="welcome-subtitle">Your AI-powered Discord assistant</p>
        <p className="welcome-description">
          Build, manage, and automate your Discord server with natural language.
          Create bots, moderation rules, embeds, and more — no code required.
        </p>

        {botConnected && selectedServer && (
          <div className="welcome-server-select">
            <div className="welcome-server-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                <circle cx="9" cy="9" r="1" fill="currentColor"/>
                <circle cx="15" cy="9" r="1" fill="currentColor"/>
              </svg>
            </div>
            <div className="welcome-server-info">
              <div className="welcome-server-name">{selectedServer.name}</div>
              <div className="welcome-server-id">{selectedServer.id}</div>
            </div>
            <button className="welcome-server-change">Change</button>
          </div>
        )}

        {onPrompt && <QuickActions onAction={onPrompt} />}
      </div>
    </div>
  )
}
