const config = require('../../config');

/**
 * Service for Police Roleplay Community (PRC) API for ER:LC private servers
 */
class PRCService {
  constructor() {
    this.baseUrl = config.prc.apiUrl;
  }

  getHeaders() {
    return {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Server-Key': config.prc.serverKey || '',
      'api-key': config.prc.apiKey || ''
    };
  }

  isConfigured() {
    return Boolean(config.prc.serverKey);
  }

  async getServerInfo() {
    if (!this.isConfigured()) {
      return {
        configured: false,
        error: 'PRC_SERVER_KEY is not configured in .env. Please provide your ER:LC private server key.'
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/server`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        const text = await response.text();
        return {
          configured: true,
          success: false,
          status: response.status,
          error: `PRC API returned ${response.status}: ${text || response.statusText}`
        };
      }

      const data = await response.json();
      return {
        configured: true,
        success: true,
        data
      };
    } catch (err) {
      return {
        configured: true,
        success: false,
        error: `Failed to connect to ER:LC PRC API: ${err.message}`
      };
    }
  }

  async getPlayers() {
    if (!this.isConfigured()) {
      return { configured: false, error: 'PRC_SERVER_KEY is not set in .env' };
    }
    try {
      const response = await fetch(`${this.baseUrl}/server/players`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      if (!response.ok) {
        return { configured: true, success: false, error: `PRC API status ${response.status}` };
      }
      const data = await response.json();
      return { configured: true, success: true, data };
    } catch (err) {
      return { configured: true, success: false, error: err.message };
    }
  }

  async getQueue() {
    if (!this.isConfigured()) {
      return { configured: false, error: 'PRC_SERVER_KEY is not set in .env' };
    }
    try {
      const response = await fetch(`${this.baseUrl}/server/queue`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      if (!response.ok) {
        return { configured: true, success: false, error: `PRC API status ${response.status}` };
      }
      const data = await response.json();
      return { configured: true, success: true, data };
    } catch (err) {
      return { configured: true, success: false, error: err.message };
    }
  }

  async runCommand(commandString) {
    if (!this.isConfigured()) {
      return {
        configured: false,
        error: 'PRC_SERVER_KEY is not set in .env. Cannot execute in-game command.'
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/server/command`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ command: commandString })
      });

      if (!response.ok) {
        const text = await response.text();
        return {
          configured: true,
          success: false,
          error: `PRC API command error (${response.status}): ${text}`
        };
      }

      return {
        configured: true,
        success: true,
        message: `Command "${commandString}" dispatched to ER:LC private server successfully.`
      };
    } catch (err) {
      return {
        configured: true,
        success: false,
        error: `PRC API Network Error: ${err.message}`
      };
    }
  }
}

module.exports = new PRCService();
