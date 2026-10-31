const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createEmbed, successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { PERMISSION_LEVELS, hasPermission, logAudit } = require('../../utils/permissions');
const db = require('../../../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('training-start')
    .setDescription('Commence a scheduled training session and ping registered attendees')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addStringOption(opt => opt.setName('session_id').setDescription('Training Session ID').setRequired(true)),

  async execute(interaction) {
    if (!hasPermission(interaction.member, PERMISSION_LEVELS.TRAINER)) {
      return interaction.reply({ content: '❌ Only Trainers can start sessions.', ephemeral: true });
    }

    const sessionId = interaction.options.getString('session_id').toUpperCase();
    const session = db.prepare('SELECT * FROM training_sessions WHERE session_id = ?').get(sessionId);

    if (!session) {
      return interaction.reply({ embeds: [errorEmbed('Session Not Found', `No session found with ID \`${sessionId}\`.`)], ephemeral: true });
    }

    db.prepare('UPDATE training_sessions SET status = \'Started\' WHERE session_id = ?').run(sessionId);

    const attendees = db.prepare('SELECT user_id FROM training_attendance WHERE session_id = ?').all(sessionId);
    const mentions = attendees.map(a => `<@${a.user_id}>`).join(' ');

    const embed = createEmbed({
      title: '🚨 Training Session Has Begun!',
      description: `Training **#${sessionId}** is now **ACTIVE**.\n\n` +
        `**Trainer in Charge:** <@${interaction.user.id}>\n` +
        `**Curriculum:** ${session.topic}\n\n` +
        `Please proceed immediately to the Briefing Room in-game. Trainees failing to arrive within 5 minutes may be marked absent.`,
      category: 'training',
      color: 0x2ECC71
    });

    if (session.channel_id) {
      const channel = interaction.guild.channels.cache.get(session.channel_id);
      if (channel && channel.isTextBased()) {
        await channel.send({ content: mentions || undefined, embeds: [embed] });
      }
    }

    logAudit(interaction.user.id, 'START_TRAINING', null, `Started session ${sessionId}`);

    return interaction.reply({ embeds: [successEmbed('Training Started', `Session **#${sessionId}** is now in progress.`)], ephemeral: true });
  }
};
