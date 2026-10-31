const { SlashCommandBuilder } = require('discord.js');
const musicService = require('../../services/musicService');
const { createMusicEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('skipto')
    .setDescription('Skip directly to the selected queue number')
    .addIntegerOption(opt =>
      opt.setName('track')
        .setDescription('Track number in queue to jump to')
        .setRequired(true)
        .setMinValue(1)
    ),

  async execute(interaction) {
    const queue = musicService.getQueue(interaction.guild.id);
    if (!queue || queue.songs.length === 0) {
      return interaction.reply({
        embeds: [errorEmbed('Empty Queue', 'There are no upcoming songs in the queue to jump to.')],
        ephemeral: true
      });
    }

    const index = interaction.options.getInteger('track');
    if (index > queue.songs.length) {
      return interaction.reply({
        embeds: [errorEmbed('Invalid Number', `Queue only contains ${queue.songs.length} upcoming tracks. Choose 1-${queue.songs.length}.`)],
        ephemeral: true
      });
    }

    const targetTrack = queue.songs[index - 1];
    queue.skipto(index);

    const embed = createMusicEmbed({
      title: '⏭️ Jumped to Track',
      description: `Fast-forwarded queue to track **#${index}**: **[${targetTrack.title}](${targetTrack.url})**.`,
      color: 0x1DB954
    });

    return interaction.reply({ embeds: [embed] });
  }
};
