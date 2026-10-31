const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const db = require('../../../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Look up comprehensive user details, account age, verification, and roles')
    .addUserOption(opt => opt.setName('user').setDescription('User to inspect').setRequired(false)),

  async execute(interaction) {
    const targetUser = interaction.options.getUser('user') || interaction.user;
    const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

    const verif = db.prepare('SELECT * FROM verifications WHERE discord_id = ? AND verified_at != \'\'').get(targetUser.id);
    const infractions = db.prepare('SELECT COUNT(*) as c FROM infractions WHERE user_id = ? AND status = \'active\'').get(targetUser.id).c;
    const staffProfile = db.prepare('SELECT * FROM staff_profiles WHERE user_id = ?').get(targetUser.id);

    const accountCreated = targetUser.createdAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const joinedServer = member?.joinedAt ? member.joinedAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown';

    const rolesList = member?.roles?.cache
      ? member.roles.cache.filter(r => r.id !== interaction.guild.id).map(r => `<@&${r.id}>`).slice(0, 10).join(', ') || 'None'
      : 'None';

    const embed = createEmbed({
      title: `👤 Citizen Dossier — ${targetUser.username}`,
      description: `Comprehensive identity and server profile for <@${targetUser.id}>:`,
      category: 'moderation',
      thumbnail: targetUser.displayAvatarURL({ dynamic: true }),
      fields: [
        { name: 'Discord ID', value: `\`${targetUser.id}\``, inline: true },
        { name: 'Display Name', value: targetUser.displayName || targetUser.username, inline: true },
        { name: 'Account Created', value: accountCreated, inline: true },
        { name: 'Joined Server', value: joinedServer, inline: true },
        { name: 'Highest Role', value: member?.roles?.highest?.name || 'Citizen', inline: true },
        {
          name: 'Roblox Linked Account',
          value: verif ? `**${verif.roblox_username}** (\`${verif.roblox_id}\`)` : '*Unverified*',
          inline: true
        },
        {
          name: 'Staff Status',
          value: staffProfile ? `\`${(staffProfile.status || 'Active').toUpperCase()}\`` : '*Non-Staff*',
          inline: true
        },
        {
          name: 'Active Disciplinary Strikes',
          value: `\`${infractions}\``,
          inline: true
        },
        {
          name: 'Roles Assigned',
          value: rolesList,
          inline: false
        }
      ]
    });

    return interaction.reply({ embeds: [embed] });
  }
};
