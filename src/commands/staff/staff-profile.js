const { SlashCommandBuilder } = require('discord.js');
const { createEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { PERMISSION_LEVELS, hasPermission } = require('../../utils/permissions');
const db = require('../../../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('staff-profile')
    .setDescription('View detailed HR record and performance profile of a staff member')
    .addUserOption(option =>
      option.setName('staff')
        .setDescription('Staff member to look up (defaults to yourself)')
        .setRequired(false)
    ),

  async execute(interaction) {
    const targetUser = interaction.options.getUser('staff') || interaction.user;

    const profile = db.prepare('SELECT * FROM staff_profiles WHERE user_id = ?').get(targetUser.id);
    const notesCount = db.prepare('SELECT COUNT(*) as c FROM staff_notes WHERE user_id = ?').get(targetUser.id).c;
    const infractionsCount = db.prepare('SELECT COUNT(*) as c FROM infractions WHERE user_id = ? AND status = \'active\'').get(targetUser.id).c;
    const feedbackAvg = db.prepare('SELECT AVG(rating) as avg, COUNT(*) as c FROM staff_feedback WHERE staff_id = ?').get(targetUser.id);
    const verif = db.prepare('SELECT * FROM verifications WHERE discord_id = ? AND verified_at != \'\'').get(targetUser.id);

    const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
    const highestRole = targetMember?.roles?.highest?.name || 'Staff Member';

    const embed = createEmbed({
      title: `👤 Staff Profile — ${targetUser.username}`,
      description: `Official New York Roleplay Human Resources personnel file for <@${targetUser.id}>.`,
      category: 'promotions',
      fields: [
        { name: 'Discord ID', value: `\`${targetUser.id}\``, inline: true },
        { name: 'Current Rank', value: highestRole, inline: true },
        { name: 'Status', value: profile?.status ? `\`${profile.status.toUpperCase()}\`` : '`ACTIVE`', inline: true },
        { name: 'Roblox Username', value: verif?.roblox_username || profile?.roblox_username || 'Not Linked', inline: true },
        { name: 'Roblox ID', value: verif?.roblox_id || profile?.roblox_id || 'N/A', inline: true },
        { name: 'Active Infractions', value: `\`${infractionsCount}\``, inline: true },
        { name: 'HR Notes', value: `\`${notesCount}\``, inline: true },
        {
          name: 'Community Rating',
          value: feedbackAvg.c > 0 ? `⭐ ${Number(feedbackAvg.avg).toFixed(1)}/5 (${feedbackAvg.c} reviews)` : 'No ratings yet',
          inline: true
        },
        {
          name: 'LOA Status',
          value: profile?.loa_start ? `On LOA until ${profile.loa_end}` : 'Not on Leave',
          inline: true
        }
      ]
    });

    return interaction.reply({ embeds: [embed] });
  }
};
