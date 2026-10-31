const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const giveawayService = require('../../services/giveawayService');
const { errorEmbed, successEmbed } = require('../../utils/embedBuilder');
const { PERMISSION_LEVELS, hasPermission, logAudit } = require('../../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('giveaway-reroll')
    .setDescription('Reroll a new winner for an ended giveaway')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addStringOption(opt => opt.setName('giveaway_id').setDescription('Giveaway ID (e.g. GW-...)').setRequired(true)),

  async execute(interaction) {
    if (!hasPermission(interaction.member, PERMISSION_LEVELS.SUPPORT_STAFF)) {
      return interaction.reply({ content: '❌ You must be staff to reroll giveaways.', ephemeral: true });
    }

    const giveawayId = interaction.options.getString('giveaway_id').toUpperCase();
    const result = await giveawayService.rerollGiveaway(interaction.channel, giveawayId);

    if (!result.success) {
      return interaction.reply({ embeds: [errorEmbed('Reroll Error', result.error)], ephemeral: true });
    }

    logAudit(interaction.user.id, 'REROLL_GIVEAWAY', giveawayId, `New winner: ${result.winnerId}`);

    return interaction.reply({ content: `✅ Rerolled winner for giveaway **${giveawayId}**!`, ephemeral: true });
  }
};
