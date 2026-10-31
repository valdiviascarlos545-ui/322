const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { saveTranscriptFile } = require('../../utils/transcript');
const { errorEmbed, successEmbed } = require('../../utils/embedBuilder');
const { PERMISSION_LEVELS, hasPermission } = require('../../utils/permissions');
const db = require('../../../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket-transcript')
    .setDescription('Generate and download an immediate HTML transcript of the current ticket'),

  async execute(interaction) {
    if (!hasPermission(interaction.member, PERMISSION_LEVELS.SUPPORT_STAFF)) {
      return interaction.reply({ content: '❌ Only staff members can generate ticket transcripts.', ephemeral: true });
    }

    const ticket = db.prepare('SELECT * FROM tickets WHERE channel_id = ?').get(interaction.channel.id);
    if (!ticket) {
      return interaction.reply({ embeds: [errorEmbed('Invalid Channel', 'This channel is not associated with any recorded ticket.')], ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });

    let messages = [];
    try {
      const fetched = await interaction.channel.messages.fetch({ limit: 100 });
      messages = Array.from(fetched.values()).reverse().map(m => ({
        user_id: m.author.id,
        username: m.author.tag || m.author.username,
        content: m.content,
        attachments: m.attachments.map(a => ({ url: a.url, name: a.name })),
        created_at: m.createdAt.toISOString()
      }));
    } catch (e) {
      console.error('Error fetching messages for transcript command:', e);
    }

    const { filePath, fileName } = saveTranscriptFile(ticket, messages);
    const attachment = new AttachmentBuilder(filePath, { name: fileName });

    return interaction.editReply({
      content: `📁 HTML transcript for **#${ticket.ticket_id}** generated successfully:`,
      files: [attachment]
    });
  }
};
