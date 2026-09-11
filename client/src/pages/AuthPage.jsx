import React, { useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { Sun, Moon, Loader2 } from 'lucide-react'

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
    window.location.href = 'https://discordgpt-api.onrender.com/api/auth/discord'
  }

  return (
    <div className="auth-page">
      <button className="auth-theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div className="auth-container">
        <div className="auth-logo">
          <img src="/logo.svg" alt="DiscordGPT" className="auth-logo-img" />
        </div>
        <h1 className="auth-title">DiscordGPT</h1>
        <p className="auth-subtitle">AI-Powered Discord Server Builder</p>

        <button
          className="btn btn-discord btn-lg"
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, background: '#000000', color: 'white', border: '1px solid rgba(255,255,255,0.15)', padding: '14px 24px', borderRadius: 'var(--radius-md)', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}
          onClick={handleDiscordLogin}
        >
          <svg width="20" height="16" viewBox="0 0 71 55" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5604 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.9048 3.0581 26.1885 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.4218 0.40133C20.3475 1.2916 15.4948 2.8214 10.9693 4.8978C10.9693 4.8978 6.86847 11.0623 6.07067 17.1568C0.857776 24.7397 0.064707 32.1073 0.467713 39.3675C0.482247 39.4475 0.561648 39.5097 0.644049 39.5097C6.47654 42.6062 12.1445 44.4138 17.7245 45.5639C17.8085 45.5801 17.8928 45.5522 17.9591 45.4884C19.4858 43.4164 20.8232 41.2152 21.9604 38.9044C22.0267 38.8411 22.0108 38.7409 21.9337 38.6983C19.6683 37.8558 17.4953 36.7558 15.4519 35.4245C15.3029 35.3275 15.3029 35.1318 15.4519 35.0348C15.9725 34.7117 16.4931 34.3765 16.9922 34.0286C17.0782 33.9713 17.1806 33.9638 17.273 34.0074C29.5917 39.6658 42.8085 39.6658 55.0431 34.0074C55.1375 33.9618 55.2399 33.9713 55.3279 34.0286C55.8287 34.3765 56.3493 34.7117 56.8681 35.0348C57.0171 35.1318 57.0171 35.3275 56.8681 35.4245C54.8247 36.7558 52.6517 37.8558 50.3844 38.6983C50.3073 38.7409 50.2934 38.8411 50.3577 38.9044C51.4949 41.2152 52.8323 43.4164 54.359 45.4884C54.4253 45.5522 54.5116 45.5801 54.5956 45.5639C60.1775 44.4138 65.8455 42.6062 71.678 39.5097C71.7624 39.5097 71.8418 39.4475 71.8553 39.3675C72.3314 31.0951 70.8709 23.7657 66.0665 17.3131C66.0665 17.3131 61.9657 11.0989 60.1045 4.8978ZM23.7259 32.4621C20.2729 32.4621 17.4516 29.3049 17.4516 25.4517C17.4516 21.5985 20.2189 18.4144 23.7259 18.4144C27.2661 18.4144 30.0456 21.5985 30.0002 25.4517C30.0002 29.3049 27.2458 32.4621 23.7259 32.4621ZM47.3178 32.4621C43.8648 32.4621 41.0435 29.3049 41.0435 25.4517C41.0435 21.5985 43.8108 18.4144 47.3178 18.4144C50.858 18.4144 53.6376 21.5985 53.5921 25.4517C53.5921 29.3049 50.858 32.4621 47.3178 32.4621Z" fill="white"/>
          </svg>
          Login with Discord
        </button>

        <div className="auth-footer-text">
          You need a Discord account to use DiscordGPT
        </div>
      </div>
    </div>
  )
}
