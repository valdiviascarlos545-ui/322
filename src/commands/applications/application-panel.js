const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { PERMISSION_LEVELS, hasPermission, logAudit } = require('../../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('application-panel')
    .setDescription('Deploy the official Staff Application dropdown panel')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    if (!hasPermission(interaction.member, PERMISSION_LEVELS.ADMINISTRATION)) {
      return interaction.reply({ content: '❌ You must be Administration or Directive to deploy the application panel.', ephemeral: true });
    }

    const embed = createEmbed({
      title: '📋 Staff Applications',
      description: `Interested in joining the staff team? You can get started by completing the application below. Please ensure all information you provide is accurate and detailed, as applications are carefully reviewed to select individuals who will contribute positively to the community and uphold standards.\n\n` +
        `**Staff Applications:** Applicants must be 13 years or older. You should have your Roblox username, user ID, timezone, and any other relevant details ready before applying.\n\n` +
        `All applications are reviewed by the high-ranking team. You will be notified of the outcome via DM. Please be patient. Trolling or submitting false information may result in a permanent blacklist.`,
      category: 'applications'
    });

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('application_select')
      .setPlaceholder('Select an application...')
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel('Staff Application')
          .setDescription('Apply to join the New York Roleplay Staff Team (15 Questions)')
          .setEmoji('📋')
          .setValue('staff_app')
      );

    const row = new ActionRowBuilder().addComponents(selectMenu);

    await interaction.channel.send({ embeds: [embed], components: [row] });
    logAudit(interaction.user.id, 'DEPLOY_APP_PANEL', interaction.channel.id, 'Deployed application panel');

    return interaction.reply({ content: '✅ Staff Application panel deployed successfully.', ephemeral: true });
  }
};
