const { SlashCommandBuilder } = require('discord.js');
const musicService = require('../../services/musicService');
const { errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nowplaying')
    .setDescription('Show now playing song with live YouTube-style progress bar and controls'),

  async execute(interaction) {
    if (!musicService.isEnabled()) {
      return interaction.reply({ content: '❌ The music system is currently disabled.', ephemeral: true });
    }

    const queue = musicService.getQueue(interaction.guild.id);
    if (!queue || !queue.playing || !queue.currentTrack) {
      return interaction.reply({
        embeds: [errorEmbed('No Music Playing', 'The bot is not currently streaming music. Use `/play` to start!')],
        ephemeral: true
      });
    }

    const embed = queue.getNowPlayingEmbed();
    const components = queue.createControls();

    return interaction.reply({ embeds: [embed], components });
  }
};
