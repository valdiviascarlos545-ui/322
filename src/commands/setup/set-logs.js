const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { successEmbed } = require('../../utils/embedBuilder');
const { PERMISSION_LEVELS, hasPermission, logAudit } = require('../../utils/permissions');
const config = require('../../../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('set-logs')
    .setDescription('Set the destination channel for system audit, error, or moderation logs')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(option =>
      option.setName('category')
        .setDescription('The log category')
        .setRequired(true)
        .addChoices(
          { name: 'Moderation Logs', value: 'mod' },
          { name: 'Giveaway Logs', value: 'giveaway' },
          { name: 'Error / Debug Logs', value: 'error' },
          { name: 'Staff Action Logs', value: 'staff' },
          { name: 'Internal Affairs Logs', value: 'ia' }
        )
    )
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel where logs should be posted')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, PERMISSION_LEVELS.ADMINISTRATION)) {
      return interaction.reply({ content: '❌ You do not have permission to configure log channels.', ephemeral: true });
    }

    const category = interaction.options.getString('category');
    const channel = interaction.options.getChannel('channel');

    if (category === 'mod') config.community.moderationLogChannelId = channel.id;
    if (category === 'giveaway') config.community.giveawayLogChannelId = channel.id;
    if (category === 'error') config.community.errorLogChannelId = channel.id;
    if (category === 'staff') config.staff.logChannelId = channel.id;
    if (category === 'ia') config.staff.iaLogChannelId = channel.id;

    logAudit(interaction.user.id, 'SET_LOG_CHANNEL', channel.id, `Set ${category} log channel to #${channel.name}`);

    return interaction.reply({
      embeds: [successEmbed('Log Destination Configured', `Logs for **${category}** will now be routed to <#${channel.id}>.`)],
      ephemeral: true
    });
  }
};
