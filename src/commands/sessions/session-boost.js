const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { PERMISSION_LEVELS, hasPermission } = require('../../utils/permissions');
const config = require('../../../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('session-boost')
    .setDescription('Call for a server boost / fill to populate the ER:LC private server')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    if (!hasPermission(interaction.member, PERMISSION_LEVELS.SUPPORT_STAFF)) {
      return interaction.reply({ content: '❌ Only staff can call for session boosts.', ephemeral: true });
    }

    const sessionRolePing = config.community.sessionNotificationRoleId ? `<@&${config.community.sessionNotificationRoleId}>` : '@everyone';

    const embed = createEmbed({
      title: '🚀 Server Boost Needed — Let\'s Fill the Server! 🚀',
      description: `We are currently filling up our private server to run major priority calls, NYPD traffic divisions, and FDNY scenarios!\n\n` +
        `If you have free time, jump into Liberty County now and help us hit maximum server capacity!\n\n` +
        `Click below to join instantly:`,
      category: 'sessions',
      color: 0xF1C40F
    });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('🎮 Join In-Game Now')
        .setStyle(ButtonStyle.Link)
        .setURL(config.prc.joinUrl)
    );

    const targetChannel = config.community.sessionChannelId
      ? interaction.guild.channels.cache.get(config.community.sessionChannelId) || interaction.channel
      : interaction.channel;

    await targetChannel.send({ content: sessionRolePing, embeds: [embed], components: [row] });

    return interaction.reply({ content: `✅ Server boost announcement dispatched to <#${targetChannel.id}>.`, ephemeral: true });
  }
};
