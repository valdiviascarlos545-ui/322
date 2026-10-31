const db = require('../../db');
const config = require('../../config');
const { createEmbed, successEmbed, errorEmbed } = require('../utils/embedBuilder');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

class GiveawayService {
  constructor() {
    this.activeTimers = new Map();
  }

  init(client) {
    // Recover all un-ended giveaways from DB
    const active = db.prepare('SELECT * FROM giveaways WHERE ended = 0').all();
    for (const g of active) {
      const remainingMs = g.end_time - Date.now();
      if (remainingMs <= 0) {
        this.endGiveaway(client, g.giveaway_id);
      } else {
        const timer = setTimeout(() => {
          this.endGiveaway(client, g.giveaway_id);
        }, remainingMs);
        this.activeTimers.set(g.giveaway_id, timer);
      }
    }
  }

  async startGiveaway(channel, prize, durationMinutes, winnerCount, requiredRoleId, hostUser) {
    const giveawayId = `GW-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const endTime = Date.now() + durationMinutes * 60 * 1000;

    const embed = createEmbed({
      title: '🎉 NEW YORK ROLEPLAY GIVEAWAY 🎉',
      description: `Enter the giveaway below by clicking the **Enter Giveaway** button!\n\n` +
        `**Prize:** 🏆 **${prize}**\n` +
        `**Winners:** ${winnerCount}\n` +
        `**Ends:** <t:${Math.floor(endTime / 1000)}:R> (<t:${Math.floor(endTime / 1000)}:f>)\n` +
        `**Hosted By:** <@${hostUser.id}>\n` +
        `${requiredRoleId ? `**Required Role:** <@&${requiredRoleId}>\n` : ''}` +
        `**Entries:** 0`,
      category: 'giveaways',
      color: 0xF1C40F
    });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`giveaway_enter_${giveawayId}`)
        .setLabel('🎉 Enter Giveaway')
        .setStyle(ButtonStyle.Success)
    );

    const message = await channel.send({ embeds: [embed], components: [row] });

    db.prepare(`
      INSERT INTO giveaways (giveaway_id, channel_id, message_id, prize, winner_count, end_time, ended, required_role_id, host_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?)
    `).run(giveawayId, channel.id, message.id, prize, winnerCount, endTime, requiredRoleId || null, hostUser.id, new Date().toISOString());

    const timer = setTimeout(() => {
      this.endGiveaway(channel.client, giveawayId);
    }, durationMinutes * 60 * 1000);

    this.activeTimers.set(giveawayId, timer);

    return { giveawayId, messageId: message.id, endTime };
  }

  async enterGiveaway(interaction, giveawayId) {
    const giveaway = db.prepare('SELECT * FROM giveaways WHERE giveaway_id = ?').get(giveawayId);
    if (!giveaway) {
      return { success: false, error: 'Giveaway not found.' };
    }
    if (giveaway.ended) {
      return { success: false, error: 'This giveaway has already concluded.' };
    }

    // Role requirement check
    if (giveaway.required_role_id) {
      if (!interaction.member.roles.cache.has(giveaway.required_role_id)) {
        return {
          success: false,
          error: `You do not have the required role (<@&${giveaway.required_role_id}>) to enter this giveaway.`
        };
      }
    }

    // Duplicate check
    const existing = db.prepare('SELECT * FROM giveaway_entries WHERE giveaway_id = ? AND user_id = ?')
      .get(giveawayId, interaction.user.id);

    if (existing) {
      // Toggle leave giveaway
      db.prepare('DELETE FROM giveaway_entries WHERE giveaway_id = ? AND user_id = ?')
        .run(giveawayId, interaction.user.id);
      return { success: true, removed: true, message: 'You have left the giveaway.' };
    }

    // Enter
    db.prepare('INSERT INTO giveaway_entries (giveaway_id, user_id, entered_at) VALUES (?, ?, ?)')
      .run(giveawayId, interaction.user.id, new Date().toISOString());

    const entryCount = db.prepare('SELECT COUNT(*) as count FROM giveaway_entries WHERE giveaway_id = ?').get(giveawayId).count;

    return {
      success: true,
      removed: false,
      entryCount,
      message: 'You have successfully entered the giveaway! Good luck!'
    };
  }

  async endGiveaway(client, giveawayId) {
    const giveaway = db.prepare('SELECT * FROM giveaways WHERE giveaway_id = ?').get(giveawayId);
    if (!giveaway || giveaway.ended) return;

    db.prepare('UPDATE giveaways SET ended = 1 WHERE giveaway_id = ?').run(giveawayId);
    if (this.activeTimers.has(giveawayId)) {
      clearTimeout(this.activeTimers.get(giveawayId));
      this.activeTimers.delete(giveawayId);
    }

    const entries = db.prepare('SELECT user_id FROM giveaway_entries WHERE giveaway_id = ?').all(giveawayId);
    const channel = client.channels.cache.get(giveaway.channel_id);

    let winnerMentions = 'None (no entries)';
    let winnerIds = [];

    if (entries.length > 0) {
      // Shuffle & pick
      const shuffled = entries.sort(() => 0.5 - Math.random());
      const winners = shuffled.slice(0, giveaway.winner_count);
      winnerIds = winners.map(w => w.user_id);
      winnerMentions = winnerIds.map(id => `<@${id}>`).join(', ');
    }

    db.prepare('UPDATE giveaways SET winners = ? WHERE giveaway_id = ?').run(JSON.stringify(winnerIds), giveawayId);

    if (channel && channel.isTextBased()) {
      try {
        const message = await channel.messages.fetch(giveaway.message_id).catch(() => null);
        const endedEmbed = createEmbed({
          title: '🎉 GIVEAWAY ENDED 🎉',
          description: `**Prize:** 🏆 **${giveaway.prize}**\n` +
            `**Winners:** ${winnerMentions}\n` +
            `**Hosted By:** <@${giveaway.host_id}>\n` +
            `**Total Entries:** ${entries.length}`,
          category: 'giveaways',
          color: 0x95A5A6
        });

        if (message) {
          await message.edit({ embeds: [endedEmbed], components: [] });
        }

        if (winnerIds.length > 0) {
          await channel.send(`🎊 Congratulations ${winnerMentions}! You won the **${giveaway.prize}**!`);
        } else {
          await channel.send(`Giveaway for **${giveaway.prize}** ended, but no eligible entries were received.`);
        }
      } catch (err) {
        console.error('Failed to announce giveaway end:', err);
      }
    }
  }

  async rerollGiveaway(channel, giveawayId) {
    const giveaway = db.prepare('SELECT * FROM giveaways WHERE giveaway_id = ?').get(giveawayId);
    if (!giveaway) return { success: false, error: 'Giveaway not found.' };

    const entries = db.prepare('SELECT user_id FROM giveaway_entries WHERE giveaway_id = ?').all(giveawayId);
    if (entries.length === 0) return { success: false, error: 'No entries to reroll.' };

    const randomWinner = entries[Math.floor(Math.random() * entries.length)].user_id;

    if (channel && channel.isTextBased()) {
      await channel.send(`🎉 **Giveaway Reroll!**\nThe new winner for **${giveaway.prize}** is: <@${randomWinner}>! Congratulations!`);
    }

    return { success: true, winnerId: randomWinner };
  }
}

module.exports = new GiveawayService();
