import React from 'react'
import { Hammer, Gamepad2, Headphones, Palette, Store, Music, GraduationCap, Building } from 'lucide-react'
import { useChat } from '../contexts/ChatContext'

const prompts = [
  {
    icon: Hammer,
    title: 'Moderation',
    desc: 'Auto-moderate messages, warn or ban rule-breakers',
    prompt: 'Help me set up auto-moderation for my Discord server'
  },
  {
    icon: Gamepad2,
    title: 'Games & Fun',
    desc: 'Create trivia, word games, and mini-games',
    prompt: 'Create a fun trivia game for my Discord server'
  },
  {
    icon: Headphones,
    title: 'Music Queue',
    desc: 'Manage music queue and playback controls',
    prompt: 'Help me build a music queue management system'
  },
  {
    icon: Palette,
    title: 'Embed Builder',
    desc: 'Design rich embeds and announcements',
    prompt: 'Create a beautiful embed for my server announcements'
  },
  {
    icon: Store,
    title: 'Shop System',
    desc: 'Virtual economy, items, and store setup',
    prompt: 'Help me create a virtual shop system for my server'
  },
  {
    icon: Music,
    title: 'Welcome Messages',
    desc: 'Personalized greetings for new members',
    prompt: 'Design personalized welcome messages for new members'
  },
  {
    icon: GraduationCap,
    title: 'Onboarding',
    desc: 'Role assignment and server tutorial flow',
    prompt: 'Create an onboarding flow with role assignment'
  },
  {
    icon: Building,
    title: 'Server Analytics',
    desc: 'Track activity, growth, and engagement',
    prompt: 'Help me set up server analytics and tracking'
  }
]

export default function WelcomeScreen({ onPrompt }) {
  const { activeConversation, botConnected, selectedServer } = useChat()

  const handlePromptClick = (prompt) => {
    if (onPrompt) onPrompt(prompt)
  }

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

        <div className="prompt-cards">
          {prompts.map((item, i) => {
            const Icon = item.icon
            return (
              <div
                key={i}
                className="prompt-card"
                onClick={() => handlePromptClick(item.prompt)}
              >
                <div className="prompt-card-icon">
                  <Icon size={18} />
                </div>
                <div className="prompt-card-text">
                  <div className="prompt-card-title">{item.title}</div>
                  <div className="prompt-card-desc">{item.desc}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
