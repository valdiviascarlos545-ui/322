const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const db = require('../../../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket-remove')
    .setDescription('Remove a user from the current ticket channel')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to remove')
        .setRequired(true)
    ),

  async execute(interaction) {
    const ticket = db.prepare('SELECT * FROM tickets WHERE channel_id = ? AND status = \'open\'').get(interaction.channel.id);
    if (!ticket) {
      return interaction.reply({ embeds: [errorEmbed('Invalid Channel', 'This command can only be used inside an active ticket channel.')], ephemeral: true });
    }

    const targetUser = interaction.options.getUser('user');
    if (targetUser.id === ticket.user_id) {
      return interaction.reply({ embeds: [errorEmbed('Action Denied', 'You cannot remove the ticket creator from their own ticket.')], ephemeral: true });
    }

    try {
      await interaction.channel.permissionOverwrites.delete(targetUser.id);
      return interaction.reply({
        embeds: [successEmbed('User Removed', `<@${targetUser.id}> was removed from ticket **#${ticket.ticket_id}** by <@${interaction.user.id}>.`)]
      });
    } catch (err) {
      return interaction.reply({ embeds: [errorEmbed('Failed to Remove User', err.message)], ephemeral: true });
    }
  }
};
