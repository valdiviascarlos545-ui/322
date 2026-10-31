const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { successEmbed } = require('../../utils/embedBuilder');
const { PERMISSION_LEVELS, hasPermission, logAudit } = require('../../utils/permissions');
const config = require('../../../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('welcome-setup')
    .setDescription('Configure channels for automated member welcome and departure logs')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addChannelOption(opt => opt.setName('welcome_channel').setDescription('Channel to greet new arrivals').addChannelTypes(ChannelType.GuildText).setRequired(true))
    .addChannelOption(opt => opt.setName('goodbye_channel').setDescription('Channel for departure announcements').addChannelTypes(ChannelType.GuildText).setRequired(false)),

  async execute(interaction) {
    if (!hasPermission(interaction.member, PERMISSION_LEVELS.ADMINISTRATION)) {
      return interaction.reply({ content: '❌ You must be Administration or Directive to configure welcome channels.', ephemeral: true });
    }

    const welcome = interaction.options.getChannel('welcome_channel');
    const goodbye = interaction.options.getChannel('goodbye_channel');

    config.community.welcomeChannelId = welcome.id;
    if (goodbye) config.community.goodbyeChannelId = goodbye.id;

    logAudit(interaction.user.id, 'WELCOME_SETUP', welcome.id, `Set welcome channel: #${welcome.name}`);

    return interaction.reply({
      embeds: [successEmbed('Welcome Routing Configured', `• Welcome Channel: <#${welcome.id}>\n• Goodbye Channel: ${goodbye ? `<#${goodbye.id}>` : '*Not configured*'}`)],
      ephemeral: true
    });
  }
};
