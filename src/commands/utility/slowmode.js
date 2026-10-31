const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { PERMISSION_LEVELS, hasPermission, logAudit } = require('../../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('Set slowmode cooldown for the current channel (0 to 21600 seconds)')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addIntegerOption(opt => opt.setName('seconds').setDescription('Slowmode duration in seconds (0 to disable)').setRequired(true)),

  async execute(interaction) {
    if (!hasPermission(interaction.member, PERMISSION_LEVELS.MODERATION)) {
      return interaction.reply({ content: '❌ Only staff with Moderation permissions can adjust slowmode.', ephemeral: true });
    }

    const seconds = Math.max(0, Math.min(21600, interaction.options.getInteger('seconds')));

    try {
      await interaction.channel.setRateLimitPerUser(seconds);
      logAudit(interaction.user.id, 'SET_SLOWMODE', interaction.channel.id, `Set slowmode to ${seconds}s`);

      return interaction.reply({
        embeds: [successEmbed('Slowmode Updated', seconds === 0 ? 'Slowmode has been disabled in this channel.' : `Slowmode set to **${seconds} seconds** per message.`)]
      });
    } catch (err) {
      return interaction.reply({ embeds: [errorEmbed('Failed to Set Slowmode', err.message)], ephemeral: true });
    }
  }
};
