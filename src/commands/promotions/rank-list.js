const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const db = require('../../../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rank-list')
    .setDescription('Display all configured staff hierarchy ranks, permissions groups, and levels'),

  async execute(interaction) {
    const ranks = db.prepare('SELECT * FROM ranks ORDER BY level DESC').all();

    if (ranks.length === 0) {
      return interaction.reply({
        embeds: [createEmbed({
          title: '🎖️ Configured Staff Ranks',
          description: 'No custom staff rank tiers defined in the database yet. Use `/rank-create` to register server rank levels.',
          category: 'promotions'
        })]
      });
    }

    const embed = createEmbed({
      title: '🎖️ Official Staff Rank Hierarchy',
      description: 'Hierarchy levels recognized by the automated permission and audit engine:',
      category: 'promotions',
      fields: ranks.map(r => ({
        name: `Level ${r.level} • ${r.rank_name}`,
        value: `Role: <@&${r.role_id}>\nGroup: \`${r.permissions_group}\``,
        inline: true
      }))
    });

    return interaction.reply({ embeds: [embed] });
  }
};
