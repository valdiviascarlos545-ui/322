const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createEmbed, successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { PERMISSION_LEVELS, hasPermission, logAudit, canModerateMember } = require('../../utils/permissions');
const config = require('../../../config');
const db = require('../../../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('staff-suspend')
    .setDescription('Temporarily suspend a staff member pending Internal Affairs investigation')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addUserOption(option =>
      option.setName('staff')
        .setDescription('Staff member to suspend')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for suspension')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('duration')
        .setDescription('Suspension period (e.g. 7 Days, Indefinite)')
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, PERMISSION_LEVELS.INTERNAL_AFFAIRS)) {
      return interaction.reply({ content: '❌ Only Internal Affairs or Directive can suspend staff members.', ephemeral: true });
    }

    const targetUser = interaction.options.getUser('staff');
    const reason = interaction.options.getString('reason');
    const duration = interaction.options.getString('duration') || 'Pending Investigation';

    const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
    if (targetMember && !canModerateMember(interaction.member, targetMember)) {
      return interaction.reply({ content: '❌ You cannot suspend a staff member of equal or higher hierarchy rank.', ephemeral: true });
    }

    const nowIso = new Date().toISOString();
    db.prepare(`
      INSERT INTO staff_profiles (user_id, status, created_at)
      VALUES (?, 'suspended', ?)
      ON CONFLICT(user_id) DO UPDATE SET status = 'suspended'
    `).run(targetUser.id, nowIso);

    // Record in infractions table
    const caseId = `SUSP-${Date.now().toString(36).toUpperCase()}`;
    db.prepare(`
      INSERT INTO infractions (case_id, user_id, issued_by, punishment, reason, appealable, status, created_at)
      VALUES (?, ?, ?, 'Staff Suspension', ?, 1, 'active', ?)
    `).run(caseId, targetUser.id, interaction.user.id, `${reason} (Duration: ${duration})`, nowIso);

    const embed = createEmbed({
      title: '🚨 Staff Suspension Notice',
      description: 'The High Ranking Team & Internal Affairs have issued an administrative staff suspension.',
      category: 'infractions',
      color: 0xE63946,
      fields: [
        { name: 'Staff Member', value: `<@${targetUser.id}>`, inline: true },
        { name: 'Issued By', value: `<@${interaction.user.id}>`, inline: true },
        { name: 'Duration', value: duration, inline: true },
        { name: 'Case ID', value: `\`${caseId}\``, inline: true },
        { name: 'Reason', value: reason, inline: false }
      ]
    });

    if (config.staff.iaLogChannelId) {
      try {
        const iaChan = interaction.guild.channels.cache.get(config.staff.iaLogChannelId);
        if (iaChan && iaChan.isTextBased()) {
          await iaChan.send({ embeds: [embed] });
        }
      } catch (e) {
        console.error('Failed to log suspension to IA channel:', e);
      }
    }

    // Attempt DM
    try {
      await targetUser.send({ embeds: [embed] });
    } catch (e) {
      // DM closed
    }

    logAudit(interaction.user.id, 'SUSPEND_STAFF', targetUser.id, `Suspended: ${reason}`);

    return interaction.reply({
      embeds: [successEmbed('Suspension Executed', `<@${targetUser.id}> has been suspended (Case: \`${caseId}\`).`)]
    });
  }
};
