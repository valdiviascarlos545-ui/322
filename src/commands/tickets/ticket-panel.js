const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { PERMISSION_LEVELS, hasPermission, logAudit } = require('../../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket-panel')
    .setDescription('Deploy the official New York Roleplay Contact Us ticket dropdown panel')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    if (!hasPermission(interaction.member, PERMISSION_LEVELS.ADMINISTRATION)) {
      return interaction.reply({ content: '❌ You must be Administration or Directive to deploy the ticket panel.', ephemeral: true });
    }

    const panelEmbed = createEmbed({
      title: '📬 Contact Us — New York Roleplay',
      description: `Need assistance? Open a ticket and our team will be ready to help. Choose the category that matches your issue below and a private channel will be opened for you.\n\n` +
        `**Choose your category:**\n\n` +
        `🔹 **General**: Questions, support, and assistance from any staff member.\n\n` +
        `🔹 **High Rank**: Escalated concerns requiring senior staff attention.\n\n` +
        `🔹 **Department**: Department-related or high-priority leadership matters.`,
      category: 'tickets'
    });

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('ticket_category_select')
      .setPlaceholder('Select a ticket category to open...')
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel('General Support')
          .setDescription('Questions, support, and community assistance')
          .setEmoji('🔹')
          .setValue('General'),
        new StringSelectMenuOptionBuilder()
          .setLabel('High Rank Attention')
          .setDescription('Escalated concerns requiring senior staff attention')
          .setEmoji('👔')
          .setValue('High Rank'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Department Inquiries')
          .setDescription('Department-related leadership matters and whitelist concerns')
          .setEmoji('🚔')
          .setValue('Department')
      );

    const row = new ActionRowBuilder().addComponents(selectMenu);

    await interaction.channel.send({ embeds: [panelEmbed], components: [row] });
    logAudit(interaction.user.id, 'DEPLOY_TICKET_PANEL', interaction.channel.id, 'Deployed ticket panel');

    return interaction.reply({ content: '✅ Ticket panel successfully deployed in this channel.', ephemeral: true });
  }
};
