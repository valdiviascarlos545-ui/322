const { SlashCommandBuilder } = require('discord.js');
const musicService = require('../../services/musicService');
const { createMusicEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Pause the currently playing music track'),

  async execute(interaction) {
    const queue = musicService.getQueue(interaction.guild.id);
    if (!queue || !queue.playing) {
      return interaction.reply({
        embeds: [errorEmbed('No Music Playing', 'The bot is not currently playing any audio.')],
        ephemeral: true
      });
    }

    if (queue.paused) {
      return interaction.reply({
        embeds: [errorEmbed('Already Paused', 'Music playback is already paused. Use `/resume` to continue.')],
        ephemeral: true
      });
    }

    queue.player.pause();
    queue.paused = true;
    queue.pausedElapsed = queue.getElapsedSeconds();

    const embed = createMusicEmbed({
      title: '⏸️ Music Paused',
      description: `Paused **[${queue.currentTrack?.title || 'Current Track'}](${queue.currentTrack?.url || 'https://youtube.com'})**.\n\nUse \`/resume\` or click **Resume** below to continue playback.`,
      color: 0xF59E0B
    });

    const components = queue.createControls();
    return interaction.reply({ embeds: [embed], components });
  }
};
