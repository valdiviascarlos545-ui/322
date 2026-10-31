const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const { createEmbed, createEmbeds, successEmbed } = require('../../utils/embedBuilder');
const { PERMISSION_LEVELS, hasPermission, logAudit } = require('../../utils/permissions');
const db = require('../../../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Server setup wizard and official panel deployments')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(opt =>
      opt.setName('panel')
        .setDescription('Choose an action or deploy the Regulations Panel')
        .setRequired(false)
        .addChoices(
          { name: '📜 Regulations Panel (Discord ToS & Roblox Guidelines)', value: 'regulations' },
          { name: '🔍 Server Setup Inspection', value: 'inspect' }
        )
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, PERMISSION_LEVELS.MANAGEMENT)) {
      return interaction.reply({ content: '❌ You must be Management or Directive to run server setup actions.', ephemeral: true });
    }

    const panelChoice = interaction.options.getString('panel') || 'inspect';

    // DEPLOY REGULATIONS PANEL
    if (panelChoice === 'regulations') {
      const embeds = createEmbeds({
        title: '📜 Server Regulations & Guidelines — New York Roleplay',
        description: `Welcome to **New York Roleplay**! To maintain a realistic, enjoyable, and safe community for everyone, all members and players must strictly abide by our server regulations.\n\n` +
          `Select a guideline category from the menu below to review our official standards:\n\n` +
          `• **📜 Discord Community Guidelines**: Code of conduct, language rules, respect, advertising policies, and compliance with the **Discord Terms of Service**.\n\n` +
          `• **🚔 ER:LC In-Game Server Guidelines**: In-game roleplay rules including **FRP, RDM, VDM, NLR, FearRP, Cop Baiting, Priority Cooldowns**, and compliance with the **Roblox Community Standards & Terms of Service**.\n\n` +
          `*Failure to follow these guidelines may result in warnings, strikes, kicks, suspensions, or blacklists.*`,
        category: 'regulations'
      });

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('regulations_select')
        .setPlaceholder('Select regulations category to read...')
        .addOptions(
          new StringSelectMenuOptionBuilder()
            .setLabel('Discord Server Guidelines')
            .setDescription('Community rules, chat etiquette, and Discord Terms of Service')
            .setEmoji('📜')
            .setValue('discord'),
          new StringSelectMenuOptionBuilder()
            .setLabel('ER:LC In-Game Server Guidelines')
            .setDescription('Roleplay standards, FRP, RDM, VDM, NLR, and Roblox ToS')
            .setEmoji('🚔')
            .setValue('game')
        );

      const row = new ActionRowBuilder().addComponents(selectMenu);

      await interaction.channel.send({ embeds, components: [row] });
      logAudit(interaction.user.id, 'DEPLOY_REGULATIONS_PANEL', interaction.channel.id, 'Deployed official regulations panel');

      return interaction.reply({ content: '✅ Official Regulations Panel deployed in this channel!', ephemeral: true });
    }

    // DEFAULT: INSPECT SERVER
    const guild = interaction.guild;
    const channels = guild.channels.cache;
    const roles = guild.roles.cache;

    const setupEmbed = createEmbed({
      title: '🏙️ New York Roleplay — Automated Setup Status',
      description: `Welcome to the **New York Roleplay** configuration suite.\n\n` +
        `This command inspects your Discord server layout and links key channels and roles to the SQLite database.`,
      category: 'moderation',
      fields: [
        { name: 'Server Name', value: guild.name, inline: true },
        { name: 'Server ID', value: `\`${guild.id}\``, inline: true },
        { name: 'Total Roles', value: `${roles.size}`, inline: true },
        { name: 'Total Channels', value: `${channels.size}`, inline: true },
        {
          name: 'Recommended Setup Steps',
          value: '1. Use `/set-channel` to bind Ticket, Application, Session & Log channels.\n' +
                 '2. Use `/set-role` to bind Directive, HR, IA, Trainer & Trainee roles.\n' +
                 '3. Use `/setup panel:Regulations Panel` to deploy the rules and guidelines.\n' +
                 '4. Use `/ticket-panel` to deploy the support ticket dropdown.\n' +
                 '5. Use `/application-panel` to publish staff applications.\n' +
                 '6. Use `/verify-panel` to enable Roblox profile verification.'
        }
      ]
    });

    logAudit(interaction.user.id, 'SETUP_WIZARD_RUN', guild.id, 'Ran server setup inspection');

    return interaction.reply({ embeds: [setupEmbed], ephemeral: true });
  }
};
