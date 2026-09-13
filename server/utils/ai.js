function generateBlueprint(prompt) {
  const lower = prompt.toLowerCase();
  const serverName = extractServerName(prompt);
  const themes = extractThemes(lower);
  const categories = generateCustomCategories(themes, lower);
  const roles = generateCustomRoles(themes, lower);
  return buildStructure(serverName, categories, roles);
}

function extractServerName(prompt) {
  const patterns = [
    /create\s+(?:a\s+)?(?:server|discord|community)\s+(?:called|named|for|about|related)\s+["']?([^"']+?)["']?\s*(?:\.|$|,)/i,
    /create\s+["']?([^"']+?)["']?\s+(?:server|community|discord)/i,
    /(?:server|community|discord)\s+(?:called|named)\s+["']?([^"']+?)["']?\s*(?:\.|$|,)/i,
    /["']([^"']+)["']/i
  ];

  for (const pattern of patterns) {
    const match = prompt.match(pattern);
    if (match && match[1].trim().length > 0) {
      return match[1].trim().substring(0, 50);
    }
  }

  const stopWords = /^(?:create|a|an|the|server|discord|community|for|about|called|named|template|make|build|generate|with|and|that|has|have|want|need|like|good|best|cool|nice|big|small|new|old)$/i;
  const words = prompt.split(/\s+/).filter(w => !stopWords.test(w) && w.length > 2);
  const nameWords = words.slice(0, 3);
  return nameWords.length > 0 ? nameWords.join(' ') : 'My Server';
}

function extractThemes(prompt) {
  const themeDefs = {
    gaming: {
      keywords: ['gaming', 'game', 'play', 'esport', 'stream', 'twitch', 'youtube', 'fps', 'rpg', 'mmo', 'pvp', 'competitive', 'tournament', 'lfg', 'valorant', 'fortnite', 'minecraft', 'league', 'cs2', 'apex', 'cod', 'warzone', 'overwatch', 'destiny', 'roblox', 'among us', 'pubg', 'rocket league', 'rainbow six'],
      cats: ['🎮 GAMING', '🏆 COMPETITIVE', '🎯 LFG', '📺 STREAMS', '⚔️ TOURNAMENTS', '🎬 CLIPS'],
      channels: ['lfg-ranked', 'game-chat', 'stream-clips', 'tournament-bracket', 'squad-up', 'patch-notes', 'game-meta', 'highlight-reels', 'voice-squad', 'chill-gaming']
    },
    music: {
      keywords: ['music', 'dj', 'audio', 'sound', 'beat', 'production', 'studio', 'remix', 'singer', 'rapper', 'band', 'album', 'song', 'producer', 'vocal'],
      cats: ['🎵 MUSIC', '🎹 STUDIO', '🎧 LISTENING', '🎤 ARTISTS', '🎶 BEATS', '🎼 COLLABS'],
      channels: ['beat-showcase', 'freestyle-friday', 'listening-room', 'producer-chat', 'vocal-booth', 'sample-pack', 'mix-feedback', 'collab-finder', 'studio-session', 'playlist-share']
    },
    art: {
      keywords: ['art', 'design', 'graphic', 'illustration', 'creative', 'portfolio', 'gallery', 'drawing', 'painting', 'digital art', '3d', 'animation', 'photography', 'sketch', 'canvas'],
      cats: ['🎨 ART', '🖼️ GALLERY', '✏️ WIP', '📚 TUTORIALS', '🛒 COMMISSIONS', '🏆 CONTESTS'],
      channels: ['portfolio-drop', 'sketch-dump', 'critique-corner', 'art-tutorial', 'commission-board', 'art-challenge', 'reference-library', 'tool-talk', 'art-stream', 'pixel-art']
    },
    dev: {
      keywords: ['dev', 'development', 'programming', 'code', 'coding', 'github', 'git', 'software', 'web', 'api', 'backend', 'frontend', 'fullstack', 'python', 'javascript', 'rust', 'java', 'react', 'node'],
      cats: ['🔧 DEVELOPMENT', '💻 CODE', '🐛 BUGS', '💡 IDEAS', '🚀 PROJECTS', '📚 LEARNING'],
      channels: ['general-dev', 'help-desk', 'code-review', 'project-ideas', 'show-and-tell', 'open-source', 'api-discussion', 'pair-programming', 'devops', 'hackathon']
    },
    crypto: {
      keywords: ['crypto', 'blockchain', 'nft', 'web3', 'defi', 'trading', 'bitcoin', 'ethereum', 'solana', 'token', 'mining', 'wallet', 'altcoin'],
      cats: ['📈 TRADING', '🪙 CRYPTO', '🔍 ANALYSIS', '💰 PORTFOLIO', '📊 CHARTS', '🐋 WHALE WATCH'],
      channels: ['market-chat', 'trading-signals', 'chart-analysis', 'defi-yield', 'nft-discussion', 'altcoin-picks', 'whale-alerts', 'portfolio-track', 'crypto-news', 'mining-talk']
    },
    business: {
      keywords: ['business', 'company', 'startup', 'enterprise', 'corporate', 'professional', 'networking', 'entrepreneur', 'marketing', 'sales', 'saas'],
      cats: ['💼 BUSINESS', '🤝 NETWORKING', '📊 STRATEGY', '📢 MARKETING', '💰 SALES', '🏢 COMPANY'],
      channels: ['business-chat', 'networking-lounge', 'job-board', 'partnerships', 'marketing-tips', 'strategy-room', 'investor-relations', 'team-huddle', 'pitch-ideas', 'growth-hacking']
    },
    education: {
      keywords: ['education', 'learn', 'study', 'school', 'university', 'college', 'course', 'tutorial', 'teach', 'class', 'academic', 'homework', 'exam', 'mentor'],
      cats: ['🎓 EDUCATION', '📚 COURSES', '💡 LEARNING', '📝 ASSIGNMENTS', '🧑‍🏫 INSTRUCTORS', '🏆 ACHIEVEMENTS'],
      channels: ['course-talk', 'study-buddy', 'assignment-help', 'resource-lib', 'ask-mentor', 'code-review', 'career-path', 'study-room-voice', 'exam-prep', 'cert-prep']
    },
    food: {
      keywords: ['restaurant', 'cafe', 'coffee', 'food', 'dining', 'menu', 'pizza', 'burger', 'bakery', 'cooking', 'chef', 'recipe', 'brunch', 'bbq'],
      cats: ['🍕 FOOD', '📦 ORDERS', '⭐ REVIEWS', '👨‍🍳 KITCHEN', '🎉 EVENTS', '📋 MENU'],
      channels: ['daily-specials', 'food-porn', 'order-here', 'order-status', 'reservation-book', 'chef-chat', 'recipe-share', 'foodie-photos', 'catering', 'feedback']
    },
    fitness: {
      keywords: ['fitness', 'gym', 'workout', 'health', 'wellness', 'exercise', 'training', 'sports', 'bodybuilding', 'yoga', 'running', 'crossfit'],
      cats: ['💪 FITNESS', '🏋️ WORKOUTS', '🥗 NUTRITION', '📊 PROGRESS', '🎯 GOALS', '👥 COMMUNITY'],
      channels: ['daily-wod', 'workout-plans', 'form-check', 'progress-pics', 'meal-prep', 'healthy-recipes', 'motivation', 'training-partner', 'supplement-talk', 'run-club']
    },
    store: {
      keywords: ['store', 'shop', 'ecommerce', 'sell', 'sales', 'product', 'marketplace', 'merch', 'retail', 'buy', 'order', 'catalog', 'dropship'],
      cats: ['🛒 STORE', '📦 PRODUCTS', '💬 SUPPORT', '⭐ REVIEWS', '🏷️ DEALS', '📦 ORDERS'],
      channels: ['product-catalog', 'new-drops', 'flash-sales', 'product-q&a', 'order-help', 'shipping-info', 'returns-exchange', 'customer-showcase', 'vip-access', 'restock-alerts']
    },
    studio: {
      keywords: ['studio', 'agency', 'creative agency', 'design agency', 'production', 'freelance'],
      cats: ['🎬 STUDIO', '🚀 PROJECTS', '💡 IDEAS', '🎨 PORTFOLIO', '🤝 COLLABS', '📊 CLIENT'],
      channels: ['active-projects', 'project-showcase', 'brainstorm', 'client-portal', 'deadline-tracker', 'resource-pool', 'collab-finder', 'feedback-loop', 'case-studies', 'tools-stack']
    },
    nonprofit: {
      keywords: ['nonprofit', 'charity', 'volunteer', 'foundation', 'cause', 'donate', 'community service'],
      cats: ['❤️ MISSION', '🤝 VOLUNTEERS', '📢 EVENTS', '💰 DONATIONS', '📚 RESOURCES', '📣 OUTREACH'],
      channels: ['volunteer-signup', 'event-planning', 'coordination', 'impact-stories', 'donation-info', 'resource-lib', 'outreach-campaign', 'community-board', 'fundraiser', 'partnerships']
    }
  };

  const detected = [];
  for (const [type, data] of Object.entries(themeDefs)) {
    if (data.keywords.some(kw => prompt.includes(kw))) {
      detected.push({ type, ...data });
    }
  }

  if (detected.length === 0) {
    detected.push({
      type: 'community',
      keywords: ['community', 'social', 'chat', 'hangout', 'friends', 'club', 'group'],
      cats: ['💬 GENERAL', '🎉 EVENTS', '📋 INFO', '🎙️ VOICE', '💡 IDEAS', '🤝 NETWORKING'],
      channels: ['general-chat', 'introductions', 'off-topic', 'events', 'suggestions', 'voice-hangout', 'media-share', 'memes', 'hall-of-fame', 'chill-zone']
    });
  }

  return detected;
}

function generateCustomCategories(themes, prompt) {
  const categories = [];

  categories.push({
    name: '📋 INFORMATION',
    channels: [
      { name: '📌 rules', type: 'text', description: '📋 Server rules — read before posting. Breaking rules = warning → mute → ban. Staff decisions are final.', permissions: [{ role: 'everyone', send: false }, { role: 'Member', send: false }, { role: 'Staff', send: true }] },
      { name: '📢 announcements', type: 'announcement', description: '🚨 Official updates and news from the team. Staff post here — do not ping roles unnecessarily.', permissions: [{ role: 'everyone', send: false }, { role: 'Member', send: false }, { role: 'Staff', send: true }] },
      { name: '👋 welcome', type: 'text', description: '🎉 Welcome new members! Introduce yourself and tell us what brought you here.', permissions: [{ role: 'everyone', send: false }, { role: 'Member', send: true }, { role: 'Staff', send: true }] },
      { name: '🎭 roles', type: 'text', description: '🎨 Self-assign your roles to customize your experience and get access to specific channels.', permissions: [{ role: 'everyone', send: false }, { role: 'Member', send: true }, { role: 'Staff', send: true }] }
    ]
  });

  const usedNames = new Set(['📋 INFORMATION']);

  for (const theme of themes) {
    const channelBank = theme.channels || [];
    const catBank = theme.cats || [];

    for (let i = 0; i < Math.min(catBank.length, 4); i++) {
      const catName = catBank[i];
      if (usedNames.has(catName)) continue;
      usedNames.add(catName);

      const channels = [];
      const startIdx = i * 3;
      for (let j = 0; j < 3 && startIdx + j < channelBank.length; j++) {
        const rawName = channelBank[startIdx + j];
        const isVoice = rawName.includes('voice') || rawName.includes('listening') || rawName.includes('session') || rawName.includes('room') || rawName.includes('studio') || rawName.includes('partner') || rawName.includes('hangout') || rawName.includes('chill');
        const isAnnouncement = rawName.includes('announcement') || rawName.includes('news') || rawName.includes('update');
        channels.push({
          name: rawName,
          type: isVoice ? 'voice' : isAnnouncement ? 'announcement' : 'text',
          description: describeChannel(rawName, theme.type),
          permissions: isVoice
            ? [{ role: 'everyone', send: false }, { role: 'Member', send: true }]
            : isAnnouncement
              ? [{ role: 'everyone', send: false }, { role: 'Member', send: false }, { role: 'Staff', send: true }]
              : [{ role: 'everyone', send: false }, { role: 'Member', send: true }, { role: 'Staff', send: true }]
        });
      }

      if (channels.length === 0) {
        channels.push(
          { name: 'general-chat', type: 'text', description: `General ${theme.type} discussion — keep it respectful and on-topic.`, permissions: [{ role: 'everyone', send: false }, { role: 'Member', send: true }, { role: 'Staff', send: true }] },
          { name: 'showcase', type: 'text', description: 'Share your best work, creations, or achievements.', permissions: [{ role: 'everyone', send: false }, { role: 'Member', send: true }, { role: 'Staff', send: true }] },
          { name: 'feedback', type: 'forum', description: 'Get constructive feedback from the community.', permissions: [{ role: 'everyone', send: false }, { role: 'Member', send: true }, { role: 'Staff', send: true }] }
        );
      }

      categories.push({ name: catName, channels });
    }
  }

  categories.push({
    name: '💬 COMMUNITY',
    channels: [
      { name: '🔥 general-chat', type: 'text', description: 'The heart of our community — talk about anything and everything. Keep it friendly, no spam, no NSFW.', permissions: [{ role: 'everyone', send: false }, { role: 'Member', send: true }, { role: 'Staff', send: true }] },
      { name: '💡 suggestions', type: 'forum', description: 'Got ideas to improve the server? Share them here. The best suggestions get implemented.', permissions: [{ role: 'everyone', send: false }, { role: 'Member', send: true }, { role: 'Staff', send: true }] },
      { name: '🎉 events', type: 'text', description: 'Community events, game nights, giveaways, and special activities.', permissions: [{ role: 'everyone', send: false }, { role: 'Member', send: true }, { role: 'Staff', send: true }] },
      { name: '🏆 hall-of-fame', type: 'text', description: 'Celebrating our best members, top contributors, and outstanding achievements.', permissions: [{ role: 'everyone', send: false }, { role: 'Member', send: false }, { role: 'Staff', send: true }] }
    ]
  });

  categories.push({
    name: '🎙️ VOICE CHANNELS',
    channels: [
      { name: '🔊 general-voice', type: 'voice', description: 'General voice chat — hop in and talk with the community.', permissions: [{ role: 'everyone', send: false }, { role: 'Member', send: true }] },
      { name: '🔊 chill-zone', type: 'voice', description: 'Relaxed voice chat — no pressure, just vibes.', permissions: [{ role: 'everyone', send: false }, { role: 'Member', send: true }] },
      { name: '🎵 music', type: 'voice', description: 'Listen to music together using music bots.', permissions: [{ role: 'everyone', send: false }, { role: 'Member', send: true }] },
      { name: '💤 afk', type: 'voice', description: 'Away from keyboard — auto-moved after 5 minutes of inactivity.', permissions: [{ role: 'everyone', send: false }, { role: 'Member', send: true }] }
    ]
  });

  return categories;
}

function describeChannel(name, theme) {
  const descs = {
    'lfg-ranked': '🎯 Find ranked teammates — state your skill level and what you\'re looking for.',
    'game-chat': '🎮 Game discussion — strategies, updates, patch notes, and meta. Keep it constructive.',
    'stream-clips': '🎬 Share your best moments — epic plays, funny fails, and highlight reels.',
    'tournament-bracket': '🏆 Tournament info and brackets — sign up, check schedules, compete.',
    'squad-up': '👥 Form your squad — find players for ranked, casual, or tournament play.',
    'patch-notes': '📋 Game updates and patch notes — stay informed about the latest changes.',
    'game-meta': '📊 Meta discussion — tier lists, strategies, and optimal play.',
    'highlight-reels': '🎥 Best plays and clips from the community. Quality content only.',
    'voice-squad': '🔊 Squad voice chat — coordinate and communicate in real-time.',
    'chill-gaming': '🎮 Casual gaming — no pressure, just fun.',
    'beat-showcase': '🎹 Share your beats and instrumentals — get feedback from producers.',
    'freestyle-friday': '🎤 Freestyle and rap battles — show off your skills every Friday.',
    'listening-room': '🎧 Curated listening sessions — share and discover new music.',
    'producer-chat': '🎹 Producer discussion — techniques, gear, DAWs, and production tips.',
    'vocal-booth': '🎤 Vocal tips, acapella sharing, and vocal collaboration.',
    'sample-pack': '📦 Share and discover sample packs, loops, and one-shots.',
    'mix-feedback': '🎚️ Get feedback on your mixes — be constructive and specific.',
    'collab-finder': '🤝 Find collaborators — producers, vocalists, engineers.',
    'studio-session': '🎙️ Live studio sessions — watch producers work in real-time.',
    'playlist-share': '🎶 Share and discover playlists across genres.',
    'portfolio-drop': '🖼️ Share your portfolio — illustrations, designs, and projects.',
    'sketch-dump': '✏️ Quick sketches, doodles, and warm-ups.',
    'critique-corner': '🔍 Request detailed critiques — get actionable feedback.',
    'art-tutorial': '📚 Learn new techniques — share and discover art tutorials.',
    'commission-board': '🛒 Buy and sell art commissions — set your prices.',
    'art-challenge': '🎨 Weekly art challenges — push your creativity.',
    'reference-library': '📚 Reference images and resources for your art.',
    'tool-talk': '🛠️ Art tools discussion — tablets, software, brushes, workflows.',
    'art-stream': '📺 Live art streams — watch artists create in real-time.',
    'pixel-art': '👾 Pixel art community — share and discuss pixel art.',
    'general-dev': '💻 General development — code, architecture, and best practices.',
    'help-desk': '🐛 Get help with your code — describe your problem, share errors.',
    'code-review': '🔍 Request code reviews — get constructive feedback.',
    'project-ideas': '💡 Brainstorm project ideas — find inspiration and collaborators.',
    'show-and-tell': '🚀 Show off your projects — demos, launches, milestones.',
    'open-source': '📦 Open source — contribute, find maintainers, collaborate.',
    'api-discussion': '🔌 APIs, webhooks, and integration topics.',
    'pair-programming': '👨‍💻 Code together in real-time.',
    'devops': '⚙️ DevOps — CI/CD, containers, deployment, monitoring.',
    'hackathon': '🏁 Hackathon planning and team formation.',
    'market-chat': '📈 Market discussion — trends, analysis, sentiment.',
    'trading-signals': '🎯 Trading signals and alerts — share your analysis.',
    'chart-analysis': '📊 Technical analysis — share charts and predictions.',
    'defi-yield': '🏦 DeFi — yield farming, liquidity, staking.',
    'nft-discussion': '🖼️ NFTs — collections, marketplaces, digital art.',
    'altcoin-picks': '💎 Altcoin research and analysis.',
    'whale-alerts': '🐋 Large transactions and market-moving events.',
    'portfolio-track': '💰 Portfolio discussion — holdings and performance.',
    'crypto-news': '📰 Latest crypto news and developments.',
    'mining-talk': '⛏️ Mining discussion — hardware, pools, profitability.',
    'business-chat': '💼 Business discussion — strategy, growth, industry.',
    'networking-lounge': '🤝 Connect with professionals — partners, mentors.',
    'job-board': '📋 Job opportunities — post openings, find talent.',
    'partnerships': '🤝 Find business partners — collaborations, alliances.',
    'marketing-tips': '📢 Marketing — social media, content, SEO, growth.',
    'strategy-room': '🎯 Business strategy — planning, execution, competition.',
    'investor-relations': '💰 Investor updates and financial discussions.',
    'team-huddle': '👥 Team coordination — internal communication.',
    'pitch-ideas': '🎤 Pitch your business ideas — get feedback.',
    'growth-hacking': '📈 Growth strategies — user acquisition, retention.',
    'course-talk': '💬 Course discussion — share insights and questions.',
    'study-buddy': '📖 Find study partners — learn together.',
    'assignment-help': '📝 Get help with assignments and homework.',
    'resource-lib': '📚 Learning resources — tutorials, docs, courses.',
    'ask-mentor': '🧑‍🏫 Ask experienced mentors for guidance.',
    'career-path': '💼 Career advice — jobs, portfolios, interviews.',
    'study-room-voice': '🔊 Voice study room — learn together live.',
    'exam-prep': '📝 Exam preparation — share tips and practice.',
    'cert-prep': '🏅 Certification preparation — study groups.',
    'daily-specials': '⭐ Today\'s specials — limited-time offers.',
    'food-porn': '📸 Food photos — show off your meals.',
    'order-here': '📝 Place your order — select and purchase.',
    'order-status': '📊 Check your order — tracking and delivery.',
    'reservation-book': '🗓️ Book a table — check availability.',
    'chef-chat': '👨‍🍳 Chat with our chefs — ask questions.',
    'recipe-share': '🍳 Share and discover recipes.',
    'foodie-photos': '📸 Community food photography.',
    'catering': '🎉 Catering inquiries — events and parties.',
    'feedback': '💬 Share your experience — we value your input.',
    'daily-wod': '🔥 Today\'s workout — follow the program.',
    'workout-plans': '📋 Structured training programs.',
    'form-check': '✅ Get form feedback — share videos.',
    'progress-pics': '📈 Transformations, PRs, and milestones.',
    'meal-prep': '🥗 Meal planning and prep tips.',
    'healthy-recipes': '🍳 Nutritious meals for your goals.',
    'motivation': '💪 Stay motivated — quotes, stories, encouragement.',
    'training-partner': '🤝 Find a workout buddy.',
    'supplement-talk': '💊 Supplement discussion and reviews.',
    'run-club': '🏃 Running community — routes, tips, events.',
    'product-catalog': '🛍️ Browse our products.',
    'new-drops': '🆕 New product drops — first to know.',
    'flash-sales': '🏷️ Flash sales and limited offers.',
    'product-q&a': '❓ Ask about products — specs, availability.',
    'order-help': '📦 Help with orders — tracking, issues.',
    'shipping-info': '🚚 Shipping info — times, costs, policies.',
    'returns-exchange': '🔄 Return and exchange requests.',
    'customer-showcase': '📸 Show off your purchases.',
    'vip-access': '⭐ VIP exclusive content and early access.',
    'restock-alerts': '🔔 Get notified when items are back in stock.',
    'active-projects': '🚀 Current projects — what we\'re working on.',
    'project-showcase': '⭐ Completed projects — show finished work.',
    'brainstorm': '💡 Creative brainstorming sessions.',
    'client-portal': '🤝 Client communication — updates, feedback.',
    'deadline-tracker': '⏰ Project deadlines and milestones.',
    'resource-pool': '📚 Shared resources and assets.',
    'collab-finder': '🤝 Find collaborators for projects.',
    'feedback-loop': '🔄 Constructive feedback on work.',
    'case-studies': '📊 Project case studies and breakdowns.',
    'tools-stack': '🛠️ Tools and software discussion.',
    'volunteer-signup': '✋ Sign up to volunteer.',
    'event-planning': '📅 Plan and organize events.',
    'coordination': '📋 Coordinate volunteers and resources.',
    'impact-stories': '⭐ Share impact and success stories.',
    'donation-info': '💰 How to contribute and support.',
    'outreach-campaign': '📣 Outreach and awareness campaigns.',
    'community-board': '📢 Community announcements.',
    'fundraiser': '🎉 Fundraising events and campaigns.',
    'partnerships': '🤝 Strategic partnerships and alliances.',
    'general-chat': '💬 General discussion — anything goes.',
    'introductions': '👋 Introduce yourself to the community.',
    'off-topic': '🎯 Off-topic chat — unrelated discussions.',
    'events': '📅 Community events and activities.',
    'suggestions': '💡 Share your ideas for improvement.',
    'voice-hangout': '🔊 Voice chat — hop in and talk.',
    'media-share': '🖼️ Share photos, videos, and content.',
    'memes': '😂 Share memes and funny content.',
    'hall-of-fame': '🏆 Top contributors and achievements.',
    'chill-zone': '😎 Relaxed chat — no stress.'
  };

  return descs[name] || `💬 ${name.replace(/-/g, ' ')} — dedicated space for ${theme} discussion and community interaction.`;
}

function generateCustomRoles(themes, prompt) {
  const baseRoles = [
    { name: '👑 Owner', color: '#FF0000', permissions: ['Administrator'], mentionable: false, hoist: true },
    { name: '⚡ Admin', color: '#E74C3C', permissions: ['Administrator'], mentionable: true, hoist: true },
    { name: '🛡️ Moderator', color: '#F1C40F', permissions: ['ManageMessages', 'KickMembers', 'BanMembers', 'ManageChannels', 'ManageThreads'], mentionable: true, hoist: true }
  ];

  const themeRoles = {
    gaming: [
      { name: '🎯 Clan Leader', color: '#FF4500', permissions: ['ManageMessages', 'SendMessages', 'ReadMessageHistory', 'Connect', 'Speak', 'MuteMembers'], mentionable: true, hoist: true },
      { name: '⚔️ Fragger', color: '#FF6347', permissions: ['SendMessages', 'ReadMessageHistory', 'Connect', 'Speak', 'UseExternalEmojis'], mentionable: true, hoist: false },
      { name: '🎮 Squad Member', color: '#32CD32', permissions: ['SendMessages', 'ReadMessageHistory', 'Connect', 'Speak'], mentionable: false, hoist: false },
      { name: '👁️ Spectator', color: '#808080', permissions: ['ReadMessageHistory', 'ViewChannel'], mentionable: false, hoist: false }
    ],
    music: [
      { name: '🎵 Producer', color: '#E040FB', permissions: ['SendMessages', 'ReadMessageHistory', 'AttachFiles', 'EmbedLinks', 'Connect', 'Speak'], mentionable: true, hoist: true },
      { name: '🎤 Artist', color: '#7C4DFF', permissions: ['SendMessages', 'ReadMessageHistory', 'AttachFiles', 'Connect', 'Speak'], mentionable: true, hoist: false },
      { name: '🎧 DJ', color: '#448AFF', permissions: ['SendMessages', 'ReadMessageHistory', 'Connect', 'Speak', 'UseVoiceActivity'], mentionable: false, hoist: false },
      { name: '🎶 Listener', color: '#40C4FF', permissions: ['SendMessages', 'ReadMessageHistory', 'Connect'], mentionable: false, hoist: false }
    ],
    dev: [
      { name: '🧑‍💻 Core Dev', color: '#7C3AED', permissions: ['ManageMessages', 'SendMessages', 'ReadMessageHistory', 'ManageThreads', 'AttachFiles', 'EmbedLinks'], mentionable: true, hoist: true },
      { name: '🔧 Contributor', color: '#10B981', permissions: ['SendMessages', 'ReadMessageHistory', 'AttachFiles', 'EmbedLinks'], mentionable: true, hoist: false },
      { name: '🐛 Bug Hunter', color: '#F59E0B', permissions: ['SendMessages', 'ReadMessageHistory', 'CreatePublicThreads'], mentionable: false, hoist: false },
      { name: '📚 Mentor', color: '#06B6D4', permissions: ['SendMessages', 'ReadMessageHistory', 'ManageThreads'], mentionable: true, hoist: false }
    ],
    art: [
      { name: '🎨 Featured Artist', color: '#FF6B6B', permissions: ['SendMessages', 'ReadMessageHistory', 'AttachFiles', 'EmbedLinks', 'UseExternalEmojis'], mentionable: true, hoist: true },
      { name: '🖌️ Creator', color: '#C084FC', permissions: ['SendMessages', 'ReadMessageHistory', 'AttachFiles', 'EmbedLinks'], mentionable: true, hoist: false },
      { name: '🖼️ Curator', color: '#60A5FA', permissions: ['ManageMessages', 'SendMessages', 'ReadMessageHistory'], mentionable: true, hoist: false },
      { name: '⭐ Spotlight', color: '#FBBF24', permissions: ['SendMessages', 'ReadMessageHistory', 'UseExternalEmojis'], mentionable: false, hoist: false }
    ],
    crypto: [
      { name: '🐋 Whale', color: '#1E40AF', permissions: ['SendMessages', 'ReadMessageHistory', 'Connect', 'Speak', 'UseExternalEmojis'], mentionable: true, hoist: true },
      { name: '📈 Analyst', color: '#059669', permissions: ['SendMessages', 'ReadMessageHistory', 'AttachFiles', 'EmbedLinks'], mentionable: true, hoist: false },
      { name: '💎 HODLer', color: '#7C3AED', permissions: ['SendMessages', 'ReadMessageHistory', 'Connect', 'Speak'], mentionable: false, hoist: false },
      { name: '🌱 Newbie', color: '#9CA3AF', permissions: ['ReadMessageHistory', 'ViewChannel'], mentionable: false, hoist: false }
    ],
    business: [
      { name: '💼 Executive', color: '#1E3A5F', permissions: ['ManageMessages', 'SendMessages', 'ReadMessageHistory', 'ManageChannels'], mentionable: true, hoist: true },
      { name: '🤝 Partner', color: '#0D9488', permissions: ['SendMessages', 'ReadMessageHistory', 'Connect', 'Speak', 'AttachFiles'], mentionable: true, hoist: false },
      { name: '📊 Manager', color: '#2563EB', permissions: ['ManageMessages', 'SendMessages', 'ReadMessageHistory'], mentionable: true, hoist: false },
      { name: '🌱 Associate', color: '#6B7280', permissions: ['SendMessages', 'ReadMessageHistory', 'Connect'], mentionable: false, hoist: false }
    ],
    education: [
      { name: '🧑‍🏫 Instructor', color: '#8B5CF6', permissions: ['ManageMessages', 'SendMessages', 'ReadMessageHistory', 'ManageThreads'], mentionable: true, hoist: true },
      { name: '📚 Teaching Assistant', color: '#06B6D4', permissions: ['ManageMessages', 'SendMessages', 'ReadMessageHistory', 'ManageThreads'], mentionable: true, hoist: false },
      { name: '🎓 Graduate', color: '#10B981', permissions: ['SendMessages', 'ReadMessageHistory', 'AttachFiles', 'CreatePublicThreads'], mentionable: false, hoist: false },
      { name: '🌱 Student', color: '#9CA3AF', permissions: ['ReadMessageHistory', 'ViewChannel', 'AddReactions'], mentionable: false, hoist: false }
    ],
    food: [
      { name: '👨‍🍳 Head Chef', color: '#DC2626', permissions: ['ManageMessages', 'SendMessages', 'ReadMessageHistory', 'ManageChannels'], mentionable: true, hoist: true },
      { name: '🍕 Line Cook', color: '#EA580C', permissions: ['SendMessages', 'ReadMessageHistory', 'AttachFiles', 'EmbedLinks'], mentionable: true, hoist: false },
      { name: '🍽️ Server', color: '#D97706', permissions: ['SendMessages', 'ReadMessageHistory', 'Connect', 'Speak'], mentionable: false, hoist: false },
      { name: '⭐ VIP Diner', color: '#F59E0B', permissions: ['SendMessages', 'ReadMessageHistory', 'UseExternalEmojis', 'ChangeNickname'], mentionable: false, hoist: true }
    ],
    fitness: [
      { name: '🏋️ Coach', color: '#DC2626', permissions: ['ManageMessages', 'SendMessages', 'ReadMessageHistory', 'ManageThreads'], mentionable: true, hoist: true },
      { name: '💪 Athlete', color: '#2563EB', permissions: ['SendMessages', 'ReadMessageHistory', 'AttachFiles', 'Connect', 'Speak'], mentionable: true, hoist: false },
      { name: '🎯 Trainer', color: '#059669', permissions: ['SendMessages', 'ReadMessageHistory', 'ManageThreads'], mentionable: true, hoist: false },
      { name: '🌱 Beginner', color: '#9CA3AF', permissions: ['ReadMessageHistory', 'ViewChannel'], mentionable: false, hoist: false }
    ],
    store: [
      { name: '🏪 Owner', color: '#DC2626', permissions: ['ManageMessages', 'SendMessages', 'ReadMessageHistory', 'ManageChannels'], mentionable: true, hoist: true },
      { name: '🛒 Manager', color: '#2563EB', permissions: ['ManageMessages', 'SendMessages', 'ReadMessageHistory', 'ManageThreads'], mentionable: true, hoist: false },
      { name: '📦 Seller', color: '#059669', permissions: ['SendMessages', 'ReadMessageHistory', 'AttachFiles', 'EmbedLinks'], mentionable: true, hoist: false },
      { name: '⭐ VIP Customer', color: '#F59E0B', permissions: ['SendMessages', 'ReadMessageHistory', 'UseExternalEmojis'], mentionable: false, hoist: true }
    ],
    studio: [
      { name: '🎬 Director', color: '#1E3A5F', permissions: ['ManageMessages', 'SendMessages', 'ReadMessageHistory', 'ManageChannels'], mentionable: true, hoist: true },
      { name: '🎨 Creative Lead', color: '#7C3AED', permissions: ['SendMessages', 'ReadMessageHistory', 'AttachFiles', 'EmbedLinks', 'ManageThreads'], mentionable: true, hoist: true },
      { name: '🤝 Producer', color: '#059669', permissions: ['SendMessages', 'ReadMessageHistory', 'Connect', 'Speak'], mentionable: true, hoist: false },
      { name: '🌱 Intern', color: '#9CA3AF', permissions: ['ReadMessageHistory', 'ViewChannel'], mentionable: false, hoist: false }
    ],
    nonprofit: [
      { name: '❤️ Director', color: '#DC2626', permissions: ['ManageMessages', 'SendMessages', 'ReadMessageHistory', 'ManageChannels'], mentionable: true, hoist: true },
      { name: '🤝 Volunteer Lead', color: '#059669', permissions: ['ManageMessages', 'SendMessages', 'ReadMessageHistory', 'ManageThreads'], mentionable: true, hoist: true },
      { name: '📢 Outreach', color: '#2563EB', permissions: ['SendMessages', 'ReadMessageHistory', 'AttachFiles', 'EmbedLinks'], mentionable: true, hoist: false },
      { name: '🌱 Supporter', color: '#9CA3AF', permissions: ['ReadMessageHistory', 'ViewChannel', 'AddReactions'], mentionable: false, hoist: false }
    ]
  };

  let customRoles = [];
  for (const theme of themes) {
    if (themeRoles[theme.type]) {
      customRoles = themeRoles[theme.type];
      break;
    }
  }

  if (customRoles.length === 0) {
    customRoles = [
      { name: '🤝 Helper', color: '#3498DB', permissions: ['ManageMessages', 'SendMessages', 'ReadMessageHistory', 'ManageThreads'], mentionable: true, hoist: true },
      { name: '💎 VIP', color: '#9B59B6', permissions: ['SendMessages', 'ReadMessageHistory', 'Connect', 'Speak', 'UseExternalEmojis'], mentionable: false, hoist: true },
      { name: '⭐ Member', color: '#2ECC71', permissions: ['SendMessages', 'ReadMessageHistory', 'Connect', 'Speak', 'AddReactions', 'AttachFiles'], mentionable: false, hoist: false },
      { name: '🌱 Newcomer', color: '#95A5A6', permissions: ['ReadMessageHistory', 'ViewChannel'], mentionable: false, hoist: false }
    ];
  }

  baseRoles.push(...customRoles);
  baseRoles.push({ name: '🎖️ Booster', color: '#FF73FA', permissions: ['SendMessages', 'ReadMessageHistory', 'Connect', 'Speak', 'UseExternalEmojis', 'ChangeNickname'], mentionable: false, hoist: true });

  return baseRoles;
}

function buildStructure(serverName, categories, roles) {
  const categoryObjects = categories.map(cat => ({
    name: cat.name,
    channels: cat.channels.map(ch => ({
      name: ch.name,
      type: ch.type,
      topic: ch.description || '',
      nsfw: false,
      permissions: ch.permissions || []
    }))
  }));

  return {
    serverName,
    description: `Welcome to ${serverName} — where community meets purpose.`,
    categories: categoryObjects,
    roles: roles.map(r => ({
      name: r.name,
      color: r.color,
      permissions: r.permissions,
      mentionable: r.mentionable !== false,
      hoist: r.hoist || false
    })),
    settings: {
      verificationLevel: 'medium',
      defaultMessageNotifications: 'only_mentions',
      explicitContentFilter: 'all_members',
      afkTimeout: 300,
      systemChannelFlags: ['SUPPRESS_JOIN_NOTIFICATIONS']
    }
  };
}

async function generateChatResponse(messages) {
  const db = require('../database');
  let provider;
  try {
    provider = await db.getActiveAiProvider();
  } catch (e) {
    console.error('Failed to fetch AI provider from database:', e.message);
  }

  console.log('Active AI provider:', provider ? `${provider.provider} (${provider.name})` : 'none');

  if (provider && provider.api_key) {
    try {
      const response = await callProviderAPI(provider, messages);
      console.log('AI response received from', provider.provider);
      return response;
    } catch (error) {
      console.error(`AI provider ${provider.provider} (${provider.name}) failed:`, error.message);
      console.error('Full error:', error.stack);
      return simulateAIResponse(messages, `AI provider error: ${error.message}`);
    }
  }

  if (process.env.AI_API_KEY && process.env.AI_API_KEY !== 'your-ai-api-key') {
    try {
      return await callProviderAPI({
        provider: 'openai',
        api_key: process.env.AI_API_KEY,
        models: ['gpt-3.5-turbo']
      }, messages);
    } catch (error) {
      console.error('Fallback AI error:', error.message);
    }
  }

  return simulateAIResponse(messages, null);
}

async function callProviderAPI(provider, messages) {
  const apiKey = provider.api_key;
  const model = provider.models?.[0] || getDefaultModel(provider.provider);
  const baseUrl = provider.base_url || getBaseUrl(provider.provider);

  const formattedMessages = messages.map(m => ({ role: m.role, content: m.content }));

  const systemMessage = {
    role: 'system',
    content: `You are DiscordGPT — the ultimate Discord server architect. You create COMPLETELY CUSTOM, ONE-OF-A-KIND server structures based on EXACTLY what the user describes. You NEVER use generic templates. Every server you design is unique, creative, and tailored to the user's vision.

YOUR CORE PHILOSOPHY:
- READ the user's prompt carefully — extract every detail, keyword, and intent
- IMAGINE what a real community for that topic would need
- CREATE categories, channels, and roles that make sense ONLY for that specific community
- Be CREATIVE with names — use the user's language, slang, theme, and vibe
- Think like a community manager who has built 1000+ different servers

WHEN THE USER ASKS TO CREATE A SERVER:
Respond with ONLY a JSON blueprint in a \`\`\`json code block. Zero explanation before or after.

CATEGORY CREATION — THINK FROM SCRATCH:
❌ NEVER do this: Just list "INFORMATION, GENERAL, VOICE" for every server
✅ DO this: Ask yourself "What does THIS specific community actually need?"

Examples of CREATIVE thinking:
- Minecraft server → 🪓 SURVIVAL, 🏰 BUILDS, 💎 ECONOMY, ⛏️ MINING, 🎮 GAME MODES
- Music producer community → 🎹 STUDIO, 🎵 BEATS, 🎧 LISTENING, 📤 SUBMISSIONS, 🎤 COLLABS
- Crypto trading group → 📈 SIGNALS, 🪙 PORTFOLIO, 🔍 ANALYSIS, 💰 WHALE WATCH, 📊 CHARTS
- Art community → 🖌️ GALLERY, 🎨 WIP, 📚 TUTORIALS, 🛒 COMMISSIONS, 🏆 CONTESTS
- Restaurant → 🍕 MENU, 📦 ORDERS, ⭐ REVIEWS, 🎉 EVENTS, 👨‍🍳 KITCHEN STAFF

CHANNEL CREATION — BE SPECIFIC AND CREATIVE:
❌ Bad: "general-chat", "rules", "announcements" (generic, boring)
✅ Good: Names that reflect the ACTUAL community:
  - Gaming: "🎯 lfg-ranked", "📺 stream-clips", "🏆 tournament-bracket"
  - Music: "🎹 beat-showcase", "🎤 freestyle-friday", "🎧 listening-room"
  - Dev: "🐛 bug-hunting", "💡 project-ideas", "🔗 api-discussion"
  - Art: "🖼️ portfolio-drop", "✏️ sketch-dump", "🎨 critique-corner"
  - Food: "🍕 daily-specials", "📸 food-porn", "🗓️ reservation-booking"

ROLE CREATION — MAKE THEM UNIQUE TO THE COMMUNITY:
❌ Bad: Generic "Owner, Admin, Moderator, Member" for every server
✅ Good: Roles that FIT the community theme:
  - Gaming: "🎯 Clan Leader", "⚔️ Fragger", "🎮 Squad Member", "👁️ Spectator"
  - Music: "🎵 Producer", "🎤 Artist", "🎧 DJ", "🎶 Listener"
  - Dev: "🧑‍💻 Core Dev", "🔧 Contributor", "🐛 Bug Hunter", "📚 Mentor"
  - Art: "🎨 Featured Artist", "🖌️ Creator", "🖼️ Curator", "⭐ Spotlight"
  - Food: "👨‍🍳 Head Chef", "🍕 Line Cook", "🍽️ Server", "⭐ VIP Diner"

ROLE PERMISSIONS — MATCH THE ROLE:
- Staff roles: ManageMessages, KickMembers, BanMembers, ManageChannels
- Content creator roles: SendMessages, AttachFiles, EmbedLinks, UseExternalEmojis
- Voice-heavy roles: Connect, Speak, UseVoiceActivity, MuteMembers
- VIP roles: SendMessages, ReadMessageHistory, Connect, Speak, UseExternalEmojis, ChangeNickname
- New member roles: ReadMessageHistory, ViewChannel only

CHANNEL DESCRIPTIONS — WRITE REAL ONES:
Every channel needs a 2-3 sentence description that explains:
1. What this channel is for
2. What kind of content belongs here
3. Any rules or guidelines

Example: "🏰 Share your best builds and creations. Screenshots, world downloads, and build guides welcome. Be constructive in feedback — no toxicity."

CHANNEL TYPES — USE THEM WISELY:
- text: Default for most channels
- voice: For real-time voice chat, gaming sessions, music listening
- announcement: For important updates only (staff post here)
- forum: For structured discussions with threads (great for help, showcases, topics)

RESPOND WITH ONLY THIS JSON:
\`\`\`json
{
  "serverName": "Creative Name Based on User's Prompt",
  "description": "A unique tagline that captures the EXACT vibe the user described",
  "categories": [
    {
      "name": "🎯 CREATIVE CATEGORY NAME",
      "channels": [
        { "name": "📌 specific-channel-name", "type": "text", "description": "2-3 sentence description of purpose, content type, and rules", "permissions": [{ "role": "everyone", "send": false }, { "role": "Member", "send": true }, { "role": "Staff", "send": true }] },
        { "name": "🔊 voice-channel-name", "type": "voice", "description": "What happens in this voice channel", "permissions": [{ "role": "everyone", "send": false }, { "role": "Member", "send": true }] },
        { "name": "📢 announcements-name", "type": "announcement", "description": "What kind of announcements go here", "permissions": [{ "role": "everyone", "send": false }, { "role": "Member", "send": false }, { "role": "Staff", "send": true }] },
        { "name": "💭 forum-channel-name", "type": "forum", "description": "What discussions happen here, how threads work", "permissions": [{ "role": "everyone", "send": false }, { "role": "Member", "send": true }] }
      ]
    }
  ],
  "roles": [
    { "name": "👑 Owner", "color": "#FF0000", "permissions": ["Administrator"], "mentionable": false, "hoist": true },
    { "name": "THEME-SPECIFIC ADMIN ROLE", "color": "#HEXCOLOR", "permissions": ["Administrator"], "mentionable": true, "hoist": true },
    { "name": "THEME-SPECIFIC STAFF ROLE", "color": "#HEXCOLOR", "permissions": ["ManageMessages", "KickMembers", "BanMembers"], "mentionable": true, "hoist": true },
    { "name": "THEME-SPECIFIC CREATOR ROLE", "color": "#HEXCOLOR", "permissions": ["SendMessages", "ReadMessageHistory", "AttachFiles"], "mentionable": true, "hoist": true },
    { "name": "THEME-SPECIFIC MEMBER ROLE", "color": "#HEXCOLOR", "permissions": ["SendMessages", "ReadMessageHistory", "Connect", "Speak"], "mentionable": false, "hoist": false },
    { "name": "🌱 Newcomer", "color": "#95A5A6", "permissions": ["ReadMessageHistory", "ViewChannel"], "mentionable": false, "hoist": false }
  ],
  "settings": {
    "verificationLevel": "medium",
    "defaultMessageNotifications": "only_mentions",
    "explicitContentFilter": "all_members",
    "afkTimeout": 300,
    "systemChannelFlags": ["SUPPRESS_JOIN_NOTIFICATIONS"]
  }
}
\`\`\`

VALID CHANNEL TYPES: text, voice, announcement, forum
VALID PERMISSIONS: Administrator, ManageServer, ManageRoles, ManageChannels, KickMembers, BanMembers, ManageMessages, SendMessages, ReadMessageHistory, Connect, Speak, ViewChannel, CreateInstantInvite, ChangeNickname, AddReactions, EmbedLinks, AttachFiles, UseExternalEmojis, MentionEveryone, UseExternalStickers, SendMessagesInThreads, CreatePublicThreads, CreatePrivateThreads, ManageThreads, UseVoiceActivity, MuteMembers, DeafenMembers

CHANNEL PERMISSIONS (CRITICAL — YOU MUST SET THESE):
Every channel MUST have a "permissions" array. This controls who can send messages.

RULES:
- announcement channels: ONLY staff roles can send messages. Members can only read. Set "send": false for @everyone/Member.
- text channels: Members CAN send messages. Set "send": true for Member.
- voice channels: Members CAN connect and speak. Set "send": true for Member.
- forum channels: Members CAN create threads. Set "send": true for Member.
- rules/info channels: Read-only for members. Set "send": false for Member.

Permission format per channel:
"permissions": [
  { "role": "everyone", "send": false },
  { "role": "Member", "send": true },
  { "role": "Staff", "send": true }
]

For announcement channels, use:
"permissions": [
  { "role": "everyone", "send": false },
  { "role": "Member", "send": false },
  { "role": "Staff", "send": true }
]

STAFF ROLES are: Owner, Admin, Moderator, and any theme-specific staff role.
MEMBER ROLES are: Member, Booster, and any theme-specific non-staff role.
@everyone is the base role — always set it explicitly.

IMPORTANT: The categories, channels, and roles MUST be directly inspired by the user's prompt. If they say "Minecraft survival server with economy", your categories should be about survival, economy, trading, builds — NOT generic "Information, General, Voice". Be creative, be specific, be unique.

FOR NON-SERVER REQUESTS: Respond normally as a helpful, friendly assistant. Help with Discord tips, server management, community building, etc.`
  };

  const allMessages = [systemMessage, ...formattedMessages];

  switch (provider.provider) {
    case 'openai':
    case 'openrouter':
      return await callOpenAI(apiKey, model, baseUrl, allMessages);
    case 'anthropic':
      return await callAnthropic(apiKey, model, allMessages);
    case 'google':
      return await callGoogle(apiKey, model, allMessages);
    case 'mistral':
      return await callMistral(apiKey, model, allMessages);
    case 'groq':
      return await callGroq(apiKey, model, allMessages);
    case 'custom':
      return await callCustom(apiKey, model, baseUrl, allMessages);
    default:
      return await callOpenAI(apiKey, model, 'https://api.openai.com/v1', allMessages);
  }
}

function getDefaultModel(provider) {
  const defaults = {
    openai: 'gpt-4o-mini',
    anthropic: 'claude-3-haiku-20240307',
    google: 'gemini-3.1-flash-lite',
    mistral: 'mistral-small-latest',
    groq: 'llama-3.1-8b-instant',
    openrouter: 'auto',
    custom: 'default'
  };
  return defaults[provider] || 'gpt-4o-mini';
}

function getBaseUrl(provider) {
  const urls = {
    openai: 'https://api.openai.com/v1',
    openrouter: 'https://openrouter.ai/api/v1',
    mistral: 'https://api.mistral.ai/v1',
    groq: 'https://api.groq.com/openai/v1',
    custom: ''
  };
  return urls[provider] || 'https://api.openai.com/v1';
}

async function callOpenAI(apiKey, model, baseUrl, messages) {
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({ model, messages, max_tokens: 4096, temperature: 0.7 }),
    signal: AbortSignal.timeout(45000)
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function callAnthropic(apiKey, model, messages) {
  const systemMsg = messages.find(m => m.role === 'system');
  const chatMessages = messages.filter(m => m.role !== 'system');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: model || 'claude-3-haiku-20240307',
      max_tokens: 4096,
      system: systemMsg?.content || '',
      messages: chatMessages.map(m => ({ role: m.role, content: m.content }))
    }),
    signal: AbortSignal.timeout(45000)
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Anthropic API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

async function callGoogle(apiKey, model, messages) {
  const systemMsg = messages.find(m => m.role === 'system');
  const chatMessages = messages.filter(m => m.role !== 'system');

  const contents = chatMessages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));

  const fallbackModels = [model, 'gemini-3.1-flash-lite', 'gemini-3.5-flash'].filter(Boolean);
  const uniqueModels = [...new Set(fallbackModels)];

  for (const m of uniqueModels) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`;
    const body = { contents };
    if (systemMsg) {
      body.systemInstruction = { parts: [{ text: systemMsg.content }] };
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(45000)
      });

      if (response.ok) {
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
      }

      if (response.status === 503 || response.status === 429) {
        console.log(`Google model ${m} unavailable (${response.status}), trying next...`);
        continue;
      }

      const err = await response.text();
      throw new Error(`Google AI error ${response.status}: ${err}`);
    } catch (e) {
      if (e.name === 'TimeoutError' || e.message?.includes('timeout')) {
        console.log(`Google model ${m} timed out, trying next...`);
        continue;
      }
      throw e;
    }
  }

  throw new Error('All Google AI models are currently unavailable');
}

async function callMistral(apiKey, model, messages) {
  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({ model: model || 'mistral-small-latest', messages, max_tokens: 4096 }),
    signal: AbortSignal.timeout(45000)
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Mistral API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function callGroq(apiKey, model, messages) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({ model: model || 'llama-3.1-8b-instant', messages, max_tokens: 4096 }),
    signal: AbortSignal.timeout(45000)
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function callCustom(apiKey, model, baseUrl, messages) {
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({ model: model || 'default', messages, max_tokens: 4096 }),
    signal: AbortSignal.timeout(45000)
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Custom API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

function simulateAIResponse(messages, errorMsg) {
  const lastMessage = messages[messages.length - 1];
  const content = lastMessage.content.toLowerCase();

  if (errorMsg) {
    console.log('AI provider error (falling back to built-in):', errorMsg);
  }

  const blueprintKeywords = ['create', 'make', 'build', 'generate', 'blueprint', 'server', 'setup'];
  const isBlueprintRequest = blueprintKeywords.some(kw => content.includes(kw));

  if (isBlueprintRequest) {
    const blueprint = generateBlueprint(lastMessage.content);
    const catList = blueprint.categories.map(c =>
      `**${c.name}**\n${c.channels.map(ch => `  \`${ch.type}\` ${ch.name} — ${ch.description || ''}`).join('\n')}`
    ).join('\n\n');
    const roleList = blueprint.roles.map(r => `  ${r.name} \`${r.color}\``).join('\n');

    return `## 🏗️ Server Blueprint: **${blueprint.serverName}**\n\n*${blueprint.description}*\n\n### Categories & Channels\n${catList}\n\n### Roles\n${roleList}\n\n---\n\nClick **Create Server** to build this on your Discord, or **Get Deploy Code** for a one-time invite link.`;
  }

  if (content.includes('help') || content.includes('how')) {
    return `I can help you create Discord server structures. Here's what I do:\n\n1. **Describe your server** - Tell me what kind of Discord server you want\n2. **I generate a blueprint** - Categories, channels, roles, permissions\n3. **One-click creation** - I build it on your server automatically\n\nTry: "Create a gaming server for my Valorant community"`;
  }

  if (content.includes('hello') || content.includes('hi') || content.includes('hey')) {
    return `Hey! I'm DiscordGPT. I build Discord servers from natural language descriptions. What kind of server do you want me to create?`;
  }

  return `I'm DiscordGPT, your Discord server builder. Describe the server you want and I'll create the full structure — categories, channels, roles, and permissions.\n\nFor example:\n- "Create a Minecraft hosting server called MineVo"\n- "Build a gaming community with LFG and voice channels"\n- "Generate a professional support server with tickets"`;
}

async function generateConversationTitle(userMessage) {
  const db = require('../database');
  let provider;
  try {
    provider = await db.getActiveAiProvider();
  } catch (e) {}

  const titlePrompt = [
    { role: 'system', content: 'Generate a short conversation title (max 50 chars) based on the user\'s first message. Reply with ONLY the title, no quotes, no punctuation at the end.' },
    { role: 'user', content: userMessage }
  ];

  if (provider && provider.api_key) {
    try {
      const response = await callProviderAPI(provider, titlePrompt);
      const cleaned = response.replace(/^["']|["']$/g, '').trim();
      if (cleaned.length > 0 && cleaned.length <= 80) return cleaned;
    } catch (e) {}
  }

  if (process.env.AI_API_KEY && process.env.AI_API_KEY !== 'your-ai-api-key') {
    try {
      const response = await callProviderAPI({
        provider: 'openai',
        api_key: process.env.AI_API_KEY,
        models: ['gpt-3.5-turbo']
      }, titlePrompt);
      const cleaned = response.replace(/^["']|["']$/g, '').trim();
      if (cleaned.length > 0 && cleaned.length <= 80) return cleaned;
    } catch (e) {}
  }

  return userMessage.length > 60 ? userMessage.substring(0, 60) + '...' : userMessage;
}

module.exports = {
  generateBlueprint,
  generateChatResponse,
  generateConversationTitle,
  extractServerName,
  extractThemes
};
