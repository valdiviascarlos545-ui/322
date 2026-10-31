const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { PERMISSION_LEVELS, hasPermission } = require('../../utils/permissions');
const config = require('../../../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('config')
    .setDescription('View current New York Roleplay bot configuration and active channel/role mappings')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    if (!hasPermission(interaction.member, PERMISSION_LEVELS.ADMINISTRATION)) {
      return interaction.reply({ content: '❌ You do not have permission to view server configuration.', ephemeral: true });
    }

    const embed = createEmbed({
      title: '⚙️ New York Roleplay — Active System Configuration',
      description: 'Overview of configured categories, channels, roles, and PRC connection state.',
      category: 'moderation',
      fields: [
        {
          name: '🎟️ Tickets',
          value: `General Category: ${config.tickets.generalCategoryId ? `<#${config.tickets.generalCategoryId}>` : '`Not Set`'}\n` +
                 `High Rank Category: ${config.tickets.highRankCategoryId ? `<#${config.tickets.highRankCategoryId}>` : '`Not Set`'}\n` +
                 `Log Channel: ${config.tickets.logChannelId ? `<#${config.tickets.logChannelId}>` : '`Not Set`'}\n` +
                 `Transcripts: ${config.tickets.transcriptChannelId ? `<#${config.tickets.transcriptChannelId}>` : '`Not Set`'}`,
          inline: true
        },
        {
          name: '📋 Applications & Training',
          value: `App Channel: ${config.applications.channelId ? `<#${config.applications.channelId}>` : '`Not Set`'}\n` +
                 `Review Channel: ${config.applications.reviewChannelId ? `<#${config.applications.reviewChannelId}>` : '`Not Set`'}\n` +
                 `Training Channel: ${config.training.channelId ? `<#${config.training.channelId}>` : '`Not Set`'}\n` +
                 `Trainee Role: ${config.applications.traineeRoleId ? `<@&${config.applications.traineeRoleId}>` : '`Not Set`'}`,
          inline: true
        },
        {
          name: '⚖️ Staff & IA Discipline',
          value: `Infraction Logs: ${config.staff.infractionLogChannelId ? `<#${config.staff.infractionLogChannelId}>` : '`Not Set`'}\n` +
                 `Promotion Logs: ${config.staff.promotionLogChannelId ? `<#${config.staff.promotionLogChannelId}>` : '`Not Set`'}\n` +
                 `HR Role: ${config.staff.hrRoleId ? `<@&${config.staff.hrRoleId}>` : '`Not Set`'}\n` +
                 `IA Role: ${config.staff.iaRoleId ? `<@&${config.staff.iaRoleId}>` : '`Not Set`'}`,
          inline: true
        },
        {
          name: '🔒 Verification & ER:LC',
          value: `Verify Channel: ${config.verification.channelId ? `<#${config.verification.channelId}>` : '`Not Set`'}\n` +
                 `Verified Role: ${config.verification.verifiedRoleId ? `<@&${config.verification.verifiedRoleId}>` : '`Not Set`'}\n` +
                 `PRC Server Key: ${config.prc.serverKey ? '`Configured` ✅' : '`Missing` ⚠️'}\n` +
                 `Music System: ${config.music.enabled ? '`Enabled` 🎶' : '`Disabled`'}`,
          inline: true
        }
      ]
    });

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
