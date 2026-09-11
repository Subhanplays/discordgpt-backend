import React from 'react'
import { Hammer, Gamepad2, Headphones, Palette } from 'lucide-react'

const prompts = [
  { text: 'Create a Minecraft hosting server', icon: Hammer },
  { text: 'Create a gaming community', icon: Gamepad2 },
  { text: 'Create a professional support server', icon: Headphones },
  { text: 'Create a creator community', icon: Palette }
]

export default function WelcomeScreen({ onSelectPrompt }) {
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
      <p className="welcome-subtitle">Build your Discord server with AI</p>
      <p className="welcome-desc">Describe the Discord server you want and DiscordGPT will create its structure automatically.</p>
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
