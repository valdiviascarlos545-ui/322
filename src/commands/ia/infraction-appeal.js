const { SlashCommandBuilder } = require('discord.js');
const { createEmbed, successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const config = require('../../../config');
const db = require('../../../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('infraction-appeal')
    .setDescription('Submit a formal appeal for an active appealable infraction')
    .addStringOption(opt => opt.setName('case_id').setDescription('Case ID to appeal').setRequired(true))
    .addStringOption(opt => opt.setName('statement').setDescription('Your formal statement and justification').setRequired(true)),

  async execute(interaction) {
    const caseId = interaction.options.getString('case_id').toUpperCase();
    const statement = interaction.options.getString('statement');

    const inf = db.prepare('SELECT * FROM infractions WHERE case_id = ?').get(caseId);
    if (!inf) {
      return interaction.reply({ embeds: [errorEmbed('Case Not Found', `No infraction found with ID \`${caseId}\`.`)], ephemeral: true });
    }

    if (inf.user_id !== interaction.user.id) {
      return interaction.reply({ embeds: [errorEmbed('Unauthorized', 'You may only file an appeal for your own infractions.')], ephemeral: true });
    }

    if (!inf.appealable) {
      return interaction.reply({ embeds: [errorEmbed('Unappealable', `Disciplinary Case \`${caseId}\` was designated as strictly non-appealable by High Rank Command.`)], ephemeral: true });
    }

    if (inf.status === 'appealed' || inf.status === 'voided') {
      return interaction.reply({ embeds: [errorEmbed('Already Processed', `This case has already been ${inf.status}.`)], ephemeral: true });
    }

    db.prepare('UPDATE infractions SET status = \'pending_appeal\' WHERE case_id = ?').run(caseId);

    const appealEmbed = createEmbed({
      title: `⚖️ Infraction Appeal Submitted — ${caseId}`,
      description: `<@${interaction.user.id}> has formally appealed their infraction.`,
      category: 'infractions',
      fields: [
        { name: 'Appellant', value: `<@${interaction.user.id}>`, inline: true },
        { name: 'Original Punishment', value: inf.punishment, inline: true },
        { name: 'Original Issuer', value: `<@${inf.issued_by}>`, inline: true },
        { name: 'Appeal Statement', value: statement, inline: false }
      ]
    });

    if (config.staff.iaLogChannelId) {
      try {
        const iaChan = interaction.guild.channels.cache.get(config.staff.iaLogChannelId);
        if (iaChan && iaChan.isTextBased()) {
          await iaChan.send({ embeds: [appealEmbed] });
        }
      } catch (e) {
        console.error('Failed to route appeal to IA log:', e);
      }
    }

    return interaction.reply({
      embeds: [successEmbed('Appeal Submitted', `Your appeal for Case \`${caseId}\` has been logged and submitted to the Internal Affairs Directorate for formal review.`)],
      ephemeral: true
    });
  }
};
