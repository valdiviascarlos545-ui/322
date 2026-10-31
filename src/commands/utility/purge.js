const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { PERMISSION_LEVELS, hasPermission, logAudit } = require('../../utils/permissions');
const config = require('../../../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Bulk delete messages from the current channel with moderation logging')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption(opt => opt.setName('amount').setDescription('Number of messages to delete (1-100)').setRequired(true))
    .addUserOption(opt => opt.setName('user').setDescription('Filter deletion to a specific user (optional)').setRequired(false)),

  async execute(interaction) {
    if (!hasPermission(interaction.member, PERMISSION_LEVELS.MODERATION)) {
      return interaction.reply({ content: '❌ Only staff with Moderation permissions can purge messages.', ephemeral: true });
    }

    const amount = Math.min(100, Math.max(1, interaction.options.getInteger('amount')));
    const filterUser = interaction.options.getUser('user');

    await interaction.deferReply({ ephemeral: true });

    try {
      const messages = await interaction.channel.messages.fetch({ limit: amount });
      let toDelete = messages;

      if (filterUser) {
        toDelete = messages.filter(m => m.author.id === filterUser.id);
      }

      const deleted = await interaction.channel.bulkDelete(toDelete, true);

      logAudit(interaction.user.id, 'PURGE_MESSAGES', interaction.channel.id, `Purged ${deleted.size} messages in #${interaction.channel.name}`);

      return interaction.editReply({
        embeds: [successEmbed('Messages Purged', `Successfully cleared **${deleted.size}** messages${filterUser ? ` from <@${filterUser.id}>` : ''}.`)]
      });
    } catch (err) {
      return interaction.editReply({
        embeds: [errorEmbed('Purge Failed', `Messages older than 14 days cannot be bulk deleted by Discord protocol: ${err.message}`)]
      });
    }
  }
};
