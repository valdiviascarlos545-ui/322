const ticketService = require('../services/ticketService');
const appService = require('../services/applicationService');
const deptAppService = require('../services/departmentApplicationService');
const { createEmbed, createEmbeds, errorEmbed, successEmbed } = require('../utils/embedBuilder');
const db = require('../../db');
const config = require('../../config');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

async function handleSelectMenu(interaction) {
  const customId = interaction.customId;
  const selectedValue = interaction.values[0];

  // Ticket creation
  if (customId === 'ticket_category_select') {
    await interaction.deferReply({ ephemeral: true });
    const result = await ticketService.createTicket(interaction, selectedValue);

    if (!result.success) {
      return interaction.editReply({ embeds: [errorEmbed('Ticket Creation Failed', result.error)] });
    }

    return interaction.editReply({
      embeds: [successEmbed('Ticket Created', `Your support channel has been created: <#${result.channel.id}>. Staff has been notified.`)]
    });
  }

  // Application selection
  if (customId === 'application_select') {
    if (selectedValue === 'staff_app') {
      await interaction.deferReply({ ephemeral: true });
      const result = await appService.startApplication(interaction.user, interaction.guild);

      if (!result.success) {
        return interaction.editReply({ embeds: [errorEmbed('Application Error', result.error)] });
      }

      return interaction.editReply({
        embeds: [successEmbed('Check Your DMs', 'We have sent you Question 1 of the official Staff Application in your Direct Messages! Please reply to the bot there.')]
      });
    }
  }

  // Department application selection
  if (customId === 'dept_select_apply') {
    await interaction.deferReply({ ephemeral: true });
    const result = await deptAppService.startDepartmentApplication(interaction.user, interaction.guild, selectedValue);

    if (!result.success) {
      return interaction.editReply({ embeds: [errorEmbed('Application Error', result.error)] });
    }

    const dept = db.prepare('SELECT name, emoji FROM departments WHERE dept_id = ?').get(selectedValue);
    return interaction.editReply({
      embeds: [
        successEmbed(
          '15-Question Application Started! 🎉',
          `We have sent you Question 1 of 15 for **${dept?.emoji || '📋'} ${dept?.name || selectedValue.toUpperCase()}** in your **Direct Messages**!\n\nPlease open your DMs to complete your questionnaire.`
        )
      ]
    });
  }

  // Marketplace selection
  if (customId === 'marketplace_select') {
    if (selectedValue === 'sponsored_giveaway') {
      const embeds = createEmbeds({
        title: '🎉 Marketplace — Sponsored Giveaway',
        description: `Host a sponsored giveaway in our server to promote your Discord server, YouTube channel, or Roblox group.\n\n` +
          `**Pricing & Options:**\n` +
          `• **Standard Sponsor (${config.marketplace.sponsorPrice})**: Ping @here + 24 Hour Giveaway + Sponsor Link in embed.\n` +
          `• **Executive Sponsor (${config.marketplace.adPrice})**: Ping @everyone + 48 Hour Giveaway + Channel Banner + Custom Giveaway Ping.\n\n` +
          `**Requirements:** Content must adhere to Discord ToS and Roblox Community Standards.\n` +
          `*To purchase, please open a Ticket under the **High Rank** category, or visit our store links below:*`,
        category: 'moderation'
      });

      const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setLabel('🛒 Visit Roblox Store').setStyle(ButtonStyle.Link).setURL(config.marketplace.storeUrl),
        new ButtonBuilder().setLabel('👥 Official Roblox Group').setStyle(ButtonStyle.Link).setURL(config.marketplace.robloxGroupUrl)
      );

      return interaction.reply({ embeds, components: [buttons], ephemeral: true });
    }

    if (selectedValue === 'paid_ad') {
      const embeds = createEmbeds({
        title: '📢 Marketplace — Paid Advertisement',
        description: `Broadcast your server, group, or project directly to all active citizens.\n\n` +
          `**Packages & Rates:**\n` +
          `• **Single Broadcast (${config.marketplace.sponsorPrice})**: Dedicated post in #paid-advertisements + @here mention.\n` +
          `• **Weekly Featured Sponsor (${config.marketplace.adPrice})**: Pinned advertisement + social media spotlight.\n\n` +
          `**Guidelines:** No NSFW servers, token loggers, or unauthorized reselling.\n` +
          `*To purchase, open a **High Rank** ticket or visit our Roblox group:*`,
        category: 'moderation'
      });

      const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setLabel('🛒 Open Store').setStyle(ButtonStyle.Link).setURL(config.marketplace.storeUrl),
        new ButtonBuilder().setLabel('👥 Join Roblox Group').setStyle(ButtonStyle.Link).setURL(config.marketplace.robloxGroupUrl)
      );

      return interaction.reply({ embeds, components: [buttons], ephemeral: true });
    }

    if (selectedValue === 'donations') {
      const embeds = createEmbeds({
        title: '💎 Marketplace — Donations & VIP Roleplay Supporter',
        description: `Support server hosting, custom liveries, and priority ERLC queue boosts!\n\n` +
          `**VIP Supporter Perks (${config.marketplace.vipPrice}):**\n` +
          `• Exclusive **VIP Supporter** Discord role & custom icon\n` +
          `• Priority server queue during peak session hours\n` +
          `• Access to VIP vehicle spawn packs in ER:LC\n` +
          `• Private VIP lounge & testing channel access\n\n` +
          `*All contributions directly support server operations. Click below to donate or purchase:*`,
        category: 'moderation'
      });

      const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setLabel('💎 VIP Gamepass / Donate').setStyle(ButtonStyle.Link).setURL(config.marketplace.donationUrl),
        new ButtonBuilder().setLabel('🛒 Roblox Game Store').setStyle(ButtonStyle.Link).setURL(config.marketplace.storeUrl),
        new ButtonBuilder().setLabel('👥 Official Roblox Group').setStyle(ButtonStyle.Link).setURL(config.marketplace.robloxGroupUrl)
      );

      return interaction.reply({ embeds, components: [buttons], ephemeral: true });
    }
  }

  // Regulations selection
  if (customId === 'regulations_select') {
    const category = selectedValue;
    const rules = db.prepare('SELECT * FROM regulations WHERE category = ? ORDER BY rule_number ASC').all(category);

    const embeds = createEmbeds({
      title: category === 'discord' ? '📜 Official Discord Community Guidelines' : '🚔 Official ER:LC Game Server Guidelines',
      description: category === 'discord'
        ? 'All members must abide by these rules across all Discord channels and voice lounges:'
        : 'All players must strictly follow these roleplay standards inside our ER:LC private server:',
      category: 'regulations',
      fields: rules.map(r => ({
        name: `§${r.rule_number}. ${r.title}`,
        value: r.content,
        inline: false
      }))
    });

    return interaction.reply({ embeds, ephemeral: true });
  }

  // Music search select menu
  if (customId === 'music_search_select') {
    const voiceChannel = interaction.member.voice?.channel;
    if (!voiceChannel) {
      return interaction.reply({ content: '❌ You must be in a voice channel to queue music.', ephemeral: true });
    }
    await interaction.deferReply();
    const musicService = require('../services/musicService');
    const { createMusicEmbed } = require('../utils/embedBuilder');
    let queue;
    try {
      queue = await musicService.connectToChannel(voiceChannel, interaction.channel);
    } catch (err) {
      return interaction.editReply({ content: `❌ Voice Error: ${err.message}` });
    }
    const track = await musicService.searchTrack(selectedValue, interaction.user);
    queue.songs.push(track);
    if (!queue.playing) {
      queue.playNext();
    }
    const embed = createMusicEmbed({
      title: '🎵 Selected Track Queued',
      description: `**[${track.title}](${track.url})**\n\n**Duration:** \`${track.duration}\`\n**Position in Queue:** #${queue.songs.length}`,
      thumbnail: track.thumbnail,
      color: 0x1DB954
    });
    return interaction.editReply({ embeds: [embed], components: queue.createControls() });
  }

  // Music curated playlist preset select menu
  if (customId === 'music_playlist_select') {
    const voiceChannel = interaction.member.voice?.channel;
    if (!voiceChannel) {
      return interaction.reply({ content: '❌ You must be in a voice channel to load playlists.', ephemeral: true });
    }
    await interaction.deferReply();
    const musicService = require('../services/musicService');
    const { createMusicEmbed } = require('../utils/embedBuilder');
    let queue;
    try {
      queue = await musicService.connectToChannel(voiceChannel, interaction.channel);
    } catch (err) {
      return interaction.editReply({ content: `❌ Voice Error: ${err.message}` });
    }
    const presets = musicService.getCuratedPlaylists();
    const playlist = presets[selectedValue];
    if (!playlist) {
      return interaction.editReply({ content: '❌ Playlist preset not found.' });
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
        playlist.tracks.map(tr => `• **${tr.title}** by ${tr.artist} (\`${tr.duration}\`)`).join('\n'),
      thumbnail: playlist.tracks[0]?.thumbnail,
      color: 0x1DB954
    });
    return interaction.editReply({ embeds: [embed], components: queue.createControls() });
  }

  // Help category select menu
  if (customId === 'help_category_select') {
    const helpCmd = require('../commands/utility/help');
    const fakeInteraction = {
      ...interaction,
      options: { getString: () => selectedValue },
      reply: args => interaction.reply({ ...args, ephemeral: true })
    };
    return helpCmd.execute(fakeInteraction);
  }
}

module.exports = { handleSelectMenu };
