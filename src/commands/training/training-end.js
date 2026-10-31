const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createEmbed, successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { PERMISSION_LEVELS, hasPermission, logAudit } = require('../../utils/permissions');
const db = require('../../../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('training-end')
    .setDescription('Conclude an active training session')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addStringOption(opt => opt.setName('session_id').setDescription('Training Session ID').setRequired(true)),

  async execute(interaction) {
    if (!hasPermission(interaction.member, PERMISSION_LEVELS.TRAINER)) {
      return interaction.reply({ content: '❌ Only Trainers can conclude training sessions.', ephemeral: true });
    }

    const sessionId = interaction.options.getString('session_id').toUpperCase();
    const session = db.prepare('SELECT * FROM training_sessions WHERE session_id = ?').get(sessionId);

    if (!session) {
      return interaction.reply({ embeds: [errorEmbed('Session Not Found', `No session found with ID \`${sessionId}\`.`)], ephemeral: true });
    }

    db.prepare('UPDATE training_sessions SET status = \'Ended\' WHERE session_id = ?').run(sessionId);

    const embed = createEmbed({
      title: '🏁 Training Session Concluded',
      description: `Training **#${sessionId}** hosted by <@${session.host_id}> has officially concluded.\n\n` +
        `Trainers should now record individual candidate evaluations using \`/training-result\` or \`/classroom-result\`.`,
      category: 'training',
      color: 0x3A86FF
    });

    if (session.channel_id) {
      const channel = interaction.guild.channels.cache.get(session.channel_id);
      if (channel && channel.isTextBased()) await channel.send({ embeds: [embed] });
    }

    logAudit(interaction.user.id, 'END_TRAINING', null, `Concluded session ${sessionId}`);

    return interaction.reply({ embeds: [successEmbed('Training Concluded', `Session **#${sessionId}** marked completed in records.`)], ephemeral: true });
  }
};
