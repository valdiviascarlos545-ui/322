const { SlashCommandBuilder } = require('discord.js');
const { createEmbed, errorEmbed } = require('../../utils/embedBuilder');
const db = require('../../../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('application-status')
    .setDescription('Check the review status of your staff application')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to check (Staff only)')
        .setRequired(false)
    ),

  async execute(interaction) {
    const target = interaction.options.getUser('user') || interaction.user;
    const isSelf = target.id === interaction.user.id;

    const apps = db.prepare('SELECT * FROM applications WHERE user_id = ? ORDER BY id DESC LIMIT 5').all(target.id);
    const blacklist = db.prepare('SELECT * FROM application_blacklists WHERE user_id = ?').get(target.id);

    if (apps.length === 0 && !blacklist) {
      return interaction.reply({
        embeds: [errorEmbed('No Applications Found', `${isSelf ? 'You have' : `<@${target.id}> has`} not submitted any staff applications yet.`)],
        ephemeral: true
      });
    }

    const embed = createEmbed({
      title: `📋 Application Records — ${target.username}`,
      description: blacklist
        ? `⚠️ **Warning:** This user is currently **BLACKLISTED** from submitting applications.\n**Reason:** ${blacklist.reason}`
        : `Recent application history for <@${target.id}>:`,
      category: 'applications',
      fields: apps.map(a => ({
        name: `ID: ${a.app_id} • Status: ${a.status.toUpperCase()}`,
        value: `Submitted: <t:${Math.floor(new Date(a.submitted_at).getTime() / 1000)}:R>\n` +
               `${a.reviewed_at ? `Reviewed: <t:${Math.floor(new Date(a.reviewed_at).getTime() / 1000)}:R> by <@${a.reviewer_id}>\n` : ''}`,
        inline: false
      }))
    });

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
