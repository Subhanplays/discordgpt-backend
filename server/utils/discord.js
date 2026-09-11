const { Client, GatewayIntentBits, ActivityType, PermissionFlagsBits, ChannelType } = require('discord.js');

const activeBotSessions = new Map();

async function validateBotToken(token) {
  try {
    if (!token || typeof token !== 'string') {
      return { valid: false, error: 'Invalid token format' };
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false, error: 'Invalid token format' };
    }

    const client = new Client({
      intents: [GatewayIntentBits.Guilds]
    });

    await client.login(token);

    const botUser = client.user;
    const botInfo = {
      id: botUser.id,
      username: botUser.username,
      discriminator: botUser.discriminator,
      avatar: botUser.displayAvatarURL(),
      bot: botUser.bot,
      publicFlags: botUser.publicFlags
    };

    client.destroy();

    return { valid: true, botInfo };
  } catch (error) {
    console.error('Token validation error:', error.message);
    let errorMessage = 'Invalid bot token';
    if (error.message.includes('TOKEN_INVALID')) {
      errorMessage = 'The token provided is invalid';
    } else if (error.message.includes('TOKEN_EXPIRED')) {
      errorMessage = 'The token has expired';
    } else if (error.message.includes('NETWORK')) {
      errorMessage = 'Network error while validating token';
    }
    return { valid: false, error: errorMessage };
  }
}

function getActiveBot(userId) {
  return activeBotSessions.get(userId) || null;
}

function setActiveBot(userId, token, botInfo) {
  activeBotSessions.set(userId, {
    token,
    botInfo,
    connectedAt: new Date().toISOString()
  });
}

function removeActiveBot(userId) {
  activeBotSessions.delete(userId);
}

function getActiveBotByTokenHash(tokenHash) {
  for (const [userId, session] of activeBotSessions.entries()) {
    return { userId, ...session };
  }
  return null;
}

async function createServerStructure(botToken, serverId, blueprint, progressCallback) {
  let client = null;
  let ownClient = false;

  try {
    const { getClient } = require('./slashCommands');
    client = getClient();

    if (!client || !client.isReady()) {
      client = new Client({
        intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildMembers,
          GatewayIntentBits.GuildRoles
        ]
      });
      await client.login(botToken);
      ownClient = true;
    }

    const guild = client.guilds.cache.get(serverId);

    if (!guild) {
      throw new Error('Bot is not a member of this server');
    }

    const progress = { step: 0, total: 0, message: '' };
    const totalSteps = 4 + blueprint.categories.length;
    progress.total = totalSteps;

    progress.step = 1;
    progress.message = 'Cleaning server...';
    if (progressCallback) progressCallback(progress);

    try {
      const existingChannels = guild.channels.cache;
      for (const [, ch] of existingChannels) {
        try {
          if (ch.type === ChannelType.GuildCategory) {
            const childChannels = guild.channels.cache.filter(c => c.parentId === ch.id);
            for (const [, child] of childChannels) {
              try { await child.delete('DiscordGPT: cleaning for new setup'); } catch {}
            }
          }
          await ch.delete('DiscordGPT: cleaning for new setup');
        } catch {}
      }
    } catch {}

    try {
      const everyone = guild.roles.everyone;
      const managedRoles = guild.roles.cache.filter(r => r.managed || r.name === '@everyone');
      const deletableRoles = guild.roles.cache.filter(r => !r.managed && r.name !== '@everyone' && r.position > 0);
      for (const [, role] of deletableRoles) {
        try { await role.delete('DiscordGPT: cleaning for new setup'); } catch {}
      }
    } catch {}

    progress.step = 2;
    progress.message = 'Creating roles...';
    if (progressCallback) progressCallback(progress);

    const roleMap = {};
    for (const roleDef of blueprint.roles) {
      try {
        const existingRole = guild.roles.cache.find(r => r.name === roleDef.name);
        if (existingRole) {
          roleMap[roleDef.name] = existingRole;
          continue;
        }

        const permArray = Array.isArray(roleDef.permissions) ? roleDef.permissions : [];
        let permissions = BigInt(0);
        for (const p of permArray) {
          if (typeof p !== 'string' || p.length === 0) continue;
          const permName = p.replace(/\s+/g, '');
          try {
            if (PermissionFlagsBits.hasOwnProperty(permName)) {
              const flag = PermissionFlagsBits[permName];
              if (flag !== undefined && flag !== null) {
                permissions = permissions | flag;
              }
            }
          } catch {}
        }

        let roleColor = roleDef.color || '#99AAB5';
        if (typeof roleColor !== 'string' || roleColor.length < 4) {
          roleColor = '#99AAB5';
        }
        if (!roleColor.startsWith('#')) {
          roleColor = '#' + roleColor;
        }
        if (!/^#[0-9A-Fa-f]{6}$/.test(roleColor)) {
          roleColor = '#99AAB5';
        }

        const roleData = {
          name: roleDef.name || 'New Role',
          color: roleColor,
          mentionable: roleDef.mentionable !== false,
          hoist: roleDef.hoist || false,
          reason: `Created by DiscordGPT`
        };

        if (permissions > BigInt(0)) {
          roleData.permissions = permissions;
        }

        const role = await guild.roles.create(roleData);
        roleMap[roleDef.name] = role;
      } catch (error) {
        console.error(`Failed to create role ${roleDef.name}:`, error.message);
      }
    }

    progress.step = 3;
    progress.message = 'Creating categories...';
    if (progressCallback) progressCallback(progress);

    const categoryMap = {};
    for (const catDef of blueprint.categories) {
      try {
        const existingCategory = guild.channels.cache.find(
          c => c.type === ChannelType.GuildCategory && c.name === catDef.name
        );
        if (existingCategory) {
          categoryMap[catDef.name] = existingCategory;
          continue;
        }

        const category = await guild.channels.create({
          name: catDef.name,
          type: ChannelType.GuildCategory,
          reason: `Created by DiscordGPT`
        });
        categoryMap[catDef.name] = category;
      } catch (error) {
        console.error(`Failed to create category ${catDef.name}:`, error.message);
      }
    }

    progress.step = 4;
    progress.message = 'Creating channels...';
    if (progressCallback) progressCallback(progress);

    for (const catDef of blueprint.categories) {
      const category = categoryMap[catDef.name];
      if (!category) continue;

      for (const chDef of catDef.channels) {
        try {
          const existingChannel = guild.channels.cache.find(
            c => c.name === chDef.name && c.parentId === category.id
          );
          if (existingChannel) continue;

          let channelType;
          switch (chDef.type) {
            case 'voice':
              channelType = ChannelType.GuildVoice;
              break;
            case 'announcement':
              channelType = ChannelType.GuildAnnouncement;
              break;
            case 'forum':
              channelType = ChannelType.GuildForum;
              break;
            default:
              channelType = ChannelType.GuildText;
          }

          const channel = await guild.channels.create({
            name: chDef.name,
            type: channelType,
            parent: category.id,
            topic: chDef.topic || '',
            nsfw: chDef.nsfw || false,
            reason: `Created by DiscordGPT`
          });

          if (channelType === ChannelType.GuildText || channelType === ChannelType.GuildForum || channelType === ChannelType.GuildAnnouncement) {
            try {
              await channel.lockPermissions();

              if (Array.isArray(chDef.permissions) && chDef.permissions.length > 0) {
                for (const permDef of chDef.permissions) {
                  let targetId;
                  if (permDef.role === 'everyone') {
                    targetId = guild.roles.everyone.id;
                  } else {
                    const foundRole = guild.roles.cache.find(r => r.name === permDef.role || r.name.includes(permDef.role));
                    targetId = foundRole ? foundRole.id : null;
                  }
                  if (!targetId) continue;

                  const overwrite = {};
                  if (permDef.send === true) {
                    overwrite.SendMessages = true;
                    overwrite.ReadMessageHistory = true;
                    overwrite.ViewChannel = true;
                    if (channelType === ChannelType.GuildForum) {
                      overwrite.SendMessagesInThreads = true;
                      overwrite.CreatePublicThreads = true;
                    }
                  } else {
                    overwrite.SendMessages = false;
                    overwrite.SendMessagesInThreads = false;
                    overwrite.CreatePublicThreads = false;
                    overwrite.ReadMessageHistory = true;
                    overwrite.ViewChannel = true;
                  }

                  await channel.permissionOverwrites.edit(targetId, overwrite);
                }
              } else {
                const memberRole = roleMap['Member'];
                if (memberRole) {
                  const defaultPerms = channelType === ChannelType.GuildAnnouncement
                    ? { SendMessages: false, ReadMessageHistory: true, ViewChannel: true }
                    : { SendMessages: true, ReadMessageHistory: true, ViewChannel: true };
                  await channel.permissionOverwrites.edit(memberRole.id, defaultPerms);
                }
              }
            } catch (error) {
              console.error(`Failed to set permissions for ${chDef.name}:`, error.message);
            }
          }
        } catch (error) {
          console.error(`Failed to create channel ${chDef.name}:`, error.message);
        }
      }

      progress.step++;
      progress.message = `Created channels in ${catDef.name}...`;
      if (progressCallback) progressCallback(progress);
    }

    try {
      const ownerRole = roleMap['Owner'];
      const memberRole = roleMap['Member'];
      if (ownerRole && guild.members.me) {
        await guild.members.me.roles.add(ownerRole);
      }
      if (memberRole && guild.members.me) {
        await guild.members.me.roles.add(memberRole);
      }
    } catch (error) {
      console.error('Failed to set bot roles:', error.message);
    }

    progress.step = progress.total;
    progress.message = 'Server setup complete!';
    if (progressCallback) progressCallback(progress);

    if (ownClient) client.destroy();

    return {
      success: true,
      guild: {
        id: guild.id,
        name: guild.name,
        memberCount: guild.memberCount
      },
      createdRoles: Object.keys(roleMap),
      createdCategories: Object.keys(categoryMap),
      totalChannels: blueprint.categories.reduce((acc, cat) => acc + cat.channels.length, 0)
    };
  } catch (error) {
    console.error('Server creation error:', error);
    if (ownClient && client) {
      try { client.destroy(); } catch {}
    }
    throw error;
  }
}

async function getBotServers(botToken) {
  try {
    const { getClient } = require('./slashCommands');
    let client = getClient();

    if (client && client.isReady()) {
      return client.guilds.cache.map(guild => ({
        id: guild.id,
        name: guild.name,
        icon: guild.iconURL(),
        memberCount: guild.memberCount,
        owner: guild.ownerId === client.user.id,
        permissions: guild.members.me ? guild.members.me.permissions.bitfield.toString() : '0'
      }));
    }

    client = new Client({
      intents: [GatewayIntentBits.Guilds]
    });

    await client.login(botToken);

    const servers = client.guilds.cache.map(guild => ({
      id: guild.id,
      name: guild.name,
      icon: guild.iconURL(),
      memberCount: guild.memberCount,
      owner: guild.ownerId === client.user.id,
      permissions: guild.members.me ? guild.members.me.permissions.bitfield.toString() : '0'
    }));

    client.destroy();

    return servers;
  } catch (error) {
    console.error('Get bot servers error:', error);
    throw error;
  }
}

function generateInviteURL(botClientId, permissions) {
  const perms = permissions || 8;
  return `https://discord.com/api/oauth2/authorize?client_id=${botClientId}&permissions=${perms}&scope=bot%20applications.commands`;
}

module.exports = {
  validateBotToken,
  getActiveBot,
  setActiveBot,
  removeActiveBot,
  getActiveBotByTokenHash,
  createServerStructure,
  getBotServers,
  generateInviteURL
};
