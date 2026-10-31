const { SlashCommandBuilder } = require('discord.js');
const musicService = require('../../services/musicService');
const { createMusicEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('loop')
    .setDescription('Toggle music loop between Off, Single Track, and Entire Queue')
    .addStringOption(opt =>
      opt.setName('mode')
        .setDescription('Loop mode')
        .setRequired(false)
        .addChoices(
          { name: 'Off (Disable looping)', value: 'off' },
          { name: 'Track (Loop current song)', value: 'track' },
          { name: 'Queue (Loop whole queue)', value: 'queue' }
        )
    ),

  async execute(interaction) {
    const queue = musicService.getQueue(interaction.guild.id);
    if (!queue || !queue.playing) {
      return interaction.reply({
        embeds: [errorEmbed('No Music Playing', 'The bot is not currently playing any audio.')],
        ephemeral: true
      });
    }

    const mode = interaction.options.getString('mode');
    if (mode) {
      queue.loopMode = mode;
    } else {
      // Cycle: off -> track -> queue -> off
      if (queue.loopMode === 'off') queue.loopMode = 'track';
      else if (queue.loopMode === 'track') queue.loopMode = 'queue';
      else queue.loopMode = 'off';
    }

    const descriptions = {
      off: '➡️ **Loop Disabled:** Songs will play sequentially and dequeue once finished.',
      track: '🔂 **Track Loop Active:** The currently playing song will repeat indefinitely.',
      queue: '🔁 **Queue Loop Active:** Played songs will cycle back to the end of the queue.'
    };

    const embed = createMusicEmbed({
      title: `🔁 Loop Mode: ${queue.loopMode.toUpperCase()}`,
      description: descriptions[queue.loopMode],
      color: queue.loopMode === 'off' ? 0x95A5A6 : 0x1DB954
    });

    return interaction.reply({ embeds: [embed] });
  }
};
