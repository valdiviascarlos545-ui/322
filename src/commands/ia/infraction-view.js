const { SlashCommandBuilder } = require('discord.js');
const { createEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { PERMISSION_LEVELS, hasPermission } = require('../../utils/permissions');
const db = require('../../../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('infraction-view')
    .setDescription('Look up a specific disciplinary case by Case ID')
    .addStringOption(opt => opt.setName('case_id').setDescription('Case ID (e.g. INF-...)').setRequired(true)),

  async execute(interaction) {
    if (!hasPermission(interaction.member, PERMISSION_LEVELS.SUPPORT_STAFF)) {
      return interaction.reply({ content: '❌ You must be staff to view confidential disciplinary cases.', ephemeral: true });
    }

    const caseId = interaction.options.getString('case_id').toUpperCase();
    const inf = db.prepare('SELECT * FROM infractions WHERE case_id = ?').get(caseId);

    if (!inf) {
      return interaction.reply({ embeds: [errorEmbed('Case Not Found', `No disciplinary file found matching Case ID \`${caseId}\`.`)], ephemeral: true });
    }

    const embed = createEmbed({
      title: `⚖️ Disciplinary Case File — ${inf.case_id}`,
      description: `Official Internal Affairs case report for <@${inf.user_id}>.`,
      category: 'infractions',
      color: 0xE63946,
      fields: [
        { name: 'Target Staff Member', value: `<@${inf.user_id}> (\`${inf.user_id}\`)`, inline: true },
        { name: 'Issued By', value: `<@${inf.issued_by}>`, inline: true },
        { name: 'Sanction / Punishment', value: `**${inf.punishment}**`, inline: true },
        { name: 'Status', value: `\`${inf.status.toUpperCase()}\``, inline: true },
        { name: 'Appealable', value: inf.appealable ? 'Yes' : 'No', inline: true },
        { name: 'Date Logged', value: `<t:${Math.floor(new Date(inf.created_at).getTime() / 1000)}:F>`, inline: true },
        { name: 'Detailed Reason', value: inf.reason, inline: false }
      ]
    });

    return interaction.reply({ embeds: [embed] });
  }
};
