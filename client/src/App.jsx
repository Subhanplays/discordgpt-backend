import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { ChatProvider } from './contexts/ChatContext'
import MainLayout from './components/MainLayout'
import ChatPage from './pages/ChatPage'
import TemplatesPage from './pages/TemplatesPage'
import SettingsPage from './pages/SettingsPage'
import AdminPage from './pages/AdminPage'
import AuthPage from './pages/AuthPage'
import AuthCallback from './pages/AuthCallback'
import SearchModal from './components/SearchModal'
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts'

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)', color: 'var(--text-muted)' }}>
        Loading...
      </div>
    )
  }
  if (!isAuthenticated) return <Navigate to="/auth" replace />
  return children
}

function AdminRoute({ children }) {
  const { user, isAuthenticated, loading } = useAuth()
  if (loading) return null
  if (!isAuthenticated) return <Navigate to="/auth" replace />
  if (user?.role !== 'admin') return <Navigate to="/" replace />
  return children
}

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return null
  if (isAuthenticated) return <Navigate to="/" replace />
  return children
}

function AppRoutes() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [searchOpen, setSearchOpen] = useState(false)

  useKeyboardShortcuts({
    onNewChat: () => { if (isAuthenticated) navigate('/') },
    onFocusSearch: () => { if (isAuthenticated) setSearchOpen(true) },
    onOpenSettings: () => { if (isAuthenticated) navigate('/settings') },
    onClose: () => {
      document.dispatchEvent(new CustomEvent('app:close'))
    }
  })

  return (
    <>
      <Routes>
        <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/admin/*" element={<AdminRoute><AdminPage /></AdminRoute>} />
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/" element={<ChatPage />} />
          <Route path="/c/:conversationId" element={<ChatPage />} />
          <Route path="/templates" element={<TemplatesPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}

export default function App() {
  React.useEffect(() => {
    const ping = () => fetch('https://discordgpt-api.onrender.com/api/health').catch(() => {})
    ping()
    const interval = setInterval(ping, 55000)
    return () => clearInterval(interval)
  }, [])

  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ChatProvider>
            <AppRoutes />
          </ChatProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
