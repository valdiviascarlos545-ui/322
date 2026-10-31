const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createEmbed, successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { PERMISSION_LEVELS, hasPermission, logAudit } = require('../../utils/permissions');
const db = require('../../../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('department-accept')
    .setDescription('Approve a candidate\'s department application and grant department roles')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addStringOption(opt => opt.setName('department').setDescription('Department ID (e.g. nypd)').setRequired(true))
    .addUserOption(opt => opt.setName('user').setDescription('Applicant to accept').setRequired(true)),

  async execute(interaction) {
    const deptId = interaction.options.getString('department').toLowerCase();
    const targetUser = interaction.options.getUser('user');

    const dept = db.prepare('SELECT * FROM departments WHERE dept_id = ?').get(deptId);
    if (!dept) {
      return interaction.reply({ embeds: [errorEmbed('Department Not Found', `No department found with ID \`${deptId}\`.`)], ephemeral: true });
    }

    // Check leadership permission
    const isDeptLeader = dept.leadership_role_id && interaction.member.roles.cache.has(dept.leadership_role_id);
    if (!isDeptLeader && !hasPermission(interaction.member, PERMISSION_LEVELS.ADMINISTRATION)) {
      return interaction.reply({ content: '❌ You must be Department Command or Administration to accept applicants.', ephemeral: true });
    }

    const app = db.prepare('SELECT * FROM department_applications WHERE dept_id = ? AND user_id = ? AND status = \'pending\'').get(deptId, targetUser.id);
    if (!app) {
      return interaction.reply({ embeds: [errorEmbed('No Pending Application', `No pending application found for <@${targetUser.id}> in **${dept.name}**.`)], ephemeral: true });
    }

    db.prepare('UPDATE department_applications SET status = \'approved\', reviewer_id = ? WHERE id = ?')
      .run(interaction.user.id, app.id);

    // Add to department_members
    db.prepare(`
      INSERT INTO department_members (dept_id, user_id, rank, joined_at)
      VALUES (?, ?, 'Officer / Member', ?)
      ON CONFLICT(dept_id, user_id) DO UPDATE SET joined_at = excluded.joined_at
    `).run(deptId, targetUser.id, new Date().toISOString());

    // Assign member role if configured
    let roleAssigned = false;
    if (dept.member_role_id && interaction.guild) {
      try {
        const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
        if (member) {
          await member.roles.add(dept.member_role_id);
          roleAssigned = true;
        }
      } catch (e) {
        console.error('Failed to grant department role:', e);
      }
    }

    const acceptEmbed = createEmbed({
      title: `🎉 Department Application Accepted — ${dept.name}`,
      description: `Congratulations <@${targetUser.id}>! Your application to join **${dept.emoji} ${dept.name}** has been accepted by Department Leadership.`,
      category: 'departments',
      color: 0x2ECC71,
      fields: [
        { name: 'Department', value: dept.name, inline: true },
        { name: 'Approved By', value: `<@${interaction.user.id}>`, inline: true },
        { name: 'Department Role', value: roleAssigned ? `<@&${dept.member_role_id}> granted` : 'No auto-role configured', inline: true }
      ]
    });

    try {
      await targetUser.send({ embeds: [acceptEmbed] });
    } catch (e) {}

    logAudit(interaction.user.id, 'ACCEPT_DEPT_APP', targetUser.id, `Accepted into ${dept.name}`);

    return interaction.reply({
      embeds: [successEmbed('Applicant Accepted', `<@${targetUser.id}> has been officially admitted into **${dept.name}**!`)]
    });
  }
};
