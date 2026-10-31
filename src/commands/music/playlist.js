const { SlashCommandBuilder } = require('discord.js');
const musicService = require('../../services/musicService');
const { createMusicEmbed, errorEmbed, successEmbed } = require('../../utils/embedBuilder');
const db = require('../../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('playlist')
    .setDescription('Play a playlist from YouTube, Spotify, curated presets, or saved collections')
    .addSubcommand(sub =>
      sub.setName('curated')
        .setDescription('Select from 6 curated hot playlists (Hip-Hop, Drill, Lo-Fi, Billboard, EDM, R&B)')
        .addStringOption(opt =>
          opt.setName('preset')
            .setDescription('Choose a curated preset')
            .setRequired(false)
            .addChoices(
              { name: '🎤 Hip-Hop & Rap Hits (Drake, Travis, Kendrick, 21)', value: 'hiphop_rap' },
              { name: '☕ Lo-Fi Chill Beats (Study & Relaxing Chillhop)', value: 'lofi_chill' },
              { name: '🏆 Billboard Hot 100 (Global Top Streamed Tracks)', value: 'billboard_top' },
              { name: '⚡ Trap & NYC Drill (Pop Smoke, Fivio, 808s)', value: 'trap_drill' },
              { name: '🎮 Gaming & Phonk EDM (Cyberpunk & Drift Phonk)', value: 'gaming_edm' },
              { name: '🌙 R&B & Late Night Melodies (SZA, Weeknd, Brent)', value: 'rnb_vibes' }
            )
        )
    )
    .addSubcommand(sub =>
      sub.setName('play')
        .setDescription('Load and play a YouTube or Spotify playlist URL')
        .addStringOption(opt =>
          opt.setName('url')
            .setDescription('YouTube or Spotify playlist URL')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('save')
        .setDescription('Save the current music queue as a personal playlist')
        .addStringOption(opt =>
          opt.setName('name')
            .setDescription('Name for your playlist')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('load')
        .setDescription('Load a previously saved personal playlist')
        .addStringOption(opt =>
          opt.setName('name')
            .setDescription('Name of the saved playlist')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('list')
        .setDescription('List all your saved personal playlists')
    ),

  async execute(interaction) {
    if (!musicService.isEnabled()) {
      return interaction.reply({ content: '❌ The music system is currently disabled.', ephemeral: true });
    }

    const sub = interaction.options.getSubcommand();

    if (sub === 'curated') {
      const presetKey = interaction.options.getString('preset');
      const voiceChannel = interaction.member.voice.channel;
      if (!voiceChannel) {
        return interaction.reply({ content: '❌ You must be connected to a voice channel to load playlists.', ephemeral: true });
      }

      await interaction.deferReply();
      let queue;
      try {
        queue = await musicService.connectToChannel(voiceChannel, interaction.channel);
      } catch (err) {
        return interaction.editReply({ embeds: [errorEmbed('Voice Error', err.message)] });
      }

      if (presetKey) {
        const presets = musicService.getCuratedPlaylists();
        const playlist = presets[presetKey];
        if (!playlist) {
          return interaction.editReply({ embeds: [errorEmbed('Not Found', 'Playlist preset not found.')] });
        }

        playlist.tracks.forEach(t => {
          queue.songs.push({
            ...t,
            requestedBy: interaction.user.tag,
            requestedById: interaction.user.id
          });
        });

        if (!queue.playing) {
          queue.playNext();
        }

        const embed = createMusicEmbed({
          title: `🎶 Loaded Playlist: ${playlist.name}`,
          description:
            `**Theme:** ${playlist.description}\n` +
            `**Queued:** \`${playlist.tracks.length}\` hit songs added to the queue!\n\n` +
            `*Songs include:*\n` +
            playlist.tracks.map((tr, i) => `• **${tr.title}** by ${tr.artist} (\`${tr.duration}\`)`).join('\n'),
          thumbnail: playlist.tracks[0]?.thumbnail,
          color: 0x1DB954
        });

        const components = queue.createControls();
        return interaction.editReply({ embeds: [embed], components });
      } else {
        // Show select menu for all 6 presets
        const row = queue.createPlaylistSelectMenu();
        const embed = createMusicEmbed({
          title: '🎵 Rolonbot Curated Music Playlists',
          description:
            'Choose from our **6 hand-crafted playlists** below to immediately start streaming:\n\n' +
            '1. 🎤 **Hip-Hop & Rap Hits** — Drake, Travis Scott, Kendrick, 21 Savage\n' +
            '2. ☕ **Lo-Fi Chill Beats** — Relaxing study sessions & chillhop\n' +
            '3. 🏆 **Billboard Hot 100** — Global #1 chart toppers\n' +
            '4. ⚡ **Trap & NYC Drill** — Heavy 808 slides & bass\n' +
            '5. 🎮 **Gaming & Phonk EDM** — Drift phonk & cyberpunk synth\n' +
            '6. 🌙 **R&B & Late Night** — SZA, The Weeknd, Frank Ocean',
          color: 0x1DB954
        });
        return interaction.editReply({ embeds: [embed], components: [row] });
      }
    }

    if (sub === 'play') {
      const voiceChannel = interaction.member.voice.channel;
      if (!voiceChannel) {
        return interaction.reply({ content: '❌ You must be in a voice channel to load playlists.', ephemeral: true });
      }

      const url = interaction.options.getString('url');
      await interaction.deferReply();

      let queue;
      try {
        queue = await musicService.connectToChannel(voiceChannel, interaction.channel);
      } catch (err) {
        return interaction.editReply({ embeds: [errorEmbed('Voice Error', err.message)] });
      }

      // Resolve playlist
      let added = 0;
      try {
        const play = require('play-dl');
        if (play.yt_validate(url) === 'playlist') {
          const ytPl = await play.playlist_info(url, { incomplete: true });
          const videos = await ytPl.all_videos();
          videos.forEach(v => {
            queue.songs.push({
              title: v.title || 'YouTube Track',
              artist: v.channel?.name || 'YouTube',
              url: v.url,
              duration: v.durationRaw || '3:30',
              thumbnail: v.thumbnails?.[0]?.url || '',
              requestedBy: interaction.user.tag,
              requestedById: interaction.user.id
            });
            added++;
          });
        }
      } catch (e) {
        // Fallback
      }

      if (added === 0) {
        // Add single track fallback
        const track = await musicService.searchTrack(url, interaction.user);
        queue.songs.push(track);
        added = 1;
      }

      if (!queue.playing) {
        queue.playNext();
      }

      const embed = createMusicEmbed({
        title: '🎶 Playlist Queued',
        description: `Successfully imported and added **${added}** tracks to the queue from playlist URL!`,
        color: 0x1DB954
      });

      return interaction.editReply({ embeds: [embed], components: queue.createControls() });
    }

    if (sub === 'save') {
      const queue = musicService.getQueue(interaction.guild.id);
      const name = interaction.options.getString('name');
      const allSongs = [];
      if (queue?.currentTrack) allSongs.push(queue.currentTrack);
      if (queue?.songs?.length > 0) allSongs.push(...queue.songs);

      if (allSongs.length === 0) {
        return interaction.reply({ embeds: [errorEmbed('Empty Queue', 'There are no tracks currently in the queue to save.')], ephemeral: true });
      }

      db.prepare(`
        INSERT INTO playlists (user_id, name, tracks_json, created_at)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(user_id, name) DO UPDATE SET tracks_json = excluded.tracks_json
      `).run(interaction.user.id, name, JSON.stringify(allSongs), new Date().toISOString());

      const embed = createMusicEmbed({
        title: '💾 Playlist Saved',
        description: `Your playlist **"${name}"** with **${allSongs.length}** tracks has been saved!\nLoad it anytime with \`/playlist load ${name}\`.`,
        color: 0x2ECC71
      });

      return interaction.reply({ embeds: [embed] });
    }

    if (sub === 'load') {
      const voiceChannel = interaction.member.voice.channel;
      if (!voiceChannel) {
        return interaction.reply({ content: '❌ You must be in a voice channel to load playlists.', ephemeral: true });
      }

      const name = interaction.options.getString('name');
      const saved = db.prepare('SELECT * FROM playlists WHERE user_id = ? AND name = ?').get(interaction.user.id, name);
      if (!saved) {
        return interaction.reply({ embeds: [errorEmbed('Not Found', `You do not have a saved playlist named "${name}". Use \`/playlist list\` to view your playlists.`)], ephemeral: true });
      }

      let tracks = [];
      try {
        tracks = JSON.parse(saved.tracks_json);
      } catch (e) {
        return interaction.reply({ embeds: [errorEmbed('Data Error', 'Playlist data corrupted.')], ephemeral: true });
      }

      await interaction.deferReply();
      let queue;
      try {
        queue = await musicService.connectToChannel(voiceChannel, interaction.channel);
      } catch (err) {
        return interaction.editReply({ embeds: [errorEmbed('Voice Error', err.message)] });
      }

      tracks.forEach(t => {
        queue.songs.push({
          ...t,
          requestedBy: interaction.user.tag,
          requestedById: interaction.user.id
        });
      });

      if (!queue.playing) {
        queue.playNext();
      }

      const embed = createMusicEmbed({
        title: `🎶 Loaded Personal Playlist: "${name}"`,
        description: `Enqueued **${tracks.length}** tracks from your saved collection into the guild queue!`,
        color: 0x1DB954
      });

      return interaction.editReply({ embeds: [embed], components: queue.createControls() });
    }

    if (sub === 'list') {
      const saved = db.prepare('SELECT name, tracks_json, created_at FROM playlists WHERE user_id = ?').all(interaction.user.id);
      if (saved.length === 0) {
        return interaction.reply({
          embeds: [createMusicEmbed({
            title: '📁 Your Saved Playlists',
            description: 'You have not saved any personal playlists yet. Save one with `/playlist save [name]` or try `/playlist curated` for 6 hot presets!',
            color: 0x95A5A6
          })],
          ephemeral: true
        });
      }

      const desc = saved.map(s => {
        let count = 0;
        try { count = JSON.parse(s.tracks_json).length; } catch (e) {}
        return `• **${s.name}** — \`${count} tracks\` *(Saved: <t:${Math.floor(new Date(s.created_at).getTime() / 1000)}:R>)*`;
      }).join('\n');

      const embed = createMusicEmbed({
        title: '📁 Your Saved Playlists',
        description: `Here are your custom saved music playlists:\n\n${desc}\n\n*Load any playlist with \`/playlist load [name]\`.*`,
        color: 0x1DB954
      });

      return interaction.reply({ embeds: [embed] });
    }
  }
};
