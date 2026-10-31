const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed, categoryBanners } = require('../../utils/embedBuilder');
const { PERMISSION_LEVELS, hasPermission, logAudit } = require('../../utils/permissions');
const config = require('../../../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('set-banner')
    .setDescription('Configure top or bottom embed banners globally or per-category')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(option =>
      option.setName('position')
        .setDescription('Top or bottom banner position')
        .setRequired(true)
        .addChoices(
          { name: 'Top Banner', value: 'top' },
          { name: 'Bottom Banner', value: 'bottom' }
        )
    )
    .addStringOption(option =>
      option.setName('url')
        .setDescription('Image URL (PNG, JPG, WebP, or GIF)')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('category')
        .setDescription('Specific category override (optional, defaults to Global)')
        .setRequired(false)
        .addChoices(
          { name: 'Global (All Embeds)', value: 'global' },
          { name: 'Tickets', value: 'tickets' },
          { name: 'Applications', value: 'applications' },
          { name: 'Infractions & IA', value: 'infractions' },
          { name: 'Promotions', value: 'promotions' },
          { name: 'Training', value: 'training' },
          { name: 'Departments', value: 'departments' },
          { name: 'Verification', value: 'verification' },
          { name: 'Sessions', value: 'sessions' },
          { name: 'Giveaways', value: 'giveaways' },
          { name: 'Music', value: 'music' },
          { name: 'Regulations & Rules', value: 'regulations' },
          { name: 'Moderation', value: 'moderation' }
        )
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, PERMISSION_LEVELS.ADMINISTRATION)) {
      return interaction.reply({ content: '❌ You do not have permission to modify bot banner images.', ephemeral: true });
    }

    const position = interaction.options.getString('position');
    const url = interaction.options.getString('url');
    const cat = interaction.options.getString('category') || 'global';

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return interaction.reply({ embeds: [errorEmbed('Invalid URL', 'Please provide a valid https:// image URL.')], ephemeral: true });
    }

    if (cat === 'global') {
      if (position === 'top') config.embed.topBannerUrl = url;
      if (position === 'bottom') config.embed.bottomBannerUrl = url;
    } else {
      if (!categoryBanners[cat]) categoryBanners[cat] = {};
      categoryBanners[cat][position] = url;
    }

    logAudit(interaction.user.id, 'SET_BANNER', null, `Updated ${position} banner for ${cat} to ${url}`);

    return interaction.reply({
      embeds: [successEmbed('Banner Updated', `Successfully updated **${position} banner** for **${cat}** category.`)],
      ephemeral: true
    });
  }
};
