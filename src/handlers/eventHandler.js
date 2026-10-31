const { handleButton } = require('./buttonHandler');
const { handleSelectMenu } = require('./selectMenuHandler');
const { handleModal } = require('./modalHandler');
const appService = require('../services/applicationService');
const statusManager = require('../services/statusManager');
const giveawayService = require('../services/giveawayService');
const { createEmbed, errorEmbed } = require('../utils/embedBuilder');
const config = require('../../config');
const db = require('../../db');

const deptAppService = require('../services/departmentApplicationService');

function registerEvents(client) {
  // READY EVENT
  client.once('ready', () => {
    console.log(`[BOT READY] Logged in as ${client.user.tag} (ID: ${client.user.id})`);
    console.log(`[SERVERS] Connected to ${client.guilds.cache.size} guild(s).`);

    // Start 100 rotating presences
    statusManager.start(client, 30);

    // Initialize persistent giveaways and timer recovery
    giveawayService.init(client);
  });

  // INTERACTION CREATE EVENT
  client.on('interactionCreate', async (interaction) => {
    try {
      if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) {
          return interaction.reply({ content: `❌ Command \`/${interaction.commandName}\` is not recognized.`, ephemeral: true });
        }

        await command.execute(interaction);
      } else if (interaction.isButton()) {
        await handleButton(interaction);
      } else if (interaction.isStringSelectMenu()) {
        await handleSelectMenu(interaction);
      } else if (interaction.isModalSubmit()) {
        await handleModal(interaction);
      }
    } catch (error) {
      console.error(`[INTERACTION ERROR] [${interaction.user?.tag || 'Unknown'}]`, error);

      // Forward to developer error log channel if configured
      if (config.community.errorLogChannelId && interaction.guild) {
        try {
          const errChan = interaction.guild.channels.cache.get(config.community.errorLogChannelId);
          if (errChan && errChan.isTextBased()) {
            const errEmbed = createEmbed({
              title: '🚨 System Error Logged',
              description: `An uncaught exception occurred while handling an interaction from <@${interaction.user?.id}>.\n\n\`\`\`js\n${error.stack?.slice(0, 1000) || error.message}\n\`\`\``,
              color: 0xE63946
            });
            await errChan.send({ embeds: [errEmbed] });
          }
        } catch (e) {}
      }

      const errorMessage = {
        embeds: [errorEmbed('An Error Occurred', 'There was an internal error executing this command. The issue has been logged for bot developers.')],
        ephemeral: true
      };

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(errorMessage).catch(() => {});
      } else {
        await interaction.reply(errorMessage).catch(() => {});
      }
    }
  });

  // MESSAGE CREATE (DM Application Questionnaire & Ticket Logging)
  client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // Handle DM message for staff and department applications
    if (!message.guild) {
      const handledStaff = await appService.handleDmMessage(message, client);
      if (handledStaff) return;

      const handledDept = await deptAppService.handleDmResponse(message, client);
      if (handledDept) return;
    }

    // Save ticket messages in DB if channel is a ticket
    if (message.guild) {
      try {
        const ticket = db.prepare('SELECT ticket_id FROM tickets WHERE channel_id = ? AND status = \'open\'').get(message.channel.id);
        if (ticket) {
          const attachments = message.attachments.map(a => ({ url: a.url, name: a.name }));
          db.prepare(`
            INSERT INTO ticket_messages (ticket_id, user_id, username, content, attachments, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
          `).run(ticket.ticket_id, message.author.id, message.author.tag, message.content, JSON.stringify(attachments), new Date().toISOString());
        }
      } catch (e) {}
    }
  });

  // GUILD MEMBER ADD (Welcome & Milestone Goal Verification)
  client.on('guildMemberAdd', async (member) => {
    // Check if user was previously verified
    const verif = db.prepare('SELECT * FROM verifications WHERE discord_id = ? AND verified_at != \'\'').get(member.id);
    if (verif && config.verification.verifiedRoleId) {
      await member.roles.add(config.verification.verifiedRoleId).catch(() => {});
    } else if (config.verification.unverifiedRoleId) {
      await member.roles.add(config.verification.unverifiedRoleId).catch(() => {});
    }

    // Send Welcome Message if configured
    if (config.community.welcomeChannelId) {
      try {
        const welcomeChan = member.guild.channels.cache.get(config.community.welcomeChannelId);
        if (welcomeChan && welcomeChan.isTextBased()) {
          const welcomeEmbed = createEmbed({
            title: `🗽 Welcome to New York Roleplay, ${member.user.username}!`,
            description: `Welcome <@${member.id}> to the premier New York ERLC Roleplay community!\n\n` +
              `• Verify your Roblox account in <#${config.verification.channelId || 'verification'}>\n` +
              `• Read our community and in-game regulations\n` +
              `• Apply for active departments or staff positions!`,
            thumbnail: member.user.displayAvatarURL({ dynamic: true })
          });
          await welcomeChan.send({ content: `<@${member.id}>`, embeds: [welcomeEmbed] });
        }
      } catch (e) {}
    }

    // Check Member Milestone Goals
    const memberCount = member.guild.memberCount;
    const unreachedGoals = db.prepare('SELECT * FROM server_goals WHERE reached = 0 AND target_count <= ?').all(memberCount);

    for (const g of unreachedGoals) {
      db.prepare('UPDATE server_goals SET reached = 1, announced_at = ? WHERE id = ?')
        .run(new Date().toISOString(), g.id);

      if (config.community.goalAnnouncementChannelId) {
        try {
          const goalChan = member.guild.channels.cache.get(config.community.goalAnnouncementChannelId);
          if (goalChan && goalChan.isTextBased()) {
            const goalEmbed = createEmbed({
              title: `🎉 Community Milestone Reached — ${g.target_count.toLocaleString()} Members!`,
              description: g.message,
              color: 0xF1C40F
            });
            await goalChan.send({ embeds: [goalEmbed] });
          }
        } catch (e) {}
      }
    }
  });

  // GUILD MEMBER REMOVE (Goodbye)
  client.on('guildMemberRemove', async (member) => {
    if (config.community.goodbyeChannelId) {
      try {
        const byeChan = member.guild.channels.cache.get(config.community.goodbyeChannelId);
        if (byeChan && byeChan.isTextBased()) {
          const byeEmbed = createEmbed({
            title: 'Departure',
            description: `**${member.user.tag}** has left New York Roleplay. We wish them the best on their journey.`,
            color: 0x64748B
          });
          await byeChan.send({ embeds: [byeEmbed] });
        }
      } catch (e) {}
    }
  });
}

module.exports = { registerEvents };
