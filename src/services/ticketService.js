const { ChannelType, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require('discord.js');
const db = require('../../db');
const config = require('../../config');
const { createEmbed, createEmbeds, successEmbed, errorEmbed, warningEmbed } = require('../utils/embedBuilder');
const { saveTranscriptFile } = require('../utils/transcript');

class TicketService {
  /**
   * Creates a new ticket channel and records in DB
   */
  async createTicket(interaction, category) {
    const guild = interaction.guild;
    const user = interaction.user;

    // Check if user already has an open ticket in this category
    const existingTicket = db.prepare('SELECT * FROM tickets WHERE guild_id = ? AND user_id = ? AND status = \'open\' AND category = ?')
      .get(guild.id, user.id, category);

    if (existingTicket) {
      return {
        success: false,
        error: `You already have an active open ticket in category **${category}**: <#${existingTicket.channel_id}>.`
      };
    }

    const ticketNumber = (db.prepare('SELECT COUNT(*) as count FROM tickets').get().count + 1).toString().padStart(4, '0');
    const channelName = `ticket-${category.toLowerCase().replace(/\s+/g, '-')}-${ticketNumber}`;

    // Select category parent channel
    let parentId = null;
    if (category === 'High Rank' && config.tickets.highRankCategoryId) {
      parentId = config.tickets.highRankCategoryId;
    } else if (category === 'Department' && config.tickets.deptCategoryId) {
      parentId = config.tickets.deptCategoryId;
    } else if (category === 'General' && config.tickets.generalCategoryId) {
      parentId = config.tickets.generalCategoryId;
    } else {
      parentId = config.tickets.categoryId || null;
    }

    // Permission overwrites
    const permissionOverwrites = [
      {
        id: guild.roles.everyone.id,
        deny: [PermissionFlagsBits.ViewChannel]
      },
      {
        id: user.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.AttachFiles,
          PermissionFlagsBits.EmbedLinks,
          PermissionFlagsBits.ReadMessageHistory
        ]
      },
      {
        id: guild.members.me.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ManageChannels,
          PermissionFlagsBits.EmbedLinks,
          PermissionFlagsBits.AttachFiles,
          PermissionFlagsBits.ReadMessageHistory
        ]
      }
    ];

    // Add support staff role if configured
    if (config.tickets.staffRoleId) {
      permissionOverwrites.push({
        id: config.tickets.staffRoleId,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.AttachFiles,
          PermissionFlagsBits.EmbedLinks,
          PermissionFlagsBits.ReadMessageHistory
        ]
      });
    }

    // High rank role if High Rank ticket
    if (category === 'High Rank' && config.tickets.directiveTeamRoleId) {
      permissionOverwrites.push({
        id: config.tickets.directiveTeamRoleId,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.AttachFiles,
          PermissionFlagsBits.EmbedLinks,
          PermissionFlagsBits.ReadMessageHistory
        ]
      });
    }

    let channel;
    try {
      channel = await guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        parent: parentId,
        permissionOverwrites
      });
    } catch (err) {
      return { success: false, error: `Failed to create Discord ticket channel: ${err.message}` };
    }

    const ticketId = `NYRP-${ticketNumber}`;
    const nowIso = new Date().toISOString();

    // Insert into DB
    db.prepare(`
      INSERT INTO tickets (ticket_id, channel_id, guild_id, user_id, user_tag, category, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'open', ?)
    `).run(ticketId, channel.id, guild.id, user.id, user.tag, category, nowIso);

    // Format account creation date
    const accountCreatedDate = user.createdAt ? user.createdAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown';

    // Send Welcome Embed
    const welcomeEmbed = createEmbed({
      title: `📬 Welcome to ${category} Support`,
      description: `Hey there, **${user.username}** — Welcome to **${category}**.\n\nPlease ensure you have thoroughly reviewed our Frequently Asked Questions and that your inquiry is unique so our Support Team can provide quality support as soon as possible. If you have any extra information in regards to your inquiry, you’re encouraged to add it here.`,
      category: 'tickets',
      fields: [
        { name: 'Username', value: user.username, inline: true },
        { name: 'User ID', value: `\`${user.id}\``, inline: true },
        { name: 'Display Name', value: user.displayName || user.username, inline: true },
        { name: 'Account Created', value: accountCreatedDate, inline: true },
        { name: 'Category', value: `🔹 ${category}`, inline: true },
        { name: 'Opened At', value: `<t:${Math.floor(Date.now() / 1000)}:f>`, inline: true }
      ]
    });

    const buttonsRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`ticket_claim_${ticketId}`)
        .setLabel('Claim')
        .setEmoji('🟢')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`ticket_close_${ticketId}`)
        .setLabel('Close')
        .setEmoji('🔴')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId(`ticket_escalate_${ticketId}`)
        .setLabel('Escalate')
        .setEmoji('🔵')
        .setStyle(ButtonStyle.Primary)
    );

    await channel.send({
      content: `<@${user.id}> Welcome! A member of the Support Team will be with you shortly.`,
      embeds: [welcomeEmbed],
      components: [buttonsRow]
    });

    // Log creation
    if (config.tickets.logChannelId) {
      try {
        const logChan = guild.channels.cache.get(config.tickets.logChannelId);
        if (logChan && logChan.isTextBased()) {
          const logEmbed = createEmbed({
            title: '📬 Ticket Opened',
            description: `Ticket **#${ticketId}** was opened by <@${user.id}> in <#${channel.id}>.`,
            category: 'tickets',
            fields: [
              { name: 'Category', value: category, inline: true },
              { name: 'Ticket ID', value: ticketId, inline: true }
            ]
          });
          await logChan.send({ embeds: [logEmbed] });
        }
      } catch (e) {
        console.error('Failed to send ticket log:', e);
      }
    }

    return {
      success: true,
      ticketId,
      channel
    };
  }

  async claimTicket(interaction, ticketId) {
    const ticket = db.prepare('SELECT * FROM tickets WHERE ticket_id = ?').get(ticketId);
    if (!ticket) return { success: false, error: 'Ticket not found in database.' };
    if (ticket.status !== 'open') return { success: false, error: 'This ticket is already closed.' };
    if (ticket.claimed_by) {
      return { success: false, error: `This ticket has already been claimed by <@${ticket.claimed_by}>.` };
    }

    const nowIso = new Date().toISOString();
    db.prepare('UPDATE tickets SET claimed_by = ?, claimed_at = ? WHERE ticket_id = ?')
      .run(interaction.user.id, nowIso, ticketId);

    db.prepare('INSERT INTO ticket_staff (ticket_id, staff_id, action, timestamp) VALUES (?, ?, \'claim\', ?)')
      .run(ticketId, interaction.user.id, nowIso);

    const claimEmbed = successEmbed('Ticket Claimed', `Ticket marked as active by <@${interaction.user.id}>.`);
    await interaction.channel.send({ embeds: [claimEmbed] });

    return { success: true, claimedBy: interaction.user.id };
  }

  async escalateTicket(interaction, ticketId) {
    const ticket = db.prepare('SELECT * FROM tickets WHERE ticket_id = ?').get(ticketId);
    if (!ticket) return { success: false, error: 'Ticket not found in database.' };
    if (ticket.escalated) {
      return { success: false, error: `This ticket was already escalated by <@${ticket.escalated_by}>.` };
    }

    const nowIso = new Date().toISOString();
    db.prepare('UPDATE tickets SET escalated = 1, escalated_by = ? WHERE ticket_id = ?')
      .run(interaction.user.id, ticketId);

    // Add Directive Team permissions to channel
    if (config.tickets.directiveTeamRoleId && interaction.guild) {
      try {
        await interaction.channel.permissionOverwrites.edit(config.tickets.directiveTeamRoleId, {
          ViewChannel: true,
          SendMessages: true,
          ReadMessageHistory: true
        });
      } catch (err) {
        console.error('Failed to grant directive role to escalated ticket channel:', err);
      }
    }

    const escalateNotice = createEmbed({
      title: '🔵 Ticket Escalated',
      description: `This ticket has been escalated to **Directive Support** by <@${interaction.user.id}>.\n\nDirective Team members have been notified and granted access.`,
      category: 'tickets',
      color: 0x3A86FF
    });

    const pingDirective = config.tickets.directiveTeamRoleId ? `<@&${config.tickets.directiveTeamRoleId}>` : '';
    await interaction.channel.send({ content: pingDirective, embeds: [escalateNotice] });

    return { success: true };
  }

  async closeTicket(interaction, ticketId, reason = 'Resolved') {
    const ticket = db.prepare('SELECT * FROM tickets WHERE ticket_id = ?').get(ticketId);
    if (!ticket) return { success: false, error: 'Ticket not found in database.' };
    if (ticket.status === 'closed') return { success: false, error: 'Ticket is already closed.' };

    const channel = interaction.channel;
    const guild = interaction.guild;
    const nowIso = new Date().toISOString();

    // Fetch messages from channel for transcript
    let messages = [];
    try {
      const fetched = await channel.messages.fetch({ limit: 100 });
      messages = Array.from(fetched.values()).reverse().map(m => ({
        user_id: m.author.id,
        username: m.author.tag || m.author.username,
        content: m.content,
        attachments: m.attachments.map(a => ({ url: a.url, name: a.name })),
        created_at: m.createdAt.toISOString()
      }));

      // Store in SQLite
      const insertMsg = db.prepare(`
        INSERT INTO ticket_messages (ticket_id, user_id, username, content, attachments, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      for (const m of messages) {
        insertMsg.run(ticketId, m.user_id, m.username, m.content, JSON.stringify(m.attachments), m.created_at);
      }
    } catch (e) {
      console.error('Failed to fetch messages for transcript:', e);
    }

    // Update DB
    db.prepare(`
      UPDATE tickets
      SET status = 'closed', closed_by = ?, closed_at = ?, close_reason = ?
      WHERE ticket_id = ?
    `).run(interaction.user.id, nowIso, reason, ticketId);

    // Generate HTML transcript
    const updatedTicket = db.prepare('SELECT * FROM tickets WHERE ticket_id = ?').get(ticketId);
    const { filePath, fileName } = saveTranscriptFile(updatedTicket, messages);

    // Send transcript to configured transcript channel
    if (config.tickets.transcriptChannelId && guild) {
      try {
        const transChan = guild.channels.cache.get(config.tickets.transcriptChannelId);
        if (transChan && transChan.isTextBased()) {
          const transEmbeds = createEmbeds({
            title: `📁 Transcript Archived: #${ticketId}`,
            description: `Ticket #${ticketId} created by <@${ticket.user_id}> has been closed by <@${interaction.user.id}>.`,
            category: 'tickets',
            fields: [
              { name: 'Category', value: ticket.category, inline: true },
              { name: 'Reason', value: reason, inline: true },
              { name: 'Total Messages', value: `${messages.length}`, inline: true }
            ]
          });
          const attachment = new AttachmentBuilder(filePath, { name: fileName });
          await transChan.send({ embeds: transEmbeds, files: [attachment] });
        }
      } catch (err) {
        console.error('Failed to post transcript to transcript channel:', err);
      }
    }

    // DM creator with transcript and dual banners
    try {
      const creatorUser = await interaction.client.users.fetch(ticket.user_id).catch(() => null);
      if (creatorUser) {
        const dmEmbeds = createEmbeds({
          title: `📬 Ticket Closed — #${ticketId}`,
          description: `Your support ticket in **${ticket.category}** has been marked closed by staff.\n\nThank you for reaching out to New York Roleplay Support!`,
          category: 'tickets',
          fields: [
            { name: 'Closed By', value: `<@${interaction.user.id}>`, inline: true },
            { name: 'Closure Reason', value: reason, inline: true }
          ]
        });
        const attachment = new AttachmentBuilder(filePath, { name: fileName });
        await creatorUser.send({ embeds: dmEmbeds, files: [attachment] }).catch(() => {});
      }
    } catch (e) {
      // DM closed
    }

    // Inform channel and delete after delay
    await interaction.reply({
      embeds: [warningEmbed('Closing Ticket', `This ticket channel will be permanently archived and deleted in 5 seconds...`)]
    });

    setTimeout(async () => {
      try {
        await channel.delete('Ticket closed by ' + interaction.user.tag);
      } catch (err) {
        console.error('Failed to delete ticket channel:', err);
      }
    }, 5000);

    return { success: true, filePath };
  }
}

module.exports = new TicketService();
