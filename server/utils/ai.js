function generateBlueprint(prompt) {
  const lowerPrompt = prompt.toLowerCase();
  const serverName = extractServerName(prompt);
  const serverType = detectServerType(lowerPrompt);

  const categories = generateCategories(serverType, lowerPrompt);
  const roles = generateRoles(serverType, lowerPrompt);
  const structure = buildStructure(serverName, categories, roles);

  return structure;
}

function extractServerName(prompt) {
  const patterns = [
    /create\s+(?:a\s+)?(?:server|discord|community)\s+(?:called|named|for|about|related)\s+["']?([^"']+?)["']?\s*(?:\.|$|,)/i,
    /create\s+["']?([^"']+?)["']?\s+(?:server|community|discord)/i,
    /(?:server|community|discord)\s+(?:called|named)\s+["']?([^"']+?)["']?\s*(?:\.|$|,)/i,
    /["']([^"']+)["']/
  ];

  for (const pattern of patterns) {
    const match = prompt.match(pattern);
    if (match && match[1].trim().length > 0) {
      return match[1].trim().substring(0, 50);
    }
  }

  const stopWords = /^(?:create|a|an|the|server|discord|community|for|about|called|named|template|called|make|build|generate|called)$/i;
  const words = prompt.split(/\s+/).filter(w => !stopWords.test(w) && w.length > 2);
  const nameWords = words.slice(0, 3);
  return nameWords.length > 0 ? nameWords.join(' ') : 'My Server';
}

function detectServerType(prompt) {
  const types = {
    gaming: ['gaming', 'game', 'play', 'esport', 'esports', 'stream', 'twitch', 'youtube', 'fps', 'rpg', 'mmo', 'battle', 'pvp', 'competitive', 'tournament', 'lfg', 'valorant', 'fortnite', 'minecraft', 'league', 'cs2', 'apex'],
    support: ['support', 'help', 'ticket', 'customer', 'service', 'helpdesk', 'tech support', 'issue', 'bug', 'troubleshoot', 'assistance'],
    community: ['community', 'social', 'chat', 'hangout', 'friends', 'club', 'group', 'meet', 'network'],
    hosting: ['hosting', 'host', 'server', 'vps', 'dedicated', 'cloud', 'aws', 'azure', 'digitalocean', 'provider', 'infrastructure'],
    education: ['education', 'learn', 'study', 'school', 'university', 'college', 'course', 'tutorial', 'teach', 'class', 'academic'],
    development: ['dev', 'development', 'programming', 'code', 'coding', 'github', 'git', 'software', 'web', 'api', 'backend', 'frontend', 'fullstack'],
    music: ['music', 'dj', 'audio', 'sound', 'beat', 'production', 'studio', 'remix'],
    art: ['art', 'design', 'graphic', 'illustration', 'creative', 'portfolio', 'gallery', 'drawing', 'painting'],
    crypto: ['crypto', 'blockchain', 'nft', 'web3', 'defi', 'trading', 'bitcoin', 'ethereum'],
    business: ['business', 'company', 'startup', 'enterprise', 'corporate', 'professional', 'networking', 'entrepreneur'],
    store: ['store', 'shop', 'ecommerce', 'e-commerce', 'sell', 'sales', 'product', 'products', 'marketplace', 'merch', 'merchandise', 'retail', 'buy', 'purchase', 'order', 'catalog'],
    studio: ['studio', 'agency', 'creative agency', 'design agency', 'production house', 'media company'],
    restaurant: ['restaurant', 'cafe', 'coffee', 'food', 'dining', 'menu', 'pizza', 'burger', 'bakery'],
   fitness: ['fitness', 'gym', 'workout', 'health', 'wellness', 'exercise', 'training', 'sports'],
    nonprofit: ['nonprofit', 'non-profit', 'charity', 'volunteer', 'foundation', 'cause']
  };

  for (const [type, keywords] of Object.entries(types)) {
    if (keywords.some(kw => prompt.includes(kw))) {
      return type;
    }
  }

  return 'community';
}

function generateCategories(serverType, prompt) {
  const categoryTemplates = {
    gaming: [
      { name: '📋 INFORMATION', channels: [
        { name: '📌 rules', type: 'text', description: 'Server rules and guidelines' },
        { name: '📢 announcements', type: 'announcement', description: 'Important announcements' },
        { name: '👋 welcome', type: 'text', description: 'Welcome new members' }
      ]},
      { name: '💬 GENERAL', channels: [
        { name: '🔥 general-chat', type: 'text', description: 'General discussion' },
        { name: '💡 introductions', type: 'text', description: 'Introduce yourself' },
        { name: '🖼️ media', type: 'text', description: 'Share media content' },
        { name: '🎯 off-topic', type: 'text', description: 'Off-topic chat' }
      ]},
      { name: '🎮 GAMING', channels: [
        { name: '🎯 lfg', type: 'text', description: 'Looking for group' },
        { name: '💬 game-chat', type: 'text', description: 'Game discussion' },
        { name: '🎬 clips-and-highlights', type: 'text', description: 'Share your best clips' },
        { name: '📊 stats-and-scores', type: 'text', description: 'Track your stats' }
      ]},
      { name: '🏆 COMPETITIVE', channels: [
        { name: '🏅 tournament-info', type: 'text', description: 'Tournament information' },
        { name: '⚔️ team-recruitment', type: 'text', description: 'Find teammates' },
        { name: '📈 ranked-discussion', type: 'text', description: 'Competitive discussion' },
        { name: '🎲 scrims', type: 'text', description: 'Organize scrimmages' }
      ]},
      { name: '🎙️ VOICE CHANNELS', channels: [
        { name: '🔊 general-voice', type: 'voice', description: 'General voice chat' },
        { name: '🎮 gaming-session', type: 'voice', description: 'Gaming sessions' },
        { name: '🎵 music', type: 'voice', description: 'Listen to music together' },
        { name: '💤 afk', type: 'voice', description: 'AFK channel' }
      ]},
      { name: '⚙️ COMMUNITY', channels: [
        { name: '🎉 events', type: 'text', description: 'Community events' },
        { name: '💡 suggestions', type: 'text', description: 'Server suggestions' },
        { name: '🏆 hall-of-fame', type: 'text', description: 'Top achievements' }
      ]}
    ],
    support: [
      { name: '📋 INFORMATION', channels: [
        { name: '📌 rules', type: 'text', description: 'Support rules' },
        { name: '📢 announcements', type: 'announcement', description: 'System announcements' },
        { name: '❓ faq', type: 'text', description: 'Frequently asked questions' }
      ]},
      { name: '🛡️ SUPPORT', channels: [
        { name: '💬 general-support', type: 'text', description: 'General support questions' },
        { name: '🐛 bug-reports', type: 'forum', description: 'Report bugs here' },
        { name: '💡 feature-requests', type: 'forum', description: 'Request new features' },
        { name: '📝 suggestions', type: 'text', description: 'Share your suggestions' }
      ]},
      { name: '🎫 TICKETS', channels: [
        { name: '✅ open-ticket', type: 'text', description: 'Open a support ticket' }
      ]},
      { name: '💬 COMMUNITY', channels: [
        { name: '🔥 general-chat', type: 'text', description: 'General discussion' },
        { name: '🎯 off-topic', type: 'text', description: 'Off-topic chat' }
      ]},
      { name: '🎙️ VOICE CHANNELS', channels: [
        { name: '🔊 support-voice', type: 'voice', description: 'Voice support' },
        { name: '🔊 general-voice', type: 'voice', description: 'General voice chat' }
      ]}
    ],
    community: [
      { name: '📋 INFORMATION', channels: [
        { name: '📌 rules', type: 'text', description: 'Community rules' },
        { name: '📢 announcements', type: 'announcement', description: 'Important announcements' },
        { name: '👋 welcome', type: 'text', description: 'Welcome message' },
        { name: '🎭 roles', type: 'text', description: 'Self-assign roles' }
      ]},
      { name: '💬 GENERAL', channels: [
        { name: '🔥 general', type: 'text', description: 'General chat' },
        { name: '💡 introductions', type: 'text', description: 'Introduce yourself' },
        { name: '🎯 off-topic', type: 'text', description: 'Off-topic discussion' },
        { name: '😂 memes', type: 'text', description: 'Share memes' }
      ]},
      { name: '🖼️ MEDIA', channels: [
        { name: '📸 photos', type: 'text', description: 'Share photos' },
        { name: '🎬 videos', type: 'text', description: 'Share videos' },
        { name: '🎨 artwork', type: 'text', description: 'Share your art' }
      ]},
      { name: '🎉 EVENTS', channels: [
        { name: '📅 event-planning', type: 'text', description: 'Plan events' },
        { name: '📢 event-announcements', type: 'announcement', description: 'Event announcements' }
      ]},
      { name: '🎙️ VOICE CHANNELS', channels: [
        { name: '🔊 general-voice', type: 'voice', description: 'General voice chat' },
        { name: '🎵 music', type: 'voice', description: 'Listen to music together' },
        { name: '💤 afk', type: 'voice', description: 'AFK channel' }
      ]}
    ],
    hosting: [
      { name: '📋 INFORMATION', channels: [
        { name: '📌 rules', type: 'text', description: 'Server rules' },
        { name: '📢 announcements', type: 'announcement', description: 'System status' },
        { name: '💰 pricing', type: 'text', description: 'Pricing information' }
      ]},
      { name: '🛡️ SUPPORT', channels: [
        { name: '💬 general-support', type: 'text', description: 'General support' },
        { name: '🔧 technical-support', type: 'text', description: 'Technical issues' },
        { name: '💳 billing-support', type: 'text', description: 'Billing questions' }
      ]},
      { name: '⚙️ SERVICES', channels: [
        { name: '📊 service-status', type: 'text', description: 'Current service status' },
        { name: '🔧 maintenance', type: 'announcement', description: 'Maintenance schedule' },
        { name: '🆕 new-releases', type: 'announcement', description: 'New services' }
      ]},
      { name: '💬 COMMUNITY', channels: [
        { name: '🔥 general-chat', type: 'text', description: 'General chat' },
        { name: '⭐ showcase', type: 'text', description: 'Show off your projects' }
      ]},
      { name: '🎙️ VOICE CHANNELS', channels: [
        { name: '🔊 support-voice', type: 'voice', description: 'Voice support' },
        { name: '🔊 general-voice', type: 'voice', description: 'General chat' }
      ]}
    ],
    education: [
      { name: '📋 INFORMATION', channels: [
        { name: '📌 rules', type: 'text', description: 'Community guidelines' },
        { name: '📢 announcements', type: 'announcement', description: 'Course announcements' },
        { name: '📚 resources', type: 'text', description: 'Learning resources' }
      ]},
      { name: '🎓 COURSES', channels: [
        { name: '💬 course-discussion', type: 'text', description: 'Discuss courses' },
        { name: '🤝 study-groups', type: 'text', description: 'Find study partners' },
        { name: '📝 assignments', type: 'forum', description: 'Assignment help' }
      ]},
      { name: '❓ HELP', channels: [
        { name: '💡 ask-questions', type: 'text', description: 'Ask your questions' },
        { name: '🔍 code-review', type: 'text', description: 'Get code reviewed' },
        { name: '📎 resources-sharing', type: 'text', description: 'Share learning materials' }
      ]},
      { name: '💬 GENERAL', channels: [
        { name: '🔥 general-chat', type: 'text', description: 'General discussion' },
        { name: '💼 career-advice', type: 'text', description: 'Career guidance' }
      ]},
      { name: '🎙️ VOICE CHANNELS', channels: [
        { name: '📖 study-room', type: 'voice', description: 'Study together' },
        { name: '🔊 general-voice', type: 'voice', description: 'General voice chat' }
      ]}
    ],
    development: [
      { name: '📋 INFORMATION', channels: [
        { name: '📌 rules', type: 'text', description: 'Community rules' },
        { name: '📢 announcements', type: 'announcement', description: 'Announcements' },
        { name: '📚 resources', type: 'text', description: 'Useful resources' }
      ]},
      { name: '🔧 DEVELOPMENT', channels: [
        { name: '💬 general-dev', type: 'text', description: 'General development chat' },
        { name: '❓ help', type: 'forum', description: 'Get help with code' },
        { name: '⭐ show-and-tell', type: 'text', description: 'Show your projects' },
        { name: '🔍 code-review', type: 'forum', description: 'Request code reviews' }
      ]},
      { name: '💻 LANGUAGES', channels: [
        { name: '🟨 javascript', type: 'text', description: 'JavaScript discussion' },
        { name: '🐍 python', type: 'text', description: 'Python discussion' },
        { name: '🦀 rust', type: 'text', description: 'Rust discussion' },
        { name: '🌐 other-languages', type: 'text', description: 'Other languages' }
      ]},
      { name: '🚀 PROJECTS', channels: [
        { name: '💡 project-ideas', type: 'text', description: 'Share project ideas' },
        { name: '🤝 collaboration', type: 'text', description: 'Find collaborators' },
        { name: '📦 open-source', type: 'text', description: 'Open source projects' }
      ]},
      { name: '🎙️ VOICE CHANNELS', channels: [
        { name: '👨‍💻 pair-programming', type: 'voice', description: 'Code together' },
        { name: '🔊 general-voice', type: 'voice', description: 'General voice chat' }
      ]}
    ],
    music: [
      { name: '📋 INFORMATION', channels: [
        { name: '📌 rules', type: 'text', description: 'Server rules' },
        { name: '📢 announcements', type: 'announcement', description: 'Announcements' }
      ]},
      { name: '🎵 MUSIC', channels: [
        { name: '💬 music-chat', type: 'text', description: 'Music discussion' },
        { name: '🎶 share-music', type: 'text', description: 'Share your music' },
        { name: '⭐ feedback', type: 'text', description: 'Get feedback' },
        { name: '🤝 collabs', type: 'text', description: 'Find collaborators' }
      ]},
      { name: '🎛️ PRODUCTION', channels: [
        { name: '📝 production-tips', type: 'text', description: 'Production tips' },
        { name: '🎵 sample-pack', type: 'text', description: 'Share samples' },
        { name: '🎛️ gear-talk', type: 'text', description: 'Discuss gear' }
      ]},
      { name: '🎙️ VOICE CHANNELS', channels: [
        { name: '🎧 listening-session', type: 'voice', description: 'Listen together' },
        { name: '🎹 collab-studio', type: 'voice', description: 'Collaborate on music' }
      ]}
    ],
    art: [
      { name: '📋 INFORMATION', channels: [
        { name: '📌 rules', type: 'text', description: 'Community rules' },
        { name: '📢 announcements', type: 'announcement', description: 'Announcements' }
      ]},
      { name: '🎨 ART', channels: [
        { name: '🖼️ gallery', type: 'text', description: 'Share your art' },
        { name: '⭐ feedback', type: 'text', description: 'Get feedback' },
        { name: '🖌️ wip', type: 'text', description: 'Work in progress' },
        { name: '📚 art-resources', type: 'text', description: 'Art resources and tutorials' }
      ]},
      { name: '💬 DISCUSSION', channels: [
        { name: '🔥 general-chat', type: 'text', description: 'General discussion' },
        { name: '💡 inspiration', type: 'text', description: 'Share inspiration' },
        { name: '🔍 critiques', type: 'forum', description: 'Request detailed critiques' }
      ]},
      { name: '🎙️ VOICE CHANNELS', channels: [
        { name: '🎨 art-stream', type: 'voice', description: 'Stream your art process' },
        { name: '🔊 general-voice', type: 'voice', description: 'General voice chat' }
      ]}
    ],
    crypto: [
      { name: '📋 INFORMATION', channels: [
        { name: '📌 rules', type: 'text', description: 'Community rules' },
        { name: '📢 announcements', type: 'announcement', description: 'Important announcements' },
        { name: '⚠️ disclaimer', type: 'text', description: 'Financial disclaimer' }
      ]},
      { name: '📈 TRADING', channels: [
        { name: '💬 market-chat', type: 'text', description: 'Market discussion' },
        { name: '🎯 trading-signals', type: 'text', description: 'Trading signals' },
        { name: '📊 chart-analysis', type: 'text', description: 'Share charts' }
      ]},
      { name: '🪙 CRYPTO', channels: [
        { name: '₿ bitcoin', type: 'text', description: 'Bitcoin discussion' },
        { name: '💎 altcoins', type: 'text', description: 'Altcoin discussion' },
        { name: '🏦 defi', type: 'text', description: 'DeFi discussion' },
        { name: '🖼️ nft', type: 'text', description: 'NFT discussion' }
      ]},
      { name: '🎙️ VOICE CHANNELS', channels: [
        { name: '📈 trading-floor', type: 'voice', description: 'Voice trading chat' },
        { name: '🔊 general-voice', type: 'voice', description: 'General voice chat' }
      ]}
    ],
    business: [
      { name: '📋 INFORMATION', channels: [
        { name: '📌 rules', type: 'text', description: 'Community guidelines' },
        { name: '📢 announcements', type: 'announcement', description: 'Announcements' },
        { name: '🏢 about-us', type: 'text', description: 'About the company' }
      ]},
      { name: '💼 BUSINESS', channels: [
        { name: '💬 general-business', type: 'text', description: 'Business discussion' },
        { name: '🤝 networking', type: 'text', description: 'Network with others' },
        { name: '📋 job-board', type: 'forum', description: 'Post job opportunities' },
        { name: '🤝 partnerships', type: 'text', description: 'Find partners' }
      ]},
      { name: '📚 RESOURCES', channels: [
        { name: '📖 articles', type: 'text', description: 'Share articles' },
        { name: '🛠️ tools', type: 'text', description: 'Business tools' },
        { name: '💡 ask-experts', type: 'text', description: 'Ask experienced entrepreneurs' }
      ]},
      { name: '🎙️ VOICE CHANNELS', channels: [
        { name: '🤝 networking-voice', type: 'voice', description: 'Voice networking' },
        { name: '🔊 general-voice', type: 'voice', description: 'General voice chat' }
      ]}
    ],
    store: [
      { name: '📋 INFORMATION', channels: [
        { name: '📌 rules', type: 'text', description: 'Store rules and policies' },
        { name: '📢 announcements', type: 'announcement', description: 'Sales, new products, updates' },
        { name: '👋 welcome', type: 'text', description: 'Welcome new customers' }
      ]},
      { name: '🛒 SHOP', channels: [
        { name: '🛍️ products', type: 'text', description: 'Browse our products' },
        { name: '🆕 new-releases', type: 'announcement', description: 'New product drops' },
        { name: '🏷️ deals-and-offers', type: 'text', description: 'Current deals and discounts' },
        { name: '❓ product-questions', type: 'forum', description: 'Ask about products' }
      ]},
      { name: '🛡️ SUPPORT', channels: [
        { name: '📦 order-support', type: 'text', description: 'Help with orders' },
        { name: '🚚 shipping-info', type: 'text', description: 'Shipping and delivery questions' },
        { name: '🔄 returns-and-refunds', type: 'text', description: 'Return and refund requests' },
        { name: '❓ faq', type: 'text', description: 'Frequently asked questions' }
      ]},
      { name: '💬 COMMUNITY', channels: [
        { name: '🔥 general-chat', type: 'text', description: 'Chat with other customers' },
        { name: '⭐ reviews', type: 'text', description: 'Share your reviews' },
        { name: '📸 showcase', type: 'text', description: 'Show off your purchases' }
      ]},
      { name: '🎙️ VOICE CHANNELS', channels: [
        { name: '🛒 shopping-help', type: 'voice', description: 'Get live help' },
        { name: '🔊 general-voice', type: 'voice', description: 'General chat' }
      ]}
    ],
    studio: [
      { name: '📋 INFORMATION', channels: [
        { name: '📌 rules', type: 'text', description: 'Community guidelines' },
        { name: '📢 announcements', type: 'announcement', description: 'Studio updates' },
        { name: '🏆 portfolio', type: 'text', description: 'Our work' }
      ]},
      { name: '🚀 PROJECTS', channels: [
        { name: '🔥 active-projects', type: 'text', description: 'Current projects' },
        { name: '⭐ project-showcase', type: 'text', description: 'Show completed work' },
        { name: '💬 feedback', type: 'forum', description: 'Get feedback on work' },
        { name: '🤝 collaboration', type: 'text', description: 'Find collaborators' }
      ]},
      { name: '💬 DISCUSSION', channels: [
        { name: '🔥 general-chat', type: 'text', description: 'General discussion' },
        { name: '💡 tips-and-tricks', type: 'text', description: 'Share techniques' },
        { name: '📚 resources', type: 'text', description: 'Useful resources' }
      ]},
      { name: '🎙️ VOICE CHANNELS', channels: [
        { name: '🎬 studio-live', type: 'voice', description: 'Live sessions' },
        { name: '🔊 general-voice', type: 'voice', description: 'General chat' }
      ]}
    ],
    restaurant: [
      { name: '📋 INFORMATION', channels: [
        { name: '📌 rules', type: 'text', description: 'Server rules' },
        { name: '📢 announcements', type: 'announcement', description: 'Specials and events' },
        { name: '🍽️ menu', type: 'text', description: 'Our menu' }
      ]},
      { name: '🛒 ORDERING', channels: [
        { name: '📝 place-order', type: 'text', description: 'Place your order' },
        { name: '📊 order-status', type: 'text', description: 'Check order status' },
        { name: '📝 special-requests', type: 'text', description: 'Dietary needs and modifications' }
      ]},
      { name: '💬 COMMUNITY', channels: [
        { name: '🔥 general-chat', type: 'text', description: 'Chat with us' },
        { name: '⭐ reviews', type: 'text', description: 'Share your experience' },
        { name: '📸 photos', type: 'text', description: 'Share food photos' }
      ]},
      { name: '🎙️ VOICE CHANNELS', channels: [
        { name: '🛒 order-help', type: 'voice', description: 'Need help ordering?' },
        { name: '🔊 general-voice', type: 'voice', description: 'General chat' }
      ]}
    ],
    fitness: [
      { name: '📋 INFORMATION', channels: [
        { name: '📌 rules', type: 'text', description: 'Community guidelines' },
        { name: '📢 announcements', type: 'announcement', description: 'Class schedules and updates' },
        { name: '👋 welcome', type: 'text', description: 'Welcome new members' }
      ]},
      { name: '💪 WORKOUTS', channels: [
        { name: '🔥 daily-workout', type: 'text', description: "Today's workout" },
        { name: '📋 workout-plans', type: 'text', description: 'Training programs' },
        { name: '✅ form-check', type: 'forum', description: 'Get form feedback' },
        { name: '📈 progress', type: 'text', description: 'Share your progress' }
      ]},
      { name: '🥗 NUTRITION', channels: [
        { name: '📋 meal-plans', type: 'text', description: 'Meal planning' },
        { name: '🍳 recipes', type: 'text', description: 'Healthy recipes' },
        { name: '💊 supplements', type: 'text', description: 'Supplement discussion' }
      ]},
      { name: '💬 COMMUNITY', channels: [
        { name: '🔥 general-chat', type: 'text', description: 'General chat' },
        { name: '💪 motivation', type: 'text', description: 'Stay motivated' }
      ]},
      { name: '🎙️ VOICE CHANNELS', channels: [
        { name: '🏋️ workout-together', type: 'voice', description: 'Train together' },
        { name: '🔊 general-voice', type: 'voice', description: 'General chat' }
      ]}
    ],
    nonprofit: [
      { name: '📋 INFORMATION', channels: [
        { name: '📌 rules', type: 'text', description: 'Community guidelines' },
        { name: '📢 announcements', type: 'announcement', description: 'Organization updates' },
        { name: '❤️ about-us', type: 'text', description: 'Our mission' }
      ]},
      { name: '🤝 VOLUNTEERS', channels: [
        { name: '✋ volunteer-signup', type: 'text', description: 'Sign up to volunteer' },
        { name: '📅 events', type: 'text', description: 'Upcoming events' },
        { name: '📋 coordination', type: 'text', description: 'Organize activities' }
      ]},
      { name: '💬 COMMUNITY', channels: [
        { name: '🔥 general-chat', type: 'text', description: 'General discussion' },
        { name: '⭐ success-stories', type: 'text', description: 'Share impact stories' },
        { name: '📚 resources', type: 'text', description: 'Helpful resources' }
      ]},
      { name: '🎙️ VOICE CHANNELS', channels: [
        { name: '🏢 meeting-room', type: 'voice', description: 'Team meetings' },
        { name: '🔊 general-voice', type: 'voice', description: 'General chat' }
      ]}
    ]
  };

  return categoryTemplates[serverType] || categoryTemplates.community;
}

function generateRoles(serverType, prompt) {
  const baseRoles = [
    { name: '👑 Owner', color: '#FF0000', permissions: ['Administrator'], mentionable: false, hoist: true },
    { name: '⚡ Admin', color: '#E74C3C', permissions: ['Administrator'], mentionable: true, hoist: true },
    { name: '🛡️ Moderator', color: '#F1C40F', permissions: ['ManageMessages', 'KickMembers', 'BanMembers', 'ManageChannels', 'ManageThreads'], mentionable: true, hoist: true },
    { name: '🤝 Helper', color: '#3498DB', permissions: ['ManageMessages', 'SendMessages', 'ReadMessageHistory', 'ManageThreads'], mentionable: true, hoist: true },
    { name: '💎 VIP', color: '#9B59B6', permissions: ['SendMessages', 'ReadMessageHistory', 'Connect', 'Speak', 'UseExternalEmojis'], mentionable: false, hoist: true },
    { name: '⭐ Member', color: '#2ECC71', permissions: ['SendMessages', 'ReadMessageHistory', 'Connect', 'Speak', 'AddReactions', 'AttachFiles'], mentionable: false, hoist: false },
    { name: '🌱 Newcomer', color: '#95A5A6', permissions: ['ReadMessageHistory', 'ViewChannel'], mentionable: false, hoist: false },
    { name: '🎖️ Booster', color: '#FF73FA', permissions: ['SendMessages', 'ReadMessageHistory', 'Connect', 'Speak', 'UseExternalEmojis', 'ChangeNickname'], mentionable: false, hoist: true }
  ];

  if (serverType === 'gaming') {
    baseRoles.splice(4, 0,
      { name: '🎮 Pro Player', color: '#FF4500', permissions: ['SendMessages', 'ReadMessageHistory', 'Connect', 'Speak', 'UseExternalEmojis'], mentionable: true, hoist: true },
      { name: '🏆 Champion', color: '#DAA520', permissions: ['SendMessages', 'ReadMessageHistory', 'Connect', 'Speak'], mentionable: false, hoist: true }
    );
  } else if (serverType === 'support') {
    baseRoles.splice(4, 0,
      { name: '🔧 Support Agent', color: '#00CED1', permissions: ['ManageMessages', 'SendMessages', 'ReadMessageHistory', 'Connect', 'Speak', 'ManageThreads'], mentionable: true, hoist: true },
      { name: '🎫 Ticket Staff', color: '#FF69B4', permissions: ['ManageMessages', 'SendMessages', 'ReadMessageHistory'], mentionable: true, hoist: false }
    );
  } else if (serverType === 'development') {
    baseRoles.splice(4, 0,
      { name: '🧑‍💻 Senior Dev', color: '#7C3AED', permissions: ['ManageMessages', 'SendMessages', 'ReadMessageHistory', 'Connect', 'Speak', 'ManageThreads'], mentionable: true, hoist: true },
      { name: '🔧 Contributor', color: '#10B981', permissions: ['SendMessages', 'ReadMessageHistory', 'Connect'], mentionable: true, hoist: false }
    );
  } else if (serverType === 'education') {
    baseRoles.splice(4, 0,
      { name: '🎓 Instructor', color: '#8B5CF6', permissions: ['ManageMessages', 'SendMessages', 'ReadMessageHistory', 'ManageThreads'], mentionable: true, hoist: true },
      { name: '📚 Teaching Assistant', color: '#06B6D4', permissions: ['ManageMessages', 'SendMessages', 'ReadMessageHistory'], mentionable: true, hoist: false }
    );
  } else if (serverType === 'music') {
    baseRoles.splice(4, 0,
      { name: '🎵 DJ', color: '#E040FB', permissions: ['SendMessages', 'ReadMessageHistory', 'Connect', 'Speak', 'UseVoiceActivity'], mentionable: true, hoist: true },
      { name: '🎧 Listener', color: '#448AFF', permissions: ['SendMessages', 'ReadMessageHistory', 'Connect'], mentionable: false, hoist: false }
    );
  } else if (serverType === 'business') {
    baseRoles.splice(4, 0,
      { name: '💼 Manager', color: '#1565C0', permissions: ['ManageMessages', 'SendMessages', 'ReadMessageHistory', 'ManageChannels'], mentionable: true, hoist: true },
      { name: '🤝 Partner', color: '#00897B', permissions: ['SendMessages', 'ReadMessageHistory', 'Connect', 'Speak'], mentionable: false, hoist: false }
    );
  }

  return baseRoles;
}

function buildStructure(serverName, categories, roles) {
  const categoryObjects = categories.map(cat => ({
    name: cat.name,
    channels: cat.channels.map(ch => ({
      name: ch.name,
      type: ch.type,
      topic: ch.description || '',
      nsfw: false
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
    content: `You are DiscordGPT, the world's #1 Discord server architect. You design ENTERPRISE-GRADE, PREMIUM Discord server structures used by communities with 100K+ members. You think like a top-tier community manager, UX designer, and Discord power-user combined.

WHEN A USER ASKS TO CREATE/MAKE/BUILD/GENERATE A SERVER:
You MUST respond with ONLY a JSON blueprint inside a \`\`\`json code block. No explanation before or after.

PROFESSIONAL STRUCTURE RULES:
- Create 6-8 categories with 3-6 channels each (20-40 channels total)
- EVERY category name MUST have an emoji prefix: 📋 INFORMATION, 💬 GENERAL, 🎮 GAMING, 🎵 MUSIC, 🎨 CREATIVE, 💼 BUSINESS, 🔧 DEVELOPMENT, 🎓 EDUCATION, 🛡️ SUPPORT, 🏆 COMPETITIVE, 🎉 EVENTS, 🎙️ VOICE, 🛒 STORE, 📢 ANNOUNCEMENTS, 💡 IDEAS, 🤝 NETWORKING, 📊 ANALYTICS, 🔒 STAFF, ⭐ VIP
- EVERY channel name MUST have an emoji prefix matching its purpose
- Every channel MUST have a detailed description (2-3 sentences explaining purpose, rules, and usage)
- Use varied channel types: text, voice, announcement, forum
- Include slowmode hints in descriptions for busy channels

ROLE HIERARCHY (7-8 roles with emoji prefixes):
- 👑 Owner — #FF0000 — Administrator, not mentioned, displayed separately
- ⚡ Admin — #E74C3C — Full admin permissions, mentioned, displayed
- 🛡️ Moderator — #F1C40F — Manage messages, kick, ban, mentioned, displayed
- 🤝 Helper — #3498DB — Help users, manage messages in help channels, mentioned, displayed
- 💎 VIP — #9B59B6 — Special access, recognized members, displayed
- ⭐ Member — #2ECC71 — Standard permissions, not displayed separately
- 🌱 Newcomer — #95A5A6 — Limited permissions, must verify, not displayed
- 🎖️ Booster — #FF73FA — Server boosters, special perks, displayed

SETTINGS TO INCLUDE:
- verificationLevel: "medium" or "high"
- defaultMessageNotifications: "only_mentions" for large servers
- explicitContentFilter: "all_members"
- afkTimeout: 300
- systemChannelFlags: ["SUPPRESS_JOIN_NOTIFICATIONS"]
- premiumTier: "TIER_2" if server has 50+ boosts worth

CHANNEL DESCRIPTIONS SHOULD BE PROFESSIONAL:
❌ Bad: "General chat"
✅ Good: "The heart of our community — discuss anything and everything. Keep it respectful, no spam, no NSFW."

❌ Bad: "Rules channel"  
✅ Good: "📋 Read before posting. Breaking rules = warning → mute → ban. Staff decisions are final."

RESPOND WITH ONLY THIS JSON:
\`\`\`json
{
  "serverName": "Professional Server Name",
  "description": "A compelling 1-2 sentence tagline that excites new members",
  "categories": [
    {
      "name": "📋 CATEGORY NAME",
      "channels": [
        { "name": "📌 channel-name", "type": "text", "description": "Detailed 2-3 sentence description of channel purpose, rules, and expected behavior" },
        { "name": "🔊 voice-name", "type": "voice", "description": "What this voice channel is for" },
        { "name": "📢 announcements", "type": "announcement", "description": "Official updates only — staff post here" },
        { "name": "💭 forum-channel", "type": "forum", "description": "Community discussions with threads" }
      ]
    }
  ],
  "roles": [
    { "name": "👑 Owner", "color": "#FF0000", "permissions": ["Administrator"], "mentionable": false, "hoist": true },
    { "name": "⚡ Admin", "color": "#E74C3C", "permissions": ["Administrator"], "mentionable": true, "hoist": true },
    { "name": "🛡️ Moderator", "color": "#F1C40F", "permissions": ["ManageMessages", "KickMembers", "BanMembers", "ManageChannels", "ManageThreads"], "mentionable": true, "hoist": true },
    { "name": "🤝 Helper", "color": "#3498DB", "permissions": ["ManageMessages", "SendMessages", "ReadMessageHistory", "ManageThreads"], "mentionable": true, "hoist": true },
    { "name": "💎 VIP", "color": "#9B59B6", "permissions": ["SendMessages", "ReadMessageHistory", "Connect", "Speak", "UseExternalEmojis"], "mentionable": false, "hoist": true },
    { "name": "⭐ Member", "color": "#2ECC71", "permissions": ["SendMessages", "ReadMessageHistory", "Connect", "Speak", "AddReactions", "AttachFiles"], "mentionable": false, "hoist": false },
    { "name": "🌱 Newcomer", "color": "#95A5A6", "permissions": ["ReadMessageHistory", "ViewChannel"], "mentionable": false, "hoist": false },
    { "name": "🎖️ Booster", "color": "#FF73FA", "permissions": ["SendMessages", "ReadMessageHistory", "Connect", "Speak", "UseExternalEmojis", "ChangeNickname"], "mentionable": false, "hoist": true }
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

FOR NON-SERVER REQUESTS: Respond normally as a helpful, friendly assistant. You can help with Discord tips, server management advice, community building strategies, etc.`
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

  const fallbackModels = [model, 'gemini-3.1-flash-lite', 'gemini-3.1-flash-lite', 'gemini-3.5-flash'].filter(Boolean);
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

module.exports = {
  generateBlueprint,
  generateChatResponse,
  extractServerName,
  detectServerType
};
