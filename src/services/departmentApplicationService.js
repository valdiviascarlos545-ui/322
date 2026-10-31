const db = require('../../db');
const config = require('../../config');
const { createEmbed, createEmbeds, successEmbed, errorEmbed } = require('../utils/embedBuilder');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

// 15 Standard Questions tailored specifically for each New York Agency
const DEPARTMENT_QUESTIONS = {
  nypd: [
    'What is your Discord username and discriminator?',
    'What is your Roblox username and profile link?',
    'What is your numeric Roblox user ID?',
    'How old are you? (Must be at least 13 years old)',
    'What is your timezone and country of residence?',
    'How many hours can you dedicate on patrol each week as an NYPD officer?',
    'Why do you want to join the New York City Police Department (NYPD) specifically?',
    'What previous law enforcement or police roleplay experience do you have in ER:LC or other games?',
    'Explain the meaning and proper usage of 10-4, 10-8, 10-7, and 10-23 in radio communication.',
    'What is the NYPD policy on utilizing lethal force versus non-lethal equipment (taser, baton)?',
    'Scenario: A suspect vehicle fails to yield and initiates a high-speed pursuit in dense traffic. What steps do you take?',
    'Scenario: A citizen complains that an officer performed an illegal search of their vehicle. How do you handle the scene?',
    'What does the term "FRP" (Fail Roleplay) mean and how will you prevent it while in uniform?',
    'Are you willing to complete Academy training and wear the official NYPD patrol uniform?',
    'Do you agree to uphold all New York Roleplay regulations, chain of command, and server standards?'
  ],
  nysp: [
    'What is your Discord username and discriminator?',
    'What is your Roblox username and profile link?',
    'What is your numeric Roblox user ID?',
    'How old are you? (Must be at least 13 years old)',
    'What is your timezone and country of residence?',
    'How many hours can you commit to state highway patrols weekly?',
    'Why do you wish to join the New York State Police as a State Trooper?',
    'What sets NYSP apart from municipal police departments in roleplay operations?',
    'Explain state trooper jurisdiction on state highways, interstates, and unincorporated regions.',
    'When is a PIT maneuver authorized under NYSP high-speed pursuit guidelines?',
    'Scenario: You witness a reckless driver traveling 110 MPH passing on the shoulder. Detail your traffic stop procedure.',
    'Scenario: You arrive at a major multi-vehicle collision on the highway. What is your priority action?',
    'How do you maintain composure when a civilian becomes verbally argumentative during an enforcement stop?',
    'Describe proper radio communication etiquette when calling for backup or calling 10-33 (emergency).',
    'Do you agree to adhere to NYSP State Trooper chain of command and patrol standards?'
  ],
  fdny: [
    'What is your Discord username and discriminator?',
    'What is your Roblox username and profile link?',
    'What is your numeric Roblox user ID?',
    'How old are you? (Must be at least 13 years old)',
    'What is your timezone and country of residence?',
    'What is your weekly availability for FDNY fire and rescue operations?',
    'Why do you want to serve as a firefighter with the Fire Department of New York (FDNY)?',
    'What previous firefighting or emergency service roleplay experience do you have?',
    'Explain the primary tactical differences between an Engine company and a Ladder/Truck company.',
    'What does "size-up" mean upon arriving first on scene at a working structure fire?',
    'Scenario: You arrive first on scene at a 2-alarm commercial fire with trapped civilians reported. What are your immediate actions?',
    'Scenario: Downed power lines are arcing near an occupied vehicle. How do you secure the scene and rescue occupants?',
    'Explain the importance of PASS devices and personal protective equipment (turnout gear / SCBA).',
    'How do you coordinate with NYPD for perimeter security and traffic diversion during major incidents?',
    'Do you confirm you will attend scheduled FDNY drills and follow Battalion Chief orders?'
  ],
  ems: [
    'What is your Discord username and discriminator?',
    'What is your Roblox username and profile link?',
    'What is your numeric Roblox user ID?',
    'How old are you? (Must be at least 13 years old)',
    'What is your timezone and country of residence?',
    'How many hours can you dedicate each week to provide emergency medical coverage?',
    'Why do you want to join New York EMS as a paramedic or EMT?',
    'Do you have any prior medical roleplay experience or real-life first-aid/CPR knowledge?',
    'Explain the standard primary patient assessment steps (ABC / CAB - Airway, Breathing, Circulation).',
    'Explain the START triage system used during Mass Casualty Incidents (MCI).',
    'Scenario: You are dispatched to a gunshot wound victim in an unsecured scene. When do you enter?',
    'Scenario: A patient is unconscious, unresponsive, and has no carotid pulse. Detail your resuscitation procedure.',
    'How do you handle a patient or bystander refusing medical transport against medical advice (AMA)?',
    'Describe detailed descriptive roleplay (using /me and /do actions) when bandaging and splinting injuries.',
    'Do you agree to respond diligently to all medical calls and uphold professional bedside manners?'
  ],
  dot: [
    'What is your Discord username and discriminator?',
    'What is your Roblox username and profile link?',
    'What is your numeric Roblox user ID?',
    'How old are you? (Must be at least 13 years old)',
    'What is your timezone and country of residence?',
    'What is your weekly availability for road crew and transit operations?',
    'Why are you interested in joining the New York Department of Transportation (DOT)?',
    'Do you have prior public works, towing, or highway maintenance roleplay experience?',
    'What equipment and traffic control devices (cones, flares, arrow boards) does DOT utilize?',
    'Scenario: A major chemical spill has closed both lanes of a primary avenue. How do you set up the detour?',
    'Scenario: An abandoned or illegally parked vehicle is obstructing an active fire hydrant. Detail your impound procedure.',
    'How do you coordinate with NYPD and FDNY during active road hazard and collision clearance?',
    'What safety protocols must DOT workers observe regarding high-visibility vests and perimeter awareness?',
    'Explain the difference between standard flatbed towing and heavy-duty recovery operations.',
    'Do you commit to maintaining safe road conditions and actively roleplaying transit operations?'
  ],
  fbi: [
    'What is your Discord username and discriminator?',
    'What is your Roblox username and profile link?',
    'What is your numeric Roblox user ID?',
    'How old are you? (Must be at least 13 years old / mature)',
    'What is your timezone and country of residence?',
    'How many hours per week can you dedicate to federal tactical and investigative duties?',
    'Why do you desire to become a Special Agent with the FBI New York Field Office?',
    'What previous high-tier investigative, undercover, or tactical SWAT/HRT roleplay experience do you possess?',
    'Define the jurisdiction of the FBI compared to local municipal police (NYPD).',
    'What legal and constitutional requirements (probable cause, warrants) must be satisfied prior to a federal raid?',
    'Scenario: You are tracking an organized syndicate smuggling illegal firearms. How do you gather intel without compromising your identity?',
    'Scenario: A bank hostage situation is declared. What is the role of FBI crisis negotiators and the tactical team?',
    'How do you document evidence, write investigative case reports, and log chain of custody?',
    'What does operational security (OPSEC) mean in federal investigations?',
    'Do you understand that FBI operations require absolute discretion, maturity, and strict roleplay realism?'
  ],
  civ: [
    'What is your Discord username and discriminator?',
    'What is your Roblox username and profile link?',
    'What is your numeric Roblox user ID?',
    'How old are you? (Must be at least 13 years old)',
    'What is your timezone and country of residence?',
    'How active can you be in-game each week?',
    'Why do you want to join registered Civilian Operations in New York Roleplay?',
    'What kind of civilian character do you plan to portray (business owner, taxi driver, journalist, mechanic, criminal)?',
    'What does realistic civilian roleplay mean to you? Give an example.',
    'What is FearRP and how should your character realistically react when held at gunpoint?',
    'What is the New York Roleplay policy on Value of Life (VoL) and New Life Rule (NLR)?',
    'Scenario: You are planning an armed bank robbery scenario. How do you ensure it is balanced and enjoyable for law enforcement?',
    'Scenario: An officer pulls you over for speeding. How do you realistically roleplay the traffic stop?',
    'Explain why "Random Deathmatch" (RDM) and "Vehicle Deathmatch" (VDM) ruin community roleplay.',
    'Do you agree to follow civilian guidelines and prioritize immersive storytelling over "winning" scenarios?'
  ]
};

class DepartmentApplicationService {
  constructor() {
    this.ensureTables();
  }

  ensureTables() {
    db.prepare(`
      CREATE TABLE IF NOT EXISTS department_questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        dept_id TEXT NOT NULL,
        question_num INTEGER NOT NULL,
        question_text TEXT NOT NULL,
        UNIQUE(dept_id, question_num)
      )
    `).run();

    db.prepare(`
      CREATE TABLE IF NOT EXISTS active_dept_sessions (
        user_id TEXT PRIMARY KEY,
        dept_id TEXT NOT NULL,
        current_question INTEGER NOT NULL DEFAULT 1,
        guild_id TEXT NOT NULL,
        started_at TEXT NOT NULL
      )
    `).run();

    db.prepare(`
      CREATE TABLE IF NOT EXISTS department_app_answers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        app_id TEXT NOT NULL,
        dept_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        question_num INTEGER NOT NULL,
        question_text TEXT NOT NULL,
        answer_text TEXT NOT NULL
      )
    `).run();

    // Pre-seed default questions if empty
    const countQ = db.prepare('SELECT COUNT(*) as c FROM department_questions').get().c;
    if (countQ === 0) {
      const insertQ = db.prepare('INSERT OR IGNORE INTO department_questions (dept_id, question_num, question_text) VALUES (?, ?, ?)');
      for (const [deptId, questions] of Object.entries(DEPARTMENT_QUESTIONS)) {
        questions.forEach((q, idx) => {
          insertQ.run(deptId, idx + 1, q);
        });
      }
    }
  }

  getQuestions(deptId) {
    const rows = db.prepare('SELECT question_num, question_text FROM department_questions WHERE dept_id = ? ORDER BY question_num ASC').all(deptId);
    if (rows.length > 0) {
      return rows.map(r => r.question_text);
    }
    return DEPARTMENT_QUESTIONS[deptId] || DEPARTMENT_QUESTIONS['nypd'];
  }

  async startDepartmentApplication(user, guild, deptId) {
    const dept = db.prepare('SELECT * FROM departments WHERE dept_id = ?').get(deptId);
    if (!dept) {
      return { success: false, error: `Department "${deptId}" not found in database.` };
    }

    // Check if blacklisted
    const blacklisted = db.prepare('SELECT * FROM application_blacklists WHERE user_id = ?').get(user.id);
    if (blacklisted) {
      return { success: false, error: `You are blacklisted from submitting applications. Reason: ${blacklisted.reason}` };
    }

    // Check existing pending application
    const existing = db.prepare('SELECT * FROM department_applications WHERE dept_id = ? AND user_id = ? AND status = \'pending\'').get(deptId, user.id);
    if (existing) {
      return { success: false, error: `You already have an active pending application under review for ${dept.name}.` };
    }

    // Check if active session exists
    const activeSession = db.prepare('SELECT * FROM active_dept_sessions WHERE user_id = ?').get(user.id);
    if (activeSession) {
      return { success: false, error: 'You already have an active application in progress in your DMs. Complete it or type `cancel`.' };
    }

    const questions = this.getQuestions(deptId);

    // Save session in SQLite
    const nowIso = new Date().toISOString();
    db.prepare(`
      INSERT INTO active_dept_sessions (user_id, dept_id, current_question, guild_id, started_at)
      VALUES (?, ?, 1, ?, ?)
    `).run(user.id, deptId, guild.id, nowIso);

    // Send Question 1 in DM with dual-banner styling
    try {
      const qEmbeds = createEmbeds({
        title: `📝 ${dept.emoji} ${dept.name} — Application Form`,
        description: `Welcome to the official **${dept.name}** application process!\n\n` +
          `You will be asked **15 questions** sequentially. Please provide thorough, detailed, and realistic answers.\n\n` +
          `• Reply directly to this DM to answer each question.\n` +
          `• Type \`cancel\` at any time to abort.\n\n` +
          `--------------------------------------------------\n` +
          `**Question 1 / 15:**\n` +
          `**${questions[0]}**`,
        category: 'departments',
        color: 0x1D3557
      });

      const cancelRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('dept_app_cancel')
          .setLabel('Cancel Application')
          .setEmoji('❌')
          .setStyle(ButtonStyle.Danger)
      );

      await user.send({ embeds: qEmbeds, components: [cancelRow] });
      return { success: true };
    } catch (err) {
      db.prepare('DELETE FROM active_dept_sessions WHERE user_id = ?').run(user.id);
      return { success: false, error: 'Could not send you a Direct Message. Please ensure your Discord privacy settings allow DMs from server members!' };
    }
  }

  async handleDmResponse(message, client) {
    const session = db.prepare('SELECT * FROM active_dept_sessions WHERE user_id = ?').get(message.author.id);
    if (!session) return false;

    const deptId = session.dept_id;
    const dept = db.prepare('SELECT * FROM departments WHERE dept_id = ?').get(deptId);
    const questions = this.getQuestions(deptId);
    const currentQIndex = session.current_question - 1; // 0-based

    // Check cancellation
    if (message.content.trim().toLowerCase() === 'cancel') {
      db.prepare('DELETE FROM active_dept_sessions WHERE user_id = ?').run(message.author.id);
      await message.reply({
        embeds: [errorEmbed('Application Cancelled', `Your **${dept?.name || 'Department'}** application session has been terminated. You may reapply at any time.`)]
      });
      return true;
    }

    if (message.content.length < 2) {
      await message.reply({ content: '⚠️ Please provide a detailed answer (at least 2 characters).' });
      return true;
    }

    // Save answer into temporary storage or SQLite
    const appId = `DAPP-${deptId.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

    // Get or generate appId for this session
    let existingApp = db.prepare('SELECT app_id FROM department_app_answers WHERE user_id = ? AND dept_id = ? ORDER BY id DESC LIMIT 1').get(message.author.id, deptId);
    const activeAppId = existingApp?.app_id || appId;

    db.prepare(`
      INSERT INTO department_app_answers (app_id, dept_id, user_id, question_num, question_text, answer_text)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(activeAppId, deptId, message.author.id, session.current_question, questions[currentQIndex], message.content);

    // If more questions remain, advance to next question
    if (session.current_question < 15) {
      const nextQ = session.current_question + 1;
      db.prepare('UPDATE active_dept_sessions SET current_question = ? WHERE user_id = ?').run(nextQ, message.author.id);

      const progress = Math.round((nextQ / 15) * 100);
      const nextEmbed = createEmbed({
        title: `📝 ${dept.emoji} ${dept.name} — Question ${nextQ} / 15 [${progress}%]`,
        description: `**${questions[nextQ - 1]}**\n\n*Reply with your answer below, or type \`cancel\` to abort.*`,
        category: 'departments',
        color: 0x1D3557
      });

      await message.reply({ embeds: [nextEmbed] });
      return true;
    }

    // All 15 Questions Complete!
    db.prepare('DELETE FROM active_dept_sessions WHERE user_id = ?').run(message.author.id);

    const answers = db.prepare('SELECT * FROM department_app_answers WHERE app_id = ? ORDER BY question_num ASC').all(activeAppId);
    const answersJson = JSON.stringify(answers.map(a => ({ q: a.question_text, a: a.answer_text })));
    const nowIso = new Date().toISOString();

    db.prepare(`
      INSERT INTO department_applications (dept_id, user_id, status, answers, created_at)
      VALUES (?, ?, 'pending', ?, ?)
    `).run(deptId, message.author.id, answersJson, nowIso);

    // DM Completion notice
    await message.reply({
      embeds: [
        successEmbed(
          'Application Submitted Successfully! 🎉',
          `Your **15-question** application for **${dept.emoji} ${dept.name}** has been recorded and submitted to Department Leadership for review.\n\nYou will be notified via DM of the outcome!`
        )
      ]
    });

    // Send dual-banner review card to configured Department Review Channel
    try {
      const guild = client.guilds.cache.get(session.guild_id);
      if (guild) {
        const reviewChannelId = config.departments.logChannelId || config.departments.channelId;
        const reviewChannel = reviewChannelId ? guild.channels.cache.get(reviewChannelId) : null;

        if (reviewChannel && reviewChannel.isTextBased()) {
          const robloxUser = answers[1]?.answer_text || 'N/A';
          const robloxId = answers[2]?.answer_text || 'N/A';
          const age = answers[3]?.answer_text || 'N/A';
          const tz = answers[4]?.answer_text || 'N/A';

          const reviewEmbeds = createEmbeds({
            title: `📋 New Department Application: ${dept.name}`,
            description: `A new candidate has submitted an application for **${dept.emoji} ${dept.name}**.\n\n` +
              `**Applicant:** <@${message.author.id}> (\`${message.author.id}\`)\n` +
              `**Roblox Username:** ${robloxUser}\n` +
              `**Roblox ID:** ${robloxId}\n` +
              `**Age:** ${age}\n` +
              `**Timezone:** ${tz}\n` +
              `**Submitted:** <t:${Math.floor(Date.now() / 1000)}:R>`,
            category: 'departments',
            fields: answers.map(a => ({
              name: `Q${a.question_num}: ${a.question_text}`,
              value: a.answer_text.length > 1024 ? a.answer_text.slice(0, 1020) + '...' : a.answer_text,
              inline: false
            }))
          });

          const buttonsRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId(`dept_accept_${deptId}_${message.author.id}`)
              .setLabel('Accept Candidate')
              .setEmoji('🟢')
              .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
              .setCustomId(`dept_deny_${deptId}_${message.author.id}`)
              .setLabel('Deny Candidate')
              .setEmoji('🔴')
              .setStyle(ButtonStyle.Danger)
          );

          await reviewChannel.send({ embeds: reviewEmbeds, components: [buttonsRow] });
        }
      }
    } catch (err) {
      console.error('Failed to post department application review embed:', err);
    }

    return true;
  }
}

module.exports = new DepartmentApplicationService();
