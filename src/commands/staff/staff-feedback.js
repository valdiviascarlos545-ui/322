const { SlashCommandBuilder } = require('discord.js');
const { createEmbed, successEmbed } = require('../../utils/embedBuilder');
const config = require('../../../config');
const db = require('../../../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('staff-feedback')
    .setDescription('Submit official member feedback on a staff member\'s assistance')
    .addUserOption(option =>
      option.setName('staff')
        .setDescription('The staff member who assisted you')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('rating')
        .setDescription('Rating from 1 to 5 stars')
        .setRequired(true)
        .addChoices(
          { name: '⭐⭐⭐⭐⭐ 5/5 - Outstanding', value: 5 },
          { name: '⭐⭐⭐⭐ 4/5 - Good', value: 4 },
          { name: '⭐⭐⭐ 3/5 - Average', value: 3 },
          { name: '⭐⭐ 2/5 - Below Average', value: 2 },
          { name: '⭐ 1/5 - Unsatisfactory', value: 1 }
        )
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Details regarding your experience')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('ticket_id')
        .setDescription('Ticket ID if applicable (e.g. NYRP-0001)')
        .setRequired(false)
    ),

  async execute(interaction) {
    const staff = interaction.options.getUser('staff');
    const rating = interaction.options.getInteger('rating');
    const reason = interaction.options.getString('reason');
    const ticketId = interaction.options.getString('ticket_id') || null;

    if (staff.id === interaction.user.id) {
      return interaction.reply({ content: '❌ You cannot submit feedback on yourself.', ephemeral: true });
    }

    const starsStr = '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
    const nowIso = new Date().toISOString();

    db.prepare(`
      INSERT INTO staff_feedback (staff_id, submitter_id, rating, reason, ticket_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(staff.id, interaction.user.id, rating, reason, ticketId, nowIso);

    // Build the official rich embed
    const feedbackEmbed = createEmbed({
      title: '⭐ Staff Feedback',
      description: 'A community member has submitted staff feedback.',
      category: 'promotions',
      fields: [
        { name: 'Staff Member', value: `<@${staff.id}>`, inline: true },
        { name: 'Rated By', value: `<@${interaction.user.id}>`, inline: true },
        { name: 'Rating', value: `${starsStr} **${rating}/5**`, inline: true },
        { name: 'Reason', value: reason, inline: false },
        ...(ticketId ? [{ name: 'Related Ticket', value: `\`#${ticketId}\``, inline: true }] : [])
      ]
    });

    // Send to staff log channel if configured
    if (config.staff.logChannelId) {
      try {
        const logChannel = interaction.guild.channels.cache.get(config.staff.logChannelId);
        if (logChannel && logChannel.isTextBased()) {
          await logChannel.send({ embeds: [feedbackEmbed] });
        }
      } catch (e) {
        console.error('Failed to post feedback to log channel:', e);
      }
    }

    return interaction.reply({
      embeds: [
        successEmbed(
          'Feedback Submitted',
          `Thank you! Your feedback for <@${staff.id}> has been saved and forwarded to High Rank Staff Management.`
        )
      ],
      ephemeral: true
    });
  }
};
