const ticketService = require('../services/ticketService');
const appService = require('../services/applicationService');
const robloxService = require('../services/robloxService');
const giveawayService = require('../services/giveawayService');
const musicService = require('../services/musicService');
const { errorEmbed, successEmbed, createEmbed } = require('../utils/embedBuilder');
const { PERMISSION_LEVELS, hasPermission } = require('../utils/permissions');
const config = require('../../config');
const db = require('../../db');
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

async function handleButton(interaction) {
  const customId = interaction.customId;

  // Ticket buttons
  if (customId.startsWith('ticket_claim_')) {
    const ticketId = customId.replace('ticket_claim_', '');
    if (!hasPermission(interaction.member, PERMISSION_LEVELS.SUPPORT_STAFF)) {
      return interaction.reply({ content: '❌ Only staff members can claim tickets.', ephemeral: true });
    }
    const result = await ticketService.claimTicket(interaction, ticketId);
    if (!result.success) {
      return interaction.reply({ embeds: [errorEmbed('Claim Failed', result.error)], ephemeral: true });
    }
    return interaction.reply({ content: `✅ Ticket #${ticketId} claimed by <@${interaction.user.id}>.`, ephemeral: true });
  }

  if (customId.startsWith('ticket_close_')) {
    const ticketId = customId.replace('ticket_close_', '');
    return ticketService.closeTicket(interaction, ticketId, 'Closed via Button by ' + interaction.user.tag);
  }

  if (customId.startsWith('ticket_escalate_')) {
    const ticketId = customId.replace('ticket_escalate_', '');
    if (!hasPermission(interaction.member, PERMISSION_LEVELS.SUPPORT_STAFF)) {
      return interaction.reply({ content: '❌ Only staff members can escalate tickets.', ephemeral: true });
    }
    const result = await ticketService.escalateTicket(interaction, ticketId);
    if (!result.success) {
      return interaction.reply({ embeds: [errorEmbed('Escalation Failed', result.error)], ephemeral: true });
    }
    return interaction.reply({ content: '✅ Ticket escalated to Directive Team.', ephemeral: true });
  }

  // Application buttons
  if (customId.startsWith('app_approve_')) {
    const appId = customId.replace('app_approve_', '');
    if (!hasPermission(interaction.member, PERMISSION_LEVELS.SUPPORT_STAFF)) {
      return interaction.reply({ content: '❌ You must be an authorized reviewer to approve applications.', ephemeral: true });
    }
    const result = await appService.approveApplication(appId, interaction.member);
    if (!result.success) {
      return interaction.reply({ embeds: [errorEmbed('Approval Failed', result.error)], ephemeral: true });
    }
    return interaction.reply({ embeds: [successEmbed('Application Approved', `Application \`${appId}\` approved. Trainee role ${result.roleAssigned ? 'assigned' : 'not assigned'}.`)] });
  }

  if (customId.startsWith('app_deny_')) {
    const appId = customId.replace('app_deny_', '');
    if (!hasPermission(interaction.member, PERMISSION_LEVELS.SUPPORT_STAFF)) {
      return interaction.reply({ content: '❌ You must be an authorized reviewer to decline applications.', ephemeral: true });
    }
    const result = await appService.denyApplication(appId, interaction.member);
    if (!result.success) {
      return interaction.reply({ embeds: [errorEmbed('Denial Failed', result.error)], ephemeral: true });
    }
    return interaction.reply({ embeds: [successEmbed('Application Denied', `Application \`${appId}\` declined and update dispatched.`)] });
  }

  if (customId.startsWith('app_cancel_')) {
    return interaction.reply({ embeds: [errorEmbed('Application Cancelled', 'Your application session has been terminated.')] });
  }

  // Verification buttons
  if (customId === 'verify_start') {
    // Show Modal asking for Roblox username
    const modal = new ModalBuilder()
      .setCustomId('verify_username_modal')
      .setTitle('Roblox Account Verification');

    const usernameInput = new TextInputBuilder()
      .setCustomId('roblox_username')
      .setLabel('Your Roblox Username (not display name)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('e.g. Builderman')
      .setRequired(true)
      .setMinLength(3)
      .setMaxLength(20);

    const firstActionRow = new ActionRowBuilder().addComponents(usernameInput);
    modal.addComponents(firstActionRow);

    return interaction.showModal(modal);
  }

  if (customId === 'verify_check') {
    await interaction.deferReply({ ephemeral: true });
    const result = await robloxService.verifyCode(interaction.user.id);

    if (!result.success) {
      return interaction.editReply({
        embeds: [errorEmbed('Verification Failed', result.error)]
      });
    }

    // Assign verified role and remove unverified role
    if (interaction.guild && interaction.member) {
      try {
        if (config.verification.verifiedRoleId) {
          await interaction.member.roles.add(config.verification.verifiedRoleId);
        }
        if (config.verification.unverifiedRoleId) {
          await interaction.member.roles.remove(config.verification.unverifiedRoleId).catch(() => {});
        }
      } catch (e) {
        console.error('Error updating verification roles on member:', e);
      }
    }

    return interaction.editReply({
      embeds: [
        successEmbed(
          'Verification Successful! 🎉',
          `You have successfully linked and verified ownership of Roblox citizen **${result.username}** (ID: \`${result.robloxId}\`)!\n\n` +
          `Your Verified role has been granted and full server channels are now accessible. Welcome to New York Roleplay!`
        )
      ]
    });
  }

  if (customId === 'verify_help') {
    const embed = createEmbed({
      title: '❓ Verification Guidance',
      description: 'How to verify your Roblox account:\n\n' +
        '1. Click **Verify Account** and enter your Roblox username.\n' +
        '2. The bot generates a temporary code word (e.g. `NYRP-EMPIRE-1234`).\n' +
        '3. Go to [Roblox.com](https://www.roblox.com), view Profile, edit your About/Description box, and paste the code.\n' +
        '4. Save on Roblox and click **Check Profile Now**.\n' +
        '5. Done! You receive the Verified role and can remove the code from Roblox.',
      category: 'verification'
    });
    return interaction.reply({ embeds: [embed], ephemeral: true });
  }

  // Training buttons
  if (customId.startsWith('training_join_')) {
    const sessionId = customId.replace('training_join_', '');
    const session = db.prepare('SELECT * FROM training_sessions WHERE session_id = ?').get(sessionId);
    if (!session || (session.status !== 'Scheduled' && session.status !== 'Started')) {
      return interaction.reply({ embeds: [errorEmbed('Session Closed', 'This training is not accepting RSVPs.')], ephemeral: true });
    }

    const existing = db.prepare('SELECT * FROM training_attendance WHERE session_id = ? AND user_id = ?').get(sessionId, interaction.user.id);
    if (existing) {
      return interaction.reply({ embeds: [errorEmbed('Already Joined', 'You are already registered for this session.')], ephemeral: true });
    }

    db.prepare('INSERT INTO training_attendance (session_id, user_id, status, joined_at) VALUES (?, ?, \'attending\', ?)')
      .run(sessionId, interaction.user.id, new Date().toISOString());

    return interaction.reply({
      embeds: [successEmbed('Attendance Confirmed', `You have joined the attendance roster for session **#${sessionId}**!`)],
      ephemeral: true
    });
  }

  if (customId.startsWith('training_leave_')) {
    const sessionId = customId.replace('training_leave_', '');
    db.prepare('DELETE FROM training_attendance WHERE session_id = ? AND user_id = ?').run(sessionId, interaction.user.id);
    return interaction.reply({ embeds: [successEmbed('Left Training', `You were removed from session **#${sessionId}** attendance.`)], ephemeral: true });
  }

  // Giveaway buttons
  if (customId.startsWith('giveaway_enter_')) {
    const giveawayId = customId.replace('giveaway_enter_', '');
    const result = await giveawayService.enterGiveaway(interaction, giveawayId);
    if (!result.success) {
      return interaction.reply({ embeds: [errorEmbed('Entry Denied', result.error)], ephemeral: true });
    }
    return interaction.reply({
      embeds: [successEmbed(result.removed ? 'Left Giveaway' : 'Giveaway Entered! 🎉', result.message)],
      ephemeral: true
    });
  }

  // Music controls
  if (customId === 'music_pause_resume' || customId === 'music_pause' || customId === 'music_resume') {
    const queue = musicService.getQueue(interaction.guild.id);
    if (!queue || !queue.playing) {
      return interaction.reply({ content: '❌ No active music stream.', ephemeral: true });
    }
    if (queue.paused) {
      queue.player.unpause();
      queue.paused = false;
      queue.trackStartTime = Date.now();
      return interaction.reply({ content: '▶️ Resumed music playback.', ephemeral: true });
    } else {
      queue.player.pause();
      queue.paused = true;
      queue.pausedElapsed = queue.getElapsedSeconds();
      return interaction.reply({ content: '⏸️ Paused music playback.', ephemeral: true });
    }
  }

  if (customId === 'music_skip') {
    const queue = musicService.getQueue(interaction.guild.id);
    if (queue?.playing) {
      queue.player.stop();
      return interaction.reply({ content: '⏭️ Skipped current track.', ephemeral: true });
    }
    return interaction.reply({ content: '❌ No active music stream.', ephemeral: true });
  }

  if (customId === 'music_stop') {
    const queue = musicService.getQueue(interaction.guild.id);
    if (queue) {
      queue.stop();
      return interaction.reply({ content: '⏹️ Stopped playback and disconnected from voice channel.', ephemeral: true });
    }
    return interaction.reply({ content: '❌ No active music stream.', ephemeral: true });
  }

  if (customId === 'music_loop') {
    const queue = musicService.getQueue(interaction.guild.id);
    if (!queue || !queue.playing) {
      return interaction.reply({ content: '❌ No active music stream.', ephemeral: true });
    }
    if (queue.loopMode === 'off') queue.loopMode = 'track';
    else if (queue.loopMode === 'track') queue.loopMode = 'queue';
    else queue.loopMode = 'off';

    return interaction.reply({ content: `🔁 Loop mode is now: **${queue.loopMode.toUpperCase()}**`, ephemeral: true });
  }

  if (customId === 'music_shuffle') {
    const queue = musicService.getQueue(interaction.guild.id);
    if (!queue || queue.songs.length <= 1) {
      return interaction.reply({ content: '❌ Need at least 2 songs in queue to shuffle.', ephemeral: true });
    }
    queue.shuffle();
    return interaction.reply({ content: `🔀 Shuffled **${queue.songs.length}** upcoming tracks in queue!`, ephemeral: true });
  }

  if (customId === 'music_volup') {
    const queue = musicService.getQueue(interaction.guild.id);
    if (!queue) return interaction.reply({ content: '❌ No music queue.', ephemeral: true });
    const newVol = queue.setVolume(queue.volume + 10);
    return interaction.reply({ content: `🔊 Volume increased to **${newVol}%**`, ephemeral: true });
  }

  if (customId === 'music_voldown') {
    const queue = musicService.getQueue(interaction.guild.id);
    if (!queue) return interaction.reply({ content: '❌ No music queue.', ephemeral: true });
    const newVol = queue.setVolume(queue.volume - 10);
    return interaction.reply({ content: `🔉 Volume decreased to **${newVol}%**`, ephemeral: true });
  }

  if (customId === 'music_queue') {
    const queue = musicService.getQueue(interaction.guild.id);
    if (!queue || (!queue.playing && queue.songs.length === 0)) {
      return interaction.reply({ content: '❌ Queue is currently empty.', ephemeral: true });
    }
    const { createMusicEmbed } = require('../utils/embedBuilder');
    const upcoming = queue.songs.slice(0, 5).map((s, i) => `${i + 1}. **${s.title}** (\`${s.duration}\`)`).join('\n') || '*No more tracks in queue*';
    const embed = createMusicEmbed({
      title: '📋 Current Music Queue Preview',
      description: `**Now Playing:** ${queue.currentTrack ? `[${queue.currentTrack.title}](${queue.currentTrack.url})` : 'None'}\n\n**Next 5 Up:**\n${upcoming}\n\n*Total in queue: ${queue.songs.length} track(s)*`,
      color: 0x1DB954
    });
    return interaction.reply({ embeds: [embed], ephemeral: true });
  }

  if (customId === 'music_lyrics') {
    const queue = musicService.getQueue(interaction.guild.id);
    if (!queue || !queue.playing || !queue.currentTrack) {
      return interaction.reply({ content: '❌ No song currently playing to fetch lyrics for.', ephemeral: true });
    }
    await interaction.deferReply({ ephemeral: true });
    const geniusService = require('../services/geniusService');
    const { createMusicEmbed } = require('../utils/embedBuilder');
    const query = `${queue.currentTrack.artist || ''} ${queue.currentTrack.title || ''}`.trim();
    const result = await geniusService.searchGenius(query);
    if (!result) {
      return interaction.editReply({ content: `❌ No verified lyrics found on Genius for "${query}".` });
    }
    const snippet = result.lyrics.length > 3900 ? result.lyrics.substring(0, 3900) + '...' : result.lyrics;
    const embed = createMusicEmbed({
      title: `📜 Genius Lyrics: ${result.title}`,
      url: result.url,
      description: `**Artist:** ${result.artist}\n\n${snippet}`,
      thumbnail: result.thumbnail,
      footerText: 'Lyrics powered by Genius API • Rolonbot',
      color: 0xFFFF64
    });
    return interaction.editReply({ embeds: [embed] });
  }

  if (customId === 'music_presets') {
    const queue = musicService.getQueue(interaction.guild.id);
    const row = queue.createPlaylistSelectMenu();
    return interaction.reply({
      content: '🎵 **Select one of the 6 curated hot playlists below to enqueue:**',
      components: [row],
      ephemeral: true
    });
  }

  // Department Application buttons
  if (customId === 'dept_app_cancel') {
    db.prepare('DELETE FROM active_dept_sessions WHERE user_id = ?').run(interaction.user.id);
    return interaction.reply({
      embeds: [errorEmbed('Application Cancelled', 'Your department application session has been terminated.')],
      ephemeral: true
    });
  }

  if (customId.startsWith('dept_accept_')) {
    const parts = customId.split('_'); // ['dept', 'accept', deptId, userId]
    const deptId = parts[2];
    const targetUserId = parts[3];

    const dept = db.prepare('SELECT * FROM departments WHERE dept_id = ?').get(deptId);
    if (!dept) {
      return interaction.reply({ content: '❌ Department not found.', ephemeral: true });
    }

    const isDeptLeader = dept.leadership_role_id && interaction.member.roles.cache.has(dept.leadership_role_id);
    if (!isDeptLeader && !hasPermission(interaction.member, PERMISSION_LEVELS.ADMINISTRATION)) {
      return interaction.reply({ content: '❌ Only Department Leadership or Administration can accept candidates.', ephemeral: true });
    }

    const nowIso = new Date().toISOString();
    db.prepare('UPDATE department_applications SET status = \'approved\', reviewer_id = ? WHERE dept_id = ? AND user_id = ? AND status = \'pending\'')
      .run(interaction.user.id, deptId, targetUserId);

    db.prepare(`
      INSERT INTO department_members (dept_id, user_id, rank, joined_at)
      VALUES (?, ?, 'Officer / Member', ?)
      ON CONFLICT(dept_id, user_id) DO UPDATE SET joined_at = excluded.joined_at
    `).run(deptId, targetUserId, nowIso);

    // Assign role
    let roleAssigned = false;
    if (dept.member_role_id && interaction.guild) {
      try {
        const member = await interaction.guild.members.fetch(targetUserId).catch(() => null);
        if (member) {
          await member.roles.add(dept.member_role_id);
          roleAssigned = true;
        }
      } catch (e) {}
    }

    // DM candidate
    try {
      const candidateUser = await interaction.client.users.fetch(targetUserId).catch(() => null);
      if (candidateUser) {
        const acceptEmbed = createEmbed({
          title: `🎉 Department Application Accepted — ${dept.name}`,
          description: `Congratulations <@${targetUserId}>! Your application for **${dept.emoji} ${dept.name}** has been **ACCEPTED** by Department Leadership!\n\n` +
            `• Assigned Role: ${roleAssigned ? `<@&${dept.member_role_id}> granted` : 'Granted'}\n` +
            `• Please check department announcements for shift briefings and orientation.`,
          category: 'departments',
          color: 0x2ECC71
        });
        await candidateUser.send({ embeds: [acceptEmbed] });
      }
    } catch (e) {}

    return interaction.reply({
      embeds: [successEmbed('Applicant Accepted', `<@${targetUserId}> has been admitted into **${dept.emoji} ${dept.name}**.`)]
    });
  }

  if (customId.startsWith('dept_deny_')) {
    const parts = customId.split('_');
    const deptId = parts[2];
    const targetUserId = parts[3];

    const dept = db.prepare('SELECT * FROM departments WHERE dept_id = ?').get(deptId);
    if (!dept) return interaction.reply({ content: '❌ Department not found.', ephemeral: true });

    const isDeptLeader = dept.leadership_role_id && interaction.member.roles.cache.has(dept.leadership_role_id);
    if (!isDeptLeader && !hasPermission(interaction.member, PERMISSION_LEVELS.ADMINISTRATION)) {
      return interaction.reply({ content: '❌ Only Department Leadership or Administration can decline candidates.', ephemeral: true });
    }

    db.prepare('UPDATE department_applications SET status = \'denied\', reviewer_id = ? WHERE dept_id = ? AND user_id = ? AND status = \'pending\'')
      .run(interaction.user.id, deptId, targetUserId);

    try {
      const candidateUser = await interaction.client.users.fetch(targetUserId).catch(() => null);
      if (candidateUser) {
        const denyEmbed = createEmbed({
          title: `Department Application Update — ${dept.name}`,
          description: `Thank you for your interest in joining **${dept.emoji} ${dept.name}**.\n\nAt this time, Department Leadership has chosen not to move forward with your application. You may reapply in the future.`,
          category: 'departments',
          color: 0xE63946
        });
        await candidateUser.send({ embeds: [denyEmbed] });
      }
    } catch (e) {}

    return interaction.reply({
      embeds: [successEmbed('Applicant Denied', `Application for <@${targetUserId}> in **${dept.name}** marked denied.`)]
    });
  }

  if (customId === 'dept_apply_menu') {
    const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
    const depts = db.prepare('SELECT dept_id, name, emoji FROM departments').all();

    const select = new StringSelectMenuBuilder()
      .setCustomId('dept_select_apply')
      .setPlaceholder('Select an agency to apply for (15 Questions in DMs)...')
      .addOptions(
        depts.map(d =>
          new StringSelectMenuOptionBuilder()
            .setLabel(d.name)
            .setValue(d.dept_id)
            .setEmoji(d.emoji || '📋')
        )
      );

    const row = new ActionRowBuilder().addComponents(select);
    return interaction.reply({
      content: 'Select the department you wish to apply for below to launch your **15-question DM application**:',
      components: [row],
      ephemeral: true
    });
  }
}

module.exports = { handleButton };
