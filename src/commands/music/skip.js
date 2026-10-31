const { SlashCommandBuilder } = require('discord.js');
const musicService = require('../../services/musicService');
const { createMusicEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skip the currently playing song'),

  async execute(interaction) {
    const queue = musicService.getQueue(interaction.guild.id);
    if (!queue || !queue.playing) {
      return interaction.reply({
        embeds: [errorEmbed('No Music Playing', 'The bot is not currently playing any audio.')],
        ephemeral: true
      });
    }

    const skipped = queue.currentTrack;
    queue.player.stop();

    const embed = createMusicEmbed({
      title: '⏭️ Song Skipped',
      description: `Skipped **[${skipped?.title || 'Current Track'}](${skipped?.url || 'https://youtube.com'})**.\n\n` +
        (queue.songs.length > 0
          ? `**Now Next:** [${queue.songs[0].title}](${queue.songs[0].url}) (\`${queue.songs[0].duration}\`)`
          : '*Queue is now empty.*'),
      color: 0x1DB954
    });

    return interaction.reply({ embeds: [embed] });
  }
};
