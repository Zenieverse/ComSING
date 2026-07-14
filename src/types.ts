export interface Song {
  id: string;
  title: string;
  artist: string;
  composer: string;
  lyricist: string;
  vibe: string;
  difficulty: "Easy" | "Medium" | "Hard";
  genre: string;
  range: string;
  tempo: number;
  description: string;
  lyrics: string[];
  duetParts: { sender: "idol" | "user" | "both"; text: string; part: string }[];
  audioWaveform: number[];
  audioUrl?: string;
}

export interface VocalID {
  vocalIDNumber: string;
  pitchRange: string;
  timbre: string;
  vocalDNAScore: number;
  vocalDNA: {
    power: number;
    breath: number;
    rangeScore: number;
    stability: number;
  };
  preferredGenre: string;
  singingExperience: string;
  level: string;
  xp: number;
  achievements: { id: string; title: string; description: string; date: string }[];
}

export interface PerformanceLog {
  id: string;
  songTitle: string;
  artist: string;
  score: number;
  date: string;
  mode: string;
  accent: string;
  coachSummary: string;
}

export interface Challenge {
  id: string;
  title: string;
  song: string;
  joined: number;
  xpReward: number;
  deadline: string;
}

export interface LeaderboardUser {
  rank: number;
  name: string;
  score: number;
  xp: number;
  badge: string;
}

export interface DirectChat {
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

export interface VenueEffect {
  id: string;
  name: string;
  category: "venue" | "voice" | "audience" | "creative";
  reverbMult: number;
  gainMult: number;
  desc: string;
}

export interface DemoTrack {
  id: string;
  title: string;
  artist: string;
  genre: string;
  description: string;
  audioUrl?: string;
  videoUrl?: string;
  imageUrl?: string;
  createdAt: string;
  duration: string;
  likes: number;
  score?: number;
}
