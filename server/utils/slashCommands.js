const { Client, GatewayIntentBits, ActivityType, REST, Routes, SlashCommandBuilder } = require('discord.js');
const db = require('../database');
const { createServerStructure } = require('./discord');

const PANEL_URL = 'https://client-six-zeta-13.vercel.app';

const COMMANDS = [
  new SlashCommandBuilder()
    .setName('load')
    .setDescription('Load a server blueprint using a deploy code')
    .addStringOption(option =>
      option.setName('code')
        .setDescription('The 8-character deploy code from DiscordGPT')
        .setRequired(true)
    )
];

let persistentClient = null;

function getClient() {
  return persistentClient;
}

async function registerCommands(botToken, botClientId) {
  try {
    const rest = new REST({ version: '10' }).setToken(botToken);
    console.log('Registering slash commands...');
    await rest.put(
      Routes.applicationCommands(botClientId),
      { body: COMMANDS.map(cmd => cmd.toJSON()) }
    );
    console.log('Slash commands registered successfully');
  } catch (error) {
    console.error('Failed to register slash commands:', error.message);
  }
}

async function startPersistentClient(botToken, botInfo) {
  if (persistentClient) {
    try { persistentClient.destroy(); } catch {}
    persistentClient = null;
    await new Promise(r => setTimeout(r, 3000));
  }

  try {
    persistentClient = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages
      ]
    });

    persistentClient.on('ready', () => {
      console.log(`Persistent bot client ready: ${persistentClient.user.username}`);
      persistentClient.user.setPresence({
        status: 'online',
        activities: [{
          name: 'DiscordGPT Panel',
          type: ActivityType.Watching,
          url: PANEL_URL
        }]
      });
    });

    persistentClient.on('interactionCreate', async (interaction) => {
      if (!interaction.isChatInputCommand()) return;
      if (interaction.commandName !== 'load') return;

      const code = interaction.options.getString('code').trim().toUpperCase();

      await interaction.deferReply();

      try {
        const pending = await db.getPendingBlueprintByCode(code);
        if (!pending) {
          await interaction.editReply('❌ Invalid or expired deploy code. Generate a new one from DiscordGPT.');
          return;
        }

        const guild = interaction.guild;
        if (!guild) {
          await interaction.editReply('❌ This command can only be used in a Discord server.');
          return;
        }

        const botMember = guild.members.me;
        if (!botMember) {
          await interaction.editReply('❌ Bot is not a member of this server.');
          return;
        }

        const requiredPerms = ['ManageRoles', 'ManageChannels'];
        const missing = requiredPerms.filter(p => !botMember.permissions.has(p));
        if (missing.length > 0) {
          await interaction.editReply(`❌ Missing permissions: ${missing.join(', ')}. Grant Manage Roles and Manage Channels to the bot.`);
          return;
        }

        await interaction.editReply(`⚙️ Setting up server: **${pending.server_name || 'Your Server'}**\nThis may take a moment...`);

        const result = await createServerStructure(botToken, guild.id, pending.blueprint_json);
        await db.markBlueprintUsed(code);

        await interaction.editReply(
          `✅ Server **${pending.server_name || guild.name}** has been set up!\n\n` +
          `**Roles:** ${result.createdRoles.length}\n` +
          `**Categories:** ${result.createdCategories.length}\n` +
          `**Channels:** ${result.totalChannels}\n\n` +
          `Thank you for using DiscordGPT!`
        );
      } catch (error) {
        console.error('Slash command /load error:', error);
        await interaction.editReply(`❌ Failed: ${error.message}`).catch(() => {});
      }
    });

    await registerCommands(botToken, botInfo.id);
    await persistentClient.login(botToken);
    console.log('Persistent bot client logged in');
  } catch (error) {
    console.error('Failed to start persistent client:', error.message);
    persistentClient = null;
  }
}

async function getPersistentClientServers() {
  if (!persistentClient || !persistentClient.isReady()) {
    return null;
  }
  return persistentClient.guilds.cache.map(guild => ({
    id: guild.id,
    name: guild.name,
    icon: guild.iconURL(),
    memberCount: guild.memberCount,
    owner: guild.ownerId === persistentClient.user.id,
    permissions: guild.members.me ? guild.members.me.permissions.bitfield.toString() : '0'
  }));
}

function stopPersistentClient() {
  if (persistentClient) {
    try { persistentClient.destroy(); } catch {}
    persistentClient = null;
  }
}

module.exports = {
  registerCommands,
  startPersistentClient,
  stopPersistentClient,
  getClient,
  getPersistentClientServers
};
