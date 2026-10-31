const { SlashCommandBuilder } = require('discord.js');
const musicService = require('../../services/musicService');
const { createMusicEmbed, errorEmbed, successEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('move')
    .setDescription('Move songs around in the queue')
    .addIntegerOption(opt =>
      opt.setName('from')
        .setDescription('Track number in queue to move')
        .setRequired(true)
        .setMinValue(1)
    )
    .addIntegerOption(opt =>
      opt.setName('to')
        .setDescription('Target position in queue')
        .setRequired(true)
        .setMinValue(1)
    ),

  async execute(interaction) {
    const queue = musicService.getQueue(interaction.guild.id);
    if (!queue || queue.songs.length === 0) {
      return interaction.reply({
        embeds: [errorEmbed('Empty Queue', 'There are no upcoming songs in the queue to move.')],
        ephemeral: true
      });
    }

    const from = interaction.options.getInteger('from');
    const to = interaction.options.getInteger('to');

    if (from > queue.songs.length || to > queue.songs.length) {
      return interaction.reply({
        embeds: [errorEmbed('Invalid Position', `Queue only contains ${queue.songs.length} upcoming tracks. Position must be between 1 and ${queue.songs.length}.`)],
        ephemeral: true
      });
    }

    const song = queue.songs[from - 1];
    const moved = queue.move(from, to);

    if (!moved) {
      return interaction.reply({
        embeds: [errorEmbed('Move Failed', 'Could not move track.')],
        ephemeral: true
      });
    }

    const embed = createMusicEmbed({
      title: '🔀 Track Moved in Queue',
      description: `Moved **[${song.title}](${song.url})** from position **#${from}** to **#${to}** in the queue.`,
      color: 0x1DB954
    });

    return interaction.reply({ embeds: [embed] });
  }
};
