const { SlashCommandBuilder } = require('discord.js');
const musicService = require('../../services/musicService');
const { createMusicEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resume')
    .setDescription('Resume currently paused music playback'),

  async execute(interaction) {
    const queue = musicService.getQueue(interaction.guild.id);
    if (!queue || !queue.playing) {
      return interaction.reply({
        embeds: [errorEmbed('No Music Playing', 'The bot is not currently playing any audio.')],
        ephemeral: true
      });
    }

    if (!queue.paused) {
      return interaction.reply({
        embeds: [errorEmbed('Not Paused', 'Music playback is already streaming.')],
        ephemeral: true
      });
    }

    queue.player.unpause();
    queue.paused = false;
    queue.trackStartTime = Date.now();

    const embed = createMusicEmbed({
      title: '▶️ Music Resumed',
      description: `Resumed **[${queue.currentTrack?.title || 'Current Track'}](${queue.currentTrack?.url || 'https://youtube.com'})**.`,
      color: 0x1DB954
    });

    const components = queue.createControls();
    return interaction.reply({ embeds: [embed], components });
  }
};
