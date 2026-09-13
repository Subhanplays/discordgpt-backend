import React, { useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { Sun, Moon, Bot, Zap, LayoutTemplate, MessageSquare, Server, ArrowRight, Sparkles } from 'lucide-react'

export default function AuthPage() {
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    if (token) {
      localStorage.setItem('dgpt_token', token)
      window.location.href = '/'
    }
  }, [])

  const handleDiscordLogin = () => {
    window.location.href = '/api/auth/discord'
  }

  return (
    <div style={{
      minHeight: '100vh',
      overflowY: 'auto',
      background: 'var(--bg)',
      fontFamily: 'var(--font)',
    }}>
      <style>{`
        .lp-hero {
          position: relative;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 24px 64px;
          overflow: hidden;
        }
        .lp-hero-bg {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 80% 60% at 50% 40%, rgba(59,130,246,0.12) 0%, transparent 70%),
                      radial-gradient(ellipse 60% 50% at 70% 60%, rgba(139,92,246,0.06) 0%, transparent 60%);
          pointer-events: none;
        }
        .lp-hero-glow {
          position: absolute;
          top: -200px;
          left: 50%;
          transform: translateX(-50%);
          width: 800px;
          height: 800px;
          background: radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 60%);
          pointer-events: none;
          animation: lpPulse 6s ease-in-out infinite;
        }
        @keyframes lpPulse {
          0%,100% { opacity: 0.5; transform: translateX(-50%) scale(1); }
          50% { opacity: 1; transform: translateX(-50%) scale(1.1); }
        }
        .lp-hero-content {
          position: relative;
          z-index: 1;
          text-align: center;
          max-width: 680px;
        }
        .lp-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          background: var(--accent-subtle);
          border: 1px solid rgba(59,130,246,0.2);
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          color: var(--accent);
          margin-bottom: 24px;
        }
        .lp-hero-logo {
          width: 80px;
          height: 80px;
          margin: 0 auto 32px;
          border-radius: var(--radius-lg);
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadow-lg), 0 0 40px rgba(59,130,246,0.1);
        }
        .lp-hero-logo img {
          width: 48px;
          height: 48px;
          filter: var(--logo-filter);
        }
        .lp-hero-title {
          font-size: 52px;
          font-weight: 700;
          color: var(--text);
          letter-spacing: -0.03em;
          line-height: 1.1;
          margin-bottom: 16px;
        }
        .lp-hero-title span {
          background: linear-gradient(135deg, var(--accent), #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .lp-hero-subtitle {
          font-size: 18px;
          color: var(--text-secondary);
          margin-bottom: 40px;
          max-width: 520px;
          margin-left: auto;
          margin-right: auto;
          line-height: 1.6;
        }
        .lp-hero-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 16px 32px;
          background: #5865F2;
          color: #fff;
          border: none;
          border-radius: var(--radius-md);
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 200ms ease;
          font-family: var(--font);
        }
        .lp-hero-btn:hover {
          background: #4752c4;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(88,101,242,0.3);
        }
        .lp-hero-subtext {
          font-size: 13px;
          color: var(--text-muted);
          margin-top: 16px;
        }
        .lp-section {
          padding: 80px 24px;
          max-width: 1100px;
          margin: 0 auto;
        }
        .lp-section-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--accent);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 8px;
          text-align: center;
        }
        .lp-section-title {
          font-size: 32px;
          font-weight: 700;
          color: var(--text);
          text-align: center;
          margin-bottom: 12px;
          letter-spacing: -0.02em;
        }
        .lp-section-desc {
          font-size: 16px;
          color: var(--text-muted);
          text-align: center;
          max-width: 500px;
          margin: 0 auto 48px;
          line-height: 1.6;
        }
        .lp-features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .lp-feature-card {
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 32px 24px;
          transition: all 200ms ease;
        }
        .lp-feature-card:hover {
          border-color: var(--border-hover);
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
        }
        .lp-feature-icon {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-md);
          background: var(--accent-subtle);
          color: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
        }
        .lp-feature-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 8px;
        }
        .lp-feature-desc {
          font-size: 14px;
          color: var(--text-muted);
          line-height: 1.6;
        }
        .lp-steps {
          display: flex;
          gap: 32px;
          position: relative;
        }
        .lp-step {
          flex: 1;
          text-align: center;
          position: relative;
        }
        .lp-step-num {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: var(--accent-subtle);
          border: 2px solid var(--accent);
          color: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 700;
          margin: 0 auto 20px;
        }
        .lp-step-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 8px;
        }
        .lp-step-desc {
          font-size: 14px;
          color: var(--text-muted);
          line-height: 1.5;
        }
        .lp-step-connector {
          position: absolute;
          top: 24px;
          left: calc(50% + 32px);
          width: calc(100% - 64px);
          height: 2px;
          background: var(--border);
        }
        .lp-footer {
          padding: 32px 24px;
          text-align: center;
          border-top: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }
        .lp-footer-text {
          font-size: 13px;
          color: var(--text-muted);
        }
        .lp-footer-toggle {
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          cursor: pointer;
          padding: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 150ms ease;
        }
        .lp-footer-toggle:hover {
          background: var(--bg-elevated);
          color: var(--text);
        }
        .lp-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 32px;
          background: rgba(10,10,10,0.6);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border);
        }
        .lp-nav-brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .lp-nav-logo {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          filter: var(--logo-filter);
        }
        .lp-nav-name {
          font-size: 15px;
          font-weight: 600;
          color: var(--text);
        }
        .lp-nav-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .lp-nav-link {
          font-size: 13px;
          color: var(--text-secondary);
          text-decoration: none;
          cursor: pointer;
          transition: color 150ms ease;
          background: none;
          border: none;
          font-family: var(--font);
        }
        .lp-nav-link:hover {
          color: var(--text);
        }
        .lp-nav-btn {
          padding: 8px 16px;
          background: var(--accent);
          color: #fff;
          border: none;
          border-radius: var(--radius-sm);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 150ms ease;
          font-family: var(--font);
        }
        .lp-nav-btn:hover {
          background: var(--accent-hover);
        }
        @media (max-width: 768px) {
          .lp-hero-title { font-size: 36px; }
          .lp-hero-subtitle { font-size: 16px; }
          .lp-features-grid { grid-template-columns: 1fr; }
          .lp-steps { flex-direction: column; gap: 24px; }
          .lp-step-connector { display: none; }
          .lp-nav { padding: 12px 16px; }
          .lp-nav-link { display: none; }
        }
      `}</style>

      <nav className="lp-nav">
        <div className="lp-nav-brand">
          <img src="/logo.svg" alt="DiscordGPT" className="lp-nav-logo" />
          <span className="lp-nav-name">DiscordGPT</span>
        </div>
        <div className="lp-nav-right">
          <button className="lp-nav-link" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button className="lp-nav-btn" onClick={handleDiscordLogin}>Get Started</button>
        </div>
      </nav>

      <section className="lp-hero">
        <div className="lp-hero-bg" />
        <div className="lp-hero-glow" />
        <div className="lp-hero-content">
          <div className="lp-hero-badge">
            <Sparkles size={14} />
            AI-Powered Server Builder
          </div>
          <div className="lp-hero-logo">
            <img src="/logo.svg" alt="DiscordGPT" />
          </div>
          <h1 className="lp-hero-title">
            Build Discord Servers<br />with <span>AI</span>
          </h1>
          <p className="lp-hero-subtitle">
            Create, manage, and automate your Discord server with natural language.
            No code required — just describe what you want.
          </p>
          <button className="lp-hero-btn" onClick={handleDiscordLogin}>
            <svg width="20" height="16" viewBox="0 0 71 55" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5604 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.9048 3.0581 26.1885 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.4218 0.40133C20.3475 1.2916 15.4948 2.8214 10.9693 4.8978C10.9693 4.8978 6.86847 11.0623 6.07067 17.1568C0.857776 24.7397 0.064707 32.1073 0.467713 39.3675C0.482247 39.4475 0.561648 39.5097 0.644049 39.5097C6.47654 42.6062 12.1445 44.4138 17.7245 45.5639C17.8085 45.5801 17.8928 45.5522 17.9591 45.4884C19.4858 43.4164 20.8232 41.2152 21.9604 38.9044C22.0267 38.8411 22.0108 38.7409 21.9337 38.6983C19.6683 37.8558 17.4953 36.7558 15.4519 35.4245C15.3029 35.3275 15.3029 35.1318 15.4519 35.0348C15.9725 34.7117 16.4931 34.3765 16.9922 34.0286C17.0782 33.9713 17.1806 33.9638 17.273 34.0074C29.5917 39.6658 42.8085 39.6658 55.0431 34.0074C55.1375 33.9618 55.2399 33.9713 55.3279 34.0286C55.8287 34.3765 56.3493 34.7117 56.8681 35.0348C57.0171 35.1318 57.0171 35.3275 56.8681 35.4245C54.8247 36.7558 52.6517 37.8558 50.3844 38.6983C50.3073 38.7409 50.2934 38.8411 50.3577 38.9044C51.4949 41.2152 52.8323 43.4164 54.359 45.4884C54.4253 45.5522 54.5116 45.5801 54.5956 45.5639C60.1775 44.4138 65.8455 42.6062 71.678 39.5097C71.7624 39.5097 71.8418 39.4475 71.8553 39.3675C72.3314 31.0951 70.8709 23.7657 66.0665 17.3131C66.0665 17.3131 61.9657 11.0989 60.1045 4.8978ZM23.7259 32.4621C20.2729 32.4621 17.4516 29.3049 17.4516 25.4517C17.4516 21.5985 20.2189 18.4144 23.7259 18.4144C27.2661 18.4144 30.0456 21.5985 30.0002 25.4517C30.0002 29.3049 27.2458 32.4621 23.7259 32.4621ZM47.3178 32.4621C43.8648 32.4621 41.0435 29.3049 41.0435 25.4517C41.0435 21.5985 43.8108 18.4144 47.3178 18.4144C50.858 18.4144 53.6376 21.5985 53.5921 25.4517C53.5921 29.3049 50.858 32.4621 47.3178 32.4621Z" fill="currentColor"/>
            </svg>
            Get Started
            <ArrowRight size={18} />
          </button>
          <p className="lp-hero-subtext">Free to use. No credit card required.</p>
        </div>
      </section>

      <section className="lp-section">
        <div className="lp-section-label">Features</div>
        <h2 className="lp-section-title">Everything you need</h2>
        <p className="lp-section-desc">
          Powerful tools to build and manage your Discord server, powered by AI.
        </p>
        <div className="lp-features-grid">
          <div className="lp-feature-card">
            <div className="lp-feature-icon">
              <Bot size={24} />
            </div>
            <h3 className="lp-feature-title">AI Server Builder</h3>
            <p className="lp-feature-desc">
              Describe your ideal server and watch AI generate a complete blueprint with channels, roles, permissions, and bots — all in seconds.
            </p>
          </div>
          <div className="lp-feature-card">
            <div className="lp-feature-icon">
              <Zap size={24} />
            </div>
            <h3 className="lp-feature-title">One-Click Deploy</h3>
            <p className="lp-feature-desc">
              Deploy your server instantly. Review the blueprint, approve it, and your Discord server is live with a single click.
            </p>
          </div>
          <div className="lp-feature-card">
            <div className="lp-feature-icon">
              <LayoutTemplate size={24} />
            </div>
            <h3 className="lp-feature-title">Smart Templates</h3>
            <p className="lp-feature-desc">
              Choose from a library of pre-built templates for gaming, study groups, communities, and more. Customize them with natural language.
            </p>
          </div>
        </div>
      </section>

      <section className="lp-section">
        <div className="lp-section-label">How it works</div>
        <h2 className="lp-section-title">Three steps to your server</h2>
        <p className="lp-section-desc">
          Getting started is simple. Just describe what you want.
        </p>
        <div className="lp-steps">
          <div className="lp-step">
            <div className="lp-step-num">1</div>
            <h3 className="lp-step-title">Describe Your Server</h3>
            <p className="lp-step-desc">
              Tell us what you want — a gaming community, a study group, a support desk. Use plain language.
            </p>
            <div className="lp-step-connector" />
          </div>
          <div className="lp-step">
            <div className="lp-step-num">2</div>
            <h3 className="lp-step-title">Review the Blueprint</h3>
            <p className="lp-step-desc">
              AI generates a complete server structure. Review channels, roles, and settings before deploying.
            </p>
            <div className="lp-step-connector" />
          </div>
          <div className="lp-step">
            <div className="lp-step-num">3</div>
            <h3 className="lp-step-title">Deploy Instantly</h3>
            <p className="lp-step-desc">
              Hit deploy and your server is live. Start inviting members right away.
            </p>
          </div>
        </div>
      </section>

      <footer className="lp-footer">
        <span className="lp-footer-text">Built with AI</span>
        <button className="lp-footer-toggle" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </footer>
    </div>
  )
}
