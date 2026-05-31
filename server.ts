import express from "express";
import path from "path";
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
    genre: "Pop / Acoustic",
    range: "C3-A4",
    tempo: 130,
    description: "A gorgeous, sweet acoustic pop ballad. Perfect for gentle pitch transitions, vocal projection guidance, and interactive duet coordination.",
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

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

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
