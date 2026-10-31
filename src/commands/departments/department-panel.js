const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { PERMISSION_LEVELS, hasPermission, logAudit } = require('../../utils/permissions');
const config = require('../../../config');
const db = require('../../../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('department-panel')
    .setDescription('Publish the official New York Roleplay Departments overview panel')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    if (!hasPermission(interaction.member, PERMISSION_LEVELS.ADMINISTRATION)) {
      return interaction.reply({ content: '❌ You must be Administration or Directive to publish the department panel.', ephemeral: true });
    }

    const depts = db.prepare('SELECT * FROM departments').all();

    const panelEmbed = createEmbed({
      title: '🏙️ New York Roleplay — Departments',
      description: `This channel contains a list of all available departments within our community. Browse through the departments below to learn more about each one and find the department that best suits your interests. Once you’ve found one you like, you can apply and begin your journey.`,
      category: 'departments',
      fields: depts.map(d => ({
        name: `${d.emoji} ${d.name} ${d.whitelisted ? '*(Whitelisted)*' : '*(Open)*'}`,
        value: `${d.description}\n` +
               `**Leadership:** ${d.leadership_role_id ? `<@&${d.leadership_role_id}>` : '*High Command*'}\n` +
               `**Apply Command:** \`/department-apply department:${d.dept_id}\``,
        inline: false
      }))
    });

    const targetChannel = config.departments.channelId
      ? interaction.guild.channels.cache.get(config.departments.channelId) || interaction.channel
      : interaction.channel;

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('dept_apply_menu')
        .setLabel('Apply for a Department')
        .setEmoji('📝')
        .setStyle(ButtonStyle.Primary)
    );

    await targetChannel.send({ embeds: [panelEmbed], components: [row] });
    logAudit(interaction.user.id, 'DEPLOY_DEPT_PANEL', targetChannel.id, 'Published department panel');

    return interaction.reply({ content: `✅ Department panel published in <#${targetChannel.id}>.`, ephemeral: true });
  }
};
