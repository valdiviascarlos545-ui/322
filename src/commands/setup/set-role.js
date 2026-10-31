const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed } = require('../../utils/embedBuilder');
const { PERMISSION_LEVELS, hasPermission, logAudit } = require('../../utils/permissions');
const config = require('../../../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('set-role')
    .setDescription('Configure system role bindings (Directive, HR, IA, Trainee, Verified, etc.)')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(option =>
      option.setName('type')
        .setDescription('The role type to bind')
        .setRequired(true)
        .addChoices(
          { name: 'Directive Team Role', value: 'directive' },
          { name: 'Human Resources Role', value: 'hr' },
          { name: 'Internal Affairs Role', value: 'ia' },
          { name: 'Support Staff / Reviewer Role', value: 'staff' },
          { name: 'Trainer Role', value: 'trainer' },
          { name: 'Trainee Role', value: 'trainee' },
          { name: 'Verified Citizen Role', value: 'verified' },
          { name: 'Unverified Role', value: 'unverified' },
          { name: 'Music DJ Role', value: 'dj' },
          { name: 'Session Notification Role', value: 'session_ping' }
        )
    )
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('The role to assign')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, PERMISSION_LEVELS.ADMINISTRATION)) {
      return interaction.reply({ content: '❌ You do not have permission to modify role bindings.', ephemeral: true });
    }

    const type = interaction.options.getString('type');
    const role = interaction.options.getRole('role');

    if (type === 'directive') {
      config.staff.directiveRoleId = role.id;
      config.tickets.directiveTeamRoleId = role.id;
    } else if (type === 'hr') {
      config.staff.hrRoleId = role.id;
    } else if (type === 'ia') {
      config.staff.iaRoleId = role.id;
    } else if (type === 'staff') {
      config.tickets.staffRoleId = role.id;
      config.applications.reviewerRoleId = role.id;
    } else if (type === 'trainer') {
      config.training.roleId = role.id;
    } else if (type === 'trainee') {
      config.applications.traineeRoleId = role.id;
    } else if (type === 'verified') {
      config.verification.verifiedRoleId = role.id;
    } else if (type === 'unverified') {
      config.verification.unverifiedRoleId = role.id;
    } else if (type === 'dj') {
      config.music.djRoleId = role.id;
    } else if (type === 'session_ping') {
      config.community.sessionNotificationRoleId = role.id;
    }

    logAudit(interaction.user.id, 'SET_ROLE', role.id, `Set role type ${type} to @${role.name}`);

    return interaction.reply({
      embeds: [successEmbed('Role Binding Updated', `Successfully assigned role **${type}** to <@&${role.id}>.`)],
      ephemeral: true
    });
  }
};
