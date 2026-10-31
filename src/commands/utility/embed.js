const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { PERMISSION_LEVELS, hasPermission, logAudit } = require('../../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('embed')
    .setDescription('Publish a styled New York Roleplay embed message with custom title and description')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addStringOption(opt => opt.setName('title').setDescription('Embed title').setRequired(true))
    .addStringOption(opt => opt.setName('description').setDescription('Embed body text (supports \\n for linebreaks)').setRequired(true))
    .addStringOption(opt => opt.setName('color').setDescription('Hex color code (e.g. 1D3557, 2ECC71)').setRequired(false))
    .addStringOption(opt => opt.setName('image_url').setDescription('Custom image/banner URL').setRequired(false)),

  async execute(interaction) {
    if (!hasPermission(interaction.member, PERMISSION_LEVELS.SUPPORT_STAFF)) {
      return interaction.reply({ content: '❌ Only staff can create custom embeds.', ephemeral: true });
    }

    const title = interaction.options.getString('title');
    const description = interaction.options.getString('description').replace(/\\n/g, '\n');
    const colorHex = interaction.options.getString('color');
    const imageUrl = interaction.options.getString('image_url');

    let colorNum = undefined;
    if (colorHex) {
      colorNum = parseInt(colorHex.replace('#', ''), 16);
    }

    const embed = createEmbed({
      title,
      description,
      color: colorNum,
      topBannerUrl: imageUrl || undefined,
      category: 'moderation'
    });

    await interaction.channel.send({ embeds: [embed] });
    logAudit(interaction.user.id, 'CUSTOM_EMBED', interaction.channel.id, `Sent embed: ${title}`);

    return interaction.reply({ content: '✅ Custom embed dispatched to channel.', ephemeral: true });
  }
};
