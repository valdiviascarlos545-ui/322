const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { PERMISSION_LEVELS, hasPermission } = require('../../utils/permissions');
const config = require('../../../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('staff-list')
    .setDescription('List all registered staff members, officers, and trainees across New York Roleplay'),

  async execute(interaction) {
    const guild = interaction.guild;
    await interaction.deferReply();

    const staffRoleId = config.tickets.staffRoleId;
    const hrRoleId = config.staff.hrRoleId;
    const directiveRoleId = config.staff.directiveRoleId;
    const traineeRoleId = config.applications.traineeRoleId;

    const allMembers = await guild.members.fetch();

    const directiveMembers = directiveRoleId ? allMembers.filter(m => m.roles.cache.has(directiveRoleId)).map(m => `<@${m.id}>`) : [];
    const hrMembers = hrRoleId ? allMembers.filter(m => m.roles.cache.has(hrRoleId)).map(m => `<@${m.id}>`) : [];
    const staffMembers = staffRoleId ? allMembers.filter(m => m.roles.cache.has(staffRoleId)).map(m => `<@${m.id}>`) : [];
    const trainees = traineeRoleId ? allMembers.filter(m => m.roles.cache.has(traineeRoleId)).map(m => `<@${m.id}>`) : [];

    const embed = createEmbed({
      title: '🛡️ New York Roleplay — Official Staff Team Roster',
      description: 'Active personnel currently serving the New York Roleplay community.',
      category: 'promotions',
      fields: [
        {
          name: `🏛️ Directive Team (${directiveMembers.length})`,
          value: directiveMembers.length > 0 ? directiveMembers.join(', ') : '*None currently configured*',
          inline: false
        },
        {
          name: `⚖️ Human Resources & IA (${hrMembers.length})`,
          value: hrMembers.length > 0 ? hrMembers.join(', ') : '*None currently configured*',
          inline: false
        },
        {
          name: `👮 Active Staff & Moderators (${staffMembers.length})`,
          value: staffMembers.length > 0 ? staffMembers.slice(0, 30).join(', ') : '*None assigned*',
          inline: false
        },
        {
          name: `🔰 Academy Trainees (${trainees.length})`,
          value: trainees.length > 0 ? trainees.slice(0, 30).join(', ') : '*No active trainees*',
          inline: false
        }
      ]
    });

    return interaction.editReply({ embeds: [embed] });
  }
};
