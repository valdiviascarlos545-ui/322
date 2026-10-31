const { SlashCommandBuilder } = require('discord.js');
const { createEmbed, successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const deptAppService = require('../../services/departmentApplicationService');
const config = require('../../../config');
const db = require('../../../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('department-apply')
    .setDescription('Apply to join an official New York Roleplay department (15 Questions in DMs)')
    .addStringOption(opt =>
      opt.setName('department')
        .setDescription('Department identifier')
        .setRequired(true)
        .addChoices(
          { name: 'NYPD - New York City Police Department', value: 'nypd' },
          { name: 'NYSP - New York State Police', value: 'nysp' },
          { name: 'FDNY - Fire Department of New York', value: 'fdny' },
          { name: 'EMS - Emergency Medical Services', value: 'ems' },
          { name: 'DOT - Department of Transportation', value: 'dot' },
          { name: 'FBI - Federal Bureau of Investigation', value: 'fbi' },
          { name: 'Civilian Operations', value: 'civ' }
        )
    ),

  async execute(interaction) {
    const deptId = interaction.options.getString('department');
    const dept = db.prepare('SELECT * FROM departments WHERE dept_id = ?').get(deptId);
    if (!dept) {
      return interaction.reply({ embeds: [errorEmbed('Department Error', 'Invalid department specified.')], ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });

    const result = await deptAppService.startDepartmentApplication(interaction.user, interaction.guild, deptId);
    if (!result.success) {
      return interaction.editReply({ embeds: [errorEmbed('Application Error', result.error)] });
    }

    return interaction.editReply({
      embeds: [
        successEmbed(
          '15-Question Application Started',
          `We have sent you Question 1 of 15 for **${dept.emoji} ${dept.name}** in your **Direct Messages**!\n\nPlease check your DMs to complete your questionnaire.`
        )
      ]
    });
  }
};
