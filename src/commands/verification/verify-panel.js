const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { PERMISSION_LEVELS, hasPermission, logAudit } = require('../../utils/permissions');
const config = require('../../../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verify-panel')
    .setDescription('Deploy the official New York Roleplay Roblox account verification panel')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    if (!hasPermission(interaction.member, PERMISSION_LEVELS.ADMINISTRATION)) {
      return interaction.reply({ content: '❌ You must be Administration or Directive to deploy the verification panel.', ephemeral: true });
    }

    const embed = createEmbed({
      title: '🗽 Welcome to New York Roleplay!',
      description: `Welcome to our community! To ensure server security, maintain roleplay accountability, and prevent alternate accounts, all members must verify ownership of their Roblox profile before gaining access to civilian and department channels.\n\n` +
        `Click the **Verify** button below to start the fast, secure Roblox account verification process.`,
      category: 'verification'
    });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('verify_start')
        .setLabel('Verify Account')
        .setEmoji('🛡️')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('verify_help')
        .setLabel('Need Help?')
        .setEmoji('❓')
        .setStyle(ButtonStyle.Secondary)
    );

    const targetChannel = config.verification.channelId
      ? interaction.guild.channels.cache.get(config.verification.channelId) || interaction.channel
      : interaction.channel;

    await targetChannel.send({ embeds: [embed], components: [row] });
    logAudit(interaction.user.id, 'DEPLOY_VERIFY_PANEL', targetChannel.id, 'Deployed Roblox verification panel');

    return interaction.reply({ content: `✅ Verification panel published in <#${targetChannel.id}>.`, ephemeral: true });
  }
};
