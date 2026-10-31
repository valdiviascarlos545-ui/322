const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createEmbed, successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { PERMISSION_LEVELS, hasPermission, logAudit } = require('../../utils/permissions');
const config = require('../../../config');
const db = require('../../../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('staff-blacklist')
    .setDescription('Permanently blacklist an individual from holding any staff role in New York Roleplay')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption(opt => opt.setName('user').setDescription('User to blacklist').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Comprehensive reason for staff blacklist').setRequired(true)),

  async execute(interaction) {
    if (!hasPermission(interaction.member, PERMISSION_LEVELS.DIRECTIVE)) {
      return interaction.reply({ content: '❌ Only Directive Team members can issue permanent staff blacklists.', ephemeral: true });
    }

    const targetUser = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason');
    const nowIso = new Date().toISOString();
    const caseId = `SBL-${Date.now().toString(36).toUpperCase()}`;

    db.prepare(`
      INSERT INTO application_blacklists (user_id, reason, issued_by, created_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET reason = excluded.reason
    `).run(targetUser.id, `STAFF BLACKLIST: ${reason}`, interaction.user.id, nowIso);

    db.prepare(`
      INSERT INTO infractions (case_id, user_id, issued_by, punishment, reason, appealable, status, created_at)
      VALUES (?, ?, ?, 'Staff Blacklist', ?, 0, 'active', ?)
    `).run(caseId, targetUser.id, interaction.user.id, reason, nowIso);

    const embed = createEmbed({
      title: '🚫 Permanent Staff Blacklist',
      description: 'The Directive Team has placed this user on the server Staff Blacklist.',
      category: 'infractions',
      color: 0x000000,
      fields: [
        { name: 'Blacklisted User', value: `<@${targetUser.id}>`, inline: true },
        { name: 'Issued By', value: `<@${interaction.user.id}>`, inline: true },
        { name: 'Case ID', value: `\`${caseId}\``, inline: true },
        { name: 'Appealable', value: 'No (Classified)', inline: true },
        { name: 'Reason', value: reason, inline: false }
      ]
    });

    if (config.staff.iaLogChannelId) {
      try {
        const iaChan = interaction.guild.channels.cache.get(config.staff.iaLogChannelId);
        if (iaChan && iaChan.isTextBased()) await iaChan.send({ embeds: [embed] });
      } catch (e) {}
    }

    try {
      await targetUser.send({ embeds: [embed] });
    } catch (e) {}

    logAudit(interaction.user.id, 'STAFF_BLACKLIST', targetUser.id, reason);

    return interaction.reply({
      embeds: [successEmbed('Staff Blacklist Enforced', `<@${targetUser.id}> has been permanently blacklisted from staff operations.`)]
    });
  }
};
