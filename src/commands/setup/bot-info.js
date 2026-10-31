const { SlashCommandBuilder, version: djsVersion } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const os = require('os');
const db = require('../../../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('bot-info')
    .setDescription('Display bot system statistics, memory usage, uptime, and database records'),

  async execute(interaction) {
    const uptimeSec = Math.floor(process.uptime());
    const days = Math.floor(uptimeSec / 86400);
    const hours = Math.floor((uptimeSec % 86400) / 3600);
    const mins = Math.floor((uptimeSec % 3600) / 60);
    const secs = uptimeSec % 60;
    const uptimeStr = `${days}d ${hours}h ${mins}m ${secs}s`;

    const memUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(1);

    const ticketCount = db.prepare('SELECT COUNT(*) as c FROM tickets').get().c;
    const appCount = db.prepare('SELECT COUNT(*) as c FROM applications').get().c;
    const staffCount = db.prepare('SELECT COUNT(*) as c FROM staff_profiles').get().c;
    const verifiedCount = db.prepare('SELECT COUNT(*) as c FROM verifications WHERE verified_at != \'\'').get().c;

    const embed = createEmbed({
      title: '🤖 New York Roleplay Bot — System Intelligence',
      description: 'Production Discord.js v14 Staff Management & ER:LC Private Server Bot built for New York Roleplay.',
      category: 'moderation',
      fields: [
        { name: 'Node.js Version', value: `\`${process.version}\``, inline: true },
        { name: 'Discord.js', value: `\`v${djsVersion}\``, inline: true },
        { name: 'Uptime', value: `\`${uptimeStr}\``, inline: true },
        { name: 'Memory Usage', value: `\`${memUsage} MB\` / \`${totalMem} GB\``, inline: true },
        { name: 'Database Engine', value: '`SQLite3 (WAL)`', inline: true },
        { name: 'Ping / Latency', value: `\`${interaction.client.ws.ping} ms\``, inline: true },
        { name: 'Total Tickets Logged', value: `\`${ticketCount}\``, inline: true },
        { name: 'Total Applications', value: `\`${appCount}\``, inline: true },
        { name: 'Verified Citizens', value: `\`${verifiedCount}\``, inline: true },
        { name: 'Registered Staff Profiles', value: `\`${staffCount}\``, inline: true }
      ]
    });

    return interaction.reply({ embeds: [embed] });
  }
};
