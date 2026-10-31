const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createEmbed, successEmbed } = require('../../utils/embedBuilder');
const { PERMISSION_LEVELS, hasPermission, logAudit } = require('../../utils/permissions');
const prcService = require('../../services/prcService');
const config = require('../../../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('session-end')
    .setDescription('Conclude an ongoing ER:LC private server roleplay session')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    if (!hasPermission(interaction.member, PERMISSION_LEVELS.SUPPORT_STAFF)) {
      return interaction.reply({ content: '❌ Only staff can conclude sessions.', ephemeral: true });
    }

    const embed = createEmbed({
      title: '🏁 New York Roleplay — Session Concluded',
      description: `Today's official roleplay session has ended.\n\n` +
        `Thank you to all law enforcement, emergency medical personnel, firefighters, and civilians who attended!\n\n` +
        `We appreciate your dedication to high-standard, realistic roleplay. Keep an eye out in announcements for future session schedules.`,
      category: 'sessions',
      color: 0x1D3557
    });

    const targetChannel = config.community.sessionChannelId
      ? interaction.guild.channels.cache.get(config.community.sessionChannelId) || interaction.channel
      : interaction.channel;

    await targetChannel.send({ embeds: [embed] });

    if (prcService.isConfigured()) {
      await prcService.runCommand(':m The official New York Roleplay session has now concluded. Thank you for attending!');
    }

    logAudit(interaction.user.id, 'END_SESSION', targetChannel.id, 'Ended ER:LC session');

    return interaction.reply({ content: `✅ Session concluded in <#${targetChannel.id}>.`, ephemeral: true });
  }
};
