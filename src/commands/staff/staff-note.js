const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { PERMISSION_LEVELS, hasPermission, logAudit } = require('../../utils/permissions');
const db = require('../../../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('staff-note')
    .setDescription('Add a confidential HR performance note to a staff member\'s file')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addUserOption(option =>
      option.setName('staff')
        .setDescription('Staff member to attach the note to')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('note')
        .setDescription('The evaluation, commendation, or observation')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, PERMISSION_LEVELS.HUMAN_RESOURCES)) {
      return interaction.reply({ content: '❌ You must be HR or Directive to record staff notes.', ephemeral: true });
    }

    const targetUser = interaction.options.getUser('staff');
    const note = interaction.options.getString('note');
    const nowIso = new Date().toISOString();

    db.prepare('INSERT INTO staff_notes (user_id, author_id, note, created_at) VALUES (?, ?, ?, ?)')
      .run(targetUser.id, interaction.user.id, note, nowIso);

    db.prepare(`
      INSERT INTO staff_profiles (user_id, notes_count, created_at)
      VALUES (?, 1, ?)
      ON CONFLICT(user_id) DO UPDATE SET notes_count = notes_count + 1
    `).run(targetUser.id, nowIso);

    logAudit(interaction.user.id, 'ADD_STAFF_NOTE', targetUser.id, note);

    return interaction.reply({
      embeds: [successEmbed('Staff Note Recorded', `Confidential HR note has been attached to <@${targetUser.id}>'s personnel file.`)],
      ephemeral: true
    });
  }
};
