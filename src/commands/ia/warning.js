const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createEmbed, successEmbed } = require('../../utils/embedBuilder');
const { PERMISSION_LEVELS, hasPermission, logAudit, canModerateMember } = require('../../utils/permissions');
const config = require('../../../config');
const db = require('../../../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warning')
    .setDescription('Issue an official written or verbal warning to a staff member')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addUserOption(opt => opt.setName('user').setDescription('Target staff member').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Reason for the warning').setRequired(true))
    .addStringOption(opt =>
      opt.setName('type')
        .setDescription('Type of warning')
        .setRequired(false)
        .addChoices(
          { name: 'Written Warning', value: 'Written Warning' },
          { name: 'Verbal Warning', value: 'Verbal Warning' },
          { name: 'Final Warning', value: 'Final Warning' }
        )
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, PERMISSION_LEVELS.INTERNAL_AFFAIRS)) {
      return interaction.reply({ content: '❌ Only Internal Affairs, HR, or Directive can issue warnings.', ephemeral: true });
    }

    const targetUser = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason');
    const type = interaction.options.getString('type') || 'Written Warning';

    const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
    if (targetMember && !canModerateMember(interaction.member, targetMember)) {
      return interaction.reply({ content: '❌ You cannot warn someone of equal or higher staff authorization.', ephemeral: true });
    }

    const caseId = `WARN-${Date.now().toString(36).toUpperCase()}`;
    const nowIso = new Date().toISOString();

    db.prepare(`
      INSERT INTO infractions (case_id, user_id, issued_by, punishment, reason, appealable, status, created_at)
      VALUES (?, ?, ?, ?, ?, 1, 'active', ?)
    `).run(caseId, targetUser.id, interaction.user.id, type, reason, nowIso);

    const warnEmbed = createEmbed({
      title: `⚠️ ${type} Issued`,
      description: `Disciplinary warning issued to <@${targetUser.id}>.`,
      category: 'infractions',
      color: 0xF1C40F,
      fields: [
        { name: 'Staff Member', value: `<@${targetUser.id}>`, inline: true },
        { name: 'Issued By', value: `<@${interaction.user.id}>`, inline: true },
        { name: 'Warning Type', value: type, inline: true },
        { name: 'Case ID', value: `\`${caseId}\``, inline: true },
        { name: 'Reason', value: reason, inline: false }
      ]
    });

    if (config.staff.infractionLogChannelId) {
      try {
        const logChan = interaction.guild.channels.cache.get(config.staff.infractionLogChannelId);
        if (logChan && logChan.isTextBased()) {
          await logChan.send({ embeds: [warnEmbed] });
        }
      } catch (e) {
        console.error('Failed to log warning:', e);
      }
    }

    try {
      await targetUser.send({ embeds: [warnEmbed] });
    } catch (e) {}

    logAudit(interaction.user.id, 'ISSUE_WARNING', targetUser.id, `${type}: ${reason}`);

    return interaction.reply({
      embeds: [successEmbed('Warning Issued', `<@${targetUser.id}> received a **${type}** (Case: \`${caseId}\`).`)]
    });
  }
};
