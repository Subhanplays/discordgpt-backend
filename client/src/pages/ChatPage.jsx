import React, { useEffect, useState } from 'react'
import WelcomeScreen from '../components/WelcomeScreen'
import MessageList from '../components/MessageList'
import MessageComposer from '../components/MessageComposer'
import BotSetup from '../components/BotSetup'
import ServerSelect from '../components/ServerSelect'
import BlueprintPreview from '../components/BlueprintPreview'
import CreationProgress from '../components/CreationProgress'
import { useChat } from '../contexts/ChatContext'
import { useAuth } from '../contexts/AuthContext'

export default function ChatPage() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const {
    messages, aiTyping, sendMessage, activeConversation,
    createConversation, botConnected, blueprint, creationProgress
  } = useChat()
  const [showBotSetup, setShowBotSetup] = useState(false)

  const hasMessages = messages.length > 0

  const handleSend = async (content) => {
    if (!activeConversation) {
      const conv = await createConversation(content.slice(0, 80))
      if (conv) {
        await sendMessage(content, conv.id)
      }
    } else {
      await sendMessage(content, activeConversation.id)
    }
  }

  const handleSelectPrompt = (prompt) => {
    handleSend(prompt)
  }

  return (
    <div className="chat-area">
      {!hasMessages && !creationProgress ? (
        <WelcomeScreen onSelectPrompt={handleSelectPrompt} />
      ) : (
        <div className="message-container">
          <MessageList messages={messages} aiTyping={aiTyping} />
        </div>
      )}

      {blueprint && !creationProgress && <BlueprintPreview />}
      {creationProgress && <CreationProgress />}

      {isAuthenticated && !botConnected && !showBotSetup && !hasMessages && (
        <div style={{ position: 'absolute', bottom: 100, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
          <button className="btn btn-secondary" onClick={() => setShowBotSetup(true)}>
            Connect Discord Bot
          </button>
        </div>
      )}

      {showBotSetup && !botConnected && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
          <BotSetup onComplete={() => setShowBotSetup(false)} />
        </div>
      )}

      {!creationProgress && <MessageComposer onSend={handleSend} disabled={aiTyping} />}
    </div>
  )
}
