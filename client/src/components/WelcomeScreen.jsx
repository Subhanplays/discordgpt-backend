import React from 'react'
import { Hammer, Gamepad2, Headphones, Palette, Store, Music, GraduationCap, Building } from 'lucide-react'
import { useChat } from '../contexts/ChatContext'
import ServerSelect from './ServerSelect'

const prompts = [
  { text: 'Create a professional gaming community server', icon: Gamepad2 },
  { text: 'Create an e-commerce store server with product channels', icon: Store },
  { text: 'Create a tech support server with ticketing system', icon: Headphones },
  { text: 'Create a content creator community with roles and rewards', icon: Palette },
  { text: 'Create a Minecraft server community with LFG channels', icon: Hammer },
  { text: 'Create a music production community', icon: Music },
  { text: 'Create an educational server with course channels', icon: GraduationCap },
  { text: 'Create a startup/business networking server', icon: Building }
]

export default function WelcomeScreen({ onSelectPrompt }) {
  const { botConnected, servers } = useChat()

  return (
    <div className="welcome-screen">
      <div className="welcome-logo">
        <svg className="welcome-logo-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      </div>
      <h1 className="welcome-title">DiscordGPT</h1>
      <p className="welcome-subtitle">AI-Powered Discord Server Builder</p>
      <p className="welcome-desc">Describe your dream Discord server and watch it come to life. AI creates a professional blueprint, then builds it instantly.</p>

      {botConnected && servers.length > 0 && (
        <div style={{ marginBottom: 24, width: '100%', maxWidth: 400 }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8, textAlign: 'left' }}>Target Server:</div>
          <ServerSelect compact />
        </div>
      )}

      <div className="prompt-cards">
        {prompts.map((prompt, i) => (
          <div key={i} className="prompt-card" onClick={() => onSelectPrompt(prompt.text)}>
            <div className="prompt-card-icon">
              <prompt.icon size={20} />
            </div>
            <div className="prompt-card-text">{prompt.text}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
