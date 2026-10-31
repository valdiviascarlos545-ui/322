const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { PERMISSION_LEVELS, hasPermission } = require('../../utils/permissions');
const db = require('../../../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket-reopen')
    .setDescription('Reopen a previously closed ticket in the database')
    .addStringOption(option =>
      option.setName('ticket_id')
        .setDescription('Ticket ID (e.g. NYRP-0001)')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, PERMISSION_LEVELS.SUPPORT_STAFF)) {
      return interaction.reply({ content: '❌ Only staff members can reopen archived tickets.', ephemeral: true });
    }

    const ticketId = interaction.options.getString('ticket_id').toUpperCase();
    const ticket = db.prepare('SELECT * FROM tickets WHERE ticket_id = ?').get(ticketId);

    if (!ticket) {
      return interaction.reply({ embeds: [errorEmbed('Ticket Not Found', `No ticket found with ID \`${ticketId}\`.`)], ephemeral: true });
    }

    if (ticket.status === 'open') {
      return interaction.reply({ embeds: [errorEmbed('Already Open', `Ticket \`${ticketId}\` is already open in <#${ticket.channel_id}>.`)], ephemeral: true });
    }

    db.prepare('UPDATE tickets SET status = \'open\', closed_by = NULL, closed_at = NULL, close_reason = NULL WHERE ticket_id = ?')
      .run(ticketId);

    return interaction.reply({
      embeds: [successEmbed('Ticket Reopened', `Ticket **#${ticketId}** (Creator: <@${ticket.user_id}>) has been marked open in database records.`)]
    });
  }
};
