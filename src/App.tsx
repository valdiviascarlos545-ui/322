import React, { useState, useMemo, useEffect } from 'react';
import {
  Shield,
  Activity,
  Terminal,
  Database,
  Radio,
  Search,
  CheckCircle,
  Copy,
  Check,
  Server,
  Zap,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp,
  Music,
  Play,
  Pause,
  SkipForward,
  Square,
  Repeat,
  Shuffle,
  Volume2,
  VolumeX,
  Volume1,
  ListMusic,
  FileText,
  Sparkles,
  ExternalLink,
  Flame,
  Info,
  Sliders,
  CheckCheck
} from 'lucide-react';
import { COMMANDS_CATALOG } from './data/commandsList';

interface CuratedTrack {
  title: string;
  artist: string;
  duration: string;
  durationSec: number;
  url: string;
  thumbnail: string;
  lyricsPreview: string;
}

interface CuratedPlaylist {
  id: string;
  name: string;
  icon: string;
  tagline: string;
  tracks: CuratedTrack[];
}

const CURATED_PLAYLISTS: Record<string, CuratedPlaylist> = {
  hiphop_rap: {
    id: 'hiphop_rap',
    name: 'Hip-Hop & Rap Heavyweights',
    icon: '🎤',
    tagline: 'Drake, Travis Scott, Kendrick Lamar, 21 Savage, Central Cee',
    tracks: [
      {
        title: "God's Plan",
        artist: 'Drake',
        duration: '3:19',
        durationSec: 199,
        url: 'https://www.youtube.com/watch?v=xpVfcZ0ZcFM',
        thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
        lyricsPreview: `[Chorus]
God's plan, God's plan
I hold back, sometimes I won't, yuh
I feel good, sometimes I don't, ayy, don't
I finessed down Weston Road, ayy, 'nessed
Might go down a G.O.D., yuh, wait
I go hard on Southside G, yuh, wait
I make sure that north-side eat...`
      },
      {
        title: 'FE!N',
        artist: 'Travis Scott ft. Playboi Carti',
        duration: '3:11',
        durationSec: 191,
        url: 'https://www.youtube.com/watch?v=B9synWjqBn8',
        thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
        lyricsPreview: `[Chorus: Travis Scott]
FE!N, FE!N, FE!N, FE!N, FE!N (Yeah)
FE!N, FE!N, FE!N, FE!N, FE!N (Yeah)
FE!N, FE!N, FE!N, FE!N, FE!N
FE!N, FE!N (Yeah), FE!N...`
      },
      {
        title: 'Not Like Us',
        artist: 'Kendrick Lamar',
        duration: '4:34',
        durationSec: 274,
        url: 'https://www.youtube.com/watch?v=H58vbez_m4E',
        thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=600&q=80',
        lyricsPreview: `[Chorus]
They not like us, they not like us, they not like us
Certified Lover Boy? Certified pedophiles
WOP, WOP, WOP, WOP, WOP, Dot, fuck 'em up
Tryna strike a chord and it's probably A-minor...`
      },
      {
        title: 'redrum',
        artist: '21 Savage',
        duration: '4:30',
        durationSec: 270,
        url: 'https://www.youtube.com/watch?v=c_xO4dM8z7Q',
        thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80',
        lyricsPreview: `[Chorus: 21 Savage]
Redrum, redrum, redrum, redrum
Can't talk on the phone, I got too much bread
Niggas think it's sweet 'til they see the red
Whole team ten toes down in the trenches...`
      },
      {
        title: 'Doja',
        artist: 'Central Cee',
        duration: '1:37',
        durationSec: 97,
        url: 'https://www.youtube.com/watch?v=_vx1OV0443k',
        thumbnail: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=600&q=80',
        lyricsPreview: `[Chorus]
How can I be homophobic? My bitch is gay
Hit man in the top with a shh, wait, what?
Somebody tell Doja Cat that I'm tryna indulge in that...`
      }
    ]
  },
  lofi_chill: {
    id: 'lofi_chill',
    name: 'Lo-Fi Chill Beats & Study Lounge',
    icon: '☕',
    tagline: 'Relaxing study beats, midnight chillhop, rainy cafe',
    tracks: [
      {
        title: 'Coffee in the Rain',
        artist: 'Lofi Girl / ChilledCow',
        duration: '3:45',
        durationSec: 225,
        url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
        thumbnail: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=600&q=80',
        lyricsPreview: `[Instrumental Track]
Relaxing low-fidelity hip-hop beats with vinyl static and gentle ambient rain.`
      },
      {
        title: 'Tokyo Midnight Lights',
        artist: 'Kudasaibeats',
        duration: '2:58',
        durationSec: 178,
        url: 'https://www.youtube.com/watch?v=5qap5aO4i9A',
        thumbnail: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
        lyricsPreview: `[Instrumental Track]
Mellow electric piano chords with smooth sub-bass and Tokyo night atmosphere.`
      }
    ]
  },
  billboard_top: {
    id: 'billboard_top',
    name: 'Billboard Hot 100 Charts',
    icon: '🏆',
    tagline: 'Today’s top-streamed songs across Spotify & Apple Music',
    tracks: [
      {
        title: 'Blinding Lights',
        artist: 'The Weeknd',
        duration: '3:20',
        durationSec: 200,
        url: 'https://www.youtube.com/watch?v=4NRXx6U8ABQ',
        thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
        lyricsPreview: `[Chorus]
I said, ooh, I'm blinded by the lights
No, I can't sleep until I feel your touch
I said, ooh, I'm drowning in the night
Oh, when I'm like this, you're the one I trust...`
      },
      {
        title: 'Circles',
        artist: 'Post Malone',
        duration: '3:35',
        durationSec: 215,
        url: 'https://www.youtube.com/watch?v=wXhTHyIgQ_U',
        thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=600&q=80',
        lyricsPreview: `[Chorus]
Seasons change and our love went cold
Feed the flame 'cause we can't let go
Run away, but we're runnin' round in circles...`
      }
    ]
  },
  trap_drill: {
    id: 'trap_drill',
    name: 'Trap & NYC Drill Essentials',
    icon: '⚡',
    tagline: 'Pop Smoke, Fivio Foreign, heavy 808 slides and subwoofers',
    tracks: [
      {
        title: 'Dior',
        artist: 'Pop Smoke',
        duration: '3:36',
        durationSec: 216,
        url: 'https://www.youtube.com/watch?v=oorvWw05xCo',
        thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
        lyricsPreview: `[Chorus]
Said I'm never lackin', always pistol packin'
With them automatics, we gon' send 'em to heaven
Wait, huh, what? (Christian Dior, Dior)...`
      },
      {
        title: 'Big Drip',
        artist: 'Fivio Foreign',
        duration: '2:48',
        durationSec: 168,
        url: 'https://www.youtube.com/watch?v=vVj_pP6C_9M',
        thumbnail: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
        lyricsPreview: `[Chorus]
Big drip, ayy, ayy, big drip
Call up the shooter, he come in a minute
Walk in the spot, everybody lookin'...`
      }
    ]
  },
  gaming_edm: {
    id: 'gaming_edm',
    name: 'Gaming & Cyberpunk Phonk',
    icon: '🎮',
    tagline: 'Drift phonk, synthesizer, high octane bass adrenaline',
    tracks: [
      {
        title: 'METAMORPHOSIS',
        artist: 'INTERWORLD',
        duration: '2:23',
        durationSec: 143,
        url: 'https://www.youtube.com/watch?v=uT3w6g_b6z4',
        thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
        lyricsPreview: `[High Energy Drift Phonk Track]
Heavy cowbell melodies, distorted 808 bass, and dark cybernetic driving phonk.`
      }
    ]
  },
  rnb_vibes: {
    id: 'rnb_vibes',
    name: 'R&B & Late Night Melodies',
    icon: '🌙',
    tagline: 'SZA, Frank Ocean, Brent Faiyaz, smooth nocturnal vibes',
    tracks: [
      {
        title: 'Snooze',
        artist: 'SZA',
        duration: '3:21',
        durationSec: 201,
        url: 'https://www.youtube.com/watch?v=LDY_Xa85-80',
        thumbnail: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=600&q=80',
        lyricsPreview: `[Chorus]
I can't lose when I'm with you
How can I snooze and miss the moment?
You just too important, nobody do body like you do...`
      }
    ]
  }
};

function formatSeconds(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showCommands, setShowCommands] = useState<boolean>(true);

  // Music Simulator State
  const [activePlaylistKey, setActivePlaylistKey] = useState<string>('hiphop_rap');
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTimeSec, setCurrentTimeSec] = useState<number>(74); // 01:14
  const [volume, setVolume] = useState<number>(80);
  const [loopMode, setLoopMode] = useState<'off' | 'track' | 'queue'>('off');
  const [showLyricsModal, setShowLyricsModal] = useState<boolean>(false);
  const [showQueueModal, setShowQueueModal] = useState<boolean>(false);
  const [quickPlayInput, setQuickPlayInput] = useState<string>('');

  const currentPlaylist = CURATED_PLAYLISTS[activePlaylistKey];
  const currentTrack = currentPlaylist.tracks[currentTrackIndex] || currentPlaylist.tracks[0];
  const upcomingQueue = currentPlaylist.tracks.slice(currentTrackIndex + 1);

  // Timer ticker for live progress bar
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTimeSec(prev => {
          if (prev >= currentTrack.durationSec) {
            // Auto skip or loop
            if (loopMode === 'track') return 0;
            if (currentTrackIndex + 1 < currentPlaylist.tracks.length) {
              setCurrentTrackIndex(i => i + 1);
              return 0;
            } else if (loopMode === 'queue') {
              setCurrentTrackIndex(0);
              return 0;
            } else {
              setIsPlaying(false);
              return currentTrack.durationSec;
            }
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTrack, currentTrackIndex, loopMode, currentPlaylist]);

  // Categories list
  const categories = useMemo(() => {
    const list = Array.from(new Set(COMMANDS_CATALOG.map(c => c.category)));
    return ['All', ...list];
  }, []);

  const filteredCommands = useMemo(() => {
    return COMMANDS_CATALOG.filter(c => {
      const matchesCat = selectedCategory === 'All' || c.category === selectedCategory;
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleNextTrack = () => {
    if (currentTrackIndex + 1 < currentPlaylist.tracks.length) {
      setCurrentTrackIndex(prev => prev + 1);
      setCurrentTimeSec(0);
      setIsPlaying(true);
    } else {
      setCurrentTrackIndex(0);
      setCurrentTimeSec(0);
      setIsPlaying(true);
    }
  };

  const handleStop = () => {
    setIsPlaying(false);
    setCurrentTimeSec(0);
  };

  const handleLoopCycle = () => {
    if (loopMode === 'off') setLoopMode('track');
    else if (loopMode === 'track') setLoopMode('queue');
    else setLoopMode('off');
  };

  const handleQuickPlay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPlayInput.trim()) return;
    const input = quickPlayInput.toLowerCase();

    // Check if matched artist or track
    if (input.includes('travis') || input.includes('fein')) {
      setActivePlaylistKey('hiphop_rap');
      setCurrentTrackIndex(1);
    } else if (input.includes('kendrick') || input.includes('not like us')) {
      setActivePlaylistKey('hiphop_rap');
      setCurrentTrackIndex(2);
    } else if (input.includes('21') || input.includes('redrum')) {
      setActivePlaylistKey('hiphop_rap');
      setCurrentTrackIndex(3);
    } else if (input.includes('central cee') || input.includes('doja')) {
      setActivePlaylistKey('hiphop_rap');
      setCurrentTrackIndex(4);
    } else if (input.includes('lofi') || input.includes('chill') || input.includes('study')) {
      setActivePlaylistKey('lofi_chill');
      setCurrentTrackIndex(0);
    } else if (input.includes('billboard') || input.includes('weeknd')) {
      setActivePlaylistKey('billboard_top');
      setCurrentTrackIndex(0);
    } else if (input.includes('drill') || input.includes('pop smoke')) {
      setActivePlaylistKey('trap_drill');
      setCurrentTrackIndex(0);
    } else {
      // Default to God's plan or first track
      setActivePlaylistKey('hiphop_rap');
      setCurrentTrackIndex(0);
    }
    setCurrentTimeSec(0);
    setIsPlaying(true);
    setQuickPlayInput('');
  };

  // Generate ASCII YouTube progress bar
  const progressPercent = Math.min(1, Math.max(0, currentTimeSec / currentTrack.durationSec));
  const barLength = 14;
  const dotIndex = Math.min(Math.floor(progressPercent * barLength), barLength - 1);
  const progressBarAscii = useMemo(() => {
    let out = '';
    for (let i = 0; i < barLength; i++) {
      if (i === dotIndex) out += '🔘';
      else out += '▬';
    }
    return out;
  }, [dotIndex]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Banner Bar */}
      <div className="h-1 bg-gradient-to-r from-emerald-500 via-blue-600 to-indigo-500"></div>

      {/* Main Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
              <Music className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                  <span>ROLONBOT</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold font-mono">
                    v14.0
                  </span>
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  OPERATIONAL & READY
                </span>
              </div>
              <p className="text-xs text-slate-400">High-Fidelity Music Engine & Discord Server Operations</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => copyToClipboard('npm start', 'quick-start')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-colors shadow"
            >
              {copiedKey === 'quick-start' ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>npm start</span>
            </button>
            <button
              onClick={() => copyToClipboard('/play query:Drake', 'play-copy')}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow shadow-emerald-600/20"
            >
              <Music className="w-3.5 h-3.5" />
              <span>/play</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ========================================================================= */}
        {/* SECTION 1: DIRECT ANSWER - DUAL BANNERS VS NO BANNER BREAKDOWN */}
        {/* ========================================================================= */}
        <section className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-7 shadow-xl space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold mb-1.5">
                <Info className="w-3.5 h-3.5" />
                <span>BANNER CONFIGURATION BREAKDOWN</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Which Commands Have Dual Banners (Top & Bottom) vs. No Banners?
              </h2>
            </div>
            <div className="text-xs text-slate-400 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800 font-mono">
              Role: System Standard v14
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Box 1: Dual Top & Bottom Banners */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-blue-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse"></span>
                  <h3 className="text-sm font-bold text-blue-300">Commands With Dual Banners (Top & Bottom)</h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Operational & Admin
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                All server governance, staff management, tickets, and community moderation use coordinated top & bottom image banners:
              </p>
              <ul className="text-xs text-slate-400 space-y-1.5">
                <li className="flex items-center gap-2">
                  <CheckCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span><strong>Tickets:</strong> /ticket-panel, /ticket-transcript, /ticket-claim</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span><strong>Staff Applications:</strong> /application-panel, 15-question DM questionnaires</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span><strong>Internal Affairs:</strong> /infraction, /strike, /warning, /investigation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span><strong>Promotions & Departments:</strong> /promote, /demote, /department-panel</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span><strong>Training, Sessions & Verification:</strong> /training-create, /verify-panel</span>
                </li>
              </ul>
            </div>

            {/* Box 2: Music Bot - Zero Banners, Clean Rich Embed */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-emerald-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <h3 className="text-sm font-bold text-emerald-300">Rolonbot Music Bot — NO Top or Bottom Banners</h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Clean Rich Embed
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                As requested, <strong>all music commands have ZERO top or bottom image banners</strong>! They use a professional YouTube/Spotify Rich Embed:
              </p>
              <ul className="text-xs text-slate-400 space-y-1.5">
                <li className="flex items-center gap-2">
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span><strong>No Banner Clutter:</strong> Clean Spotify-green/dark embed with album thumbnail art.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span><strong>YouTube Time Bar:</strong> Perfect scrubber indicator <code className="text-emerald-300 font-mono">🔘▬▬▬▬▬▬▬▬ 01:23 / 03:45</code></span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span><strong>Interactive Buttons:</strong> Play/Pause, Skip, Stop, Vol -10%, Vol +10%, Loop, Genius Lyrics, Queue.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span><strong>Rapper & URL Search:</strong> Just type rapper name or song name (e.g. <code className="text-emerald-300 font-mono">/play drake</code>).</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span><strong>6 Hot Playlists:</strong> Curated presets for Rap, Lo-Fi, Billboard, Drill, EDM & R&B!</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 2: LIVE ROLONBOT MUSIC PLAYER & RICH EMBED SIMULATOR */}
        {/* ========================================================================= */}
        <section className="rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-2">
                <Flame className="w-3.5 h-3.5" />
                <span>HIGH-FIDELITY AUDIO CONSOLE</span>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Rolonbot Live Discord Embed Player</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                Test the actual Rich Embed, YouTube-style progress bar, rapper search, interactive buttons, Genius lyrics, and 6 curated playlists.
              </p>
            </div>

            {/* Quick Play Search Bar */}
            <form onSubmit={handleQuickPlay} className="flex items-center gap-2 max-w-md w-full">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Type rapper name or song (e.g. Drake, Travis Scott)..."
                  value={quickPlayInput}
                  onChange={e => setQuickPlayInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <button
                type="submit"
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 shadow shadow-emerald-600/30"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>/play</span>
              </button>
            </form>
          </div>

          {/* 6 Curated Playlists Selector Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <ListMusic className="w-3.5 h-3.5 text-emerald-400" />
                <span>6 Curated Hot Playlists (/playlist curated):</span>
              </span>
              <span>Click any preset to stream</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {Object.values(CURATED_PLAYLISTS).map(p => {
                const isActive = activePlaylistKey === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setActivePlaylistKey(p.id);
                      setCurrentTrackIndex(0);
                      setCurrentTimeSec(0);
                      setIsPlaying(true);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isActive
                        ? 'bg-emerald-500/15 border-emerald-500/60 shadow-lg shadow-emerald-500/10'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="text-base mb-1">{p.icon}</div>
                    <div className={`text-xs font-bold leading-tight ${isActive ? 'text-emerald-300' : 'text-slate-200'}`}>
                      {p.name.split(' ')[0]} {p.name.split(' ')[1] || ''}
                    </div>
                    <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                      {p.tracks.length} tracks
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* THE DISCORD RICH EMBED (PRO LEVEL - NO TOP/BOTTOM BANNER) */}
          <div className="p-4 sm:p-5 rounded-xl bg-[#2b2d31] border border-slate-700/60 max-w-3xl mx-auto shadow-2xl space-y-4">
            {/* Embed Header / Author */}
            <div className="flex items-center justify-between border-b border-slate-700/40 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Music className="w-3 h-3" />
                </div>
                <span className="text-xs font-semibold text-slate-300">Rolonbot • Music Engine</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                No Banners • High-Fidelity
              </span>
            </div>

            {/* Embed Content with Thumbnail */}
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <h3 className="text-base sm:text-lg font-bold text-white hover:text-emerald-400 cursor-pointer transition-colors flex items-center gap-1.5">
                  <span>🎶 Now Playing: {currentTrack.title}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </h3>
                <div className="text-xs text-slate-300 space-y-0.5">
                  <div><strong>Artist:</strong> <span className="text-emerald-300">{currentTrack.artist}</span></div>
                  <div><strong>Requested By:</strong> <span className="text-blue-300">@CitizenDJ</span></div>
                </div>

                {/* THE YOUTUBE TIME BAR */}
                <div className="pt-2 space-y-1">
                  <div className="font-mono text-sm sm:text-base text-emerald-400 tracking-wider font-semibold select-none">
                    {progressBarAscii}
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>{formatSeconds(currentTimeSec)}</span>
                    <span className="text-emerald-400 font-bold">{isPlaying ? '▶️ STREAMING' : '⏸️ PAUSED'}</span>
                    <span>{currentTrack.duration}</span>
                  </div>
                </div>

                {/* Up Next & Status Indicators */}
                <div className="pt-2 text-xs text-slate-400 space-y-1 border-t border-slate-700/40">
                  <div>
                    <strong>⏭️ Up Next:</strong>{' '}
                    {upcomingQueue.length > 0 ? (
                      <span className="text-slate-200">
                        {upcomingQueue[0].title} by {upcomingQueue[0].artist} (<code className="text-emerald-400 font-mono">{upcomingQueue[0].duration}</code>)
                      </span>
                    ) : (
                      <span className="italic text-slate-500">End of queue</span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-300">
                    <span>🔊 Volume: <strong className="text-emerald-400 font-mono">{volume}%</strong></span>
                    <span>•</span>
                    <span>🔁 Loop: <strong className="text-amber-400 font-mono">{loopMode.toUpperCase()}</strong></span>
                    <span>•</span>
                    <span>🔀 Queue Size: <strong className="text-blue-400 font-mono">{currentPlaylist.tracks.length} tracks</strong></span>
                  </div>
                </div>
              </div>

              {/* Album Art / Thumbnail */}
              <div className="shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden border border-slate-700 shadow-lg relative group">
                <img
                  src={currentTrack.thumbnail}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none">
                  {isPlaying ? (
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></div>
                  ) : null}
                </div>
              </div>
            </div>

            {/* INTERACTIVE CONTROLS ROW 1: PLAYBACK */}
            <div className="pt-2 space-y-2">
              <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`py-2 px-2 sm:px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                    isPlaying
                      ? 'bg-slate-700 hover:bg-slate-600 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                  title={isPlaying ? 'Pause' : 'Resume'}
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  <span className="hidden sm:inline">{isPlaying ? 'Pause' : 'Resume'}</span>
                </button>

                <button
                  onClick={handleNextTrack}
                  className="py-2 px-2 sm:px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  title="Skip to next track"
                >
                  <SkipForward className="w-3.5 h-3.5 fill-current" />
                  <span className="hidden sm:inline">Skip</span>
                </button>

                <button
                  onClick={handleStop}
                  className="py-2 px-2 sm:px-3 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  title="Stop and clear queue"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span className="hidden sm:inline">Stop</span>
                </button>

                <button
                  onClick={handleLoopCycle}
                  className={`py-2 px-2 sm:px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                    loopMode !== 'off'
                      ? 'bg-amber-600 hover:bg-amber-500 text-white'
                      : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                  }`}
                  title="Cycle loop mode (off -> track -> queue)"
                >
                  <Repeat className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{loopMode === 'off' ? 'Loop' : loopMode.toUpperCase()}</span>
                </button>

                <button
                  onClick={() => {
                    // Randomize track in current playlist
                    const next = Math.floor(Math.random() * currentPlaylist.tracks.length);
                    setCurrentTrackIndex(next);
                    setCurrentTimeSec(0);
                    setIsPlaying(true);
                  }}
                  className="py-2 px-2 sm:px-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  title="Shuffle queue"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Shuffle</span>
                </button>
              </div>

              {/* INTERACTIVE CONTROLS ROW 2: AUDIO & EXTRAS */}
              <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                <button
                  onClick={() => setVolume(v => Math.max(0, v - 10))}
                  className="py-2 px-2 sm:px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors border border-slate-700"
                  title="Decrease volume by 10%"
                >
                  <Volume1 className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden sm:inline">Vol -10%</span>
                  <span className="sm:hidden">-10</span>
                </button>

                <button
                  onClick={() => setVolume(v => Math.min(100, v + 10))}
                  className="py-2 px-2 sm:px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors border border-slate-700"
                  title="Increase volume by 10%"
                >
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Vol +10%</span>
                  <span className="sm:hidden">+10</span>
                </button>

                <button
                  onClick={() => setShowQueueModal(true)}
                  className="py-2 px-2 sm:px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors border border-slate-700"
                  title="View full music queue"
                >
                  <ListMusic className="w-3.5 h-3.5 text-blue-400" />
                  <span className="hidden sm:inline">Queue ({currentPlaylist.tracks.length})</span>
                  <span className="sm:hidden">Queue</span>
                </button>

                <button
                  onClick={() => setShowLyricsModal(true)}
                  className="py-2 px-2 sm:px-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors border border-amber-500/40"
                  title="Fetch lyrics via Genius API"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Genius Lyrics</span>
                  <span className="sm:hidden">Lyrics</span>
                </button>

                <button
                  onClick={() => {
                    const keys = Object.keys(CURATED_PLAYLISTS);
                    const nextKeyIdx = (keys.indexOf(activePlaylistKey) + 1) % keys.length;
                    setActivePlaylistKey(keys[nextKeyIdx]);
                    setCurrentTrackIndex(0);
                    setCurrentTimeSec(0);
                  }}
                  className="py-2 px-2 sm:px-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors border border-emerald-500/40"
                  title="Cycle 6 Playlists"
                >
                  <ListMusic className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Playlists (6)</span>
                  <span className="sm:hidden">Lists</span>
                </button>
              </div>
            </div>

            {/* Embed Footer */}
            <div className="pt-2 text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-700/40">
              <span>Rolonbot • High-Fidelity Audio • Verified Genius Service</span>
              <span>Bitrate: 384kbps Stereo</span>
            </div>
          </div>

          {/* Quick Rapper Search Shortcuts */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-slate-400 font-medium">Quick Rapper Queries:</span>
            {[
              { label: '🎤 Drake - God\'s Plan', query: 'Drake Gods Plan' },
              { label: '🔥 Travis Scott - FE!N', query: 'Travis Scott FEIN' },
              { label: '👑 Kendrick Lamar - Not Like Us', query: 'Kendrick Lamar Not Like Us' },
              { label: '🔪 21 Savage - redrum', query: '21 Savage redrum' },
              { label: '🇬🇧 Central Cee - Doja', query: 'Central Cee Doja' },
              { label: '☕ Lo-Fi Study Beats', query: 'Lo-Fi Chill' },
              { label: '💨 Pop Smoke - Dior', query: 'Pop Smoke Dior' }
            ].map(item => (
              <button
                key={item.label}
                onClick={() => {
                  setQuickPlayInput(item.query);
                  // Trigger play
                  if (item.query.includes('Travis')) {
                    setActivePlaylistKey('hiphop_rap');
                    setCurrentTrackIndex(1);
                  } else if (item.query.includes('Kendrick')) {
                    setActivePlaylistKey('hiphop_rap');
                    setCurrentTrackIndex(2);
                  } else if (item.query.includes('21')) {
                    setActivePlaylistKey('hiphop_rap');
                    setCurrentTrackIndex(3);
                  } else if (item.query.includes('Central')) {
                    setActivePlaylistKey('hiphop_rap');
                    setCurrentTrackIndex(4);
                  } else if (item.query.includes('Lo-Fi')) {
                    setActivePlaylistKey('lofi_chill');
                    setCurrentTrackIndex(0);
                  } else if (item.query.includes('Pop')) {
                    setActivePlaylistKey('trap_drill');
                    setCurrentTrackIndex(0);
                  } else {
                    setActivePlaylistKey('hiphop_rap');
                    setCurrentTrackIndex(0);
                  }
                  setCurrentTimeSec(0);
                  setIsPlaying(true);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs transition-colors flex items-center gap-1"
              >
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* GENIUS LYRICS MODAL */}
        {showLyricsModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
              <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-500/20 to-slate-900 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-bold">
                    G
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                      <span>Genius API Verified Lyrics</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">Live</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      {currentTrack.title} by {currentTrack.artist}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowLyricsModal(false)}
                  className="text-slate-400 hover:text-white px-2 py-1 rounded text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="p-5 overflow-y-auto font-sans text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950/60 flex-1">
                {currentTrack.lyricsPreview}
              </div>

              <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <a
                  href={`https://genius.com/search?q=${encodeURIComponent(`${currentTrack.artist} ${currentTrack.title}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-amber-400 hover:underline flex items-center gap-1"
                >
                  <span>Open Full Annotated Lyrics on Genius.com</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  onClick={() => setShowLyricsModal(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* QUEUE MODAL */}
        {showQueueModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Music Queue (/queue)</h3>
                  <p className="text-xs text-slate-400">{currentPlaylist.name} ({currentPlaylist.tracks.length} tracks)</p>
                </div>
                <button
                  onClick={() => setShowQueueModal(false)}
                  className="text-slate-400 hover:text-white px-2 py-1 rounded text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="p-4 overflow-y-auto space-y-2 bg-slate-950/60 flex-1">
                {currentPlaylist.tracks.map((t, i) => {
                  const isCurrent = i === currentTrackIndex;
                  return (
                    <div
                      key={t.title + i}
                      onClick={() => {
                        setCurrentTrackIndex(i);
                        setCurrentTimeSec(0);
                        setIsPlaying(true);
                        setShowQueueModal(false);
                      }}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                        isCurrent
                          ? 'bg-emerald-500/20 border-emerald-500/50 text-white'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs w-5 text-center text-slate-400">
                          {isCurrent ? '▶️' : `${i + 1}.`}
                        </span>
                        <div>
                          <div className="font-semibold text-xs text-slate-100">{t.title}</div>
                          <div className="text-[11px] text-slate-400">{t.artist}</div>
                        </div>
                      </div>
                      <div className="text-xs font-mono text-slate-400">{t.duration}</div>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 bg-slate-900 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => setShowQueueModal(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 3: ALL 111 SLASH COMMANDS EXPLORER */}
        {/* ========================================================================= */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Terminal className="w-5 h-5 text-emerald-400" />
                <span>All {COMMANDS_CATALOG.length} Rolonbot Slash Commands</span>
              </h3>
              <p className="text-xs text-slate-400">
                17 Music commands, 13 Utility/Moderation commands, plus complete enterprise roleplay server management.
              </p>
            </div>

            <button
              onClick={() => setShowCommands(!showCommands)}
              className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 font-medium flex items-center gap-1.5 transition-colors"
            >
              {showCommands ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              <span>{showCommands ? 'Hide Commands' : 'View Commands Catalog'}</span>
            </button>
          </div>

          {showCommands && (
            <div className="space-y-4">
              {/* Filter controls */}
              <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search any command name, parameters, or description..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                        selectedCategory === cat
                          ? 'bg-emerald-600 text-white shadow shadow-emerald-600/30'
                          : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                      }`}
                    >
                      {cat === 'Music System' ? '🎵 Music Suite (17)' : cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Commands Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredCommands.map(cmd => {
                  const isMusicCmd = cmd.category === 'Music System';
                  return (
                    <div
                      key={cmd.name}
                      className={`rounded-xl p-4 transition-all border ${
                        isMusicCmd
                          ? 'bg-slate-900/90 border-emerald-500/30 hover:border-emerald-500/60 shadow-lg shadow-emerald-500/5'
                          : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                      } flex flex-col justify-between space-y-3`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className={`font-mono text-sm font-bold flex items-center gap-1 ${isMusicCmd ? 'text-emerald-400' : 'text-blue-400'}`}>
                            <span>/{cmd.name}</span>
                          </span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            isMusicCmd
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}>
                            {cmd.permission}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{cmd.description}</p>
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 text-[11px]">
                        <span className="text-slate-400 font-mono">
                          {isMusicCmd ? 'No Banners' : 'Dual Banners'}
                        </span>
                        <button
                          onClick={() => copyToClipboard(`/${cmd.name}`, `cmd-${cmd.name}`)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1 transition-colors font-mono"
                        >
                          {copiedKey === `cmd-${cmd.name}` ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>Copy</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* Global Architecture Summary Footer */}
        <footer className="pt-6 border-t border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <strong>Rolonbot</strong> • Production Discord.js v14 & ER:LC Operations Suite
          </div>
          <div className="flex items-center gap-4">
            <span>Genius API: <strong className="text-emerald-400">Connected</strong></span>
            <span>Audio Player: <strong className="text-blue-400">@discordjs/voice</strong></span>
            <span>Total Commands: <strong className="text-white font-mono">{COMMANDS_CATALOG.length}</strong></span>
          </div>
        </footer>
      </main>
    </div>
  );
}
