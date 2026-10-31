const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { PERMISSION_LEVELS, hasPermission } = require('../../utils/permissions');
const db = require('../../../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('staff-notes')
    .setDescription('View all confidential HR performance notes for a staff member')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addUserOption(option =>
      option.setName('staff')
        .setDescription('Staff member')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, PERMISSION_LEVELS.HUMAN_RESOURCES)) {
      return interaction.reply({ content: '❌ You must be HR or Directive to inspect confidential staff notes.', ephemeral: true });
    }

    const targetUser = interaction.options.getUser('staff');
    const notes = db.prepare('SELECT * FROM staff_notes WHERE user_id = ? ORDER BY id DESC').all(targetUser.id);

    if (notes.length === 0) {
      return interaction.reply({
        embeds: [errorEmbed('No Notes Found', `There are no HR performance notes recorded for <@${targetUser.id}>.`)],
        ephemeral: true
      });
    }

    const embed = createEmbed({
      title: `📝 HR Notes — ${targetUser.username}`,
      description: `Confidential file records for <@${targetUser.id}>:`,
      category: 'promotions',
      fields: notes.map((n, i) => ({
        name: `Note #${i + 1} • <t:${Math.floor(new Date(n.created_at).getTime() / 1000)}:d>`,
        value: `"${n.note}"\n*Recorded by <@${n.author_id}>*`,
        inline: false
      }))
    });

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
