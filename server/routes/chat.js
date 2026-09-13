const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const db = require('../database');
const { generateChatResponse, generateBlueprint, generateConversationTitle } = require('../utils/ai');

function parseBlueprintFromAI(aiResponse) {
  try {
    let jsonStr = null;

    const firstBrace = aiResponse.indexOf('{');
    if (firstBrace !== -1) {
      let depth = 0;
      let lastBrace = -1;
      for (let i = firstBrace; i < aiResponse.length; i++) {
        if (aiResponse[i] === '{') depth++;
        else if (aiResponse[i] === '}') {
          depth--;
          if (depth === 0) { lastBrace = i; break; }
        }
      }
      if (lastBrace !== -1) {
        jsonStr = aiResponse.substring(firstBrace, lastBrace + 1);
      }
    }

    if (!jsonStr) {
      const codeBlockMatch = aiResponse.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (codeBlockMatch) {
        jsonStr = codeBlockMatch[1].trim();
      }
    }

    if (!jsonStr) return null;

    const parsed = JSON.parse(jsonStr);

    if (!parsed.categories || !Array.isArray(parsed.categories) || parsed.categories.length === 0) return null;
    if (!parsed.roles || !Array.isArray(parsed.roles) || parsed.roles.length === 0) return null;

    for (const cat of parsed.categories) {
      if (!cat.name || !cat.channels || !Array.isArray(cat.channels)) return null;
      for (const ch of cat.channels) {
        if (!ch.name || !ch.type) return null;
        if (!['text', 'voice', 'announcement', 'forum'].includes(ch.type)) ch.type = 'text';
        if (!ch.description) ch.description = ch.name;
        if (!Array.isArray(ch.permissions)) ch.permissions = [];
      }
    }

    for (const role of parsed.roles) {
      if (!role.name) return null;
      if (!role.color || !/^#[0-9A-Fa-f]{6}$/.test(role.color)) {
        role.color = '#99AAB5';
      }
      if (!Array.isArray(role.permissions)) role.permissions = ['SendMessages', 'ReadMessageHistory'];
    }

    return {
      serverName: parsed.serverName || parsed.name || 'My Server',
      description: parsed.description || `Welcome to ${parsed.serverName || 'our server'}!`,
      categories: parsed.categories,
      roles: parsed.roles,
      settings: parsed.settings || {
        verificationLevel: 'medium',
        defaultMessageNotifications: 'only_mentions',
        explicitContentFilter: 'all_members',
        afkTimeout: 300,
        systemChannelFlags: ['SUPPRESS_JOIN_NOTIFICATIONS']
      }
    };
  } catch (e) {
    console.error('Failed to parse AI blueprint JSON:', e.message);
    return null;
  }
}

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
    let blueprint = null;
    if (conversation.blueprint_json) {
      try { blueprint = JSON.parse(conversation.blueprint_json); } catch (e) {}
    }
    res.json({ ...conversation, messages, blueprint });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: 'Failed to get conversation' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const conversation = await db.getConversationById(req.params.id, req.user.id);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    await db.updateConversation(req.params.id, title);
    res.json({ id: req.params.id, title });
  } catch (error) {
    console.error('Update conversation error:', error);
    res.status(500).json({ error: 'Failed to update conversation' });
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
      if (conversation.title === 'New Chat') {
        const newTitle = await generateConversationTitle(content);
        await db.updateConversation(convId, newTitle);
        conversation.title = newTitle;
      }
    } else {
      const newTitle = await generateConversationTitle(content);
      conversation = await db.createConversation(req.user.id, newTitle);
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

    const blueprintKeywords = ['create', 'make', 'build', 'generate', 'blueprint', 'server', 'setup', 'template'];
    const isBlueprintRequest = blueprintKeywords.some(kw => content.toLowerCase().includes(kw));

    if (isBlueprintRequest) {
      blueprint = parseBlueprintFromAI(aiResponse);
      if (!blueprint) {
        blueprint = generateBlueprint(content);
      }
      await db.updateConversationBlueprint(convId, JSON.stringify(blueprint));
      await db.createMessage(convId, 'assistant', aiResponse);
      try {
        await db.createGenerationLog(
          req.user.id, convId, content, JSON.stringify(blueprint), 'success', null, durationMs
        );
      } catch (logError) {
        console.error('Generation log error:', logError);
      }
    } else {
      if (conversation && conversation.blueprint_json) {
        try { blueprint = JSON.parse(conversation.blueprint_json); } catch (e) {}
      }
      await db.createMessage(convId, 'assistant', aiResponse);
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

    const blueprintKeywords = ['create', 'make', 'build', 'generate', 'blueprint', 'server', 'setup', 'template'];
    const isBlueprintRequest = blueprintKeywords.some(kw => content.toLowerCase().includes(kw));

    if (isBlueprintRequest) {
      const blueprint = parseBlueprintFromAI(aiResponse) || generateBlueprint(content);
      await db.updateConversationBlueprint(req.params.id, JSON.stringify(blueprint));
      await db.createMessage(req.params.id, 'assistant', aiResponse);
      try {
        await db.createGenerationLog(
          req.user.id, req.params.id, content, JSON.stringify(blueprint), 'success', null, durationMs
        );
      } catch (logError) {
        console.error('Generation log error:', logError);
      }
    } else {
      await db.createMessage(req.params.id, 'assistant', aiResponse);
      await db.createGenerationLog(
        req.user.id, req.params.id, content, aiResponse, 'success', null, durationMs
      );
    }

    let returnBlueprint = null;
    const freshConvo = await db.getConversationById(req.params.id, req.user.id);
    if (freshConvo?.blueprint_json) {
      try { returnBlueprint = JSON.parse(freshConvo.blueprint_json); } catch (e) {}
    }

    res.json({
      message: {
        role: 'assistant',
        content: aiResponse
      },
      blueprint: returnBlueprint
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

module.exports = router;
