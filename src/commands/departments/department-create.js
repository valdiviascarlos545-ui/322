const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { PERMISSION_LEVELS, hasPermission, logAudit } = require('../../utils/permissions');
const db = require('../../../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('department-create')
    .setDescription('Register a new agency or division into the New York department registry')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(opt => opt.setName('id').setDescription('Short identifier (e.g. nypd, fbi, dot)').setRequired(true))
    .addStringOption(opt => opt.setName('name').setDescription('Full official department name').setRequired(true))
    .addStringOption(opt => opt.setName('emoji').setDescription('Representative emoji (e.g. 👮, 🚒, 🚔)').setRequired(true))
    .addStringOption(opt => opt.setName('description').setDescription('Department overview and mission').setRequired(true))
    .addBooleanOption(opt => opt.setName('whitelisted').setDescription('Requires application/whitelist?').setRequired(true))
    .addRoleOption(opt => opt.setName('leadership_role').setDescription('Command leadership role').setRequired(false))
    .addRoleOption(opt => opt.setName('member_role').setDescription('Department member role').setRequired(false)),

  async execute(interaction) {
    if (!hasPermission(interaction.member, PERMISSION_LEVELS.ADMINISTRATION)) {
      return interaction.reply({ content: '❌ Only Administration or Directive can create departments.', ephemeral: true });
    }

    const id = interaction.options.getString('id').toLowerCase().replace(/[^a-z0-9_-]/g, '');
    const name = interaction.options.getString('name');
    const emoji = interaction.options.getString('emoji');
    const description = interaction.options.getString('description');
    const whitelisted = interaction.options.getBoolean('whitelisted');
    const leadershipRole = interaction.options.getRole('leadership_role');
    const memberRole = interaction.options.getRole('member_role');

    db.prepare(`
      INSERT INTO departments (dept_id, name, emoji, description, whitelisted, leadership_role_id, member_role_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(dept_id) DO UPDATE SET
        name = excluded.name,
        emoji = excluded.emoji,
        description = excluded.description,
        whitelisted = excluded.whitelisted,
        leadership_role_id = excluded.leadership_role_id,
        member_role_id = excluded.member_role_id
    `).run(id, name, emoji, description, whitelisted ? 1 : 0, leadershipRole?.id || null, memberRole?.id || null);

    logAudit(interaction.user.id, 'CREATE_DEPARTMENT', id, `Registered department ${name}`);

    return interaction.reply({
      embeds: [successEmbed('Department Registered', `**${emoji} ${name}** (\`${id}\`) was saved to the New York Roleplay department registry.`)]
    });
  }
};
