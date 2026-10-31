const db = require('../../db');

const pendingCodes = new Map(); // discordId -> { robloxId, username, code, expiresAt }

const WORD_LIST = ['EMPIRE', 'LIBERTY', 'HUDSON', 'MANHATTAN', 'BROADWAY', 'BRONX', 'QUEENS', 'BROOKLYN', 'STATEN', 'PATROL', 'OFFICER', 'TROOPER', 'RESCUE', 'BADGE'];

class RobloxService {
  /**
   * Generates a readable, memorable verification code
   */
  generateCode() {
    const word1 = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
    const word2 = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
    const num = Math.floor(1000 + Math.random() * 9000);
    return `NYRP-${word1}-${word2}-${num}`;
  }

  /**
   * Resolves a Roblox username to User ID using Roblox public API
   */
  async resolveUser(username) {
    try {
      const response = await fetch('https://users.roblox.com/v1/usernames/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          usernames: [username],
          excludeBannedUsers: false
        })
      });

      if (!response.ok) {
        return { success: false, error: `Roblox API returned error HTTP ${response.status}` };
      }

      const data = await response.json();
      if (!data.data || data.data.length === 0) {
        return { success: false, error: `No Roblox account found with username "${username}".` };
      }

      const user = data.data[0];
      return {
        success: true,
        userId: user.id,
        username: user.name,
        displayName: user.displayName
      };
    } catch (err) {
      return { success: false, error: `Failed to contact Roblox API: ${err.message}` };
    }
  }

  /**
   * Fetches user profile description from Roblox
   */
  async getUserProfile(userId) {
    try {
      const response = await fetch(`https://users.roblox.com/v1/users/${userId}`);
      if (!response.ok) {
        return { success: false, error: `Unable to fetch profile for Roblox ID ${userId}` };
      }
      const data = await response.json();
      return {
        success: true,
        data: {
          id: data.id,
          name: data.name,
          displayName: data.displayName,
          description: data.description || '',
          created: data.created,
          isBanned: data.isBanned
        }
      };
    } catch (err) {
      return { success: false, error: `Error fetching user details: ${err.message}` };
    }
  }

  /**
   * Starts a verification session
   */
  async startVerification(discordId, username) {
    const resolved = await this.resolveUser(username);
    if (!resolved.success) {
      return resolved;
    }

    const code = this.generateCode();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes expiry

    pendingCodes.set(discordId, {
      robloxId: resolved.userId,
      username: resolved.username,
      displayName: resolved.displayName,
      code,
      expiresAt
    });

    // Save/update in database
    db.prepare(`
      INSERT INTO verifications (discord_id, roblox_id, roblox_username, verified_at, code, code_expires)
      VALUES (?, ?, ?, '', ?, ?)
      ON CONFLICT(discord_id) DO UPDATE SET
        roblox_id = excluded.roblox_id,
        roblox_username = excluded.roblox_username,
        code = excluded.code,
        code_expires = excluded.code_expires
    `).run(discordId, resolved.userId.toString(), resolved.username, code, new Date(expiresAt).toISOString());

    return {
      success: true,
      robloxId: resolved.userId,
      username: resolved.username,
      code,
      expiresMinutes: 15
    };
  }

  /**
   * Checks if user has placed the code in their Roblox profile description
   */
  async verifyCode(discordId) {
    const session = pendingCodes.get(discordId);
    let code = session?.code;
    let robloxId = session?.robloxId;
    let username = session?.username;

    if (!session) {
      const dbRecord = db.prepare('SELECT * FROM verifications WHERE discord_id = ?').get(discordId);
      if (!dbRecord || !dbRecord.code) {
        return { success: false, error: 'No active verification session found. Please click Verify to start.' };
      }
      code = dbRecord.code;
      robloxId = dbRecord.roblox_id;
      username = dbRecord.roblox_username;
    }

    const profile = await this.getUserProfile(robloxId);
    if (!profile.success) {
      return { success: false, error: profile.error };
    }

    const currentDescription = profile.data.description;
    const hasCode = currentDescription.includes(code);

    if (!hasCode) {
      return {
        success: false,
        codeFound: false,
        code,
        error: `Verification code not detected on your Roblox profile description.\n\nPlease ensure your Roblox "About" / "Description" includes:\n\`${code}\``
      };
    }

    // Success! Update DB and mark verified
    const nowIso = new Date().toISOString();
    db.prepare(`
      UPDATE verifications
      SET verified_at = ?, code = NULL, code_expires = NULL
      WHERE discord_id = ?
    `).run(nowIso, discordId);

    db.prepare(`
      INSERT INTO roblox_accounts (roblox_id, discord_id, username, last_checked)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(roblox_id) DO UPDATE SET
        discord_id = excluded.discord_id,
        username = excluded.username,
        last_checked = excluded.last_checked
    `).run(robloxId.toString(), discordId, username, nowIso);

    // Update staff profile if exists
    db.prepare(`
      INSERT INTO staff_profiles (user_id, roblox_username, roblox_id, created_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        roblox_username = excluded.roblox_username,
        roblox_id = excluded.roblox_id
    `).run(discordId, username, robloxId.toString(), nowIso);

    pendingCodes.delete(discordId);

    return {
      success: true,
      robloxId,
      username,
      verifiedAt: nowIso
    };
  }

  getVerificationByDiscordId(discordId) {
    return db.prepare('SELECT * FROM verifications WHERE discord_id = ? AND verified_at != \'\'').get(discordId);
  }
}

module.exports = new RobloxService();
