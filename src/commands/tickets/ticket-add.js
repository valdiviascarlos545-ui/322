const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const db = require('../../../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket-add')
    .setDescription('Add a user or role to the current ticket channel')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to grant access to')
        .setRequired(true)
    ),

  async execute(interaction) {
    const ticket = db.prepare('SELECT * FROM tickets WHERE channel_id = ? AND status = \'open\'').get(interaction.channel.id);
    if (!ticket) {
      return interaction.reply({ embeds: [errorEmbed('Invalid Channel', 'This command can only be used inside an active ticket channel.')], ephemeral: true });
    }

    const targetUser = interaction.options.getUser('user');

    try {
      await interaction.channel.permissionOverwrites.edit(targetUser.id, {
        ViewChannel: true,
        SendMessages: true,
        ReadMessageHistory: true,
        AttachFiles: true
      });

      return interaction.reply({
        embeds: [successEmbed('User Added', `<@${targetUser.id}> was added to ticket **#${ticket.ticket_id}** by <@${interaction.user.id}>.`)]
      });
    } catch (err) {
      return interaction.reply({ embeds: [errorEmbed('Failed to Add User', err.message)], ephemeral: true });
    }
  }
};
