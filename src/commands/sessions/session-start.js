const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { createEmbed, successEmbed } = require('../../utils/embedBuilder');
const { PERMISSION_LEVELS, hasPermission, logAudit } = require('../../utils/permissions');
const prcService = require('../../services/prcService');
const config = require('../../../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('session-start')
    .setDescription('Officially commence an ER:LC private server roleplay session')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addStringOption(opt => opt.setName('server_code').setDescription('Private server join code / vanity').setRequired(false))
    .addStringOption(opt => opt.setName('special_roleplay').setDescription('Special theme or event (optional)').setRequired(false)),

  async execute(interaction) {
    if (!hasPermission(interaction.member, PERMISSION_LEVELS.SUPPORT_STAFF)) {
      return interaction.reply({ content: '❌ Only staff members can start official server sessions.', ephemeral: true });
    }

    const code = interaction.options.getString('server_code') || 'NYRP';
    const theme = interaction.options.getString('special_roleplay') || 'Standard Five Boroughs Patrol';
    const sessionRolePing = config.community.sessionNotificationRoleId ? `<@&${config.community.sessionNotificationRoleId}>` : '@everyone';

    const embed = createEmbed({
      title: '🚨 New York Roleplay — Server Session Commenced! 🚨',
      description: `The private server is now officially **ONLINE & OPEN** for community roleplay!\n\n` +
        `**Session Host:** <@${interaction.user.id}>\n` +
        `**Theme / Event:** ${theme}\n` +
        `**Server Join Code:** \`${code}\`\n` +
        `**Strict Regulations:** FRP, RDM, VDM, and NLR rules are in full effect.\n\n` +
        `Click **Join Private Server** below to connect directly!`,
      category: 'sessions',
      color: 0x2ECC71
    });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('🎮 Join Private Server')
        .setStyle(ButtonStyle.Link)
        .setURL(config.prc.joinUrl)
    );

    const targetChannel = config.community.sessionChannelId
      ? interaction.guild.channels.cache.get(config.community.sessionChannelId) || interaction.channel
      : interaction.channel;

    await targetChannel.send({ content: sessionRolePing, embeds: [embed], components: [row] });

    // If PRC is configured, send in-game announcement command
    if (prcService.isConfigured()) {
      await prcService.runCommand(`:m New York Roleplay session officially hosted by ${interaction.user.username}!`);
    }

    logAudit(interaction.user.id, 'START_SESSION', targetChannel.id, `Started ER:LC session: ${theme}`);

    return interaction.reply({ content: `✅ Official session announced in <#${targetChannel.id}>!`, ephemeral: true });
  }
};
