const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { PERMISSION_LEVELS, hasPermission, logAudit } = require('../../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('marketplace-panel')
    .setDescription('Deploy the official New York Roleplay Marketplace products and sponsorship panel')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    if (!hasPermission(interaction.member, PERMISSION_LEVELS.ADMINISTRATION)) {
      return interaction.reply({ content: '❌ You must be Administration or Directive to publish the marketplace panel.', ephemeral: true });
    }

    const embed = createEmbed({
      title: '🛒 Marketplace — New York Roleplay',
      description: `We offer a large range of different products inside our marketplace. All transactions are final, and we do not offer refunds to users who decide they no longer want their purchase.\n\n` +
        `Select an option from the menu below to view full tier descriptions, perks, and purchase requirements:`,
      category: 'moderation'
    });

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('marketplace_select')
      .setPlaceholder('Select a marketplace offering...')
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel('Sponsored Giveaway')
          .setDescription('Sponsor a community giveaway with dedicated ping and advertisement')
          .setEmoji('🎉')
          .setValue('sponsored_giveaway'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Paid Advertisement')
          .setDescription('Promote your Discord server, Roblox group, or social link')
          .setEmoji('📢')
          .setValue('paid_ad'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Donations & VIP Perks')
          .setDescription('Support the community and receive exclusive in-game and Discord perks')
          .setEmoji('💎')
          .setValue('donations')
      );

    const row = new ActionRowBuilder().addComponents(selectMenu);

    await interaction.channel.send({ embeds: [embed], components: [row] });
    logAudit(interaction.user.id, 'DEPLOY_MARKETPLACE', interaction.channel.id, 'Deployed marketplace panel');

    return interaction.reply({ content: '✅ Marketplace panel published successfully.', ephemeral: true });
  }
};
