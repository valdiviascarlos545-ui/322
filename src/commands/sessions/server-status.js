const { SlashCommandBuilder } = require('discord.js');
const { createEmbed, errorEmbed } = require('../../utils/embedBuilder');
const prcService = require('../../services/prcService');
const config = require('../../../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('server-status')
    .setDescription('Query real-time live ER:LC private server player counts, queue, and staff via PRC API'),

  async execute(interaction) {
    await interaction.deferReply();

    const info = await prcService.getServerInfo();

    if (!info.configured) {
      const fallbackEmbed = createEmbed({
        title: '🎮 ER:LC Server Status (Configuration Required)',
        description: `To query live player counts directly from your ER:LC private server, set your \`PRC_SERVER_KEY\` in your \`.env\` file.\n\n` +
          `**Server Name:** New York Roleplay\n` +
          `**Join Link:** [Connect to ER:LC](${config.prc.joinUrl})\n` +
          `**PRC API Integration:** Ready (Waiting for Server Key in .env)`,
        category: 'sessions',
        color: 0x1D3557
      });
      return interaction.editReply({ embeds: [fallbackEmbed] });
    }

    if (!info.success) {
      return interaction.editReply({
        embeds: [errorEmbed('PRC API Error', info.error)]
      });
    }

    const data = info.data;
    const current = data.CurrentPlayers ?? 0;
    const max = data.MaxPlayers ?? 32;
    const queue = data.Queue ?? 0;

    const embed = createEmbed({
      title: `🏙️ Live Server Telemetry — ${data.Name || 'New York Roleplay'}`,
      description: `Live private server metrics retrieved via the official Police Roleplay Community (PRC) API:`,
      category: 'sessions',
      color: current >= max ? 0xE63946 : 0x2ECC71,
      fields: [
        { name: 'Server Name', value: data.Name || 'New York Roleplay', inline: true },
        { name: 'Players Online', value: `\`${current} / ${max}\``, inline: true },
        { name: 'Waiting in Queue', value: `\`${queue}\` players`, inline: true },
        { name: 'Join Key', value: `\`${data.JoinKey || 'Private'}\``, inline: true },
        { name: 'Status', value: current >= max ? '🔴 Server Full' : '🟢 Open Slots Available', inline: true },
        { name: 'Direct Join', value: `[Click Here to Join](${config.prc.joinUrl})`, inline: true }
      ]
    });

    return interaction.editReply({ embeds: [embed] });
  }
};
