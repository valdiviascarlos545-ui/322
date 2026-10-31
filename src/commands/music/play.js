const { SlashCommandBuilder } = require('discord.js');
const musicService = require('../../services/musicService');
const { createMusicEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play audio from YouTube, Spotify, or by rapper/song name')
    .addStringOption(opt =>
      opt.setName('query')
        .setDescription('Song title, artist/rapper (e.g. Drake, Travis Scott), YouTube link, or Spotify URL')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!musicService.isEnabled()) {
      return interaction.reply({ content: '❌ The music system is currently disabled by administrator configuration.', ephemeral: true });
    }

    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
      return interaction.reply({ content: '❌ You must be connected to a voice channel to use music commands.', ephemeral: true });
    }

    const query = interaction.options.getString('query');
    await interaction.deferReply();

    let queue;
    try {
      queue = await musicService.connectToChannel(voiceChannel, interaction.channel);
    } catch (err) {
      return interaction.editReply({ embeds: [errorEmbed('Voice Connection Error', err.message)] });
    }

    if (!musicService.isDjAuthorized(interaction.member, queue)) {
      return interaction.editReply({ content: '❌ DJ Mode is active. Only members with the DJ role can add songs.' });
    }

    const track = await musicService.searchTrack(query, interaction.user);
    queue.songs.push(track);

    const isFirstTrack = !queue.playing && queue.songs.length === 1;

    // Ultra-clean music embed without top or bottom banners
    const embed = createMusicEmbed({
      title: isFirstTrack ? `🎶 Starting Playback: ${track.title}` : `🎵 Track Queued: ${track.title}`,
      url: track.url,
      description:
        `**Artist / Channel:** ${track.artist || 'Official Track'}\n` +
        `**Duration:** \`${track.duration}\`\n` +
        `**Position in Queue:** #${queue.songs.length}\n` +
        `**Requested By:** <@${interaction.user.id}>\n\n` +
        `*Click the interactive audio buttons below to adjust volume, skip, loop, view Genius lyrics, or browse 6 hot playlists!*`,
      thumbnail: track.thumbnail,
      color: 0x1DB954
    });

    const components = queue.createControls();

    if (!queue.playing) {
      queue.playNext();
    }

    return interaction.editReply({ embeds: [embed], components });
  }
};
