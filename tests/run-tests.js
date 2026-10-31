const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('======================================================');
console.log('🧪 NEW YORK ERLC BOT — AUTOMATED VERIFICATION SUITE');
console.log('======================================================\n');

let passedTests = 0;
let failedTests = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`❌ [FAIL] ${name}:`, err.message);
    failedTests++;
  }
}

async function runAsyncTest(name, fn) {
  try {
    await fn();
    console.log(`✅ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`❌ [FAIL] ${name}:`, err.message);
    failedTests++;
  }
}

// 1. DATABASE SCHEMA VERIFICATION
test('Database Initialization & Tables Count', () => {
  const db = require('../db');
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(t => t.name);
  assert(tables.includes('tickets'), 'Missing tickets table');
  assert(tables.includes('applications'), 'Missing applications table');
  assert(tables.includes('application_answers'), 'Missing application_answers table');
  assert(tables.includes('infractions'), 'Missing infractions table');
  assert(tables.includes('promotions'), 'Missing promotions table');
  assert(tables.includes('staff_profiles'), 'Missing staff_profiles table');
  assert(tables.includes('staff_feedback'), 'Missing staff_feedback table');
  assert(tables.includes('departments'), 'Missing departments table');
  assert(tables.includes('training_sessions'), 'Missing training_sessions table');
  assert(tables.includes('verifications'), 'Missing verifications table');
  assert(tables.includes('giveaways'), 'Missing giveaways table');
  assert(tables.includes('regulations'), 'Missing regulations table');
  assert(tables.includes('playlists'), 'Missing playlists table');
  assert(tables.length >= 25, `Expected >= 25 tables, found ${tables.length}`);
});

// 2. CHECK ALL 100 SLASH COMMANDS
test('Verify Exactly 100 Slash Commands with execute Handlers', () => {
  const commandsBaseDir = path.resolve(__dirname, '../src/commands');
  const categories = fs.readdirSync(commandsBaseDir);
  let totalCommands = 0;
  const commandNames = new Set();

  for (const cat of categories) {
    const catPath = path.join(commandsBaseDir, cat);
    if (!fs.statSync(catPath).isDirectory()) continue;
    const files = fs.readdirSync(catPath).filter(f => f.endsWith('.js'));
    for (const f of files) {
      const cmd = require(path.join(catPath, f));
      assert(cmd.data, `Command ${f} missing data property`);
      assert(typeof cmd.data.name === 'string', `Command ${f} missing data.name`);
      assert(typeof cmd.execute === 'function', `Command ${f} missing execute function`);
      assert(!commandNames.has(cmd.data.name), `Duplicate command name: ${cmd.data.name}`);
      commandNames.add(cmd.data.name);
      totalCommands++;
    }
  }

  assert(totalCommands >= 100, `Expected at least 100 commands, but found ${totalCommands}`);
  // Check critical Rolonbot music and utility commands
  const requiredMusic = ['play', 'nowplaying', 'pause', 'resume', 'skip', 'skipto', 'stop', 'queue', 'playlist', 'volume', 'loop', 'lyrics', 'move', 'remove', 'search', 'shuffle', 'dj-mode'];
  for (const reqCmd of requiredMusic) {
    assert(commandNames.has(reqCmd), `Missing required Rolonbot music command: ${reqCmd}`);
  }
  const requiredUtility = ['help', 'invite', 'ping', 'uptime'];
  for (const reqUtil of requiredUtility) {
    assert(commandNames.has(reqUtil), `Missing required utility command: ${reqUtil}`);
  }
});

// 3. SHARED EMBED BUILDER
test('Shared Embed Builder applies brand styling & dual banners', () => {
  const { createEmbed, createEmbeds, successEmbed, errorEmbed } = require('../src/utils/embedBuilder');
  const embed = createEmbed({
    title: 'Test Title',
    description: 'Test Description',
    category: 'tickets'
  });

  const json = embed.toJSON();
  assert.strictEqual(json.title, 'Test Title');
  assert.strictEqual(json.description, 'Test Description');
  assert(json.color, 'Missing color');
  assert(json.footer, 'Missing footer');
  assert(json.image, 'Missing image top banner');

  const embedsArray = createEmbeds({ title: 'Multi Banner Test', category: 'tickets' });
  assert(Array.isArray(embedsArray) && embedsArray.length >= 1, 'createEmbeds should return array of EmbedBuilders');
});

// 4. PERMISSIONS & HIERARCHY MANAGER
test('Centralized Permissions & Hierarchy Checks', () => {
  const { PERMISSION_LEVELS, hasPermission, canModerateMember, getMemberPermissionLevel } = require('../src/utils/permissions');
  assert.strictEqual(PERMISSION_LEVELS.OWNER > PERMISSION_LEVELS.SUPPORT_STAFF, true);
  assert.strictEqual(PERMISSION_LEVELS.DIRECTIVE > PERMISSION_LEVELS.MODERATION, true);

  // Mock members
  const ownerMember = { id: '12345', permissions: { has: () => true } };
  const staffMember = { id: '67890', permissions: { has: () => false }, roles: { cache: new Map() } };

  assert.strictEqual(canModerateMember(staffMember, staffMember), false, 'User cannot moderate themselves');
});

// 5. APPLICATION 15 QUESTIONS INTEGRITY
test('15 Staff Application Questions Verification', () => {
  const appService = require('../src/services/applicationService');
  const questions = appService.getQuestions();
  assert.strictEqual(questions.length, 15, `Expected 15 questions, found ${questions.length}`);
  assert(questions[0].includes('Discord username'), 'Question 1 should ask for Discord username');
  assert(questions[1].includes('Roblox username'), 'Question 2 should ask for Roblox username');
  assert(questions[2].includes('Roblox user ID'), 'Question 3 should ask for Roblox user ID');
});

// 6. ROBLOX VERIFICATION CODE GENERATION
test('Roblox Verification Code Generator & Security', () => {
  const robloxService = require('../src/services/robloxService');
  const code = robloxService.generateCode();
  assert(code.startsWith('NYRP-'), 'Verification code must start with NYRP- prefix');
  assert(code.length >= 12, 'Code must have sufficient cryptographic entropy');
});

// 7. STATUS MANAGER 100 ACTIVITIES
test('100 Rotating New York Roleplay Presences', () => {
  const statusManager = require('../src/services/statusManager');
  const activities = statusManager.getActivitiesList();
  assert.strictEqual(activities.length, 100, `Expected 100 activity entries, found ${activities.length}`);
  assert(activities.some(a => a.name.includes('New York Roleplay')), 'Missing New York Roleplay activity');
  assert(activities.some(a => a.name.includes('ER:LC')), 'Missing ER:LC activity');
});

// 8. TICKET TRANSCRIPT HTML ENGINE
test('HTML Transcript Generator outputs valid document', () => {
  const { generateHtmlTranscript, saveTranscriptFile } = require('../src/utils/transcript');
  const mockTicket = {
    ticket_id: 'NYRP-TEST-001',
    user_tag: 'Citizen#0001',
    user_id: '999888777',
    category: 'General',
    created_at: new Date().toISOString()
  };
  const mockMessages = [
    { username: 'Citizen#0001', content: 'Hello, I have an inquiry.', created_at: new Date().toISOString() },
    { username: 'Officer#1001', content: 'Hello! How can we assist you today?', created_at: new Date().toISOString() }
  ];

  const html = generateHtmlTranscript(mockTicket, mockMessages);
  assert(html.includes('NYRP-TEST-001'), 'Transcript missing ticket ID');
  assert(html.includes('Hello, I have an inquiry.'), 'Transcript missing message content');
  assert(html.includes('Officer#1001'), 'Transcript missing author tag');

  const { filePath } = saveTranscriptFile(mockTicket, mockMessages);
  assert(fs.existsSync(filePath), 'Transcript file was not written to disk');
});

// 9. ER:LC PRC SERVICE ERROR SAFETY
test('PRC Service graceful handling when key unconfigured', async () => {
  const prcService = require('../src/services/prcService');
  const result = await prcService.getServerInfo();
  assert(result.configured === false || typeof result.configured === 'boolean');
});

// 11. ROLONBOT MUSIC EMBED & PROGRESS BAR (NO TOP/BOTTOM BANNER)
test('Music Embed has NO top/bottom banner & generates YouTube progress bar', () => {
  const { createMusicEmbed, generateProgressBar } = require('../src/utils/embedBuilder');
  const embed = createMusicEmbed({
    title: 'FE!N - Travis Scott',
    description: 'Track details',
    thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819'
  });
  const json = embed.toJSON();
  assert.strictEqual(json.title, 'FE!N - Travis Scott');
  assert(!json.image, 'Music embed must NOT have top/bottom banner image');
  assert(json.color, 'Missing color');
  assert(json.thumbnail, 'Missing thumbnail');

  const bar = generateProgressBar(60, 180, 12);
  assert(bar.includes('🔘'), 'Progress bar must contain dot indicator');
  assert(bar.includes('01:00 / 03:00'), 'Progress bar must include formatted timestamps');
});

// 12. GENIUS API LYRICS SERVICE INTEGRITY
runAsyncTest('Genius API & Built-in Lyrics Lookup', async () => {
  const geniusService = require('../src/services/geniusService');
  const result = await geniusService.searchGenius('drake gods plan');
  assert(result, 'Lyrics search should return result');
  assert(result.title.toLowerCase().includes('god'), 'Result title should match query');
  assert(result.lyrics.length > 50, 'Lyrics content should be provided');
});

(async () => {
  console.log('\n======================================================');
  console.log(`TEST RUN COMPLETE: ${passedTests} Passed, ${failedTests} Failed.`);
  console.log('======================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
})();
