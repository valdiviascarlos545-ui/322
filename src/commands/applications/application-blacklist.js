const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { PERMISSION_LEVELS, hasPermission, logAudit } = require('../../utils/permissions');
const db = require('../../../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('application-blacklist')
    .setDescription('Blacklist a user from submitting staff applications')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to blacklist')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the blacklist')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, PERMISSION_LEVELS.HUMAN_RESOURCES)) {
      return interaction.reply({ content: '❌ Only Human Resources or Directive can blacklist applicants.', ephemeral: true });
    }

    const targetUser = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason');

    const existing = db.prepare('SELECT * FROM application_blacklists WHERE user_id = ?').get(targetUser.id);
    if (existing) {
      return interaction.reply({ embeds: [errorEmbed('Already Blacklisted', `<@${targetUser.id}> is already blacklisted from staff applications.`)], ephemeral: true });
    }

    db.prepare('INSERT INTO application_blacklists (user_id, reason, issued_by, created_at) VALUES (?, ?, ?, ?)')
      .run(targetUser.id, reason, interaction.user.id, new Date().toISOString());

    logAudit(interaction.user.id, 'APP_BLACKLIST', targetUser.id, `Blacklisted user: ${reason}`);

    return interaction.reply({
      embeds: [successEmbed('Application Blacklist Added', `<@${targetUser.id}> has been permanently barred from applying for staff positions.\n**Reason:** ${reason}`)]
    });
  }
};
