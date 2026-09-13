import React, { useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import WelcomeScreen from '../components/WelcomeScreen'
import MessageList from '../components/MessageList'
import MessageComposer from '../components/MessageComposer'
import BlueprintPreview from '../components/BlueprintPreview'
import CreationProgress from '../components/CreationProgress'
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

  useEffect(() => {
    fetchUsage()
  }, [fetchUsage])

  useEffect(() => {
    if (conversationId) {
      const activeId = activeConversationRef.current?._id || activeConversationRef.current?.id
      if (!activeConversationRef.current || activeId !== conversationId) {
        loadConversation(conversationId)
      }
    }
  }, [conversationId])

  const hasMessages = messages.length > 0

  const handleSend = async (content) => {
    if (!activeConversation) {
      const conv = await createConversation(content.slice(0, 80))
      if (conv) {
        navigate(`/c/${conv.id || conv._id}`)
        await sendMessage(content, conv.id || conv._id)
      }
    } else {
      await sendMessage(content, activeConversation.id || activeConversation._id)
    }
  }

  const handleSelectPrompt = (prompt) => {
    handleSend(prompt)
  }

  return (
    <div className="chat-area">
      {(!hasMessages && !blueprint && !creationProgress) ? (
        <WelcomeScreen onPrompt={handleSelectPrompt} />
      ) : (
        <div className="message-container">
          <MessageList messages={messages} aiTyping={aiTyping} />
          {blueprint && !creationProgress && <BlueprintPreview />}
          {creationProgress && <CreationProgress />}
        </div>
      )}

      {!creationProgress && <MessageComposer onSend={handleSend} disabled={aiTyping} usage={usage} />}
    </div>
  )
}
