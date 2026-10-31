const { EmbedBuilder } = require('discord.js');
const config = require('../../config');

/**
 * Category-specific banner overrides (fallback to global config)
 */
const categoryBanners = {
  tickets: {
    top: config.embed.topBannerUrl,
    bottom: config.embed.bottomBannerUrl
  },
  applications: {
    top: config.embed.topBannerUrl,
    bottom: config.embed.bottomBannerUrl
  },
  infractions: {
    top: config.embed.topBannerUrl,
    bottom: config.embed.bottomBannerUrl
  },
  promotions: {
    top: config.embed.topBannerUrl,
    bottom: config.embed.bottomBannerUrl
  },
  training: {
    top: config.embed.topBannerUrl,
    bottom: config.embed.bottomBannerUrl
  },
  departments: {
    top: config.embed.topBannerUrl,
    bottom: config.embed.bottomBannerUrl
  },
  sessions: {
    top: config.embed.topBannerUrl,
    bottom: config.embed.bottomBannerUrl
  },
  verification: {
    top: config.embed.topBannerUrl,
    bottom: config.embed.bottomBannerUrl
  },
  giveaways: {
    top: config.embed.topBannerUrl,
    bottom: config.embed.bottomBannerUrl
  },
  music: {
    top: null,
    bottom: null
  },
  moderation: {
    top: config.embed.topBannerUrl,
    bottom: config.embed.bottomBannerUrl
  },
  regulations: {
    top: config.embed.topBannerUrl,
    bottom: config.embed.bottomBannerUrl
  }
};

/**
 * Centralized Discord Embed Builder for New York Roleplay
 */
function createEmbed(options = {}) {
  const {
    title,
    description,
    fields = [],
    color = config.embed.color,
    footerText = config.embed.footerText,
    footerIconUrl = config.embed.footerIconUrl,
    timestamp = config.embed.timestamp,
    thumbnail,
    topBannerUrl,
    bottomBannerUrl,
    category,
    author
  } = options;

  const embed = new EmbedBuilder();

  // Set brand color
  embed.setColor(color);

  // Set author if provided
  if (author) {
    embed.setAuthor(typeof author === 'string' ? { name: author } : author);
  }

  // Set Title
  if (title) embed.setTitle(title);

  // Set Description
  if (description) embed.setDescription(description);

  // Set Fields
  if (Array.isArray(fields) && fields.length > 0) {
    embed.addFields(fields);
  }

  function isValidUrl(val) {
    if (!val || typeof val !== 'string') return false;
    return val.startsWith('http://') || val.startsWith('https://') || val.startsWith('attachment://');
  }

  // Set Thumbnail if provided
  if (thumbnail && isValidUrl(thumbnail)) {
    embed.setThumbnail(thumbnail);
  }

  // Set Top Image / Banner
  const chosenTop = topBannerUrl || (category && categoryBanners[category]?.top) || config.embed.topBannerUrl;
  if (chosenTop && isValidUrl(chosenTop)) {
    embed.setImage(chosenTop);
  }

  // Footer & Timestamp
  if (footerText) {
    embed.setFooter({
      text: footerText,
      ...(footerIconUrl && isValidUrl(footerIconUrl) ? { iconURL: footerIconUrl } : {})
    });
  }

  if (timestamp) {
    embed.setTimestamp(new Date());
  }

  return embed;
}

/**
 * Creates coordinated embeds array [mainEmbed, bottomBannerEmbed] so both top and bottom banners are never omitted
 */
function createEmbeds(options = {}) {
  const mainEmbed = createEmbed(options);
  const embeds = [mainEmbed];

  const chosenBottom = options.bottomBannerUrl || 
    (options.category && categoryBanners[options.category]?.bottom) || 
    config.embed.bottomBannerUrl;

  function isValidUrl(val) {
    if (!val || typeof val !== 'string') return false;
    return val.startsWith('http://') || val.startsWith('https://') || val.startsWith('attachment://');
  }

  // If bottom banner is configured and distinct, attach secondary coordinated banner embed
  if (chosenBottom && isValidUrl(chosenBottom) && chosenBottom !== (options.topBannerUrl || config.embed.topBannerUrl)) {
    const bottomEmbed = new EmbedBuilder()
      .setColor(options.color || config.embed.color)
      .setImage(chosenBottom);
    embeds.push(bottomEmbed);
  }

  return embeds;
}

function successEmbed(title, description, options = {}) {
  return createEmbed({
    title: `✅ ${title}`,
    description,
    color: 0x2ECC71,
    ...options
  });
}

function errorEmbed(title, description, options = {}) {
  return createEmbed({
    title: `❌ ${title}`,
    description,
    color: 0xE63946,
    ...options
  });
}

function warningEmbed(title, description, options = {}) {
  return createEmbed({
    title: `⚠️ ${title}`,
    description,
    color: 0xF1C40F,
    ...options
  });
}

function infoEmbed(title, description, options = {}) {
  return createEmbed({
    title: `ℹ️ ${title}`,
    description,
    color: config.embed.color,
    ...options
  });
}

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const s = Math.floor(seconds);
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function parseDurationToSeconds(durationStr) {
  if (!durationStr || typeof durationStr !== 'string') return 195;
  if (durationStr.toLowerCase().includes('live')) return 0;
  const parts = durationStr.split(':').map(Number);
  if (parts.length === 3) {
    return (parts[0] * 3600) + (parts[1] * 60) + parts[2];
  } else if (parts.length === 2) {
    return (parts[0] * 60) + parts[1];
  }
  return parseInt(durationStr, 10) || 195;
}

function generateProgressBar(currentSec, totalSec, length = 12) {
  if (!totalSec || totalSec <= 0) {
    return '🔘' + '▬'.repeat(length - 1) + ' `[LIVE STREAM]`';
  }
  const ratio = Math.min(Math.max(currentSec / totalSec, 0), 1);
  const dotIndex = Math.min(Math.floor(ratio * length), length - 1);
  let bar = '';
  for (let i = 0; i < length; i++) {
    if (i === dotIndex) {
      bar += '🔘';
    } else {
      bar += '▬';
    }
  }
  return `${bar} \`${formatTime(currentSec)} / ${formatTime(totalSec)}\``;
}

/**
 * Ultra-clean, sleek Rich Embed for Rolonbot Music.
 * Explicitly designed with NO top banner and NO bottom banner.
 * Features YouTube/Spotify styling, progress bar, album thumbnail, and clean fields.
 */
function createMusicEmbed(options = {}) {
  const {
    title,
    url,
    description,
    fields = [],
    color = 0x1DB954, // Modern Spotify / Rolonbot Green
    thumbnail,
    author = { name: 'Rolonbot • Music Engine', iconURL: 'https://cdn-icons-png.flaticon.com/512/3844/3844724.png' },
    footerText = 'Rolonbot • High-Fidelity Audio',
    footerIconUrl = 'https://cdn-icons-png.flaticon.com/512/3844/3844724.png',
    timestamp = false
  } = options;

  const embed = new EmbedBuilder();
  embed.setColor(color);

  if (author) {
    embed.setAuthor(typeof author === 'string' ? { name: author } : author);
  }

  if (title) {
    embed.setTitle(title);
    if (url) embed.setURL(url);
  }

  if (description) embed.setDescription(description);

  if (Array.isArray(fields) && fields.length > 0) {
    embed.addFields(fields);
  }

  function isValidUrl(val) {
    if (!val || typeof val !== 'string') return false;
    return val.startsWith('http://') || val.startsWith('https://');
  }

  if (thumbnail && isValidUrl(thumbnail)) {
    embed.setThumbnail(thumbnail);
  }

  if (footerText) {
    embed.setFooter({
      text: footerText,
      ...(footerIconUrl && isValidUrl(footerIconUrl) ? { iconURL: footerIconUrl } : {})
    });
  }

  if (timestamp) {
    embed.setTimestamp(new Date());
  }

  // Explicitly NO top banner (image) and NO bottom banner
  return embed;
}

module.exports = {
  createEmbed,
  createEmbeds,
  createMusicEmbed,
  generateProgressBar,
  formatTime,
  parseDurationToSeconds,
  successEmbed,
  errorEmbed,
  warningEmbed,
  infoEmbed,
  categoryBanners
};
