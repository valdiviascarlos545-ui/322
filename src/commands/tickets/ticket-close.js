const { SlashCommandBuilder } = require('discord.js');
const ticketService = require('../../services/ticketService');
const { errorEmbed } = require('../../utils/embedBuilder');
const db = require('../../../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket-close')
    .setDescription('Close and archive the current support ticket')
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for closing this ticket')
        .setRequired(false)
    ),

  async execute(interaction) {
    const ticket = db.prepare('SELECT * FROM tickets WHERE channel_id = ? AND status = \'open\'').get(interaction.channel.id);
    if (!ticket) {
      return interaction.reply({ embeds: [errorEmbed('Invalid Channel', 'This channel is not an active support ticket.')], ephemeral: true });
    }

    const reason = interaction.options.getString('reason') || 'Inquiry Completed by Staff';
    return ticketService.closeTicket(interaction, ticket.ticket_id, reason);
  }
};
