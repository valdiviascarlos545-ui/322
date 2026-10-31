const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { PERMISSION_LEVELS, hasPermission } = require('../../utils/permissions');
const config = require('../../../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('session-full')
    .setDescription('Announce that the ER:LC private server has reached maximum player capacity')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    if (!hasPermission(interaction.member, PERMISSION_LEVELS.SUPPORT_STAFF)) {
      return interaction.reply({ content: '❌ Only staff can dispatch server capacity updates.', ephemeral: true });
    }

    const embed = createEmbed({
      title: '🔥 Private Server is FULL! (Queue Active) 🔥',
      description: `The **New York Roleplay** private server has reached maximum capacity!\n\n` +
        `If you are trying to join, please wait patiently in the Roblox game server queue. Slots open up as players disconnect.\n\n` +
        `Thank you to everyone for making this an active session!`,
      category: 'sessions',
      color: 0xE63946
    });

    const targetChannel = config.community.sessionChannelId
      ? interaction.guild.channels.cache.get(config.community.sessionChannelId) || interaction.channel
      : interaction.channel;

    await targetChannel.send({ embeds: [embed] });

    return interaction.reply({ content: `✅ Server full alert published to <#${targetChannel.id}>.`, ephemeral: true });
  }
};
