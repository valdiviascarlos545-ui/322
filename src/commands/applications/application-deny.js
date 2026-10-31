const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const appService = require('../../services/applicationService');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { PERMISSION_LEVELS, hasPermission, logAudit } = require('../../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('application-deny')
    .setDescription('Decline an application and send outcome update to applicant')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addStringOption(option =>
      option.setName('app_id')
        .setDescription('Application ID to deny')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, PERMISSION_LEVELS.SUPPORT_STAFF)) {
      return interaction.reply({ content: '❌ You must be an authorized reviewer to decline applications.', ephemeral: true });
    }

    const appId = interaction.options.getString('app_id').toUpperCase();
    const result = await appService.denyApplication(appId, interaction.member);

    if (!result.success) {
      return interaction.reply({ embeds: [errorEmbed('Denial Failed', result.error)], ephemeral: true });
    }

    logAudit(interaction.user.id, 'DENY_APPLICATION', result.app.user_id, `Denied application ${appId}`);

    return interaction.reply({
      embeds: [
        successEmbed(
          'Application Denied',
          `Application \`${appId}\` (<@${result.app.user_id}>) has been marked **DENIED**.\n` +
          `• Polite notification dispatched to applicant via DM.`
        )
      ]
    });
  }
};
