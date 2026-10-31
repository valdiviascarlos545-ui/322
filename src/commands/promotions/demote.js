const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { createEmbed, successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { PERMISSION_LEVELS, hasPermission, logAudit, canModerateMember } = require('../../utils/permissions');
const config = require('../../../config');
const db = require('../../../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('demote')
    .setDescription('Demote a staff member to a lower rank or remove specific rank roles')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addUserOption(opt => opt.setName('user').setDescription('Staff member to demote').setRequired(true))
    .addRoleOption(opt => opt.setName('remove_role').setDescription('Current rank role to remove').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Reason for demotion').setRequired(true))
    .addRoleOption(opt => opt.setName('new_role').setDescription('New lower rank role to assign (optional)').setRequired(false)),

  async execute(interaction) {
    if (!hasPermission(interaction.member, PERMISSION_LEVELS.HUMAN_RESOURCES)) {
      return interaction.reply({ content: '❌ You must be HR or Directive to execute rank demotions.', ephemeral: true });
    }

    const targetUser = interaction.options.getUser('user');
    const removeRole = interaction.options.getRole('remove_role');
    const newRole = interaction.options.getRole('new_role');
    const reason = interaction.options.getString('reason');

    if (targetUser.id === interaction.user.id) {
      return interaction.reply({ content: '❌ Self-demotion is not permitted via this command.', ephemeral: true });
    }

    const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
    if (!targetMember) {
      return interaction.reply({ embeds: [errorEmbed('User Not Found', 'Target user is not in this server.')], ephemeral: true });
    }

    if (!canModerateMember(interaction.member, targetMember)) {
      return interaction.reply({ content: '❌ You cannot demote someone of equal or higher staff authorization.', ephemeral: true });
    }

    try {
      await targetMember.roles.remove(removeRole);
      if (newRole) {
        await targetMember.roles.add(newRole);
      }
    } catch (err) {
      return interaction.reply({ embeds: [errorEmbed('Role Update Failed', err.message)], ephemeral: true });
    }

    const nowIso = new Date().toISOString();

    db.prepare(`
      INSERT INTO promotions (user_id, old_rank, new_rank, reason, issued_by, type, created_at)
      VALUES (?, ?, ?, ?, ?, 'demotion', ?)
    `).run(targetUser.id, removeRole.name, newRole?.name || 'Demoted / None', reason, interaction.user.id, nowIso);

    const embed = createEmbed({
      title: '🔻 Staff Rank Demotion',
      description: 'The High Ranking Team has executed a staff rank adjustment.',
      category: 'promotions',
      color: 0xE63946,
      fields: [
        { name: 'Staff Member', value: `<@${targetUser.id}>`, inline: true },
        { name: 'Issued By', value: `<@${interaction.user.id}>`, inline: true },
        { name: 'Role Removed', value: `<@&${removeRole.id}>`, inline: true },
        ...(newRole ? [{ name: 'New Assigned Rank', value: `<@&${newRole.id}>`, inline: true }] : []),
        { name: 'Reason', value: reason, inline: false }
      ]
    });

    if (config.staff.promotionLogChannelId) {
      try {
        const logChan = interaction.guild.channels.cache.get(config.staff.promotionLogChannelId);
        if (logChan && logChan.isTextBased()) await logChan.send({ embeds: [embed] });
      } catch (e) {}
    }

    try {
      await targetUser.send({ embeds: [embed] });
    } catch (e) {}

    logAudit(interaction.user.id, 'DEMOTE_STAFF', targetUser.id, `Demoted from ${removeRole.name}: ${reason}`);

    return interaction.reply({
      embeds: [successEmbed('Demotion Completed', `<@${targetUser.id}> has been demoted from <@&${removeRole.id}>.`)]
    });
  }
};
