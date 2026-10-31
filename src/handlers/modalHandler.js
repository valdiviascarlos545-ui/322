const robloxService = require('../services/robloxService');
const { createEmbed, errorEmbed } = require('../utils/embedBuilder');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

async function handleModal(interaction) {
  if (interaction.customId === 'verify_username_modal') {
    const username = interaction.fields.getTextInputValue('roblox_username').trim();

    await interaction.deferReply({ ephemeral: true });

    const session = await robloxService.startVerification(interaction.user.id, username);
    if (!session.success) {
      return interaction.editReply({ embeds: [errorEmbed('Verification Error', session.error)] });
    }

    const embed = createEmbed({
      title: '🔐 Roblox Verification — Security Code Generated',
      description: `To verify that you own **${session.username}** (ID: \`${session.robloxId}\`):\n\n` +
        `1. Visit your [Roblox Profile](https://www.roblox.com/users/${session.robloxId}/profile).\n` +
        `2. Temporarily edit your **About / Description** to include this code:\n\n` +
        `\`\`\`\n${session.code}\n\`\`\`\n` +
        `3. Save changes on Roblox, then press **Check Profile Now** below.\n\n` +
        `⏱️ *Valid for 15 minutes.*`,
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
}

module.exports = { handleModal };
