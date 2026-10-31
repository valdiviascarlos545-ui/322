const fs = require('fs');
const path = require('path');

/**
 * Generates a clean, professional HTML transcript for ticket archives
 */
function generateHtmlTranscript(ticketData, messages = []) {
  const {
    ticket_id,
    user_tag,
    user_id,
    category,
    claimed_by,
    escalated,
    escalated_by,
    created_at,
    closed_at,
    closed_by,
    close_reason
  } = ticketData;

  const escapeHtml = (str = '') => {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  };

  const messageRows = messages.map(m => {
    let attachmentsHtml = '';
    if (m.attachments) {
      try {
        const atts = typeof m.attachments === 'string' ? JSON.parse(m.attachments) : m.attachments;
        if (Array.isArray(atts)) {
          attachmentsHtml = atts.map(a => `<div class="attachment"><a href="${escapeHtml(a.url)}" target="_blank" rel="noopener">📎 Attachment: ${escapeHtml(a.name || 'File')}</a></div>`).join('');
        }
      } catch (e) {
        // ignore
      }
    }

    return `
      <div class="message-card">
        <div class="msg-header">
          <span class="msg-author">${escapeHtml(m.username || m.user_id)}</span>
          <span class="msg-time">${new Date(m.created_at || Date.now()).toLocaleString()}</span>
        </div>
        <div class="msg-content">${escapeHtml(m.content || '').replace(/\n/g, '<br>')}</div>
        ${attachmentsHtml}
      </div>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ticket Transcript - ${escapeHtml(ticket_id)}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #0F172A;
      color: #E2E8F0;
      margin: 0;
      padding: 24px;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: #1E293B;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
      border: 1px solid #334155;
    }
    .header {
      background: #1D3557;
      padding: 24px;
      border-bottom: 2px solid #2563EB;
    }
    .header h1 {
      margin: 0 0 8px 0;
      font-size: 24px;
      color: #FFFFFF;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .header p {
      margin: 0;
      color: #94A3B8;
      font-size: 14px;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      padding: 20px 24px;
      background: #131E32;
      border-bottom: 1px solid #334155;
    }
    .meta-item {
      font-size: 13px;
    }
    .meta-label {
      color: #64748B;
      text-transform: uppercase;
      font-weight: 600;
      font-size: 11px;
      margin-bottom: 4px;
    }
    .meta-value {
      color: #F8FAFC;
      font-weight: 500;
    }
    .messages-container {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .message-card {
      background: #0F172A;
      border-radius: 8px;
      padding: 14px 18px;
      border: 1px solid #334155;
    }
    .msg-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      border-bottom: 1px solid #1E293B;
      padding-bottom: 6px;
    }
    .msg-author {
      font-weight: 600;
      color: #38BDF8;
      font-size: 14px;
    }
    .msg-time {
      font-size: 12px;
      color: #64748B;
    }
    .msg-content {
      font-size: 14px;
      line-height: 1.5;
      color: #CBD5E1;
      word-break: break-word;
    }
    .attachment {
      margin-top: 10px;
      font-size: 13px;
    }
    .attachment a {
      color: #60A5FA;
      text-decoration: none;
    }
    .attachment a:hover {
      text-decoration: underline;
    }
    .footer {
      padding: 16px 24px;
      background: #131E32;
      border-top: 1px solid #334155;
      text-align: center;
      font-size: 12px;
      color: #64748B;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📬 New York Roleplay — Ticket Transcript</h1>
      <p>Archived support transcript for Ticket #${escapeHtml(ticket_id)}</p>
    </div>
    <div class="meta-grid">
      <div class="meta-item">
        <div class="meta-label">Ticket Creator</div>
        <div class="meta-value">${escapeHtml(user_tag)} (${escapeHtml(user_id)})</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Category</div>
        <div class="meta-value">🔹 ${escapeHtml(category || 'General')}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Claimed Staff</div>
        <div class="meta-value">${claimed_by ? `🟢 &lt;@${escapeHtml(claimed_by)}&gt;` : 'Unclaimed'}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Escalation Status</div>
        <div class="meta-value">${escalated ? `🔵 Escalated by &lt;@${escapeHtml(escalated_by)}&gt;` : 'Standard'}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Opened At</div>
        <div class="meta-value">${new Date(created_at).toLocaleString()}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Closed At</div>
        <div class="meta-value">${closed_at ? new Date(closed_at).toLocaleString() : 'N/A'}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Closed By</div>
        <div class="meta-value">${closed_by ? `&lt;@${escapeHtml(closed_by)}&gt;` : 'N/A'}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Closure Reason</div>
        <div class="meta-value">${escapeHtml(close_reason || 'Support Completed')}</div>
      </div>
    </div>

    <div class="messages-container">
      ${messageRows || '<p style="color:#64748B; text-align:center;">No message logs recorded in this session.</p>'}
    </div>

    <div class="footer">
      New York Roleplay &bull; Staff Management System &bull; Total Messages: ${messages.length}
    </div>
  </div>
</body>
</html>`;
}

/**
 * Saves transcript to disk and returns absolute path
 */
function saveTranscriptFile(ticketData, messages = []) {
  const html = generateHtmlTranscript(ticketData, messages);
  const transcriptsDir = path.resolve(process.cwd(), 'transcripts');
  if (!fs.existsSync(transcriptsDir)) {
    fs.mkdirSync(transcriptsDir, { recursive: true });
  }

  const fileName = `transcript-${ticketData.ticket_id || Date.now()}.html`;
  const filePath = path.join(transcriptsDir, fileName);
  fs.writeFileSync(filePath, html, 'utf8');
  return { filePath, fileName, html };
}

module.exports = {
  generateHtmlTranscript,
  saveTranscriptFile
};
