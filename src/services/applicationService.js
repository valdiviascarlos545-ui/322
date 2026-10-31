const db = require('../../db');
const config = require('../../config');
const { createEmbed, createEmbeds, successEmbed, errorEmbed } = require('../utils/embedBuilder');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const DEFAULT_QUESTIONS = [
  'What is your Discord username?',
  'What is your Roblox username?',
  'What is your Roblox user ID?',
  'How old are you?',
  'What timezone are you in?',
  'What country are you located in?',
  'How active can you be each week?',
  'Why do you want to join the New York Roleplay Staff Team?',
  'What previous staff experience do you have?',
  'How would you handle a player breaking server rules?',
  'What would you do if a staff member abused their permissions?',
  'How would you handle an argument between two members?',
  'How would you respond to an unfair punishment complaint?',
  'What makes you a good candidate compared with other applicants?',
  'Is there anything else you would like the High Rank Team to know?'
];

// Active DM sessions: userId -> { appId, questionIndex, answers: [] }
const activeSessions = new Map();

class ApplicationService {
  getQuestions() {
    return DEFAULT_QUESTIONS;
  }

  isBlacklisted(userId) {
    const row = db.prepare('SELECT * FROM application_blacklists WHERE user_id = ?').get(userId);
    return Boolean(row);
  }

  hasPendingApplication(userId) {
    const row = db.prepare('SELECT * FROM applications WHERE user_id = ? AND status = \'pending\'').get(userId);
    return Boolean(row);
  }

  async startApplication(user, guild) {
    if (this.isBlacklisted(user.id)) {
      return {
        success: false,
        error: 'You are currently blacklisted from submitting staff applications for New York Roleplay.'
      };
    }

    if (this.hasPendingApplication(user.id)) {
      return {
        success: false,
        error: 'You already have an active pending application undergoing review by the High Rank Team.'
      };
    }

    const appId = `APP-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    try {
      const dmChannel = await user.createDM();
      activeSessions.set(user.id, {
        appId,
        guildId: guild.id,
        userTag: user.tag || user.username,
        questionIndex: 0,
        answers: []
      });

      const welcomeEmbed = createEmbed({
        title: '📋 New York Roleplay — Staff Application',
        description: `Welcome to the official New York Roleplay Staff Application.\n\nYou will be asked **15 questions** one-by-one. Please reply with thorough, thoughtful answers. Type \`cancel\` at any time to abort.\n\n**Question 1/15:**\n${DEFAULT_QUESTIONS[0]}`,
        category: 'applications',
        footerText: 'Application ID: ' + appId
      });

      const cancelRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`app_cancel_${appId}`)
          .setLabel('Cancel Application')
          .setStyle(ButtonStyle.Danger)
      );

      await dmChannel.send({ embeds: [welcomeEmbed], components: [cancelRow] });

      return {
        success: true,
        appId
      };
    } catch (err) {
      activeSessions.delete(user.id);
      return {
        success: false,
        error: 'Unable to send you a Direct Message. Please enable "Allow direct messages from server members" in your Discord Privacy Settings and try again.'
      };
    }
  }

  async handleDmMessage(message, client) {
    const session = activeSessions.get(message.author.id);
    if (!session) return false;

    const content = message.content.trim();

    if (content.toLowerCase() === 'cancel') {
      activeSessions.delete(message.author.id);
      await message.reply({
        embeds: [errorEmbed('Application Cancelled', 'Your staff application draft has been discarded. You may restart at any time from the application panel.')]
      });
      return true;
    }

    // Save answer
    const currentQIndex = session.questionIndex;
    const currentQuestion = DEFAULT_QUESTIONS[currentQIndex];
    session.answers.push({
      num: currentQIndex + 1,
      question: currentQuestion,
      answer: content
    });

    session.questionIndex++;

    // Check if more questions remain
    if (session.questionIndex < DEFAULT_QUESTIONS.length) {
      const nextQNum = session.questionIndex + 1;
      const nextQuestion = DEFAULT_QUESTIONS[session.questionIndex];

      const nextEmbed = createEmbed({
        title: `Question ${nextQNum}/15`,
        description: `**${nextQuestion}**\n\n*Type your answer below:*`,
        category: 'applications',
        footerText: `Progress: ${Math.round((nextQNum / 15) * 100)}% | Application ID: ${session.appId}`
      });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`app_cancel_${session.appId}`)
          .setLabel('Cancel Application')
          .setStyle(ButtonStyle.Danger)
      );

      await message.reply({ embeds: [nextEmbed], components: [row] });
      return true;
    }

    // Completed all 15 questions!
    const finishedAppId = session.appId;
    const answers = [...session.answers];
    const guildId = session.guildId;
    const userTag = session.userTag;
    const userId = message.author.id;

    activeSessions.delete(userId);

    // Save into SQLite
    const nowIso = new Date().toISOString();
    db.prepare(`
      INSERT INTO applications (app_id, user_id, user_tag, type, status, submitted_at)
      VALUES (?, ?, ?, 'Staff Application', 'pending', ?)
    `).run(finishedAppId, userId, userTag, nowIso);

    const insertAns = db.prepare(`
      INSERT INTO application_answers (app_id, question_num, question_text, answer_text)
      VALUES (?, ?, ?, ?)
    `);

    for (const ans of answers) {
      insertAns.run(finishedAppId, ans.num, ans.question, ans.answer);
    }

    // Confirmation to applicant
    await message.reply({
      embeds: [
        successEmbed(
          'Application Submitted Successfully!',
          `Thank you for applying to the **New York Roleplay Staff Team**! Your application (ID: \`${finishedAppId}\`) has been submitted to the High Rank Review Team.\n\nYou will be notified via DM when a decision has been reached.`
        )
      ]
    });

    // Send to Review Channel in guild
    try {
      const guild = client.guilds.cache.get(guildId);
      if (guild) {
        const reviewChannelId = config.applications.reviewChannelId;
        const reviewChannel = reviewChannelId ? guild.channels.cache.get(reviewChannelId) : null;

        if (reviewChannel && reviewChannel.isTextBased()) {
          const robloxUser = answers[1]?.answer || 'N/A';
          const robloxId = answers[2]?.answer || 'N/A';
          const age = answers[3]?.answer || 'N/A';
          const tz = answers[4]?.answer || 'N/A';

          const reviewEmbeds = createEmbeds({
            title: `📋 New Staff Application: ${userTag}`,
            description: `A new candidate has submitted an application for the Staff Team.\n\n` +
              `**Applicant:** <@${userId}> (\`${userId}\`)\n` +
              `**Roblox Username:** ${robloxUser}\n` +
              `**Roblox ID:** ${robloxId}\n` +
              `**Age:** ${age}\n` +
              `**Timezone:** ${tz}\n` +
              `**Submitted:** <t:${Math.floor(Date.now() / 1000)}:R>\n` +
              `**Application ID:** \`${finishedAppId}\``,
            category: 'applications',
            fields: answers.map(a => ({
              name: `Q${a.num}: ${a.question}`,
              value: a.answer.length > 1024 ? a.answer.slice(0, 1020) + '...' : a.answer,
              inline: false
            }))
          });

          const buttonsRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId(`app_approve_${finishedAppId}`)
              .setLabel('Approve')
              .setEmoji('🟢')
              .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
              .setCustomId(`app_deny_${finishedAppId}`)
              .setLabel('Deny')
              .setEmoji('🔴')
              .setStyle(ButtonStyle.Danger)
          );

          await reviewChannel.send({ embeds: reviewEmbeds, components: [buttonsRow] });
        }
      }
    } catch (err) {
      console.error('Error posting review embed:', err);
    }

    return true;
  }

  async approveApplication(appId, reviewerMember) {
    const app = db.prepare('SELECT * FROM applications WHERE app_id = ?').get(appId);
    if (!app) return { success: false, error: 'Application not found.' };
    if (app.status !== 'pending') return { success: false, error: `Application is already ${app.status}.` };

    const nowIso = new Date().toISOString();
    db.prepare(`
      UPDATE applications
      SET status = 'approved', reviewer_id = ?, reviewer_tag = ?, reviewed_at = ?
      WHERE app_id = ?
    `).run(reviewerMember.id, reviewerMember.user.tag, nowIso, appId);

    db.prepare(`
      INSERT INTO application_reviews (app_id, reviewer_id, decision, notes, reviewed_at)
      VALUES (?, ?, 'approved', 'Approved by High Rank', ?)
    `).run(appId, reviewerMember.id, nowIso);

    // Assign Trainee Role if configured
    let roleAssigned = false;
    try {
      if (config.applications.traineeRoleId && reviewerMember.guild) {
        const targetMember = await reviewerMember.guild.members.fetch(app.user_id).catch(() => null);
        if (targetMember) {
          await targetMember.roles.add(config.applications.traineeRoleId);
          roleAssigned = true;
        }
      }
    } catch (err) {
      console.error('Failed to grant trainee role:', err);
    }

    // DM applicant
    try {
      const applicantUser = await reviewerMember.client.users.fetch(app.user_id).catch(() => null);
      if (applicantUser) {
        const approvalEmbeds = createEmbeds({
          title: '🎉 Results — Application Passed!',
          description: `We would like to congratulate you on passing your application and becoming a **Trainee** within our server. Your dedication throughout your application has stood out to us and has earned you a place in our community!\n\nPlease be on the lookout in our training category for updates and training sessions from our training team, and feel free to ask any questions you may have.\n\nOnce again, congratulations, and welcome to the team!\n\nCandidate: <@${app.user_id}>`,
          category: 'applications',
          color: 0x2ECC71
        });
        await applicantUser.send({ embeds: approvalEmbeds });
      }
    } catch (e) {
      // DM might be closed
    }

    return { success: true, app, roleAssigned };
  }

  async denyApplication(appId, reviewerMember) {
    const app = db.prepare('SELECT * FROM applications WHERE app_id = ?').get(appId);
    if (!app) return { success: false, error: 'Application not found.' };
    if (app.status !== 'pending') return { success: false, error: `Application is already ${app.status}.` };

    const nowIso = new Date().toISOString();
    db.prepare(`
      UPDATE applications
      SET status = 'denied', reviewer_id = ?, reviewer_tag = ?, reviewed_at = ?
      WHERE app_id = ?
    `).run(reviewerMember.id, reviewerMember.user.tag, nowIso, appId);

    db.prepare(`
      INSERT INTO application_reviews (app_id, reviewer_id, decision, notes, reviewed_at)
      VALUES (?, ?, 'denied', 'Declined by High Rank', ?)
    `).run(appId, reviewerMember.id, nowIso);

    // DM applicant
    try {
      const applicantUser = await reviewerMember.client.users.fetch(app.user_id).catch(() => null);
      if (applicantUser) {
        const denyEmbeds = createEmbeds({
          title: 'Results — Application Status Update',
          description: `On behalf of the High Rank Team, we are sad to have had to decline your application. We appreciate all that you have put forward into applying for a position, but unfortunately it did not meet our set standards.\n\nWe apologize for this, and we wish you luck if you do want to try again in the future! Thank you again for applying and finding interest in joining our team.\n\nApplicant: <@${app.user_id}>`,
          category: 'applications',
          color: 0xE63946
        });
        await applicantUser.send({ embeds: denyEmbeds });
      }
    } catch (e) {
      // DM might be closed
    }

    return { success: true, app };
  }
}

module.exports = new ApplicationService();
