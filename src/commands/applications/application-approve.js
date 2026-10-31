const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const appService = require('../../services/applicationService');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { PERMISSION_LEVELS, hasPermission, logAudit } = require('../../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('application-approve')
    .setDescription('Approve an application, grant Trainee role, and dispatch congratulations')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addStringOption(option =>
      option.setName('app_id')
        .setDescription('Application ID to approve')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, PERMISSION_LEVELS.SUPPORT_STAFF)) {
      return interaction.reply({ content: '❌ You must be an authorized reviewer to approve applications.', ephemeral: true });
    }

    const appId = interaction.options.getString('app_id').toUpperCase();
    const result = await appService.approveApplication(appId, interaction.member);

    if (!result.success) {
      return interaction.reply({ embeds: [errorEmbed('Approval Failed', result.error)], ephemeral: true });
    }

    logAudit(interaction.user.id, 'APPROVE_APPLICATION', result.app.user_id, `Approved application ${appId}`);

    return interaction.reply({
      embeds: [
        successEmbed(
          'Application Approved',
          `Application \`${appId}\` (<@${result.app.user_id}>) has been **APPROVED**.\n` +
          `• Trainee Role: ${result.roleAssigned ? 'Granted ✅' : 'Manual Assignment Required'}\n` +
          `• Acceptance message dispatched to applicant via DM.`
        )
      ]
    });
  }
};
