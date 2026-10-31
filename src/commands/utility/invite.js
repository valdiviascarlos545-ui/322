const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const config = require('../../../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('invite')
    .setDescription('Send bot invite link to add Rolonbot to your Discord server'),

  async execute(interaction) {
    const clientId = config.clientId || interaction.client.user?.id || 'YOUR_CLIENT_ID';
    // Permissions needed: Administrator or standard Voice + Slash command permissions
    const permissions = '8'; // Administrator
    const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=${permissions}&scope=bot%20applications.commands`;

    const embed = createEmbed({
      title: '🤖 Invite Rolonbot to Your Server',
      description:
        'Ready to power your Discord server with **Rolonbot**?\n\n' +
        '**Included Features:**\n' +
        '• 🎵 **High-Fidelity Music Suite:** YouTube/Spotify streaming, live progress bars, 6 curated playlists, Genius lyrics & audio buttons.\n' +
        '• 🎫 **Enterprise Ticket System:** Multi-category routing, claim/escalate, and HTML transcripts.\n' +
        '• 📝 **15-Question DM Applications:** Fully automated staff candidate review workflows.\n' +
        '• 🛡️ **Native Roblox Verification:** Cryptographic code linking via Roblox profile descriptions.\n' +
        '• 🚔 **Internal Affairs & Promotions:** Strikes, warnings, investigations, and rank sync.\n\n' +
        '*Click the button below to authorize Rolonbot with slash command and voice permissions:*',
      category: 'regulations',
      color: 0x5865F2
    });

    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('➕ Add Rolonbot to Server')
        .setStyle(ButtonStyle.Link)
        .setURL(inviteUrl),
      new ButtonBuilder()
        .setLabel('📚 Documentation / Dashboard')
        .setStyle(ButtonStyle.Link)
        .setURL('https://discord.com')
    );

    return interaction.reply({ embeds: [embed], components: [buttons] });
  }
};
