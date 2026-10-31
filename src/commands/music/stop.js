const { SlashCommandBuilder } = require('discord.js');
const musicService = require('../../services/musicService');
const { createMusicEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stop playback, clear the entire music queue, and leave voice channel'),

  async execute(interaction) {
    const queue = musicService.getQueue(interaction.guild.id);
    if (!queue || !queue.playing) {
      return interaction.reply({
        embeds: [errorEmbed('No Music Playing', 'The bot is not currently playing any audio.')],
        ephemeral: true
      });
    }

    queue.stop();

    const embed = createMusicEmbed({
      title: '⏹️ Playback Stopped',
      description: 'Stopped music playback, cleared all queued songs, and disconnected from the voice channel.',
      color: 0xE63946
    });

    return interaction.reply({ embeds: [embed] });
  }
};
