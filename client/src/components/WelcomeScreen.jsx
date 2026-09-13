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
        <img src="/logo.svg" alt="DiscordGPT" className="welcome-logo-img" />
      </div>
      <h1 className="welcome-title">DiscordGPT</h1>
      <p className="welcome-subtitle">AI-Powered Discord Server Builder</p>
      <p className="welcome-desc">Describe your dream Discord server and watch it come to life. AI creates a professional blueprint, then builds it instantly.</p>

      {botConnected && servers.length > 0 && (
        <div style={{ marginBottom: 20, width: '100%', maxWidth: 380 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, textAlign: 'left' }}>Target Server:</div>
          <ServerSelect compact />
        </div>
      )}

      <div className="prompt-cards">
        {prompts.map((prompt, i) => (
          <div key={i} className="prompt-card" onClick={() => onSelectPrompt(prompt.text)}>
            <div className="prompt-card-icon">
              <prompt.icon size={18} />
            </div>
            <div className="prompt-card-text">{prompt.text}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
