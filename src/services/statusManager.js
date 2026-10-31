const { ActivityType } = require('discord.js');
const db = require('../../db');

const ACTIVITIES = [
  { name: 'New York Roleplay', type: ActivityType.Watching },
  { name: '{memberCount} Citizens of NY', type: ActivityType.Watching },
  { name: 'ER:LC Liberty County', type: ActivityType.Playing },
  { name: 'NYPD Dispatch Radio', type: ActivityType.Listening },
  { name: 'Active Staff Operations', type: ActivityType.Watching },
  { name: 'Pending Staff Applications', type: ActivityType.Watching },
  { name: 'Support Tickets Queue', type: ActivityType.Watching },
  { name: 'NYPD 10-8 On Patrol', type: ActivityType.Playing },
  { name: 'NYSP Highway Patrol', type: ActivityType.Watching },
  { name: 'FDNY Engine 54 Responding', type: ActivityType.Playing },
  { name: 'EMS Paramedic Triage', type: ActivityType.Watching },
  { name: 'DOT Traffic Management', type: ActivityType.Playing },
  { name: 'FBI Federal Operations', type: ActivityType.Watching },
  { name: 'Times Square City Grid', type: ActivityType.Watching },
  { name: 'Manhattan 911 Calls', type: ActivityType.Listening },
  { name: 'Brooklyn Bridge Traffic', type: ActivityType.Watching },
  { name: 'Queens Patrol District', type: ActivityType.Playing },
  { name: 'The Bronx Precinct 42', type: ActivityType.Watching },
  { name: 'Staten Island Ferry Dock', type: ActivityType.Watching },
  { name: 'ER:LC Private Server Operations', type: ActivityType.Playing },
  { name: 'Staff Moderation Logs', type: ActivityType.Watching },
  { name: 'Internal Affairs Audits', type: ActivityType.Watching },
  { name: 'Trainee Academy Classrooms', type: ActivityType.Watching },
  { name: 'New Staff Orientations', type: ActivityType.Competing },
  { name: 'Roblox Profile Verifications', type: ActivityType.Watching },
  { name: 'Server Milestones & Goals', type: ActivityType.Watching },
  { name: 'Emergency Vehicle Sirens', type: ActivityType.Listening },
  { name: 'Police Radio Frequency 1', type: ActivityType.Listening },
  { name: 'NYPD Tactical SWAT Raid', type: ActivityType.Competing },
  { name: 'High-Speed Pursuit 10-80', type: ActivityType.Watching },
  { name: 'Traffic Stop on FDR Drive', type: ActivityType.Playing },
  { name: 'Central Park West Patrol', type: ActivityType.Playing },
  { name: 'Wall Street Security Detail', type: ActivityType.Watching },
  { name: 'Civilians in ER:LC', type: ActivityType.Watching },
  { name: 'Harlem Night Patrol', type: ActivityType.Playing },
  { name: 'New York Roleplay Regulations', type: ActivityType.Watching },
  { name: 'Midtown Precinct Briefing', type: ActivityType.Listening },
  { name: 'Staff Infraction Records', type: ActivityType.Watching },
  { name: 'Command Staff Roster', type: ActivityType.Watching },
  { name: 'Grand Central Station Safety', type: ActivityType.Watching },
  { name: 'ER:LC Server Live Queue', type: ActivityType.Watching },
  { name: 'Broadway Street Performers', type: ActivityType.Watching },
  { name: 'Mayor Motorcade Escort', type: ActivityType.Competing },
  { name: 'Empire State Observation', type: ActivityType.Watching },
  { name: 'NYPD Aviation Unit 1', type: ActivityType.Playing },
  { name: 'Harbor Unit Patrol Boat', type: ActivityType.Playing },
  { name: 'K-9 Unit Tracking Search', type: ActivityType.Playing },
  { name: 'Bomb Squad Inspection', type: ActivityType.Watching },
  { name: 'Community Giveaways', type: ActivityType.Watching },
  { name: 'Community Polls & Feedback', type: ActivityType.Listening },
  { name: 'Music in Voice Lounges', type: ActivityType.Listening },
  { name: 'New York Roleplay Radio', type: ActivityType.Listening },
  { name: 'Lincoln Tunnel Checkpoint', type: ActivityType.Watching },
  { name: 'Holland Tunnel Surveillance', type: ActivityType.Watching },
  { name: 'George Washington Bridge Traffic', type: ActivityType.Watching },
  { name: 'Triborough Bridge Tolls', type: ActivityType.Watching },
  { name: 'Major Case Squad Briefing', type: ActivityType.Listening },
  { name: 'Fugitive Recovery Operation', type: ActivityType.Competing },
  { name: 'Liberty County Courthouse', type: ActivityType.Watching },
  { name: 'Bank Robbery Lockdown 10-90', type: ActivityType.Competing },
  { name: 'Jewelry Store Alarm Trip', type: ActivityType.Watching },
  { name: 'Convenience Store Holdup', type: ActivityType.Watching },
  { name: 'Hostage Negotiation Channel', type: ActivityType.Listening },
  { name: 'SWAT Perimeter Deployment', type: ActivityType.Playing },
  { name: 'FDNY 5-Alarm Fire Call', type: ActivityType.Playing },
  { name: 'EMS Medevac Helicopter', type: ActivityType.Watching },
  { name: 'DOT Snow Plow Fleets', type: ActivityType.Playing },
  { name: 'Highway 10-50 Major Collision', type: ActivityType.Watching },
  { name: 'Civilian Marketplace Offers', type: ActivityType.Watching },
  { name: 'NYPD Fleet Maintenance', type: ActivityType.Playing },
  { name: 'Roleplay Integrity Audits', type: ActivityType.Watching },
  { name: 'Staff Shift Logs', type: ActivityType.Watching },
  { name: 'Internal Affairs Hearings', type: ActivityType.Watching },
  { name: 'Weekly Staff Meeting', type: ActivityType.Listening },
  { name: 'Officer Promotion Ceremony', type: ActivityType.Watching },
  { name: 'Recruit Drill Instructors', type: ActivityType.Listening },
  { name: 'Classroom Driving Exam', type: ActivityType.Watching },
  { name: 'Classroom Shooting Range', type: ActivityType.Competing },
  { name: 'Staff LOA Registrations', type: ActivityType.Watching },
  { name: 'New York RP Discord Hub', type: ActivityType.Watching },
  { name: 'Roblox API Connectivity', type: ActivityType.Watching },
  { name: 'PRC ER:LC Telemetry', type: ActivityType.Watching },
  { name: 'Community Suggestions Box', type: ActivityType.Listening },
  { name: 'Ticket Transcripts Archive', type: ActivityType.Watching },
  { name: 'Verified Citizen Badges', type: ActivityType.Watching },
  { name: 'NYPD Highway Patrol Interceptors', type: ActivityType.Playing },
  { name: 'State Police Tactical Team', type: ActivityType.Playing },
  { name: 'FDNY Ladder 101 Extrication', type: ActivityType.Playing },
  { name: 'ER:LC Roleplay Scenes', type: ActivityType.Watching },
  { name: 'Civilian Car Meet in Riverdale', type: ActivityType.Watching },
  { name: 'New York Skyline at Night', type: ActivityType.Watching },
  { name: 'Staff Support Voice Channels', type: ActivityType.Listening },
  { name: 'Radio Channel Dispatch Alpha', type: ActivityType.Listening },
  { name: 'Radio Channel TAC-2 Bravo', type: ActivityType.Listening },
  { name: 'Radio Channel TAC-3 Charlie', type: ActivityType.Listening },
  { name: 'High-Rank Directive Meetings', type: ActivityType.Listening },
  { name: 'ER:LC Server Boost Goals', type: ActivityType.Watching },
  { name: 'New York Roleplay Community', type: ActivityType.Watching },
  { name: '100% Secure Server Moderation', type: ActivityType.Watching },
  { name: 'The Best ERLC RP Experience', type: ActivityType.Playing }
];

class StatusManager {
  constructor() {
    this.currentIndex = 0;
    this.interval = null;
  }

  start(client, intervalSeconds = 30) {
    if (this.interval) clearInterval(this.interval);

    const updateStatus = () => {
      try {
        const guild = client.guilds.cache.first();
        const memberCount = guild ? guild.memberCount.toLocaleString() : '1,000+';

        const item = ACTIVITIES[this.currentIndex];
        const statusText = item.name.replace('{memberCount}', memberCount);

        client.user.setPresence({
          activities: [{ name: statusText, type: item.type }],
          status: 'online'
        });

        this.currentIndex = (this.currentIndex + 1) % ACTIVITIES.length;
      } catch (err) {
        console.error('Error updating bot status presence:', err);
      }
    };

    updateStatus();
    this.interval = setInterval(updateStatus, intervalSeconds * 1000);
  }

  stop() {
    if (this.interval) clearInterval(this.interval);
  }

  getActivitiesList() {
    return ACTIVITIES;
  }
}

module.exports = new StatusManager();
