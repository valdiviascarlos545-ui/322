require('dotenv').config();
const path = require('path');
const fs = require('fs');

// Ensure database, logs, and transcripts directories exist
const dbDir = path.resolve(process.cwd(), 'database');
const logsDir = path.resolve(process.cwd(), 'logs');
const transcriptsDir = path.resolve(process.cwd(), 'transcripts');

[dbDir, logsDir, transcriptsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const config = {
  // Credentials
  token: process.env.TOKEN || '',
  clientId: process.env.CLIENT_ID || '',
  guildId: process.env.GUILD_ID || '',
  ownerId: process.env.BOT_OWNER_ID || '',
  developerIds: (process.env.DEVELOPER_IDS || '').split(',').map(id => id.trim()).filter(Boolean),

  // Storage
  databasePath: process.env.DATABASE_PATH || './database/newyork.sqlite',

  // PRC / ER:LC API
  prc: {
    apiKey: process.env.PRC_API_KEY || '',
    serverKey: process.env.PRC_SERVER_KEY || '',
    joinUrl: process.env.ROBLOX_SERVER_JOIN_URL || 'https://www.roblox.com/games/2534724415/Emergency-Response-Liberty-County',
    apiUrl: 'https://api.policeroleplay.community/v1'
  },

  // Branding & Embeds
  embed: {
    topBannerUrl: (process.env.EMBED_TOP_BANNER_URL && (process.env.EMBED_TOP_BANNER_URL.startsWith('http://') || process.env.EMBED_TOP_BANNER_URL.startsWith('https://')))
      ? process.env.EMBED_TOP_BANNER_URL
      : 'https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=1200&q=80',
    bottomBannerUrl: (process.env.EMBED_BOTTOM_BANNER_URL && (process.env.EMBED_BOTTOM_BANNER_URL.startsWith('http://') || process.env.EMBED_BOTTOM_BANNER_URL.startsWith('https://')))
      ? process.env.EMBED_BOTTOM_BANNER_URL
      : 'https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?auto=format&fit=crop&w=1200&q=80',
    color: parseInt(process.env.EMBED_COLOR || '1D3557', 16) || 0x1D3557,
    hexColor: '#' + (process.env.EMBED_COLOR || '1D3557').replace('#', ''),
    footerText: (process.env.EMBED_FOOTER_TEXT && process.env.EMBED_FOOTER_TEXT !== '32322') ? process.env.EMBED_FOOTER_TEXT : 'New York Roleplay | Staff Management',
    footerIconUrl: (process.env.EMBED_FOOTER_ICON_URL && (process.env.EMBED_FOOTER_ICON_URL.startsWith('http://') || process.env.EMBED_FOOTER_ICON_URL.startsWith('https://'))) ? process.env.EMBED_FOOTER_ICON_URL : '',
    timestamp: process.env.EMBED_TIMESTAMP !== 'false'
  },

  // Channels & Categories
  tickets: {
    categoryId: process.env.TICKET_CATEGORY_ID || '',
    generalCategoryId: process.env.GENERAL_TICKET_CATEGORY_ID || '',
    highRankCategoryId: process.env.HIGH_RANK_TICKET_CATEGORY_ID || '',
    deptCategoryId: process.env.DEPARTMENT_TICKET_CATEGORY_ID || '',
    logChannelId: process.env.TICKET_LOG_CHANNEL_ID || '',
    transcriptChannelId: process.env.TRANSCRIPT_CHANNEL_ID || '',
    directiveTeamRoleId: process.env.DIRECTIVE_TEAM_ROLE_ID || '',
    staffRoleId: process.env.TICKET_STAFF_ROLE_ID || ''
  },

  applications: {
    channelId: process.env.APPLICATION_CHANNEL_ID || '',
    reviewChannelId: process.env.APPLICATION_REVIEW_CHANNEL_ID || '',
    logChannelId: process.env.APPLICATION_LOG_CHANNEL_ID || '',
    traineeRoleId: process.env.TRAINEE_ROLE_ID || '',
    reviewerRoleId: process.env.APPLICATION_REVIEWER_ROLE_ID || ''
  },

  staff: {
    logChannelId: process.env.STAFF_LOG_CHANNEL_ID || '',
    infractionLogChannelId: process.env.INFRACTION_LOG_CHANNEL_ID || '',
    promotionLogChannelId: process.env.PROMOTION_LOG_CHANNEL_ID || '',
    iaLogChannelId: process.env.IA_LOG_CHANNEL_ID || '',
    hrRoleId: process.env.HR_ROLE_ID || '',
    iaRoleId: process.env.IA_ROLE_ID || '',
    directiveRoleId: process.env.DIRECTIVE_ROLE_ID || ''
  },

  training: {
    channelId: process.env.TRAINING_CHANNEL_ID || '',
    logChannelId: process.env.TRAINING_LOG_CHANNEL_ID || '',
    roleId: process.env.TRAINING_ROLE_ID || ''
  },

  departments: {
    channelId: process.env.DEPARTMENT_CHANNEL_ID || '',
    logChannelId: process.env.DEPARTMENT_LOG_CHANNEL_ID || ''
  },

  verification: {
    channelId: process.env.VERIFICATION_CHANNEL_ID || '',
    verifiedRoleId: process.env.VERIFIED_ROLE_ID || '',
    unverifiedRoleId: process.env.UNVERIFIED_ROLE_ID || ''
  },

  community: {
    welcomeChannelId: process.env.WELCOME_CHANNEL_ID || '',
    goodbyeChannelId: process.env.GOODBYE_CHANNEL_ID || '',
    statisticsChannelId: process.env.STATISTICS_CHANNEL_ID || '',
    goalAnnouncementChannelId: process.env.GOAL_ANNOUNCEMENT_CHANNEL_ID || '',
    sessionChannelId: process.env.SESSION_CHANNEL_ID || '',
    sessionNotificationRoleId: process.env.SESSION_NOTIFICATION_ROLE_ID || '',
    giveawayLogChannelId: process.env.GIVEAWAY_LOG_CHANNEL_ID || '',
    moderationLogChannelId: process.env.MODERATION_LOG_CHANNEL_ID || '',
    errorLogChannelId: process.env.ERROR_LOG_CHANNEL_ID || ''
  },

  marketplace: {
    storeUrl: process.env.MARKETPLACE_STORE_URL || 'https://www.roblox.com/games/2534724415/Emergency-Response-Liberty-County',
    donationUrl: process.env.MARKETPLACE_DONATION_URL || 'https://www.roblox.com',
    robloxGroupUrl: process.env.MARKETPLACE_ROBLOX_GROUP_URL || 'https://www.roblox.com/groups',
    sponsorPrice: process.env.MARKETPLACE_SPONSOR_PRICE || '$5 / 500 Robux',
    adPrice: process.env.MARKETPLACE_AD_PRICE || '$10 / 1,000 Robux',
    vipPrice: process.env.MARKETPLACE_VIP_PRICE || '$15 / 1,500 Robux'
  },

  music: {
    enabled: process.env.MUSIC_ENABLED !== 'false',
    djRoleId: process.env.MUSIC_DJ_ROLE_ID || ''
  },

  status: {
    mode: process.env.BOT_STATUS_MODE || 'WATCHING',
    text: process.env.BOT_STATUS_TEXT || 'New York Roleplay'
  },

  validate() {
    const warnings = [];
    if (!this.token) warnings.push('TOKEN is not set in environment. Discord bot client will not connect until provided.');
    if (!this.clientId) warnings.push('CLIENT_ID is not set. Slash commands deployment will require CLIENT_ID.');
    if (!this.guildId) warnings.push('GUILD_ID is not set. Guild-specific instant command deployment requires GUILD_ID.');
    return warnings;
  }
};

module.exports = config;
