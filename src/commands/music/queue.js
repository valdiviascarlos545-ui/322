const { SlashCommandBuilder } = require('discord.js');
const musicService = require('../../services/musicService');
const { createMusicEmbed, errorEmbed, parseDurationToSeconds, formatTime } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Show the music queue, currently playing track, and upcoming songs')
    .addIntegerOption(opt =>
      opt.setName('page')
        .setDescription('Queue page number (10 tracks per page)')
        .setRequired(false)
        .setMinValue(1)
    ),

  async execute(interaction) {
    if (!musicService.isEnabled()) {
      return interaction.reply({ content: '❌ The music system is currently disabled.', ephemeral: true });
    }

    const queue = musicService.getQueue(interaction.guild.id);
    if (!queue || (!queue.playing && queue.songs.length === 0)) {
      return interaction.reply({
        embeds: [errorEmbed('Empty Queue', 'No songs are playing or queued. Use `/play` or `/playlist` to start audio!')],
        ephemeral: true
      });
    }

    const page = interaction.options.getInteger('page') || 1;
    const pageSize = 10;
    const totalPages = Math.max(1, Math.ceil(queue.songs.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const startIdx = (currentPage - 1) * pageSize;
    const endIdx = startIdx + pageSize;
    const currentBatch = queue.songs.slice(startIdx, endIdx);

    let totalSecs = 0;
    if (queue.currentTrack) totalSecs += parseDurationToSeconds(queue.currentTrack.duration);
    queue.songs.forEach(s => {
      totalSecs += parseDurationToSeconds(s.duration);
    });

    const nowPlayingSection = queue.currentTrack
      ? `**▶️ Now Playing:**\n` +
        `**[${queue.currentTrack.title}](${queue.currentTrack.url})**\n` +
        `*Artist:* ${queue.currentTrack.artist || 'Official'} | *Duration:* \`${queue.currentTrack.duration}\` | *Requested by:* <@${queue.currentTrack.requestedById || queue.currentTrack.requestedBy}>\n\n`
      : '*No active song currently streaming*\n\n';

    let upcomingSection = '**📜 Upcoming Songs in Queue:**\n';
    if (currentBatch.length === 0) {
      upcomingSection += '*No additional songs in queue. Add more with `/play` or load a playlist!*';
    } else {
      upcomingSection += currentBatch
        .map((s, i) => `\`${startIdx + i + 1}.\` **[${s.title}](${s.url})** — \`${s.duration}\` (by <@${s.requestedById || s.requestedBy}>)`)
        .join('\n');
    }

    const embed = createMusicEmbed({
      title: `🎶 Music Queue — Page ${currentPage} of ${totalPages}`,
      description:
        `${nowPlayingSection}${upcomingSection}\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `**Total Tracks:** \`${queue.songs.length + (queue.currentTrack ? 1 : 0)}\` | ` +
        `**Queue Duration:** \`${formatTime(totalSecs)}\`\n` +
        `**Volume:** \`${queue.volume}%\` | **Loop:** \`${queue.loopMode.toUpperCase()}\``,
      thumbnail: queue.currentTrack?.thumbnail,
      color: 0x1DB954
    });

    const components = queue.createControls();
    return interaction.reply({ embeds: [embed], components });
  }
};
