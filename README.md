# 🗽 New York ERLC Staff Management Bot

A production-ready, feature-complete Discord bot engineered for the **New York ERLC Roleplay Community** using **Node.js 20+**, **Discord.js v14**, **SQLite3 (WAL Mode)**, and the official **Police Roleplay Community (PRC) API**.

---

## 🌟 Key Features

* **100 Unique Slash Commands** across 12 dedicated categories.
* **Professional Ticket System**: Interactive dropdown (`General`, `High Rank`, `Department`), persistent Claim/Close/Escalate buttons, automatic permissions, and standalone **HTML transcript archiving**.
* **15-Question DM Application Workflow**: Automated question-by-question DM interview, duplicate submission protection, High Rank review embed with Accept/Deny buttons, automated Trainee role assignment, and direct message notifications.
* **Native Roblox Profile Verification**: Zero external bloatware dependencies. Generates unique secure verification codes placed in the user's Roblox profile description, verified via official Roblox public endpoints.
* **Staff HR & Disciplinary System**: Infractions (warnings, strikes, suspensions, blacklists), confidential HR notes, 1–5 star community feedback logging, and Leave of Absence (LOA) registry.
* **Promotion & Rank Engine**: Role synchronization, hierarchy permission guards, automated rank assignment, and promotion thread creation.
* **Classroom & Training Operations**: Scheduled Academy training announcements with Join/Leave RSVP buttons, game server join links, attendance tracking, and Classroom Results cards.
* **7 New York Departments**: NYPD, NYSP, FDNY, EMS, DOT, FBI, and Civilian Operations with rosters and leadership application routing.
* **ER:LC Private Server PRC Telemetry**: Real-time server telemetry, live player counts, queue status, in-game mod notifications, server boost alerts, and emergency shutdown broadcasts.
* **100 Rotating Presences**: Automatically cycles every 30 seconds through 100 authentic New York Roleplay activities with live interpolated member counts.
* **Complete Music System**: Voice channel connection, queue management, DJ mode, volume controls, playlist storage, and playback button controls.
* **Unified Dual-Banner Embed System**: Global and category-overridable top and bottom banners managed via `.env`.

---

## 📋 Technology Stack

* **Node.js**: v20.0.0 or higher
* **Discord.js**: v14.16.3
* **Database**: SQLite3 (`better-sqlite3` with WAL mode & automated schema setup)
* **Voice / Music**: `@discordjs/voice`, `play-dl`
* **Configuration**: `dotenv`

---

## 🚀 Quickstart & Windows Installation Guide

### Prerequisites
1. Install **Node.js 20 or newer** from [nodejs.org](https://nodejs.org).
2. Open **VS Code** or your Windows Command Prompt (`cmd.exe`) in this folder.

### Step 1: Install Dependencies
```cmd
npm install
```

### Step 2: Configure Environment (.env)
Copy `.env.example` to `.env`:
```cmd
copy .env.example .env
```
Open `.env` in VS Code and supply your Discord credentials:
* `TOKEN`: Your Discord Bot Token (from Discord Developer Portal)
* `CLIENT_ID`: Your Discord Application Client ID
* `GUILD_ID`: Your Discord Server (Guild) ID (for instant command deployment)
* `BOT_OWNER_ID`: Your Discord User ID
* `PRC_SERVER_KEY`: (Optional) Your ER:LC Private Server key from Police Roleplay Community

> **Important**: In the [Discord Developer Portal](https://discord.com/developers/applications), navigate to your bot application under **Bot -> Privileged Gateway Intents** and enable:
> * ✅ **Presence Intent**
> * ✅ **Server Members Intent**
> * ✅ **Message Content Intent**

### Step 3: Deploy All 100 Slash Commands
To register all 100 slash commands instantly into your server:
```cmd
npm run deploy
```
*(To register globally across all Discord servers for production, run `npm run deploy:global`)*

### Step 4: Start the Bot
```cmd
npm start
```

---

## 🧪 Running the Automated Verification Suite
To verify that all 100 slash commands, database tables, embed builders, and transcripts are functioning properly:
```cmd
npm test
```

---

## 📂 Project Architecture

```
New-York-ERLC-Bot/
├── src/
│   ├── commands/             # Exactly 100 Slash Commands
│   │   ├── setup/            # 7 Commands (setup, config, set-channel, set-role, etc.)
│   │   ├── tickets/          # 9 Commands (ticket-panel, ticket-claim, ticket-close, etc.)
│   │   ├── applications/     # 9 Commands (application-panel, application-start, etc.)
│   │   ├── staff/            # 9 Commands (staff-profile, staff-feedback, staff-loa, etc.)
│   │   ├── ia/               # 9 Commands (infraction, strike, warning, investigation, etc.)
│   │   ├── promotions/       # 8 Commands (promote, demote, rank-sync, rank-list, etc.)
│   │   ├── training/         # 9 Commands (training-create, training-result, classroom-result, etc.)
│   │   ├── departments/      # 7 Commands (department-panel, department-apply, roster, etc.)
│   │   ├── sessions/         # 7 Commands (session-vote, session-start, server-status, etc.)
│   │   ├── verification/     # 7 Commands (verify-panel, verify, statistics, goal-set, etc.)
│   │   ├── music/            # 10 Commands (play, pause, skip, queue, playlist, dj-mode, etc.)
│   │   └── utility/          # 9 Commands (giveaway, poll, embed, userinfo, purge, marketplace)
│   ├── handlers/             # Modular interaction and event routers
│   ├── services/             # PRC API, Roblox API, Tickets, Applications, Music, Giveaways
│   └── utils/                # Centralized Embed Builder, Permissions, and HTML Transcripts
├── database/                 # SQLite storage (newyork.sqlite)
├── transcripts/              # Generated HTML ticket transcripts
├── tests/                    # Automated test suites
├── config.js                 # Environment configuration loader
├── db.js                     # SQLite schema initialization
├── deploy.js                 # Slash command deployer
├── index.js                  # Discord client entrypoint
└── package.json
```

---

## 📜 Complete 100 Slash Commands Reference

### A. Configuration & Setup (7)
* `/setup` — Automated setup status inspection.
* `/config` — View current channel/role bindings and PRC API status.
* `/set-channel` — Map system channels dynamically (Tickets, Apps, Logs, Sessions, etc.).
* `/set-role` — Map system roles (Directive, HR, IA, Trainee, Verified, DJ, etc.).
* `/set-banner` — Update top/bottom banners globally or for specific categories.
* `/set-logs` — Configure destination channels for audit and error streams.
* `/bot-info` — System statistics, memory usage, and database records.

### B. Ticket Management (9)
* `/ticket-panel` — Deploy the official Contact Us category dropdown.
* `/ticket-add` — Add a user or role to the active ticket.
* `/ticket-remove` — Remove a user from the active ticket.
* `/ticket-claim` — Assign yourself as active ticket handler.
* `/ticket-close` — Conclude ticket, save HTML transcript, and archive channel.
* `/ticket-reopen` — Reopen an archived ticket in database records.
* `/ticket-escalate` — Escalate ticket to the Directive Team.
* `/ticket-transcript` — Generate and download an HTML transcript on demand.
* `/ticket-stats` — Support metrics, resolution rates, and category distribution.

### C. Staff Applications (9)
* `/application-panel` — Publish the official Staff Application dropdown panel.
* `/application-start` — Initiate the 15-question DM questionnaire.
* `/application-review` — Review candidate answers with Accept/Deny buttons.
* `/application-approve` — Grant Trainee role and dispatch acceptance DM.
* `/application-deny` — Decline candidate and dispatch outcome notification.
* `/application-withdraw` — Withdraw your own pending application.
* `/application-blacklist` — Bar a user from applying for staff positions.
* `/application-status` — Check the review status of staff applications.
* `/application-questions` — Inspect the official 15 application questions.

### D. Staff Management & HR (9)
* `/staff-profile` — View staff member's Roblox account, rank, LOA, and rating.
* `/staff-list` — Roster of active personnel, Directive, HR, and Trainees.
* `/staff-note` — Record a confidential HR observation on a staff member.
* `/staff-notes` — View all HR notes on a staff member's file.
* `/staff-feedback` — Submit community 1–5 star rating and feedback.
* `/staff-activity` — Log or review staff shift minutes and patrol hours.
* `/staff-loa` — File an official Leave of Absence with HR.
* `/staff-return` — Mark staff member returned from LOA.
* `/staff-suspend` — Suspend a staff member pending IA inquiry.

### E. Internal Affairs & Disciplinary Actions (9)
* `/infraction` — Issue warning, strike, suspension, or blacklist with case ID.
* `/infractions` — Review disciplinary history and active sanctions.
* `/infraction-view` — Look up a specific case report by Case ID.
* `/infraction-appeal` — Submit a formal appeal for an appealable sanction.
* `/strike` — Quick-issue a formal disciplinary strike (1/3, 2/3, 3/3).
* `/warning` — Issue a verbal, written, or final warning.
* `/staff-blacklist` — Permanently blacklist an individual from staff operations.
* `/staff-unblacklist` — Lift a staff blacklist.
* `/investigation` — Open or inspect confidential IA misconduct files.

### F. Promotions & Ranks (8)
* `/promote` — Advance staff member to a new rank role and open celebration thread.
* `/demote` — Demote staff rank and remove corresponding roles.
* `/promotion-history` — Complete rank transition history for a staff member.
* `/rank-sync` — Sync server member roles with database records.
* `/rank-list` — Display staff hierarchy levels and permission tiers.
* `/rank-create` — Register a server role into the staff hierarchy level system.
* `/role-grant` — Safely grant a role with hierarchy checks.
* `/role-revoke` — Safely remove a role with hierarchy checks.

### G. Training & Academy (9)
* `/training-create` — Host and announce an official training session with Join buttons.
* `/training-start` — Start session and ping registered attendees.
* `/training-end` — Conclude training session.
* `/training-cancel` — Cancel training session with reason.
* `/training-join` — RSVP attendance for a scheduled training.
* `/training-attendance` — View registered candidate attendance list.
* `/training-result` — Grade trainee (Pass/Fail) and auto-promote to staff.
* `/training-history` — Academy classroom evaluation records.
* `/classroom-result` — Publish official Classroom Results card.

### H. Departments (7)
* `/department-panel` — Publish the official New York Departments panel.
* `/department-create` — Register a new agency or division.
* `/department-edit` — Modify department settings, descriptions, or roles.
* `/department-apply` — Submit a department application.
* `/department-accept` — Approve applicant and assign department role.
* `/department-deny` — Decline applicant with feedback.
* `/department-roster` — Display personnel roster for a specific department.

### I. ER:LC Operations & Telemetry (7)
* `/session-vote` — Start a session poll with goal thresholds.
* `/session-start` — Announce private server session open with Roblox link.
* `/session-end` — Announce session conclusion.
* `/session-boost` — Call for players to populate server capacity.
* `/session-full` — Announce server is full with queue directions.
* `/session-shutdown` — Dispatch shutdown warning via in-game PRC API `:m`.
* `/server-status` — Live telemetry: players online, queue, and join key.

### J. Verification & Community (7)
* `/verify-panel` — Deploy the official Roblox verification panel.
* `/verify` — Slash command Roblox account ownership verification.
* `/verify-help` — Step-by-step verification troubleshooting guide.
* `/welcome-setup` — Set automated welcome and goodbye channels.
* `/statistics` — Live server metrics (Members, Online, Boosts, Verified, Staff).
* `/goal-set` — Set a milestone goal (e.g. 1,000 members).
* `/goal-list` — View milestone progress and celebration status.

### K. Music (10)
* `/play` — Stream audio from URL or query.
* `/pause` — Pause playback.
* `/resume` — Resume playback.
* `/skip` — Skip to next track.
* `/stop` — Clear queue and leave voice channel.
* `/queue` — View songs waiting in queue.
* `/volume` — Adjust volume (1-150%).
* `/nowplaying` — View currently streaming song metadata.
* `/playlist` — Save and load personal playlists.
* `/dj-mode` — Restrict playback controls to DJ role.

### L. Utility & Moderation (9)
* `/giveaway` — Host a persistent giveaway with timer recovery.
* `/giveaway-reroll` — Reroll a winner for an ended giveaway.
* `/poll` — Create a structured community poll with reactions.
* `/embed` — Send custom embeds with top and bottom banners.
* `/userinfo` — Comprehensive citizen dossier and profile.
* `/serverinfo` — Server metrics, creation date, and boost level.
* `/purge` — Bulk message deletion with rate protection.
* `/slowmode` — Channel slowmode adjustment.
* `/marketplace-panel` — Deploy Marketplace product offering panel.

---

## 🔒 Security & Role Hierarchy

* **Centralized Authorization**: Configured in `src/utils/permissions.js` with 14 distinct permission tiers.
* **Self-Targeting Guard**: Users cannot promote, strike, or demote themselves.
* **Hierarchy Enforcement**: Users cannot moderate, promote, or assign roles to members possessing equal or higher rank.
* **Ephemeral Sensitives**: Audit queries and internal notes default to ephemeral view.
* **Credential Protection**: Zero secrets or tokens exposed in logs.
