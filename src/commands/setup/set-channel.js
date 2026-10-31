const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { successEmbed } = require('../../utils/embedBuilder');
const { PERMISSION_LEVELS, hasPermission, logAudit } = require('../../utils/permissions');
const config = require('../../../config');
const db = require('../../../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('set-channel')
    .setDescription('Configure a system channel binding dynamically')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(option =>
      option.setName('type')
        .setDescription('The type of channel to bind')
        .setRequired(true)
        .addChoices(
          { name: 'Ticket Logs', value: 'ticket_logs' },
          { name: 'Transcripts', value: 'transcripts' },
          { name: 'Applications Form Channel', value: 'applications' },
          { name: 'Application Review Channel', value: 'application_review' },
          { name: 'Staff Logs', value: 'staff_logs' },
          { name: 'Infraction Logs', value: 'infraction_logs' },
          { name: 'Promotion Logs', value: 'promotion_logs' },
          { name: 'IA Logs', value: 'ia_logs' },
          { name: 'Training Channel', value: 'training' },
          { name: 'Verification Channel', value: 'verification' },
          { name: 'Session Channel', value: 'sessions' },
          { name: 'Statistics Channel', value: 'statistics' },
          { name: 'Milestone Goals Channel', value: 'goals' }
        )
    )
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('The text channel to bind')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, PERMISSION_LEVELS.ADMINISTRATION)) {
      return interaction.reply({ content: '❌ You do not have permission to modify channel configurations.', ephemeral: true });
    }

    const type = interaction.options.getString('type');
    const channel = interaction.options.getChannel('channel');

    // Update in-memory config and persist to guild_config
    if (type === 'ticket_logs') config.tickets.logChannelId = channel.id;
    if (type === 'transcripts') config.tickets.transcriptChannelId = channel.id;
    if (type === 'applications') config.applications.channelId = channel.id;
    if (type === 'application_review') config.applications.reviewChannelId = channel.id;
    if (type === 'staff_logs') config.staff.logChannelId = channel.id;
    if (type === 'infraction_logs') config.staff.infractionLogChannelId = channel.id;
    if (type === 'promotion_logs') config.staff.promotionLogChannelId = channel.id;
    if (type === 'ia_logs') config.staff.iaLogChannelId = channel.id;
    if (type === 'training') config.training.channelId = channel.id;
    if (type === 'verification') config.verification.channelId = channel.id;
    if (type === 'sessions') config.community.sessionChannelId = channel.id;
    if (type === 'statistics') config.community.statisticsChannelId = channel.id;
    if (type === 'goals') config.community.goalAnnouncementChannelId = channel.id;

    db.prepare(`
      INSERT INTO guild_config (guild_id, config_json, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(guild_id) DO UPDATE SET config_json = excluded.config_json, updated_at = excluded.updated_at
    `).run(interaction.guild.id, JSON.stringify({ [type]: channel.id }), new Date().toISOString());

    logAudit(interaction.user.id, 'SET_CHANNEL', channel.id, `Bound channel type ${type} to ${channel.name}`);

    return interaction.reply({
      embeds: [successEmbed('Channel Configured', `Successfully set **${type}** channel to <#${channel.id}>.`)],
      ephemeral: true
    });
  }
};
