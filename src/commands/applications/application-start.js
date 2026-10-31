const { SlashCommandBuilder } = require('discord.js');
const appService = require('../../services/applicationService');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('application-start')
    .setDescription('Initiate the 15-question Staff Application in your Direct Messages'),

  async execute(interaction) {
    const result = await appService.startApplication(interaction.user, interaction.guild);

    if (!result.success) {
      return interaction.reply({
        embeds: [errorEmbed('Application Error', result.error)],
        ephemeral: true
      });
    }

    return interaction.reply({
      embeds: [
        successEmbed(
          'Application Started',
          'Please check your **Direct Messages**! The bot has sent you Question 1 of 15. Make sure your DMs are open.'
        )
      ],
      ephemeral: true
    });
  }
};
