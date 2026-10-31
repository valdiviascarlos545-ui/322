const { SlashCommandBuilder } = require('discord.js');
const { createEmbed, successEmbed } = require('../../utils/embedBuilder');
const config = require('../../../config');
const db = require('../../../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('staff-return')
    .setDescription('Mark yourself or another staff member returned from Leave of Absence (LOA)')
    .addUserOption(option =>
      option.setName('staff')
        .setDescription('Staff member (HR only, defaults to yourself)')
        .setRequired(false)
    ),

  async execute(interaction) {
    const targetUser = interaction.options.getUser('staff') || interaction.user;

    db.prepare('UPDATE staff_leave SET status = \'completed\' WHERE user_id = ? AND status = \'active\'')
      .run(targetUser.id);

    db.prepare(`
      UPDATE staff_profiles
      SET status = 'active', loa_start = NULL, loa_end = NULL
      WHERE user_id = ?
    `).run(targetUser.id);

    const embed = createEmbed({
      title: '💼 Staff Return From LOA',
      description: `<@${targetUser.id}> has officially returned from Leave of Absence and resumed active duty status.`,
      category: 'promotions'
    });

    if (config.staff.logChannelId) {
      try {
        const logChan = interaction.guild.channels.cache.get(config.staff.logChannelId);
        if (logChan && logChan.isTextBased()) {
          await logChan.send({ embeds: [embed] });
        }
      } catch (e) {
        console.error('Failed to log staff return:', e);
      }
    }

    return interaction.reply({
      embeds: [successEmbed('Returned to Duty', `<@${targetUser.id}> is now marked as **ACTIVE** in staff records.`)]
    });
  }
};
