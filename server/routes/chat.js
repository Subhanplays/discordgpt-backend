const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const db = require('../database');
const { generateChatResponse, generateBlueprint } = require('../utils/ai');

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const conversations = await db.getUserConversations(req.user.id);
    res.json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to get conversations' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    const conversation = await db.createConversation(req.user.id, title);
    res.status(201).json(conversation);
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const conversation = await db.getConversationById(req.params.id, req.user.id);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    const messages = await db.getConversationMessages(req.params.id);
    res.json({ ...conversation, messages });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: 'Failed to get conversation' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const conversation = await db.getConversationById(req.params.id, req.user.id);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    await db.deleteConversation(req.params.id);
    res.json({ message: 'Conversation deleted' });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

router.post('/send', async (req, res) => {
  try {
    const { message: content, conversationId } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Message is required' });
    }

    let convId = conversationId;
    let conversation = null;

    if (convId) {
      conversation = await db.getConversationById(convId, req.user.id);
      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }
    } else {
      const title = content.length > 60 ? content.substring(0, 60) + '...' : content;
      conversation = await db.createConversation(req.user.id, title);
      convId = conversation.id;
    }

    const startTime = Date.now();

    await db.createMessage(convId, 'user', content);

    const existingMessages = await db.getConversationMessages(convId);
    const messagesForAI = existingMessages.map(m => ({
      role: m.role,
      content: m.content
    }));

    let aiResponse;
    let blueprint = null;
    try {
      aiResponse = await generateChatResponse(messagesForAI);
    } catch (aiError) {
      console.error('AI response error:', aiError);
      aiResponse = 'I apologize, but I encountered an error generating a response. Please try again.';
    }

    const durationMs = Date.now() - startTime;

    await db.createMessage(convId, 'assistant', aiResponse);

    const blueprintKeywords = ['create', 'make', 'build', 'generate', 'blueprint', 'server', 'setup', 'template'];
    const isBlueprintRequest = blueprintKeywords.some(kw => content.toLowerCase().includes(kw));

    if (isBlueprintRequest) {
      try {
        blueprint = generateBlueprint(content);
        await db.createGenerationLog(
          req.user.id, convId, content, JSON.stringify(blueprint), 'success', null, durationMs
        );
      } catch (logError) {
        console.error('Generation log error:', logError);
      }
    } else {
      await db.createGenerationLog(
        req.user.id, convId, content, aiResponse, 'success', null, durationMs
      );
    }

    res.json({
      message: {
        id: Date.now().toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString()
      },
      conversation,
      blueprint
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

router.post('/:id/messages', async (req, res) => {
  try {
    const conversation = await db.getConversationById(req.params.id, req.user.id);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const startTime = Date.now();

    await db.createMessage(req.params.id, 'user', content);

    const existingMessages = await db.getConversationMessages(req.params.id);
    const messagesForAI = existingMessages.map(m => ({
      role: m.role,
      content: m.content
    }));

    let aiResponse;
    try {
      aiResponse = await generateChatResponse(messagesForAI);
    } catch (aiError) {
      console.error('AI response error:', aiError);
      aiResponse = 'I apologize, but I encountered an error generating a response. Please try again.';
    }

    const durationMs = Date.now() - startTime;

    await db.createMessage(req.params.id, 'assistant', aiResponse);

    const blueprintKeywords = ['create', 'make', 'build', 'generate', 'blueprint', 'server', 'setup', 'template'];
    const isBlueprintRequest = blueprintKeywords.some(kw => content.toLowerCase().includes(kw));

    if (isBlueprintRequest) {
      try {
        const blueprint = generateBlueprint(content);
        await db.createGenerationLog(
          req.user.id, req.params.id, content, JSON.stringify(blueprint), 'success', null, durationMs
        );
      } catch (logError) {
        console.error('Generation log error:', logError);
      }
    } else {
      await db.createGenerationLog(
        req.user.id, req.params.id, content, aiResponse, 'success', null, durationMs
      );
    }

    res.json({
      message: {
        role: 'assistant',
        content: aiResponse
      }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

module.exports = router;
