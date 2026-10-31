const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const appService = require('../../services/applicationService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('application-questions')
    .setDescription('Display the official 15 Staff Application questions'),

  async execute(interaction) {
    const questions = appService.getQuestions();

    const embed = createEmbed({
      title: '📋 New York Roleplay — Official Staff Application Form',
      description: 'Candidates are asked these 15 questions sequentially via DM upon starting an application:',
      category: 'applications',
      fields: questions.map((q, idx) => ({
        name: `Question ${idx + 1}`,
        value: q,
        inline: false
      }))
    });

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
