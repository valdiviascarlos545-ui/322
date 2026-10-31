const { SlashCommandBuilder } = require('discord.js');
const musicService = require('../../services/musicService');
const { createMusicEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shuffle')
    .setDescription('Randomly shuffle all tracks in the current music queue'),

  async execute(interaction) {
    const queue = musicService.getQueue(interaction.guild.id);
    if (!queue || queue.songs.length <= 1) {
      return interaction.reply({
        embeds: [errorEmbed('Cannot Shuffle', 'You need at least 2 tracks in the queue to shuffle.')],
        ephemeral: true
      });
    }

    queue.shuffle();

    const embed = createMusicEmbed({
      title: '🔀 Queue Shuffled!',
      description: `Successfully randomized **${queue.songs.length}** upcoming tracks in the queue.\n\n` +
        `**Next Up:** [${queue.songs[0].title}](${queue.songs[0].url}) (\`${queue.songs[0].duration}\`)`,
      color: 0x1DB954
    });

    return interaction.reply({ embeds: [embed] });
  }
};
