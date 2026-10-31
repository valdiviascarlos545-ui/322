const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createEmbed, successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { PERMISSION_LEVELS, hasPermission, logAudit } = require('../../utils/permissions');
const db = require('../../../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('training-cancel')
    .setDescription('Cancel a scheduled training session with a stated reason')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addStringOption(opt => opt.setName('session_id').setDescription('Training Session ID').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Reason for cancellation').setRequired(true)),

  async execute(interaction) {
    if (!hasPermission(interaction.member, PERMISSION_LEVELS.TRAINER)) {
      return interaction.reply({ content: '❌ Only Trainers can cancel training sessions.', ephemeral: true });
    }

    const sessionId = interaction.options.getString('session_id').toUpperCase();
    const reason = interaction.options.getString('reason');

    const session = db.prepare('SELECT * FROM training_sessions WHERE session_id = ?').get(sessionId);
    if (!session) {
      return interaction.reply({ embeds: [errorEmbed('Session Not Found', `No session found with ID \`${sessionId}\`.`)], ephemeral: true });
    }

    db.prepare('UPDATE training_sessions SET status = \'Cancelled\' WHERE session_id = ?').run(sessionId);

    const embed = createEmbed({
      title: '❌ Training Session Cancelled',
      description: `Training **#${sessionId}** scheduled by <@${session.host_id}> has been cancelled.\n\n**Reason:** ${reason}`,
      category: 'training',
      color: 0xE63946
    });

    if (session.channel_id) {
      const channel = interaction.guild.channels.cache.get(session.channel_id);
      if (channel && channel.isTextBased()) await channel.send({ embeds: [embed] });
    }

    logAudit(interaction.user.id, 'CANCEL_TRAINING', null, `Cancelled session ${sessionId}: ${reason}`);

    return interaction.reply({ embeds: [successEmbed('Training Cancelled', `Session **#${sessionId}** was marked cancelled.`)], ephemeral: true });
  }
};
