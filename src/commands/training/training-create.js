const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { createEmbed, errorEmbed, successEmbed } = require('../../utils/embedBuilder');
const { PERMISSION_LEVELS, hasPermission, logAudit } = require('../../utils/permissions');
const config = require('../../../config');
const db = require('../../../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('training-create')
    .setDescription('Host and schedule an official Academy Training session')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addStringOption(opt => opt.setName('topic').setDescription('Training curriculum / module').setRequired(true))
    .addStringOption(opt => opt.setName('start_time').setDescription('Scheduled start time (e.g. In 30 Minutes, 7:00 PM EST)').setRequired(true))
    .addStringOption(opt => opt.setName('server_link').setDescription('ER:LC Private Server Link (optional)').setRequired(false)),

  async execute(interaction) {
    if (!hasPermission(interaction.member, PERMISSION_LEVELS.TRAINER)) {
      return interaction.reply({ content: '❌ Only verified Trainers or Command can host training sessions.', ephemeral: true });
    }

    const topic = interaction.options.getString('topic');
    const startTime = interaction.options.getString('start_time');
    const serverLink = interaction.options.getString('server_link') || config.prc.joinUrl;

    const sessionId = `TRN-${Date.now().toString(36).toUpperCase()}`;
    const traineeRolePing = config.applications.traineeRoleId ? `<@&${config.applications.traineeRoleId}>` : '@Trainee';

    const embed = createEmbed({
      title: '🚨 Training Notice',
      description: `Greetings, ${traineeRolePing}!\n\n` +
        `Now is the time to attend a training. If you are a Trainee wishing to officially join the staff team, you must finish training within the configured deadline, initially **7 days**, otherwise it may result in termination.\n\n` +
        `**Instructions:**\n` +
        `• Click the **Join Game** button below.\n` +
        `• Go to the Police Team briefing room and wait for your trainer.\n` +
        `• Wear the designated staff uniform.\n\n` +
        `**Conducted by:** <@${interaction.user.id}>\n` +
        `**Topic:** ${topic}\n` +
        `**Starting:** ${startTime}\n` +
        `**Attending:** None yet\n` +
        `**Status:** \`Scheduled\``,
      category: 'training'
    });

    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`training_join_${sessionId}`)
        .setLabel('Join Training')
        .setEmoji('✋')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`training_leave_${sessionId}`)
        .setLabel('Leave Training')
        .setEmoji('❌')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setLabel('Join Game')
        .setEmoji('🎮')
        .setStyle(ButtonStyle.Link)
        .setURL(serverLink)
    );

    const targetChannel = config.training.channelId
      ? interaction.guild.channels.cache.get(config.training.channelId) || interaction.channel
      : interaction.channel;

    const msg = await targetChannel.send({
      content: traineeRolePing,
      embeds: [embed],
      components: [buttons]
    });

    const nowIso = new Date().toISOString();
    db.prepare(`
      INSERT INTO training_sessions (session_id, host_id, topic, scheduled_time, status, server_link, message_id, channel_id, created_at)
      VALUES (?, ?, ?, ?, 'Scheduled', ?, ?, ?, ?)
    `).run(sessionId, interaction.user.id, topic, startTime, serverLink, msg.id, targetChannel.id, nowIso);

    logAudit(interaction.user.id, 'CREATE_TRAINING', null, `Created session ${sessionId}: ${topic}`);

    return interaction.reply({
      embeds: [successEmbed('Training Scheduled', `Training session **#${sessionId}** announced in <#${targetChannel.id}>.`)],
      ephemeral: true
    });
  }
};
