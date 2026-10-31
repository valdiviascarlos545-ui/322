const { SlashCommandBuilder } = require('discord.js');
const { createEmbed, errorEmbed } = require('../../utils/embedBuilder');
const db = require('../../../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('promotion-history')
    .setDescription('View the entire promotion and demotion timeline for a staff member')
    .addUserOption(opt => opt.setName('user').setDescription('Staff member to look up').setRequired(false)),

  async execute(interaction) {
    const targetUser = interaction.options.getUser('user') || interaction.user;
    const history = db.prepare('SELECT * FROM promotions WHERE user_id = ? ORDER BY id DESC').all(targetUser.id);

    if (history.length === 0) {
      return interaction.reply({
        embeds: [errorEmbed('No Records', `No promotion or rank transition history found for <@${targetUser.id}>.`)],
        ephemeral: true
      });
    }

    const embed = createEmbed({
      title: `📈 Rank Progression History — ${targetUser.username}`,
      description: `Chronological rank record for <@${targetUser.id}>:`,
      category: 'promotions',
      fields: history.slice(0, 10).map(h => ({
        name: `${h.type === 'promotion' ? '🟢 Promotion' : '🔴 Demotion'} • ${h.new_rank}`,
        value: `**From:** ${h.old_rank || 'Initial'}\n**Reason:** ${h.reason}\n**Authorized By:** <@${h.issued_by}> • <t:${Math.floor(new Date(h.created_at).getTime() / 1000)}:d>`,
        inline: false
      }))
    });

    return interaction.reply({ embeds: [embed] });
  }
};
