const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const db = require('../../../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('application-withdraw')
    .setDescription('Withdraw your currently pending staff application'),

  async execute(interaction) {
    const app = db.prepare('SELECT * FROM applications WHERE user_id = ? AND status = \'pending\'').get(interaction.user.id);
    if (!app) {
      return interaction.reply({
        embeds: [errorEmbed('No Pending Application', 'You do not have any active pending applications undergoing review.')],
        ephemeral: true
      });
    }

    db.prepare('UPDATE applications SET status = \'withdrawn\', reviewed_at = ? WHERE app_id = ?')
      .run(new Date().toISOString(), app.app_id);

    return interaction.reply({
      embeds: [successEmbed('Application Withdrawn', `Your staff application (\`${app.app_id}\`) has been successfully withdrawn. You may submit a new application when ready.`)],
      ephemeral: true
    });
  }
};
