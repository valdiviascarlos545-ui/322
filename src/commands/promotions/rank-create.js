const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { PERMISSION_LEVELS, hasPermission, logAudit } = require('../../utils/permissions');
const db = require('../../../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rank-create')
    .setDescription('Register a Discord role into the database staff hierarchy system')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addRoleOption(opt => opt.setName('role').setDescription('Discord role').setRequired(true))
    .addIntegerOption(opt => opt.setName('level').setDescription('Hierarchy level (e.g. 1=Trainee, 10=Directive)').setRequired(true))
    .addStringOption(opt =>
      opt.setName('group')
        .setDescription('Permission group')
        .setRequired(true)
        .addChoices(
          { name: 'Directive Team', value: 'Directive' },
          { name: 'Management Team', value: 'Management' },
          { name: 'Human Resources', value: 'Human Resources' },
          { name: 'Internal Affairs', value: 'Internal Affairs' },
          { name: 'Administration', value: 'Administration' },
          { name: 'Moderation', value: 'Moderation' },
          { name: 'Trainers', value: 'Trainers' },
          { name: 'Support Staff', value: 'Support Staff' },
          { name: 'Trainees', value: 'Trainees' }
        )
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, PERMISSION_LEVELS.ADMINISTRATION)) {
      return interaction.reply({ content: '❌ You do not have permission to create rank tiers.', ephemeral: true });
    }

    const role = interaction.options.getRole('role');
    const level = interaction.options.getInteger('level');
    const group = interaction.options.getString('group');

    db.prepare(`
      INSERT INTO ranks (role_id, rank_name, level, permissions_group)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(role_id) DO UPDATE SET
        rank_name = excluded.rank_name,
        level = excluded.level,
        permissions_group = excluded.permissions_group
    `).run(role.id, role.name, level, group);

    logAudit(interaction.user.id, 'CREATE_RANK', role.id, `Created Rank ${role.name} Level ${level} (${group})`);

    return interaction.reply({
      embeds: [successEmbed('Rank Registered', `Role <@&${role.id}> has been registered as **Level ${level}** in permission group **${group}**.`)]
    });
  }
};
