const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { createEmbed, successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { PERMISSION_LEVELS, hasPermission, logAudit, canModerateMember } = require('../../utils/permissions');
const config = require('../../../config');
const db = require('../../../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('infraction')
    .setDescription('Issue an official staff infraction with disciplinary action')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addUserOption(opt => opt.setName('user').setDescription('Target staff member').setRequired(true))
    .addStringOption(opt =>
      opt.setName('punishment')
        .setDescription('Disciplinary sanction')
        .setRequired(true)
        .addChoices(
          { name: 'Verbal Warning', value: 'Verbal Warning' },
          { name: 'Written Warning', value: 'Written Warning' },
          { name: 'Strike', value: 'Strike' },
          { name: 'Final Warning', value: 'Final Warning' },
          { name: 'Staff Suspension', value: 'Staff Suspension' },
          { name: 'Staff Blacklist', value: 'Staff Blacklist' },
          { name: 'Permanent Staff Removal', value: 'Permanent Staff Removal' }
        )
    )
    .addStringOption(opt => opt.setName('reason').setDescription('Reason for the disciplinary sanction').setRequired(true))
    .addBooleanOption(opt => opt.setName('appealable').setDescription('Can this infraction be formally appealed?').setRequired(true)),

  async execute(interaction) {
    if (!hasPermission(interaction.member, PERMISSION_LEVELS.INTERNAL_AFFAIRS)) {
      return interaction.reply({ content: '❌ Only Internal Affairs, HR, or Directive can issue disciplinary infractions.', ephemeral: true });
    }

    const targetUser = interaction.options.getUser('user');
    const punishment = interaction.options.getString('punishment');
    const reason = interaction.options.getString('reason');
    const appealable = interaction.options.getBoolean('appealable');

    const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
    if (targetMember && !canModerateMember(interaction.member, targetMember)) {
      return interaction.reply({ content: '❌ You cannot discipline someone of equal or higher staff authorization.', ephemeral: true });
    }

    const caseId = `INF-${Date.now().toString(36).toUpperCase()}`;
    const nowIso = new Date().toISOString();

    // Create embed
    const embed = createEmbed({
      title: '⚖️ Staff Infraction',
      description: 'The High Ranking Team has decided to take disciplinary action against you.',
      category: 'infractions',
      color: 0xE63946,
      fields: [
        { name: 'Issued By', value: `<@${interaction.user.id}>`, inline: true },
        { name: 'User', value: `<@${targetUser.id}>`, inline: true },
        { name: 'Punishment', value: `**${punishment}**`, inline: true },
        { name: 'Case ID', value: `\`${caseId}\``, inline: true },
        { name: 'Appealable', value: appealable ? 'Yes' : 'No', inline: true },
        { name: 'Date & Time', value: `<t:${Math.floor(Date.now() / 1000)}:f>`, inline: true },
        { name: 'Reason', value: reason, inline: false }
      ]
    });

    // Save into SQLite
    db.prepare(`
      INSERT INTO infractions (case_id, user_id, issued_by, punishment, reason, appealable, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'active', ?)
    `).run(caseId, targetUser.id, interaction.user.id, punishment, reason, appealable ? 1 : 0, nowIso);

    // Update staff profile infraction count
    db.prepare(`
      INSERT INTO staff_profiles (user_id, infractions_count, created_at)
      VALUES (?, 1, ?)
      ON CONFLICT(user_id) DO UPDATE SET infractions_count = infractions_count + 1
    `).run(targetUser.id, nowIso);

    // Try to open a private disciplinary thread in infraction log channel
    let threadCreated = false;
    if (config.staff.infractionLogChannelId) {
      try {
        const logChan = interaction.guild.channels.cache.get(config.staff.infractionLogChannelId);
        if (logChan && logChan.isTextBased()) {
          const logMsg = await logChan.send({ embeds: [embed] });
          if (logChan.type === ChannelType.GuildText) {
            const thread = await logMsg.startThread({
              name: `case-${caseId}-${targetUser.username}`,
              autoArchiveDuration: 1440
            });
            await thread.send(`🔒 Private Case Discussion for \`${caseId}\` | Target: <@${targetUser.id}> | Issuer: <@${interaction.user.id}>`);
            threadCreated = true;
          }
        }
      } catch (e) {
        console.error('Failed to log infraction to channel:', e);
      }
    }

    // DM the user
    try {
      await targetUser.send({ embeds: [embed] });
    } catch (e) {
      // DMs closed
    }

    logAudit(interaction.user.id, 'ISSUE_INFRACTION', targetUser.id, `${punishment}: ${reason} (Case: ${caseId})`);

    return interaction.reply({
      embeds: [successEmbed('Infraction Logged', `Disciplinary case \`${caseId}\` for <@${targetUser.id}> has been recorded and published to IA records.`)],
      ephemeral: true
    });
  }
};
