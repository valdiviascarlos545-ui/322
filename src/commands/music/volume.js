const { SlashCommandBuilder } = require('discord.js');
const musicService = require('../../services/musicService');
const { createMusicEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('volume')
    .setDescription('Change volume of currently playing music (0 to 100)')
    .addIntegerOption(opt =>
      opt.setName('level')
        .setDescription('Volume level (0-100%)')
        .setRequired(false)
        .setMinValue(0)
        .setMaxValue(100)
    ),

  async execute(interaction) {
    const queue = musicService.getQueue(interaction.guild.id);
    if (!queue || !queue.playing) {
      return interaction.reply({
        embeds: [errorEmbed('No Music Playing', 'The bot is not currently playing any audio.')],
        ephemeral: true
      });
    }

    const level = interaction.options.getInteger('level');
    if (level === null || level === undefined) {
      // Show current volume
      const barLength = 10;
      const filled = Math.round((queue.volume / 100) * barLength);
      const volBar = '🔊 ' + '█'.repeat(filled) + '░'.repeat(barLength - filled);

      const embed = createMusicEmbed({
        title: `🔊 Current Volume: ${queue.volume}%`,
        description: `\`${volBar}\`\n\nUse \`/volume [0-100]\` or click the **Vol -10%** and **Vol +10%** buttons below to adjust.`,
        color: 0x1DB954
      });

      return interaction.reply({ embeds: [embed], components: queue.createControls() });
    }

    const newVol = queue.setVolume(level);
    const barLength = 10;
    const filled = Math.round((newVol / 100) * barLength);
    const volBar = (newVol === 0 ? '🔇 ' : (newVol < 50 ? '🔉 ' : '🔊 ')) + '█'.repeat(filled) + '░'.repeat(barLength - filled);

    const embed = createMusicEmbed({
      title: `🔊 Volume Updated: ${newVol}%`,
      description: `\`${volBar}\`\n\nPlayback volume set to **${newVol}%** successfully.`,
      color: 0x1DB954
    });

    return interaction.reply({ embeds: [embed] });
  }
};
