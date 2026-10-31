const { SlashCommandBuilder } = require('discord.js');
const { createEmbed, successEmbed } = require('../../utils/embedBuilder');
const config = require('../../../config');
const db = require('../../../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('staff-loa')
    .setDescription('File an official Leave of Absence (LOA) with the HR Team')
    .addStringOption(option =>
      option.setName('start_date')
        .setDescription('Start date (e.g. YYYY-MM-DD or Today)')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('end_date')
        .setDescription('Expected return date (e.g. YYYY-MM-DD or 2 Weeks)')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the Leave of Absence')
        .setRequired(true)
    ),

  async execute(interaction) {
    const startDate = interaction.options.getString('start_date');
    const endDate = interaction.options.getString('end_date');
    const reason = interaction.options.getString('reason');
    const nowIso = new Date().toISOString();

    db.prepare(`
      INSERT INTO staff_leave (user_id, reason, start_date, end_date, status, created_at)
      VALUES (?, ?, ?, ?, 'active', ?)
    `).run(interaction.user.id, reason, startDate, endDate, nowIso);

    db.prepare(`
      INSERT INTO staff_profiles (user_id, status, loa_start, loa_end, created_at)
      VALUES (?, 'loa', ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        status = 'loa',
        loa_start = excluded.loa_start,
        loa_end = excluded.loa_end
    `).run(interaction.user.id, startDate, endDate, nowIso);

    const loaEmbed = createEmbed({
      title: '✈️ Staff Leave of Absence (LOA) Filed',
      description: `<@${interaction.user.id}> has officially registered a Leave of Absence.`,
      category: 'promotions',
      fields: [
        { name: 'Staff Member', value: `<@${interaction.user.id}>`, inline: true },
        { name: 'Start Date', value: startDate, inline: true },
        { name: 'Expected Return', value: endDate, inline: true },
        { name: 'Reason', value: reason, inline: false }
      ]
    });

    if (config.staff.logChannelId) {
      try {
        const logChan = interaction.guild.channels.cache.get(config.staff.logChannelId);
        if (logChan && logChan.isTextBased()) {
          await logChan.send({ embeds: [loaEmbed] });
        }
      } catch (e) {
        console.error('Failed to log LOA:', e);
      }
    }

    return interaction.reply({
      embeds: [successEmbed('LOA Registered', `Your Leave of Absence from **${startDate}** to **${endDate}** has been documented with HR. Use \`/staff-return\` upon coming back.`)],
      ephemeral: true
    });
  }
};
