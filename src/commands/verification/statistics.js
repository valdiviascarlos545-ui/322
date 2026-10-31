const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const config = require('../../../config');
const db = require('../../../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('statistics')
    .setDescription('Display live Discord server statistics and community metrics'),

  async execute(interaction) {
    await interaction.deferReply();

    const guild = interaction.guild;
    const members = await guild.members.fetch();

    const totalMembers = guild.memberCount;
    // Count online members from member presence where available
    const onlineMembers = members.filter(m => m.presence?.status && m.presence.status !== 'offline').size;
    const boosts = guild.premiumSubscriptionCount || 0;

    const totalVerified = db.prepare('SELECT COUNT(*) as c FROM verifications WHERE verified_at != \'\'').get().c;
    const totalStaff = db.prepare('SELECT COUNT(*) as c FROM staff_profiles').get().c;
    const totalDepartments = db.prepare('SELECT COUNT(*) as c FROM departments').get().c;
    const openTickets = db.prepare('SELECT COUNT(*) as c FROM tickets WHERE status = \'open\'').get().c;
    const pendingApps = db.prepare('SELECT COUNT(*) as c FROM applications WHERE status = \'pending\'').get().c;

    const embed = createEmbed({
      title: '👥 Server Statistics',
      description: `**${guild.name}**\n\nOfficial community data retrieved live from the Discord API and database:`,
      category: 'moderation',
      fields: [
        { name: '➡️ Members', value: `**${totalMembers.toLocaleString()}**`, inline: true },
        { name: '➡️ Online', value: `**${onlineMembers > 0 ? onlineMembers.toLocaleString() : 'Active'}**`, inline: true },
        { name: '➡️ Server Boosts', value: `**${boosts}** (Tier ${guild.premiumTier})`, inline: true },
        { name: 'Total Verified Members', value: `\`${totalVerified.toLocaleString()}\``, inline: true },
        { name: 'Registered Staff', value: `\`${totalStaff}\``, inline: true },
        { name: 'Active Departments', value: `\`${totalDepartments}\``, inline: true },
        { name: 'Open Support Tickets', value: `\`${openTickets}\``, inline: true },
        { name: 'Pending Applications', value: `\`${pendingApps}\``, inline: true }
      ]
    });

    return interaction.editReply({ embeds: [embed] });
  }
};
