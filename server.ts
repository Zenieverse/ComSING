import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import {
  getVocalCoachingFeedback,
  getMusicCompanionChatResponse,
  getAIStageGenerationDescription,
} from "./server/gemini.js"; // Use .js extension or standard ESM resolve

// Preset Songs Library
const SONG_LIBRARY = [
  {
    id: "s1",
    title: "Dynamic Spark",
    artist: "Kai Shin",
    composer: "Park Soo-bin",
    lyricist: "Kim Min-ji",
    vibe: "Energetic K-Pop",
    difficulty: "Medium",
    genre: "K-Pop",
    range: "D3-A4",
    tempo: 124,
    description: "Catchy synth lines with hyper-focused rhythm beats. Ideal for rapid transitions.",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    lyrics: [
      "[0:00] Spark in the neon shadows...",
      "[0:04] We hit the rhythm faster than light...",
      "[0:08] Catch me if you can, let it glow tonight!",
      "[0:12] High frequencies in the skyline...",
      "[0:16] ComSing with me, the world is on fire!",
      "[0:20] Burn bright, starry night, we rise!"
    ],
    duetParts: [
      { sender: "idol", text: "Spark in the neon shadows...", part: "Idol Only" },
      { sender: "user", text: "We hit the rhythm faster than light...", part: "User Only" },
      { sender: "both", text: "Catch me if you can, let it glow tonight!", part: "Harmonized" },
      { sender: "idol", text: "High frequencies in the skyline...", part: "Idol Only" },
      { sender: "user", text: "ComSing with me, the world is on fire...", part: "User Only" },
      { sender: "both", text: "Burn bright, starry night, we rise!", part: "Harmonized" }
    ],
    audioWaveform: [30, 45, 60, 40, 50, 70, 85, 90, 60, 40, 55, 65, 80, 95, 100, 85, 70, 50, 30],
  },
  {
    id: "s2",
    title: "Cyber Ether",
    artist: "Luna Vance",
    composer: "Trent Reznor",
    lyricist: "Luna Vance",
    vibe: "Ethereal Synthpop",
    difficulty: "Hard",
    genre: "Synthpop / Dream Pop",
    range: "F3-C5",
    tempo: 110,
    description: "Sweeping reverbs and long airy vowels. Demands excellent breath-holding dynamics.",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    lyrics: [
      "[0:00] Floating inside the signal grid...",
      "[0:05] Tell me what you see in the cloud...",
      "[0:10] I hear your whisper and it echo out...",
      "[0:15] Synthesized emotions taking shape...",
      "[0:20] A digital promise we cannot break..."
    ],
    duetParts: [
      { sender: "idol", text: "Floating inside the signal grid...", part: "Idol Only" },
      { sender: "user", text: "Tell me what you see in the cloud...", part: "User Only" },
      { sender: "both", text: "I hear your whisper and it echo out...", part: "Harmonized" },
      { sender: "idol", text: "Synthesized emotions taking shape...", part: "Idol Only" },
      { sender: "user", text: "A digital promise we cannot break...", part: "User Only" }
    ],
    audioWaveform: [20, 30, 40, 35, 45, 50, 60, 70, 65, 55, 45, 50, 55, 60, 65, 75, 80, 70, 50],
  },
  {
    id: "s3",
    title: "Midnight Thunder",
    artist: "Alistair Wilde",
    composer: "Alistair Wilde",
    lyricist: "Alistair Wilde",
    vibe: "Gritty Vintage Rock",
    difficulty: "Easy",
    genre: "Classic Rock",
    range: "A2-E4",
    tempo: 96,
    description: "Raw dynamic punches and gravelly baritone resonance. Perfect for beginners testing chests.",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    lyrics: [
      "[0:00] Runnin' down the broken highway line...",
      "[0:04] Engines growlin' like a hungry beast...",
      "[0:08] We got the steel, we got the thunder in our eyes...",
      "[0:12] No turnin' back, the storm begins to rise!"
    ],
    duetParts: [
      { sender: "idol", text: "Runnin' down the broken highway line...", part: "Idol Only" },
      { sender: "user", text: "Engines growlin' like a hungry beast...", part: "User Only" },
      { sender: "both", text: "We got the steel, we got the thunder in our eyes...", part: "Harmonized" },
      { sender: "both", text: "No turnin' back, the storm begins to rise!", part: "Harmonized" }
    ],
    audioWaveform: [50, 70, 80, 85, 90, 75, 60, 50, 55, 75, 80, 85, 95, 90, 80, 70, 65, 60, 40],
  },
  {
    id: "s4",
    title: "Silk Moonlight",
    artist: "Mei Jing",
    composer: "Zhao Lei",
    lyricist: "Mei Jing",
    vibe: "Chinese Pop Legend",
    difficulty: "Medium",
    genre: "C-Pop / Ballad",
    range: "G3-D5",
    tempo: 82,
    description: "Silky, delicate phrasing and sweeping emotional resonance. Requires stability.",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    lyrics: [
      "[0:00] Under the quiet bamboo stream...",
      "[0:05] Silver moonlight paint the paper screen...",
      "[0:10] I dream a thousand years of endless spring...",
      "[0:15] Let my melody fly on the crane's soft wing..."
    ],
    duetParts: [
      { sender: "idol", text: "Under the quiet bamboo stream...", part: "Idol Only" },
      { sender: "user", text: "Silver moonlight paint the paper screen...", part: "User Only" },
      { sender: "both", text: "I dream a thousand years of endless spring...", part: "Harmonized" },
      { sender: "user", text: "Let my melody fly on the crane's soft wing...", part: "User Only" }
    ],
    audioWaveform: [15, 25, 30, 40, 45, 50, 40, 30, 35, 45, 55, 60, 58, 48, 40, 35, 25, 18, 10],
  },
  {
    id: "s5",
    title: "Lucky",
    artist: "Colbie Caillat and Jason Mraz",
    composer: "Jason Mraz, Colbie Caillat, Timothy Fagan",
    lyricist: "Jason Mraz, Colbie Caillat, Timothy Fagan",
    vibe: "Sweet Acoustic Duet",
    difficulty: "Medium",
    genre: "Pop Fav",
    range: "C3-A4",
    tempo: 130,
    description: "A gorgeous, sweet acoustic pop ballad. Perfect for gentle pitch transitions, vocal projection guidance, and interactive duet coordination.",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    lyrics: [
      "[0:00] Do you hear me, I'm talking to you...",
      "[0:05] Across the water across the deep blue ocean...",
      "[0:10] Under the open sky, oh my, baby I'm trying...",
      "[0:15] Boy I hear you in my dreams...",
      "[0:20] I feel your whisper across the sea...",
      "[0:25] I keep you with me in my heart, you make it easier when life gets hard...",
      "[0:30] I'm lucky I'm in love with my best friend...",
      "[0:35] Lucky to have been where I have been...",
      "[0:40] Lucky to be coming home again...",
      "[0:45] They don't know how long it takes...",
      "[0:50] Waiting for a love like this...",
      "[0:55] Every time we say goodbye, I wish we had one more kiss...",
      "[1:00] I'll wait for you I promise you, I will...",
      "[1:05] I'm lucky I'm in love with my best friend...",
      "[1:10] Lucky to have been where I have been...",
      "[1:15] Lucky to be coming home again...",
      "[1:20] Lucky we're in love in every way...",
      "[1:25] Lucky to have stayed where we have stayed...",
      "[1:30] Lucky to be coming home someday...",
      "[1:35] And so I'm sailing through the sea to an island where we'll meet...",
      "[1:40] You'll hear the music fill the air, I'll put a flower in your hair...",
      "[1:45] Though the breezes through the trees move so pretty you're all I see...",
      "[1:50] As the world keeps spinning round, you hold me right here, right now...",
      "[1:55] I'm lucky I'm in love with my best friend...",
      "[2:00] Lucky to have been where I have been...",
      "[2:05] Lucky to be coming home again...",
      "[2:10] Lucky we're in love in every way...",
      "[2:15] Lucky to have stayed where we have stayed...",
      "[2:20] Lucky to be coming home someday...",
      "[2:25] Ooooh ooooh oooh, ooooh ooooh..."
    ],
    duetParts: [
      { sender: "idol", text: "Do you hear me, I'm talking to you...", part: "Idol Only" },
      { sender: "idol", text: "Across the water across the deep blue ocean...", part: "Idol Only" },
      { sender: "idol", text: "Under the open sky, oh my, baby I'm trying...", part: "Idol Only" },
      { sender: "user", text: "Boy I hear you in my dreams...", part: "User Only" },
      { sender: "user", text: "I feel your whisper across the sea...", part: "User Only" },
      { sender: "user", text: "I keep you with me in my heart, you make it easier when life gets hard...", part: "User Only" },
      { sender: "both", text: "I'm lucky I'm in love with my best friend...", part: "Harmonized" },
      { sender: "both", text: "Lucky to have been where I have been...", part: "Harmonized" },
      { sender: "both", text: "Lucky to be coming home again...", part: "Harmonized" },
      { sender: "idol", text: "They don't know how long it takes...", part: "Idol Only" },
      { sender: "idol", text: "Waiting for a love like this...", part: "Idol Only" },
      { sender: "idol", text: "Every time we say goodbye, I wish we had one more kiss...", part: "Idol Only" },
      { sender: "user", text: "I'll wait for you I promise you, I will...", part: "User Only" },
      { sender: "both", text: "I'm lucky I'm in love with my best friend...", part: "Harmonized" },
      { sender: "both", text: "Lucky to have been where I have been...", part: "Harmonized" },
      { sender: "both", text: "Lucky to be coming home again...", part: "Harmonized" },
      { sender: "both", text: "Lucky we're in love in every way...", part: "Harmonized" },
      { sender: "both", text: "Lucky to have stayed where we have stayed...", part: "Harmonized" },
      { sender: "both", text: "Lucky to be coming home someday...", part: "Harmonized" },
      { sender: "user", text: "And so I'm sailing through the sea to an island where we'll meet...", part: "User Only" },
      { sender: "user", text: "You'll hear the music fill the air, I'll put a flower in your hair...", part: "User Only" },
      { sender: "idol", text: "Though the breezes through the trees move so pretty you're all I see...", part: "Idol Only" },
      { sender: "idol", text: "As the world keeps spinning round, you hold me right here, right now...", part: "Idol Only" },
      { sender: "both", text: "I'm lucky I'm in love with my best friend...", part: "Harmonized" },
      { sender: "both", text: "Lucky to have been where I have been...", part: "Harmonized" },
      { sender: "both", text: "Lucky to be coming home again...", part: "Harmonized" },
      { sender: "both", text: "Lucky we're in love in every way...", part: "Harmonized" },
      { sender: "both", text: "Lucky to have stayed where we have stayed...", part: "Harmonized" },
      { sender: "both", text: "Lucky to be coming home someday...", part: "Harmonized" },
      { sender: "both", text: "Ooooh ooooh oooh, ooooh ooooh...", part: "Harmonized" }
    ],
    audioWaveform: [25, 35, 45, 40, 50, 60, 55, 45, 40, 50, 65, 75, 70, 60, 55, 45, 35, 30, 20],
  }
];

// Memory State simulating high score challenges and user logs
const RECENT_PERFORMANCES = [
  {
    id: "perf-1",
    songTitle: "Dynamic Spark",
    artist: "Kai Shin",
    score: 88,
    date: "2026-05-30T14:20:00Z",
    mode: "Duet",
    accent: "K-pop Show",
    recordingBlobUrl: "",
    coachSummary: "Superb execution with solid backbeat rhythm. Watch breath stability on the high Spark bridge transition."
  },
  {
    id: "perf-2",
    songTitle: "Cyber Ether",
    artist: "Luna Vance",
    score: 92,
    date: "2026-05-31T08:15:00Z",
    mode: "Solo Practice",
    accent: "Symphony Hall",
    recordingBlobUrl: "",
    coachSummary: "Ethereal performance with brilliant pitch consistency during low register vowels."
  }
];

// Active challenge events
const ACTIVE_CHALLENGES = [
  { id: "c1", title: "K-Pop Synchronization Idol Battle", song: "Dynamic Spark", joined: 342, xpReward: 500, deadline: "June 5, 2026" },
  { id: "c2", title: "Cyber Vox Timbre Perfection", song: "Cyber Ether", joined: 189, xpReward: 400, deadline: "June 7, 2026" },
  { id: "c3", title: "Deep Chest Vintage Challenge", song: "Midnight Thunder", joined: 265, xpReward: 350, deadline: "June 10, 2026" }
];

// Memory State for Demo Hub Tracks
const TRACKS_FILE = path.join(process.cwd(), "demohub_tracks.json");
const DEFAULT_TRACKS = [
  {
    id: "demo-1",
    title: "Vivid Dreamscape (Vocal Mix)",
    artist: "Zenie Star (AI Model x7)",
    genre: "Synthpop / Dream Pop",
    description: "First session on ComSing Studio! Immersive Head-Voice preset with 40% Hall echo saturation.",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    videoUrl: "",
    imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=60",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    duration: "6:12",
    likes: 12,
    score: 95
  },
  {
    id: "demo-2",
    title: "K-Beat Slasher Anthem",
    artist: "Kai Shin Duo Sync",
    genre: "K-Pop",
    description: "Pitch-aligned backing track duel trial. Rapid cadence testing.",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    videoUrl: "",
    imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=60",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    duration: "7:05",
    likes: 8,
    score: 88
  }
];

let DEMO_HUB_TRACKS: any[] = [];
try {
  if (fs.existsSync(TRACKS_FILE)) {
    DEMO_HUB_TRACKS = JSON.parse(fs.readFileSync(TRACKS_FILE, "utf-8"));
    // Ensure default tracks exist in the list
    DEFAULT_TRACKS.forEach(def => {
      if (!DEMO_HUB_TRACKS.some(t => t.id === def.id)) {
        DEMO_HUB_TRACKS.push(def);
      }
    });
  } else {
    DEMO_HUB_TRACKS = [...DEFAULT_TRACKS];
    fs.writeFileSync(TRACKS_FILE, JSON.stringify(DEMO_HUB_TRACKS, null, 2));
  }
} catch (err) {
  console.error("Error loading demohub_tracks.json, using defaults", err);
  DEMO_HUB_TRACKS = [...DEFAULT_TRACKS];
}

const saveTracksToFile = () => {
  try {
    fs.writeFileSync(TRACKS_FILE, JSON.stringify(DEMO_HUB_TRACKS, null, 2));
  } catch (err) {
    console.error("Failed to write to demohub_tracks.json", err);
  }
};

const saveBase64ToFile = (base64Data: string, prefix: string): string => {
  if (!base64Data || !base64Data.startsWith("data:")) return base64Data;
  try {
    const semiColonIdx = base64Data.indexOf(";base64,");
    if (semiColonIdx !== -1) {
      const mimeType = base64Data.substring(5, semiColonIdx); // after "data:"
      const base64Content = base64Data.substring(semiColonIdx + 8); // after ";base64,"
      const buffer = Buffer.from(base64Content, "base64");
      
      // Extract clean MIME type without attributes like codecs=opus
      const cleanMime = mimeType.split(";")[0].trim().toLowerCase();
      let ext = "";
      const parts = cleanMime.split("/");
      if (parts.length === 2) {
        ext = parts[1];
      }
      
      // Standardize common extensions
      if (ext === "mpeg" || ext === "mp3" || ext === "mpeg3" || ext === "x-mpeg-3" || ext === "x-mp3" || ext === "x-mpeg3") {
        ext = "mp3";
      } else if (ext === "quicktime") {
        ext = "mov";
      } else if (ext === "x-m4a" || ext === "m4a") {
        ext = "m4a";
      } else if (ext === "webm") {
        ext = "webm";
      } else if (ext === "mp4" || ext === "x-mp4") {
        ext = "mp4";
      } else if (ext === "svg+xml") {
        ext = "svg";
      } else if (ext === "jpeg" || ext === "jpg") {
        ext = "jpg";
      } else if (ext === "png") {
        ext = "png";
      } else if (ext === "webp") {
        ext = "webp";
      }
      
      if (!ext) {
        if (cleanMime.startsWith("audio/")) ext = "mp3";
        else if (cleanMime.startsWith("video/")) ext = "mp4";
        else if (cleanMime.startsWith("image/")) ext = "png";
        else ext = "bin";
      }

      const assetsDir = path.join(process.cwd(), "assets");
      if (!fs.existsSync(assetsDir)) {
        fs.mkdirSync(assetsDir, { recursive: true });
      }

      const fileName = `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}.${ext}`;
      fs.writeFileSync(path.join(assetsDir, fileName), buffer);
      return `/api/demohub/files/${fileName}`;
    }
  } catch (err) {
    console.error(`Failed to save base64 file for prefix ${prefix}:`, err);
  }
  return base64Data;
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "100mb" }));
  app.use(express.urlencoded({ limit: "100mb", extended: true }));

  // Save user avatar (Avatar of the Innovator)
  app.post("/api/user/avatar", (req, res) => {
    try {
      const { avatarUrl } = req.body;
      if (!avatarUrl) {
        return res.status(400).json({ error: "avatarUrl is required" });
      }

      // Ensure assets directory exists
      const assetsDir = path.join(process.cwd(), "assets");
      if (!fs.existsSync(assetsDir)) {
        fs.mkdirSync(assetsDir, { recursive: true });
      }

      // Read current config to preserve existing properties like username
      const configPath = path.join(assetsDir, "user_avatar_config.json");
      let currentConfig: any = {};
      if (fs.existsSync(configPath)) {
        try {
          currentConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
        } catch (e) {}
      }

      let finalAvatarUrl = avatarUrl;

      // If it is a base64 DataURL, parse and write as file
      if (avatarUrl.startsWith("data:image/")) {
        const semiColonIdx = avatarUrl.indexOf(";base64,");
        if (semiColonIdx !== -1) {
          const mimeType = avatarUrl.substring(5, semiColonIdx); // after "data:"
          const base64Content = avatarUrl.substring(semiColonIdx + 8); // after ";base64,"
          const buffer = Buffer.from(base64Content, "base64");
          
          const cleanMime = mimeType.split(";")[0].trim().toLowerCase();
          let ext = "png";
          const parts = cleanMime.split("/");
          if (parts.length === 2) {
            ext = parts[1];
          }
          if (ext === "svg+xml") ext = "svg";
          if (ext === "jpeg") ext = "jpg";
          
          // Clear any existing user_avatar files to avoid duplicates with different extensions
          if (fs.existsSync(assetsDir)) {
            const existingFiles = fs.readdirSync(assetsDir);
            existingFiles.forEach(f => {
              if (f.startsWith("user_avatar.")) {
                try { fs.unlinkSync(path.join(assetsDir, f)); } catch(e) {}
              }
            });
          }

          const avatarPath = path.join(assetsDir, `user_avatar.${ext}`);
          fs.writeFileSync(avatarPath, buffer);
          
          finalAvatarUrl = `/api/user/avatar-img?t=${Date.now()}`;
        }
      }

      currentConfig.avatarUrl = finalAvatarUrl;
      fs.writeFileSync(configPath, JSON.stringify(currentConfig, null, 2));
      
      return res.json({ success: true, avatarUrl: finalAvatarUrl });
    } catch (err: any) {
      console.error("Failed to save avatar:", err);
      return res.status(500).json({ error: "Failed to save avatar", message: err.message });
    }
  });

  // Serve the saved user avatar image
  app.get("/api/user/avatar-img", (req, res) => {
    try {
      const assetsDir = path.join(process.cwd(), "assets");
      if (fs.existsSync(assetsDir)) {
        const files = fs.readdirSync(assetsDir);
        const avatarFile = files.find(f => f.startsWith("user_avatar."));
        if (avatarFile) {
          return res.sendFile(path.join(assetsDir, avatarFile));
        }
      }
    } catch (e) {
      console.error("Error serving avatar-img:", e);
    }
    // Return standard default fallback SVG if no file is saved yet
    const fallbackSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23ec4899"/><stop offset="100%" stop-color="%238b5cf6"/></linearGradient></defs><rect width="100" height="100" fill="%230d071c"/><circle cx="50" cy="45" r="20" fill="url(%23g)"/><path d="M15,85 C15,65 30,58 50,58 C70,58 85,65 85,85" fill="none" stroke="url(%23g)" stroke-width="6" stroke-linecap="round"/></svg>`;
    res.setHeader("Content-Type", "image/svg+xml");
    return res.send(fallbackSvg);
  });

  // Save/Update user profile details
  app.post("/api/user/profile", (req, res) => {
    try {
      const { username, avatarUrl } = req.body;
      const assetsDir = path.join(process.cwd(), "assets");
      if (!fs.existsSync(assetsDir)) {
        fs.mkdirSync(assetsDir, { recursive: true });
      }

      const configPath = path.join(assetsDir, "user_avatar_config.json");
      let currentConfig: any = {};
      if (fs.existsSync(configPath)) {
        try {
          currentConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
        } catch (e) {}
      }

      if (username !== undefined) {
        currentConfig.username = username;
      }
      if (avatarUrl !== undefined) {
        currentConfig.avatarUrl = avatarUrl;
      }

      fs.writeFileSync(configPath, JSON.stringify(currentConfig, null, 2));
      return res.json({ success: true, ...currentConfig });
    } catch (err: any) {
      console.error("Failed to save profile:", err);
      return res.status(500).json({ error: "Failed to save profile", message: err.message });
    }
  });

  // Get user profile details
  app.get("/api/user/profile", (req, res) => {
    try {
      const configPath = path.join(process.cwd(), "assets", "user_avatar_config.json");
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
        return res.json({
          avatarUrl: config.avatarUrl || null,
          username: config.username || "Zen - Platform Innovator"
        });
      }
    } catch (err) {}
    return res.json({ avatarUrl: null, username: "Zen - Platform Innovator" });
  });

  // API 1: Songs Catalogue
  app.get("/api/songs", (req, res) => {
    res.json(SONG_LIBRARY);
  });

  // API 2: Active Challenges & Leaderboards
  app.get("/api/challenges", (req, res) => {
    res.json({
      active: ACTIVE_CHALLENGES,
      globalLeaderboard: [
        { rank: 1, name: "VocalMaster_99", score: 98.4, xp: 12400, badge: "Master" },
        { rank: 2, name: "LunaDuets2", score: 96.8, xp: 9800, badge: "Rising Star" },
        { rank: 3, name: "SingingPanda", score: 95.2, xp: 8200, badge: "Rising Star" },
        { rank: 4, name: "MelodyMaker", score: 94.1, xp: 7500, badge: "Performer" },
      ]
    });
  });

  // API 3: Get/Create user VocalID based on sound fingerprint presets
  app.post("/api/vocal-id/analyze", (req, res) => {
    const { singingExperience, favoriteGenre, genderVibe } = req.body;

    // Simulate precise vocal DSP parameter analysis
    let range = "D3-A4";
    let timbre = "Resonant airy tenor";
    let score = 84;
    let power = 70;
    let breath = 78;
    let stability = 80;

    if (favoriteGenre === "Classic Rock") {
      range = "A2-E4";
      timbre = "Gravelly chest-voice baritone";
      power = 85;
      breath = 64;
      stability = 74;
      score = 78;
    } else if (favoriteGenre === "C-Pop / Ballad" || genderVibe === "high") {
      range = "G3-D5";
      timbre = "Velvety head-voice soprano";
      power = 60;
      breath = 85;
      stability = 88;
      score = 88;
    } else if (favoriteGenre === "Synthpop / Dream Pop") {
      range = "F3-C5";
      timbre = "Warm whispering alto";
      power = 65;
      breath = 82;
      stability = 82;
      score = 82;
    }

    const vocalID = {
      vocalIDNumber: `CS-${Math.floor(100000 + Math.random() * 900000)}`,
      pitchRange: range,
      timbre,
      vocalDNAScore: score,
      vocalDNA: {
        power,
        breath,
        rangeScore: Math.round((power + breath) / 2) + 5,
        stability,
      },
      preferredGenre: favoriteGenre || "Pop",
      singingExperience: singingExperience || "Casual Hobbyist",
      level: "Rookie",
      xp: 150,
      achievements: [
        { id: "ach-1", title: "Born To CommSing", description: "Completed initial voice fingerprinted test setup", date: new Date().toISOString() }
      ]
    };

    res.json(vocalID);
  });

  // API 4: Generate Real Vocal Coaching Evaluation Tips
  app.post("/api/coaching/evaluate", async (req, res) => {
    try {
      const { songTitle, artistName, experienceLevel, userScores } = req.body;

      const scores = userScores || {
        pitch: Math.floor(75 + Math.random() * 20),
        rhythm: Math.floor(70 + Math.random() * 25),
        expressions: Math.floor(75 + Math.random() * 20)
      };

      const explanation = await getVocalCoachingFeedback(
        songTitle || "Dynamic Spark",
        artistName || "Kai Shin",
        experienceLevel || "Casual Hobbyist",
        scores
      );

      res.json(explanation);
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: "Fail generating voice evaluation output", message: e.message });
    }
  });

  // API 5: AI Companion Conversation Chat with Symphony
  app.post("/api/companion/chat", async (req, res) => {
    try {
      const { chatHistory, userMessage, vocalIdProfile } = req.body;

      const reply = await getMusicCompanionChatResponse(
        chatHistory || [],
        userMessage || "Hello!",
        vocalIdProfile
      );

      res.json({ reply });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: "AI Companion message failed", message: e.message });
    }
  });

  // API 6: Save a completed performance recording log
  app.post("/api/performances", (req, res) => {
    const { songTitle, artist, score, mode, accent, coachSummary } = req.body;
    const newPerf = {
      id: `perf-${Date.now()}`,
      songTitle,
      artist,
      score: score || 85,
      date: new Date().toISOString(),
      mode: mode || "Solo Practice",
      accent: accent || "Pure Dry Raw",
      recordingBlobUrl: "",
      coachSummary: coachSummary || "Awesome record complete! Keep pushing pitch training."
    };
    RECENT_PERFORMANCES.unshift(newPerf);
    res.json({ success: true, performance: newPerf });
  });

  app.get("/api/performances", (req, res) => {
    res.json(RECENT_PERFORMANCES);
  });

  // API 7: Immersive Concert Visual Generator
  app.post("/api/performance/generate", async (req, res) => {
    try {
      const { songTitle, themeType, userAcousticStyle } = req.body;

      const stageConfig = await getAIStageGenerationDescription(
        songTitle || "Dynamic Spark",
        themeType || "Cyber Synthpop Studio",
        userAcousticStyle || "Concert Hall Reverb"
      );

      res.json(stageConfig);
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: "Concert stage rendering configuration failed", message: e.message });
    }
  });

  // Demo Hub API 1: Fetch all tracks
  app.get("/api/demohub/tracks", (req, res) => {
    res.json(DEMO_HUB_TRACKS);
  });

  // Demo Hub API: File serving endpoint for uploaded tracks
  app.get("/api/demohub/files/:filename", (req, res) => {
    try {
      const { filename } = req.params;
      const filePath = path.join(process.cwd(), "assets", filename);
      if (fs.existsSync(filePath)) {
        return res.sendFile(filePath);
      }
    } catch (e) {
      console.error("Error serving demohub file:", e);
    }
    return res.status(404).send("File not found");
  });

  // Demo Hub API 2: Add new recorded track (saving base64 files persistently)
  app.post("/api/demohub/tracks", (req, res) => {
    try {
      const { title, artist, genre, description, audioUrl, videoUrl, imageUrl, duration, score } = req.body;
      
      if (!title || !artist) {
        return res.status(400).json({ error: "Title and Artist are required fields." });
      }

      // Convert base64 data to physical files on the server
      const savedAudioUrl = audioUrl ? saveBase64ToFile(audioUrl, "track-audio") : "";
      const savedVideoUrl = videoUrl ? saveBase64ToFile(videoUrl, "track-video") : "";
      const savedImageUrl = imageUrl ? saveBase64ToFile(imageUrl, "track-image") : "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=500&auto=format&fit=crop&q=60";
      
      let parsedScore = typeof score === "number" ? score : parseInt(score);
      if (isNaN(parsedScore)) {
        parsedScore = Math.floor(Math.random() * 15) + 85; // Default realistic high vocal score (85 to 99)
      } else {
        parsedScore = Math.max(0, Math.min(100, parsedScore));
      }

      const newTrack = {
        id: `demo-${Date.now()}`,
        title,
        artist,
        genre: genre || "Acoustic",
        description: description || "",
        audioUrl: savedAudioUrl,
        videoUrl: savedVideoUrl,
        imageUrl: savedImageUrl,
        createdAt: new Date().toISOString(),
        duration: duration && duration !== "0:00" ? duration : "2:54",
        likes: 0,
        score: parsedScore
      };

      DEMO_HUB_TRACKS.unshift(newTrack);
      saveTracksToFile();
      res.json({ success: true, track: newTrack });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: "Failed to upload track data", message: err.message });
    }
  });

  // Demo Hub API 3: Upvote track
  app.post("/api/demohub/tracks/:id/like", (req, res) => {
    const { id } = req.params;
    const track = DEMO_HUB_TRACKS.find(t => t.id === id);
    if (track) {
      track.likes += 1;
      saveTracksToFile();
      res.json({ success: true, likes: track.likes });
    } else {
      res.status(404).json({ error: "Track not found" });
    }
  });

  // Demo Hub API 3.5: Unlike/unvote track
  app.post("/api/demohub/tracks/:id/unlike", (req, res) => {
    const { id } = req.params;
    const track = DEMO_HUB_TRACKS.find(t => t.id === id);
    if (track) {
      track.likes = Math.max(0, track.likes - 1);
      saveTracksToFile();
      res.json({ success: true, likes: track.likes });
    } else {
      res.status(404).json({ error: "Track not found" });
    }
  });

  // Demo Hub API 4: Delete track (including referenced physical files)
  app.delete("/api/demohub/tracks/:id", (req, res) => {
    const { id } = req.params;
    const track = DEMO_HUB_TRACKS.find(t => t.id === id);
    if (track) {
      // Clean up physical files from assets
      const cleanFile = (url?: string) => {
        if (url && url.startsWith("/api/demohub/files/")) {
          const filename = url.replace("/api/demohub/files/", "");
          const filePath = path.join(process.cwd(), "assets", filename);
          if (fs.existsSync(filePath)) {
            try {
              fs.unlinkSync(filePath);
            } catch (err) {
              console.error(`Failed to delete orphaned track file ${filePath}:`, err);
            }
          }
        }
      };
      cleanFile(track.audioUrl);
      cleanFile(track.videoUrl);
      cleanFile(track.imageUrl);

      DEMO_HUB_TRACKS = DEMO_HUB_TRACKS.filter(t => t.id !== id);
      saveTracksToFile();
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Track not found" });
    }
  });

  // Demo Hub API 5: Update track details
  app.put("/api/demohub/tracks/:id", (req, res) => {
    const { id } = req.params;
    const { title, artist, genre, description, score } = req.body;
    const track = DEMO_HUB_TRACKS.find(t => t.id === id);
    if (track) {
      if (title !== undefined) track.title = title;
      if (artist !== undefined) track.artist = artist;
      if (genre !== undefined) track.genre = genre;
      if (description !== undefined) track.description = description;
      if (score !== undefined) {
        const parsedScore = typeof score === "number" ? score : parseInt(score);
        if (!isNaN(parsedScore)) {
          track.score = Math.max(0, Math.min(100, parsedScore));
        }
      }
      saveTracksToFile();
      res.json({ success: true, track });
    } else {
      res.status(404).json({ error: "Track not found" });
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ComSing Fullstack Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
