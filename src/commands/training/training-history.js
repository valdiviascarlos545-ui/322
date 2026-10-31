const { SlashCommandBuilder } = require('discord.js');
const { createEmbed, errorEmbed } = require('../../utils/embedBuilder');
const db = require('../../../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('training-history')
    .setDescription('Look up all academy training and classroom evaluations for a staff member')
    .addUserOption(opt => opt.setName('user').setDescription('Staff member or trainee').setRequired(false)),

  async execute(interaction) {
    const targetUser = interaction.options.getUser('user') || interaction.user;
    const results = db.prepare('SELECT * FROM training_results WHERE user_id = ? ORDER BY id DESC').all(targetUser.id);

    if (results.length === 0) {
      return interaction.reply({
        embeds: [errorEmbed('No Training Records', `No recorded classroom results found for <@${targetUser.id}>.`)],
        ephemeral: true
      });
    }

    const embed = createEmbed({
      title: `🎓 Training Academy Record — ${targetUser.username}`,
      description: `Training and evaluation archive for <@${targetUser.id}>:`,
      category: 'training',
      fields: results.map(r => ({
        name: `Session ${r.session_id} • ${r.status === 'Passed' ? '🟢 Passed' : '🔴 Failed'}`,
        value: `**Trainer:** <@${r.trainer_id}>\n**Date:** <t:${Math.floor(new Date(r.created_at).getTime() / 1000)}:d>\n**Note:** "${r.notes}"`,
        inline: false
      }))
    });

    return interaction.reply({ embeds: [embed] });
  }
};
