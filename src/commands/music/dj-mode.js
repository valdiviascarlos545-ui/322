const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const musicService = require('../../services/musicService');
const { successEmbed } = require('../../utils/embedBuilder');
const { PERMISSION_LEVELS, hasPermission } = require('../../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dj-mode')
    .setDescription('Toggle DJ-only playback control mode for the guild')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addBooleanOption(opt => opt.setName('enabled').setDescription('Enable or disable DJ Mode').setRequired(true)),

  async execute(interaction) {
    if (!hasPermission(interaction.member, PERMISSION_LEVELS.ADMINISTRATION)) {
      return interaction.reply({ content: '❌ You must be Administration or Directive to toggle DJ Mode.', ephemeral: true });
    }

    const enabled = interaction.options.getBoolean('enabled');
    const queue = musicService.getQueue(interaction.guild.id);
    queue.djMode = enabled;

    return interaction.reply({
      embeds: [successEmbed('DJ Mode Updated', `DJ Mode is now **${enabled ? 'ENABLED' : 'DISABLED'}**. ${enabled ? 'Only members with the configured DJ Role or Manage Guild permissions can queue, pause, or skip tracks.' : 'All voice participants may now request and manage music tracks.'}`)]
    });
  }
};
