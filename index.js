const { Client, GatewayIntentBits, Partials } = require('discord.js');
const config = require('./config');
const { loadCommands } = require('./src/handlers/commandHandler');
const { registerEvents } = require('./src/handlers/eventHandler');
const db = require('./db');

console.log('======================================================');
console.log('🗽 NEW YORK ERLC STAFF MANAGEMENT BOT — INITIALIZING');
console.log('======================================================\n');

// Validate environment
const warnings = config.validate();
if (warnings.length > 0) {
  console.warn('⚠️ Environment Setup Notice:');
  warnings.forEach(w => console.warn(`   • ${w}`));
  console.warn('\nPlease fill in your credentials in .env to connect to Discord live.\n');
}

// Instantiate Discord.js v14 Client with required intents and partials
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.User,
    Partials.GuildMember,
    Partials.Reaction
  ]
});

// Load commands and event handlers
loadCommands(client);
registerEvents(client);

// GLOBAL UNHANDLED ERROR HANDLERS (Anti-Crash & Reliability)
process.on('unhandledRejection', (reason, promise) => {
  console.error('[UNHANDLED REJECTION]:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION]:', err);
});

process.on('SIGINT', () => {
  console.log('\n[SHUTDOWN] Gracefully terminating New York ERLC bot...');
  try {
    db.close();
    console.log('[DATABASE] SQLite connections closed cleanly.');
  } catch (e) {}
  client.destroy();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n[SHUTDOWN] SIGTERM received. Gracefully shutting down...');
  try {
    db.close();
  } catch (e) {}
  client.destroy();
  process.exit(0);
});

// Connect to Discord Gateway if token is present
if (config.token && config.token !== 'YOUR_BOT_TOKEN_HERE') {
  client.login(config.token).catch(err => {
    console.error('❌ Failed to login to Discord:', err.message);
    if (err.message.includes('disallowed intents')) {
      console.error('\n👉 HOW TO FIX "Used disallowed intents":');
      console.error('   1. Open the Discord Developer Portal: https://discord.com/developers/applications');
      console.error('   2. Select your Bot Application -> Click "Bot" in the left sidebar');
      console.error('   3. Scroll down to the "Privileged Gateway Intents" section');
      console.error('   4. Toggle ON the following three switches:');
      console.error('      [x] Presence Intent');
      console.error('      [x] Server Members Intent');
      console.error('      [x] Message Content Intent');
      console.error('   5. Click "Save Changes" at the bottom and run `npm start` again!\n');
    } else {
      console.error('Check that your TOKEN in .env is valid.');
    }
  });
} else {
  console.log('ℹ️  Bot source code, 100 slash commands, database schema, and test suites are 100% ready!');
  console.log('👉 To connect live to Discord, add your TOKEN into .env and run: npm start\n');
}

module.exports = client;
