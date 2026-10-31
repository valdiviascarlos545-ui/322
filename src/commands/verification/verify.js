const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const robloxService = require('../../services/robloxService');
const { createEmbed, errorEmbed, successEmbed } = require('../../utils/embedBuilder');
const config = require('../../../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verify')
    .setDescription('Verify ownership of your Roblox account through public profile description')
    .addStringOption(opt => opt.setName('roblox_username').setDescription('Your exact Roblox username').setRequired(true)),

  async execute(interaction) {
    const username = interaction.options.getString('roblox_username').trim();

    await interaction.deferReply({ ephemeral: true });

    // Check if already verified
    const existing = robloxService.getVerificationByDiscordId(interaction.user.id);
    if (existing) {
      return interaction.editReply({
        embeds: [successEmbed('Already Verified', `You are already verified as Roblox citizen **${existing.roblox_username}** (ID: \`${existing.roblox_id}\`).`)]
      });
    }

    const session = await robloxService.startVerification(interaction.user.id, username);
    if (!session.success) {
      return interaction.editReply({
        embeds: [errorEmbed('Verification Resolution Error', session.error)]
      });
    }

    const embed = createEmbed({
      title: '🔐 Roblox Account Verification Challenge',
      description: `To prove you own the Roblox account **${session.username}** (ID: \`${session.robloxId}\`), follow these steps:\n\n` +
        `1. Open [Roblox.com](https://www.roblox.com) and go to your **Profile / About** section.\n` +
        `2. Temporarily paste the unique security code below anywhere in your profile **Description / About Me**:\n\n` +
        `\`\`\`\n${session.code}\n\`\`\`\n` +
        `3. Save your Roblox profile.\n` +
        `4. Click the **Check Profile Now** button below.\n\n` +
        `⏱️ *This code expires in 15 minutes. We will never ask for your password or cookies.*`,
      category: 'verification'
    });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('verify_check')
        .setLabel('Check Profile Now')
        .setEmoji('🔍')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setLabel('Open Roblox Profile')
        .setStyle(ButtonStyle.Link)
        .setURL(`https://www.roblox.com/users/${session.robloxId}/profile`)
    );

    return interaction.editReply({ embeds: [embed], components: [row] });
  }
};
