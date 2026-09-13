import React, { useState, useEffect } from 'react'
import { Sparkles, ChevronRight, ChevronLeft, X, Settings, Server, LayoutTemplate, MessageSquare } from 'lucide-react'

const STEPS = [
  {
    icon: <MessageSquare size={28} />,
    title: 'Welcome to DiscordGPT!',
    description: 'Your AI-powered Discord server builder. Create, manage, and automate your Discord server with natural language.',
    highlight: null,
  },
  {
    icon: <Settings size={28} />,
    title: 'Connect your Discord bot',
    description: 'Head to Settings and add your bot token to get started. This links DiscordGPT to your server.',
    highlight: 'settings',
  },
  {
    icon: <Server size={28} />,
    title: 'Select a server',
    description: 'Pick which Discord server you want to manage from the server selector in the sidebar.',
    highlight: 'server-select',
  },
  {
    icon: <Sparkles size={28} />,
    title: 'Create your first server',
    description: 'Use the magic create button in the chat composer to instantly generate a full server blueprint.',
    highlight: 'create-btn',
  },
  {
    icon: <LayoutTemplate size={28} />,
    title: 'Use templates',
    description: 'Browse pre-built templates for common server setups — gaming, study groups, communities, and more.',
    highlight: 'templates',
  },
  {
    icon: <Sparkles size={28} />,
    title: "You're ready!",
    description: "Everything's set up. Start chatting and let AI build your perfect Discord server.",
    highlight: null,
  },
]

export default function Onboarding() {
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(false)
  const [fade, setFade] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('dgpt_onboarded')) {
      setVisible(true)
      requestAnimationFrame(() => requestAnimationFrame(() => setFade(true)))
    }
  }, [])

  const close = () => {
    setFade(false)
    setTimeout(() => {
      setVisible(false)
      localStorage.setItem('dgpt_onboarded', '1')
    }, 250)
  }

  const next = () => {
    if (step < STEPS.length - 1) {
      setFade(false)
      setTimeout(() => {
        setStep(s => s + 1)
        requestAnimationFrame(() => requestAnimationFrame(() => setFade(true)))
      }, 150)
    } else {
      close()
    }
  }

  const prev = () => {
    if (step > 0) {
      setFade(false)
      setTimeout(() => {
        setStep(s => s - 1)
        requestAnimationFrame(() => requestAnimationFrame(() => setFade(true)))
      }, 150)
    }
  }

  if (!visible) return null

  const current = STEPS[step]

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      opacity: fade ? 1 : 0,
      transition: 'opacity 250ms ease',
    }}>
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: 440,
        margin: '0 24px',
        background: 'rgba(17, 17, 19, 0.85)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset',
        padding: '40px 32px 32px',
        opacity: fade ? 1 : 0,
        transform: fade ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.97)',
        transition: 'all 250ms ease',
      }}>
        <button
          onClick={close}
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: 4,
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            transition: 'color 150ms ease',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <X size={18} />
        </button>

        <div style={{
          width: 56,
          height: 56,
          borderRadius: 'var(--radius-md)',
          background: 'var(--accent-subtle)',
          color: 'var(--accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
        }}>
          {current.icon}
        </div>

        <h2 style={{
          fontSize: 22,
          fontWeight: 700,
          color: 'var(--text)',
          marginBottom: 8,
          letterSpacing: '-0.02em',
        }}>
          {current.title}
        </h2>

        <p style={{
          fontSize: 14,
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          marginBottom: 32,
        }}>
          {current.description}
        </p>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {STEPS.map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === step ? 20 : 6,
                  height: 6,
                  borderRadius: 3,
                  background: i === step ? 'var(--accent)' : 'var(--bg-active)',
                  transition: 'all 250ms ease',
                }}
              />
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {step > 0 && (
              <button
                onClick={prev}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '8px 12px',
                  background: 'none',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-muted)',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                  fontFamily: 'var(--font)',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                <ChevronLeft size={16} />
                Back
              </button>
            )}

            {step < STEPS.length - 1 && (
              <button
                onClick={close}
                style={{
                  padding: '8px 12px',
                  background: 'none',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-muted)',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
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
                padding: '8px 16px',
                background: 'var(--accent)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 150ms ease',
                fontFamily: 'var(--font)',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}
            >
              {step === STEPS.length - 1 ? 'Get Started' : 'Next'}
              {step < STEPS.length - 1 && <ChevronRight size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
