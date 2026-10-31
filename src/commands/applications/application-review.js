const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { createEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { PERMISSION_LEVELS, hasPermission } = require('../../utils/permissions');
const db = require('../../../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('application-review')
    .setDescription('Review a specific submitted staff application by ID')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addStringOption(option =>
      option.setName('app_id')
        .setDescription('Application ID (e.g. APP-...)')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, PERMISSION_LEVELS.SUPPORT_STAFF)) {
      return interaction.reply({ content: '❌ Only staff and review teams can review applications.', ephemeral: true });
    }

    const appId = interaction.options.getString('app_id').toUpperCase();
    const app = db.prepare('SELECT * FROM applications WHERE app_id = ?').get(appId);

    if (!app) {
      return interaction.reply({ embeds: [errorEmbed('Application Not Found', `No application found with ID \`${appId}\`.`)], ephemeral: true });
    }

    const answers = db.prepare('SELECT * FROM application_answers WHERE app_id = ? ORDER BY question_num ASC').all(appId);

    const embed = createEmbed({
      title: `📋 Application Review — ${app.app_id}`,
      description: `**Applicant:** <@${app.user_id}> (\`${app.user_tag}\`)\n` +
        `**Status:** \`${app.status.toUpperCase()}\`\n` +
        `**Submitted:** <t:${Math.floor(new Date(app.submitted_at).getTime() / 1000)}:R>\n` +
        `${app.reviewed_at ? `**Reviewed:** <t:${Math.floor(new Date(app.reviewed_at).getTime() / 1000)}:R> by <@${app.reviewer_id}>\n` : ''}`,
      category: 'applications',
      fields: answers.map(a => ({
        name: `Q${a.question_num}: ${a.question_text}`,
        value: a.answer_text.length > 1024 ? a.answer_text.substring(0, 1020) + '...' : a.answer_text,
        inline: false
      }))
    });

    const components = [];
    if (app.status === 'pending') {
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`app_approve_${app.app_id}`)
          .setLabel('Approve')
          .setEmoji('🟢')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`app_deny_${app.app_id}`)
          .setLabel('Deny')
          .setEmoji('🔴')
          .setStyle(ButtonStyle.Danger)
      );
      components.push(row);
    }

    return interaction.reply({ embeds: [embed], components, ephemeral: true });
  }
};
