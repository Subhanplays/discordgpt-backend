const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const db = require('../database');
const { createServerStructure } = require('./discord');

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
let interactionQueue = [];

function getClient() {
  return persistentClient;
}

async function registerCommands(botToken, botClientId) {
  const rest = new REST({ version: '10' }).setToken(botToken);
  try {
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
  }

  persistentClient = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages
    ]
  });

  await registerCommands(botToken, botInfo.id);

  persistentClient.on('ready', () => {
    console.log(`Persistent bot client ready: ${persistentClient.user.username}`);
  });

  persistentClient.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'load') {
      const code = interaction.options.getString('code').trim().toUpperCase();

      await interaction.deferReply({ content: 'Loading blueprint...' });

      try {
        const pending = await db.getPendingBlueprintByCode(code);
        if (!pending) {
          await interaction.editReply({
            content: '❌ Invalid or expired deploy code. Please generate a new one from DiscordGPT.'
          });
          return;
        }

        const guild = interaction.guild;
        if (!guild) {
          await interaction.editReply({
            content: '❌ This command can only be used in a Discord server.'
          });
          return;
        }

        const botMember = guild.members.me;
        if (!botMember) {
          await interaction.editReply({
            content: '❌ Bot is not a member of this server.'
          });
          return;
        }

        const requiredPerms = ['ManageRoles', 'ManageChannels'];
        const missing = requiredPerms.filter(p => !botMember.permissions.has(p));
        if (missing.length > 0) {
          await interaction.editReply({
            content: `❌ Missing permissions: ${missing.join(', ')}. Please grant Manage Roles and Manage Channels permissions to the bot.`
          });
          return;
        }

        await interaction.editReply({
          content: `⚙️ Setting up server: **${pending.server_name || 'Your Server'}**\n\nThis may take a moment...`
        });

        const result = await createServerStructure(
          botToken,
          guild.id,
          pending.blueprint_json,
          (progress) => {}
        );

        await db.markBlueprintUsed(code);

        await interaction.editReply({
          content: `✅ Server **${pending.server_name || guild.name}** has been set up!\n\n` +
            `**Roles created:** ${result.createdRoles.length}\n` +
            `**Categories created:** ${result.createdCategories.length}\n` +
            `**Channels created:** ${result.totalChannels}\n\n` +
            `Thank you for using DiscordGPT!`
        });

      } catch (error) {
        console.error('Slash command /load error:', error);
        await interaction.editReply({
          content: `❌ Failed to set up server: ${error.message}\n\nPlease try again or generate a new deploy code from DiscordGPT.`
        }).catch(() => {});
      }
    }
  });

  try {
    await persistentClient.login(botToken);
    console.log('Persistent bot client logged in');
  } catch (error) {
    console.error('Failed to start persistent client:', error.message);
    persistentClient = null;
  }
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
  getClient
};
