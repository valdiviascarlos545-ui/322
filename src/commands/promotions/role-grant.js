const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { PERMISSION_LEVELS, hasPermission, logAudit } = require('../../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('role-grant')
    .setDescription('Grant a specific role to a user with safety and hierarchy checks')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addUserOption(opt => opt.setName('user').setDescription('Target user').setRequired(true))
    .addRoleOption(opt => opt.setName('role').setDescription('Role to grant').setRequired(true)),

  async execute(interaction) {
    if (!hasPermission(interaction.member, PERMISSION_LEVELS.ADMINISTRATION)) {
      return interaction.reply({ content: '❌ You do not have permission to grant roles directly.', ephemeral: true });
    }

    const targetUser = interaction.options.getUser('user');
    const role = interaction.options.getRole('role');

    // Hierarchy check: cannot grant role higher than executor's highest role
    if (role.position >= interaction.member.roles.highest.position && interaction.user.id !== interaction.guild.ownerId) {
      return interaction.reply({ content: '❌ You cannot grant a role equal to or higher than your own highest role.', ephemeral: true });
    }

    if (role.position >= interaction.guild.members.me.roles.highest.position) {
      return interaction.reply({ content: '❌ Bot role is below the requested role in server hierarchy.', ephemeral: true });
    }

    const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
    if (!member) {
      return interaction.reply({ embeds: [errorEmbed('User Not Found', 'Target user is not in this guild.')], ephemeral: true });
    }

    try {
      await member.roles.add(role);
      logAudit(interaction.user.id, 'ROLE_GRANT', targetUser.id, `Granted role ${role.name}`);

      return interaction.reply({
        embeds: [successEmbed('Role Granted', `Successfully granted <@&${role.id}> to <@${targetUser.id}>.`)]
      });
    } catch (err) {
      return interaction.reply({ embeds: [errorEmbed('Failed to Grant Role', err.message)], ephemeral: true });
    }
  }
};
