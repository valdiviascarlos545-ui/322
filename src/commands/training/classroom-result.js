const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createEmbed, successEmbed } = require('../../utils/embedBuilder');
const { PERMISSION_LEVELS, hasPermission, logAudit } = require('../../utils/permissions');
const config = require('../../../config');
const db = require('../../../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('classroom-result')
    .setDescription('Publish formal Classroom Results embed for a passed or failed trainee')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addUserOption(opt => opt.setName('user').setDescription('The trainee member').setRequired(true))
    .addStringOption(opt =>
      opt.setName('status')
        .setDescription('Evaluation outcome')
        .setRequired(true)
        .addChoices(
          { name: '🟢 Passed', value: 'Passed' },
          { name: '🔴 Failed', value: 'Failed' }
        )
    )
    .addStringOption(opt => opt.setName('note').setDescription('Trainer note / comment').setRequired(true)),

  async execute(interaction) {
    if (!hasPermission(interaction.member, PERMISSION_LEVELS.TRAINER)) {
      return interaction.reply({ content: '❌ Only verified Trainers can publish classroom results.', ephemeral: true });
    }

    const trainee = interaction.options.getUser('user');
    const status = interaction.options.getString('status');
    const note = interaction.options.getString('note');
    const isPassed = status === 'Passed';
    const nowIso = new Date().toISOString();

    db.prepare(`
      INSERT INTO training_results (session_id, user_id, trainer_id, status, notes, created_at)
      VALUES ('CLASSROOM-DIRECT', ?, ?, ?, ?, ?)
    `).run(trainee.id, interaction.user.id, status, note, nowIso);

    // If passed, optionally promote
    if (isPassed && interaction.guild) {
      try {
        const traineeMember = await interaction.guild.members.fetch(trainee.id).catch(() => null);
        if (traineeMember) {
          if (config.applications.traineeRoleId && traineeMember.roles.cache.has(config.applications.traineeRoleId)) {
            await traineeMember.roles.remove(config.applications.traineeRoleId).catch(() => {});
          }
          if (config.tickets.staffRoleId) {
            await traineeMember.roles.add(config.tickets.staffRoleId).catch(() => {});
          }
        }
      } catch (e) {}
    }

    const embed = createEmbed({
      title: 'Classroom Results',
      category: 'training',
      color: isPassed ? 0x2ECC71 : 0xE63946,
      fields: [
        { name: 'User', value: `<@${trainee.id}>`, inline: true },
        { name: 'Status', value: isPassed ? '🟢 Passed' : '🔴 Failed', inline: true },
        { name: 'Signed', value: `<@${interaction.user.id}>`, inline: true },
        { name: 'Note', value: note, inline: false }
      ]
    });

    // Send to channel
    await interaction.channel.send({ embeds: [embed] });

    // DM the trainee
    try {
      await trainee.send({ embeds: [embed] });
    } catch (e) {}

    logAudit(interaction.user.id, 'PUBLISH_CLASSROOM_RESULT', trainee.id, `${status}: ${note}`);

    return interaction.reply({ content: '✅ Classroom result published and dispatched to member.', ephemeral: true });
  }
};
