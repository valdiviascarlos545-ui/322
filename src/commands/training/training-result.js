const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createEmbed, successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { PERMISSION_LEVELS, hasPermission, logAudit } = require('../../utils/permissions');
const config = require('../../../config');
const db = require('../../../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('training-result')
    .setDescription('Grade a trainee (Pass/Fail) and optionally promote to official staff')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addStringOption(opt => opt.setName('session_id').setDescription('Training Session ID').setRequired(true))
    .addUserOption(opt => opt.setName('trainee').setDescription('The trainee member').setRequired(true))
    .addStringOption(opt =>
      opt.setName('status')
        .setDescription('Evaluation outcome')
        .setRequired(true)
        .addChoices(
          { name: '🟢 Passed', value: 'Passed' },
          { name: '🔴 Failed', value: 'Failed' }
        )
    )
    .addStringOption(opt => opt.setName('note').setDescription('Trainer evaluation notes').setRequired(true)),

  async execute(interaction) {
    if (!hasPermission(interaction.member, PERMISSION_LEVELS.TRAINER)) {
      return interaction.reply({ content: '❌ Only verified Trainers can record evaluation results.', ephemeral: true });
    }

    const sessionId = interaction.options.getString('session_id').toUpperCase();
    const trainee = interaction.options.getUser('trainee');
    const status = interaction.options.getString('status');
    const note = interaction.options.getString('note');
    const nowIso = new Date().toISOString();

    db.prepare(`
      INSERT INTO training_results (session_id, user_id, trainer_id, status, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(sessionId, trainee.id, interaction.user.id, status, note, nowIso);

    const isPassed = status === 'Passed';

    // If passed, optionally promote from Trainee to Staff role
    let roleActionText = '';
    if (isPassed && interaction.guild) {
      try {
        const traineeMember = await interaction.guild.members.fetch(trainee.id).catch(() => null);
        if (traineeMember) {
          if (config.applications.traineeRoleId && traineeMember.roles.cache.has(config.applications.traineeRoleId)) {
            await traineeMember.roles.remove(config.applications.traineeRoleId).catch(() => {});
          }
          if (config.tickets.staffRoleId) {
            await traineeMember.roles.add(config.tickets.staffRoleId).catch(() => {});
            roleActionText = ' (Promoted to Staff Role)';
          }
        }
      } catch (e) {
        console.error('Error updating trainee roles:', e);
      }
    }

    const resultEmbed = createEmbed({
      title: '📋 Classroom Results',
      description: `Official training evaluation for session **#${sessionId}**.`,
      category: 'training',
      color: isPassed ? 0x2ECC71 : 0xE63946,
      fields: [
        { name: 'User', value: `<@${trainee.id}>`, inline: true },
        { name: 'Status', value: isPassed ? '🟢 Passed' : '🔴 Failed', inline: true },
        { name: 'Signed', value: `<@${interaction.user.id}>`, inline: true },
        { name: 'Note', value: note, inline: false }
      ]
    });

    if (config.training.logChannelId) {
      try {
        const logChan = interaction.guild.channels.cache.get(config.training.logChannelId);
        if (logChan && logChan.isTextBased()) await logChan.send({ embeds: [resultEmbed] });
      } catch (e) {}
    }

    try {
      await trainee.send({ embeds: [resultEmbed] });
    } catch (e) {}

    logAudit(interaction.user.id, 'RECORD_TRAINING_RESULT', trainee.id, `Session ${sessionId} - ${status}: ${note}`);

    return interaction.reply({
      embeds: [successEmbed('Result Logged', `Evaluation for <@${trainee.id}> (${status}${roleActionText}) recorded successfully.`)]
    });
  }
};
