const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { PERMISSION_LEVELS, hasPermission } = require('../../utils/permissions');
const db = require('../../../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket-stats')
    .setDescription('View analytics, volume metrics, and resolution counts for support tickets'),

  async execute(interaction) {
    if (!hasPermission(interaction.member, PERMISSION_LEVELS.SUPPORT_STAFF)) {
      return interaction.reply({ content: '❌ You do not have permission to view ticket statistics.', ephemeral: true });
    }

    const totalTickets = db.prepare('SELECT COUNT(*) as c FROM tickets').get().c;
    const openTickets = db.prepare('SELECT COUNT(*) as c FROM tickets WHERE status = \'open\'').get().c;
    const closedTickets = db.prepare('SELECT COUNT(*) as c FROM tickets WHERE status = \'closed\'').get().c;
    const claimedTickets = db.prepare('SELECT COUNT(*) as c FROM tickets WHERE claimed_by IS NOT NULL').get().c;
    const escalatedTickets = db.prepare('SELECT COUNT(*) as c FROM tickets WHERE escalated = 1').get().c;

    const generalCount = db.prepare('SELECT COUNT(*) as c FROM tickets WHERE category = \'General\'').get().c;
    const highRankCount = db.prepare('SELECT COUNT(*) as c FROM tickets WHERE category = \'High Rank\'').get().c;
    const deptCount = db.prepare('SELECT COUNT(*) as c FROM tickets WHERE category = \'Department\'').get().c;

    const embed = createEmbed({
      title: '📊 New York Roleplay — Ticket System Analytics',
      description: 'Comprehensive support performance metrics and category distributions.',
      category: 'tickets',
      fields: [
        { name: 'Total Created', value: `\`${totalTickets}\``, inline: true },
        { name: 'Currently Open', value: `\`${openTickets}\``, inline: true },
        { name: 'Resolved / Closed', value: `\`${closedTickets}\``, inline: true },
        { name: 'Claimed by Staff', value: `\`${claimedTickets}\``, inline: true },
        { name: 'Escalated to Directive', value: `\`${escalatedTickets}\``, inline: true },
        { name: 'Resolution Rate', value: totalTickets > 0 ? `\`${Math.round((closedTickets / totalTickets) * 100)}%\`` : '`100%`', inline: true },
        { name: 'General Support', value: `\`${generalCount}\` tickets`, inline: true },
        { name: 'High Rank Inquiries', value: `\`${highRankCount}\` tickets`, inline: true },
        { name: 'Department Concerns', value: `\`${deptCount}\` tickets`, inline: true }
      ]
    });

    return interaction.reply({ embeds: [embed] });
  }
};
