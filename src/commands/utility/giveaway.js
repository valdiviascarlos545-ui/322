const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const giveawayService = require('../../services/giveawayService');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { PERMISSION_LEVELS, hasPermission, logAudit } = require('../../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('Launch a persistent community giveaway with automated winner selection')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addStringOption(opt => opt.setName('prize').setDescription('Prize being given away (e.g. VIP Pass, Nitro)').setRequired(true))
    .addIntegerOption(opt => opt.setName('duration_minutes').setDescription('Duration in minutes').setRequired(true))
    .addIntegerOption(opt => opt.setName('winners').setDescription('Number of winners to select').setRequired(false))
    .addRoleOption(opt => opt.setName('required_role').setDescription('Role required to enter (optional)').setRequired(false)),

  async execute(interaction) {
    if (!hasPermission(interaction.member, PERMISSION_LEVELS.SUPPORT_STAFF)) {
      return interaction.reply({ content: '❌ You must be a staff member to host giveaways.', ephemeral: true });
    }

    const prize = interaction.options.getString('prize');
    const duration = interaction.options.getInteger('duration_minutes');
    const winners = interaction.options.getInteger('winners') || 1;
    const requiredRole = interaction.options.getRole('required_role');

    const result = await giveawayService.startGiveaway(
      interaction.channel,
      prize,
      duration,
      winners,
      requiredRole?.id || null,
      interaction.user
    );

    logAudit(interaction.user.id, 'START_GIVEAWAY', result.giveawayId, `Prize: ${prize}, Winners: ${winners}`);

    return interaction.reply({
      embeds: [successEmbed('Giveaway Started', `Giveaway **${result.giveawayId}** for **${prize}** is now active in this channel!`)],
      ephemeral: true
    });
  }
};
