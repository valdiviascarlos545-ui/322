const { SlashCommandBuilder } = require('discord.js');
const ticketService = require('../../services/ticketService');
const { PERMISSION_LEVELS, hasPermission } = require('../../utils/permissions');
const { errorEmbed } = require('../../utils/embedBuilder');
const db = require('../../../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket-escalate')
    .setDescription('Escalate the active ticket to senior Directive Support'),

  async execute(interaction) {
    if (!hasPermission(interaction.member, PERMISSION_LEVELS.SUPPORT_STAFF)) {
      return interaction.reply({ content: '❌ Only staff members can escalate tickets.', ephemeral: true });
    }

    const ticket = db.prepare('SELECT * FROM tickets WHERE channel_id = ? AND status = \'open\'').get(interaction.channel.id);
    if (!ticket) {
      return interaction.reply({ embeds: [errorEmbed('Invalid Channel', 'This channel is not an active support ticket.')], ephemeral: true });
    }

    const result = await ticketService.escalateTicket(interaction, ticket.ticket_id);
    if (!result.success) {
      return interaction.reply({ embeds: [errorEmbed('Escalation Failed', result.error)], ephemeral: true });
    }

    return interaction.reply({ content: '✅ Escalation notice sent and Directive Team granted access.', ephemeral: true });
  }
};
