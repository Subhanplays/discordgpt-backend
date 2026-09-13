import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useAuth } from './AuthContext'

const ChatContext = createContext(null)

export function useChat() {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChat must be used within ChatProvider')
  return ctx
}

export function ChatProvider({ children }) {
  const { token } = useAuth()
  const [conversations, setConversations] = useState([])
  const [activeConversation, setActiveConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [aiTyping, setAiTyping] = useState(false)
  const [botConnected, setBotConnected] = useState(false)
  const [botInfo, setBotInfo] = useState(null)
  const [selectedServer, setSelectedServer] = useState(null)
  const [servers, setServers] = useState([])
  const [blueprint, setBlueprint] = useState(null)
  const [creationProgress, setCreationProgress] = useState(null)
  const [activeJobId, setActiveJobId] = useState(null)
  const [templates, setTemplates] = useState([])
  const [usage, setUsage] = useState({ count: 0, limit: 50, remaining: 50, resetAt: null })

  const authHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }), [token])

  useEffect(() => {
    if (!token) return
    fetch('/api/bot/status', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.connected && data.bot) {
          setBotConnected(true)
          setBotInfo(data.bot)
        }
      })
      .catch(() => {})
  }, [token])

  useEffect(() => {
    if (token) fetchConversations()
  }, [token, fetchConversations])

  useEffect(() => {
    if (botConnected && token) {
      fetch('/api/bot/servers', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          let serverList = []
          if (Array.isArray(data)) {
            serverList = data
          } else if (data?.servers) {
            serverList = data.servers
          }
          setServers(serverList)
          if (serverList.length > 0 && !selectedServer) {
            setSelectedServer(serverList[0])
          }
        })
        .catch(() => {})
    }
  }, [botConnected, token])

  const fetchUsage = useCallback(async () => {
    try {
      const res = await fetch('/api/usage', { headers: authHeaders() })
      if (res.ok) {
        const data = await res.json()
        setUsage(data)
      }
    } catch {}
  }, [authHeaders])

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/conversations', { headers: authHeaders() })
      if (res.ok) {
        const data = await res.json()
        setConversations(data.conversations || data || [])
      }
    } catch {}
  }, [authHeaders])

  const createConversation = useCallback(async (title) => {
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ title })
      })
      if (res.ok) {
        const data = await res.json()
        const conv = data.conversation || data
        setConversations(prev => [conv, ...prev])
        setActiveConversation(conv)
        setMessages([])
        return conv
      }
    } catch {}
    return null
  }, [authHeaders])

  const deleteConversation = useCallback(async (id) => {
    try {
      await fetch(`/api/conversations/${id}`, { method: 'DELETE', headers: authHeaders() })
      setConversations(prev => prev.filter(c => (c._id || c.id) !== id))
      if ((activeConversation?._id || activeConversation?.id) === id) {
        setActiveConversation(null)
        setMessages([])
      }
    } catch {}
  }, [activeConversation, authHeaders])

  const updateConversation = useCallback(async (id, title) => {
    try {
      const res = await fetch(`/api/conversations/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ title })
      })
      if (res.ok) {
        setConversations(prev => prev.map(c => (c._id || c.id) === id ? { ...c, title } : c))
        if ((activeConversation?._id || activeConversation?.id) === id) {
          setActiveConversation(prev => prev ? { ...prev, title } : prev)
        }
      }
    } catch {}
  }, [activeConversation, authHeaders])

  const loadConversation = useCallback(async (conversationId) => {
    try {
      const res = await fetch(`/api/conversations/${conversationId}`, { headers: authHeaders() })
      if (res.ok) {
        const data = await res.json()
        setActiveConversation(data)
        setMessages(data.messages || [])
        if (data.blueprint) {
          setBlueprint(data.blueprint)
        } else {
          setBlueprint(null)
        }
        setCreationProgress(null)
        return data
      }
    } catch {}
    return null
  }, [authHeaders])

  const sendMessage = useCallback(async (content, conversationId) => {
    const userMsg = { id: Date.now().toString(), role: 'user', content, timestamp: new Date().toISOString() }
    setMessages(prev => [...prev, userMsg])
    setAiTyping(true)

    try {
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ message: content, conversationId })
      })

      if (res.status === 429) {
        const err = await res.json().catch(() => ({}))
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: err.error || 'Daily message limit reached. Please try again tomorrow.', timestamp: new Date().toISOString() }])
        fetchUsage()
        return null
      }

      if (res.ok) {
        const data = await res.json()
        if (data.message) {
          setMessages(prev => [...prev, data.message])
        }
        if (data.blueprint) {
          setBlueprint(data.blueprint)
        }
        if (data.conversation) {
          if (!conversationId) {
            setActiveConversation(data.conversation)
          }
          setConversations(prev => {
            const updated = data.conversation
            const exists = prev.find(c => (c._id || c.id) === (updated._id || updated.id))
            if (exists) {
              return prev.map(c => (c._id || c.id) === (updated._id || updated.id) ? updated : c)
            }
            return [updated, ...prev]
          })
        }
        fetchUsage()
        return data
      }
    } catch {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: 'Sorry, something went wrong. Please try again.', timestamp: new Date().toISOString() }])
    } finally {
      setAiTyping(false)
    }
    return null
  }, [authHeaders, fetchUsage])

  const createServer = useCallback(async (blueprintData) => {
    if (!selectedServer) {
      setCreationProgress({ status: 'error', message: 'No server selected', step: 0, total: 0, steps: [], completed: [] })
      return null
    }

    setCreationProgress({
      status: 'queued',
      step: 0,
      total: 6,
      steps: ['Connecting to Discord', 'Validating permissions', 'Creating roles', 'Creating categories', 'Creating channels', 'Finalizing'],
      completed: [],
      message: 'Submitting to queue...'
    })

    try {
      const res = await fetch('/api/server/create', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ blueprint: blueprintData, serverId: selectedServer.id })
      })

      if (res.ok) {
        const data = await res.json()
        setActiveJobId(data.jobId)
        setCreationProgress(prev => ({
          ...prev,
          status: 'queued',
          jobId: data.jobId,
          position: data.position,
          message: `Position ${data.position} in queue...`
        }))
        return data
      }

      const err = await res.json().catch(() => ({}))
      setCreationProgress({ status: 'error', message: err.error || 'Failed to start creation', step: 0, total: 0, steps: [], completed: [] })
      return null
    } catch {
      setCreationProgress({ status: 'error', message: 'Network error', step: 0, total: 0, steps: [], completed: [] })
      return null
    }
  }, [selectedServer, authHeaders])

  const pollJobStatus = useCallback(async (jobId) => {
    try {
      const res = await fetch(`/api/server/queue/${jobId}`, { headers: authHeaders() })
      if (res.ok) {
        const data = await res.json()
        setCreationProgress({
          status: data.status,
          step: data.progress?.step || 0,
          total: data.progress?.total || 6,
          steps: data.progress?.steps || ['Connecting', 'Roles', 'Categories', 'Channels', 'Permissions', 'Done'],
          completed: data.progress?.completed || [],
          message: data.progress?.message || '',
          position: data.position || 0,
          result: data.result,
          error: data.error
        })
        return data
      }
    } catch {}
    return null
  }, [authHeaders])

  const fetchTemplates = useCallback(async () => {
    try {
      const res = await fetch('/api/templates', { headers: authHeaders() })
      if (res.ok) {
        const data = await res.json()
        setTemplates(data.templates || data || [])
      }
    } catch {}
  }, [authHeaders])

  const saveTemplate = useCallback(async (template) => {
    try {
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(template)
      })
      if (res.ok) {
        const data = await res.json()
        const saved = data.template || data
        setTemplates(prev => [saved, ...prev.filter(t => t.id !== saved.id)])
        return saved
      }
    } catch {}
    return null
  }, [authHeaders])

  const deleteTemplate = useCallback(async (id) => {
    try {
      await fetch(`/api/templates/${id}`, { method: 'DELETE', headers: authHeaders() })
      setTemplates(prev => prev.filter(t => t.id !== id))
    } catch {}
  }, [authHeaders])

  const value = {
    conversations, activeConversation, setActiveConversation,
    messages, setMessages, loading, aiTyping,
    botConnected, botInfo, selectedServer, setSelectedServer,
    servers, blueprint, setBlueprint,
    creationProgress, setCreationProgress,
    activeJobId, setActiveJobId,
    templates, usage, fetchUsage,
    fetchConversations, createConversation, deleteConversation, updateConversation,
    loadConversation, sendMessage,
    createServer, pollJobStatus,
    fetchTemplates, saveTemplate, deleteTemplate
  }

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  )
}
