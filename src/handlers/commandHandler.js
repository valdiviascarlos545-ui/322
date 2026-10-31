const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');

function loadCommands(client) {
  client.commands = new Collection();
  const commandsBaseDir = path.resolve(__dirname, '../commands');

  const categories = fs.readdirSync(commandsBaseDir);
  let loadedCount = 0;

  for (const category of categories) {
    const categoryPath = path.join(commandsBaseDir, category);
    if (!fs.statSync(categoryPath).isDirectory()) continue;

    const commandFiles = fs.readdirSync(categoryPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
      const filePath = path.join(categoryPath, file);
      try {
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
          client.commands.set(command.data.name, command);
          loadedCount++;
        } else {
          console.warn(`[WARNING] Command at ${filePath} is missing required "data" or "execute" property.`);
        }
      } catch (err) {
        console.error(`[ERROR] Failed to load command ${file}:`, err);
      }
    }
  }

  console.log(`[COMMANDS] Successfully loaded ${loadedCount} slash commands.`);
  return client.commands;
}

module.exports = { loadCommands };
