const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { PERMISSION_LEVELS, hasPermission, logAudit } = require('../../utils/permissions');
const db = require('../../../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('goal-set')
    .setDescription('Configure a member milestone goal and celebration message')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addIntegerOption(opt => opt.setName('target').setDescription('Member count milestone (e.g. 1000)').setRequired(true))
    .addStringOption(opt => opt.setName('message').setDescription('Announcement message to broadcast upon reaching').setRequired(true)),

  async execute(interaction) {
    if (!hasPermission(interaction.member, PERMISSION_LEVELS.ADMINISTRATION)) {
      return interaction.reply({ content: '❌ Only Administration or Directive can set community goals.', ephemeral: true });
    }

    const target = interaction.options.getInteger('target');
    const message = interaction.options.getString('message');

    db.prepare(`
      INSERT INTO server_goals (target_count, type, message, reached)
      VALUES (?, 'members', ?, 0)
      ON CONFLICT(target_count) DO UPDATE SET message = excluded.message
    `).run(target, message);

    logAudit(interaction.user.id, 'SET_GOAL', null, `Set goal milestone: ${target} members`);

    return interaction.reply({
      embeds: [successEmbed('Goal Configured', `Member milestone **${target.toLocaleString()} members** saved. The bot will automatically announce in the goals channel when reached.`)],
      ephemeral: true
    });
  }
};
