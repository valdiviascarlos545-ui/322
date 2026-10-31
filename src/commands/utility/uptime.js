const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const os = require('os');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('uptime')
    .setDescription('Check the uptime and system performance of Rolonbot'),

  async execute(interaction) {
    const uptimeSec = Math.floor(process.uptime());
    const days = Math.floor(uptimeSec / 86400);
    const hours = Math.floor((uptimeSec % 86400) / 3600);
    const minutes = Math.floor((uptimeSec % 3600) / 60);
    const seconds = uptimeSec % 60;

    const uptimeStr = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    const memory = process.memoryUsage();
    const heapUsedMb = (memory.heapUsed / 1024 / 1024).toFixed(1);
    const rssMb = (memory.rss / 1024 / 1024).toFixed(1);

    const embed = createEmbed({
      title: '⏱️ Rolonbot System Uptime & Diagnostics',
      description:
        `**Current Process Uptime:** \`${uptimeStr}\`\n` +
        `**Started:** <t:${Math.floor((Date.now() - (uptimeSec * 1000)) / 1000)}:R>\n\n` +
        `• **Memory Usage (Heap):** \`${heapUsedMb} MB\`\n` +
        `• **Memory Usage (RSS):** \`${rssMb} MB\`\n` +
        `• **Node.js Environment:** \`${process.version}\`\n` +
        `• **Platform:** \`${os.platform()} (${os.arch()})\`\n` +
        `• **CPU Model:** \`${os.cpus()[0]?.model || 'Standard Multi-Core CPU'}\``,
      category: 'regulations',
      color: 0x1DB954
    });

    return interaction.reply({ embeds: [embed] });
  }
};
