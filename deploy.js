const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config');

const commands = [];
const commandsBaseDir = path.resolve(__dirname, 'src/commands');
const categories = fs.readdirSync(commandsBaseDir);

console.log('====================================================');
console.log('NEW YORK ERLC BOT — SLASH COMMAND DEPLOYMENT');
console.log('====================================================\n');

for (const category of categories) {
  const categoryPath = path.join(commandsBaseDir, category);
  if (!fs.statSync(categoryPath).isDirectory()) continue;

  const commandFiles = fs.readdirSync(categoryPath).filter(file => file.endsWith('.js'));
  console.log(`📁 Loading category "${category}" (${commandFiles.length} commands)...`);

  for (const file of commandFiles) {
    const filePath = path.join(categoryPath, file);
    try {
      const command = require(filePath);
      if ('data' in command && typeof command.data.toJSON === 'function') {
        commands.push(command.data.toJSON());
      } else {
        console.warn(`[WARNING] Command ${file} does not have valid SlashCommandBuilder data.`);
      }
    } catch (err) {
      console.error(`[ERROR] Failed to read ${file}:`, err.message);
    }
  }
}

console.log(`\n✅ Total Slash Commands prepared for registration: ${commands.length} / 100\n`);

const isGlobal = process.argv.includes('--global');
const warnings = config.validate();

if (!config.token) {
  console.error('❌ Error: TOKEN is missing in your .env file.');
  console.error('Please configure TOKEN in .env and retry.');
  process.exit(1);
}

if (!config.clientId) {
  console.error('❌ Error: CLIENT_ID is missing in your .env file.');
  console.error('Please configure CLIENT_ID in .env and retry.');
  process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(config.token);

(async () => {
  try {
    if (isGlobal) {
      console.log(`🚀 Deploying ${commands.length} slash commands GLOBALLY across all Discord servers...`);
      console.log('(Note: Global Discord command propagation may take up to 1 hour to index)\n');

      const data = await rest.put(
        Routes.applicationCommands(config.clientId),
        { body: commands }
      );
      console.log(`🎉 Successfully registered ${data.length} global application slash commands!`);
    } else {
      if (!config.guildId) {
        console.warn('⚠️ GUILD_ID is not set in .env. Falling back to global deployment...');
        const data = await rest.put(
          Routes.applicationCommands(config.clientId),
          { body: commands }
        );
        console.log(`🎉 Successfully registered ${data.length} application commands!`);
      } else {
        console.log(`⚡ Deploying ${commands.length} slash commands INSTANTLY to Guild ID: ${config.guildId}...`);

        const data = await rest.put(
          Routes.applicationGuildCommands(config.clientId, config.guildId),
          { body: commands }
        );
        console.log(`🎉 Successfully registered ${data.length} guild slash commands in server ${config.guildId}!`);
      }
    }
  } catch (error) {
    console.error('❌ Discord REST API Deployment Failed:', error);
    process.exit(1);
  }
})();
