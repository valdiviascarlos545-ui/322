const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const db = require('../../../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('goal-list')
    .setDescription('Display all configured community milestone goals and progress'),

  async execute(interaction) {
    const goals = db.prepare('SELECT * FROM server_goals ORDER BY target_count ASC').all();
    const currentMembers = interaction.guild.memberCount;

    const embed = createEmbed({
      title: '🎯 Community Milestone Goals',
      description: `Current Server Count: **${currentMembers.toLocaleString()} Members**\n\nAutomated milestone thresholds:`,
      category: 'moderation',
      fields: goals.map(g => {
        const isReached = currentMembers >= g.target_count || g.reached === 1;
        const progress = Math.min(100, Math.round((currentMembers / g.target_count) * 100));
        return {
          name: `${isReached ? '✅' : '⏳'} ${g.target_count.toLocaleString()} Members [${progress}%]`,
          value: `**Broadcast Message:** "${g.message}"\n**Status:** ${isReached ? `Reached ${g.announced_at ? `<t:${Math.floor(new Date(g.announced_at).getTime() / 1000)}:R>` : '✅'}` : 'In Progress'}`,
          inline: false
        };
      })
    });

    return interaction.reply({ embeds: [embed] });
  }
};
