export interface CommandItem {
  name: string;
  category: string;
  description: string;
  permission: string;
  options?: { name: string; description: string; required: boolean }[];
}

export const COMMANDS_CATALOG: CommandItem[] = [
  // A. Configuration and setup — 7 commands
  {
    name: 'setup',
    category: 'Setup & Config',
    description: 'Server setup wizard and official panel deployments (including Regulations Panel)',
    permission: 'Management / Directive',
    options: [{ name: 'panel', description: 'Deploy Regulations Panel or Inspect Setup', required: false }]
  },
  {
    name: 'config',
    category: 'Setup & Config',
    description: 'View current New York Roleplay bot configuration and active channel/role mappings',
    permission: 'Administration'
  },
  {
    name: 'set-channel',
    category: 'Setup & Config',
    description: 'Configure a system channel binding dynamically (tickets, apps, logs, sessions, etc.)',
    permission: 'Administration',
    options: [
      { name: 'type', description: 'Type of channel to bind', required: true },
      { name: 'channel', description: 'The text channel', required: true }
    ]
  },
  {
    name: 'set-role',
    category: 'Setup & Config',
    description: 'Configure system role bindings (Directive, HR, IA, Trainee, Verified, etc.)',
    permission: 'Administration',
    options: [
      { name: 'type', description: 'Role binding type', required: true },
      { name: 'role', description: 'Role to assign', required: true }
    ]
  },
  {
    name: 'set-banner',
    category: 'Setup & Config',
    description: 'Configure top or bottom embed banners globally or per-category',
    permission: 'Administration',
    options: [
      { name: 'position', description: 'Top or Bottom banner', required: true },
      { name: 'url', description: 'Direct image URL', required: true },
      { name: 'category', description: 'Specific category override', required: false }
    ]
  },
  {
    name: 'set-logs',
    category: 'Setup & Config',
    description: 'Set the destination channel for system audit, error, or moderation logs',
    permission: 'Administration',
    options: [
      { name: 'category', description: 'Log category (mod, giveaway, error, staff, ia)', required: true },
      { name: 'channel', description: 'Destination channel', required: true }
    ]
  },
  {
    name: 'bot-info',
    category: 'Setup & Config',
    description: 'Display bot system statistics, memory usage, uptime, and database records',
    permission: 'Everyone'
  },

  // B. Ticket management — 9 commands
  {
    name: 'ticket-panel',
    category: 'Ticket Management',
    description: 'Deploy the official New York Roleplay Contact Us ticket dropdown panel',
    permission: 'Administration'
  },
  {
    name: 'ticket-add',
    category: 'Ticket Management',
    description: 'Add a user or role to the current ticket channel',
    permission: 'Support Staff',
    options: [{ name: 'user', description: 'User to add', required: true }]
  },
  {
    name: 'ticket-remove',
    category: 'Ticket Management',
    description: 'Remove a user from the current ticket channel',
    permission: 'Support Staff',
    options: [{ name: 'user', description: 'User to remove', required: true }]
  },
  {
    name: 'ticket-claim',
    category: 'Ticket Management',
    description: 'Claim the current ticket and assign yourself as the active handler',
    permission: 'Support Staff'
  },
  {
    name: 'ticket-close',
    category: 'Ticket Management',
    description: 'Close and archive the current support ticket with HTML transcript export',
    permission: 'Support Staff / Creator',
    options: [{ name: 'reason', description: 'Closure reason', required: false }]
  },
  {
    name: 'ticket-reopen',
    category: 'Ticket Management',
    description: 'Reopen a previously closed ticket in the database',
    permission: 'Support Staff',
    options: [{ name: 'ticket_id', description: 'Ticket ID (e.g. NYRP-0001)', required: true }]
  },
  {
    name: 'ticket-escalate',
    category: 'Ticket Management',
    description: 'Escalate the active ticket to senior Directive Support',
    permission: 'Support Staff'
  },
  {
    name: 'ticket-transcript',
    category: 'Ticket Management',
    description: 'Generate and download an immediate HTML transcript of the current ticket',
    permission: 'Support Staff'
  },
  {
    name: 'ticket-stats',
    category: 'Ticket Management',
    description: 'View analytics, volume metrics, and resolution counts for support tickets',
    permission: 'Support Staff'
  },

  // C. Applications — 9 commands
  {
    name: 'application-panel',
    category: 'Applications',
    description: 'Deploy the official Staff Application dropdown panel',
    permission: 'Administration'
  },
  {
    name: 'application-start',
    category: 'Applications',
    description: 'Initiate the 15-question Staff Application in your Direct Messages',
    permission: 'Everyone'
  },
  {
    name: 'application-review',
    category: 'Applications',
    description: 'Review a specific submitted staff application with Accept/Deny buttons',
    permission: 'Support Staff / High Rank',
    options: [{ name: 'app_id', description: 'Application ID', required: true }]
  },
  {
    name: 'application-approve',
    category: 'Applications',
    description: 'Approve an application, grant Trainee role, and dispatch congratulations',
    permission: 'Support Staff / High Rank',
    options: [{ name: 'app_id', description: 'Application ID', required: true }]
  },
  {
    name: 'application-deny',
    category: 'Applications',
    description: 'Decline an application and send outcome update to applicant',
    permission: 'Support Staff / High Rank',
    options: [{ name: 'app_id', description: 'Application ID', required: true }]
  },
  {
    name: 'application-withdraw',
    category: 'Applications',
    description: 'Withdraw your currently pending staff application',
    permission: 'Applicant'
  },
  {
    name: 'application-blacklist',
    category: 'Applications',
    description: 'Blacklist a user from submitting staff applications',
    permission: 'Human Resources',
    options: [
      { name: 'user', description: 'User to blacklist', required: true },
      { name: 'reason', description: 'Blacklist reason', required: true }
    ]
  },
  {
    name: 'application-status',
    category: 'Applications',
    description: 'Check the review status of your staff application',
    permission: 'Everyone',
    options: [{ name: 'user', description: 'User to check (Staff only)', required: false }]
  },
  {
    name: 'application-questions',
    category: 'Applications',
    description: 'Display the official 15 Staff Application questions',
    permission: 'Everyone'
  },

  // D. Staff management and HR — 9 commands
  {
    name: 'staff-profile',
    category: 'Staff Management',
    description: 'View detailed HR record and performance profile of a staff member',
    permission: 'Everyone',
    options: [{ name: 'staff', description: 'Staff member to look up', required: false }]
  },
  {
    name: 'staff-list',
    category: 'Staff Management',
    description: 'List all registered staff members, officers, and trainees across New York Roleplay',
    permission: 'Everyone'
  },
  {
    name: 'staff-note',
    category: 'Staff Management',
    description: 'Add a confidential HR performance note to a staff member\'s file',
    permission: 'Human Resources',
    options: [
      { name: 'staff', description: 'Staff member', required: true },
      { name: 'note', description: 'Observation or note', required: true }
    ]
  },
  {
    name: 'staff-notes',
    category: 'Staff Management',
    description: 'View all confidential HR performance notes for a staff member',
    permission: 'Human Resources',
    options: [{ name: 'staff', description: 'Staff member', required: true }]
  },
  {
    name: 'staff-feedback',
    category: 'Staff Management',
    description: 'Submit official member feedback on a staff member\'s assistance (1-5 stars)',
    permission: 'Everyone',
    options: [
      { name: 'staff', description: 'Staff member', required: true },
      { name: 'rating', description: 'Rating 1-5', required: true },
      { name: 'reason', description: 'Feedback details', required: true },
      { name: 'ticket_id', description: 'Related ticket ID', required: false }
    ]
  },
  {
    name: 'staff-activity',
    category: 'Staff Management',
    description: 'Log or review staff duty activity, patrol minutes, or shift attendance',
    permission: 'Support Staff'
  },
  {
    name: 'staff-loa',
    category: 'Staff Management',
    description: 'File an official Leave of Absence (LOA) with the HR Team',
    permission: 'Support Staff',
    options: [
      { name: 'start_date', description: 'Start date', required: true },
      { name: 'end_date', description: 'Expected return', required: true },
      { name: 'reason', description: 'LOA reason', required: true }
    ]
  },
  {
    name: 'staff-return',
    category: 'Staff Management',
    description: 'Mark yourself or another staff member returned from Leave of Absence',
    permission: 'Support Staff'
  },
  {
    name: 'staff-suspend',
    category: 'Staff Management',
    description: 'Temporarily suspend a staff member pending Internal Affairs investigation',
    permission: 'Internal Affairs',
    options: [
      { name: 'staff', description: 'Staff to suspend', required: true },
      { name: 'reason', description: 'Suspension reason', required: true },
      { name: 'duration', description: 'Duration', required: false }
    ]
  },

  // E. Internal Affairs — 9 commands
  {
    name: 'infraction',
    category: 'Internal Affairs',
    description: 'Issue an official staff infraction with disciplinary action and case ID',
    permission: 'Internal Affairs',
    options: [
      { name: 'user', description: 'Target staff member', required: true },
      { name: 'punishment', description: 'Sanction type', required: true },
      { name: 'reason', description: 'Infraction reason', required: true },
      { name: 'appealable', description: 'Is sanction appealable?', required: true }
    ]
  },
  {
    name: 'infractions',
    category: 'Internal Affairs',
    description: 'View the disciplinary history and active sanctions of a staff member',
    permission: 'Support Staff',
    options: [{ name: 'user', description: 'Staff member', required: true }]
  },
  {
    name: 'infraction-view',
    category: 'Internal Affairs',
    description: 'Look up a specific disciplinary case by Case ID',
    permission: 'Support Staff',
    options: [{ name: 'case_id', description: 'Case ID', required: true }]
  },
  {
    name: 'infraction-appeal',
    category: 'Internal Affairs',
    description: 'Submit a formal appeal for an active appealable infraction',
    permission: 'Everyone',
    options: [
      { name: 'case_id', description: 'Case ID to appeal', required: true },
      { name: 'statement', description: 'Statement and justification', required: true }
    ]
  },
  {
    name: 'strike',
    category: 'Internal Affairs',
    description: 'Quick-issue a formal disciplinary strike to a staff member (1/3, 2/3, 3/3)',
    permission: 'Internal Affairs',
    options: [
      { name: 'user', description: 'Target user', required: true },
      { name: 'reason', description: 'Strike reason', required: true }
    ]
  },
  {
    name: 'warning',
    category: 'Internal Affairs',
    description: 'Issue an official written or verbal warning to a staff member',
    permission: 'Internal Affairs',
    options: [
      { name: 'user', description: 'Target user', required: true },
      { name: 'reason', description: 'Warning reason', required: true },
      { name: 'type', description: 'Written / Verbal / Final', required: false }
    ]
  },
  {
    name: 'staff-blacklist',
    category: 'Internal Affairs',
    description: 'Permanently blacklist an individual from holding any staff role in New York Roleplay',
    permission: 'Directive Team',
    options: [
      { name: 'user', description: 'User to blacklist', required: true },
      { name: 'reason', description: 'Blacklist reason', required: true }
    ]
  },
  {
    name: 'staff-unblacklist',
    category: 'Internal Affairs',
    description: 'Remove a user from the staff blacklist',
    permission: 'Directive Team',
    options: [
      { name: 'user', description: 'User to pardon', required: true },
      { name: 'reason', description: 'Reason for pardon', required: true }
    ]
  },
  {
    name: 'investigation',
    category: 'Internal Affairs',
    description: 'Initiate or query a confidential Internal Affairs inquiry into staff misconduct',
    permission: 'Internal Affairs'
  },

  // F. Promotions and ranks — 8 commands
  {
    name: 'promote',
    category: 'Promotions & Ranks',
    description: 'Promote a staff member to a new rank and grant appropriate Discord roles',
    permission: 'Human Resources / Directive',
    options: [
      { name: 'user', description: 'Member to promote', required: true },
      { name: 'new_rank', description: 'New rank role', required: true },
      { name: 'reason', description: 'Justification', required: true },
      { name: 'old_rank', description: 'Previous role to remove', required: false }
    ]
  },
  {
    name: 'demote',
    category: 'Promotions & Ranks',
    description: 'Demote a staff member to a lower rank or remove specific rank roles',
    permission: 'Human Resources / Directive',
    options: [
      { name: 'user', description: 'Member to demote', required: true },
      { name: 'remove_role', description: 'Role to remove', required: true },
      { name: 'reason', description: 'Demotion reason', required: true },
      { name: 'new_role', description: 'New lower role', required: false }
    ]
  },
  {
    name: 'promotion-history',
    category: 'Promotions & Ranks',
    description: 'View the entire promotion and demotion timeline for a staff member',
    permission: 'Everyone',
    options: [{ name: 'user', description: 'Staff member', required: false }]
  },
  {
    name: 'rank-sync',
    category: 'Promotions & Ranks',
    description: 'Synchronize Discord guild roles with the internal staff database',
    permission: 'Administration'
  },
  {
    name: 'rank-list',
    category: 'Promotions & Ranks',
    description: 'Display all configured staff hierarchy ranks, permissions groups, and levels',
    permission: 'Everyone'
  },
  {
    name: 'rank-create',
    category: 'Promotions & Ranks',
    description: 'Register a Discord role into the database staff hierarchy system',
    permission: 'Administration',
    options: [
      { name: 'role', description: 'Discord role', required: true },
      { name: 'level', description: 'Hierarchy level (1-10)', required: true },
      { name: 'group', description: 'Permission group', required: true }
    ]
  },
  {
    name: 'role-grant',
    category: 'Promotions & Ranks',
    description: 'Grant a specific role to a user with safety and hierarchy checks',
    permission: 'Administration',
    options: [
      { name: 'user', description: 'Target user', required: true },
      { name: 'role', description: 'Role to grant', required: true }
    ]
  },
  {
    name: 'role-revoke',
    category: 'Promotions & Ranks',
    description: 'Revoke a specific role from a member with safety and hierarchy checks',
    permission: 'Administration',
    options: [
      { name: 'user', description: 'Target user', required: true },
      { name: 'role', description: 'Role to remove', required: true }
    ]
  },

  // G. Training and classroom — 9 commands
  {
    name: 'training-create',
    category: 'Training & Academy',
    description: 'Host and schedule an official Academy Training session with RSVP buttons',
    permission: 'Trainer',
    options: [
      { name: 'topic', description: 'Curriculum module', required: true },
      { name: 'start_time', description: 'Scheduled start time', required: true },
      { name: 'server_link', description: 'Roblox server join link', required: false }
    ]
  },
  {
    name: 'training-start',
    category: 'Training & Academy',
    description: 'Commence a scheduled training session and ping registered attendees',
    permission: 'Trainer',
    options: [{ name: 'session_id', description: 'Session ID', required: true }]
  },
  {
    name: 'training-end',
    category: 'Training & Academy',
    description: 'Conclude an active training session',
    permission: 'Trainer',
    options: [{ name: 'session_id', description: 'Session ID', required: true }]
  },
  {
    name: 'training-cancel',
    category: 'Training & Academy',
    description: 'Cancel a scheduled training session with a stated reason',
    permission: 'Trainer',
    options: [
      { name: 'session_id', description: 'Session ID', required: true },
      { name: 'reason', description: 'Cancellation reason', required: true }
    ]
  },
  {
    name: 'training-join',
    category: 'Training & Academy',
    description: 'Register your attendance for a scheduled Academy training session',
    permission: 'Everyone',
    options: [{ name: 'session_id', description: 'Session ID', required: true }]
  },
  {
    name: 'training-attendance',
    category: 'Training & Academy',
    description: 'View the list of registered attendees for a training session',
    permission: 'Everyone',
    options: [{ name: 'session_id', description: 'Session ID', required: true }]
  },
  {
    name: 'training-result',
    category: 'Training & Academy',
    description: 'Grade a trainee (Pass/Fail) and optionally promote to official staff',
    permission: 'Trainer',
    options: [
      { name: 'session_id', description: 'Session ID', required: true },
      { name: 'trainee', description: 'Trainee user', required: true },
      { name: 'status', description: 'Passed or Failed', required: true },
      { name: 'note', description: 'Evaluation note', required: true }
    ]
  },
  {
    name: 'training-history',
    category: 'Training & Academy',
    description: 'Look up all academy training and classroom evaluations for a staff member',
    permission: 'Everyone',
    options: [{ name: 'user', description: 'User to inspect', required: false }]
  },
  {
    name: 'classroom-result',
    category: 'Training & Academy',
    description: 'Publish formal Classroom Results embed for a passed or failed trainee',
    permission: 'Trainer',
    options: [
      { name: 'user', description: 'Trainee', required: true },
      { name: 'status', description: 'Passed or Failed', required: true },
      { name: 'note', description: 'Trainer note', required: true }
    ]
  },

  // H. Departments — 7 commands
  {
    name: 'department-panel',
    category: 'Departments',
    description: 'Publish the official New York Roleplay Departments overview panel',
    permission: 'Administration'
  },
  {
    name: 'department-create',
    category: 'Departments',
    description: 'Register a new agency or division into the New York department registry',
    permission: 'Administration',
    options: [
      { name: 'id', description: 'Identifier (e.g. nypd)', required: true },
      { name: 'name', description: 'Full name', required: true },
      { name: 'emoji', description: 'Department emoji', required: true },
      { name: 'description', description: 'Description', required: true },
      { name: 'whitelisted', description: 'Whitelisted?', required: true }
    ]
  },
  {
    name: 'department-edit',
    category: 'Departments',
    description: 'Update configurations for an existing department',
    permission: 'Administration',
    options: [{ name: 'id', description: 'Department ID', required: true }]
  },
  {
    name: 'department-apply',
    category: 'Departments',
    description: 'Apply to join an official New York Roleplay department',
    permission: 'Everyone',
    options: [
      { name: 'department', description: 'Target department', required: true },
      { name: 'experience', description: 'RP experience', required: true },
      { name: 'motivation', description: 'Why you want to join', required: true }
    ]
  },
  {
    name: 'department-accept',
    category: 'Departments',
    description: 'Approve a candidate\'s department application and grant department roles',
    permission: 'Department Leadership',
    options: [
      { name: 'department', description: 'Department ID', required: true },
      { name: 'user', description: 'Candidate user', required: true }
    ]
  },
  {
    name: 'department-deny',
    category: 'Departments',
    description: 'Decline a candidate\'s department application',
    permission: 'Department Leadership',
    options: [
      { name: 'department', description: 'Department ID', required: true },
      { name: 'user', description: 'Applicant', required: true },
      { name: 'reason', description: 'Decline reason', required: false }
    ]
  },
  {
    name: 'department-roster',
    category: 'Departments',
    description: 'Display the active personnel roster for a New York department',
    permission: 'Everyone',
    options: [{ name: 'department', description: 'Department ID', required: true }]
  },

  // I. ER:LC private server operations — 7 commands
  {
    name: 'session-vote',
    category: 'ER:LC Operations',
    description: 'Launch a community roleplay session vote poll',
    permission: 'Support Staff',
    options: [{ name: 'goal', description: 'Upvote threshold needed', required: false }]
  },
  {
    name: 'session-start',
    category: 'ER:LC Operations',
    description: 'Officially commence an ER:LC private server roleplay session',
    permission: 'Support Staff',
    options: [
      { name: 'server_code', description: 'Private server join code', required: false },
      { name: 'special_roleplay', description: 'Event theme', required: false }
    ]
  },
  {
    name: 'session-end',
    category: 'ER:LC Operations',
    description: 'Conclude an ongoing ER:LC private server roleplay session',
    permission: 'Support Staff'
  },
  {
    name: 'session-boost',
    category: 'ER:LC Operations',
    description: 'Call for a server boost / fill to populate the ER:LC private server',
    permission: 'Support Staff'
  },
  {
    name: 'session-full',
    category: 'ER:LC Operations',
    description: 'Announce that the ER:LC private server has reached maximum player capacity',
    permission: 'Support Staff'
  },
  {
    name: 'session-shutdown',
    category: 'ER:LC Operations',
    description: 'Broadcast an in-game shutdown warning or restart notice via PRC API',
    permission: 'Administration',
    options: [
      { name: 'reason', description: 'Reason for shutdown', required: true },
      { name: 'countdown_minutes', description: 'Countdown in minutes', required: false }
    ]
  },
  {
    name: 'server-status',
    category: 'ER:LC Operations',
    description: 'Query real-time live ER:LC private server player counts, queue, and staff via PRC API',
    permission: 'Everyone'
  },

  // J. Verification and community — 7 commands
  {
    name: 'verify-panel',
    category: 'Verification & Community',
    description: 'Deploy the official New York Roleplay Roblox account verification panel',
    permission: 'Administration'
  },
  {
    name: 'verify',
    category: 'Verification & Community',
    description: 'Verify ownership of your Roblox account through public profile description',
    permission: 'Everyone',
    options: [{ name: 'roblox_username', description: 'Your exact Roblox username', required: true }]
  },
  {
    name: 'verify-help',
    category: 'Verification & Community',
    description: 'Step-by-step assistance and troubleshooting for Roblox verification',
    permission: 'Everyone'
  },
  {
    name: 'welcome-setup',
    category: 'Verification & Community',
    description: 'Configure channels for automated member welcome and departure logs',
    permission: 'Administration',
    options: [
      { name: 'welcome_channel', description: 'Welcome greeting channel', required: true },
      { name: 'goodbye_channel', description: 'Goodbye channel', required: false }
    ]
  },
  {
    name: 'statistics',
    category: 'Verification & Community',
    description: 'Display live Discord server statistics and community metrics',
    permission: 'Everyone'
  },
  {
    name: 'goal-set',
    category: 'Verification & Community',
    description: 'Configure a member milestone goal and celebration message',
    permission: 'Administration',
    options: [
      { name: 'target', description: 'Target member count', required: true },
      { name: 'message', description: 'Announcement text', required: true }
    ]
  },
  {
    name: 'goal-list',
    category: 'Verification & Community',
    description: 'Display all configured community milestone goals and progress',
    permission: 'Everyone'
  },

  // K. Music — 10 commands
  {
    name: 'play',
    category: 'Music System',
    description: 'Play a song or audio stream in your current voice channel',
    permission: 'Everyone',
    options: [{ name: 'query', description: 'Song name or URL', required: true }]
  },
  {
    name: 'pause',
    category: 'Music System',
    description: 'Pause playback of the current audio track',
    permission: 'Everyone'
  },
  {
    name: 'resume',
    category: 'Music System',
    description: 'Resume paused audio playback',
    permission: 'Everyone'
  },
  {
    name: 'skip',
    category: 'Music System',
    description: 'Skip the currently playing song in the queue',
    permission: 'Everyone'
  },
  {
    name: 'stop',
    category: 'Music System',
    description: 'Stop music playback, clear queue, and disconnect from the voice channel',
    permission: 'Everyone'
  },
  {
    name: 'queue',
    category: 'Music System',
    description: 'Display the upcoming songs currently waiting in the guild music queue',
    permission: 'Everyone'
  },
  {
    name: 'volume',
    category: 'Music System',
    description: 'Change volume of currently playing music (0-100%) or view volume slider',
    permission: 'Everyone',
    options: [{ name: 'level', description: 'Volume level (0-100%)', required: false }]
  },
  {
    name: 'nowplaying',
    category: 'Music System',
    description: 'Display currently playing song with YouTube progress bar (🔘▬▬▬▬▬▬▬▬), time indicator, and controls',
    permission: 'Everyone'
  },
  {
    name: 'loop',
    category: 'Music System',
    description: 'Toggle music loop between Off, Single Track, and Entire Queue',
    permission: 'Everyone',
    options: [{ name: 'mode', description: 'Loop mode (off, track, queue)', required: false }]
  },
  {
    name: 'lyrics',
    category: 'Music System',
    description: 'Get verified lyrics for the currently playing song or search via Genius API',
    permission: 'Everyone',
    options: [{ name: 'query', description: 'Song title or rapper name', required: false }]
  },
  {
    name: 'move',
    category: 'Music System',
    description: 'Move songs around in the music queue',
    permission: 'Everyone',
    options: [
      { name: 'from', description: 'Position of song to move', required: true },
      { name: 'to', description: 'Target destination position', required: true }
    ]
  },
  {
    name: 'remove',
    category: 'Music System',
    description: 'Remove a specific song from the queue by position number',
    permission: 'Everyone',
    options: [{ name: 'track', description: 'Queue position number to remove', required: true }]
  },
  {
    name: 'search',
    category: 'Music System',
    description: 'Search YouTube & select from top 5 audio results via interactive menu',
    permission: 'Everyone',
    options: [{ name: 'query', description: 'Keywords, rapper, or song title', required: true }]
  },
  {
    name: 'shuffle',
    category: 'Music System',
    description: 'Randomly shuffle all tracks in the current music queue',
    permission: 'Everyone'
  },
  {
    name: 'skipto',
    category: 'Music System',
    description: 'Skip directly to the selected queue number',
    permission: 'Everyone',
    options: [{ name: 'track', description: 'Track number to jump to', required: true }]
  },
  {
    name: 'playlist',
    category: 'Music System',
    description: 'Play a playlist from YouTube, Spotify, 6 curated presets, or saved collections',
    permission: 'Everyone',
    options: [{ name: 'subcommand', description: 'curated, play, save, load, list', required: true }]
  },
  {
    name: 'dj-mode',
    category: 'Music System',
    description: 'Toggle DJ-only playback control mode for the guild',
    permission: 'Administration',
    options: [{ name: 'enabled', description: 'Enable or disable', required: true }]
  },

  // L. Utility, moderation and community tools — 13 commands
  {
    name: 'help',
    category: 'Utility & Moderation',
    description: 'Display all commands and descriptions categorized with banner information',
    permission: 'Everyone',
    options: [{ name: 'category', description: 'Category to inspect', required: false }]
  },
  {
    name: 'invite',
    category: 'Utility & Moderation',
    description: 'Send bot invite link to add Rolonbot to your Discord server',
    permission: 'Everyone'
  },
  {
    name: 'ping',
    category: 'Utility & Moderation',
    description: 'Show the bot\'s average ping, API latency, and WebSocket heartbeat',
    permission: 'Everyone'
  },
  {
    name: 'uptime',
    category: 'Utility & Moderation',
    description: 'Check runtime duration, memory allocation, and host diagnostics',
    permission: 'Everyone'
  },
  {
    name: 'giveaway',
    category: 'Utility & Moderation',
    description: 'Launch a persistent community giveaway with automated winner selection',
    permission: 'Support Staff',
    options: [
      { name: 'prize', description: 'Prize', required: true },
      { name: 'duration_minutes', description: 'Duration in minutes', required: true },
      { name: 'winners', description: 'Number of winners', required: false },
      { name: 'required_role', description: 'Required entry role', required: false }
    ]
  },
  {
    name: 'giveaway-reroll',
    category: 'Utility & Moderation',
    description: 'Reroll a new winner for an ended giveaway',
    permission: 'Support Staff',
    options: [{ name: 'giveaway_id', description: 'Giveaway ID', required: true }]
  },
  {
    name: 'poll',
    category: 'Utility & Moderation',
    description: 'Create a structured community poll with up to 5 choices and reactions',
    permission: 'Support Staff',
    options: [
      { name: 'question', description: 'Poll question', required: true },
      { name: 'option1', description: 'Option 1', required: true },
      { name: 'option2', description: 'Option 2', required: true }
    ]
  },
  {
    name: 'embed',
    category: 'Utility & Moderation',
    description: 'Publish a styled New York Roleplay embed message with custom title and description',
    permission: 'Support Staff',
    options: [
      { name: 'title', description: 'Title', required: true },
      { name: 'description', description: 'Description', required: true },
      { name: 'color', description: 'Hex color', required: false },
      { name: 'image_url', description: 'Banner image URL', required: false }
    ]
  },
  {
    name: 'userinfo',
    category: 'Utility & Moderation',
    description: 'Look up comprehensive user details, account age, verification, and roles',
    permission: 'Everyone',
    options: [{ name: 'user', description: 'User to inspect', required: false }]
  },
  {
    name: 'serverinfo',
    category: 'Utility & Moderation',
    description: 'Display detailed statistics and metadata regarding this Discord community',
    permission: 'Everyone'
  },
  {
    name: 'purge',
    category: 'Utility & Moderation',
    description: 'Bulk delete messages from the current channel with moderation logging',
    permission: 'Moderation',
    options: [
      { name: 'amount', description: 'Number of messages (1-100)', required: true },
      { name: 'user', description: 'Filter user', required: false }
    ]
  },
  {
    name: 'slowmode',
    category: 'Utility & Moderation',
    description: 'Set slowmode cooldown for the current channel (0 to 21600 seconds)',
    permission: 'Moderation',
    options: [{ name: 'seconds', description: 'Duration in seconds', required: true }]
  },
  {
    name: 'marketplace-panel',
    category: 'Utility & Moderation',
    description: 'Deploy the official New York Roleplay Marketplace products and sponsorship panel',
    permission: 'Administration'
  }
];
