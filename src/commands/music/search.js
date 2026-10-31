const {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder
} = require('discord.js');
const musicService = require('../../services/musicService');
const { createMusicEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('search')
    .setDescription('Search and select videos or tracks to play from interactive list')
    .addStringOption(opt =>
      opt.setName('query')
        .setDescription('Song title, artist, or keywords to search')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!musicService.isEnabled()) {
      return interaction.reply({ content: '❌ The music system is currently disabled.', ephemeral: true });
    }

    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
      return interaction.reply({ content: '❌ You must be in a voice channel to use music commands.', ephemeral: true });
    }

    const query = interaction.options.getString('query');
    await interaction.deferReply();

    const results = await musicService.searchMultiple(query, 5);
    if (!results || results.length === 0) {
      return interaction.editReply({
        embeds: [errorEmbed('No Results', `No audio tracks found for: "${query}".`)]
      });
    }

    const select = new StringSelectMenuBuilder()
      .setCustomId('music_search_select')
      .setPlaceholder('Choose a track to add to the queue...');

    results.forEach((item, index) => {
      select.addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel(`${index + 1}. ${item.title.substring(0, 80)}`)
          .setDescription(`${item.artist} • ${item.duration}`.substring(0, 95))
          .setValue(item.url)
          .setEmoji('🎵')
      );
    });

    const embed = createMusicEmbed({
      title: `🔍 Search Results: "${query}"`,
      description:
        results.map((r, i) => `**${i + 1}.** [${r.title}](${r.url})\n↳ *${r.artist} • Duration: \`${r.duration}\`*`).join('\n\n') +
        '\n\n*Select an option from the menu below to queue it immediately.*',
      thumbnail: results[0].thumbnail,
      color: 0x1DB954
    });

    const row = new ActionRowBuilder().addComponents(select);
    return interaction.editReply({ embeds: [embed], components: [row] });
  }
};
