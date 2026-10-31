const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { createEmbed, successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { PERMISSION_LEVELS, hasPermission, logAudit, canModerateMember } = require('../../utils/permissions');
const config = require('../../../config');
const db = require('../../../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('promote')
    .setDescription('Promote a staff member to a new rank and grant appropriate Discord roles')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addUserOption(opt => opt.setName('user').setDescription('Staff member to promote').setRequired(true))
    .addRoleOption(opt => opt.setName('new_rank').setDescription('The new rank role to grant').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Promotion justification').setRequired(true))
    .addRoleOption(opt => opt.setName('old_rank').setDescription('Previous rank role to remove (optional)').setRequired(false)),

  async execute(interaction) {
    if (!hasPermission(interaction.member, PERMISSION_LEVELS.HUMAN_RESOURCES)) {
      return interaction.reply({ content: '❌ You must be HR, Directive, or Executive Command to issue promotions.', ephemeral: true });
    }

    const targetUser = interaction.options.getUser('user');
    const newRole = interaction.options.getRole('new_rank');
    const oldRole = interaction.options.getRole('old_rank');
    const reason = interaction.options.getString('reason');

    if (targetUser.id === interaction.user.id) {
      return interaction.reply({ content: '❌ Self-promotions are strictly prohibited by protocol.', ephemeral: true });
    }

    const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
    if (!targetMember) {
      return interaction.reply({ embeds: [errorEmbed('User Not Found', 'Target user is not currently in this server.')], ephemeral: true });
    }

    if (!canModerateMember(interaction.member, targetMember)) {
      return interaction.reply({ content: '❌ You cannot promote someone of equal or higher hierarchy rank.', ephemeral: true });
    }

    // Role hierarchy check for bot
    if (newRole.position >= interaction.guild.members.me.roles.highest.position) {
      return interaction.reply({ content: '❌ Bot hierarchy error: the bot\'s highest role must be above the role you are granting.', ephemeral: true });
    }

    // Assign new role
    try {
      await targetMember.roles.add(newRole);
      if (oldRole) {
        await targetMember.roles.remove(oldRole).catch(() => {});
      }
    } catch (err) {
      return interaction.reply({ embeds: [errorEmbed('Role Assignment Failed', err.message)], ephemeral: true });
    }

    const nowIso = new Date().toISOString();

    // Log to DB
    db.prepare(`
      INSERT INTO promotions (user_id, old_rank, new_rank, reason, issued_by, type, created_at)
      VALUES (?, ?, ?, ?, ?, 'promotion', ?)
    `).run(targetUser.id, oldRole?.name || 'Previous Rank', newRole.name, reason, interaction.user.id, nowIso);

    db.prepare(`
      INSERT INTO staff_profiles (user_id, rank_role_id, rank_name, created_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        rank_role_id = excluded.rank_role_id,
        rank_name = excluded.rank_name
    `).run(targetUser.id, newRole.id, newRole.name, nowIso);

    // Build embed
    const promoEmbed = createEmbed({
      title: '🎉 Staff Promotion',
      description: 'The High Rank Team has decided to grant you a promotion. Congratulations!',
      category: 'promotions',
      color: 0x2ECC71,
      fields: [
        { name: 'Issued By', value: `<@${interaction.user.id}>`, inline: true },
        { name: 'User', value: `<@${targetUser.id}>`, inline: true },
        { name: 'New Rank', value: `<@&${newRole.id}>`, inline: true },
        ...(oldRole ? [{ name: 'Previous Rank', value: `<@&${oldRole.id}>`, inline: true }] : []),
        { name: 'Reason', value: reason, inline: false }
      ]
    });

    // Send to promotion log channel and create celebration thread
    if (config.staff.promotionLogChannelId) {
      try {
        const logChan = interaction.guild.channels.cache.get(config.staff.promotionLogChannelId);
        if (logChan && logChan.isTextBased()) {
          const promoMsg = await logChan.send({ content: `🎊 Congratulations <@${targetUser.id}>!`, embeds: [promoEmbed] });
          if (logChan.type === ChannelType.GuildText) {
            await promoMsg.startThread({
              name: `promotion-${targetUser.username}`,
              autoArchiveDuration: 1440
            });
          }
        }
      } catch (e) {
        console.error('Failed to log promotion:', e);
      }
    }

    // DM user
    try {
      await targetUser.send({ embeds: [promoEmbed] });
    } catch (e) {}

    logAudit(interaction.user.id, 'PROMOTE_STAFF', targetUser.id, `Promoted to ${newRole.name}: ${reason}`);

    return interaction.reply({
      embeds: [successEmbed('Promotion Processed', `<@${targetUser.id}> was promoted to <@&${newRole.id}>.`)]
    });
  }
};
