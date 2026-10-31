const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const db = require('../../../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('training-join')
    .setDescription('Register your attendance for a scheduled Academy training session')
    .addStringOption(opt => opt.setName('session_id').setDescription('Training Session ID').setRequired(true)),

  async execute(interaction) {
    const sessionId = interaction.options.getString('session_id').toUpperCase();
    const session = db.prepare('SELECT * FROM training_sessions WHERE session_id = ?').get(sessionId);

    if (!session) {
      return interaction.reply({ embeds: [errorEmbed('Session Not Found', `No session found with ID \`${sessionId}\`.`)], ephemeral: true });
    }

    if (session.status !== 'Scheduled' && session.status !== 'Started') {
      return interaction.reply({ embeds: [errorEmbed('Closed Session', `This session is currently \`${session.status}\` and is no longer accepting RSVPs.`)], ephemeral: true });
    }

    const existing = db.prepare('SELECT * FROM training_attendance WHERE session_id = ? AND user_id = ?').get(sessionId, interaction.user.id);
    if (existing) {
      return interaction.reply({ embeds: [errorEmbed('Already Registered', 'You are already marked as attending this training session.')], ephemeral: true });
    }

    db.prepare('INSERT INTO training_attendance (session_id, user_id, status, joined_at) VALUES (?, ?, \'attending\', ?)')
      .run(sessionId, interaction.user.id, new Date().toISOString());

    return interaction.reply({
      embeds: [successEmbed('Attendance Registered', `You have joined the attendance roster for session **#${sessionId}** (${session.topic}). You will be pinged when it begins!`)],
      ephemeral: true
    });
  }
};
