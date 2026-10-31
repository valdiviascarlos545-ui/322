const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { PERMISSION_LEVELS, hasPermission, logAudit } = require('../../utils/permissions');
const db = require('../../../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('staff-unblacklist')
    .setDescription('Remove a user from the staff blacklist')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption(opt => opt.setName('user').setDescription('User to unblacklist').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Reason for lifting the blacklist').setRequired(true)),

  async execute(interaction) {
    if (!hasPermission(interaction.member, PERMISSION_LEVELS.DIRECTIVE)) {
      return interaction.reply({ content: '❌ Only Directive Team members can lift staff blacklists.', ephemeral: true });
    }

    const targetUser = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason');

    const removed = db.prepare('DELETE FROM application_blacklists WHERE user_id = ?').run(targetUser.id);
    db.prepare('UPDATE infractions SET status = \'voided\' WHERE user_id = ? AND punishment = \'Staff Blacklist\'').run(targetUser.id);

    logAudit(interaction.user.id, 'STAFF_UNBLACKLIST', targetUser.id, reason);

    return interaction.reply({
      embeds: [successEmbed('Staff Blacklist Lifted', `<@${targetUser.id}> has been pardoned and removed from the staff blacklist.\n**Reason:** ${reason}`)]
    });
  }
};
