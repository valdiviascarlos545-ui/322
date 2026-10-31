const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { createEmbed, successEmbed } = require('../../utils/embedBuilder');
const { PERMISSION_LEVELS, hasPermission, logAudit } = require('../../utils/permissions');
const config = require('../../../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('session-vote')
    .setDescription('Launch a community roleplay session vote poll')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption(opt => opt.setName('goal').setDescription('Upvote threshold needed to launch (e.g. 10)').setRequired(false)),

  async execute(interaction) {
    if (!hasPermission(interaction.member, PERMISSION_LEVELS.SUPPORT_STAFF)) {
      return interaction.reply({ content: '❌ Only staff can initiate session votes.', ephemeral: true });
    }

    const goal = interaction.options.getInteger('goal') || 10;
    const sessionRolePing = config.community.sessionNotificationRoleId ? `<@&${config.community.sessionNotificationRoleId}>` : '@everyone';

    const embed = createEmbed({
      title: '🗳️ New York Roleplay — Session Vote',
      description: `Staff is considering launching an official **ER:LC Private Server Roleplay Session**!\n\n` +
        `Vote below if you are available and ready to patrol or roleplay.\n\n` +
        `🎯 **Goal:** **${goal} Votes** required to start the session.\n` +
        `Hosted by: <@${interaction.user.id}>`,
      category: 'sessions',
      color: 0x3A86FF
    });

    const targetChannel = config.community.sessionChannelId
      ? interaction.guild.channels.cache.get(config.community.sessionChannelId) || interaction.channel
      : interaction.channel;

    const msg = await targetChannel.send({ content: sessionRolePing, embeds: [embed] });
    await msg.react('👍');
    await msg.react('👎');

    logAudit(interaction.user.id, 'SESSION_VOTE', targetChannel.id, `Started session vote with goal ${goal}`);

    return interaction.reply({ content: `✅ Session vote launched in <#${targetChannel.id}> with goal of ${goal} votes.`, ephemeral: true });
  }
};
