const { SlashCommandBuilder } = require('discord.js');
const { createEmbed, successEmbed } = require('../../utils/embedBuilder');
const db = require('../../../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('staff-activity')
    .setDescription('Log or review staff duty activity, patrol minutes, or shift attendance')
    .addSubcommand(sub =>
      sub.setName('log')
        .setDescription('Log staff duty minutes')
        .addIntegerOption(opt => opt.setName('minutes').setDescription('Shift duration in minutes').setRequired(true))
        .addStringOption(opt => opt.setName('type').setDescription('Type of activity (e.g. In-game Patrol, Ticket Support)').setRequired(true))
        .addStringOption(opt => opt.setName('notes').setDescription('Optional shift notes').setRequired(false))
    )
    .addSubcommand(sub =>
      sub.setName('view')
        .setDescription('View activity stats for a staff member')
        .addUserOption(opt => opt.setName('staff').setDescription('Staff member to look up').setRequired(false))
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'log') {
      const minutes = interaction.options.getInteger('minutes');
      const type = interaction.options.getString('type');
      const notes = interaction.options.getString('notes') || '';
      const nowIso = new Date().toISOString();

      db.prepare(`
        INSERT INTO staff_activity (user_id, activity_type, duration_minutes, notes, created_at)
        VALUES (?, ?, ?, ?, ?)
      `).run(interaction.user.id, type, minutes, notes, nowIso);

      return interaction.reply({
        embeds: [successEmbed('Shift Logged', `Logged **${minutes} minutes** of **${type}** for <@${interaction.user.id}>.`)],
        ephemeral: true
      });
    }

    if (sub === 'view') {
      const targetUser = interaction.options.getUser('staff') || interaction.user;
      const totalMinutes = db.prepare('SELECT SUM(duration_minutes) as total FROM staff_activity WHERE user_id = ?').get(targetUser.id).total || 0;
      const recent = db.prepare('SELECT * FROM staff_activity WHERE user_id = ? ORDER BY id DESC LIMIT 5').all(targetUser.id);

      const hours = (totalMinutes / 60).toFixed(1);

      const embed = createEmbed({
        title: `⏱️ Staff Activity Record — ${targetUser.username}`,
        description: `Activity hours and shift history for <@${targetUser.id}>:`,
        category: 'promotions',
        fields: [
          { name: 'Total Time on Duty', value: `**${totalMinutes} mins** (~${hours} hours)`, inline: true },
          { name: 'Shifts Logged', value: `${db.prepare('SELECT COUNT(*) as c FROM staff_activity WHERE user_id = ?').get(targetUser.id).c}`, inline: true },
          {
            name: 'Recent Duty Shifts',
            value: recent.length > 0
              ? recent.map(r => `• **${r.activity_type}** (${r.duration_minutes}m) — <t:${Math.floor(new Date(r.created_at).getTime() / 1000)}:R>`).join('\n')
              : '*No shifts recorded yet*'
          }
        ]
      });

      return interaction.reply({ embeds: [embed] });
    }
  }
};
