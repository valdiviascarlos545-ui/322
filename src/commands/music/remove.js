const { SlashCommandBuilder } = require('discord.js');
const musicService = require('../../services/musicService');
const { createMusicEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remove')
    .setDescription('Remove a specific song from the queue')
    .addIntegerOption(opt =>
      opt.setName('track')
        .setDescription('The queue number of the song to remove')
        .setRequired(true)
        .setMinValue(1)
    ),

  async execute(interaction) {
    const queue = musicService.getQueue(interaction.guild.id);
    if (!queue || queue.songs.length === 0) {
      return interaction.reply({
        embeds: [errorEmbed('Empty Queue', 'There are no songs in the queue to remove.')],
        ephemeral: true
      });
    }

    const index = interaction.options.getInteger('track');
    if (index > queue.songs.length) {
      return interaction.reply({
        embeds: [errorEmbed('Invalid Track Number', `Queue currently has ${queue.songs.length} songs. Choose a number between 1 and ${queue.songs.length}.`)],
        ephemeral: true
      });
    }

    const removed = queue.remove(index);
    if (!removed) {
      return interaction.reply({
        embeds: [errorEmbed('Error', 'Failed to remove song.')],
        ephemeral: true
      });
    }

    const embed = createMusicEmbed({
      title: '🗑️ Song Removed',
      description: `Removed **[${removed.title}](${removed.url})** from queue position **#${index}**.\n\n` +
        `Remaining in queue: **${queue.songs.length}** track${queue.songs.length === 1 ? '' : 's'}.`,
      color: 0xE63946
    });

    return interaction.reply({ embeds: [embed] });
  }
};
