import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { Sun, Moon, ArrowRight, ChevronRight, Bot, Zap, LayoutTemplate, Shield, Brain, Rocket, Star, ChevronDown, MessageSquare, Users, CheckCircle } from 'lucide-react'

const EASE = 'cubic-bezier(0.16,1,0.3,1)'
const FONT = '-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif'

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
      const p = Math.min((now - start) / duration, 1)
      setCount(Math.floor((1 - Math.pow(1 - p, 3)) * target))
      if (p < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [vis, target, duration])
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

function Reveal({ children, delay = 0, className = '', style = {} }) {
  const [v, setV] = useState(false)
  const r = useRef(null)
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true) }, { threshold: 0.12 })
    if (r.current) o.observe(r.current)
    return () => o.disconnect()
  }, [])
  return (
    <div ref={r} className={className} style={{
      opacity: v ? 1 : 0,
      transform: v ? 'translateY(0)' : 'translateY(32px)',
      transition: `opacity 0.8s ${EASE} ${delay}ms, transform 0.8s ${EASE} ${delay}ms`,
      ...style,
    }}>{children}</div>
  )
}

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  const [loaded, setLoaded] = useState(false)
  const [logoPulse, setLogoPulse] = useState(false)
  const [contentReady, setContentReady] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [scrollPct, setScrollPct] = useState(0)
  const [faqOpen, setFaqOpen] = useState(null)
  const previewRef = useRef(null)
  const [previewRotate, setPreviewRotate] = useState({ x: 0, y: 0 })
  const cursorRef = useRef(null)
  const cursorRingRef = useRef(null)
  const mousePos = useRef({ x: -100, y: -100 })
  const ringPos = useRef({ x: -100, y: -100 })
  const magnetRefs = useRef([])
  const featureRefs = useRef([])

  const colors = useMemo(() => ({
    bg: isDark ? '#09090b' : '#ffffff',
    bgSurface: isDark ? '#111113' : '#f8f8fa',
    text: isDark ? '#fafafa' : '#09090b',
    textSec: isDark ? '#71717a' : '#71717a',
    border: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    borderHover: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)',
    accent: isDark ? '#3b82f6' : '#2563eb',
    accentBg: isDark ? 'rgba(59,130,246,0.1)' : 'rgba(37,99,235,0.06)',
    cardBg: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
    muted: isDark ? '#3f3f46' : '#a1a1aa',
    chipBg: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
    chipBorder: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    glow: isDark ? 'rgba(59,130,246,0.08)' : 'rgba(37,99,235,0.05)',
    white: '#fafafa',
  }), [isDark])

  // Page load animation
  useEffect(() => {
    const t1 = setTimeout(() => setLoaded(true), 100)
    const t2 = setTimeout(() => setLogoPulse(true), 400)
    const t3 = setTimeout(() => setContentReady(true), 900)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  // Scroll
  useEffect(() => {
    const onScroll = () => {
      setScrollY(window.scrollY)
      const docH = document.documentElement.scrollHeight - window.innerHeight
      setScrollPct(docH > 0 ? (window.scrollY / docH) * 100 : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Custom cursor
  useEffect(() => {
    const onMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    let raf
    const tick = () => {
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * 0.15
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * 0.15
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${mousePos.current.x - 3}px, ${mousePos.current.y - 3}px)`
      }
      if (cursorRingRef.current) {
        cursorRingRef.current.style.transform = `translate(${ringPos.current.x - 16}px, ${ringPos.current.y - 16}px)`
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  // Magnetic buttons
  const onMagnetMove = useCallback((e, idx) => {
    const el = magnetRefs.current[idx]
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    el.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`
  }, [])

  const onMagnetLeave = useCallback((idx) => {
    const el = magnetRefs.current[idx]
    if (el) el.style.transform = 'translate(0,0)'
  }, [])

  // 3D preview tilt
  const onPreviewMouse = useCallback((e) => {
    const el = previewRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setPreviewRotate({ x: y * -8, y: x * 8 })
  }, [])

  const onPreviewLeave = useCallback(() => setPreviewRotate({ x: 0, y: 0 }), [])

  // Feature card glare
  const onFeatureMove = useCallback((e, idx) => {
    const el = featureRefs.current[idx]
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    const rx = (y - 0.5) * -6
    const ry = (x - 0.5) * 6
    el.style.transform = `perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.02)`
    el.style.setProperty('--glare-x', `${x * 100}%`)
    el.style.setProperty('--glare-y', `${y * 100}%`)
  }, [])

  const onFeatureLeave = useCallback((idx) => {
    const el = featureRefs.current[idx]
    if (el) {
      el.style.transform = 'perspective(600px) rotateX(0) rotateY(0) scale(1)'
    }
  }, [])

  const navBg = scrollY > 40
    ? isDark ? 'rgba(9,9,11,0.85)' : 'rgba(255,255,255,0.85)'
    : 'transparent'

  return (
    <div style={{
      minHeight: '100vh', background: colors.bg, fontFamily: FONT,
      color: colors.text, overflowX: 'hidden', cursor: 'none',
    }}>
      <style>{`
        * { margin:0; padding:0; box-sizing:border-box; }
        html { cursor: none !important; }
        body { cursor: none !important; }
        a, button { cursor: none !important; }

        @keyframes float1 { 0%,100% { transform:translate(0,0) scale(1); } 50% { transform:translate(30px,-20px) scale(1.05); } }
        @keyframes float2 { 0%,100% { transform:translate(0,0) scale(1); } 50% { transform:translate(-20px,30px) scale(1.08); } }
        @keyframes float3 { 0%,100% { transform:translate(0,0) scale(1); } 50% { transform:translate(15px,15px) scale(1.03); } }
        @keyframes pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.7; transform:scale(1.15); } }
        @keyframes drawLine { from { width:0; } to { width:100%; } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes slideUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }

        .load-screen {
          position:fixed; inset:0; z-index:9999;
          display:flex; align-items:center; justify-content:center;
          background:${colors.bg}; pointer-events:none;
          opacity:${loaded ? 0 : 1}; transition:opacity 0.6s ${EASE};
        }
        .load-logo {
          width:48px; height:48px; border-radius:12px;
          filter:var(--logo-filter);
          animation:${logoPulse ? 'pulse 0.8s ease-in-out' : 'none'};
          transform:scale(${logoPulse ? 1.2 : 1});
          transition:transform 0.4s ${EASE};
        }

        .l-cursor {
          position:fixed; top:0; left:0; width:6px; height:6px;
          border-radius:50%; background:${colors.text};
          mix-blend-mode:difference; pointer-events:none; z-index:10000;
          will-change:transform;
        }
        .l-cursor-ring {
          position:fixed; top:0; left:0; width:32px; height:32px;
          border-radius:50%; border:1.5px solid ${isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.3)'};
          mix-blend-mode:difference; pointer-events:none; z-index:10000;
          will-change:transform; transition:width 0.2s ${EASE}, height 0.2s ${EASE}, border-color 0.2s;
        }
        .l-cursor-ring.expanded {
          width:56px; height:56px;
          border-color:${isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.15)'};
        }

        @media(max-width:768px) {
          html, body, a, button { cursor: auto !important; }
          .l-cursor, .l-cursor-ring { display:none !important; }
        }

        .l-nav {
          position:fixed; top:0; left:0; right:0; z-index:100;
          display:flex; align-items:center; justify-content:space-between;
          padding:0 48px; height:64px;
          background:${navBg};
          backdrop-filter:blur(${scrollY > 40 ? '16px' : '0'});
          border-bottom:1px solid ${scrollY > 40 ? colors.border : 'transparent'};
          transition:all 0.4s ${EASE};
          opacity:${contentReady ? 1 : 0};
          transform:translateY(${contentReady ? 0 : -10}px);
        }
        .l-nav-brand { display:flex; align-items:center; gap:10px; text-decoration:none; }
        .l-nav-logo { width:28px; height:28px; border-radius:7px; filter:var(--logo-filter); }
        .l-nav-name { font-size:15px; font-weight:600; color:${colors.text}; letter-spacing:-0.01em; }
        .l-nav-right { display:flex; align-items:center; gap:4px; }
        .l-nav-item {
          font-size:13.5px; color:${colors.textSec}; background:none; border:none;
          padding:8px 14px; border-radius:6px; cursor:none; font-family:inherit;
          transition:all 0.15s;
        }
        .l-nav-item:hover { color:${colors.text}; background:${colors.chipBg}; }
        .l-nav-cta {
          margin-left:8px; padding:8px 18px; background:${colors.text}; color:${colors.bg};
          border:none; border-radius:8px; font-size:13.5px; font-weight:600;
          cursor:none; font-family:inherit; transition:all 0.2s;
        }
        .l-nav-cta:hover { opacity:0.9; transform:translateY(-1px); }

        .l-hero {
          position:relative; min-height:100vh; display:flex; flex-direction:column;
          align-items:center; justify-content:center; padding:120px 24px 80px;
          text-align:center;
        }
        .l-hero-orb {
          position:absolute; border-radius:50%; pointer-events:none;
          filter:blur(80px); opacity:0.5;
        }
        .l-hero-orb.o1 {
          width:500px; height:500px; top:-10%; left:10%;
          background:${isDark ? 'rgba(59,130,246,0.08)' : 'rgba(59,130,246,0.05)'};
          animation:float1 20s ease-in-out infinite;
        }
        .l-hero-orb.o2 {
          width:400px; height:400px; top:20%; right:5%;
          background:${isDark ? 'rgba(139,92,246,0.06)' : 'rgba(139,92,246,0.04)'};
          animation:float2 25s ease-in-out infinite;
        }
        .l-hero-orb.o3 {
          width:350px; height:350px; bottom:10%; left:30%;
          background:${isDark ? 'rgba(16,185,129,0.05)' : 'rgba(16,185,129,0.03)'};
          animation:float3 18s ease-in-out infinite;
        }
        .l-hero-orb.o4 {
          width:300px; height:300px; top:40%; left:60%;
          background:${isDark ? 'rgba(249,115,22,0.04)' : 'rgba(249,115,22,0.02)'};
          animation:float2 22s ease-in-out infinite reverse;
        }
        .l-hero-content { position:relative; z-index:1; max-width:720px; }
        .l-hero-chip {
          display:inline-flex; align-items:center; gap:8px;
          padding:6px 16px 6px 10px; background:${colors.chipBg};
          border:1px solid ${colors.chipBorder}; border-radius:100px;
          font-size:12.5px; color:${colors.textSec}; margin-bottom:36px;
        }
        .l-hero-chip-dot { width:6px; height:6px; border-radius:50%; background:#22c55e; animation:pulse 2s ease infinite; }
        .l-hero h1 {
          font-size:clamp(44px,7vw,80px); font-weight:700; letter-spacing:-0.04em;
          line-height:1.05; margin-bottom:24px; color:${colors.text};
        }
        .l-hero h1 em {
          font-style:normal; position:relative; display:inline-block;
        }
        .l-hero h1 em::after {
          content:''; position:absolute; left:0; bottom:4px;
          width:100%; height:6px; border-radius:3px;
          background:linear-gradient(90deg, #3b82f6, #8b5cf6);
          opacity:0.4; transform-origin:left;
          animation:drawIn 0.8s ${EASE} 1.2s both;
        }
        @keyframes drawIn { from { transform:scaleX(0); } to { transform:scaleX(1); } }
        .l-hero p {
          font-size:18px; color:${colors.textSec}; line-height:1.7;
          max-width:520px; margin:0 auto 40px;
        }
        .l-hero-btns { display:flex; gap:12px; justify-content:center; margin-bottom:60px; }
        .l-btn-primary {
          display:inline-flex; align-items:center; gap:8px;
          padding:13px 30px; background:${colors.text}; color:${colors.bg};
          border:none; border-radius:10px; font-size:14px; font-weight:600;
          cursor:none; font-family:inherit; transition:all 0.25s ${EASE};
          text-decoration:none; will-change:transform;
        }
        .l-btn-primary:hover { box-shadow:0 8px 30px ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'}; }
        .l-btn-secondary {
          display:inline-flex; align-items:center; gap:8px;
          padding:13px 30px; background:transparent; color:${colors.text};
          border:1px solid ${colors.borderHover}; border-radius:10px;
          font-size:14px; font-weight:500; cursor:none; font-family:inherit;
          transition:all 0.25s ${EASE}; text-decoration:none; will-change:transform;
        }
        .l-btn-secondary:hover { border-color:${isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'}; background:${colors.chipBg}; }

        .l-hero-metrics { display:flex; justify-content:center; gap:56px; }
        .l-metric { text-align:left; }
        .l-metric-val { font-size:30px; font-weight:700; color:${colors.text}; letter-spacing:-0.02em; }
        .l-metric-label { font-size:13px; color:${colors.muted}; margin-top:2px; }

        .l-preview-section {
          position:relative; padding:0 24px 140px;
          display:flex; justify-content:center;
        }
        .l-preview-wrap {
          position:relative; width:100%; max-width:1040px;
          perspective:1200px;
        }
        .l-preview-glow {
          position:absolute; top:50%; left:50%; width:600px; height:400px;
          transform:translate(-50%,-50%); z-index:0;
          background:radial-gradient(ellipse, ${colors.glow} 0%, transparent 70%);
          filter:blur(60px); pointer-events:none;
          transition:opacity 0.3s;
        }
        .l-preview {
          position:relative; z-index:1;
          background:${colors.bgSurface}; border:1px solid ${colors.border};
          border-radius:16px; overflow:hidden;
          box-shadow:0 32px 80px ${isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.08)'}, 0 0 0 1px ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)'} inset;
          transform:perspective(1200px) rotateX(${previewRotate.x}deg) rotateY(${previewRotate.y}deg);
          transition:transform 0.15s ease-out;
        }
        .l-preview-bar {
          display:flex; align-items:center; gap:8px; padding:12px 16px;
          background:${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'};
          border-bottom:1px solid ${colors.border};
        }
        .l-dot { width:10px; height:10px; border-radius:50%; }
        .l-dot.r { background:#ff5f56; }
        .l-dot.y { background:#ffbd2e; }
        .l-dot.g { background:#27c93f; }
        .l-preview-title { flex:1; text-align:center; font-size:12px; color:${colors.muted}; }
        .l-preview-body { display:flex; min-height:420px; }
        .l-preview-side {
          width:200px; border-right:1px solid ${colors.border};
          padding:12px 8px; display:flex; flex-direction:column; gap:2px;
        }
        .l-side-label {
          font-size:10px; font-weight:700; color:${colors.muted}; text-transform:uppercase;
          letter-spacing:0.1em; padding:12px 12px 6px;
        }
        .l-side-item {
          padding:8px 12px; border-radius:6px; font-size:13px; color:${colors.textSec};
          display:flex; align-items:center; gap:8px; transition:all 0.1s;
        }
        .l-side-item:hover { background:${colors.chipBg}; color:${isDark ? '#a1a1aa' : '#52525b'}; }
        .l-side-item.active { background:${colors.accentBg}; color:${colors.accent}; }
        .l-preview-chat { flex:1; padding:24px; display:flex; flex-direction:column; gap:16px; }
        .l-msg { display:flex; gap:12px; }
        .l-msg-av {
          width:32px; height:32px; border-radius:50%; flex-shrink:0;
          display:flex; align-items:center; justify-content:center;
        }
        .l-msg-av.user { background:${colors.accent}; color:#fff; font-size:12px; font-weight:600; }
        .l-msg-av.ai {
          background:${isDark ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.08)'};
          border:1px solid ${isDark ? 'rgba(139,92,246,0.2)' : 'rgba(139,92,246,0.12)'};
        }
        .l-msg-av.ai img { width:16px; height:16px; filter:var(--logo-filter); }
        .l-msg-body { flex:1; }
        .l-msg-name { font-size:12px; font-weight:600; color:${isDark ? '#a1a1aa' : '#71717a'}; margin-bottom:4px; }
        .l-msg-text { font-size:13.5px; color:${isDark ? '#d4d4d8' : '#3f3f46'}; line-height:1.6; }
        .l-msg-text strong { color:${colors.text}; font-weight:600; }
        .l-msg-bubble { padding:12px 16px; border-radius:12px; margin-top:4px; }
        .l-msg-bubble.user { background:${colors.accent}; color:#fff; display:inline-block; border-bottom-left-radius:4px; }
        .l-msg-bubble.ai { background:${colors.cardBg}; border:1px solid ${colors.border}; }
        .l-blueprint-card {
          margin-top:12px; padding:12px 14px; background:${colors.accentBg};
          border:1px solid ${isDark ? 'rgba(59,130,246,0.12)' : 'rgba(37,99,235,0.08)'};
          border-radius:10px; font-size:12px; color:${isDark ? '#a1a1aa' : '#71717a'};
        }
        .l-blueprint-card strong { color:${colors.accent}; }
        .l-deploy-badge {
          display:inline-flex; align-items:center; gap:8px; margin-top:10px;
          padding:8px 14px; background:${isDark ? 'rgba(34,197,94,0.08)' : 'rgba(34,197,94,0.06)'};
          border:1px solid ${isDark ? 'rgba(34,197,94,0.15)' : 'rgba(34,197,94,0.1)'};
          border-radius:8px; font-size:12px; color:#22c55e; font-weight:500;
        }

        .l-section { padding:120px 24px; max-width:1120px; margin:0 auto; }
        .l-label {
          font-size:12px; font-weight:600; color:${colors.accent}; text-transform:uppercase;
          letter-spacing:0.1em; margin-bottom:12px;
        }
        .l-heading {
          font-size:clamp(28px,4vw,40px); font-weight:700; color:${colors.text};
          letter-spacing:-0.03em; line-height:1.15; margin-bottom:14px;
        }
        .l-desc { font-size:16px; color:${colors.textSec}; line-height:1.7; max-width:480px; margin-bottom:56px; }

        .bento-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
        .l-features-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
        .l-feature {
          position:relative; padding:32px 28px; background:${colors.cardBg};
          border:1px solid ${colors.border}; border-radius:14px;
          transition:all 0.3s ${EASE}; overflow:hidden; will-change:transform;
        }
        .l-feature::before {
          content:''; position:absolute; inset:0;
          background:radial-gradient(400px circle at var(--glare-x,50%) var(--glare-y,50%),
            ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)'} 0%, transparent 70%);
          pointer-events:none; opacity:0; transition:opacity 0.3s;
        }
        .l-feature:hover::before { opacity:1; }
        .l-feature-icon {
          width:40px; height:40px; border-radius:10px;
          background:${colors.accentBg}; color:${colors.accent};
          display:flex; align-items:center; justify-content:center;
          margin-bottom:20px;
        }
        .l-feature h3 { font-size:16px; font-weight:600; color:${colors.text}; margin-bottom:8px; }
        .l-feature p { font-size:14px; color:${colors.textSec}; line-height:1.65; }
        .l-feature--span { grid-column:span 2; }

        .l-steps { display:grid; grid-template-columns:repeat(3,1fr); gap:32px; position:relative; }
        .l-step { position:relative; }
        .l-step-num {
          font-size:52px; font-weight:800; color:${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'};
          letter-spacing:-0.04em; margin-bottom:16px; line-height:1;
        }
        .l-step h3 { font-size:17px; font-weight:600; color:${colors.text}; margin-bottom:8px; }
        .l-step p { font-size:14px; color:${colors.textSec}; line-height:1.65; }
        .l-step-line {
          position:absolute; top:28px; left:calc(50% + 24px);
          width:calc(100% - 48px); height:1px;
          background:linear-gradient(90deg, ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}, transparent);
        }
        .l-step-line::before {
          content:''; position:absolute; top:0; left:0;
          height:1px; width:100%;
          background:linear-gradient(90deg, ${colors.accent}, transparent);
          animation:drawLine 1.5s ${EASE} forwards; transform-origin:left;
        }

        .l-logos {
          padding:80px 24px; text-align:center;
          border-top:1px solid ${colors.border};
          border-bottom:1px solid ${colors.border};
        }
        .l-logos-label {
          font-size:12px; font-weight:600; color:${colors.muted}; text-transform:uppercase;
          letter-spacing:0.1em; margin-bottom:32px;
        }
        .l-logos-row {
          display:flex; align-items:center; justify-content:center;
          gap:48px; flex-wrap:wrap; max-width:800px; margin:0 auto;
        }
        .l-logo-item {
          font-size:15px; font-weight:600; color:${isDark ? '#3f3f46' : '#a1a1aa'};
          display:flex; align-items:center; gap:8px; transition:color 0.2s;
        }
        .l-logo-item:hover { color:${isDark ? '#a1a1aa' : '#52525b'}; }

        .l-cta { padding:120px 24px; text-align:center; }
        .l-cta-box {
          max-width:640px; margin:0 auto; padding:64px 48px;
          background:${colors.cardBg}; border:1px solid ${colors.border};
          border-radius:20px;
        }
        .l-cta h2 {
          font-size:clamp(24px,4vw,36px); font-weight:700; color:${colors.text};
          letter-spacing:-0.03em; margin-bottom:14px;
        }
        .l-cta p { font-size:16px; color:${colors.textSec}; margin-bottom:32px; max-width:420px; margin-left:auto; margin-right:auto; line-height:1.7; }
        .l-cta-btn {
          display:inline-flex; align-items:center; gap:8px;
          padding:14px 32px; background:${colors.text}; color:${colors.bg};
          border:none; border-radius:10px; font-size:15px; font-weight:600;
          cursor:none; font-family:inherit; transition:all 0.25s ${EASE};
        }
        .l-cta-btn:hover { box-shadow:0 8px 30px ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'}; transform:translateY(-1px); }

        .l-footer {
          padding:32px 48px; border-top:1px solid ${colors.border};
          display:flex; align-items:center; justify-content:space-between;
        }
        .l-footer-left { font-size:13px; color:${colors.muted}; display:flex; align-items:center; gap:8px; }
        .l-footer-right { display:flex; align-items:center; gap:16px; }
        .l-footer-theme {
          background:none; border:1px solid ${colors.border};
          border-radius:6px; color:${colors.muted}; padding:6px; cursor:none;
          display:flex; align-items:center; transition:all 0.15s;
        }
        .l-footer-theme:hover { color:${isDark ? '#a1a1aa' : '#52525b'}; border-color:${colors.borderHover}; }

        /* Scroll progress */
        .scroll-progress {
          position:fixed; top:0; left:0; height:2px; z-index:10001;
          background:linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899);
          width:${scrollPct}%; transition:width 0.1s linear;
          box-shadow:0 0 10px rgba(59,130,246,0.5);
        }

        /* Hero grid bg */
        .hero-grid-bg {
          position:absolute; inset:0; pointer-events:none;
          background-image:
            radial-gradient(circle at 1px 1px, ${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'} 1px, transparent 0);
          background-size:32px 32px;
          mask-image:radial-gradient(ellipse 60% 50% at 50% 40%, black 20%, transparent 70%);
          -webkit-mask-image:radial-gradient(ellipse 60% 50% at 50% 40%, black 20%, transparent 70%);
          opacity:0.6;
        }

        /* Social proof */
        .social-proof {
          display:flex; align-items:center; justify-content:center; gap:16px; margin-top:40px;
        }
        .avatar-stack { display:flex; }
        .avatar-stack-item {
          width:32px; height:32px; border-radius:50%; border:2px solid ${colors.bg};
          display:flex; align-items:center; justify-content:center;
          font-size:11px; font-weight:600; color:#fff; margin-left:-8px;
        }
        .avatar-stack-item:first-child { margin-left:0; }
        .social-proof-text { font-size:13px; color:${colors.muted}; }
        .social-proof-text strong { color:${colors.textSec}; font-weight:600; }

        /* Floating badges */
        .float-badge {
          position:absolute; padding:8px 14px; border-radius:10px;
          background:${colors.bgSurface}; border:1px solid ${colors.border};
          font-size:12px; font-weight:500; color:${colors.textSec};
          display:flex; align-items:center; gap:6px; z-index:2;
          box-shadow:0 4px 16px ${isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.06)'};
          animation:floatBadge 6s ease-in-out infinite;
        }
        .float-badge.b1 { top:10%; left:-40px; animation-delay:0s; }
        .float-badge.b2 { top:50%; right:-30px; animation-delay:1s; }
        .float-badge.b3 { bottom:10%; left:-20px; animation-delay:2s; }
        @keyframes floatBadge {
          0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)}
        }

        /* Marquee */
        .marquee-section {
          padding:60px 0; overflow:hidden;
          border-top:1px solid ${colors.border};
          border-bottom:1px solid ${colors.border};
        }
        .marquee-label {
          text-align:center; font-size:12px; font-weight:600;
          color:${colors.muted}; text-transform:uppercase;
          letter-spacing:0.1em; margin-bottom:28px;
        }
        .marquee-track {
          display:flex; gap:64px; width:max-content;
          animation:marquee 30s linear infinite;
        }
        .marquee-track:hover { animation-play-state:paused; }
        @keyframes marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        .marquee-item {
          font-size:16px; font-weight:600; color:${isDark ? '#3f3f46' : '#a1a1aa'};
          display:flex; align-items:center; gap:10px; white-space:nowrap;
          transition:color 0.2s; flex-shrink:0;
        }
        .marquee-item:hover { color:${isDark ? '#a1a1aa' : '#52525b'}; }

        /* Testimonials */
        .testimonials-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
        .testimonial {
          padding:28px 24px; background:${colors.cardBg};
          border:1px solid ${colors.border}; border-radius:14px;
          border-left:3px solid ${colors.accent}; transition:all 0.25s;
        }
        .testimonial:hover { border-color:${colors.borderHover}; transform:translateY(-2px); }
        .testimonial-stars { display:flex; gap:2px; margin-bottom:14px; color:#f59e0b; }
        .testimonial-text { font-size:14px; color:${colors.textSec}; line-height:1.7; margin-bottom:18px; font-style:italic; }
        .testimonial-author { display:flex; align-items:center; gap:10px; }
        .testimonial-avatar {
          width:36px; height:36px; border-radius:50%;
          background:linear-gradient(135deg, ${colors.accent}, #8b5cf6);
          display:flex; align-items:center; justify-content:center;
          font-size:13px; font-weight:700; color:#fff; flex-shrink:0;
        }
        .testimonial-name { font-size:13px; font-weight:600; color:${colors.text}; }
        .testimonial-role { font-size:12px; color:${colors.muted}; }

        /* FAQ */
        .faq-list { max-width:640px; margin:0 auto; display:flex; flex-direction:column; gap:8px; }
        .faq-item {
          background:${colors.cardBg}; border:1px solid ${colors.border};
          border-radius:12px; overflow:hidden; transition:border-color 0.2s;
        }
        .faq-item.open { border-color:${colors.borderHover}; }
        .faq-question {
          display:flex; align-items:center; justify-content:space-between;
          padding:18px 20px; cursor:pointer; font-size:14px; font-weight:600;
          color:${colors.text}; background:none; border:none; width:100%;
          text-align:left; font-family:inherit;
        }
        .faq-question:hover { color:${colors.accent}; }
        .faq-chevron { transition:transform 0.3s ${EASE}; color:${colors.muted}; }
        .faq-item.open .faq-chevron { transform:rotate(180deg); color:${colors.accent}; }
        .faq-answer {
          padding:0 20px; font-size:14px; color:${colors.textSec}; line-height:1.7;
          max-height:0; overflow:hidden; transition:all 0.3s ${EASE};
        }
        .faq-item.open .faq-answer { max-height:200px; padding:0 20px 18px; }

        /* Divider */
        .section-divider {
          height:1px; max-width:200px; margin:0 auto;
          background:linear-gradient(90deg, transparent, ${colors.borderHover}, transparent);
        }

        /* Bento grid */
        .bento-grid {
          display:grid; grid-template-columns:repeat(3,1fr); gap:16px;
        }
        .bento-item:first-child { grid-column:span 2; }
        .bento-item { min-height:200px; }

        /* CTA glow */
        .cta-glow {
          animation:ctaPulse 3s ease-in-out infinite;
        }
        @keyframes ctaPulse {
          0%,100%{box-shadow:0 0 0 0 rgba(59,130,246,0)} 50%{box-shadow:0 0 40px 4px rgba(59,130,246,0.1)}
        }

        @media(max-width:768px) {
          .l-nav { padding:0 16px; }
          .l-nav-item { display:none; }
          .l-features-grid, .l-steps, .testimonials-grid, .bento-grid { grid-template-columns:1fr; }
          .l-feature--span, .bento-item:first-child { grid-column:span 1; }
          .l-step-line { display:none; }
          .l-preview-side { display:none; }
          .l-hero-metrics { gap:24px; }
          .l-metric-val { font-size:22px; }
          .l-footer { flex-direction:column; gap:16px; text-align:center; }
          .l-hero h1 { font-size:clamp(36px,10vw,56px); }
          .float-badge { display:none; }
          .social-proof { flex-wrap:wrap; }
        }
      `}</style>

      {/* Load screen */}
      <div className="load-screen">
        <img src="/logo.svg" alt="" className="load-logo" />
      </div>

      {/* Scroll progress bar */}
      <div className="scroll-progress" />

      {/* Cursor */}
      <div className="l-cursor" ref={cursorRef} />
      <div className="l-cursor-ring" ref={cursorRingRef} />

      {/* Nav */}
      <nav className="l-nav">
        <a href="/" className="l-nav-brand">
          <img src="/logo.svg" alt="DiscordGPT" className="l-nav-logo" />
          <span className="l-nav-name">DiscordGPT</span>
        </a>
        <div className="l-nav-right">
          <button className="l-nav-item" onClick={toggleTheme}>
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <button className="l-nav-item" onClick={() => window.location.href = '/api/auth/discord'}>Sign in</button>
          <button className="l-nav-cta" onClick={() => window.location.href = '/api/auth/discord'}>Get Started</button>
        </div>
      </nav>

      {/* Hero */}
      <section className="l-hero">
        <div className="hero-grid-bg" />
        <div className="l-hero-orb o1" />
        <div className="l-hero-orb o2" />
        <div className="l-hero-orb o3" />
        <div className="l-hero-orb o4" />
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
              <a
                href="/api/auth/discord"
                className="l-btn-primary"
                ref={el => magnetRefs.current[0] = el}
                onMouseMove={(e) => onMagnetMove(e, 0)}
                onMouseLeave={() => onMagnetLeave(0)}
              >
                Get started free <ArrowRight size={15} />
              </a>
              <button
                className="l-btn-secondary"
                ref={el => magnetRefs.current[1] = el}
                onMouseMove={(e) => onMagnetMove(e, 1)}
                onMouseLeave={() => onMagnetLeave(1)}
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              >
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
          <Reveal delay={400}>
            <div className="social-proof">
              <div className="avatar-stack">
                <div className="avatar-stack-item" style={{background:'#3b82f6'}}>A</div>
                <div className="avatar-stack-item" style={{background:'#8b5cf6'}}>M</div>
                <div className="avatar-stack-item" style={{background:'#ec4899'}}>S</div>
                <div className="avatar-stack-item" style={{background:'#f59e0b'}}>K</div>
                <div className="avatar-stack-item" style={{background:'#10b981'}}>J</div>
              </div>
              <div className="social-proof-text">Trusted by <strong>1,200+</strong> server creators</div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Preview */}
      <div className="l-preview-section">
        <Reveal>
          <div
            className="l-preview-wrap"
            ref={previewRef}
            onMouseMove={onPreviewMouse}
            onMouseLeave={onPreviewLeave}
            style={{ transform: `translateY(${scrollY * -0.05}px)` }}
          >
            <div className="l-preview-glow" />
            <div className="float-badge b1"><MessageSquare size={12} /> 12 channels</div>
            <div className="float-badge b2"><Shield size={12} /> 8 roles</div>
            <div className="float-badge b3"><CheckCircle size={12} /> Auto-mod</div>
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
                          <span style={{color: colors.textSec}}>Info</span> — #rules · #announcements · #roles<br />
                          <span style={{color: colors.textSec}}>General</span> — #general · #memes · #off-topic<br />
                          <span style={{color: colors.textSec}}>Gaming</span> — #looking-for-group · #clips · #lfg<br />
                          <span style={{color: colors.textSec}}>Voice</span> — General · Gaming · AFK
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

      {/* Logos - Scrolling Marquee */}
      <div className="marquee-section">
        <div className="marquee-label">Powered by</div>
        <div className="marquee-track">
          {[...Array(2)].map((_, setIdx) => (
            <React.Fragment key={setIdx}>
              <div className="marquee-item"><Bot size={18} /> OpenAI</div>
              <div className="marquee-item"><Brain size={18} /> Anthropic</div>
              <div className="marquee-item"><Zap size={18} /> Groq</div>
              <div className="marquee-item"><Rocket size={18} /> DeepSeek</div>
              <div className="marquee-item"><Shield size={18} /> Gemini</div>
              <div className="marquee-item"><Bot size={18} /> OpenAI</div>
              <div className="marquee-item"><Brain size={18} /> Anthropic</div>
              <div className="marquee-item"><Zap size={18} /> Groq</div>
              <div className="marquee-item"><Rocket size={18} /> DeepSeek</div>
              <div className="marquee-item"><Shield size={18} /> Gemini</div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Features */}
      <section className="l-section" id="features">
        <Reveal>
          <div className="l-label">Features</div>
          <h2 className="l-heading">Everything you need</h2>
          <p className="l-desc">Tools to build, manage, and scale your Discord community.</p>
        </Reveal>
        <div className="bento-grid">
          {[
            { icon: <Bot size={20} />, title: 'AI Server Builder', desc: 'Natural language to complete server blueprint. Channels, roles, permissions — all generated.', span: true },
            { icon: <Zap size={20} />, title: 'One-Click Deploy', desc: 'Review the blueprint, approve it, and your server is live. No manual configuration.' },
            { icon: <LayoutTemplate size={20} />, title: 'Templates', desc: 'Pre-built server layouts for gaming, education, business, and communities.' },
            { icon: <Shield size={20} />, title: 'Auto Moderation', desc: 'Anti-raid, spam filters, verification, and role-based access set up automatically.' },
            { icon: <Brain size={20} />, title: 'Multi-AI Router', desc: 'Intelligent provider selection. Fallback chains ensure your requests always complete.' },
            { icon: <Rocket size={20} />, title: 'Bot Generation', desc: 'Generate Discord.js bot code with slash commands and event handlers.' },
          ].map((f, i) => (
            <Reveal key={i} delay={i * 80}>
              <div
                className={`l-feature${f.span ? ' l-feature--span' : ''}`}
                ref={el => featureRefs.current[i] = el}
                onMouseMove={(e) => onFeatureMove(e, i)}
                onMouseLeave={() => onFeatureLeave(i)}
              >
                <div className="l-feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* How it works */}
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
            <Reveal key={i} delay={i * 120}>
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

      {/* Divider */}
      <div className="section-divider" />

      {/* Testimonials */}
      <section className="l-section">
        <Reveal>
          <div className="l-label">Testimonials</div>
          <h2 className="l-heading">Loved by creators</h2>
          <p className="l-desc">See what our users are saying about DiscordGPT.</p>
        </Reveal>
        <div className="testimonials-grid">
          {[
            { name: 'Alex Chen', role: 'Server Admin', initials: 'AC', color: '#3b82f6', text: 'Built a 50-channel gaming server in under 2 minutes. The AI nailed the role hierarchy and auto-mod setup perfectly.' },
            { name: 'Sarah Kim', role: 'Community Manager', initials: 'SK', color: '#8b5cf6', text: 'The template system is incredible. I saved our org template and deployed it across 12 servers with consistent results every time.' },
            { name: 'Marcus Johnson', role: 'Developer', initials: 'MJ', color: '#ec4899', text: 'Bot generation is a game changer. Got a working Discord.js bot with slash commands in one message. Saved me hours of boilerplate.' },
          ].map((t, i) => (
            <Reveal key={i} delay={i * 100}>
              <div className="testimonial">
                <div className="testimonial-stars">
                  {[...Array(5)].map((_, j) => <Star key={j} size={14} fill="#f59e0b" color="#f59e0b" />)}
                </div>
                <div className="testimonial-text">"{t.text}"</div>
                <div className="testimonial-author">
                  <div className="testimonial-avatar" style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}88)` }}>{t.initials}</div>
                  <div>
                    <div className="testimonial-name">{t.name}</div>
                    <div className="testimonial-role">{t.role}</div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="section-divider" />

      {/* FAQ */}
      <section className="l-section">
        <Reveal>
          <div className="l-label">FAQ</div>
          <h2 className="l-heading">Frequently asked questions</h2>
          <p className="l-desc">Everything you need to know about DiscordGPT.</p>
        </Reveal>
        <div className="faq-list">
          {[
            { q: 'How does the AI generate servers?', a: 'Our AI analyzes your natural language description and generates a complete Discord server blueprint including channels, roles, permissions, and settings. It uses advanced language models trained on thousands of server configurations.' },
            { q: 'Can I customize the blueprint?', a: 'Absolutely. After the AI generates a blueprint, you can review and modify any aspect — channels, roles, permissions, emoji, and more. The blueprint is fully editable before deployment.' },
            { q: 'Which AI providers do you support?', a: 'We support OpenAI (GPT-4o), Anthropic (Claude), Groq, DeepSeek, and Google Gemini. You can configure your own API keys and the system will intelligently route requests with automatic fallback.' },
            { q: 'Is it free to use?', a: 'Yes! DiscordGPT is free to use. You get a daily message limit which resets at midnight UTC. Admins can adjust limits per user. We may introduce premium tiers in the future.' },
            { q: 'How does server deployment work?', a: 'Once you approve a blueprint, the system uses the Discord Bot API to create your server with all channels, roles, and permissions pre-configured. The entire process takes under 60 seconds.' },
          ].map((faq, i) => (
            <Reveal key={i} delay={i * 60}>
              <div className={`faq-item${faqOpen === i ? ' open' : ''}`}>
                <button className="faq-question" onClick={() => setFaqOpen(faqOpen === i ? null : i)}>
                  {faq.q}
                  <ChevronDown size={16} className="faq-chevron" />
                </button>
                <div className="faq-answer">{faq.a}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="section-divider" />

      {/* CTA */}
      <section className="l-cta">
        <Reveal>
          <div className="l-cta-box cta-glow">
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
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>
      </footer>
    </div>
  )
}
