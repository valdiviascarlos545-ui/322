const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { createEmbed, successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { PERMISSION_LEVELS, hasPermission, logAudit } = require('../../utils/permissions');
const config = require('../../../config');
const db = require('../../../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('investigation')
    .setDescription('Initiate or query a confidential Internal Affairs inquiry into staff misconduct')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addSubcommand(sub =>
      sub.setName('open')
        .setDescription('Open a new confidential IA case')
        .addUserOption(opt => opt.setName('target').setDescription('Subject of the inquiry').setRequired(true))
        .addStringOption(opt => opt.setName('title').setDescription('Brief case title').setRequired(true))
        .addStringOption(opt => opt.setName('details').setDescription('Detailed allegations and evidence overview').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('status')
        .setDescription('Inspect an active case')
        .addStringOption(opt => opt.setName('case_id').setDescription('Case ID').setRequired(true))
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, PERMISSION_LEVELS.INTERNAL_AFFAIRS)) {
      return interaction.reply({ content: '❌ Access restricted to Internal Affairs Directorate only.', ephemeral: true });
    }

    const sub = interaction.options.getSubcommand();

    if (sub === 'open') {
      const targetUser = interaction.options.getUser('target');
      const title = interaction.options.getString('title');
      const details = interaction.options.getString('details');
      const caseId = `IA-${Date.now().toString(36).toUpperCase()}`;
      const nowIso = new Date().toISOString();

      db.prepare(`
        INSERT INTO investigations (case_id, target_id, lead_investigator_id, title, details, status, created_at)
        VALUES (?, ?, ?, ?, ?, 'open', ?)
      `).run(caseId, targetUser.id, interaction.user.id, title, details, nowIso);

      const embed = createEmbed({
        title: `🕵️ Internal Affairs Case Initiated — ${caseId}`,
        description: 'A confidential Internal Affairs investigation has been opened.',
        category: 'infractions',
        color: 0x1D3557,
        fields: [
          { name: 'Subject of Inquiry', value: `<@${targetUser.id}>`, inline: true },
          { name: 'Lead Investigator', value: `<@${interaction.user.id}>`, inline: true },
          { name: 'Title', value: title, inline: false },
          { name: 'Initial Summary', value: details, inline: false }
        ]
      });

      if (config.staff.iaLogChannelId) {
        try {
          const iaChan = interaction.guild.channels.cache.get(config.staff.iaLogChannelId);
          if (iaChan && iaChan.isTextBased()) await iaChan.send({ embeds: [embed] });
        } catch (e) {}
      }

      logAudit(interaction.user.id, 'OPEN_INVESTIGATION', targetUser.id, `Case ${caseId}: ${title}`);

      return interaction.reply({
        embeds: [successEmbed('Investigation Opened', `Case file \`${caseId}\` created in confidential IA archives.`)],
        ephemeral: true
      });
    }

    if (sub === 'status') {
      const caseId = interaction.options.getString('case_id').toUpperCase();
      const file = db.prepare('SELECT * FROM investigations WHERE case_id = ?').get(caseId);

      if (!file) {
        return interaction.reply({ embeds: [errorEmbed('File Not Found', `No IA case found with ID \`${caseId}\`.`)], ephemeral: true });
      }

      const embed = createEmbed({
        title: `🕵️ Case Record: ${file.case_id}`,
        description: `**Subject:** <@${file.target_id}>\n` +
          `**Lead Investigator:** <@${file.lead_investigator_id}>\n` +
          `**Status:** \`${file.status.toUpperCase()}\`\n` +
          `**Opened:** <t:${Math.floor(new Date(file.created_at).getTime() / 1000)}:F>\n\n` +
          `**Title:** ${file.title}\n` +
          `**Details:**\n${file.details}`,
        category: 'infractions'
      });

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }
};
