const { SlashCommandBuilder } = require('discord.js');
const musicService = require('../../services/musicService');
const geniusService = require('../../services/geniusService');
const { createMusicEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lyrics')
    .setDescription('Get verified lyrics for the currently playing song or search via Genius API')
    .addStringOption(opt =>
      opt.setName('query')
        .setDescription('Optional: Specific song name or rapper (defaults to currently playing track)')
        .setRequired(false)
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const queue = musicService.getQueue(interaction.guild.id);
    let query = interaction.options.getString('query');

    if (!query) {
      if (queue?.playing && queue.currentTrack) {
        query = `${queue.currentTrack.artist || ''} ${queue.currentTrack.title || ''}`.trim();
      } else {
        return interaction.editReply({
          embeds: [errorEmbed('No Song Specified', 'Please provide a song/artist name or play a track first with `/play`!')]
        });
      }
    }

    try {
      const result = await geniusService.searchGenius(query);

      if (!result) {
        return interaction.editReply({
          embeds: [errorEmbed('Lyrics Not Found', `Could not locate verified lyrics on Genius for: "${query}".`)]
        });
      }

      // Truncate lyrics if needed to fit Discord embed description limit (4096 chars)
      const lyricsSnippet = result.lyrics.length > 3900
        ? result.lyrics.substring(0, 3900) + `\n\n...[View full lyrics on Genius](${result.url})`
        : result.lyrics;

      const embed = createMusicEmbed({
        title: `📜 Genius Lyrics: ${result.title}`,
        url: result.url,
        description: `**Artist:** ${result.artist}\n\n${lyricsSnippet}`,
        thumbnail: result.thumbnail,
        footerText: 'Lyrics powered by Genius API • Rolonbot',
        color: 0xFFFF64 // Genius signature yellow / gold
      });

      return interaction.editReply({ embeds: [embed] });
    } catch (err) {
      return interaction.editReply({
        embeds: [errorEmbed('Genius API Error', `Failed to retrieve lyrics: ${err.message}`)]
      });
    }
  }
};
