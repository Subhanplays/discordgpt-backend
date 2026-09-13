import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { Sun, Moon, ArrowRight, ChevronRight, Bot, Zap, LayoutTemplate, Shield, Brain, Rocket, Check } from 'lucide-react'

function Counter({ target, duration = 1800, suffix = '' }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const [vis, setVis] = useState(false)
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true) }, { threshold: 0.5 })
    if (ref.current) o.observe(ref.current)
    return () => o.disconnect()
  }, [])
  useEffect(() => {
    if (!vis) return
    const start = performance.now()
    const animate = (now) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [vis, target, duration])
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

function Reveal({ children, delay = 0, className = '' }) {
  const [v, setV] = useState(false)
  const r = useRef(null)
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true) }, { threshold: 0.15 })
    if (r.current) o.observe(r.current)
    return () => o.disconnect()
  }, [])
  return (
    <div ref={r} className={className} style={{
      opacity: v ? 1 : 0,
      transform: v ? 'translateY(0)' : 'translateY(40px)',
      transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
    }}>{children}</div>
  )
}

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme()
  const [scrollY, setScrollY] = useState(0)
  const previewRef = useRef(null)
  const [previewRotate, setPreviewRotate] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const onPreviewMouse = useCallback((e) => {
    const el = previewRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setPreviewRotate({ x: y * -6, y: x * 6 })
  }, [])

  const onPreviewLeave = useCallback(() => setPreviewRotate({ x: 0, y: 0 }), [])

  return (
    <div style={{ minHeight: '100vh', background: '#09090b', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif', color: '#fafafa', overflowX: 'hidden' }}>
      <style>{`
        * { margin:0; padding:0; box-sizing:border-box; }
        .l-nav {
          position:fixed; top:0; left:0; right:0; z-index:100;
          display:flex; align-items:center; justify-content:space-between;
          padding:0 48px; height:64px;
          background:rgba(9,9,11,${scrollY > 40 ? '0.8' : '0'});
          backdrop-filter:blur(${scrollY > 40 ? '16px' : '0'});
          border-bottom:1px solid rgba(255,255,255,${scrollY > 40 ? '0.06' : '0'});
          transition:all 0.3s ease;
        }
        .l-nav-brand { display:flex; align-items:center; gap:10px; text-decoration:none; }
        .l-nav-logo { width:28px; height:28px; border-radius:7px; filter:var(--logo-filter); }
        .l-nav-name { font-size:15px; font-weight:600; color:#fafafa; letter-spacing:-0.01em; }
        .l-nav-right { display:flex; align-items:center; gap:4px; }
        .l-nav-item {
          font-size:13.5px; color:#a1a1aa; background:none; border:none;
          padding:8px 14px; border-radius:6px; cursor:pointer; font-family:inherit;
          transition:all 0.15s;
        }
        .l-nav-item:hover { color:#fafafa; background:rgba(255,255,255,0.06); }
        .l-nav-cta {
          margin-left:8px; padding:8px 18px; background:#fff; color:#09090b;
          border:none; border-radius:8px; font-size:13.5px; font-weight:600;
          cursor:pointer; font-family:inherit; transition:all 0.2s;
        }
        .l-nav-cta:hover { background:#e4e4e7; transform:translateY(-1px); }

        .l-hero {
          position:relative; min-height:100vh; display:flex; flex-direction:column;
          align-items:center; justify-content:center; padding:120px 24px 80px;
          text-align:center;
        }
        .l-hero-bg {
          position:absolute; inset:0; pointer-events:none;
          background:
            radial-gradient(ellipse 50% 40% at 50% 20%, rgba(59,130,246,0.08) 0%, transparent 100%),
            radial-gradient(ellipse 40% 30% at 70% 60%, rgba(139,92,246,0.04) 0%, transparent 100%);
        }
        .l-hero-content { position:relative; z-index:1; max-width:720px; }
        .l-hero-chip {
          display:inline-flex; align-items:center; gap:6px;
          padding:5px 14px 5px 8px; background:rgba(255,255,255,0.06);
          border:1px solid rgba(255,255,255,0.08); border-radius:100px;
          font-size:12.5px; color:#a1a1aa; margin-bottom:32px;
        }
        .l-hero-chip-dot { width:6px; height:6px; border-radius:50%; background:#22c55e; }
        .l-hero h1 {
          font-size:clamp(48px,7.5vw,84px); font-weight:700; letter-spacing:-0.04em;
          line-height:1.05; margin-bottom:24px; color:#fafafa;
        }
        .l-hero h1 em {
          font-style:normal;
          background:linear-gradient(135deg, #3b82f6, #8b5cf6);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
        }
        .l-hero p {
          font-size:18px; color:#71717a; line-height:1.7;
          max-width:520px; margin:0 auto 40px;
        }
        .l-hero-btns { display:flex; gap:12px; justify-content:center; margin-bottom:56px; }
        .l-btn-primary {
          display:inline-flex; align-items:center; gap:8px;
          padding:12px 28px; background:#fafafa; color:#09090b;
          border:none; border-radius:10px; font-size:14px; font-weight:600;
          cursor:pointer; font-family:inherit; transition:all 0.2s;
          text-decoration:none;
        }
        .l-btn-primary:hover { background:#e4e4e7; transform:translateY(-1px); box-shadow:0 4px 20px rgba(255,255,255,0.1); }
        .l-btn-secondary {
          display:inline-flex; align-items:center; gap:8px;
          padding:12px 28px; background:transparent; color:#fafafa;
          border:1px solid rgba(255,255,255,0.12); border-radius:10px;
          font-size:14px; font-weight:500; cursor:pointer; font-family:inherit;
          transition:all 0.2s; text-decoration:none;
        }
        .l-btn-secondary:hover { border-color:rgba(255,255,255,0.25); background:rgba(255,255,255,0.04); }

        .l-hero-metrics {
          display:flex; justify-content:center; gap:48px;
        }
        .l-metric { text-align:left; }
        .l-metric-val { font-size:28px; font-weight:700; color:#fafafa; letter-spacing:-0.02em; }
        .l-metric-label { font-size:13px; color:#52525b; margin-top:2px; }

        .l-preview-section {
          position:relative; padding:0 24px 120px;
          display:flex; justify-content:center;
        }
        .l-preview-wrap {
          position:relative; width:100%; max-width:1040px;
          perspective:1200px;
        }
        .l-preview-glow {
          position:absolute; top:50%; left:50%; width:600px; height:400px;
          transform:translate(-50%,-50%); z-index:0;
          background:radial-gradient(ellipse, rgba(59,130,246,0.1) 0%, transparent 70%);
          filter:blur(60px); pointer-events:none;
        }
        .l-preview {
          position:relative; z-index:1;
          background:#111113; border:1px solid rgba(255,255,255,0.08);
          border-radius:16px; overflow:hidden;
          box-shadow:0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset;
          transform:perspective(1200px) rotateX(${previewRotate.x}deg) rotateY(${previewRotate.y}deg);
          transition:transform 0.15s ease-out;
        }
        .l-preview-bar {
          display:flex; align-items:center; gap:8px; padding:12px 16px;
          background:rgba(255,255,255,0.03); border-bottom:1px solid rgba(255,255,255,0.06);
        }
        .l-dot { width:10px; height:10px; border-radius:50%; }
        .l-dot.r { background:#ff5f56; }
        .l-dot.y { background:#ffbd2e; }
        .l-dot.g { background:#27c93f; }
        .l-preview-title { flex:1; text-align:center; font-size:12px; color:#52525b; }
        .l-preview-body { display:flex; min-height:420px; }
        .l-preview-side {
          width:200px; border-right:1px solid rgba(255,255,255,0.06);
          padding:12px 8px; display:flex; flex-direction:column; gap:2px;
        }
        .l-side-label {
          font-size:10px; font-weight:700; color:#52525b; text-transform:uppercase;
          letter-spacing:0.1em; padding:12px 12px 6px;
        }
        .l-side-item {
          padding:8px 12px; border-radius:6px; font-size:13px; color:#71717a;
          display:flex; align-items:center; gap:8px; cursor:pointer; transition:all 0.1s;
        }
        .l-side-item:hover { background:rgba(255,255,255,0.04); color:#a1a1aa; }
        .l-side-item.active { background:rgba(59,130,246,0.1); color:#3b82f6; }
        .l-preview-chat { flex:1; padding:24px; display:flex; flex-direction:column; gap:16px; }
        .l-msg { display:flex; gap:12px; }
        .l-msg-av {
          width:32px; height:32px; border-radius:50%; flex-shrink:0;
          display:flex; align-items:center; justify-content:center;
        }
        .l-msg-av.user { background:#3b82f6; color:#fff; font-size:12px; font-weight:600; }
        .l-msg-av.ai { background:rgba(139,92,246,0.15); border:1px solid rgba(139,92,246,0.2); }
        .l-msg-av.ai img { width:16px; height:16px; filter:var(--logo-filter); }
        .l-msg-body { flex:1; }
        .l-msg-name { font-size:12px; font-weight:600; color:#a1a1aa; margin-bottom:4px; }
        .l-msg-text { font-size:13.5px; color:#d4d4d8; line-height:1.6; }
        .l-msg-text strong { color:#fafafa; font-weight:600; }
        .l-msg-bubble {
          padding:12px 16px; border-radius:12px; margin-top:4px;
        }
        .l-msg-bubble.user { background:#3b82f6; color:#fff; display:inline-block; border-bottom-left-radius:4px; }
        .l-msg-bubble.ai { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.06); }
        .l-blueprint-card {
          margin-top:12px; padding:12px 14px; background:rgba(59,130,246,0.06);
          border:1px solid rgba(59,130,246,0.12); border-radius:10px;
          font-size:12px; color:#a1a1aa;
        }
        .l-blueprint-card strong { color:#3b82f6; }
        .l-deploy-badge {
          display:inline-flex; align-items:center; gap:8px; margin-top:10px;
          padding:8px 14px; background:rgba(34,197,94,0.08);
          border:1px solid rgba(34,197,94,0.15); border-radius:8px;
          font-size:12px; color:#22c55e; font-weight:500;
        }

        .l-section { padding:120px 24px; max-width:1120px; margin:0 auto; }
        .l-label {
          font-size:12px; font-weight:600; color:#3b82f6; text-transform:uppercase;
          letter-spacing:0.1em; margin-bottom:12px;
        }
        .l-heading {
          font-size:clamp(28px,4vw,40px); font-weight:700; color:#fafafa;
          letter-spacing:-0.03em; line-height:1.15; margin-bottom:14px;
        }
        .l-desc { font-size:16px; color:#71717a; line-height:1.7; max-width:480px; margin-bottom:56px; }

        .l-features-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
        .l-feature {
          padding:32px 28px; background:rgba(255,255,255,0.02);
          border:1px solid rgba(255,255,255,0.06); border-radius:14px;
          transition:all 0.25s ease;
        }
        .l-feature:hover {
          border-color:rgba(255,255,255,0.12);
          background:rgba(255,255,255,0.03);
          transform:translateY(-2px);
        }
        .l-feature-icon {
          width:40px; height:40px; border-radius:10px;
          background:rgba(59,130,246,0.1); color:#3b82f6;
          display:flex; align-items:center; justify-content:center;
          margin-bottom:20px;
        }
        .l-feature h3 { font-size:16px; font-weight:600; color:#fafafa; margin-bottom:8px; }
        .l-feature p { font-size:14px; color:#71717a; line-height:1.65; }

        .l-steps { display:grid; grid-template-columns:repeat(3,1fr); gap:32px; }
        .l-step { position:relative; }
        .l-step-num {
          font-size:48px; font-weight:800; color:rgba(255,255,255,0.06);
          letter-spacing:-0.04em; margin-bottom:12px; line-height:1;
        }
        .l-step h3 { font-size:17px; font-weight:600; color:#fafafa; margin-bottom:8px; }
        .l-step p { font-size:14px; color:#71717a; line-height:1.65; }
        .l-step-line {
          position:absolute; top:24px; left:calc(50% + 20px);
          width:calc(100% - 40px); height:1px;
          background:linear-gradient(90deg, rgba(255,255,255,0.08), transparent);
        }

        .l-logos {
          padding:80px 24px; text-align:center;
          border-top:1px solid rgba(255,255,255,0.04);
          border-bottom:1px solid rgba(255,255,255,0.04);
        }
        .l-logos-label {
          font-size:12px; font-weight:600; color:#52525b; text-transform:uppercase;
          letter-spacing:0.1em; margin-bottom:32px;
        }
        .l-logos-row {
          display:flex; align-items:center; justify-content:center;
          gap:48px; flex-wrap:wrap; max-width:800px; margin:0 auto;
        }
        .l-logo-item {
          font-size:15px; font-weight:600; color:#3f3f46;
          display:flex; align-items:center; gap:8px; transition:color 0.2s;
        }
        .l-logo-item:hover { color:#a1a1aa; }

        .l-cta {
          padding:120px 24px; text-align:center;
        }
        .l-cta-box {
          max-width:640px; margin:0 auto; padding:64px 48px;
          background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06);
          border-radius:20px;
        }
        .l-cta h2 {
          font-size:clamp(24px,4vw,36px); font-weight:700; color:#fafafa;
          letter-spacing:-0.03em; margin-bottom:14px;
        }
        .l-cta p { font-size:16px; color:#71717a; margin-bottom:32px; max-width:420px; margin-left:auto; margin-right:auto; line-height:1.7; }
        .l-cta-btn {
          display:inline-flex; align-items:center; gap:8px;
          padding:14px 32px; background:#fafafa; color:#09090b;
          border:none; border-radius:10px; font-size:15px; font-weight:600;
          cursor:pointer; font-family:inherit; transition:all 0.2s;
        }
        .l-cta-btn:hover { background:#e4e4e7; transform:translateY(-1px); box-shadow:0 4px 20px rgba(255,255,255,0.1); }

        .l-footer {
          padding:32px 48px; border-top:1px solid rgba(255,255,255,0.04);
          display:flex; align-items:center; justify-content:space-between;
        }
        .l-footer-left { font-size:13px; color:#3f3f46; display:flex; align-items:center; gap:8px; }
        .l-footer-right { display:flex; align-items:center; gap:16px; }
        .l-footer-link {
          font-size:13px; color:#52525b; text-decoration:none; transition:color 0.15s;
        }
        .l-footer-link:hover { color:#a1a1aa; }
        .l-footer-theme {
          background:none; border:1px solid rgba(255,255,255,0.08);
          border-radius:6px; color:#52525b; padding:6px; cursor:pointer;
          display:flex; align-items:center; transition:all 0.15s;
        }
        .l-footer-theme:hover { color:#a1a1aa; border-color:rgba(255,255,255,0.15); }

        @media(max-width:768px) {
          .l-nav { padding:0 16px; }
          .l-nav-item { display:none; }
          .l-features-grid, .l-steps { grid-template-columns:1fr; }
          .l-step-line { display:none; }
          .l-preview-side { display:none; }
          .l-hero-metrics { gap:24px; }
          .l-metric-val { font-size:22px; }
          .l-footer { flex-direction:column; gap:16px; text-align:center; }
        }
      `}</style>

      {/* Nav */}
      <nav className="l-nav">
        <a href="/" className="l-nav-brand">
          <img src="/logo.svg" alt="DiscordGPT" className="l-nav-logo" />
          <span className="l-nav-name">DiscordGPT</span>
        </a>
        <div className="l-nav-right">
          <button className="l-nav-item" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <button className="l-nav-item" onClick={() => window.location.href = '/api/auth/discord'}>Sign in</button>
          <button className="l-nav-cta" onClick={() => window.location.href = '/api/auth/discord'}>Get Started</button>
        </div>
      </nav>

      {/* Hero */}
      <section className="l-hero">
        <div className="l-hero-bg" />
        <div className="l-hero-content">
          <Reveal>
            <div className="l-hero-chip">
              <div className="l-hero-chip-dot" />
              Now with Multi-AI routing
            </div>
          </Reveal>
          <Reveal delay={80}>
            <h1>
              Build Discord servers<br />
              with <em>AI</em>
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p>
              Describe your server in natural language. Get a complete blueprint with channels, roles, and permissions. Deploy in one click.
            </p>
          </Reveal>
          <Reveal delay={240}>
            <div className="l-hero-btns">
              <a href="/api/auth/discord" className="l-btn-primary">
                Get started free <ArrowRight size={15} />
              </a>
              <button className="l-btn-secondary" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
                Learn more <ChevronRight size={15} />
              </button>
            </div>
          </Reveal>
          <Reveal delay={320}>
            <div className="l-hero-metrics">
              <div className="l-metric">
                <div className="l-metric-val"><Counter target={2847} /></div>
                <div className="l-metric-label">Servers created</div>
              </div>
              <div className="l-metric">
                <div className="l-metric-val"><Counter target={1200} /></div>
                <div className="l-metric-label">Active users</div>
              </div>
              <div className="l-metric">
                <div className="l-metric-val"><Counter target={99} suffix="%" /></div>
                <div className="l-metric-label">Uptime</div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Preview */}
      <div className="l-preview-section">
        <Reveal>
          <div className="l-preview-wrap" ref={previewRef} onMouseMove={onPreviewMouse} onMouseLeave={onPreviewLeave}>
            <div className="l-preview-glow" />
            <div className="l-preview">
              <div className="l-preview-bar">
                <div className="l-dot r" />
                <div className="l-dot y" />
                <div className="l-dot g" />
                <div className="l-preview-title">discordgpt.vercel.app</div>
              </div>
              <div className="l-preview-body">
                <div className="l-preview-side">
                  <div className="l-side-label">Conversations</div>
                  <div className="l-side-item active">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    Gaming Server
                  </div>
                  <div className="l-side-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    Study Group
                  </div>
                  <div className="l-side-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    Art Community
                  </div>
                  <div className="l-side-label" style={{marginTop:8}}>Templates</div>
                  <div className="l-side-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
                    Gaming Hub
                  </div>
                  <div className="l-side-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
                    Study Lounge
                  </div>
                </div>
                <div className="l-preview-chat">
                  <div className="l-msg">
                    <div className="l-msg-av user">A</div>
                    <div className="l-msg-body">
                      <div className="l-msg-name">You</div>
                      <div className="l-msg-bubble user">
                        Create a gaming server with voice channels, tournament brackets, and role-based access
                      </div>
                    </div>
                  </div>
                  <div className="l-msg">
                    <div className="l-msg-av ai">
                      <img src="/logo.svg" alt="" />
                    </div>
                    <div className="l-msg-body">
                      <div className="l-msg-name">DiscordGPT</div>
                      <div className="l-msg-text">
                        Generated a complete blueprint with 4 categories, 16 channels, and 8 custom roles.
                        <div className="l-blueprint-card">
                          <strong>Categories & Channels</strong><br />
                          <span style={{color:'#71717a'}}>Info</span> — #rules · #announcements · #roles<br />
                          <span style={{color:'#71717a'}}>General</span> — #general · #memes · #off-topic<br />
                          <span style={{color:'#71717a'}}>Gaming</span> — #looking-for-group · #clips · #lfg<br />
                          <span style={{color:'#71717a'}}>Voice</span> — General · Gaming · AFK
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="l-msg">
                    <div className="l-msg-av ai">
                      <img src="/logo.svg" alt="" />
                    </div>
                    <div className="l-msg-body">
                      <div className="l-msg-name">DiscordGPT</div>
                      <div className="l-msg-text">
                        <div className="l-deploy-badge">
                          <Zap size={14} /> Deployed — 16 channels, 8 roles, moderation active
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Logos */}
      <div className="l-logos">
        <div className="l-logos-label">Powered by</div>
        <div className="l-logos-row">
          <div className="l-logo-item"><Bot size={18} /> OpenAI</div>
          <div className="l-logo-item"><Brain size={18} /> Anthropic</div>
          <div className="l-logo-item"><Zap size={18} /> Groq</div>
          <div className="l-logo-item"><Rocket size={18} /> DeepSeek</div>
          <div className="l-logo-item"><Shield size={18} /> Gemini</div>
        </div>
      </div>

      {/* Features */}
      <section className="l-section" id="features">
        <Reveal>
          <div className="l-label">Features</div>
          <h2 className="l-heading">Everything you need</h2>
          <p className="l-desc">Tools to build, manage, and scale your Discord community.</p>
        </Reveal>
        <div className="l-features-grid">
          {[
            { icon: <Bot size={20} />, title: 'AI Server Builder', desc: 'Natural language to complete server blueprint. Channels, roles, permissions — all generated.' },
            { icon: <Zap size={20} />, title: 'One-Click Deploy', desc: 'Review the blueprint, approve it, and your server is live. No manual configuration.' },
            { icon: <LayoutTemplate size={20} />, title: 'Templates', desc: 'Pre-built server layouts for gaming, education, business, and communities.' },
            { icon: <Shield size={20} />, title: 'Auto Moderation', desc: 'Anti-raid, spam filters, verification, and role-based access set up automatically.' },
            { icon: <Brain size={20} />, title: 'Multi-AI Router', desc: 'Intelligent provider selection. Fallback chains ensure your requests always complete.' },
            { icon: <Rocket size={20} />, title: 'Bot Generation', desc: 'Generate Discord.js bot code with slash commands and event handlers.' },
          ].map((f, i) => (
            <Reveal key={i} delay={i * 60}>
              <div className="l-feature">
                <div className="l-feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* How */}
      <section className="l-section">
        <Reveal>
          <div className="l-label">How it works</div>
          <h2 className="l-heading">Three steps</h2>
          <p className="l-desc">From description to live server in under a minute.</p>
        </Reveal>
        <div className="l-steps">
          {[
            { num: '01', title: 'Describe', desc: 'Tell the AI what kind of server you want. Be as specific or general as you like.' },
            { num: '02', title: 'Review', desc: 'Get a complete blueprint with channels, roles, and settings. Adjust anything.' },
            { num: '03', title: 'Deploy', desc: 'One click and your server is live on Discord with everything configured.' },
          ].map((s, i) => (
            <Reveal key={i} delay={i * 100}>
              <div className="l-step">
                <div className="l-step-num">{s.num}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                {i < 2 && <div className="l-step-line" />}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="l-cta">
        <Reveal>
          <div className="l-cta-box">
            <h2>Start building</h2>
            <p>Free to use. No credit card required.</p>
            <a href="/api/auth/discord" className="l-cta-btn">
              Get started <ArrowRight size={15} />
            </a>
          </div>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="l-footer">
        <div className="l-footer-left">
          <img src="/logo.svg" alt="" style={{width:16,height:16,filter:'var(--logo-filter)'}} />
          <span>DiscordGPT</span>
        </div>
        <div className="l-footer-right">
          <button className="l-footer-theme" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>
      </footer>
    </div>
  )
}
