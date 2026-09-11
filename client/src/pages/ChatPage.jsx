import React, { useState } from 'react'
import WelcomeScreen from '../components/WelcomeScreen'
import MessageList from '../components/MessageList'
import MessageComposer from '../components/MessageComposer'
import BlueprintPreview from '../components/BlueprintPreview'
import CreationProgress from '../components/CreationProgress'
import { useChat } from '../contexts/ChatContext'

export default function ChatPage() {
  const {
    messages, aiTyping, sendMessage, activeConversation,
    createConversation, botConnected, blueprint, creationProgress
  } = useChat()

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

      {!creationProgress && <MessageComposer onSend={handleSend} disabled={aiTyping} />}
    </div>
  )
}
