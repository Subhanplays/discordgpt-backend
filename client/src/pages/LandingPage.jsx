import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { Sun, Moon, Bot, Zap, LayoutTemplate, ArrowRight, Sparkles, Shield, MessageSquare, ChevronRight, Brain, Rocket, Code, Users, Globe, Star, Terminal, Palette, Lock } from 'lucide-react'

const DISCORD_SVG = <svg width="18" height="14" viewBox="0 0 71 55" fill="none"><path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5604 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.9048 3.0581 26.1885 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.4218 0.40133C20.3475 1.2916 15.4948 2.8214 10.9693 4.8978C10.9693 4.8978 6.86847 11.0623 6.07067 17.1568C0.857776 24.7397 0.064707 32.1073 0.467713 39.3675C0.482247 39.4475 0.561648 39.5097 0.644049 39.5097C6.47654 42.6062 12.1445 44.4138 17.7245 45.5639C17.8085 45.5801 17.8928 45.5522 17.9591 45.4884C19.4858 43.4164 20.8232 41.2152 21.9604 38.9044C22.0267 38.8411 22.0108 38.7409 21.9337 38.6983C19.6683 37.8558 17.4953 36.7558 15.4519 35.4245C15.3029 35.3275 15.3029 35.1318 15.4519 35.0348C15.9725 34.7117 16.4931 34.3765 16.9922 34.0286C17.0782 33.9713 17.1806 33.9638 17.273 34.0074C29.5917 39.6658 42.8085 39.6658 55.0431 34.0074C55.1375 33.9618 55.2399 33.9713 55.3279 34.0286C55.8287 34.3765 56.3493 34.7117 56.8681 35.0348C57.0171 35.1318 57.0171 35.3275 56.8681 35.4245C54.8247 36.7558 52.6517 37.8558 50.3844 38.6983C50.3073 38.7409 50.2934 38.8411 50.3577 38.9044C51.4949 41.2152 52.8323 43.4164 54.359 45.4884C54.4253 45.5522 54.5116 45.5801 54.5956 45.5639C60.1775 44.4138 65.8455 42.6062 71.678 39.5097C71.7624 39.5097 71.8418 39.4475 71.8553 39.3675C72.3314 31.0951 70.8709 23.7657 66.0665 17.3131C66.0665 17.3131 61.9657 11.0989 60.1045 4.8978ZM23.7259 32.4621C20.2729 32.4621 17.4516 29.3049 17.4516 25.4517C17.4516 21.5985 20.2189 18.4144 23.7259 18.4144C27.2661 18.4144 30.0456 21.5985 30.0002 25.4517C30.0002 29.3049 27.2458 32.4621 23.7259 32.4621ZM47.3178 32.4621C43.8648 32.4621 41.0435 29.3049 41.0435 25.4517C41.0435 21.5985 43.8108 18.4144 47.3178 18.4144C50.858 18.4144 53.6376 21.5985 53.5921 25.4517C53.5921 29.3049 50.858 32.4621 47.3178 32.4621Z" fill="currentColor"/></svg>

function Particles() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId
    const particles = []
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 2 + 0.5,
        o: Math.random() * 0.5 + 0.1,
      })
    }
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(59,130,246,${p.o})`
        ctx.fill()
      })
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(59,130,246,${0.08 * (1 - dist / 120)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }
      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }} />
}

function Counter({ target, duration = 2000, suffix = '' }) {
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
    let s = 0
    const step = target / (duration / 16)
    const t = setInterval(() => { s += step; if (s >= target) { setCount(target); clearInterval(t) } else setCount(Math.floor(s)) }, 16)
    return () => clearInterval(t)
  }, [vis, target, duration])
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

function Reveal({ children, delay = 0, direction = 'up' }) {
  const [v, setV] = useState(false)
  const r = useRef(null)
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true) }, { threshold: 0.1 })
    if (r.current) o.observe(r.current)
    return () => o.disconnect()
  }, [])
  const transforms = { up: 'translateY(60px)', down: 'translateY(-60px)', left: 'translateX(60px)', right: 'translateX(-60px)', scale: 'scale(0.8)', rotate: 'rotateX(15deg)' }
  return (
    <div ref={r} style={{
      opacity: v ? 1 : 0,
      transform: v ? 'none' : transforms[direction],
      transition: `all 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      willChange: 'transform, opacity',
    }}>{children}</div>
  )
}

function Card3D({ children, className = '', style = {} }) {
  const cardRef = useRef(null)
  const [transform, setTransform] = useState('')
  const [glare, setGlare] = useState({ x: 50, y: 50, o: 0 })
  const handleMove = useCallback((e) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    const tiltX = (y - 0.5) * -12
    const tiltY = (x - 0.5) * 12
    setTransform(`perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02,1.02,1.02)`)
    setGlare({ x: x * 100, y: y * 100, o: 0.15 })
  }, [])
  const handleLeave = useCallback(() => {
    setTransform('perspective(800px) rotateX(0) rotateY(0) scale3d(1,1,1)')
    setGlare({ x: 50, y: 50, o: 0 })
  }, [])
  return (
    <div
      ref={cardRef}
      className={className}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ ...style, transform, transition: 'transform 0.15s ease-out', '--glare-x': `${glare.x}%`, '--glare-y': `${glare.y}%`, '--glare-o': glare.o }}
    >
      {children}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none',
        background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,${glare.o}) 0%, transparent 60%)`,
        transition: 'background 0.15s ease-out',
      }} />
    </div>
  )
}

function TypeWriter({ texts, speed = 60, deleteSpeed = 30, pause = 2000 }) {
  const [displayText, setDisplayText] = useState('')
  const [textIdx, setTextIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  useEffect(() => {
    const current = texts[textIdx]
    const timer = setTimeout(() => {
      if (!isDeleting) {
        setDisplayText(current.slice(0, charIdx + 1))
        setCharIdx(charIdx + 1)
        if (charIdx + 1 === current.length) {
          setTimeout(() => setIsDeleting(true), pause)
        }
      } else {
        setDisplayText(current.slice(0, charIdx - 1))
        setCharIdx(charIdx - 1)
        if (charIdx - 1 === 0) {
          setIsDeleting(false)
          setTextIdx((textIdx + 1) % texts.length)
        }
      }
    }, isDeleting ? deleteSpeed : speed)
    return () => clearTimeout(timer)
  }, [charIdx, isDeleting, textIdx, texts, speed, deleteSpeed, pause])
  return <span>{displayText}<span style={{ borderRight: '2px solid var(--accent)', animation: 'blink 1s step-end infinite', marginLeft: 2 }}>&nbsp;</span></span>
}

function MagneticBtn({ children, href, className = '', style = {} }) {
  const ref = useRef(null)
  const handleMove = useCallback((e) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    el.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`
  }, [])
  const handleLeave = useCallback(() => {
    if (ref.current) ref.current.style.transform = 'translate(0,0)'
  }, [])
  return (
    <a ref={ref} href={href} className={className} style={{ ...style, transition: 'transform 0.2s ease-out' }} onMouseMove={handleMove} onMouseLeave={handleLeave}>
      {children}
    </a>
  )
}

function OrbitRing({ size, duration, delay = 0, children }) {
  return (
    <div style={{
      position: 'absolute', width: size, height: size, top: '50%', left: '50%',
      marginTop: -size / 2, marginLeft: -size / 2,
      border: '1px solid rgba(59,130,246,0.1)', borderRadius: '50%',
      animation: `spin ${duration}s linear ${delay}s infinite`,
    }}>
      <div style={{ position: 'absolute', top: -6, left: '50%', marginLeft: -6 }}>
        {children}
      </div>
    </div>
  )
}

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme()
  const [scrollY, setScrollY] = useState(0)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const heroRef = useRef(null)
  const [heroTilt, setHeroTilt] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    const handleMouse = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY })
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect()
        const x = (e.clientX - rect.left - rect.width / 2) / rect.width
        const y = (e.clientY - rect.top - rect.height / 2) / rect.height
        setHeroTilt({ x: y * -8, y: x * 8 })
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('mousemove', handleMouse)
    return () => { window.removeEventListener('scroll', handleScroll); window.removeEventListener('mousemove', handleMouse) }
  }, [])

  const parallax = (factor) => `translateY(${scrollY * factor}px)`

  return (
    <div style={{ minHeight: '100vh', overflowY: 'auto', background: 'var(--bg)', fontFamily: 'var(--font)', color: 'var(--text)' }}>
      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes orbFloat { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(20px,-30px) scale(1.1)} 66%{transform:translate(-15px,20px) scale(0.95)} }
        @keyframes gradientShift { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        @keyframes pulseGlow { 0%,100%{box-shadow:0 0 20px rgba(59,130,246,0.2)} 50%{box-shadow:0 0 40px rgba(59,130,246,0.4)} }
        @keyframes float3d { 0%,100%{transform:translateY(0) rotateY(0)} 25%{transform:translateY(-12px) rotateY(5deg)} 75%{transform:translateY(8px) rotateY(-3deg)} }
        @keyframes dash { to{stroke-dashoffset:0} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes morphBg { 0%,100%{border-radius:60% 40% 30% 70%/60% 30% 70% 40%} 50%{border-radius:30% 60% 70% 40%/50% 60% 30% 60%} }
        @keyframes scanline { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }
        @keyframes ripple { 0%{transform:scale(0);opacity:0.6} 100%{transform:scale(4);opacity:0} }
        @keyframes typewriter { from{width:0} to{width:100%} }
        @keyframes glowPulse { 0%,100%{opacity:0.4} 50%{opacity:0.8} }

        .lp-noise {
          position:fixed; inset:0; z-index:0; pointer-events:none; opacity:0.03;
          background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }

        .lp-nav {
          position:fixed; top:0; left:0; right:0; z-index:100;
          display:flex; align-items:center; justify-content:space-between;
          padding:18px 48px;
          background:rgba(10,10,10,${scrollY > 50 ? '0.85' : '0.4'});
          backdrop-filter:blur(${scrollY > 50 ? '24px' : '12px'});
          border-bottom:1px solid rgba(255,255,255,${scrollY > 50 ? '0.06' : '0'});
          transition:all 0.4s ease;
        }
        .lp-nav-brand { display:flex; align-items:center; gap:14px; }
        .lp-nav-logo {
          width:36px; height:36px; border-radius:10px; filter:var(--logo-filter);
          animation:float3d 6s ease-in-out infinite;
          box-shadow:0 4px 20px rgba(59,130,246,0.2);
        }
        .lp-nav-name { font-size:18px; font-weight:700; color:var(--text); letter-spacing:-0.02em; }
        .lp-nav-right { display:flex; align-items:center; gap:8px; }
        .lp-nav-link {
          font-size:14px; color:var(--text-secondary); text-decoration:none;
          cursor:pointer; transition:all 200ms; background:none; border:none;
          font-family:var(--font); padding:8px 16px; border-radius:var(--radius-sm);
        }
        .lp-nav-link:hover { color:var(--text); background:var(--bg-hover); }
        .lp-nav-cta {
          padding:10px 22px; background:var(--accent); color:#fff; border:none;
          border-radius:var(--radius-sm); font-size:14px; font-weight:600;
          cursor:pointer; transition:all 250ms; font-family:var(--font);
          display:flex; align-items:center; gap:8px; position:relative; overflow:hidden;
        }
        .lp-nav-cta::before {
          content:''; position:absolute; inset:0;
          background:linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transform:translateX(-100%); transition:transform 0.5s;
        }
        .lp-nav-cta:hover::before { transform:translateX(100%) }
        .lp-nav-cta:hover { background:var(--accent-hover); transform:translateY(-1px); box-shadow:0 6px 24px rgba(59,130,246,0.35); }

        .hero {
          position:relative; min-height:100vh; display:flex; flex-direction:column;
          align-items:center; justify-content:center; padding:140px 24px 100px; overflow:hidden;
          perspective:1000px;
        }
        .hero-bg {
          position:absolute; inset:0;
          background:
            radial-gradient(ellipse 80% 50% at 50% 0%, rgba(59,130,246,0.18) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 80% 50%, rgba(139,92,246,0.1) 0%, transparent 50%),
            radial-gradient(ellipse 50% 40% at 20% 80%, rgba(236,72,153,0.06) 0%, transparent 50%);
          pointer-events:none;
        }
        .hero-grid {
          position:absolute; inset:0;
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size:80px 80px;
          mask-image:radial-gradient(ellipse 70% 50% at 50% 50%, black 20%, transparent 70%);
          -webkit-mask-image:radial-gradient(ellipse 70% 50% at 50% 50%, black 20%, transparent 70%);
          transform:perspective(500px) rotateX(60deg);
          transform-origin:center top;
          pointer-events:none;
          animation:shimmer 8s linear infinite;
        }
        .hero-content {
          position:relative; z-index:2; text-align:center; max-width:900px;
          transform:perspective(1000px) rotateX(${heroTilt.x}deg) rotateY(${heroTilt.y}deg);
          transition:transform 0.1s ease-out;
        }
        .hero-badge {
          display:inline-flex; align-items:center; gap:10px;
          padding:10px 22px; background:rgba(59,130,246,0.08);
          border:1px solid rgba(59,130,246,0.2); border-radius:28px;
          font-size:13px; font-weight:600; color:var(--accent);
          margin-bottom:36px; backdrop-filter:blur(8px);
          animation: pulseGlow 3s ease-in-out infinite;
        }
        .hero-badge-dot {
          width:8px; height:8px; border-radius:50%; background:var(--accent);
          box-shadow:0 0 12px var(--accent);
          animation:glowPulse 2s ease-in-out infinite;
        }
        .hero-title {
          font-size:clamp(44px,8vw,88px); font-weight:800; color:var(--text);
          letter-spacing:-0.05em; line-height:1.02; margin-bottom:28px;
        }
        .hero-gradient {
          background:linear-gradient(135deg, #3b82f6 0%, #8b5cf6 30%, #ec4899 60%, #3b82f6 100%);
          background-size:300% 300%;
          animation:gradientShift 5s ease infinite;
          -webkit-background-clip:text; -webkit-text-fill-color:transparent;
          background-clip:text;
          filter:drop-shadow(0 0 30px rgba(59,130,246,0.3));
        }
        .hero-sub {
          font-size:clamp(16px,2.2vw,21px); color:var(--text-secondary);
          margin-bottom:52px; max-width:600px; margin-left:auto; margin-right:auto;
          line-height:1.7;
        }
        .hero-btns { display:flex; gap:18px; justify-content:center; flex-wrap:wrap; margin-bottom:64px; }
        .hero-btn-main {
          display:inline-flex; align-items:center; gap:12px;
          padding:18px 40px; background:var(--accent); color:#fff;
          border:none; border-radius:var(--radius-md); font-size:17px;
          font-weight:700; cursor:pointer; transition:all 300ms cubic-bezier(0.16,1,0.3,1);
          font-family:var(--font); text-decoration:none; position:relative; overflow:hidden;
        }
        .hero-btn-main::after {
          content:''; position:absolute; inset:0;
          background:linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%);
          opacity:0; transition:opacity 300ms;
        }
        .hero-btn-main:hover::after { opacity:1 }
        .hero-btn-main:hover {
          transform:translateY(-3px) scale(1.02);
          box-shadow:0 16px 48px rgba(59,130,246,0.4), 0 0 0 1px rgba(59,130,246,0.5) inset;
        }
        .hero-btn-sec {
          display:inline-flex; align-items:center; gap:10px;
          padding:18px 40px; background:rgba(255,255,255,0.03); color:var(--text);
          border:1px solid var(--border); border-radius:var(--radius-md);
          font-size:17px; font-weight:600; cursor:pointer; transition:all 300ms;
          font-family:var(--font); text-decoration:none; backdrop-filter:blur(8px);
        }
        .hero-btn-sec:hover {
          border-color:var(--accent); background:rgba(59,130,246,0.05);
          transform:translateY(-2px); box-shadow:0 8px 32px rgba(0,0,0,0.2);
        }
        .hero-stats {
          display:flex; align-items:center; justify-content:center; gap:40px;
        }
        .hero-stat { text-align:center; }
        .hero-stat-num {
          font-size:32px; font-weight:800;
          background:linear-gradient(135deg, var(--accent), #8b5cf6);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
        }
        .hero-stat-label { font-size:12px; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.08em; margin-top:6px; }
        .hero-stat-line { width:1px; height:48px; background:linear-gradient(180deg, transparent, var(--border), transparent); }

        .hero-preview-wrap {
          position:relative; z-index:2; margin-top:80px; width:100%; max-width:960px;
          transform:perspective(1200px) rotateX(8deg);
          transition:transform 0.3s ease;
        }
        .hero-preview-wrap:hover { transform:perspective(1200px) rotateX(2deg) translateY(-8px); }
        .hero-preview-glow {
          position:absolute; inset:-40px; z-index:-1;
          background:radial-gradient(ellipse at 50% 30%, rgba(59,130,246,0.15) 0%, transparent 60%);
          filter:blur(40px); animation:glowPulse 4s ease-in-out infinite;
        }
        .hero-preview {
          background:rgba(17,17,19,0.9); border:1px solid rgba(255,255,255,0.08);
          border-radius:20px; overflow:hidden;
          box-shadow:0 40px 100px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05) inset,
                     0 0 80px rgba(59,130,246,0.08);
          backdrop-filter:blur(20px);
        }
        .preview-bar {
          display:flex; align-items:center; gap:10px; padding:14px 20px;
          background:rgba(255,255,255,0.03); border-bottom:1px solid rgba(255,255,255,0.06);
        }
        .preview-dot { width:12px; height:12px; border-radius:50%; }
        .preview-dot.r { background:#ff5f57; box-shadow:0 0 8px rgba(255,95,87,0.4); }
        .preview-dot.y { background:#febc2e; box-shadow:0 0 8px rgba(254,188,46,0.4); }
        .preview-dot.g { background:#28c840; box-shadow:0 0 8px rgba(40,200,64,0.4); }
        .preview-bar-title { flex:1; text-align:center; font-size:13px; color:var(--text-muted); font-weight:500; }
        .preview-body { display:flex; gap:0; min-height:380px; }
        .preview-sidebar {
          width:220px; flex-shrink:0; padding:16px 12px;
          border-right:1px solid rgba(255,255,255,0.06);
          display:flex; flex-direction:column; gap:4px;
        }
        .preview-sidebar-label {
          font-size:11px; font-weight:700; color:var(--text-muted);
          text-transform:uppercase; letter-spacing:0.08em; padding:8px 12px 4px;
        }
        .preview-sidebar-item {
          padding:10px 14px; border-radius:8px; font-size:13px; color:var(--text-secondary);
          display:flex; align-items:center; gap:10px; cursor:pointer; transition:all 150ms;
        }
        .preview-sidebar-item:hover { background:rgba(255,255,255,0.05); color:var(--text); }
        .preview-sidebar-item.active { background:rgba(59,130,246,0.12); color:var(--accent); }
        .preview-chat { flex:1; padding:24px; display:flex; flex-direction:column; gap:20px; }
        .preview-msg { display:flex; gap:14px; animation:slideUp 0.6s ease both; }
        .preview-msg:nth-child(2) { animation-delay:0.4s }
        .preview-msg:nth-child(3) { animation-delay:0.8s }
        .preview-msg:nth-child(4) { animation-delay:1.2s }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .preview-avatar {
          width:36px; height:36px; border-radius:50%; flex-shrink:0;
          display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:600;
        }
        .preview-avatar.user { background:linear-gradient(135deg, var(--accent), #2563eb); color:#fff; }
        .preview-avatar.ai {
          background:linear-gradient(135deg, rgba(139,92,246,0.2), rgba(59,130,246,0.2));
          border:1px solid rgba(139,92,246,0.3);
        }
        .preview-bubble {
          padding:14px 18px; border-radius:16px; font-size:13.5px; line-height:1.65; max-width:85%;
        }
        .preview-bubble.user {
          background:linear-gradient(135deg, var(--accent), #2563eb); color:#fff;
          border-bottom-right-radius:4px;
          box-shadow:0 4px 16px rgba(59,130,246,0.2);
        }
        .preview-bubble.ai {
          background:rgba(255,255,255,0.05); color:var(--text-secondary);
          border-bottom-left-radius:4px; border:1px solid rgba(255,255,255,0.06);
        }
        .preview-blueprint {
          margin-top:12px; padding:14px; background:rgba(59,130,246,0.06);
          border-radius:10px; border-left:3px solid var(--accent);
          font-size:12px; color:var(--text);
        }
        .preview-blueprint strong { color:var(--accent); }
        .preview-deploy {
          display:flex; align-items:center; gap:10px; margin-top:8px;
          padding:10px 16px; background:rgba(34,197,94,0.08);
          border:1px solid rgba(34,197,94,0.2); border-radius:10px;
          font-size:12px; color:#22c55e;
        }

        .features { padding:140px 24px; max-width:1200px; margin:0 auto; position:relative; }
        .section-label {
          font-size:12px; font-weight:700; color:var(--accent);
          text-transform:uppercase; letter-spacing:0.12em;
          text-align:center; margin-bottom:14px;
          display:flex; align-items:center; justify-content:center; gap:12px;
        }
        .section-label::before,.section-label::after {
          content:''; width:24px; height:1px; background:linear-gradient(90deg, transparent, var(--accent));
        }
        .section-label::after { background:linear-gradient(90deg, var(--accent), transparent); }
        .section-title {
          font-size:clamp(30px,5vw,50px); font-weight:800; color:var(--text);
          text-align:center; margin-bottom:18px; letter-spacing:-0.04em; line-height:1.1;
        }
        .section-desc {
          font-size:18px; color:var(--text-muted); text-align:center;
          max-width:540px; margin:0 auto 72px; line-height:1.7;
        }
        .features-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:24px; }
        .feature-card {
          background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06);
          border-radius:20px; padding:40px 30px; position:relative; overflow:hidden;
          transition:all 0.4s cubic-bezier(0.16,1,0.3,1);
        }
        .feature-card::before {
          content:''; position:absolute; top:0; left:0; right:0; height:2px;
          background:linear-gradient(90deg, transparent, var(--accent), transparent);
          opacity:0; transition:opacity 400ms;
        }
        .feature-card:hover::before { opacity:1; }
        .feature-icon {
          width:56px; height:56px; border-radius:16px;
          background:linear-gradient(135deg, rgba(59,130,246,0.12), rgba(139,92,246,0.08));
          color:var(--accent); display:flex; align-items:center; justify-content:center;
          margin-bottom:24px; transition:all 400ms;
          border:1px solid rgba(59,130,246,0.1);
        }
        .feature-card:hover .feature-icon {
          transform:translateY(-4px) scale(1.1);
          box-shadow:0 8px 32px rgba(59,130,246,0.2);
        }
        .feature-title { font-size:20px; font-weight:700; color:var(--text); margin-bottom:12px; }
        .feature-desc { font-size:14.5px; color:var(--text-muted); line-height:1.75; }

        .how { padding:140px 24px; position:relative; overflow:hidden; }
        .how-inner { max-width:1100px; margin:0 auto; }
        .how-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:48px; position:relative; }
        .how-step { text-align:center; position:relative; }
        .how-num {
          width:72px; height:72px; border-radius:50%;
          background:linear-gradient(135deg, var(--accent), #8b5cf6);
          color:#fff; display:flex; align-items:center; justify-content:center;
          font-size:28px; font-weight:800; margin:0 auto 28px;
          box-shadow:0 12px 40px rgba(59,130,246,0.35);
          animation:float3d 5s ease-in-out infinite;
        }
        .how-step:nth-child(2) .how-num { animation-delay:0.5s }
        .how-step:nth-child(3) .how-num { animation-delay:1s }
        .how-title { font-size:20px; font-weight:700; color:var(--text); margin-bottom:12px; }
        .how-desc { font-size:15px; color:var(--text-muted); line-height:1.7; max-width:300px; margin:0 auto; }
        .how-line {
          position:absolute; top:36px; left:calc(50% + 44px);
          width:calc(100% - 88px); height:2px;
          background:linear-gradient(90deg, var(--accent), rgba(139,92,246,0.3));
        }
        .how-line::after {
          content:''; position:absolute; right:0; top:-3px;
          width:8px; height:8px; border-radius:50%;
          background:var(--accent); box-shadow:0 0 12px var(--accent);
          animation:glowPulse 2s ease-in-out infinite;
        }

        .showcase { padding:120px 24px; position:relative; }
        .showcase-inner { max-width:1100px; margin:0 auto; }
        .showcase-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:20px; }
        .showcase-card {
          padding:28px 24px; background:rgba(255,255,255,0.02);
          border:1px solid rgba(255,255,255,0.06); border-radius:16px;
          text-align:center; transition:all 300ms;
        }
        .showcase-card:hover {
          border-color:var(--accent); transform:translateY(-4px);
          box-shadow:0 12px 40px rgba(59,130,246,0.15);
        }
        .showcase-icon { font-size:28px; margin-bottom:14px; }
        .showcase-title { font-size:15px; font-weight:600; color:var(--text); margin-bottom:6px; }
        .showcase-desc { font-size:12.5px; color:var(--text-muted); line-height:1.5; }

        .testimonials { padding:120px 24px; }
        .testimonials-inner { max-width:900px; margin:0 auto; }
        .testimonial-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:24px; }
        .testimonial-card {
          padding:32px; background:rgba(255,255,255,0.02);
          border:1px solid rgba(255,255,255,0.06); border-radius:20px;
          transition:all 300ms;
        }
        .testimonial-card:hover { border-color:rgba(255,255,255,0.12); transform:translateY(-2px); }
        .testimonial-stars { display:flex; gap:4px; margin-bottom:16px; color:#f59e0b; }
        .testimonial-text { font-size:14.5px; color:var(--text-secondary); line-height:1.7; margin-bottom:20px; font-style:italic; }
        .testimonial-author { display:flex; align-items:center; gap:12px; }
        .testimonial-avatar {
          width:40px; height:40px; border-radius:50%;
          background:linear-gradient(135deg, var(--accent), #8b5cf6);
          display:flex; align-items:center; justify-content:center;
          font-size:14px; font-weight:700; color:#fff;
        }
        .testimonial-name { font-size:14px; font-weight:600; color:var(--text); }
        .testimonial-role { font-size:12px; color:var(--text-muted); }

        .cta {
          padding:140px 24px; text-align:center; position:relative;
        }
        .cta-box {
          max-width:760px; margin:0 auto; padding:72px 56px;
          background:linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.08), rgba(236,72,153,0.06));
          border:1px solid rgba(59,130,246,0.15); border-radius:28px;
          position:relative; overflow:hidden;
        }
        .cta-box::before {
          content:''; position:absolute; inset:0;
          background:radial-gradient(circle at 50% 0%, rgba(59,130,246,0.15) 0%, transparent 60%);
          pointer-events:none;
        }
        .cta-box::after {
          content:''; position:absolute; top:-2px; left:20%; right:20%; height:2px;
          background:linear-gradient(90deg, transparent, var(--accent), transparent);
          border-radius:2px;
        }
        .cta-title {
          font-size:clamp(30px,5vw,44px); font-weight:800; color:var(--text);
          margin-bottom:18px; letter-spacing:-0.04em; position:relative;
        }
        .cta-desc {
          font-size:18px; color:var(--text-muted); margin-bottom:40px;
          max-width:500px; margin-left:auto; margin-right:auto;
          line-height:1.7; position:relative;
        }
        .cta-btn {
          display:inline-flex; align-items:center; gap:12px;
          padding:20px 48px; background:var(--accent); color:#fff;
          border:none; border-radius:var(--radius-md); font-size:18px;
          font-weight:700; cursor:pointer; transition:all 300ms cubic-bezier(0.16,1,0.3,1);
          font-family:var(--font); position:relative; overflow:hidden;
        }
        .cta-btn::before {
          content:''; position:absolute; inset:0;
          background:linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%);
          opacity:0; transition:opacity 300ms;
        }
        .cta-btn:hover::before { opacity:1 }
        .cta-btn:hover {
          transform:translateY(-3px) scale(1.02);
          box-shadow:0 20px 60px rgba(59,130,246,0.4);
        }

        .footer {
          padding:48px 24px; text-align:center;
          border-top:1px solid rgba(255,255,255,0.06);
          display:flex; align-items:center; justify-content:center; gap:16px;
        }
        .footer-text { font-size:13px; color:var(--text-muted); }
        .footer-toggle {
          background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08);
          border-radius:8px; color:var(--text-secondary); cursor:pointer;
          padding:8px; display:flex; align-items:center; justify-content:center;
          transition:all 200ms;
        }
        .footer-toggle:hover { background:rgba(255,255,255,0.08); color:var(--text); }

        .cursor-glow {
          position:fixed; width:400px; height:400px; border-radius:50%;
          background:radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%);
          pointer-events:none; z-index:0;
          transform:translate(${mousePos.x - 200}px, ${mousePos.y - 200}px);
          transition:transform 0.15s ease-out;
        }

        @media(max-width:768px) {
          .lp-nav { padding:14px 16px; }
          .lp-nav-link { display:none; }
          .features-grid { grid-template-columns:1fr; }
          .how-grid { grid-template-columns:1fr; gap:40px; }
          .how-line { display:none; }
          .showcase-grid { grid-template-columns:repeat(2,1fr); }
          .testimonial-grid { grid-template-columns:1fr; }
          .preview-sidebar { display:none; }
          .hero-stats { gap:20px; }
          .hero-stat-num { font-size:24px; }
          .cta-box { padding:48px 24px; }
        }
      `}</style>

      <div className="lp-noise" />
      <div className="cursor-glow" />

      <nav className="lp-nav">
        <div className="lp-nav-brand">
          <img src="/logo.svg" alt="DiscordGPT" className="lp-nav-logo" />
          <span className="lp-nav-name">DiscordGPT</span>
        </div>
        <div className="lp-nav-right">
          <button className="lp-nav-link" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button className="lp-nav-link" onClick={() => window.location.href = '/api/auth/discord'}>Log in</button>
          <button className="lp-nav-cta" onClick={() => window.location.href = '/api/auth/discord'}>
            {DISCORD_SVG} Get Started <ArrowRight size={16} />
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero" ref={heroRef}>
        <Particles />
        <div className="hero-bg" />
        <div className="hero-grid" style={{ transform: `perspective(500px) rotateX(60deg) translateY(${scrollY * 0.15}px)` }} />

        {/* Orbit rings */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', width: 0, height: 0, zIndex: 1 }}>
          <OrbitRing size={500} duration={30} delay={0}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 16px var(--accent)' }} />
          </OrbitRing>
          <OrbitRing size={700} duration={45} delay={5}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#8b5cf6', boxShadow: '0 0 12px #8b5cf6' }} />
          </OrbitRing>
          <OrbitRing size={900} duration={60} delay={10}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ec4899', boxShadow: '0 0 10px #ec4899' }} />
          </OrbitRing>
        </div>

        <div className="hero-content" style={{ transform: `perspective(1000px) rotateX(${heroTilt.x}deg) rotateY(${heroTilt.y}deg) translateY(${scrollY * -0.2}px)` }}>
          <Reveal delay={0}>
            <div className="hero-badge">
              <div className="hero-badge-dot" />
              AI-Powered Server Builder
            </div>
          </Reveal>

          <Reveal delay={100}>
            <h1 className="hero-title">
              Build Discord Servers<br />
              with <span className="hero-gradient">Artificial Intelligence</span>
            </h1>
          </Reveal>

          <Reveal delay={200}>
            <p className="hero-sub">
              Describe your ideal Discord server in plain language. AI generates a complete blueprint
              with channels, roles, permissions, and bots — then deploys it instantly.
            </p>
          </Reveal>

          <Reveal delay={300}>
            <div className="hero-btns">
              <MagneticBtn href="/api/auth/discord" className="hero-btn-main">
                {DISCORD_SVG} Start Building Free <ArrowRight size={18} />
              </MagneticBtn>
              <button className="hero-btn-sec" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
                See How It Works <ChevronRight size={18} />
              </button>
            </div>
          </Reveal>

          <Reveal delay={400}>
            <div className="hero-stats">
              <div className="hero-stat">
                <div className="hero-stat-num"><Counter target={2847} /></div>
                <div className="hero-stat-label">Servers Created</div>
              </div>
              <div className="hero-stat-line" />
              <div className="hero-stat">
                <div className="hero-stat-num"><Counter target={1200} /></div>
                <div className="hero-stat-label">Active Users</div>
              </div>
              <div className="hero-stat-line" />
              <div className="hero-stat">
                <div className="hero-stat-num"><Counter target={99} suffix="%" /></div>
                <div className="hero-stat-label">Satisfaction</div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* 3D Preview */}
        <Reveal delay={500} direction="scale">
          <div className="hero-preview-wrap" style={{ transform: `perspective(1200px) rotateX(${8 - scrollY * 0.01}deg) translateY(${scrollY * -0.1}px)` }}>
            <div className="hero-preview-glow" />
            <div className="hero-preview">
              <div className="preview-bar">
                <div className="preview-dot r" />
                <div className="preview-dot y" />
                <div className="preview-dot g" />
                <div className="preview-bar-title">DiscordGPT — AI Server Builder</div>
              </div>
              <div className="preview-body">
                <div className="preview-sidebar">
                  <div className="preview-sidebar-label">Conversations</div>
                  <div className="preview-sidebar-item active"><MessageSquare size={14} /> Gaming Server</div>
                  <div className="preview-sidebar-item"><MessageSquare size={14} /> Study Group</div>
                  <div className="preview-sidebar-item"><MessageSquare size={14} /> Art Community</div>
                  <div className="preview-sidebar-item"><MessageSquare size={14} /> Business Team</div>
                  <div className="preview-sidebar-label" style={{marginTop:12}}>Templates</div>
                  <div className="preview-sidebar-item"><LayoutTemplate size={14} /> Gaming Hub</div>
                  <div className="preview-sidebar-item"><LayoutTemplate size={14} /> Study Lounge</div>
                </div>
                <div className="preview-chat">
                  <div className="preview-msg">
                    <div className="preview-avatar user">U</div>
                    <div className="preview-bubble user">
                      Create a gaming server with voice channels, tournament brackets, and role-based access for 500+ members
                    </div>
                  </div>
                  <div className="preview-msg">
                    <div className="preview-avatar ai">
                      <img src="/logo.svg" alt="" style={{width:20,height:20,filter:'var(--logo-filter)'}} />
                    </div>
                    <div className="preview-bubble ai">
                      I've generated a complete blueprint for your gaming community with 4 categories, 16 channels, 8 custom roles, and anti-raid moderation.
                      <div className="preview-blueprint">
                        <strong>Gaming Hub</strong><br/>
                        #general · #announcements · #tournament-bracket · #clips · #looking-for-group · # voice-general
                      </div>
                    </div>
                  </div>
                  <div className="preview-msg">
                    <div className="preview-avatar ai">
                      <img src="/logo.svg" alt="" style={{width:20,height:20,filter:'var(--logo-filter)'}} />
                    </div>
                    <div className="preview-bubble ai">
                      <div className="preview-deploy">
                        <Zap size={16} /> Server deployed successfully to Discord — 16 channels, 8 roles, and moderation active
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Features */}
      <section className="features" id="features">
        <Reveal>
          <div className="section-label">Features</div>
          <h2 className="section-title">Everything you need to build</h2>
          <p className="section-desc">Powerful AI tools to create, manage, and scale your Discord community — all from a single interface.</p>
        </Reveal>
        <div className="features-grid">
          {[
            { icon: <Bot size={26} />, title: 'AI Server Builder', desc: 'Describe your server in plain language. AI generates a complete blueprint with channels, roles, permissions, and bot configurations.' },
            { icon: <Zap size={26} />, title: 'One-Click Deploy', desc: 'Review the AI-generated blueprint, approve it, and your Discord server is live instantly. No manual setup needed.' },
            { icon: <LayoutTemplate size={26} />, title: 'Smart Templates', desc: 'Choose from pre-built templates for gaming, study groups, businesses, and communities. Customize with natural language.' },
            { icon: <Shield size={26} />, title: 'Auto Moderation', desc: 'AI sets up anti-raid, spam filters, verification systems, and role-based access — keeping your server safe from day one.' },
            { icon: <Brain size={26} />, title: 'Multi-AI Router', desc: 'Intelligent provider routing selects the best AI for each task. Fallback chains ensure 99.9% uptime.' },
            { icon: <Rocket size={26} />, title: 'Bot Development', desc: 'Generate Discord.js bot code with slash commands, event handlers, and database integration — zero coding required.' },
          ].map((f, i) => (
            <Reveal key={i} delay={i * 100}>
              <Card3D className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </Card3D>
            </Reveal>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="how">
        <div className="how-inner">
          <Reveal>
            <div className="section-label">How it works</div>
            <h2 className="section-title">Three steps to your server</h2>
            <p className="section-desc">From idea to live Discord server in under 60 seconds.</p>
          </Reveal>
          <div className="how-grid">
            {[
              { num: '1', title: 'Describe Your Server', desc: 'Tell AI what you want — a gaming community, study group, support desk, or anything else. Use plain language.' },
              { num: '2', title: 'Review the Blueprint', desc: 'AI generates a complete server structure with channels, roles, and settings. Review and adjust as needed.' },
              { num: '3', title: 'Deploy Instantly', desc: 'Hit deploy and your server is live on Discord. Start inviting members right away.' },
            ].map((s, i) => (
              <Reveal key={i} delay={i * 150}>
                <div className="how-step">
                  <div className="how-num">{s.num}</div>
                  <h3 className="how-title">{s.title}</h3>
                  <p className="how-desc">{s.desc}</p>
                  {i < 2 && <div className="how-line" />}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Showcase / Integrations */}
      <section className="showcase">
        <div className="showcase-inner">
          <Reveal>
            <div className="section-label">Integrations</div>
            <h2 className="section-title">Built for the ecosystem</h2>
            <p className="section-desc">Works with the tools you already use.</p>
          </Reveal>
          <div className="showcase-grid">
            {[
              { icon: '🤖', title: 'Discord.js v14', desc: 'Latest Discord API support' },
              { icon: '🧠', title: 'GPT-4 & Claude', desc: 'Multiple AI providers' },
              { icon: '⚡', title: 'Groq & DeepSeek', desc: 'Ultra-fast inference' },
              { icon: '🔒', title: 'OAuth2 & 2FA', desc: 'Enterprise security' },
              { icon: '📊', title: 'Analytics', desc: 'Real-time dashboards' },
              { icon: '🎨', title: 'Dark & Light', desc: 'Theme system' },
              { icon: '🌐', title: 'WebSocket', desc: 'Live updates' },
              { icon: '📦', title: 'Templates', desc: 'Community library' },
            ].map((item, i) => (
              <Reveal key={i} delay={i * 80}>
                <Card3D className="showcase-card">
                  <div className="showcase-icon">{item.icon}</div>
                  <div className="showcase-title">{item.title}</div>
                  <div className="showcase-desc">{item.desc}</div>
                </Card3D>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials">
        <div className="testimonials-inner">
          <Reveal>
            <div className="section-label">Testimonials</div>
            <h2 className="section-title">Loved by server owners</h2>
            <p className="section-desc">See what our community has to say.</p>
          </Reveal>
          <div className="testimonial-grid">
            {[
              { text: "DiscordGPT saved me 10+ hours of manual server setup. The AI blueprint is incredibly accurate and the one-click deploy is magical.", name: "Alex M.", role: "Gaming Community Owner", initials: "AM" },
              { text: "I've tried every server builder out there. Nothing comes close to this. The AI understands exactly what I want and delivers perfect results.", name: "Sarah K.", role: "Study Group Admin", initials: "SK" },
              { text: "The bot development feature alone is worth it. I generated a full moderation bot in seconds without writing a single line of code.", name: "Jordan P.", role: "Server Developer", initials: "JP" },
              { text: "We use DiscordGPT for all our community servers. The templates and AI routing make it the most powerful tool in our stack.", name: "Chris L.", role: "Community Manager", initials: "CL" },
            ].map((t, i) => (
              <Reveal key={i} delay={i * 100}>
                <div className="testimonial-card">
                  <div className="testimonial-stars">
                    {[...Array(5)].map((_, j) => <Star key={j} size={14} fill="currentColor" />)}
                  </div>
                  <div className="testimonial-text">"{t.text}"</div>
                  <div className="testimonial-author">
                    <div className="testimonial-avatar">{t.initials}</div>
                    <div>
                      <div className="testimonial-name">{t.name}</div>
                      <div className="testimonial-role">{t.role}</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <Reveal direction="scale">
          <div className="cta-box">
            <h2 className="cta-title">Ready to build your server?</h2>
            <p className="cta-desc">Join thousands of Discord server owners who use AI to create, manage, and scale their communities.</p>
            <MagneticBtn href="/api/auth/discord" className="cta-btn">
              {DISCORD_SVG} Get Started Free <ArrowRight size={18} />
            </MagneticBtn>
          </div>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="footer">
        <span className="footer-text">Built with AI for Discord communities</span>
        <button className="footer-toggle" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </footer>
    </div>
  )
}
