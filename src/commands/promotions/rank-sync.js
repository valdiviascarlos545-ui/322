const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createEmbed, successEmbed } = require('../../utils/embedBuilder');
const { PERMISSION_LEVELS, hasPermission, logAudit } = require('../../utils/permissions');
const db = require('../../../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rank-sync')
    .setDescription('Synchronize Discord guild roles with the internal staff database')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    if (!hasPermission(interaction.member, PERMISSION_LEVELS.ADMINISTRATION)) {
      return interaction.reply({ content: '❌ Only Administration or Directive can run rank synchronization.', ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });

    const guild = interaction.guild;
    const members = await guild.members.fetch();
    const ranks = db.prepare('SELECT * FROM ranks').all();

    let updatedCount = 0;
    const nowIso = new Date().toISOString();

    for (const [id, member] of members) {
      if (member.user.bot) continue;
      const highestRole = member.roles.highest;

      // Check if member already has a profile
      const profile = db.prepare('SELECT * FROM staff_profiles WHERE user_id = ?').get(id);
      if (profile) {
        db.prepare('UPDATE staff_profiles SET rank_role_id = ?, rank_name = ? WHERE user_id = ?')
          .run(highestRole.id, highestRole.name, id);
        updatedCount++;
      }
    }

    logAudit(interaction.user.id, 'RANK_SYNC', null, `Synchronized ${updatedCount} staff profiles`);

    return interaction.editReply({
      embeds: [successEmbed('Rank Sync Complete', `Successfully verified and synchronized **${updatedCount}** staff member profiles with active Discord roles.`)]
    });
  }
};
