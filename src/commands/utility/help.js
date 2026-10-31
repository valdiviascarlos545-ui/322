const {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder
} = require('discord.js');
const { createEmbed, createMusicEmbed } = require('../../utils/embedBuilder');
const config = require('../../../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Display all commands and descriptions for Rolonbot')
    .addStringOption(opt =>
      opt.setName('category')
        .setDescription('Filter commands by module category')
        .setRequired(false)
        .addChoices(
          { name: '🎵 Rolonbot Music Suite (17 Commands)', value: 'music' },
          { name: '🛠️ Utility & System Info', value: 'utility' },
          { name: '🎫 Tickets & In-Game Support', value: 'tickets' },
          { name: '📝 15-Question DM Applications', value: 'applications' },
          { name: '🚔 Internal Affairs & Disciplinary', value: 'ia' },
          { name: '🎖️ Promotions & Staff Hierarchy', value: 'promotions' },
          { name: '🏢 Agency & Department Operations', value: 'departments' },
          { name: '🎓 Training & Classroom System', value: 'training' },
          { name: '🎮 ER:LC Server Session Management', value: 'sessions' },
          { name: '🛡️ Roblox Profile Verification', value: 'verification' },
          { name: '⚙️ Server Setup & Configuration', value: 'setup' }
        )
    ),

  async execute(interaction) {
    const selected = interaction.options.getString('category');

    if (selected === 'music') {
      const musicEmbed = createMusicEmbed({
        title: '🎵 Rolonbot Music Engine — Commands & Features',
        description:
          '**Audio Streaming with Zero Top/Bottom Banners:**\n' +
          'All music commands feature a clean, high-fidelity YouTube/Spotify UI with a live progress bar (`🔘▬▬▬▬▬▬▬▬ 01:23 / 03:45`), album artwork, and interactive button controls.\n\n' +
          '**Core Music Commands:**\n' +
          '• `/play [query]` — Plays audio from YouTube, Spotify, or rapper/artist names (e.g. Drake, Travis Scott)\n' +
          '• `/nowplaying` — Show now playing track with live progress bar and controls\n' +
          '• `/lyrics [query]` — Fetch verified lyrics powered by Genius API\n' +
          '• `/loop [off|track|queue]` — Toggle loop between Off, Single Track, or Entire Queue\n' +
          '• `/playlist [curated|play|save|load|list]` — Load 6 hot presets (Hip-Hop, Drill, Lo-Fi, Billboard, EDM, R&B) or YouTube/Spotify URL\n' +
          '• `/queue [page]` — View upcoming tracks, queue duration, and pagination\n' +
          '• `/search [query]` — Interactive search menu with 5 selectable tracks\n' +
          '• `/pause` — Pause current playback\n' +
          '• `/resume` — Resume streaming\n' +
          '• `/skip` — Skip to next song\n' +
          '• `/skipto [track]` — Jump directly to a track index in queue\n' +
          '• `/stop` — Stop playback, clear queue, and leave voice channel\n' +
          '• `/volume [0-100]` — Adjust playback volume with visual slider\n' +
          '• `/move [from] [to]` — Reorder songs inside the queue\n' +
          '• `/remove [track]` — Remove a specific song from queue\n' +
          '• `/shuffle` — Randomize upcoming queue order\n' +
          '• `/dj-mode [enabled]` — Restrict playback controls to DJ role',
        color: 0x1DB954
      });

      return interaction.reply({ embeds: [musicEmbed] });
    }

    // Default Overview Help
    const mainEmbed = createEmbed({
      title: '🛡️ Rolonbot — Discord Staff Management & Music Operations',
      description:
        'Welcome to **Rolonbot**, the complete Discord operations bot for New York Roleplay & ER:LC communities with over 100 slash commands, music engine, and automated server infrastructure.\n\n' +
        '**Banner Styling Breakdown:**\n' +
        '• **Dual Banners (Top & Bottom):** Staff Management, Moderation, Tickets, 15-Question Applications, IA Strikes, Training, Promotions, Departments, and Verification.\n' +
        '• **No Banners (Ultra-Clean Rich Embed):** Music Suite with live YouTube/Spotify progress bar (`🔘▬▬▬▬▬▬▬▬`), album artwork, and interactive controls!\n\n' +
        '**Explore Categories:**\n' +
        '• 🎵 **Music Suite:** `/play`, `/nowplaying`, `/lyrics` (Genius API), `/playlist` (6 Hot Presets), `/queue`, `/loop`, `/search`, `/volume`\n' +
        '• 🛠️ **Utility:** `/help`, `/ping`, `/uptime`, `/invite`, `/serverinfo`, `/userinfo`, `/poll`, `/purge`, `/slowmode`\n' +
        '• 🎫 **Tickets:** `/ticket-panel`, `/ticket-claim`, `/ticket-close`, `/ticket-transcript`\n' +
        '• 📝 **Applications:** `/application-panel`, `/application-review`, `/application-approve` (15 Questions in DMs)\n' +
        '• 🚔 **Internal Affairs:** `/infraction`, `/strike`, `/warning`, `/investigation`, `/staff-blacklist`\n' +
        '• 🎖️ **Promotions:** `/promote`, `/demote`, `/rank-sync`, `/role-grant`\n' +
        '• 🏢 **Departments:** `/department-panel`, `/department-apply`, `/department-roster`\n' +
        '• 🎓 **Academy Training:** `/training-create`, `/training-attendance`, `/training-result`\n' +
        '• 🎮 **ER:LC Operations:** `/session-start`, `/session-vote`, `/session-shutdown`, `/server-status`\n' +
        '• 🛡️ **Roblox Verification:** `/verify-panel`, `/verify`, `/statistics`\n' +
        '• ⚙️ **Administration:** `/setup`, `/config`, `/set-channel`, `/set-role`, `/set-banner`',
      category: 'regulations'
    });

    const select = new StringSelectMenuBuilder()
      .setCustomId('help_category_select')
      .setPlaceholder('Browse a specific category in detail...')
      .addOptions(
        new StringSelectMenuOptionBuilder().setLabel('🎵 Rolonbot Music Suite').setDescription('17 Audio streaming commands & controls').setValue('music').setEmoji('🎵'),
        new StringSelectMenuOptionBuilder().setLabel('🛠️ Utility & System Info').setDescription('Help, Ping, Uptime, Invite, Serverinfo').setValue('utility').setEmoji('🛠️'),
        new StringSelectMenuOptionBuilder().setLabel('🎫 Tickets & In-Game Support').setDescription('Multi-category tickets & HTML transcripts').setValue('tickets').setEmoji('🎫'),
        new StringSelectMenuOptionBuilder().setLabel('📝 15-Question DM Applications').setDescription('Automated DM question machine & reviews').setValue('applications').setEmoji('📝'),
        new StringSelectMenuOptionBuilder().setLabel('🚔 Internal Affairs & IA').setDescription('Discipline, strikes, appeals, logs').setValue('ia').setEmoji('🚔'),
        new StringSelectMenuOptionBuilder().setLabel('🎖️ Promotions & Ranks').setDescription('Demotions, hierarchy, role sync').setValue('promotions').setEmoji('🎖️'),
        new StringSelectMenuOptionBuilder().setLabel('🏢 Department Operations').setDescription('Agency panels, rosters, applications').setValue('departments').setEmoji('🏢'),
        new StringSelectMenuOptionBuilder().setLabel('🎓 Classroom Training').setDescription('RSVP, attendance, exams, results').setValue('training').setEmoji('🎓'),
        new StringSelectMenuOptionBuilder().setLabel('🎮 ER:LC Session Management').setDescription('PRC telemetry, votes, server status').setValue('sessions').setEmoji('🎮'),
        new StringSelectMenuOptionBuilder().setLabel('🛡️ Roblox Profile Verification').setDescription('Code generator & profile scraper').setValue('verification').setEmoji('🛡️')
      );

    const row = new ActionRowBuilder().addComponents(select);
    return interaction.reply({ embeds: [mainEmbed], components: [row] });
  }
};
