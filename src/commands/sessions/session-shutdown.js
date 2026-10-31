const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createEmbed, successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { PERMISSION_LEVELS, hasPermission, logAudit } = require('../../utils/permissions');
const prcService = require('../../services/prcService');
const config = require('../../../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('session-shutdown')
    .setDescription('Broadcast an in-game shutdown warning or restart notice to the ER:LC private server')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(opt => opt.setName('reason').setDescription('Reason for the server shutdown').setRequired(true))
    .addIntegerOption(opt => opt.setName('countdown_minutes').setDescription('Notice countdown in minutes (e.g. 5)').setRequired(false)),

  async execute(interaction) {
    if (!hasPermission(interaction.member, PERMISSION_LEVELS.ADMINISTRATION)) {
      return interaction.reply({ content: '❌ Only Administration or Directive can shut down sessions.', ephemeral: true });
    }

    const reason = interaction.options.getString('reason');
    const minutes = interaction.options.getInteger('countdown_minutes') || 5;

    await interaction.deferReply();

    // Send command via PRC API if configured
    let prcStatus = 'PRC server key not configured in .env (Discord notice only)';
    if (prcService.isConfigured()) {
      const res = await prcService.runCommand(`:m SERVER SHUTDOWN IN ${minutes} MINUTES: ${reason}`);
      if (res.success) {
        prcStatus = `Dispatched in-game message via PRC API: "${res.message}"`;
      } else {
        prcStatus = `PRC API warning: ${res.error}`;
      }
    }

    const embed = createEmbed({
      title: '⚠️ Emergency Server Shutdown Notice',
      description: `The private server will be **shutting down / restarting** in **${minutes} minutes**.\n\n` +
        `**Reason:** ${reason}\n` +
        `**Issued by:** <@${interaction.user.id}>\n\n` +
        `Please conclude your active roleplays, park your vehicles, and prepare to disconnect.`,
      category: 'sessions',
      color: 0xE63946
    });

    const targetChannel = config.community.sessionChannelId
      ? interaction.guild.channels.cache.get(config.community.sessionChannelId) || interaction.channel
      : interaction.channel;

    await targetChannel.send({ embeds: [embed] });

    logAudit(interaction.user.id, 'SESSION_SHUTDOWN', targetChannel.id, `Shutdown in ${minutes}m: ${reason}`);

    return interaction.editReply({
      embeds: [successEmbed('Shutdown Broadcasted', `Notice posted in <#${targetChannel.id}>.\n• Status: ${prcStatus}`)]
    });
  }
};
