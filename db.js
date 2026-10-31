const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const config = require('./config');

const dbPath = path.resolve(process.cwd(), config.databasePath);
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS guild_config (
    guild_id TEXT PRIMARY KEY,
    config_json TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id TEXT UNIQUE NOT NULL,
    channel_id TEXT NOT NULL,
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    user_tag TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    claimed_by TEXT,
    claimed_at TEXT,
    escalated INTEGER NOT NULL DEFAULT 0,
    escalated_by TEXT,
    closed_by TEXT,
    closed_at TEXT,
    close_reason TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS ticket_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    username TEXT NOT NULL,
    content TEXT,
    attachments TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS ticket_staff (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id TEXT NOT NULL,
    staff_id TEXT NOT NULL,
    action TEXT NOT NULL,
    timestamp TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    app_id TEXT UNIQUE NOT NULL,
    user_id TEXT NOT NULL,
    user_tag TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'Staff Application',
    status TEXT NOT NULL DEFAULT 'pending',
    reviewer_id TEXT,
    reviewer_tag TEXT,
    reviewer_notes TEXT,
    submitted_at TEXT NOT NULL,
    reviewed_at TEXT
  );

  CREATE TABLE IF NOT EXISTS application_answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    app_id TEXT NOT NULL,
    question_num INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    answer_text TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS application_reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    app_id TEXT NOT NULL,
    reviewer_id TEXT NOT NULL,
    decision TEXT NOT NULL,
    notes TEXT,
    reviewed_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS application_blacklists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT UNIQUE NOT NULL,
    reason TEXT NOT NULL,
    issued_by TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS staff_profiles (
    user_id TEXT PRIMARY KEY,
    roblox_username TEXT,
    roblox_id TEXT,
    rank_role_id TEXT,
    rank_name TEXT,
    department TEXT,
    status TEXT DEFAULT 'active',
    loa_start TEXT,
    loa_end TEXT,
    notes_count INTEGER DEFAULT 0,
    infractions_count INTEGER DEFAULT 0,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS staff_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    author_id TEXT NOT NULL,
    note TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS staff_feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    staff_id TEXT NOT NULL,
    submitter_id TEXT NOT NULL,
    rating INTEGER NOT NULL,
    reason TEXT NOT NULL,
    ticket_id TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS staff_activity (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    activity_type TEXT NOT NULL,
    duration_minutes INTEGER DEFAULT 0,
    notes TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS staff_leave (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    reason TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    approved_by TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS infractions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    case_id TEXT UNIQUE NOT NULL,
    user_id TEXT NOT NULL,
    issued_by TEXT NOT NULL,
    punishment TEXT NOT NULL,
    reason TEXT NOT NULL,
    appealable INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'active',
    thread_id TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS investigations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    case_id TEXT UNIQUE NOT NULL,
    target_id TEXT NOT NULL,
    lead_investigator_id TEXT NOT NULL,
    title TEXT NOT NULL,
    details TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    thread_id TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS promotions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    old_rank TEXT,
    new_rank TEXT NOT NULL,
    reason TEXT NOT NULL,
    issued_by TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'promotion',
    thread_id TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS ranks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role_id TEXT UNIQUE NOT NULL,
    rank_name TEXT NOT NULL,
    level INTEGER NOT NULL DEFAULT 1,
    permissions_group TEXT NOT NULL DEFAULT 'Staff'
  );

  CREATE TABLE IF NOT EXISTS departments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dept_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    emoji TEXT NOT NULL,
    description TEXT NOT NULL,
    logo_url TEXT,
    whitelisted INTEGER NOT NULL DEFAULT 1,
    leadership_role_id TEXT,
    member_role_id TEXT
  );

  CREATE TABLE IF NOT EXISTS department_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dept_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    rank TEXT DEFAULT 'Member',
    joined_at TEXT NOT NULL,
    UNIQUE(dept_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS department_applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dept_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    answers TEXT NOT NULL,
    reviewer_id TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS training_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT UNIQUE NOT NULL,
    host_id TEXT NOT NULL,
    topic TEXT NOT NULL,
    scheduled_time TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Scheduled',
    server_link TEXT,
    message_id TEXT,
    channel_id TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS training_attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    status TEXT DEFAULT 'attending',
    joined_at TEXT NOT NULL,
    UNIQUE(session_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS training_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    trainer_id TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS verifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    discord_id TEXT UNIQUE NOT NULL,
    roblox_id TEXT NOT NULL,
    roblox_username TEXT NOT NULL,
    verified_at TEXT NOT NULL,
    code TEXT,
    code_expires TEXT
  );

  CREATE TABLE IF NOT EXISTS roblox_accounts (
    roblox_id TEXT PRIMARY KEY,
    discord_id TEXT NOT NULL,
    username TEXT NOT NULL,
    last_checked TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS giveaways (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    giveaway_id TEXT UNIQUE NOT NULL,
    channel_id TEXT NOT NULL,
    message_id TEXT NOT NULL,
    prize TEXT NOT NULL,
    winner_count INTEGER NOT NULL DEFAULT 1,
    end_time INTEGER NOT NULL,
    ended INTEGER NOT NULL DEFAULT 0,
    winners TEXT,
    required_role_id TEXT,
    host_id TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS giveaway_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    giveaway_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    entered_at TEXT NOT NULL,
    UNIQUE(giveaway_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS server_goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    target_count INTEGER UNIQUE NOT NULL,
    type TEXT NOT NULL DEFAULT 'members',
    message TEXT NOT NULL,
    reached INTEGER NOT NULL DEFAULT 0,
    announced_at TEXT
  );

  CREATE TABLE IF NOT EXISTS regulations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    rule_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS playlists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    tracks_json TEXT NOT NULL,
    created_at TEXT NOT NULL,
    UNIQUE(user_id, name)
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    action TEXT NOT NULL,
    target_id TEXT,
    details TEXT,
    timestamp TEXT NOT NULL
  );
`);

// Seed default data if empty
const countRegulations = db.prepare('SELECT COUNT(*) as count FROM regulations').get();
if (countRegulations.count === 0) {
  const insertReg = db.prepare('INSERT INTO regulations (category, rule_number, title, content) VALUES (?, ?, ?, ?)');

  // 11 Discord Guidelines
  const discordRules = [
    { num: 1, title: 'Respect', content: 'Treat all community members and staff with respect. Discrimination, harassment, hate speech, and toxicity will result in immediate disciplinary action.' },
    { num: 2, title: 'Usernames', content: 'Usernames and nicknames must be readable, family-friendly, and cannot impersonate server staff or public figures.' },
    { num: 3, title: 'Moderating', content: 'Leave moderating to active staff members. Do not mini-mod or tell staff how to execute community procedures.' },
    { num: 4, title: 'Advertising', content: 'Direct or indirect promotion of external Discord servers, social media, or commercial services without executive approval is strictly prohibited.' },
    { num: 5, title: 'Language', content: 'Keep language civil and appropriate. Excessive profanity, slurs, and NSFW discussions are strictly disallowed in all channels.' },
    { num: 6, title: 'Channel Misuse', content: 'Use channels for their designated purposes. Bot commands belong in dedicated bot channels; keep general chat clean.' },
    { num: 7, title: 'Punishment Disputes', content: 'Disputes over punishments must be submitted via tickets or appeal forms, never argued in public server channels.' },
    { num: 8, title: 'Drama', content: 'Refrain from inciting, continuing, or importing interpersonal drama into server communications.' },
    { num: 9, title: 'Staff Discretion', content: 'Staff members reserve the right to issue warnings or moderation actions in scenarios not explicitly listed when server health is threatened.' },
    { num: 10, title: 'Common Sense', content: 'If an action feels disruptive or dishonest, do not do it. Loopholes will not excuse violations.' },
    { num: 11, title: 'Discord Terms of Service', content: 'All members must comply fully with Discord Community Guidelines and Terms of Service at all times.' }
  ];

  for (const r of discordRules) {
    insertReg.run('discord', r.num, r.title, r.content);
  }

  // 17 ERLC Game Guidelines
  const erlcRules = [
    { num: 1, title: 'Fair Roleplay (FRP)', content: 'Always roleplay realistically. Acknowledge weapon draws, injuries, and emergency service commands.' },
    { num: 2, title: 'Random Death Match (RDM)', content: 'Killing or attacking other players without an established roleplay justification is strictly forbidden.' },
    { num: 3, title: 'Vehicle Death Match (VDM)', content: 'Using vehicles as weapons or running down pedestrians is forbidden unless explicitly authorized in specialized scenes.' },
    { num: 4, title: 'New Life Rule (NLR)', content: 'Upon dying and respawning, you forget all prior scene memories and cannot return to that scene for 15 minutes.' },
    { num: 5, title: 'Realistic Avatars', content: 'Avatars must resemble realistic attire for your team or role. Troll outfits, oversized packages, and neon skin are not allowed.' },
    { num: 6, title: 'Interfering With Scenes', content: 'Do not disrupt active emergency calls, police traffic stops, or private roleplays without permission.' },
    { num: 7, title: 'Roblox Terms of Service', content: 'All players must follow standard Roblox Community Standards while playing inside the ER:LC private server.' },
    { num: 8, title: 'Common Sense', content: 'Roleplay with integrity. Prioritize fun, immersion, and mutual respect over winning scenes.' },
    { num: 9, title: 'GTA Driving', content: 'Unrealistic vehicle stunts, scaling 80-degree cliffs, and surviving 120 MPH head-on crashes without roleplaying damage is prohibited.' },
    { num: 10, title: 'Crimes', content: 'All major crimes must have realistic pacing. Do not chain-rob every shop within five minutes.' },
    { num: 11, title: 'Restricted Roleplays', content: 'Terrorism, sexual assault roleplays, and school shootings are strictly blacklisted and result in instant bans.' },
    { num: 12, title: 'High Response Calls', content: 'Only initiate pursuits or SWAT escalations when warranted by in-game severity.' },
    { num: 13, title: 'Robberies', content: 'Give responding officers reasonable time to arrive on scene before fleeing.' },
    { num: 14, title: 'Gear Usage', content: 'Use weapons and equipment appropriate to your authorized civilian or officer rank.' },
    { num: 15, title: 'Safe Teams', content: 'Civilians who spawn as emergency workers or DOT must perform that role, not troll other teams.' },
    { num: 16, title: 'Group Limit', content: 'Civilian crime gangs are capped at 5 active participants per scene to avoid overwhelming emergency services.' },
    { num: 17, title: 'Fear Roleplay (FearRP)', content: 'When held at gunpoint or outnumbered by armed officers, you must value your life and comply.' }
  ];

  for (const r of erlcRules) {
    insertReg.run('game', r.num, r.title, r.content);
  }
}

// Seed default New York Departments if empty
const countDept = db.prepare('SELECT COUNT(*) as count FROM departments').get();
if (countDept.count === 0) {
  const insertDept = db.prepare('INSERT INTO departments (dept_id, name, emoji, description, logo_url, whitelisted) VALUES (?, ?, ?, ?, ?, ?)');
  const depts = [
    { id: 'nypd', name: 'New York City Police Department', emoji: '👮', desc: 'Protecting the five boroughs through dedicated law enforcement, traffic enforcement, and community policing.', logo: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=400&q=80', whitelisted: 1 },
    { id: 'nysp', name: 'New York State Police', emoji: '🚔', desc: 'State troopers providing highway patrol, tactical support, and statewide criminal investigations across New York.', logo: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80', whitelisted: 1 },
    { id: 'fdny', name: 'Fire Department of New York', emoji: '🚒', desc: 'Bravery in action. Fire suppression, technical rescue, search & rescue, and fire prevention across the state.', logo: 'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?auto=format&fit=crop&w=400&q=80', whitelisted: 1 },
    { id: 'ems', name: 'Emergency Medical Services', emoji: '🚑', desc: 'Rapid medical first-response, paramedic triage, emergency transport, and life-saving pre-hospital patient care.', logo: 'https://images.unsplash.com/photo-1587745416684-47953f16f02f?auto=format&fit=crop&w=400&q=80', whitelisted: 0 },
    { id: 'dot', name: 'Department of Transportation', emoji: '🚧', desc: 'Road maintenance, traffic cone setups, infrastructure repair, highway clearing, and towing operations.', logo: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=400&q=80', whitelisted: 0 },
    { id: 'fbi', name: 'Federal Bureau of Investigation', emoji: '🕵️', desc: 'Elite field office agents conducting counter-terrorism, high-profile hostage rescue, and federal investigations.', logo: 'https://images.unsplash.com/photo-1453733197781-3141f1225574?auto=format&fit=crop&w=400&q=80', whitelisted: 1 },
    { id: 'civ', name: 'Civilian Operations', emoji: '🏙️', desc: 'The backbone of our roleplay server. Business owners, taxi operators, news media, and vibrant New York citizens.', logo: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=400&q=80', whitelisted: 0 }
  ];

  for (const d of depts) {
    insertDept.run(d.id, d.name, d.emoji, d.desc, d.logo, d.whitelisted);
  }
}

// Seed default goals if empty
const countGoals = db.prepare('SELECT COUNT(*) as count FROM server_goals').get();
if (countGoals.count === 0) {
  const insertGoal = db.prepare('INSERT INTO server_goals (target_count, type, message, reached) VALUES (?, ?, ?, ?)');
  const goals = [
    { target: 100, msg: '🎉 Milestone unlocked! We have officially hit 100 members in New York Roleplay!' },
    { target: 250, msg: '🚀 Incredible growth! 250 members have joined the New York Roleplay family!' },
    { target: 500, msg: '🌟 Halfway to 1k! 500 members strong in New York Roleplay!' },
    { target: 1000, msg: '👑 Major milestone! 1,000 members enjoying the premier New York ERLC experience!' },
    { target: 2500, msg: '🏆 2,500 Members! Thank you for making our community one of the best on ERLC!' }
  ];
  for (const g of goals) {
    insertGoal.run(g.target, 'members', g.msg, 0);
  }
}

module.exports = db;
