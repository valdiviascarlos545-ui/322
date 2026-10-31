const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Display detailed statistics and metadata regarding this Discord community'),

  async execute(interaction) {
    const guild = interaction.guild;
    const owner = await guild.fetchOwner();
    const createdDate = guild.createdAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const embed = createEmbed({
      title: `🏛️ Community Information — ${guild.name}`,
      description: `Official server details for New York Roleplay:`,
      category: 'moderation',
      thumbnail: guild.iconURL({ dynamic: true }),
      fields: [
        { name: 'Server Owner', value: `<@${owner.id}> (${owner.user.tag})`, inline: true },
        { name: 'Guild ID', value: `\`${guild.id}\``, inline: true },
        { name: 'Created On', value: createdDate, inline: true },
        { name: 'Total Citizens', value: `${guild.memberCount.toLocaleString()}`, inline: true },
        { name: 'Server Boost Level', value: `Tier ${guild.premiumTier} (${guild.premiumSubscriptionCount || 0} Boosts)`, inline: true },
        { name: 'Verification Level', value: `${guild.verificationLevel}`, inline: true },
        { name: 'Total Text Channels', value: `${guild.channels.cache.filter(c => c.isTextBased()).size}`, inline: true },
        { name: 'Total Voice Lounges', value: `${guild.channels.cache.filter(c => c.isVoiceBased()).size}`, inline: true },
        { name: 'Total Server Roles', value: `${guild.roles.cache.size}`, inline: true }
      ]
    });

    return interaction.reply({ embeds: [embed] });
  }
};
