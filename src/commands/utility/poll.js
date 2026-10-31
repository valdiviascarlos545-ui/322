const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { PERMISSION_LEVELS, hasPermission } = require('../../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Create a structured community poll with up to 5 choices')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addStringOption(opt => opt.setName('question').setDescription('Poll question or topic').setRequired(true))
    .addStringOption(opt => opt.setName('option1').setDescription('First choice').setRequired(true))
    .addStringOption(opt => opt.setName('option2').setDescription('Second choice').setRequired(true))
    .addStringOption(opt => opt.setName('option3').setDescription('Third choice').setRequired(false))
    .addStringOption(opt => opt.setName('option4').setDescription('Fourth choice').setRequired(false))
    .addStringOption(opt => opt.setName('option5').setDescription('Fifth choice').setRequired(false)),

  async execute(interaction) {
    if (!hasPermission(interaction.member, PERMISSION_LEVELS.SUPPORT_STAFF)) {
      return interaction.reply({ content: '❌ Only staff can create official polls.', ephemeral: true });
    }

    const question = interaction.options.getString('question');
    const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'];
    const options = [
      interaction.options.getString('option1'),
      interaction.options.getString('option2'),
      interaction.options.getString('option3'),
      interaction.options.getString('option4'),
      interaction.options.getString('option5')
    ].filter(Boolean);

    const embed = createEmbed({
      title: '📊 Community Poll — New York Roleplay',
      description: `**${question}**\n\n` +
        options.map((opt, i) => `${emojis[i]} ${opt}`).join('\n\n') +
        `\n\n*Cast your vote by reacting with the corresponding number below!*`,
      category: 'moderation'
    });

    const msg = await interaction.channel.send({ embeds: [embed] });
    for (let i = 0; i < options.length; i++) {
      await msg.react(emojis[i]);
    }

    return interaction.reply({ content: '✅ Poll created and reactions added.', ephemeral: true });
  }
};
