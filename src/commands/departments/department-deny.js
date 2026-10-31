const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createEmbed, successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { PERMISSION_LEVELS, hasPermission, logAudit } = require('../../utils/permissions');
const db = require('../../../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('department-deny')
    .setDescription('Decline a candidate\'s department application')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addStringOption(opt => opt.setName('department').setDescription('Department ID (e.g. nypd)').setRequired(true))
    .addUserOption(opt => opt.setName('user').setDescription('Applicant').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Reason for decline (optional)').setRequired(false)),

  async execute(interaction) {
    const deptId = interaction.options.getString('department').toLowerCase();
    const targetUser = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'Application standards were not met';

    const dept = db.prepare('SELECT * FROM departments WHERE dept_id = ?').get(deptId);
    if (!dept) {
      return interaction.reply({ embeds: [errorEmbed('Department Not Found', `No department found with ID \`${deptId}\`.`)], ephemeral: true });
    }

    const isDeptLeader = dept.leadership_role_id && interaction.member.roles.cache.has(dept.leadership_role_id);
    if (!isDeptLeader && !hasPermission(interaction.member, PERMISSION_LEVELS.ADMINISTRATION)) {
      return interaction.reply({ content: '❌ You must be Department Command or Administration to deny applicants.', ephemeral: true });
    }

    const app = db.prepare('SELECT * FROM department_applications WHERE dept_id = ? AND user_id = ? AND status = \'pending\'').get(deptId, targetUser.id);
    if (!app) {
      return interaction.reply({ embeds: [errorEmbed('No Pending Application', `No pending application found for <@${targetUser.id}> in **${dept.name}**.`)], ephemeral: true });
    }

    db.prepare('UPDATE department_applications SET status = \'denied\', reviewer_id = ? WHERE id = ?')
      .run(interaction.user.id, app.id);

    const denyEmbed = createEmbed({
      title: `Department Application Update — ${dept.name}`,
      description: `Thank you for your interest in joining **${dept.emoji} ${dept.name}**.\n\nAt this time, Department Leadership has chosen not to move forward with your application.\n\n**Reason:** ${reason}\n\nYou may reapply in the future.`,
      category: 'departments',
      color: 0xE63946
    });

    try {
      await targetUser.send({ embeds: [denyEmbed] });
    } catch (e) {}

    logAudit(interaction.user.id, 'DENY_DEPT_APP', targetUser.id, `Denied from ${dept.name}: ${reason}`);

    return interaction.reply({
      embeds: [successEmbed('Application Denied', `Application for <@${targetUser.id}> in **${dept.name}** has been marked denied.`)]
    });
  }
};
