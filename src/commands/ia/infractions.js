const { SlashCommandBuilder } = require('discord.js');
const { createEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { PERMISSION_LEVELS, hasPermission } = require('../../utils/permissions');
const db = require('../../../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('infractions')
    .setDescription('View the disciplinary history and active sanctions of a staff member')
    .addUserOption(opt => opt.setName('user').setDescription('Staff member to look up').setRequired(true)),

  async execute(interaction) {
    if (!hasPermission(interaction.member, PERMISSION_LEVELS.SUPPORT_STAFF)) {
      return interaction.reply({ content: '❌ You must be staff to review disciplinary history.', ephemeral: true });
    }

    const targetUser = interaction.options.getUser('user');
    const records = db.prepare('SELECT * FROM infractions WHERE user_id = ? ORDER BY id DESC').all(targetUser.id);

    if (records.length === 0) {
      return interaction.reply({
        embeds: [createEmbed({
          title: `🛡️ Clean Record — ${targetUser.username}`,
          description: `<@${targetUser.id}> currently has a **spotless** record with zero recorded infractions or strikes!`,
          category: 'infractions',
          color: 0x2ECC71
        })]
      });
    }

    const embed = createEmbed({
      title: `⚖️ Infraction History — ${targetUser.username}`,
      description: `Disciplinary audit history for <@${targetUser.id}> (${records.length} total recorded):`,
      category: 'infractions',
      color: 0xE63946,
      fields: records.slice(0, 10).map(r => ({
        name: `Case ${r.case_id} • ${r.punishment}`,
        value: `**Reason:** ${r.reason}\n**Issued By:** <@${r.issued_by}> • <t:${Math.floor(new Date(r.created_at).getTime() / 1000)}:d>\n**Status:** \`${r.status.toUpperCase()}\` • Appealable: ${r.appealable ? 'Yes' : 'No'}`,
        inline: false
      }))
    });

    return interaction.reply({ embeds: [embed] });
  }
};
