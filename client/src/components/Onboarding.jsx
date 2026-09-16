import React, { useState, useEffect } from 'react'
import { Sparkles, ChevronRight, ChevronLeft, X, Settings, Server, LayoutTemplate, MessageSquare, Rocket, CheckCircle } from 'lucide-react'

const STEPS = [
  {
    icon: <Sparkles size={28} />,
    title: 'Welcome to DiscordGPT!',
    description: 'Your AI-powered Discord server builder. Create, manage, and automate your Discord server with natural language.',
    color: '#3b82f6',
  },
  {
    icon: <Settings size={28} />,
    title: 'Connect your bot',
    description: 'Head to Settings and add your Discord bot token. This links DiscordGPT to your server so it can manage channels, roles, and more.',
    color: '#8b5cf6',
  },
  {
    icon: <Server size={28} />,
    title: 'Select a server',
    description: 'Pick which Discord server you want to manage from the server selector. You can switch between servers anytime.',
    color: '#06b6d4',
  },
  {
    icon: <MessageSquare size={28} />,
    title: 'Describe what you want',
    description: 'Just type naturally — "Create a gaming server with voice channels and a bot" — and AI generates a complete blueprint.',
    color: '#22c55e',
  },
  {
    icon: <Rocket size={28} />,
    title: 'Deploy in one click',
    description: 'Review the generated blueprint, approve it, and your server is live on Discord with everything configured.',
    color: '#f59e0b',
  },
  {
    icon: <CheckCircle size={28} />,
    title: "You're all set!",
    description: "Everything's ready. Start chatting and let AI build your perfect Discord server. You can always come back to this tutorial from Settings.",
    color: '#22c55e',
  },
]

export default function Onboarding() {
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(false)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('dgpt_onboarded')) {
      setTimeout(() => setVisible(true), 600)
    }
  }, [])

  const close = () => {
    setAnimating(true)
    setTimeout(() => {
      setVisible(false)
      localStorage.setItem('dgpt_onboarded', '1')
    }, 300)
  }

  const next = () => {
    if (step < STEPS.length - 1) {
      setAnimating(true)
      setTimeout(() => {
        setStep(s => s + 1)
        setAnimating(false)
      }, 200)
    } else {
      close()
    }
  }

  const prev = () => {
    if (step > 0) {
      setAnimating(true)
      setTimeout(() => {
        setStep(s => s - 1)
        setAnimating(false)
      }, 200)
    }
  }

  if (!visible) return null

  const current = STEPS[step]
  const progress = ((step + 1) / STEPS.length) * 100

  return (
    <div className="onboarding-overlay" style={{ opacity: animating ? 0 : 1, transition: 'opacity 200ms ease' }}>
      <div className="onboarding-card" style={{
        transform: animating ? 'scale(0.96) translateY(8px)' : 'scale(1) translateY(0)',
        transition: 'transform 300ms cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        {/* Progress bar */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: 'var(--bg-active)',
          borderRadius: '16px 16px 0 0',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${current.color}, ${current.color}88)`,
            transition: 'width 400ms cubic-bezier(0.34,1.56,0.64,1)',
            borderRadius: 2,
          }} />
        </div>

        {/* Close button */}
        <button
          onClick={close}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: 6,
            borderRadius: 'var(--radius-xs)',
            display: 'flex',
            transition: 'all 150ms',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.background = 'var(--bg-hover)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'none' }}
        >
          <X size={16} />
        </button>

        {/* Step counter */}
        <div style={{
          fontSize: 11,
          fontWeight: 600,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: 20,
        }}>
          Step {step + 1} of {STEPS.length}
        </div>

        {/* Icon */}
        <div style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: `${current.color}15`,
          border: `1px solid ${current.color}25`,
          color: current.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
          boxShadow: `0 0 30px ${current.color}15`,
        }}>
          {current.icon}
        </div>

        {/* Content */}
        <h2 style={{
          fontSize: 24,
          fontWeight: 800,
          color: 'var(--text)',
          marginBottom: 10,
          letterSpacing: '-0.02em',
        }}>
          {current.title}
        </h2>

        <p style={{
          fontSize: 15,
          color: 'var(--text-secondary)',
          lineHeight: 1.7,
          marginBottom: 36,
          maxWidth: 380,
          margin: '0 auto 36px',
        }}>
          {current.description}
        </p>

        {/* Navigation */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {/* Dots */}
          <div style={{ display: 'flex', gap: 6 }}>
            {STEPS.map((s, i) => (
              <div
                key={i}
                style={{
                  width: i === step ? 24 : 6,
                  height: 6,
                  borderRadius: 3,
                  background: i === step ? current.color : i < step ? `${current.color}40` : 'var(--bg-active)',
                  transition: 'all 400ms cubic-bezier(0.34,1.56,0.64,1)',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  setAnimating(true)
                  setTimeout(() => { setStep(i); setAnimating(false) }, 200)
                }}
              />
            ))}
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {step > 0 && (
              <button
                onClick={prev}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '9px 14px',
                  background: 'none',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-secondary)',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 150ms',
                  fontFamily: 'var(--font)',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.color = 'var(--text)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
              >
                <ChevronLeft size={15} />
                Back
              </button>
            )}

            {step < STEPS.length - 1 && (
              <button
                onClick={close}
                style={{
                  padding: '9px 14px',
                  background: 'none',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-muted)',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 150ms',
                  fontFamily: 'var(--font)',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                Skip
              </button>
            )}

            <button
              onClick={next}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '9px 20px',
                background: current.color,
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 200ms',
                fontFamily: 'var(--font)',
                boxShadow: `0 0 20px ${current.color}30`,
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 4px 24px ${current.color}40` }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 0 20px ${current.color}30` }}
            >
              {step === STEPS.length - 1 ? 'Get Started' : 'Next'}
              {step < STEPS.length - 1 && <ChevronRight size={15} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
