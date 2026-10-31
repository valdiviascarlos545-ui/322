const { SlashCommandBuilder } = require('discord.js');
const { createEmbed, errorEmbed } = require('../../utils/embedBuilder');
const db = require('../../../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('training-attendance')
    .setDescription('View the list of registered attendees for a training session')
    .addStringOption(opt => opt.setName('session_id').setDescription('Training Session ID').setRequired(true)),

  async execute(interaction) {
    const sessionId = interaction.options.getString('session_id').toUpperCase();
    const session = db.prepare('SELECT * FROM training_sessions WHERE session_id = ?').get(sessionId);

    if (!session) {
      return interaction.reply({ embeds: [errorEmbed('Session Not Found', `No session found with ID \`${sessionId}\`.`)], ephemeral: true });
    }

    const attendees = db.prepare('SELECT user_id, joined_at FROM training_attendance WHERE session_id = ?').all(sessionId);

    const embed = createEmbed({
      title: `📋 Training Attendance Roster — ${sessionId}`,
      description: `**Topic:** ${session.topic}\n**Host:** <@${session.host_id}>\n**Status:** \`${session.status}\`\n**Total Registered:** ${attendees.length}`,
      category: 'training',
      fields: [
        {
          name: 'Attendees',
          value: attendees.length > 0 ? attendees.map(a => `• <@${a.user_id}> (<t:${Math.floor(new Date(a.joined_at).getTime() / 1000)}:R>)`).join('\n') : '*No registered attendees yet*'
        }
      ]
    });

    return interaction.reply({ embeds: [embed] });
  }
};
