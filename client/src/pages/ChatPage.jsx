import React, { useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import WelcomeScreen from '../components/WelcomeScreen'
import MessageList from '../components/MessageList'
import MessageComposer from '../components/MessageComposer'
import BlueprintPreview from '../components/BlueprintPreview'
import CreationProgress from '../components/CreationProgress'
import ChatExport from '../components/ChatExport'
import { useChat } from '../contexts/ChatContext'

export default function ChatPage() {
  const { conversationId } = useParams()
  const navigate = useNavigate()
  const {
    messages, aiTyping, sendMessage, activeConversation,
    createConversation, botConnected, blueprint, creationProgress,
    loadConversation, setActiveConversation, setMessages, setBlueprint, setCreationProgress,
    usage, fetchUsage
  } = useChat()

  const activeConversationRef = useRef(activeConversation)
  activeConversationRef.current = activeConversation

  const sendingRef = useRef(false)

  useEffect(() => {
    fetchUsage()
  }, [fetchUsage])

  useEffect(() => {
    if (conversationId && !sendingRef.current) {
      const activeId = activeConversationRef.current?._id || activeConversationRef.current?.id
      if (!activeConversationRef.current || activeId !== conversationId) {
        loadConversation(conversationId)
      }
    }
  }, [conversationId])

  const hasMessages = messages.length > 0

  const handleSend = async (content, personality = 'professional') => {
    sendingRef.current = true
    try {
      if (!activeConversation) {
        const conv = await createConversation(content.slice(0, 80))
        if (conv) {
          navigate(`/c/${conv.id || conv._id}`)
          await sendMessage(content, conv.id || conv._id, false, personality)
        }
      } else {
        await sendMessage(content, activeConversation.id || activeConversation._id, false, personality)
      }
    } finally {
      sendingRef.current = false
    }
  }

  const handleCreate = async (content, personality = 'professional') => {
    sendingRef.current = true
    try {
      const msg = `Create a Discord server: ${content}`
      if (!activeConversation) {
        const conv = await createConversation(msg.slice(0, 80))
        if (conv) {
          navigate(`/c/${conv.id || conv._id}`)
          await sendMessage(msg, conv.id || conv._id, true, personality)
        }
      } else {
        await sendMessage(msg, activeConversation.id || activeConversation._id, true, personality)
      }
    } finally {
      sendingRef.current = false
    }
  }

  const handleRegenerate = useCallback(async (messageId) => {
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')
    if (!lastUserMsg || !activeConversation) return

    setMessages(prev => {
      const idx = prev.findIndex(m => m.id === messageId)
      if (idx === -1) return prev
      return prev.slice(0, idx)
    })

    await sendMessage(lastUserMsg.content, activeConversation.id || activeConversation._id)
  }, [messages, activeConversation, sendMessage, setMessages])

  return (
    <div className="chat-area">
      {(!hasMessages && !blueprint && !creationProgress) ? (
        <WelcomeScreen onPrompt={handleSend} />
      ) : (
        <div className="message-container">
          {hasMessages && (
            <div className="chat-header">
              <div />
              <ChatExport />
            </div>
          )}
          <MessageList messages={messages} aiTyping={aiTyping} onRegenerate={handleRegenerate} />
          {blueprint && !creationProgress && <BlueprintPreview />}
          {creationProgress && <CreationProgress />}
        </div>
      )}

      {!creationProgress && <MessageComposer onSend={handleSend} onCreate={handleCreate} disabled={aiTyping} usage={usage} />}
    </div>
  )
}
