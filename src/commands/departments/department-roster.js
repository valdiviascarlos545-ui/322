const { SlashCommandBuilder } = require('discord.js');
const { createEmbed, errorEmbed } = require('../../utils/embedBuilder');
const db = require('../../../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('department-roster')
    .setDescription('Display the active personnel roster for a New York department')
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
      return interaction.reply({ embeds: [errorEmbed('Department Error', 'Department not found.')], ephemeral: true });
    }

    const members = db.prepare('SELECT user_id, rank, joined_at FROM department_members WHERE dept_id = ?').all(deptId);

    const embed = createEmbed({
      title: `${dept.emoji} ${dept.name} — Personnel Roster`,
      description: `${dept.description}\n\n**Total Registered Personnel:** ${members.length}`,
      category: 'departments',
      fields: [
        {
          name: 'Leadership & Command',
          value: dept.leadership_role_id ? `<@&${dept.leadership_role_id}>` : '*Assigned by Directive*',
          inline: true
        },
        {
          name: 'Whitelist Status',
          value: dept.whitelisted ? '🔒 Whitelisted (Application Required)' : '🔓 Open to Citizens',
          inline: true
        },
        {
          name: 'Active Roster Members',
          value: members.length > 0
            ? members.map(m => `• <@${m.user_id}> (${m.rank}) — <t:${Math.floor(new Date(m.joined_at).getTime() / 1000)}:d>`).join('\n')
            : '*No members registered in database yet. Use /department-accept to enroll members.*',
          inline: false
        }
      ]
    });

    return interaction.reply({ embeds: [embed] });
  }
};
