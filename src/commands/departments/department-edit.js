const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { PERMISSION_LEVELS, hasPermission, logAudit } = require('../../utils/permissions');
const db = require('../../../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('department-edit')
    .setDescription('Update configurations for an existing department')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(opt => opt.setName('id').setDescription('Department ID (e.g. nypd)').setRequired(true))
    .addStringOption(opt => opt.setName('name').setDescription('Updated name').setRequired(false))
    .addStringOption(opt => opt.setName('description').setDescription('Updated description').setRequired(false))
    .addBooleanOption(opt => opt.setName('whitelisted').setDescription('Whitelist status').setRequired(false))
    .addRoleOption(opt => opt.setName('leadership_role').setDescription('Updated leadership role').setRequired(false))
    .addRoleOption(opt => opt.setName('member_role').setDescription('Updated member role').setRequired(false)),

  async execute(interaction) {
    if (!hasPermission(interaction.member, PERMISSION_LEVELS.ADMINISTRATION)) {
      return interaction.reply({ content: '❌ Only Administration or Directive can edit department settings.', ephemeral: true });
    }

    const id = interaction.options.getString('id').toLowerCase();
    const dept = db.prepare('SELECT * FROM departments WHERE dept_id = ?').get(id);

    if (!dept) {
      return interaction.reply({ embeds: [errorEmbed('Department Not Found', `No department with ID \`${id}\` was found.`)], ephemeral: true });
    }

    const name = interaction.options.getString('name') || dept.name;
    const description = interaction.options.getString('description') || dept.description;
    const whitelisted = interaction.options.getBoolean('whitelisted') !== null ? (interaction.options.getBoolean('whitelisted') ? 1 : 0) : dept.whitelisted;
    const leadershipRole = interaction.options.getRole('leadership_role');
    const memberRole = interaction.options.getRole('member_role');

    db.prepare(`
      UPDATE departments
      SET name = ?, description = ?, whitelisted = ?, leadership_role_id = ?, member_role_id = ?
      WHERE dept_id = ?
    `).run(
      name,
      description,
      whitelisted,
      leadershipRole ? leadershipRole.id : dept.leadership_role_id,
      memberRole ? memberRole.id : dept.member_role_id,
      id
    );

    logAudit(interaction.user.id, 'EDIT_DEPARTMENT', id, `Updated settings for ${id}`);

    return interaction.reply({
      embeds: [successEmbed('Department Updated', `Department **${name}** (\`${id}\`) settings updated successfully.`)]
    });
  }
};
