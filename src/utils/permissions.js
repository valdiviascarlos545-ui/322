const { PermissionFlagsBits } = require('discord.js');
const config = require('../../config');
const db = require('../../db');

const PERMISSION_LEVELS = {
  EVERYONE: 0,
  VERIFIED: 1,
  TRAINEE: 2,
  SUPPORT_STAFF: 3,
  TRAINER: 4,
  DEPARTMENT_COMMAND: 5,
  MODERATION: 6,
  ADMINISTRATION: 7,
  INTERNAL_AFFAIRS: 8,
  HUMAN_RESOURCES: 9,
  MANAGEMENT: 10,
  DIRECTIVE: 11,
  CO_OWNER: 12,
  OWNER: 13
};

/**
 * Checks member authorization level
 */
function getMemberPermissionLevel(member) {
  if (!member) return PERMISSION_LEVELS.EVERYONE;

  // Bot Owner check
  if (config.ownerId && member.id === config.ownerId) {
    return PERMISSION_LEVELS.OWNER;
  }
  if (config.developerIds.includes(member.id)) {
    return PERMISSION_LEVELS.OWNER;
  }
  if (member.guild && member.guild.ownerId === member.id) {
    return PERMISSION_LEVELS.OWNER;
  }

  // Guild Administrator permission check
  if (member.permissions && member.permissions.has(PermissionFlagsBits.Administrator)) {
    return PERMISSION_LEVELS.DIRECTIVE;
  }

  const roleIds = member.roles?.cache ? Array.from(member.roles.cache.keys()) : [];

  // Directive Team
  if (config.staff.directiveRoleId && roleIds.includes(config.staff.directiveRoleId)) {
    return PERMISSION_LEVELS.DIRECTIVE;
  }
  if (config.tickets.directiveTeamRoleId && roleIds.includes(config.tickets.directiveTeamRoleId)) {
    return PERMISSION_LEVELS.DIRECTIVE;
  }

  // HR
  if (config.staff.hrRoleId && roleIds.includes(config.staff.hrRoleId)) {
    return PERMISSION_LEVELS.HUMAN_RESOURCES;
  }

  // Internal Affairs
  if (config.staff.iaRoleId && roleIds.includes(config.staff.iaRoleId)) {
    return PERMISSION_LEVELS.INTERNAL_AFFAIRS;
  }

  // Training Staff
  if (config.training.roleId && roleIds.includes(config.training.roleId)) {
    return PERMISSION_LEVELS.TRAINER;
  }

  // Support / Ticket Staff
  if (config.tickets.staffRoleId && roleIds.includes(config.tickets.staffRoleId)) {
    return PERMISSION_LEVELS.SUPPORT_STAFF;
  }
  if (config.applications.reviewerRoleId && roleIds.includes(config.applications.reviewerRoleId)) {
    return PERMISSION_LEVELS.SUPPORT_STAFF;
  }

  // Check custom ranks table in db
  try {
    const customRanks = db.prepare('SELECT role_id, level FROM ranks').all();
    let maxLevel = PERMISSION_LEVELS.EVERYONE;
    for (const r of customRanks) {
      if (roleIds.includes(r.role_id) && r.level > maxLevel) {
        maxLevel = r.level;
      }
    }
    if (maxLevel > PERMISSION_LEVELS.EVERYONE) {
      return maxLevel;
    }
  } catch (err) {
    // Ignore db rank check error if not ready
  }

  // Trainee role
  if (config.applications.traineeRoleId && roleIds.includes(config.applications.traineeRoleId)) {
    return PERMISSION_LEVELS.TRAINEE;
  }

  // Verified role
  if (config.verification.verifiedRoleId && roleIds.includes(config.verification.verifiedRoleId)) {
    return PERMISSION_LEVELS.VERIFIED;
  }

  return PERMISSION_LEVELS.EVERYONE;
}

/**
 * Validates whether user has sufficient permission level
 */
function hasPermission(member, requiredLevel) {
  const memberLevel = getMemberPermissionLevel(member);
  return memberLevel >= requiredLevel;
}

/**
 * Ensures user cannot punish or promote someone higher than themselves
 */
function canModerateMember(moderator, target) {
  if (moderator.id === target.id) return false; // Cannot self-target
  const modLevel = getMemberPermissionLevel(moderator);
  const targetLevel = getMemberPermissionLevel(target);
  return modLevel > targetLevel;
}

/**
 * Audit log helper
 */
function logAudit(userId, action, targetId = null, details = '') {
  try {
    db.prepare(`
      INSERT INTO audit_logs (user_id, action, target_id, details, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `).run(userId, action, targetId, details, new Date().toISOString());
  } catch (err) {
    console.error('Audit log error:', err);
  }
}

module.exports = {
  PERMISSION_LEVELS,
  getMemberPermissionLevel,
  hasPermission,
  canModerateMember,
  logAudit
};
