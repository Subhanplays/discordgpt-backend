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
      { name: 'INFORMATION', channels: [
        { name: 'rules', type: 'text', description: 'Server rules and guidelines' },
        { name: 'announcements', type: 'announcement', description: 'Important announcements' },
        { name: 'welcome', type: 'text', description: 'Welcome new members' }
      ]},
      { name: 'GENERAL', channels: [
        { name: 'general-chat', type: 'text', description: 'General discussion' },
        { name: 'introductions', type: 'text', description: 'Introduce yourself' },
        { name: 'media', type: 'text', description: 'Share media content' }
      ]},
      { name: 'GAMING', channels: [
        { name: 'lfg', type: 'text', description: 'Looking for group' },
        { name: 'game-chat', type: 'text', description: 'Game discussion' },
        { name: 'clips-and-highlights', type: 'text', description: 'Share your best clips' },
        { name: 'gaming-voice', type: 'voice', description: 'Voice chat for gaming' }
      ]},
      { name: 'COMPETITIVE', channels: [
        { name: 'tournament-info', type: 'text', description: 'Tournament information' },
        { name: 'team-recruitment', type: 'text', description: 'Find teammates' },
        { name: 'ranked-discussion', type: 'text', description: 'Competitive discussion' }
      ]},
      { name: 'VOICE CHANNELS', channels: [
        { name: 'General Voice', type: 'voice', description: 'General voice chat' },
        { name: 'Gaming Session', type: 'voice', description: 'Gaming sessions' },
        { name: 'AFK', type: 'voice', description: 'AFK channel' }
      ]}
    ],
    support: [
      { name: 'INFORMATION', channels: [
        { name: 'rules', type: 'text', description: 'Support rules' },
        { name: 'announcements', type: 'announcement', description: 'System announcements' },
        { name: 'faq', type: 'text', description: 'Frequently asked questions' }
      ]},
      { name: 'SUPPORT', channels: [
        { name: 'general-support', type: 'text', description: 'General support questions' },
        { name: 'bug-reports', type: 'forum', description: 'Report bugs here' },
        { name: 'feature-requests', type: 'forum', description: 'Request new features' },
        { name: 'suggestions', type: 'text', description: 'Share your suggestions' }
      ]},
      { name: 'TICKETS', channels: [
        { name: 'open-ticket', type: 'text', description: 'Open a support ticket' }
      ]},
      { name: 'COMMUNITY', channels: [
        { name: 'general-chat', type: 'text', description: 'General discussion' },
        { name: 'off-topic', type: 'text', description: 'Off-topic chat' }
      ]},
      { name: 'VOICE CHANNELS', channels: [
        { name: 'Support Voice', type: 'voice', description: 'Voice support' },
        { name: 'General Voice', type: 'voice', description: 'General voice chat' }
      ]}
    ],
    community: [
      { name: 'INFORMATION', channels: [
        { name: 'rules', type: 'text', description: 'Community rules' },
        { name: 'announcements', type: 'announcement', description: 'Important announcements' },
        { name: 'welcome', type: 'text', description: 'Welcome message' },
        { name: 'roles', type: 'text', description: 'Self-assign roles' }
      ]},
      { name: 'GENERAL', channels: [
        { name: 'general', type: 'text', description: 'General chat' },
        { name: 'introductions', type: 'text', description: 'Introduce yourself' },
        { name: 'off-topic', type: 'text', description: 'Off-topic discussion' },
        { name: 'memes', type: 'text', description: 'Share memes' }
      ]},
      { name: 'MEDIA', channels: [
        { name: 'photos', type: 'text', description: 'Share photos' },
        { name: 'videos', type: 'text', description: 'Share videos' },
        { name: 'artwork', type: 'text', description: 'Share your art' }
      ]},
      { name: 'EVENTS', channels: [
        { name: 'event-planning', type: 'text', description: 'Plan events' },
        { name: 'event-announcements', type: 'announcement', description: 'Event announcements' }
      ]},
      { name: 'VOICE CHANNELS', channels: [
        { name: 'General Voice', type: 'voice', description: 'General voice chat' },
        { name: 'Music', type: 'voice', description: 'Listen to music together' },
        { name: 'AFK', type: 'voice', description: 'AFK channel' }
      ]}
    ],
    hosting: [
      { name: 'INFORMATION', channels: [
        { name: 'rules', type: 'text', description: 'Server rules' },
        { name: 'announcements', type: 'announcement', description: 'System status' },
        { name: 'pricing', type: 'text', description: 'Pricing information' }
      ]},
      { name: 'SUPPORT', channels: [
        { name: 'general-support', type: 'text', description: 'General support' },
        { name: 'technical-support', type: 'text', description: 'Technical issues' },
        { name: 'billing-support', type: 'text', description: 'Billing questions' }
      ]},
      { name: 'SERVICES', channels: [
        { name: 'service-status', type: 'text', description: 'Current service status' },
        { name: 'maintenance', type: 'announcement', description: 'Maintenance schedule' },
        { name: 'new-releases', type: 'announcement', description: 'New services' }
      ]},
      { name: 'COMMUNITY', channels: [
        { name: 'general-chat', type: 'text', description: 'General chat' },
        { name: 'showcase', type: 'text', description: 'Show off your projects' }
      ]},
      { name: 'VOICE CHANNELS', channels: [
        { name: 'Support Voice', type: 'voice', description: 'Voice support' },
        { name: 'General Voice', type: 'voice', description: 'General chat' }
      ]}
    ],
    education: [
      { name: 'INFORMATION', channels: [
        { name: 'rules', type: 'text', description: 'Community guidelines' },
        { name: 'announcements', type: 'announcement', description: 'Course announcements' },
        { name: 'resources', type: 'text', description: 'Learning resources' }
      ]},
      { name: 'COURSES', channels: [
        { name: 'course-discussion', type: 'text', description: 'Discuss courses' },
        { name: 'study-groups', type: 'text', description: 'Find study partners' },
        { name: 'assignments', type: 'forum', description: 'Assignment help' }
      ]},
      { name: 'HELP', channels: [
        { name: 'ask-questions', type: 'text', description: 'Ask your questions' },
        { name: 'code-review', type: 'text', description: 'Get code reviewed' },
        { name: 'resources-sharing', type: 'text', description: 'Share learning materials' }
      ]},
      { name: 'GENERAL', channels: [
        { name: 'general-chat', type: 'text', description: 'General discussion' },
        { name: 'career-advice', type: 'text', description: 'Career guidance' }
      ]},
      { name: 'VOICE CHANNELS', channels: [
        { name: 'Study Room', type: 'voice', description: 'Study together' },
        { name: 'General Voice', type: 'voice', description: 'General voice chat' }
      ]}
    ],
    development: [
      { name: 'INFORMATION', channels: [
        { name: 'rules', type: 'text', description: 'Community rules' },
        { name: 'announcements', type: 'announcement', description: 'Announcements' },
        { name: 'resources', type: 'text', description: 'Useful resources' }
      ]},
      { name: 'DEVELOPMENT', channels: [
        { name: 'general-dev', type: 'text', description: 'General development chat' },
        { name: 'help', type: 'forum', description: 'Get help with code' },
        { name: 'show-and-tell', type: 'text', description: 'Show your projects' },
        { name: 'code-review', type: 'forum', description: 'Request code reviews' }
      ]},
      { name: 'LANGUAGES', channels: [
        { name: 'javascript', type: 'text', description: 'JavaScript discussion' },
        { name: 'python', type: 'text', description: 'Python discussion' },
        { name: 'rust', type: 'text', description: 'Rust discussion' },
        { name: 'other-languages', type: 'text', description: 'Other languages' }
      ]},
      { name: 'PROJECTS', channels: [
        { name: 'project-ideas', type: 'text', description: 'Share project ideas' },
        { name: 'collaboration', type: 'text', description: 'Find collaborators' },
        { name: 'open-source', type: 'text', description: 'Open source projects' }
      ]},
      { name: 'VOICE CHANNELS', channels: [
        { name: 'Pair Programming', type: 'voice', description: 'Code together' },
        { name: 'General Voice', type: 'voice', description: 'General voice chat' }
      ]}
    ],
    music: [
      { name: 'INFORMATION', channels: [
        { name: 'rules', type: 'text', description: 'Server rules' },
        { name: 'announcements', type: 'announcement', description: 'Announcements' }
      ]},
      { name: 'MUSIC', channels: [
        { name: 'music-chat', type: 'text', description: 'Music discussion' },
        { name: 'share-music', type: 'text', description: 'Share your music' },
        { name: 'feedback', type: 'text', description: 'Get feedback' },
        { name: 'collabs', type: 'text', description: 'Find collaborators' }
      ]},
      { name: 'PRODUCTION', channels: [
        { name: 'production-tips', type: 'text', description: 'Production tips' },
        { name: 'sample-pack', type: 'text', description: 'Share samples' },
        { name: 'gear-talk', type: 'text', description: 'Discuss gear' }
      ]},
      { name: 'VOICE CHANNELS', channels: [
        { name: 'Listening Session', type: 'voice', description: 'Listen together' },
        { name: 'Collab Studio', type: 'voice', description: 'Collaborate on music' }
      ]}
    ],
    art: [
      { name: 'INFORMATION', channels: [
        { name: 'rules', type: 'text', description: 'Community rules' },
        { name: 'announcements', type: 'announcement', description: 'Announcements' }
      ]},
      { name: 'ART', channels: [
        { name: 'gallery', type: 'text', description: 'Share your art' },
        { name: 'feedback', type: 'text', description: 'Get feedback' },
        { name: 'wip', type: 'text', description: 'Work in progress' },
        { name: 'art-resources', type: 'text', description: 'Art resources and tutorials' }
      ]},
      { name: 'DISCUSSION', channels: [
        { name: 'general-chat', type: 'text', description: 'General discussion' },
        { name: 'inspiration', type: 'text', description: 'Share inspiration' },
        { name: 'critiques', type: 'forum', description: 'Request detailed critiques' }
      ]},
      { name: 'VOICE CHANNELS', channels: [
        { name: 'Art Stream', type: 'voice', description: 'Stream your art process' },
        { name: 'General Voice', type: 'voice', description: 'General voice chat' }
      ]}
    ],
    crypto: [
      { name: 'INFORMATION', channels: [
        { name: 'rules', type: 'text', description: 'Community rules' },
        { name: 'announcements', type: 'announcement', description: 'Important announcements' },
        { name: 'disclaimer', type: 'text', description: 'Financial disclaimer' }
      ]},
      { name: 'TRADING', channels: [
        { name: 'market-chat', type: 'text', description: 'Market discussion' },
        { name: 'trading-signals', type: 'text', description: 'Trading signals' },
        { name: 'chart-analysis', type: 'text', description: 'Share charts' }
      ]},
      { name: 'CRYPTO', channels: [
        { name: 'bitcoin', type: 'text', description: 'Bitcoin discussion' },
        { name: 'altcoins', type: 'text', description: 'Altcoin discussion' },
        { name: 'defi', type: 'text', description: 'DeFi discussion' },
        { name: 'nft', type: 'text', description: 'NFT discussion' }
      ]},
      { name: 'VOICE CHANNELS', channels: [
        { name: 'Trading Floor', type: 'voice', description: 'Voice trading chat' },
        { name: 'General Voice', type: 'voice', description: 'General voice chat' }
      ]}
    ],
    business: [
      { name: 'INFORMATION', channels: [
        { name: 'rules', type: 'text', description: 'Community guidelines' },
        { name: 'announcements', type: 'announcement', description: 'Announcements' },
        { name: 'about-us', type: 'text', description: 'About the company' }
      ]},
      { name: 'BUSINESS', channels: [
        { name: 'general-business', type: 'text', description: 'Business discussion' },
        { name: 'networking', type: 'text', description: 'Network with others' },
        { name: 'job-board', type: 'forum', description: 'Post job opportunities' },
        { name: 'partnerships', type: 'text', description: 'Find partners' }
      ]},
      { name: 'RESOURCES', channels: [
        { name: 'articles', type: 'text', description: 'Share articles' },
        { name: 'tools', type: 'text', description: 'Business tools' },
        { name: 'ask-experts', type: 'text', description: 'Ask experienced entrepreneurs' }
      ]},
      { name: 'VOICE CHANNELS', channels: [
        { name: 'Networking Voice', type: 'voice', description: 'Voice networking' },
        { name: 'General Voice', type: 'voice', description: 'General voice chat' }
      ]}
    ],
    store: [
      { name: 'INFORMATION', channels: [
        { name: 'rules', type: 'text', description: 'Store rules and policies' },
        { name: 'announcements', type: 'announcement', description: 'Sales, new products, updates' },
        { name: 'welcome', type: 'text', description: 'Welcome new customers' }
      ]},
      { name: 'SHOP', channels: [
        { name: 'products', type: 'text', description: 'Browse our products' },
        { name: 'new-releases', type: 'announcement', description: 'New product drops' },
        { name: 'deals-and-offers', type: 'text', description: 'Current deals and discounts' },
        { name: 'product-questions', type: 'forum', description: 'Ask about products' }
      ]},
      { name: 'SUPPORT', channels: [
        { name: 'order-support', type: 'text', description: 'Help with orders' },
        { name: 'shipping-info', type: 'text', description: 'Shipping and delivery questions' },
        { name: 'returns-and-refunds', type: 'text', description: 'Return and refund requests' },
        { name: 'faq', type: 'text', description: 'Frequently asked questions' }
      ]},
      { name: 'COMMUNITY', channels: [
        { name: 'general-chat', type: 'text', description: 'Chat with other customers' },
        { name: 'reviews', type: 'text', description: 'Share your reviews' },
        { name: 'showcase', type: 'text', description: 'Show off your purchases' }
      ]},
      { name: 'VOICE CHANNELS', channels: [
        { name: 'Shopping Help', type: 'voice', description: 'Get live help' },
        { name: 'General Voice', type: 'voice', description: 'General chat' }
      ]}
    ],
    studio: [
      { name: 'INFORMATION', channels: [
        { name: 'rules', type: 'text', description: 'Community guidelines' },
        { name: 'announcements', type: 'announcement', description: 'Studio updates' },
        { name: 'portfolio', type: 'text', description: 'Our work' }
      ]},
      { name: 'PROJECTS', channels: [
        { name: 'active-projects', type: 'text', description: 'Current projects' },
        { name: 'project-showcase', type: 'text', description: 'Show completed work' },
        { name: 'feedback', type: 'forum', description: 'Get feedback on work' },
        { name: 'collaboration', type: 'text', description: 'Find collaborators' }
      ]},
      { name: 'DISCUSSION', channels: [
        { name: 'general-chat', type: 'text', description: 'General discussion' },
        { name: 'tips-and-tricks', type: 'text', description: 'Share techniques' },
        { name: 'resources', type: 'text', description: 'Useful resources' }
      ]},
      { name: 'VOICE CHANNELS', channels: [
        { name: 'Studio Live', type: 'voice', description: 'Live sessions' },
        { name: 'General Voice', type: 'voice', description: 'General chat' }
      ]}
    ],
    restaurant: [
      { name: 'INFORMATION', channels: [
        { name: 'rules', type: 'text', description: 'Server rules' },
        { name: 'announcements', type: 'announcement', description: 'Specials and events' },
        { name: 'menu', type: 'text', description: 'Our menu' }
      ]},
      { name: 'ORDERING', channels: [
        { name: 'place-order', type: 'text', description: 'Place your order' },
        { name: 'order-status', type: 'text', description: 'Check order status' },
        { name: 'special-requests', type: 'text', description: 'Dietary needs and modifications' }
      ]},
      { name: 'COMMUNITY', channels: [
        { name: 'general-chat', type: 'text', description: 'Chat with us' },
        { name: 'reviews', type: 'text', description: 'Share your experience' },
        { name: 'photos', type: 'text', description: 'Share food photos' }
      ]},
      { name: 'VOICE CHANNELS', channels: [
        { name: 'Order Help', type: 'voice', description: 'Need help ordering?' },
        { name: 'General Voice', type: 'voice', description: 'General chat' }
      ]}
    ],
    fitness: [
      { name: 'INFORMATION', channels: [
        { name: 'rules', type: 'text', description: 'Community guidelines' },
        { name: 'announcements', type: 'announcement', description: 'Class schedules and updates' },
        { name: 'welcome', type: 'text', description: 'Welcome new members' }
      ]},
      { name: 'WORKOUTS', channels: [
        { name: 'daily-workout', type: 'text', description: "Today's workout" },
        { name: 'workout-plans', type: 'text', description: 'Training programs' },
        { name: 'form-check', type: 'forum', description: 'Get form feedback' },
        { name: 'progress', type: 'text', description: 'Share your progress' }
      ]},
      { name: 'NUTRITION', channels: [
        { name: 'meal-plans', type: 'text', description: 'Meal planning' },
        { name: 'recipes', type: 'text', description: 'Healthy recipes' },
        { name: 'supplements', type: 'text', description: 'Supplement discussion' }
      ]},
      { name: 'COMMUNITY', channels: [
        { name: 'general-chat', type: 'text', description: 'General chat' },
        { name: 'motivation', type: 'text', description: 'Stay motivated' }
      ]},
      { name: 'VOICE CHANNELS', channels: [
        { name: 'Workout Together', type: 'voice', description: 'Train together' },
        { name: 'General Voice', type: 'voice', description: 'General chat' }
      ]}
    ],
    nonprofit: [
      { name: 'INFORMATION', channels: [
        { name: 'rules', type: 'text', description: 'Community guidelines' },
        { name: 'announcements', type: 'announcement', description: 'Organization updates' },
        { name: 'about-us', type: 'text', description: 'Our mission' }
      ]},
      { name: 'VOLUNTEERS', channels: [
        { name: 'volunteer-signup', type: 'text', description: 'Sign up to volunteer' },
        { name: 'events', type: 'text', description: 'Upcoming events' },
        { name: 'coordination', type: 'text', description: 'Organize activities' }
      ]},
      { name: 'COMMUNITY', channels: [
        { name: 'general-chat', type: 'text', description: 'General discussion' },
        { name: 'success-stories', type: 'text', description: 'Share impact stories' },
        { name: 'resources', type: 'text', description: 'Helpful resources' }
      ]},
      { name: 'VOICE CHANNELS', channels: [
        { name: 'Meeting Room', type: 'voice', description: 'Team meetings' },
        { name: 'General Voice', type: 'voice', description: 'General chat' }
      ]}
    ]
  };

  return categoryTemplates[serverType] || categoryTemplates.community;
}

function generateRoles(serverType, prompt) {
  const baseRoles = [
    { name: 'Owner', color: '#FF0000', permissions: ['Administrator'], mentionable: false, hoist: true },
    { name: 'Admin', color: '#FF6B00', permissions: ['Manage Server', 'Manage Roles', 'Manage Channels', 'Kick Members', 'Ban Members'], mentionable: true, hoist: true },
    { name: 'Moderator', color: '#FFD700', permissions: ['Manage Messages', 'Kick Members', 'Mute Members', 'Deafen Members', 'Manage Nicknames'], mentionable: true, hoist: true },
    { name: 'Member', color: '#00FF00', permissions: ['Send Messages', 'Read Message History', 'Connect', 'Speak', 'Use Voice Activity'], mentionable: false, hoist: false }
  ];

  if (serverType === 'gaming') {
    baseRoles.splice(3, 0,
      { name: 'Pro Player', color: '#9B59B6', permissions: ['Send Messages', 'Read Message History', 'Connect', 'Speak'], mentionable: true, hoist: true },
      { name: 'Newbie', color: '#3498DB', permissions: ['Send Messages', 'Read Message History', 'Connect'], mentionable: false, hoist: false }
    );
  } else if (serverType === 'support') {
    baseRoles.splice(3, 0,
      { name: 'Support Agent', color: '#3498DB', permissions: ['Manage Messages', 'Send Messages', 'Read Message History', 'Connect', 'Speak'], mentionable: true, hoist: true },
      { name: 'Premium Support', color: '#9B59B6', permissions: ['Send Messages', 'Read Message History', 'Connect', 'Speak'], mentionable: true, hoist: false }
    );
  } else if (serverType === 'development') {
    baseRoles.splice(3, 0,
      { name: 'Senior Dev', color: '#9B59B6', permissions: ['Send Messages', 'Read Message History', 'Connect', 'Speak', 'Manage Messages'], mentionable: true, hoist: true },
      { name: 'Contributor', color: '#1ABC9C', permissions: ['Send Messages', 'Read Message History', 'Connect'], mentionable: true, hoist: false }
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
    description: `Welcome to ${serverName}!`,
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
      defaultMessageNotifications: 'all_messages',
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
    content: `You are DiscordGPT, an AI assistant that helps users create Discord server structures. When a user asks you to create/build/generate a Discord server, you MUST respond with a JSON blueprint wrapped in a code block like this:

\`\`\`json
{
  "serverName": "Server Name",
  "description": "Server description",
  "categories": [
    {
      "name": "CATEGORY NAME",
      "channels": [
        { "name": "channel-name", "type": "text", "description": "What this channel is for" }
      ]
    }
  ],
  "roles": [
    { "name": "RoleName", "color": "#FF0000", "permissions": ["Permission1"], "mentionable": true, "hoist": true }
  ]
}
\`\`\`

Valid channel types: text, voice, announcement, forum
Valid roles: Owner, Admin, Moderator, Member, and custom roles
Valid permissions: Administrator, ManageServer, ManageRoles, ManageChannels, KickMembers, BanMembers, ManageMessages, SendMessages, ReadMessageHistory, Connect, Speak, ViewChannel

For non-server requests, just respond normally as a helpful assistant. Always be concise and helpful.`
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
    google: 'gemini-3.5-flash',
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

  let url = `https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-3.5-flash'}:generateContent?key=${apiKey}`;

  const body = { contents };
  if (systemMsg) {
    body.systemInstruction = { parts: [{ text: systemMsg.content }] };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(45000)
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Google AI error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
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

  const blueprintKeywords = ['create', 'make', 'build', 'generate', 'blueprint', 'server', 'setup'];
  const isBlueprintRequest = blueprintKeywords.some(kw => content.includes(kw));

  if (isBlueprintRequest) {
    const blueprint = generateBlueprint(lastMessage.content);
    let prefix = '';
    if (errorMsg) {
      prefix = `[AI Error: ${errorMsg}]\n\n`;
    }
    return `${prefix}Here's the Discord server blueprint I generated:\n\n**Server Name:** ${blueprint.serverName}\n\n**Categories:**\n${blueprint.categories.map(c => `📁 ${c.name}\n${c.channels.map(ch => `  # ${ch.name} (${ch.type})`).join('\n')}`).join('\n\n')}\n\n**Roles:**\n${blueprint.roles.map(r => `👥 ${r.name} (${r.color})`).join('\n')}\n\nClick **Create Server** to build this on your Discord server.`;
  }

  if (content.includes('help') || content.includes('how')) {
    return `I can help you create Discord server structures. Here's what I do:\n\n1. **Describe your server** - Tell me what kind of Discord server you want\n2. **I generate a blueprint** - Categories, channels, roles, permissions\n3. **One-click creation** - I build it on your server automatically\n\nTry: "Create a gaming server for my Valorant community"`;
  }

  if (content.includes('hello') || content.includes('hi') || content.includes('hey')) {
    let prefix = '';
    if (errorMsg) {
      prefix = `[AI Error: ${errorMsg}]\n\n`;
    }
    return `${prefix}Hey! I'm DiscordGPT. I build Discord servers from natural language descriptions. What kind of server do you want me to create?`;
  }

  let prefix = '';
  if (errorMsg) {
    prefix = `[AI Error: ${errorMsg}]\n\n`;
  }

  return `${prefix}I'm DiscordGPT, your Discord server builder. Describe the server you want and I'll create the full structure — categories, channels, roles, and permissions.\n\nFor example:\n- "Create a Minecraft hosting server called MineVo"\n- "Build a gaming community with LFG and voice channels"\n- "Generate a professional support server with tickets"`;
}

module.exports = {
  generateBlueprint,
  generateChatResponse,
  extractServerName,
  detectServerType
};
