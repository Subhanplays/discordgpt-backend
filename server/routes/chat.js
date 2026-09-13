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
    const { message: content, conversationId, forceBlueprint, personality } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const personalityPrefixes = {
      professional: 'Respond in a formal, detailed, and professional tone. ',
      casual: 'Respond in a friendly, relaxed, and casual tone. ',
      expert: 'Respond in a highly technical, concise, and expert tone. '
    };
    const personalityPrefix = personalityPrefixes[personality] || '';

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
    const messagesForAI = existingMessages.map(m => {
      if (m.role === 'user' && m.content === content) {
        return { role: m.role, content: personalityPrefix + m.content };
      }
      return { role: m.role, content: m.content };
    });

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
    const isBlueprintRequest = forceBlueprint || blueprintKeywords.some(kw => content.toLowerCase().includes(kw));

    if (isBlueprintRequest) {
      blueprint = parseBlueprintFromAI(aiResponse);
      console.log('parseBlueprintFromAI result:', blueprint ? `found (${blueprint.categories?.length} categories, ${blueprint.roles?.length} roles)` : 'null — falling back to generateBlueprint');
      if (!blueprint) {
        blueprint = generateBlueprint(content);
        console.log('generateBlueprint fallback:', blueprint ? `generated (${blueprint.categories?.length} categories)` : 'null');
      }
      await db.updateConversationBlueprint(convId, JSON.stringify(blueprint));
      await db.saveBlueprintVersion(convId, req.user.id, JSON.stringify(blueprint));
      await db.createMessage(convId, 'assistant', aiResponse);
      try {
        await db.createGenerationLog(
          req.user.id, convId, content, JSON.stringify(blueprint), 'success', null, durationMs
        );
      } catch (logError) {
        console.error('Generation log error:', logError);
      }
    } else {
      blueprint = null;
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

    const { content, forceBlueprint, personality } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const personalityPrefixes = {
      professional: 'Respond in a formal, detailed, and professional tone. ',
      casual: 'Respond in a friendly, relaxed, and casual tone. ',
      expert: 'Respond in a highly technical, concise, and expert tone. '
    };
    const personalityPrefix = personalityPrefixes[personality] || '';

    const startTime = Date.now();

    await db.createMessage(req.params.id, 'user', content);

    const existingMessages = await db.getConversationMessages(req.params.id);
    const messagesForAI = existingMessages.map(m => {
      if (m.role === 'user' && m.content === content) {
        return { role: m.role, content: personalityPrefix + m.content };
      }
      return { role: m.role, content: m.content };
    });

    let aiResponse;
    try {
      aiResponse = await generateChatResponse(messagesForAI);
    } catch (aiError) {
      console.error('AI response error:', aiError);
      aiResponse = 'I apologize, but I encountered an error generating a response. Please try again.';
    }

    const durationMs = Date.now() - startTime;

    const blueprintKeywords = ['create', 'make', 'build', 'generate', 'blueprint', 'server', 'setup', 'template'];
    const isBlueprintRequest = forceBlueprint || blueprintKeywords.some(kw => content.toLowerCase().includes(kw));

    if (isBlueprintRequest) {
      const blueprint = parseBlueprintFromAI(aiResponse) || generateBlueprint(content);
      await db.updateConversationBlueprint(req.params.id, JSON.stringify(blueprint));
      await db.saveBlueprintVersion(req.params.id, req.user.id, JSON.stringify(blueprint));
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
    if (isBlueprintRequest) {
      const freshConvo = await db.getConversationById(req.params.id, req.user.id);
      if (freshConvo?.blueprint_json) {
        try { returnBlueprint = JSON.parse(freshConvo.blueprint_json); } catch (e) {}
      }
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

// ===== Folder Endpoints =====

router.get('/folders/list', async (req, res) => {
  try {
    const folders = await db.getFolders(req.user.id);
    res.json(folders);
  } catch (error) {
    console.error('Get folders error:', error);
    res.status(500).json({ error: 'Failed to get folders' });
  }
});

router.post('/folders/create', async (req, res) => {
  try {
    const { name, color } = req.body;
    if (!name) return res.status(400).json({ error: 'Folder name is required' });
    const folder = await db.createFolder(req.user.id, name, color);
    res.status(201).json(folder);
  } catch (error) {
    console.error('Create folder error:', error);
    res.status(500).json({ error: 'Failed to create folder' });
  }
});

router.delete('/folders/:id', async (req, res) => {
  try {
    await db.deleteFolder(req.params.id, req.user.id);
    res.json({ message: 'Folder deleted' });
  } catch (error) {
    console.error('Delete folder error:', error);
    res.status(500).json({ error: 'Failed to delete folder' });
  }
});

router.put('/conversations/:id/folder', async (req, res) => {
  try {
    const { folderId } = req.body;
    const moved = await db.moveConversationToFolder(req.params.id, folderId || null, req.user.id);
    if (!moved) return res.status(404).json({ error: 'Conversation or folder not found' });
    res.json({ message: 'Conversation moved' });
  } catch (error) {
    console.error('Move conversation error:', error);
    res.status(500).json({ error: 'Failed to move conversation' });
  }
});

router.put('/conversations/:id/pin', async (req, res) => {
  try {
    const conversation = await db.getConversationById(req.params.id, req.user.id);
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });
    const isPinned = await db.togglePinConversation(req.params.id, req.user.id);
    res.json({ is_pinned: isPinned });
  } catch (error) {
    console.error('Toggle pin error:', error);
    res.status(500).json({ error: 'Failed to toggle pin' });
  }
});

// ===== Blueprint Versioning Endpoints =====

router.get('/conversations/:id/versions', async (req, res) => {
  try {
    const conversation = await db.getConversationById(req.params.id, req.user.id);
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });
    const versions = await db.getBlueprintVersions(req.params.id);
    res.json(versions);
  } catch (error) {
    console.error('Get versions error:', error);
    res.status(500).json({ error: 'Failed to get versions' });
  }
});

router.post('/conversations/:id/versions/:versionId/restore', async (req, res) => {
  try {
    const conversation = await db.getConversationById(req.params.id, req.user.id);
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });
    const version = await db.getBlueprintVersionById(req.params.versionId, req.params.id);
    if (!version) return res.status(404).json({ error: 'Version not found' });
    await db.updateConversationBlueprint(req.params.id, version.blueprint_json);
    await db.saveBlueprintVersion(req.params.id, req.user.id, version.blueprint_json);
    res.json({ message: 'Version restored', blueprint: JSON.parse(version.blueprint_json) });
  } catch (error) {
    console.error('Restore version error:', error);
    res.status(500).json({ error: 'Failed to restore version' });
  }
});

module.exports = router;
