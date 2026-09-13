import React, { useEffect, useState, useRef } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { Sun, Moon, Bot, Zap, LayoutTemplate, ArrowRight, Sparkles, Shield, MessageSquare, ChevronRight, Star, Users, Globe, Code, Brain, Rocket, Check } from 'lucide-react'

function AnimatedCounter({ target, duration = 2000 }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setVisible(true)
    }, { threshold: 0.5 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!visible) return
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [visible, target, duration])

  return <span ref={ref}>{count.toLocaleString()}</span>
}

function FadeIn({ children, delay = 0, className = '' }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setVisible(true)
    }, { threshold: 0.1 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(30px)',
        transition: `opacity 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

function GlowOrb({ size, color, top, left, delay = 0 }) {
  return (
    <div style={{
      position: 'absolute',
      top, left,
      width: size, height: size,
      borderRadius: '50%',
      background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
      filter: 'blur(60px)',
      opacity: 0.4,
      animation: `orbFloat 8s ease-in-out ${delay}s infinite`,
      pointerEvents: 'none',
    }} />
  )
}

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme()
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handler = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [])

  return (
    <div style={{ minHeight: '100vh', overflowY: 'auto', background: 'var(--bg)', fontFamily: 'var(--font)' }}>
      <style>{`
        @keyframes orbFloat {
          0%,100% { transform: translate(0,0) scale(1); }
          33% { transform: translate(20px,-30px) scale(1.1); }
          66% { transform: translate(-15px,20px) scale(0.95); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.9); opacity: 0.6; }
          50% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(0.9); opacity: 0.6; }
        }
        @keyframes float {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes slideUp {
          from { opacity:0; transform:translateY(40px); }
          to { opacity:1; transform:translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity:0; }
          to { opacity:1; }
        }
        @keyframes scaleIn {
          from { opacity:0; transform:scale(0.9); }
          to { opacity:1; transform:scale(1); }
        }
        @keyframes gradientShift {
          0%,100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .landing-nav {
          position:fixed; top:0; left:0; right:0; z-index:100;
          display:flex; align-items:center; justify-content:space-between;
          padding:16px 40px;
          background:rgba(10,10,10,0.5);
          backdrop-filter:blur(20px);
          border-bottom:1px solid var(--border);
          animation: fadeIn 0.5s ease;
        }
        .landing-nav-brand { display:flex; align-items:center; gap:12px; }
        .landing-nav-logo { width:32px; height:32px; border-radius:8px; filter:var(--logo-filter); }
        .landing-nav-name { font-size:17px; font-weight:700; color:var(--text); letter-spacing:-0.02em; }
        .landing-nav-right { display:flex; align-items:center; gap:12px; }
        .landing-nav-link {
          font-size:14px; color:var(--text-secondary); text-decoration:none;
          cursor:pointer; transition:color 150ms; background:none; border:none;
          font-family:var(--font); padding:8px 12px; border-radius:var(--radius-sm);
        }
        .landing-nav-link:hover { color:var(--text); background:var(--bg-hover); }
        .landing-nav-btn {
          padding:10px 20px; background:var(--accent); color:#fff; border:none;
          border-radius:var(--radius-sm); font-size:14px; font-weight:600;
          cursor:pointer; transition:all 200ms; font-family:var(--font);
          display:flex; align-items:center; gap:8px;
        }
        .landing-nav-btn:hover { background:var(--accent-hover); transform:translateY(-1px); box-shadow:0 4px 16px rgba(59,130,246,0.3); }
        .hero-section {
          position:relative; min-height:100vh; display:flex; flex-direction:column;
          align-items:center; justify-content:center; padding:120px 24px 80px; overflow:hidden;
        }
        .hero-bg-gradient {
          position:absolute; inset:0;
          background:
            radial-gradient(ellipse 80% 50% at 50% 0%, rgba(59,130,246,0.15) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 80% 50%, rgba(139,92,246,0.08) 0%, transparent 50%),
            radial-gradient(ellipse 50% 40% at 20% 80%, rgba(59,130,246,0.06) 0%, transparent 50%);
          pointer-events:none;
        }
        .hero-grid {
          position:absolute; inset:0;
          background-image:
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size:60px 60px;
          mask-image:radial-gradient(ellipse 60% 50% at 50% 50%, black 20%, transparent 70%);
          -webkit-mask-image:radial-gradient(ellipse 60% 50% at 50% 50%, black 20%, transparent 70%);
          pointer-events:none;
        }
        .hero-content {
          position:relative; z-index:2; text-align:center; max-width:800px;
          animation: slideUp 0.8s cubic-bezier(0.16,1,0.3,1);
        }
        .hero-badge {
          display:inline-flex; align-items:center; gap:8px;
          padding:8px 18px; background:var(--accent-subtle);
          border:1px solid rgba(59,130,246,0.2); border-radius:24px;
          font-size:13px; font-weight:500; color:var(--accent);
          margin-bottom:32px; animation: scaleIn 0.5s 0.2s both;
        }
        .hero-badge-dot {
          width:6px; height:6px; border-radius:50%; background:var(--accent);
          animation:pulse-ring 2s infinite;
        }
        .hero-title {
          font-size:clamp(40px,7vw,80px); font-weight:800; color:var(--text);
          letter-spacing:-0.04em; line-height:1.05; margin-bottom:24px;
        }
        .hero-title-gradient {
          background:linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%);
          background-size:200% 200%;
          animation:gradientShift 4s ease infinite;
          -webkit-background-clip:text; -webkit-text-fill-color:transparent;
          background-clip:text;
        }
        .hero-subtitle {
          font-size:clamp(16px,2vw,20px); color:var(--text-secondary);
          margin-bottom:48px; max-width:560px; margin-left:auto; margin-right:auto;
          line-height:1.7; animation: slideUp 0.8s 0.3s both;
        }
        .hero-buttons {
          display:flex; gap:16px; justify-content:center; flex-wrap:wrap;
          animation: slideUp 0.8s 0.4s both;
        }
        .hero-btn-primary {
          display:inline-flex; align-items:center; gap:10px;
          padding:16px 36px; background:var(--accent); color:#fff;
          border:none; border-radius:var(--radius-md); font-size:16px;
          font-weight:600; cursor:pointer; transition:all 250ms;
          font-family:var(--font); text-decoration:none;
        }
        .hero-btn-primary:hover {
          background:var(--accent-hover); transform:translateY(-2px);
          box-shadow:0 12px 40px rgba(59,130,246,0.35);
        }
        .hero-btn-secondary {
          display:inline-flex; align-items:center; gap:10px;
          padding:16px 36px; background:var(--bg-surface); color:var(--text);
          border:1px solid var(--border); border-radius:var(--radius-md);
          font-size:16px; font-weight:600; cursor:pointer; transition:all 250ms;
          font-family:var(--font); text-decoration:none;
        }
        .hero-btn-secondary:hover {
          border-color:var(--border-hover); background:var(--bg-elevated);
          transform:translateY(-2px);
        }
        .hero-social-proof {
          display:flex; align-items:center; justify-content:center; gap:24px;
          margin-top:56px; animation: slideUp 0.8s 0.5s both;
        }
        .hero-stat { text-align:center; }
        .hero-stat-num { font-size:28px; font-weight:700; color:var(--text); }
        .hero-stat-label { font-size:12px; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.05em; margin-top:4px; }
        .hero-divider { width:1px; height:40px; background:var(--border); }
        .hero-preview {
          position:relative; z-index:2; margin-top:80px; width:100%; max-width:900px;
          animation: slideUp 0.8s 0.6s both;
        }
        .hero-preview-window {
          background:var(--bg-surface); border:1px solid var(--border);
          border-radius:var(--radius-lg); overflow:hidden;
          box-shadow:0 24px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05) inset;
        }
        .hero-preview-bar {
          display:flex; align-items:center; gap:8px; padding:12px 16px;
          background:var(--bg-elevated); border-bottom:1px solid var(--border);
        }
        .hero-preview-dot { width:10px; height:10px; border-radius:50%; }
        .hero-preview-dot.red { background:#ef4444; }
        .hero-preview-dot.yellow { background:#eab308; }
        .hero-preview-dot.green { background:#22c55e; }
        .hero-preview-content {
          padding:32px; display:flex; gap:24px; min-height:300px;
        }
        .hero-preview-sidebar {
          width:200px; flex-shrink:0; display:flex; flex-direction:column; gap:8px;
        }
        .hero-preview-sidebar-item {
          padding:10px 14px; border-radius:var(--radius-sm);
          background:var(--bg-hover); font-size:13px; color:var(--text-secondary);
          display:flex; align-items:center; gap:8px;
        }
        .hero-preview-sidebar-item.active {
          background:var(--accent-subtle); color:var(--accent);
        }
        .hero-preview-chat { flex:1; display:flex; flex-direction:column; gap:16px; }
        .hero-preview-msg {
          display:flex; gap:12px; animation:slideUp 0.5s ease both;
        }
        .hero-preview-msg:nth-child(2) { animation-delay:0.3s; }
        .hero-preview-msg:nth-child(3) { animation-delay:0.6s; }
        .hero-preview-avatar {
          width:32px; height:32px; border-radius:50%;
          display:flex; align-items:center; justify-content:center;
          font-size:12px; font-weight:600; flex-shrink:0;
        }
        .hero-preview-avatar.user { background:var(--accent-subtle); color:var(--accent); }
        .hero-preview-avatar.ai { background:rgba(139,92,246,0.15); color:#8b5cf6; }
        .hero-preview-bubble {
          padding:12px 16px; border-radius:var(--radius-md);
          font-size:13px; line-height:1.6; max-width:80%;
        }
        .hero-preview-bubble.user { background:var(--accent); color:#fff; border-bottom-right-radius:4px; }
        .hero-preview-bubble.ai { background:var(--bg-elevated); color:var(--text-secondary); border-bottom-left-radius:4px; }
        .hero-preview-bubble.ai .blueprint-preview {
          margin-top:10px; padding:10px; background:var(--bg-active);
          border-radius:var(--radius-sm); border-left:3px solid var(--accent);
          font-size:12px; color:var(--text);
        }

        .features-section {
          padding:120px 24px; max-width:1200px; margin:0 auto; position:relative;
        }
        .features-section-label {
          font-size:13px; font-weight:600; color:var(--accent);
          text-transform:uppercase; letter-spacing:0.1em;
          text-align:center; margin-bottom:12px;
        }
        .features-section-title {
          font-size:clamp(28px,4vw,44px); font-weight:700; color:var(--text);
          text-align:center; margin-bottom:16px; letter-spacing:-0.03em;
        }
        .features-section-desc {
          font-size:17px; color:var(--text-muted); text-align:center;
          max-width:520px; margin:0 auto 64px; line-height:1.7;
        }
        .features-grid {
          display:grid; grid-template-columns:repeat(3,1fr); gap:20px;
        }
        .feature-card {
          background:var(--bg-surface); border:1px solid var(--border);
          border-radius:var(--radius-lg); padding:36px 28px;
          transition:all 300ms cubic-bezier(0.16,1,0.3,1);
          position:relative; overflow:hidden;
        }
        .feature-card::before {
          content:''; position:absolute; top:0; left:0; right:0; height:2px;
          background:linear-gradient(90deg, transparent, var(--accent), transparent);
          opacity:0; transition:opacity 300ms;
        }
        .feature-card:hover {
          border-color:var(--border-hover); transform:translateY(-6px);
          box-shadow:0 20px 60px rgba(0,0,0,0.3);
        }
        .feature-card:hover::before { opacity:1; }
        .feature-icon {
          width:52px; height:52px; border-radius:var(--radius-md);
          background:var(--accent-subtle); color:var(--accent);
          display:flex; align-items:center; justify-content:center;
          margin-bottom:24px; transition:transform 300ms;
        }
        .feature-card:hover .feature-icon { transform:scale(1.1); }
        .feature-title { font-size:19px; font-weight:600; color:var(--text); margin-bottom:10px; }
        .feature-desc { font-size:14px; color:var(--text-muted); line-height:1.7; }

        .how-section {
          padding:120px 24px; position:relative; overflow:hidden;
        }
        .how-section-inner { max-width:1100px; margin:0 auto; }
        .how-steps { display:flex; gap:40px; position:relative; }
        .how-step { flex:1; text-align:center; position:relative; }
        .how-step-num {
          width:64px; height:64px; border-radius:50%;
          background:linear-gradient(135deg, var(--accent), #8b5cf6);
          color:#fff; display:flex; align-items:center; justify-content:center;
          font-size:24px; font-weight:700; margin:0 auto 24px;
          box-shadow:0 8px 32px rgba(59,130,246,0.3);
        }
        .how-step-title { font-size:18px; font-weight:600; color:var(--text); margin-bottom:10px; }
        .how-step-desc { font-size:14px; color:var(--text-muted); line-height:1.7; max-width:280px; margin:0 auto; }
        .how-connector {
          position:absolute; top:32px; left:calc(50% + 40px);
          width:calc(100% - 80px); height:2px;
          background:linear-gradient(90deg, var(--accent), rgba(139,92,246,0.3));
        }

        .stats-section {
          padding:100px 24px;
          background:linear-gradient(180deg, transparent, rgba(59,130,246,0.03), transparent);
        }
        .stats-grid {
          display:grid; grid-template-columns:repeat(4,1fr); gap:24px;
          max-width:900px; margin:0 auto;
        }
        .stat-card { text-align:center; }
        .stat-num {
          font-size:clamp(32px,5vw,48px); font-weight:800;
          background:linear-gradient(135deg, var(--accent), #8b5cf6);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent;
          background-clip:text;
        }
        .stat-label { font-size:14px; color:var(--text-muted); margin-top:8px; }

        .cta-section {
          padding:120px 24px; text-align:center; position:relative;
        }
        .cta-box {
          max-width:700px; margin:0 auto; padding:64px 48px;
          background:linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.08));
          border:1px solid rgba(59,130,246,0.15); border-radius:24px;
          position:relative; overflow:hidden;
        }
        .cta-box::before {
          content:''; position:absolute; inset:0;
          background:radial-gradient(circle at 50% 0%, rgba(59,130,246,0.12) 0%, transparent 60%);
          pointer-events:none;
        }
        .cta-title {
          font-size:clamp(28px,4vw,40px); font-weight:700; color:var(--text);
          margin-bottom:16px; letter-spacing:-0.03em; position:relative;
        }
        .cta-desc {
          font-size:17px; color:var(--text-muted); margin-bottom:36px;
          max-width:480px; margin-left:auto; margin-right:auto;
          line-height:1.7; position:relative;
        }
        .cta-btn {
          display:inline-flex; align-items:center; gap:10px;
          padding:18px 40px; background:var(--accent); color:#fff;
          border:none; border-radius:var(--radius-md); font-size:17px;
          font-weight:600; cursor:pointer; transition:all 250ms;
          font-family:var(--font); position:relative;
        }
        .cta-btn:hover {
          background:var(--accent-hover); transform:translateY(-2px);
          box-shadow:0 12px 40px rgba(59,130,246,0.35);
        }

        .landing-footer {
          padding:40px 24px; text-align:center;
          border-top:1px solid var(--border);
          display:flex; align-items:center; justify-content:center; gap:16px;
        }
        .landing-footer-text { font-size:13px; color:var(--text-muted); }
        .landing-footer-toggle {
          background:var(--bg-surface); border:1px solid var(--border);
          border-radius:var(--radius-sm); color:var(--text-secondary);
          cursor:pointer; padding:8px; display:flex; align-items:center;
          justify-content:center; transition:all 150ms;
        }
        .landing-footer-toggle:hover { background:var(--bg-elevated); color:var(--text); }

        @media(max-width:768px) {
          .landing-nav { padding:12px 16px; }
          .landing-nav-link { display:none; }
          .features-grid { grid-template-columns:1fr; }
          .how-steps { flex-direction:column; gap:32px; }
          .how-connector { display:none; }
          .stats-grid { grid-template-columns:repeat(2,1fr); }
          .hero-preview-content { flex-direction:column; }
          .hero-preview-sidebar { width:100%; flex-direction:row; overflow-x:auto; }
          .hero-social-proof { gap:16px; }
          .hero-divider { display:none; }
          .cta-box { padding:40px 24px; }
        }
      `}</style>

      <nav className="landing-nav">
        <div className="landing-nav-brand">
          <img src="/logo.svg" alt="DiscordGPT" className="landing-nav-logo" />
          <span className="landing-nav-name">DiscordGPT</span>
        </div>
        <div className="landing-nav-right">
          <button className="landing-nav-link" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button className="landing-nav-link" onClick={() => window.location.href = '/api/auth/discord'}>Log in</button>
          <button className="landing-nav-btn" onClick={() => window.location.href = '/api/auth/discord'}>
            Get Started <ArrowRight size={16} />
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-section">
        <div className="hero-bg-gradient" />
        <div className="hero-grid" />
        <GlowOrb size={500} color="rgba(59,130,246,0.15)" top="-10%" left="30%" delay={0} />
        <GlowOrb size={400} color="rgba(139,92,246,0.1)" top="20%" left="60%" delay={2} />
        <GlowOrb size={350} color="rgba(236,72,153,0.08)" top="60%" left="10%" delay={4} />

        <div className="hero-content">
          <div className="hero-badge">
            <div className="hero-badge-dot" />
            AI-Powered Server Builder
          </div>

          <h1 className="hero-title">
            Build Discord Servers<br />
            with <span className="hero-title-gradient">Artificial Intelligence</span>
          </h1>

          <p className="hero-subtitle">
            Describe your ideal Discord server in plain language. AI generates a complete blueprint
            with channels, roles, permissions, and bots — then deploys it instantly.
          </p>

          <div className="hero-buttons">
            <button className="hero-btn-primary" onClick={() => window.location.href = '/api/auth/discord'}>
              <svg width="18" height="14" viewBox="0 0 71 55" fill="none">
                <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5604 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.9048 3.0581 26.1885 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.4218 0.40133C20.3475 1.2916 15.4948 2.8214 10.9693 4.8978C10.9693 4.8978 6.86847 11.0623 6.07067 17.1568C0.857776 24.7397 0.064707 32.1073 0.467713 39.3675C0.482247 39.4475 0.561648 39.5097 0.644049 39.5097C6.47654 42.6062 12.1445 44.4138 17.7245 45.5639C17.8085 45.5801 17.8928 45.5522 17.9591 45.4884C19.4858 43.4164 20.8232 41.2152 21.9604 38.9044C22.0267 38.8411 22.0108 38.7409 21.9337 38.6983C19.6683 37.8558 17.4953 36.7558 15.4519 35.4245C15.3029 35.3275 15.3029 35.1318 15.4519 35.0348C15.9725 34.7117 16.4931 34.3765 16.9922 34.0286C17.0782 33.9713 17.1806 33.9638 17.273 34.0074C29.5917 39.6658 42.8085 39.6658 55.0431 34.0074C55.1375 33.9618 55.2399 33.9713 55.3279 34.0286C55.8287 34.3765 56.3493 34.7117 56.8681 35.0348C57.0171 35.1318 57.0171 35.3275 56.8681 35.4245C54.8247 36.7558 52.6517 37.8558 50.3844 38.6983C50.3073 38.7409 50.2934 38.8411 50.3577 38.9044C51.4949 41.2152 52.8323 43.4164 54.359 45.4884C54.4253 45.5522 54.5116 45.5801 54.5956 45.5639C60.1775 44.4138 65.8455 42.6062 71.678 39.5097C71.7624 39.5097 71.8418 39.4475 71.8553 39.3675C72.3314 31.0951 70.8709 23.7657 66.0665 17.3131C66.0665 17.3131 61.9657 11.0989 60.1045 4.8978ZM23.7259 32.4621C20.2729 32.4621 17.4516 29.3049 17.4516 25.4517C17.4516 21.5985 20.2189 18.4144 23.7259 18.4144C27.2661 18.4144 30.0456 21.5985 30.0002 25.4517C30.0002 29.3049 27.2458 32.4621 23.7259 32.4621ZM47.3178 32.4621C43.8648 32.4621 41.0435 29.3049 41.0435 25.4517C41.0435 21.5985 43.8108 18.4144 47.3178 18.4144C50.858 18.4144 53.6376 21.5985 53.5921 25.4517C53.5921 29.3049 50.858 32.4621 47.3178 32.4621Z" fill="currentColor"/>
              </svg>
              Start Building Free
            </button>
            <button className="hero-btn-secondary" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
              See How It Works <ChevronRight size={18} />
            </button>
          </div>

          <div className="hero-social-proof">
            <div className="hero-stat">
              <div className="hero-stat-num"><AnimatedCounter target={2847} /></div>
              <div className="hero-stat-label">Servers Created</div>
            </div>
            <div className="hero-divider" />
            <div className="hero-stat">
              <div className="hero-stat-num"><AnimatedCounter target={1200} /></div>
              <div className="hero-stat-label">Active Users</div>
            </div>
            <div className="hero-divider" />
            <div className="hero-stat">
              <div className="hero-stat-num"><AnimatedCounter target={99} />%</div>
              <div className="hero-stat-label">Satisfaction</div>
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div className="hero-preview">
          <div className="hero-preview-window">
            <div className="hero-preview-bar">
              <div className="hero-preview-dot red" />
              <div className="hero-preview-dot yellow" />
              <div className="hero-preview-dot green" />
            </div>
            <div className="hero-preview-content">
              <div className="hero-preview-sidebar">
                <div className="hero-preview-sidebar-item active">
                  <MessageSquare size={14} /> Gaming Server
                </div>
                <div className="hero-preview-sidebar-item">
                  <MessageSquare size={14} /> Study Group
                </div>
                <div className="hero-preview-sidebar-item">
                  <MessageSquare size={14} /> Art Community
                </div>
                <div className="hero-preview-sidebar-item">
                  <LayoutTemplate size={14} /> Templates
                </div>
              </div>
              <div className="hero-preview-chat">
                <div className="hero-preview-msg">
                  <div className="hero-preview-avatar user">U</div>
                  <div className="hero-preview-bubble user">
                    Create a gaming server with voice channels, a tournament bracket channel, and role-based access
                  </div>
                </div>
                <div className="hero-preview-msg">
                  <div className="hero-preview-avatar ai">
                    <img src="/logo.svg" alt="" style={{width:18,height:18,filter:'var(--logo-filter)'}} />
                  </div>
                  <div className="hero-preview-bubble ai">
                    I've generated a complete blueprint for your gaming server with 3 categories, 12 channels, 6 custom roles, and anti-raid moderation.
                    <div className="blueprint-preview">
                      <strong>Gaming Hub</strong> — #general, #announcements, #tournament-bracket, #clips, #looking-for-group
                    </div>
                  </div>
                </div>
                <div className="hero-preview-msg">
                  <div className="hero-preview-avatar ai">
                    <img src="/logo.svg" alt="" style={{width:18,height:18,filter:'var(--logo-filter)'}} />
                  </div>
                  <div className="hero-preview-bubble ai" style={{display:'flex',alignItems:'center',gap:8}}>
                    <Zap size={14} style={{color:'var(--accent)'}} /> Server deployed successfully to <strong>Discord</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section" id="features">
        <FadeIn>
          <div className="features-section-label">Features</div>
          <h2 className="features-section-title">Everything you need to build</h2>
          <p className="features-section-desc">
            Powerful AI tools to create, manage, and scale your Discord community — all from a single interface.
          </p>
        </FadeIn>
        <div className="features-grid">
          {[
            { icon: <Bot size={24} />, title: 'AI Server Builder', desc: 'Describe your server in plain language. AI generates a complete blueprint with channels, roles, permissions, and bot configurations.' },
            { icon: <Zap size={24} />, title: 'One-Click Deploy', desc: 'Review the AI-generated blueprint, approve it, and your Discord server is live instantly. No manual setup needed.' },
            { icon: <LayoutTemplate size={24} />, title: 'Smart Templates', desc: 'Choose from pre-built templates for gaming, study groups, businesses, and communities. Customize with natural language.' },
            { icon: <Shield size={24} />, title: 'Auto Moderation', desc: 'AI sets up anti-raid, spam filters, verification systems, and role-based access — keeping your server safe from day one.' },
            { icon: <Brain size={24} />, title: 'Multi-AI Router', desc: 'Intelligent provider routing selects the best AI for each task. Fallback chains ensure 99.9% uptime.' },
            { icon: <Rocket size={24} />, title: 'Bot Development', desc: 'Generate Discord.js bot code with slash commands, event handlers, and database integration — zero coding required.' },
          ].map((f, i) => (
            <FadeIn key={i} delay={i * 100}>
              <div className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="how-section">
        <div className="how-section-inner">
          <FadeIn>
            <div className="features-section-label">How it works</div>
            <h2 className="features-section-title">Three steps to your server</h2>
            <p className="features-section-desc">From idea to live Discord server in under 60 seconds.</p>
          </FadeIn>
          <div className="how-steps">
            {[
              { num: '1', title: 'Describe Your Server', desc: 'Tell AI what you want — a gaming community, study group, support desk, or anything else. Use plain language.' },
              { num: '2', title: 'Review the Blueprint', desc: 'AI generates a complete server structure with channels, roles, and settings. Review and adjust as needed.' },
              { num: '3', title: 'Deploy Instantly', desc: 'Hit deploy and your server is live on Discord. Start inviting members right away.' },
            ].map((s, i) => (
              <FadeIn key={i} delay={i * 150}>
                <div className="how-step">
                  <div className="how-step-num">{s.num}</div>
                  <h3 className="how-step-title">{s.title}</h3>
                  <p className="how-step-desc">{s.desc}</p>
                  {i < 2 && <div className="how-connector" />}
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="stats-grid">
          {[
            { num: 2847, label: 'Servers Created', suffix: '+' },
            { num: 1200, label: 'Active Users', suffix: '+' },
            { num: 15, label: 'AI Providers', suffix: '' },
            { num: 99, label: 'Uptime', suffix: '%' },
        ].map((s, i) => (
            <FadeIn key={i} delay={i * 100}>
              <div className="stat-card">
                <div className="stat-num"><AnimatedCounter target={s.num} />{s.suffix}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <FadeIn>
          <div className="cta-box">
            <h2 className="cta-title">Ready to build your server?</h2>
            <p className="cta-desc">
              Join thousands of Discord server owners who use AI to create, manage, and scale their communities.
            </p>
            <button className="cta-btn" onClick={() => window.location.href = '/api/auth/discord'}>
              <svg width="18" height="14" viewBox="0 0 71 55" fill="none">
                <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5604 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.9048 3.0581 26.1885 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.4218 0.40133C20.3475 1.2916 15.4948 2.8214 10.9693 4.8978C10.9693 4.8978 6.86847 11.0623 6.07067 17.1568C0.857776 24.7397 0.064707 32.1073 0.467713 39.3675C0.482247 39.4475 0.561648 39.5097 0.644049 39.5097C6.47654 42.6062 12.1445 44.4138 17.7245 45.5639C17.8085 45.5801 17.8928 45.5522 17.9591 45.4884C19.4858 43.4164 20.8232 41.2152 21.9604 38.9044C22.0267 38.8411 22.0108 38.7409 21.9337 38.6983C19.6683 37.8558 17.4953 36.7558 15.4519 35.4245C15.3029 35.3275 15.3029 35.1318 15.4519 35.0348C15.9725 34.7117 16.4931 34.3765 16.9922 34.0286C17.0782 33.9713 17.1806 33.9638 17.273 34.0074C29.5917 39.6658 42.8085 39.6658 55.0431 34.0074C55.1375 33.9618 55.2399 33.9713 55.3279 34.0286C55.8287 34.3765 56.3493 34.7117 56.8681 35.0348C57.0171 35.1318 57.0171 35.3275 56.8681 35.4245C54.8247 36.7558 52.6517 37.8558 50.3844 38.6983C50.3073 38.7409 50.2934 38.8411 50.3577 38.9044C51.4949 41.2152 52.8323 43.4164 54.359 45.4884C54.4253 45.5522 54.5116 45.5801 54.5956 45.5639C60.1775 44.4138 65.8455 42.6062 71.678 39.5097C71.7624 39.5097 71.8418 39.4475 71.8553 39.3675C72.3314 31.0951 70.8709 23.7657 66.0665 17.3131C66.0665 17.3131 61.9657 11.0989 60.1045 4.8978Z" fill="currentColor"/>
              </svg>
              Get Started Free
            </button>
          </div>
        </FadeIn>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <span className="landing-footer-text">Built with AI for Discord communities</span>
        <button className="landing-footer-toggle" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </footer>
    </div>
  )
}
