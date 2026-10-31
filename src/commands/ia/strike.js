const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createEmbed, successEmbed } = require('../../utils/embedBuilder');
const { PERMISSION_LEVELS, hasPermission, logAudit, canModerateMember } = require('../../utils/permissions');
const config = require('../../../config');
const db = require('../../../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('strike')
    .setDescription('Quick-issue a formal disciplinary strike to a staff member')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addUserOption(opt => opt.setName('user').setDescription('Target staff member').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Reason for the strike').setRequired(true)),

  async execute(interaction) {
    if (!hasPermission(interaction.member, PERMISSION_LEVELS.INTERNAL_AFFAIRS)) {
      return interaction.reply({ content: '❌ Only Internal Affairs, HR, or Directive can issue strikes.', ephemeral: true });
    }

    const targetUser = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason');

    const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
    if (targetMember && !canModerateMember(interaction.member, targetMember)) {
      return interaction.reply({ content: '❌ You cannot strike someone of equal or higher staff authorization.', ephemeral: true });
    }

    const caseId = `STRK-${Date.now().toString(36).toUpperCase()}`;
    const nowIso = new Date().toISOString();

    db.prepare(`
      INSERT INTO infractions (case_id, user_id, issued_by, punishment, reason, appealable, status, created_at)
      VALUES (?, ?, ?, 'Strike', ?, 1, 'active', ?)
    `).run(caseId, targetUser.id, interaction.user.id, reason, nowIso);

    db.prepare(`
      INSERT INTO staff_profiles (user_id, infractions_count, created_at)
      VALUES (?, 1, ?)
      ON CONFLICT(user_id) DO UPDATE SET infractions_count = infractions_count + 1
    `).run(targetUser.id, nowIso);

    const totalStrikes = db.prepare('SELECT COUNT(*) as c FROM infractions WHERE user_id = ? AND punishment = \'Strike\' AND status = \'active\'').get(targetUser.id).c;

    const strikeEmbed = createEmbed({
      title: '⚡ Disciplinary Strike Issued',
      description: `The Internal Affairs Command has issued a formal strike to <@${targetUser.id}>.`,
      category: 'infractions',
      color: 0xE63946,
      fields: [
        { name: 'Target User', value: `<@${targetUser.id}>`, inline: true },
        { name: 'Issued By', value: `<@${interaction.user.id}>`, inline: true },
        { name: 'Active Strikes', value: `\`${totalStrikes} / 3\``, inline: true },
        { name: 'Case ID', value: `\`${caseId}\``, inline: true },
        { name: 'Reason', value: reason, inline: false }
      ]
    });

    if (config.staff.infractionLogChannelId) {
      try {
        const logChan = interaction.guild.channels.cache.get(config.staff.infractionLogChannelId);
        if (logChan && logChan.isTextBased()) {
          await logChan.send({ embeds: [strikeEmbed] });
        }
      } catch (e) {
        console.error('Failed to log strike:', e);
      }
    }

    try {
      await targetUser.send({ embeds: [strikeEmbed] });
    } catch (e) {
      // DM closed
    }

    logAudit(interaction.user.id, 'ISSUE_STRIKE', targetUser.id, `Strike (${totalStrikes}/3): ${reason}`);

    return interaction.reply({
      embeds: [successEmbed('Strike Issued', `<@${targetUser.id}> has received Strike #${totalStrikes} (Case: \`${caseId}\`).`)]
    });
  }
};
