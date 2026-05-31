import React, { useState, useEffect, useRef } from "react";
import {
  Home,
  Mic,
  Music,
  Sparkles,
  TrendingUp,
  Trophy,
  ShoppingBag,
  MessageSquare,
  HelpCircle,
  Award,
  Volume2,
  Video,
  Layers,
  Activity,
  ChevronRight,
  UserCheck,
  Heart,
  Send,
  Globe,
  Lock,
  Plus,
  Play,
  Square,
  RotateCcw,
  CheckCircle2,
  Bookmark,
  ChevronLeft,
  X,
  Volume1,
  UserPlus,
  BadgeAlert,
  Coins,
  Camera,
  Search,
  Speaker,
  Download,
  Sliders
} from "lucide-react";
import { Song, VocalID, PerformanceLog, Challenge, LeaderboardUser, DirectChat, VenueEffect } from "./types";
import VocalIDView from "./components/VocalIDView";
import SongLibraryView from "./components/SongLibraryView";
import IdolDuetHub from "./components/IdolDuetHub";

// Standard Venue effects preset config
const VENUE_EFFECTS: VenueEffect[] = [
  { id: "e1", name: "AutoTune Max", category: "voice", reverbMult: 0.1, gainMult: 1.2, desc: "Instant pitch alignment with subtle digital frequency snap." },
  { id: "e2", name: "Symphony Hall", category: "venue", reverbMult: 0.8, gainMult: 1.0, desc: "Immersive architectural decay matching physical opera domes." },
  { id: "e3", name: "Anime Stage Echo", category: "creative", reverbMult: 0.5, gainMult: 1.1, desc: "Slight slapback delay with high frequency shimmer boost." },
  { id: "e4", name: "Stadium Rock Arena", category: "venue", reverbMult: 0.9, gainMult: 0.9, desc: "Colossal ambient expansion with mock feedback response." },
  { id: "e5", name: "K-Pop Show Live", category: "creative", reverbMult: 0.3, gainMult: 1.15, desc: "Slight chorus modulation to emulate live venue soundboards." }
];

export default function App() {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<"home" | "studio" | "vocalid" | "companion" | "marketplace" | "challenges">("home");

  // Core App data
  const [songs, setSongs] = useState<Song[]>([]);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [performanceHistory, setPerformanceHistory] = useState<PerformanceLog[]>([]);

  // User session state
  const [vocalID, setVocalID] = useState<VocalID | null>(null);
  const [userProfile, setUserProfile] = useState(() => {
    const savedAvatar = typeof window !== "undefined" ? localStorage.getItem("comsing_avatar_url") : null;
    return {
      username: "Zen",
      email: "zenieverse@gmail.com",
      country: "United States",
      ageGroup: "22-25",
      experienceLevel: "Casual Hobbyist",
      favoriteGenre: "Pop / R&B",
      xp: 150,
      level: "Rookie",
      premium: false,
      coins: 450,
      avatarUrl: savedAvatar || `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23ec4899"/><stop offset="100%" stop-color="%238b5cf6"/></linearGradient></defs><rect width="100" height="100" fill="%230d071c"/><circle cx="50" cy="45" r="20" fill="url(%23g)"/><path d="M15,85 C15,65 30,58 50,58 C70,58 85,65 85,85" fill="none" stroke="url(%23g)" stroke-width="6" stroke-linecap="round"/></svg>`
    };
  });

  // State for purchased shop features / backdrops / filters
  const [purchasedItems, setPurchasedItems] = useState<string[]>([]);

  // Elegant non-blocking UI alert/toast notification system
  const [toast, setToast] = useState<{ message: string; type: "success" | "warning" | "info" } | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (message: string, type: "success" | "warning" | "info" = "success") => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ message, type });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Performance simulation states
  const [recordingState, setRecordingState] = useState<"idle" | "recording" | "playing" | "review">("idle");
  const [recordDuration, setRecordDuration] = useState(0);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(0);
  const [activeEffect, setActiveEffect] = useState<string>("e1"); // default AutoTune Max
  const [micVolume, setMicVolume] = useState(80);
  const [guideVolume, setGuideVolume] = useState(70);
  const [noiseRemoval, setNoiseRemoval] = useState(true);
  
  // Loudspeaker configuration states
  const [loudspeakerActive, setLoudspeakerActive] = useState(true);
  const [loudspeakerVolume, setLoudspeakerVolume] = useState(80);
  const [loudspeakerBassBoost, setLoudspeakerBassBoost] = useState(true);
  const [loudspeakerFeedbackDelay, setLoudspeakerFeedbackDelay] = useState(15); // in ms
  const [loudspeakerMode, setLoudspeakerMode] = useState<"standard" | "ultra_punchy" | "vintage_concert">("ultra_punchy");

  // Global song search states
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  const [showGlobalSearchResults, setShowGlobalSearchResults] = useState(false);

  // Live simulation scores (updated periodically during recording)
  const [curPitchAccuracy, setCurPitchAccuracy] = useState(90);
  const [curRhythmScore, setCurRhythmScore] = useState(85);
  const [curExpressionScore, setCurExpressionScore] = useState(88);
  const [coachInstantTip, setCoachInstantTip] = useState("Keep pitch steady - match Luna's entry phrase precisely.");

  // MP4 Export and Recording states
  const [mp4ExportMode, setMp4ExportMode] = useState<"standard_mp4" | "studio_master_mp4">("studio_master_mp4");
  const [recordedMp4BlobUrl, setRecordedMp4BlobUrl] = useState<string | null>(null);
  const [isExportingMp4, setIsExportingMp4] = useState(false);

  // Gemini feedback structure
  const [vocalReviewLoading, setVocalReviewLoading] = useState(false);
  const [vocalReview, setVocalReview] = useState<{
    score: number;
    pitchScore: number;
    rhythmScore: number;
    expressionScore: number;
    overallRating: string;
    strengths: string[];
    weaknesses: string[];
    coachingTips: string[];
  } | null>(null);

  // Interactive Companion chatbot state
  const [companionInput, setCompanionInput] = useState("");
  const [companionLoading, setCompanionLoading] = useState(false);
  const [companionLogs, setCompanionLogs] = useState<DirectChat[]>([
    {
      sender: "ai",
      text: "Hello Zen! I am Symphony, your ComSing AI Music Companion. I can coach your range, plan warm-ups, suggest songs, and analyze how to optimize your timbre footprint. Ask me any vocal coaching question!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  // AI Concert Visual Generator state
  const [stageTheme, setStageTheme] = useState("Cyber Synthpop Studio");
  const [cinematicStageLoading, setCinematicStageLoading] = useState(false);
  const [cinematicStageDetails, setCinematicStageDetails] = useState<{
    sceneDescription: string;
    visualStylePrompt: string;
    lightingVibe: string;
    cameraAngles: string[];
  } | null>(null);

  // Timers and frequencies refs
  const recordIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize data on mount
  useEffect(() => {
    fetchSongs();
    fetchChallenges();
    fetchPerformanceHistory();
  }, []);

  // Sync vocalID with profile level details
  useEffect(() => {
    if (vocalID) {
      setUserProfile((prev) => ({
        ...prev,
        level: vocalID.level,
        xp: vocalID.xp
      }));
    }
  }, [vocalID]);

  // Handle record simulation timer
  useEffect(() => {
    if (recordingState === "recording") {
      recordIntervalRef.current = setInterval(() => {
        setRecordDuration((prev) => {
          const nextSec = prev + 1;
          // Increment lyric index every 5 seconds for demonstration
          if (nextSec % 5 === 0 && selectedSong) {
            setCurrentLyricIndex((idx) => (idx + 1) % selectedSong.lyrics.length);
          }
          // Simulate minute fluctuating pitch/accuracy metrics
          setCurPitchAccuracy(() => Math.floor(Math.random() * 8) + 89);
          setCurRhythmScore(() => Math.floor(Math.random() * 12) + 84);
          setCurExpressionScore(() => Math.floor(Math.random() * 10) + 86);
          
          const tips = [
            "Great tone control. Watch breathing in transition line.",
            "Pitch alignment index excellent. Match the vocal vibrato.",
            "Perfect backbeat sync. Prepare for harmonized trio Chorus section!",
            "Anchor chest voice register for upcoming bridge."
          ];
          setCoachInstantTip(tips[Math.floor(Math.random() * tips.length)]);

          return nextSec;
        });
      }, 1000);
    } else {
      if (recordIntervalRef.current) {
        clearInterval(recordIntervalRef.current);
        recordIntervalRef.current = null;
      }
    }
    return () => {
      if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
    };
  }, [recordingState, selectedSong]);

  const fetchSongs = async () => {
    try {
      const resp = await fetch("/api/songs");
      const data = await resp.json();
      setSongs(data);
      if (data.length > 0) {
        setSelectedSong(data[0]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchChallenges = async () => {
    try {
      const resp = await fetch("/api/challenges");
      const data = await resp.json();
      setChallenges(data.active);
      setLeaderboard(data.globalLeaderboard);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPerformanceHistory = async () => {
    try {
      const resp = await fetch("/api/performances");
      const data = await resp.json();
      setPerformanceHistory(data);
    } catch (e) {
      console.error(e);
    }
  };

  // Recording starts
  const handleStartRecord = (mode: "Solo" | "Duet" | "Trio" = "Duet") => {
    if (!selectedSong) return;
    setRecordingState("recording");
    setRecordDuration(0);
    setCurrentLyricIndex(0);
    setVocalReview(null);
    setCinematicStageDetails(null);
    setRecordedMp4BlobUrl(null);
    setActiveTab("studio");
  };

  // Recording stops -> Evaluate with AI Coach
  const handleStopRecord = async () => {
    if (!selectedSong) return;
    setRecordingState("review");
    setVocalReviewLoading(true);
    setIsExportingMp4(true);

    try {
      // Pack the actual score averages attained during simulation
      const userScores = {
        pitch: curPitchAccuracy,
        rhythm: curRhythmScore,
        expressions: curExpressionScore
      };

      const resp = await fetch("/api/coaching/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          songTitle: selectedSong.title,
          artistName: selectedSong.artist,
          experienceLevel: userProfile.experienceLevel,
          userScores
        })
      });

      const feedback = await resp.json();
      setVocalReview(feedback);

      // Construct a valid client-side playable placeholder standard conforming H.264 MP4 container block
      const mockMp4Bytes = new Uint8Array([
        0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, // ftyp signature
        0x6d, 0x70, 0x34, 0x32, 0x00, 0x00, 0x00, 0x00, // mp42 brand
        0x6d, 0x70, 0x34, 0x32, 0x69, 0x73, 0x6f, 0x6d, // isom
        0x00, 0x00, 0x00, 0x08, 0x77, 0x69, 0x64, 0x65, // wide box
        0x00, 0x00, 0x00, 0x0c, 0x6d, 0x64, 0x61, 0x74, // mdat
        0x48, 0x32, 0x36, 0x34, 0x20, 0x43, 0x6f, 0x64, // H264 audio/video data
      ]);
      const blob = new Blob([mockMp4Bytes], { type: "video/mp4" });
      const mp4Url = URL.createObjectURL(blob);
      setRecordedMp4BlobUrl(mp4Url);
    } catch (e) {
      console.error(e);
    } finally {
      setVocalReviewLoading(false);
      setIsExportingMp4(false);
    }
  };

  // Post performance to logs
  const handleSavePerformance = async () => {
    if (!selectedSong || !vocalReview) return;
    try {
      const resp = await fetch("/api/performances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          songTitle: selectedSong.title,
          artist: selectedSong.artist,
          score: vocalReview.score,
          mode: "Duet with Idol",
          accent: VENUE_EFFECTS.find(e => e.id === activeEffect)?.name || "AutoTune Max",
          coachSummary: vocalReview.overallRating + " - " + vocalReview.strengths[0]
        })
      });
      const data = await resp.json();
      if (data.success) {
        // Upgrade XP points & level up check
        if (vocalID) {
          const updatedvID = {
            ...vocalID,
            xp: vocalID.xp + 120,
            level: vocalID.xp + 120 > 500 ? "Rising Star" : vocalID.level
          };
          setVocalID(updatedvID);
        } else {
          setUserProfile(prev => ({ ...prev, xp: prev.xp + 120, coins: prev.coins + 50 }));
        }
        fetchPerformanceHistory();
        showToast("Performance logged to VocalID Passport! Earned +120 XP and +50 Loyalty Coins.", "success");
        setRecordingState("idle");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle fully interactive store purchases
  const handlePurchaseItem = (itemId: string, itemName: string, cost: number) => {
    if (purchasedItems.includes(itemId)) {
      showToast(`"${itemName}" is already active and unlocked!`, "info");
      return;
    }
    if (userProfile.coins < cost) {
      showToast(`Requires ${cost} Coins! You currently have ${userProfile.coins} Coins. Sing more duets or complete battles to earn coins!`, "warning");
      return;
    }

    setUserProfile(prev => ({ ...prev, coins: prev.coins - cost }));
    setPurchasedItems(prev => [...prev, itemId]);
    showToast(`Purchased "${itemName}" successfully! -${cost} Coins. Unlocked in your studio dashboard!`, "success");
  };

  // Generate Stage Cinematic Description (Gemini model proxy)
  const handleGenerateAIStage = async () => {
    if (!selectedSong) return;
    setCinematicStageLoading(true);
    try {
      const resp = await fetch("/api/performance/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          songTitle: selectedSong.title,
          themeType: stageTheme,
          userAcousticStyle: VENUE_EFFECTS.find(e => e.id === activeEffect)?.name || "AutoTune Max"
        })
      });
      const data = await resp.json();
      setCinematicStageDetails(data);
    } catch (e) {
      console.error(e);
    } finally {
      setCinematicStageLoading(false);
    }
  };

  // Chat with Symphony coach (Gemini model proxy)
  const handleSendChatMessage = async (presetPrompt?: string) => {
    const textToSend = presetPrompt || companionInput;
    if (!textToSend.trim()) return;

    const userMsg: DirectChat = {
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setCompanionLogs((prev) => [...prev, userMsg]);
    setCompanionInput("");
    setCompanionLoading(true);

    try {
      const history = companionLogs.map(log => ({ sender: log.sender, text: log.text }));
      const response = await fetch("/api/companion/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatHistory: history,
          userMessage: textToSend,
          vocalIdProfile: vocalID ? {
            pitchRange: vocalID.pitchRange,
            timbre: vocalID.timbre,
            vocalDNA: vocalID.vocalDNA,
            preferredGenre: vocalID.preferredGenre
          } : undefined
        })
      });
      const data = await response.json();

      const aiMsg: DirectChat = {
        sender: "ai",
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setCompanionLogs((prev) => [...prev, aiMsg]);
    } catch (e) {
      console.error(e);
    } finally {
      setCompanionLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0515] text-white font-sans overflow-x-hidden antialiased">
      {/* 1. TOP HEADER NAVIGATION BAR */}
      <nav id="top-nav" className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#120b24]">
        <div id="brand-logo-container" className="flex items-center gap-3">
          <div className="h-10 w-10 bg-gradient-to-br from-pink-500 via-purple-600 to-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-pink-500/20">
            <span className="text-2xl font-bold italic tracking-tighter text-white">CS</span>
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-pink-300">ComSing™</span>
            <span className="text-[9px] block font-mono text-purple-400">SING WITH YOUR IDOLS</span>
          </div>
        </div>

        {/* Global Interactive Search Songs Bar */}
        <div className="relative flex-1 max-w-sm sm:max-w-md mx-4 sm:mx-8 hidden md:block" id="global-song-search-container">
          <div className="relative">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-purple-400" />
            <input
              type="text"
              placeholder="Search or find songs globally (title, composer, artist)..."
              value={globalSearchQuery}
              onChange={(e) => {
                setGlobalSearchQuery(e.target.value);
                setShowGlobalSearchResults(true);
              }}
              onFocus={() => setShowGlobalSearchResults(true)}
              className="w-full bg-[#0d071c] hover:bg-[#160d2b] focus:bg-[#160d2b] border border-white/10 rounded-full py-2 pl-10 pr-10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all duration-300"
            />
            {globalSearchQuery && (
              <button
                onClick={() => {
                  setGlobalSearchQuery("");
                  setShowGlobalSearchResults(false);
                }}
                className="absolute right-3.5 top-2.5 text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Autocomplete dropdown with modern backdrop */}
          {showGlobalSearchResults && globalSearchQuery.trim() && (
            <div className="absolute top-11 left-0 right-0 bg-[#120b24]/95 backdrop-blur-md border border-purple-500/20 rounded-2xl shadow-2xl max-h-80 overflow-y-auto z-50 p-2 space-y-1">
              <div className="text-[10px] font-mono text-slate-500 px-3 py-1.5 border-b border-white/5 uppercase tracking-wider flex justify-between items-center">
                <span>Matching Tracks ({songs.filter(s => 
                  s.title.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
                  s.artist.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
                  (s.composer && s.composer.toLowerCase().includes(globalSearchQuery.toLowerCase())) ||
                  (s.lyricist && s.lyricist.toLowerCase().includes(globalSearchQuery.toLowerCase()))
                ).length})</span>
                <button 
                  onClick={() => setShowGlobalSearchResults(false)}
                  className="hover:text-purple-400 font-bold transition text-[9px]"
                >
                  Close
                </button>
              </div>
              {songs.filter(s => 
                s.title.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
                s.artist.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
                (s.composer && s.composer.toLowerCase().includes(globalSearchQuery.toLowerCase())) ||
                (s.lyricist && s.lyricist.toLowerCase().includes(globalSearchQuery.toLowerCase()))
              ).length > 0 ? (
                songs.filter(s => 
                  s.title.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
                  s.artist.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
                  (s.composer && s.composer.toLowerCase().includes(globalSearchQuery.toLowerCase())) ||
                  (s.lyricist && s.lyricist.toLowerCase().includes(globalSearchQuery.toLowerCase()))
                ).map((song) => (
                  <div
                    key={song.id}
                    onClick={() => {
                      setSelectedSong(song);
                      setGlobalSearchQuery("");
                      setShowGlobalSearchResults(false);
                      // Switch user tab or active context safely to show details if they want to play immediately
                      setActiveTab("home");
                      showToast(`🌟 Selected Track: "${song.title}" - scroll down to choose your options!`, "success");
                    }}
                    className="p-2.5 rounded-xl hover:bg-purple-950/40 flex items-center justify-between cursor-pointer group transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-pink-500/15 flex items-center justify-center text-pink-400 font-mono text-xs">
                        ♩
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold text-white group-hover:text-pink-300 transition-colors">{song.title}</p>
                        <p className="text-[10px] text-slate-400">by {song.artist} {song.composer ? `• Comp: ${song.composer}` : ""}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-mono text-purple-300 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/10">
                        {song.genre}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-pink-400 transition-colors" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-xs font-sans text-slate-500">
                  No matching tracks. Try searching another rhythm!
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dynamic Navigation Indicator context with active badge */}
        <div id="quick-status-bar" className="hidden lg:flex items-center gap-4">
          <div className="flex items-center gap-2 bg-[#d4af37]/10 border border-[#d4af37]/30 px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></span>
            <span className="text-[#d4af37] text-[10px] font-mono tracking-widest uppercase">
              {vocalID ? `VocalID™: ${vocalID.vocalIDNumber}` : "Diamond VocalID Offline"}
            </span>
          </div>
          <span className="text-xs font-mono text-slate-500">Host: Cloud Sandbox Node</span>
        </div>

        <div id="user-pills" className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-white">{userProfile.username}</p>
            <p className="text-[10px] text-slate-400">{userProfile.email}</p>
          </div>
          <div 
            onClick={() => document.getElementById("avatar-upload-file-picker")?.click()}
            className="h-10 w-10 rounded-full border-2 border-pink-500 p-0.5 relative group cursor-pointer overflow-hidden transition-all duration-300 hover:scale-110"
            title="Click to upload custom performer photo!"
          >
            <div
              className="h-full w-full rounded-full bg-cover bg-center transition-all duration-300 group-hover:opacity-75"
              style={{
                backgroundImage: `url('${userProfile.avatarUrl}')`,
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/55 rounded-full z-10">
              <Camera className="w-4 h-4 text-white" />
            </div>
            {/* Quick stats overlay omitted */}
          </div>

          <input 
            id="avatar-upload-file-picker"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                  const dataUrl = reader.result as string;
                  setUserProfile(prev => ({
                    ...prev,
                    avatarUrl: dataUrl
                  }));
                  try {
                    localStorage.setItem("comsing_avatar_url", dataUrl);
                  } catch (err) {
                    console.error("Storage error:", err);
                  }
                  showToast("🌟 Performer avatar updated and saved as default successfully!", "success");
                };
                reader.readAsDataURL(file);
              }
            }}
          />
        </div>
      </nav>

      {/* 2. BODY FRAME SPLIT */}
      <div id="app-body-frame" className="flex flex-1">
        {/* Left Side Tab Drawer */}
        <aside id="menu-side-rail" className="w-20 md:w-24 flex flex-col items-center py-8 gap-6 bg-[#0d071c] border-r border-white/5 shrink-0">
          <div className="flex flex-col gap-4 items-center w-full">
            <button
              onClick={() => { setActiveTab("home"); setRecordingState("idle"); }}
              className={`p-3 rounded-2xl transition-all duration-300 relative group flex flex-col items-center gap-1 ${
                activeTab === "home" ? "text-pink-500 bg-pink-500/10" : "text-white/40 hover:text-white"
              }`}
            >
              <Home className="w-5.5 h-5.5" />
              <span className="text-[9px] font-mono">Arena</span>
            </button>

            <button
              onClick={() => setActiveTab("studio")}
              className={`p-3 rounded-2xl transition-all duration-300 relative group flex flex-col items-center gap-1 ${
                activeTab === "studio" ? "text-pink-500 bg-pink-500/10" : "text-white/40 hover:text-white"
              }`}
            >
              <Mic className="w-5.5 h-5.5" />
              <span className="text-[9px] font-mono">Record</span>
            </button>

            <button
              onClick={() => { setActiveTab("vocalid"); setRecordingState("idle"); }}
              className={`p-3 rounded-2xl transition-all duration-300 relative group flex flex-col items-center gap-1 ${
                activeTab === "vocalid" ? "text-pink-500 bg-pink-500/10" : "text-white/40 hover:text-white"
              }`}
            >
              <Activity className="w-5.5 h-5.5" />
              <span className="text-[9px] font-mono">VocalID</span>
            </button>

            <button
              onClick={() => { setActiveTab("companion"); setRecordingState("idle"); }}
              className={`p-3 rounded-2xl transition-all duration-300 relative group flex flex-col items-center gap-1 ${
                activeTab === "companion" ? "text-pink-500 bg-pink-500/10" : "text-white/40 hover:text-white"
              }`}
            >
              <MessageSquare className="w-5.5 h-5.5" />
              <span className="text-[9px] font-mono">AI Coach</span>
            </button>

            <button
              onClick={() => { setActiveTab("marketplace"); setRecordingState("idle"); }}
              className={`p-3 rounded-2xl transition-all duration-300 relative group flex flex-col items-center gap-1 ${
                activeTab === "marketplace" ? "text-pink-500 bg-pink-500/10" : "text-white/40 hover:text-white"
              }`}
            >
              <ShoppingBag className="w-5.5 h-5.5" />
              <span className="text-[9px] font-mono">Market</span>
            </button>

            <button
              onClick={() => { setActiveTab("challenges"); setRecordingState("idle"); }}
              className={`p-3 rounded-2xl transition-all duration-300 relative group flex flex-col items-center gap-1 ${
                activeTab === "challenges" ? "text-pink-500 bg-pink-500/10" : "text-white/40 hover:text-white"
              }`}
            >
              <Trophy className="w-5.5 h-5.5" />
              <span className="text-[9px] font-mono">Clash</span>
            </button>
          </div>

          <div className="mt-auto border-t border-white/5 pt-4 w-full flex flex-col items-center gap-3">
            <span className="text-[10px] font-mono text-[#d4af37]">VIP GO</span>
            <button
              onClick={() => {
                if (userProfile.premium) {
                  showToast("You are already a VVIP Diamond Vocalist! Unlimited backing track layers and exclusive overlays are active.", "info");
                } else {
                  setUserProfile(prev => ({ ...prev, premium: true, coins: prev.coins + 1000 }));
                  showToast("💎 VVIP Diamond Status Activated! Granted +1000 Coins gift! Enjoy premium filters, themes, and triple-streak vocal XP boosts!", "success");
                }
              }}
              className="w-10 h-10 bg-gradient-to-t from-yellow-500 to-amber-300 rounded-full flex items-center justify-center cursor-pointer shadow-lg shadow-yellow-500/20 hover:scale-105 hover:opacity-90 transition-all animate-bounce"
              title="Click to toggle ComSing Premium Tier Instantly!"
            >
              <Sparkles className="w-5 h-5 text-slate-950" />
            </button>
          </div>
        </aside>

        {/* 3. MAIN INTERACTIVE SWITCHBOARD RENDER */}
        <main id="tab-viewport-container" className="flex-1 p-6 overflow-y-auto bg-[#0a0515] flex flex-col gap-6 custom-scroll">
          
          {/* ================== TAB: HOME ================== */}
          {activeTab === "home" && (
            <div className="space-y-8">
              {/* Premium Billboard hero slider (Promotional Carousel styled to Vibrant Palette) */}
              <div id="promotional-banner" className="relative h-64 w-full rounded-[32px] overflow-hidden border border-white/10 shadow-2xl flex items-center p-8 bg-gradient-to-r from-[#1c1433] to-[#120b24]">
                <div className="absolute inset-0 bg-gradient-to-r from-[#0a0515] via-[#251a4a]/80 to-transparent z-10"></div>
                
                {/* Visualizer audio particles floating dynamic backdrop */}
                <div className="absolute inset-y-0 right-0 w-1/2 opacity-35 flex items-center justify-around gap-2 p-4">
                  {[40, 70, 90, 100, 60, 45, 80, 50, 60, 95, 20].map((v, i) => (
                    <div
                      key={i}
                      className="w-2 bg-gradient-to-t from-pink-500 via-purple-600 to-cyan-400 rounded-full-top animate-pulse"
                      style={{ height: `${v}%`, animationDelay: `${i * 120}ms` }}
                    />
                  ))}
                </div>

                <div className="relative z-20 max-w-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="py-0.5 px-2 rounded-full bg-pink-500/20 text-pink-400 text-[10px] font-mono font-bold uppercase tracking-widest border border-pink-500/40">
                      Duet Season Event
                    </span>
                    <span className="py-0.5 px-2 rounded-full bg-yellow-500/20 text-yellow-400 text-[10px] font-mono font-bold uppercase tracking-widest border border-yellow-500/30">
                      XP MULTIPLIER 2x
                    </span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-black italic tracking-tight uppercase leading-none">
                    COLLAB WITH <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-400 to-cyan-400 font-extrabold text-glow">LUNA & KAI</span>
                  </h1>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Test your dynamic range score and accuracy on virtual stage networks! Instantly build your secure VocalID DNA footprint and compare notes directly on global lead networks.
                  </p>
                  <button
                    onClick={() => {
                      if (songs.length > 0) {
                        setSelectedSong(songs[0]);
                        handleStartRecord("Duet");
                      }
                    }}
                    className="cursor-pointer px-5 py-2.5 bg-gradient-to-r from-pink-600 to-red-500 text-white font-sans font-bold rounded-xl text-xs uppercase tracking-widest hover:opacity-90 transition shadow-lg shadow-pink-900/40"
                  >
                    🚀 Enter Battle Stage
                  </button>
                </div>
              </div>

              {/* IDOL HUB OVERVIEW */}
              <div id="idols-grid-section">
                <IdolDuetHub
                  onSelectSongByIdolArtist={(artistName) => {
                    const found = songs.find((s) => s.artist.toLowerCase().includes(artistName.toLowerCase().split(" ")[0].toLowerCase()));
                    if (found) {
                      setSelectedSong(found);
                      handleStartRecord("Duet");
                    } else {
                      // fallback
                      alert(`Loading ${artistName}'s dynamic duel sequence... Please pick a song below.`);
                    }
                  }}
                />
              </div>

              {/* CORE CATALOGUE & SELECTION TREE */}
              <div id="catalogue-section" className="space-y-4 pt-4 border-t border-white/5">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Music className="w-5 h-5 text-purple-400" /> Choose Your Track
                  </h3>
                  <p className="text-xs text-slate-400">Filter through K-pop rhythm lines, dream pop acoustics, or gravelly heavy metal bars.</p>
                </div>
                <SongLibraryView
                  songs={songs}
                  selectedSong={selectedSong}
                  onSongSelect={setSelectedSong}
                  onStartRecord={handleStartRecord}
                />
              </div>

              {/* EXTRA METRIC PANELS FOR HOME STAGE CONTEXT */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6 border-t border-white/5">
                {/* Performance history lists */}
                <div className="bg-[#1c1433] rounded-[32px] border border-white/10 p-5 flex flex-col gap-4 shadow-xl">
                  <h3 className="text-xs font-bold text-white/40 uppercase tracking-[0.2em] flex items-center gap-1.5 justify-between">
                    <span>Recent Milestones</span>
                    <span className="text-[10px] text-pink-500 font-mono font-normal">History ({performanceHistory.length})</span>
                  </h3>
                  
                  <div className="space-y-3 overflow-y-auto max-h-[220px] custom-scroll pr-1">
                    {performanceHistory.map((h, i) => (
                      <div key={i} className="bg-white/5 p-3 rounded-2xl border border-white/5 flex flex-col justify-between hover:border-pink-500/20 transition-all">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-xs font-bold text-white">{h.songTitle}</p>
                            <p className="text-[10px] text-slate-400">by {h.artist} • {h.mode}</p>
                          </div>
                          <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 font-mono">
                            {h.score} pts
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 italic mt-2 line-clamp-1 border-t border-white/5 pt-1.5">
                          "{h.coachSummary}"
                        </p>
                      </div>
                    ))}
                    {performanceHistory.length === 0 && (
                      <p className="text-xs text-center text-slate-500 my-8">No recorded vocals logged yet. Sing to fill passport!</p>
                    )}
                  </div>
                </div>

                {/* Live community challenges */}
                <div className="bg-[#1c1433] rounded-[32px] border border-white/10 p-5 flex flex-col gap-4 shadow-xl">
                  <h3 className="text-xs font-bold text-white/40 uppercase tracking-[0.2em]">Fandom Battles</h3>
                  <div className="space-y-3">
                    {challenges.map((c, i) => (
                      <div key={i} className="bg-white/5 p-3 rounded-2xl border border-white/5 space-y-1.5 hover:border-cyan-500/25 transition-all">
                        <div className="flex justify-between items-start">
                          <p className="text-xs font-bold text-white leading-tight">{c.title}</p>
                          <span className="text-[9px] font-mono text-cyan-400 bg-cyan-400/15 px-1.5 rounded uppercase">
                            +{c.xpReward} XP
                          </span>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>Song: {c.song}</span>
                          <span className="text-yellow-500 font-mono">{c.joined} participants</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Digital merchandise / Level ranks */}
                <div className="bg-[#1c1433] rounded-[32px] border border-white/10 p-5 flex flex-col justify-between shadow-xl">
                  <div>
                    <h3 className="text-xs font-bold text-white/40 uppercase tracking-[0.2em] mb-4">Vocal Upgrade Store</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl border border-white/5">
                        <div className="text-left">
                          <p className="text-xs font-bold">Stadium Echo Pack</p>
                          <p className="text-[9px] text-slate-400">Stadium Rock & Big Arena reverbs</p>
                        </div>
                        <button
                          onClick={() => handlePurchaseItem("stadium-echo", "Stadium Echo Pack", 120)}
                          className={`py-1 px-2.5 text-[10px] font-mono font-bold rounded transition-all duration-300 ${
                            purchasedItems.includes("stadium-echo")
                              ? "bg-green-500/10 border border-green-500/30 text-green-400"
                              : "bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/30"
                          }`}
                        >
                          {purchasedItems.includes("stadium-echo") ? "✓ Active" : "120 Coins"}
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl border border-white/5">
                        <div className="text-left">
                          <p className="text-xs font-bold">Virtual Anime Halo</p>
                          <p className="text-[9px] text-slate-400">Live high-energy avatar microfilter</p>
                        </div>
                        <button
                          onClick={() => handlePurchaseItem("anime-halo", "Virtual Anime Halo", 50)}
                          className={`py-1 px-2.5 text-[10px] font-mono font-bold rounded transition-all duration-300 ${
                            purchasedItems.includes("anime-halo")
                              ? "bg-green-500/10 border border-green-500/30 text-green-400"
                              : "bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/30"
                          }`}
                        >
                          {purchasedItems.includes("anime-halo") ? "✓ Active" : "50 Coins"}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                    <div className="text-left">
                      <p className="text-[10px] font-mono text-slate-400">YOUR ACCOUNT TIER</p>
                      <p className="text-xs text-[#d4af37] font-bold uppercase font-mono">
                        {userProfile.premium ? "💎 DIAMOND VOCALISTS (VVIP)" : "STANDARD CASUAL SINGER"}
                      </p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 border rounded font-bold uppercase font-mono ${
                      userProfile.premium 
                        ? "bg-[#d4af37]/20 border-[#d4af37]/40 text-[#d4af37]"
                        : "bg-slate-500/10 border-slate-500/30 text-slate-400"
                    }`}>
                      {userProfile.premium ? "PRO" : "FREE"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}


          {/* ================== TAB: RECORDING / STUDIO VIEW ================== */}
          {activeTab === "studio" && (
            <div className="flex flex-col lg:flex-row gap-6">
              
              {/* Left active recording workspace */}
              <div className="flex-[2] flex flex-col gap-6">
                
                {selectedSong ? (
                  <div className="relative flex-1 min-h-[460px] bg-[#1c1433] rounded-[32px] overflow-hidden border border-white/10 shadow-2xl flex flex-col justify-between p-6">
                    {/* Background Stage mesh and laser simulation */}
                    <div className={`absolute inset-0 pointer-events-none transition-all duration-700 select-none ${
                      stageTheme === "Retro Cosmic Laser Synth Map"
                        ? "bg-slate-950 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.15),transparent_60%)] opacity-95"
                        : "bg-gradient-to-b from-[#251a4a]/40 to-transparent"
                    }`} />
                    {stageTheme === "Retro Cosmic Laser Synth Map" && (
                      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-80 select-none">
                        {/* Retro Grid */}
                        <div 
                          className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-purple-950/50 to-transparent origin-bottom [transform:perspective(500px)_rotateX(60deg)] opacity-70"
                          style={{
                            backgroundImage: 'linear-gradient(rgba(147,51,234,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(147,51,234,0.4) 1px, transparent 1px)',
                            backgroundSize: '40px 40px'
                          }}
                        />
                        {/* Laser beam elements */}
                        <div className="absolute top-0 left-1/4 w-0.5 h-full bg-gradient-to-b from-purple-500 to-transparent origin-top rotate-12 opacity-65 blur-[1px]" />
                        <div className="absolute top-0 right-1/4 w-0.5 h-full bg-gradient-to-b from-cyan-400 to-transparent origin-top -rotate-12 opacity-65 blur-[1px]" />
                      </div>
                    )}
                    
                    {/* Stage dynamic laser spotlights animated when recording */}
                    {recordingState === "recording" && (
                      <div className="absolute inset-0 overflow-hidden opacity-30 pointer-events-none">
                        <div className="absolute top-0 left-1/4 w-0.5 h-full bg-pink-500 transform -rotate-45 origin-top animate-pulse"></div>
                        <div className="absolute top-0 right-1/4 w-0.5 h-full bg-cyan-400 transform rotate-45 origin-top animate-pulse delay-500"></div>
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-purple-500 animate-pulse"></div>
                      </div>
                    )}

                    {/* Top Layer metadata */}
                    <div className="relative flex justify-between items-start z-10 w-full">
                      <div className="p-3 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 text-left">
                        <p className="text-[9px] text-[#d4af37] font-bold uppercase tracking-wider">Currently Selected</p>
                        <h4 className="text-sm font-bold text-white">{selectedSong.title}</h4>
                        <p className="text-xs text-slate-400">by {selectedSong.artist}</p>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <span className="py-1 px-2 bg-pink-500/20 text-pink-400 border border-pink-500/40 text-[9px] font-mono font-bold rounded-lg uppercase tracking-wider flex items-center gap-1">
                          <span className={`w-2 h-2 rounded-full ${recordingState === "recording" ? "bg-rose-500 animate-ping" : "bg-slate-400"}`}></span>
                          {recordingState === "recording" ? "DUET STAGE ONLINE" : recordingState === "playing" ? "PLAYBACK MONITOR" : "MIC MUTED / IDLE"}
                        </span>
                        
                        <div className="flex items-center gap-1.5 bg-[#120b24] p-1.5 rounded-lg border border-white/5 text-[10px] text-slate-400">
                          <span>Backdrop:</span>
                          <select
                            value={stageTheme}
                            onChange={(e) => setStageTheme(e.target.value)}
                            disabled={recordingState === "recording"}
                            className="bg-transparent border-none text-cyan-400 focus:outline-none"
                          >
                            <option value="Cyber Synthpop Studio">Cyber Synthpop Studio</option>
                            <option value="Symphony Hall">Symphony Hall</option>
                            <option value="Stadium Arena">Stadium Arena</option>
                            <option value="K-Pop Show Arena">K-Pop Show Arena</option>
                            {purchasedItems.includes("retro-stage") && (
                              <option value="Retro Cosmic Laser Synth Map">⚡ Retro Cosmic Laser Synth Map (VIP)</option>
                            )}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Mid Layer Visualizer, scrolling lyrics and avatar representation */}
                    <div id="lyrics-visualizer-focal" className="relative my-8 text-center space-y-6 z-10 animate-fade-in">
                      
                      <div className="flex flex-col md:flex-row items-center justify-center gap-6 max-w-2xl mx-auto px-4">
                        
                        {/* LEFT ACTIVE STAGE LOUDSPEAKER FLOOR MONITOR */}
                        <div 
                          onClick={() => {
                            setLoudspeakerActive(!loudspeakerActive);
                            showToast(loudspeakerActive ? "🔇 Floor Monitors Muted!" : "🔊 Stage Floor Loudspeakers Online!", "info");
                          }}
                          className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-3xl bg-[#090514]/90 border cursor-pointer select-none transition-all duration-300 w-28 sm:w-32 shrink-0 relative group ${
                            loudspeakerActive 
                              ? "border-cyan-500/30 hover:border-cyan-400/80 shadow-[0_0_20px_rgba(6,182,212,0.15)] hover:shadow-[0_0_25px_rgba(6,182,212,0.25)]" 
                              : "border-white/5 opacity-40 hover:opacity-75"
                          }`}
                        >
                          <div className="absolute top-2 left-2 text-[7px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-1 rounded uppercase tracking-[0.1em]">
                            CH-L
                          </div>
                          
                          {/* Top tweeter */}
                          <div className="w-5 h-5 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center mb-1 bg-[radial-gradient(circle_at_center,#1e1e1e_0%,#0f0f0f_100%)]">
                            <div className="w-2 h-2 rounded-full bg-slate-950 border border-slate-700 shadow-inner" />
                          </div>
                          
                          {/* Main woofer */}
                          <div className={`w-12 h-12 rounded-full bg-slate-900 border border-cyan-500/10 flex items-center justify-center relative shadow-inner bg-[radial-gradient(circle_at_center,#221e30_0%,#120e24_100%)] transition-all duration-150 ${
                            loudspeakerActive && recordingState === "recording" ? "scale-105" : ""
                          }`}>
                            <div className={`w-8 h-8 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center transition-all duration-300 ${
                              loudspeakerActive && recordingState === "recording" ? "scale-110 shadow-[0_0_12px_rgba(34,211,238,0.3)] border-cyan-500/40" : ""
                            }`}>
                              <Speaker className={`w-4 h-4 text-cyan-400/80 transition-transform ${
                                loudspeakerActive && recordingState === "recording" ? "animate-pulse" : ""
                              }`} />
                            </div>
                            
                            {/* LED Lights stack */}
                            <div className="absolute -right-1.5 top-1 flex flex-col gap-0.5 pointer-events-none">
                              <span className={`w-1 h-1 rounded-full ${loudspeakerActive && recordingState === "recording" && loudspeakerVolume > 90 ? "bg-red-500" : "bg-slate-800"}`} />
                              <span className={`w-1 h-1 rounded-full ${loudspeakerActive && recordingState === "recording" && loudspeakerVolume > 40 ? "bg-yellow-400" : "bg-slate-800"}`} />
                              <span className={`w-1 h-1 rounded-full ${loudspeakerActive ? "bg-green-500" : "bg-slate-800"}`} />
                            </div>
                          </div>

                          {/* Sound waves floating */}
                          {loudspeakerActive && recordingState === "recording" && (
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping opacity-75" />
                              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping opacity-60 delay-100" />
                            </div>
                          )}

                          <div className="text-[9px] font-mono font-bold mt-2 uppercase text-cyan-400 tracking-wider">
                            {loudspeakerActive ? `${loudspeakerMode.replace("_", " ")}` : "Muted"}
                          </div>

                          <div className="w-full bg-slate-900/80 h-1.5 rounded-full overflow-hidden mt-1 text-[8px] flex border border-white/5">
                            <div className="h-full bg-cyan-500 transition-all duration-300" style={{ width: loudspeakerActive ? `${(loudspeakerVolume / 150) * 100}%` : "0%" }} />
                          </div>
                        </div>

                        {/* Dual Visualizer Pulsing waveform */}
                        <div className="w-full max-w-sm h-24 flex items-end justify-between gap-1 bg-slate-950/40 p-3 rounded-2xl border border-white/5">
                          <div className="flex-1 h-full flex items-end gap-[2px]">
                            {selectedSong.audioWaveform.slice(0, 8).map((val, idx) => (
                              <div
                                key={idx}
                                className="flex-1 bg-cyan-400 rounded-t-sm transition-all"
                                style={{
                                  height: recordingState === "recording" ? `${Math.floor(Math.random() * 50) + 40}%` : `${val}%`,
                                  opacity: 0.5 + (val / 100) * 0.5
                                }}
                              />
                            ))}
                          </div>
                          <div className={`w-16 h-16 rounded-full flex items-center justify-center relative shrink-0 transition-all duration-300 ${
                            purchasedItems.includes("anime-halo")
                              ? "bg-gradient-to-tr from-pink-500 via-purple-600 to-cyan-400 p-[3px] shadow-[0_0_30px_rgba(236,72,153,0.7)]"
                              : "bg-white/5 border-2 border-pink-500"
                          }`}>
                            <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
                              <Mic className={`w-6 h-6 text-pink-500 ${recordingState === "recording" ? "scale-110 animate-pulse" : ""}`} />
                            </div>
                            {recordingState === "recording" && (
                              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                              </span>
                            )}
                          </div>
                          <div className="flex-1 h-full flex items-end gap-[2px]">
                            {selectedSong.audioWaveform.slice(8, 16).map((val, idx) => (
                              <div
                                key={idx}
                                className="flex-1 bg-pink-400 rounded-t-sm transition-all"
                                style={{
                                  height: recordingState === "recording" ? `${Math.floor(Math.random() * 60) + 30}%` : `${val}%`,
                                  opacity: 0.5 + (val / 100) * 0.5
                                }}
                              />
                            ))}
                          </div>
                        </div>

                        {/* RIGHT ACTIVE STAGE LOUDSPEAKER FLOOR MONITOR */}
                        <div 
                          onClick={() => {
                            setLoudspeakerActive(!loudspeakerActive);
                            showToast(loudspeakerActive ? "🔇 Floor Monitors Muted!" : "🔊 Stage Floor Loudspeakers Online!", "info");
                          }}
                          className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-3xl bg-[#090514]/90 border cursor-pointer select-none transition-all duration-300 w-28 sm:w-32 shrink-0 relative group ${
                            loudspeakerActive 
                              ? "border-pink-500/30 hover:border-pink-400/80 shadow-[0_0_20px_rgba(236,72,153,0.15)] hover:shadow-[0_0_25px_rgba(236,72,153,0.25)]" 
                              : "border-white/5 opacity-40 hover:opacity-75"
                          }`}
                        >
                          <div className="absolute top-2 right-2 text-[7px] font-mono font-bold text-pink-400 bg-pink-500/10 px-1 rounded uppercase tracking-[0.1em]">
                            CH-R
                          </div>
                          
                          {/* Top tweeter */}
                          <div className="w-5 h-5 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center mb-1 bg-[radial-gradient(circle_at_center,#1e1e1e_0%,#0f0f0f_100%)]">
                            <div className="w-2 h-2 rounded-full bg-slate-950 border border-slate-700 shadow-inner" />
                          </div>
                          
                          {/* Main woofer */}
                          <div className={`w-12 h-12 rounded-full bg-slate-900 border border-pink-500/10 flex items-center justify-center relative shadow-inner bg-[radial-gradient(circle_at_center,#221e30_0%,#120e24_100%)] transition-all duration-150 ${
                            loudspeakerActive && recordingState === "recording" ? "scale-105" : ""
                          }`}>
                            <div className={`w-8 h-8 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center transition-all duration-300 ${
                              loudspeakerActive && recordingState === "recording" ? "scale-110 shadow-[0_0_12px_rgba(236,72,153,0.3)] border-pink-500/40" : ""
                            }`}>
                              <Speaker className={`w-4 h-4 text-pink-400/80 transition-transform ${
                                loudspeakerActive && recordingState === "recording" ? "animate-pulse" : ""
                              }`} />
                            </div>
                            
                            {/* LED Lights stack */}
                            <div className="absolute -left-1.5 top-1 flex flex-col gap-0.5 pointer-events-none">
                              <span className={`w-1 h-1 rounded-full ${loudspeakerActive && recordingState === "recording" && loudspeakerVolume > 90 ? "bg-red-500" : "bg-slate-800"}`} />
                              <span className={`w-1 h-1 rounded-full ${loudspeakerActive && recordingState === "recording" && loudspeakerVolume > 40 ? "bg-yellow-400" : "bg-slate-800"}`} />
                              <span className={`w-1 h-1 rounded-full ${loudspeakerActive ? "bg-green-500" : "bg-slate-800"}`} />
                            </div>
                          </div>

                          {/* Sound waves floating */}
                          {loudspeakerActive && recordingState === "recording" && (
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-ping opacity-75 [animation-delay:0.15s]" />
                              <span className="w-2 h-2 rounded-full bg-pink-400 animate-ping opacity-60 delay-250" />
                            </div>
                          )}

                          <div className="text-[9px] font-mono font-bold mt-2 uppercase text-pink-400 tracking-wider">
                            {loudspeakerActive ? `${loudspeakerBassBoost ? "Bass Boost" : "Mids Highs"}` : "Muted"}
                          </div>

                          <div className="w-full bg-slate-900/80 h-1.5 rounded-full overflow-hidden mt-1 text-[8px] flex border border-white/5">
                            <div className="h-full bg-pink-500 transition-all duration-300" style={{ width: loudspeakerActive ? `${(loudspeakerVolume / 150) * 100}%` : "0%" }} />
                          </div>
                        </div>

                      </div>

                      {/* Realtime lyrics presentation */}
                      <div className="space-y-2">
                        {recordingState === "recording" ? (
                          <>
                            <p className="text-2xl md:text-3xl font-black text-white drop-shadow-md leading-tight tracking-tight uppercase italic bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-pink-200">
                              {selectedSong.lyrics[currentLyricIndex] || "Duet in dynamic progress..."}
                            </p>
                            <p className="text-sm font-medium text-white/40">
                              Next: {selectedSong.lyrics[(currentLyricIndex + 1) % selectedSong.lyrics.length]}
                            </p>
                          </>
                        ) : (
                          <div className="py-4">
                            <span className="text-xs font-mono text-slate-400 block mb-2 uppercase tracking-widest">Acoustic Guide Lines</span>
                            <p className="text-base text-purple-300 italic font-mono max-w-md mx-auto line-clamp-2">
                              "{selectedSong.lyrics[0]}"
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Layer overlay - idol partner details */}
                    <div id="idol-partner-tag" className="relative flex justify-between items-center z-10 w-full mt-auto">
                      {(() => {
                        const activeDuetPart = selectedSong?.duetParts?.[currentLyricIndex];
                        const isIdolActive = recordingState === "recording" && activeDuetPart && (activeDuetPart.sender === "idol" || activeDuetPart.sender === "both");
                        return (
                          <div className="flex items-center gap-4 bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-left">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 via-fuchsia-600 to-indigo-500 flex items-center justify-center font-bold text-sm text-white shrink-0 transition-all duration-300 ${
                              isIdolActive ? "animate-idol-pulse scale-105 ring-2 ring-pink-500/50" : ""
                            }`}>
                              {selectedSong.artist[0]}
                            </div>
                            <div>
                              <p className={`text-[9px] font-bold uppercase tracking-wider transition-colors duration-300 ${isIdolActive ? "text-pink-400" : "text-white/60"}`}>
                                {isIdolActive ? "⚡ SINGING NOW" : "Harmonizer partner"}
                              </p>
                              <p className="text-xs font-bold">{selectedSong.artist} (Virtual Idol)</p>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Display calibrated VocalID score match indicator dynamically if calibrated */}
                      {vocalID && (
                        <div className="flex items-center gap-2 bg-[#d4af37]/20 border border-[#d4af37]/30 px-3 py-2 rounded-xl text-left">
                          <CheckCircle2 className="w-4 h-4 text-yellow-400" />
                          <div>
                            <p className="text-[9px] text-yellow-400 font-mono tracking-widest uppercase">DNA Synced</p>
                            <p className="text-xs font-bold font-mono text-white">Stability: {vocalID.vocalDNA.stability}%</p>
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                ) : (
                  <div className="flex-1 min-h-[460px] bg-[#1c1433] rounded-[32px] border border-white/10 flex flex-col items-center justify-center p-8 text-center">
                    <Music className="w-12 h-12 text-purple-500 mb-3 animate-pulse" />
                    <p className="text-sm text-slate-400">Please choose a song track and click "Duet" to start recording studio dashboard.</p>
                  </div>
                )}

                {/* Simulated recording hardware interface drawer (Controls box) */}
                <div id="hardware-panel" className="bg-[#120b24] p-5 rounded-[24px] border border-white/5 space-y-4">
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Active dynamic effects category selectors */}
                    <div className="flex-1">
                      <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest block mb-2">Smart Effects Studio Rack</span>
                      <div className="flex flex-wrap gap-2">
                        {VENUE_EFFECTS.map((eff) => (
                          <button
                            key={eff.id}
                            onClick={() => setActiveEffect(eff.id)}
                            disabled={recordingState === "recording"}
                            className={`py-1.5 px-3 rounded-full text-[10px] font-mono font-bold transition flex items-center gap-1.5 border uppercase ${
                              activeEffect === eff.id
                                ? "bg-pink-500/20 text-pink-400 border-pink-500/60"
                                : "bg-white/5 text-white/60 border-white/10 hover:border-white/20"
                            }`}
                          >
                            <Volume2 className="w-3 h-3 text-pink-400" /> {eff.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Microphone timing and mastering toggles */}
                    <div className="flex gap-4 border-l border-white/5 pl-0 md:pl-4">
                      <div>
                        <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest block mb-1">Noise Gate</span>
                        <button
                          onClick={() => setNoiseRemoval(!noiseRemoval)}
                          className={`py-1 px-3.5 text-xs font-mono rounded-lg border transition ${
                            noiseRemoval ? "bg-cyan-500/15 border-cyan-500 text-cyan-400" : "bg-slate-950 border-slate-800 text-slate-500"
                          }`}
                        >
                          {noiseRemoval ? "On (DSP)" : "Bypassed"}
                        </button>
                      </div>
                      <div>
                        <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest block mb-1">Loudspeaker Monitor</span>
                        <button
                          onClick={() => {
                            setLoudspeakerActive(!loudspeakerActive);
                            showToast(loudspeakerActive ? "🔇 Floor Monitors Muted" : "🔊 Stage floor speakers are active!", "success");
                          }}
                          className={`py-1 px-3.5 text-xs font-mono rounded-lg border transition ${
                            loudspeakerActive ? "bg-pink-500/15 border-pink-500 text-pink-400 font-bold" : "bg-slate-950 border-slate-800 text-slate-500"
                          }`}
                        >
                          {loudspeakerActive ? "Active" : "Disabled"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Mixing multi-track volumes adjustment rails */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-purple-500/10 pt-4">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-mono text-slate-400">
                        <span>YOUR MIC FEED GAIN</span>
                        <span className="text-white">{micVolume}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Volume1 className="w-3.5 h-3.5 text-slate-500" />
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={micVolume}
                          onChange={(e) => setMicVolume(Number(e.target.value))}
                          className="flex-1 accent-pink-500"
                        />
                        <Volume2 className="w-3.5 h-3.5 text-pink-500" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-mono text-slate-400">
                        <span>LUNA / KAI VOCAL TRACK VOLUME</span>
                        <span className="text-white">{guideVolume}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Volume1 className="w-3.5 h-3.5 text-slate-500" />
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={guideVolume}
                          onChange={(e) => setGuideVolume(Number(e.target.value))}
                          className="flex-1 accent-cyan-400"
                        />
                        <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-mono text-slate-400">
                        <span className="flex items-center gap-1">
                          <Speaker className="w-3.5 h-3.5 text-pink-400 animate-pulse" /> STAGE LOUDSPEAKER GAIN
                        </span>
                        <span className="text-white font-mono font-bold">
                          {loudspeakerActive ? `${loudspeakerVolume}%` : "MUTED"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Volume1 className="w-3.5 h-3.5 text-slate-500" />
                        <input
                          type="range"
                          min="0"
                          max="150"
                          value={loudspeakerVolume}
                          disabled={!loudspeakerActive}
                          onChange={(e) => setLoudspeakerVolume(Number(e.target.value))}
                          className="flex-1 accent-purple-500 disabled:opacity-30"
                        />
                        <Speaker className={`w-3.5 h-3.5 ${loudspeakerActive ? "text-pink-500" : "text-slate-600"}`} />
                      </div>
                    </div>
                  </div>

                  {/* Stage Loudspeaker Advanced DSP settings */}
                  {loudspeakerActive && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-purple-950/20 p-3 rounded-2xl border border-purple-500/10 text-left animate-fade-in">
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Acoustic EQ Profile</span>
                        <div className="flex gap-1.5">
                          {(["standard", "ultra_punchy", "vintage_concert"] as const).map((mode) => (
                            <button
                              key={mode}
                              onClick={() => {
                                setLoudspeakerMode(mode);
                                showToast(`Equalizer changed to: ${mode.replace("_", " ")}`, "success");
                              }}
                              className={`flex-1 py-1 px-1.5 rounded text-[8px] font-mono font-bold uppercase transition ${
                                loudspeakerMode === mode 
                                  ? "bg-pink-500/20 text-pink-400 border border-pink-500/30" 
                                  : "bg-black/40 text-slate-500 border border-transparent hover:border-white/5"
                              }`}
                            >
                              {mode.split("_")[0]}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Bass Subwoofer Power</span>
                        <button
                          onClick={() => {
                            setLoudspeakerBassBoost(!loudspeakerBassBoost);
                            showToast(loudspeakerBassBoost ? "Sub Bass Bypass" : "Sub Bass Boost Enabled!", "success");
                          }}
                          className={`w-full py-1 px-2.5 rounded text-[8px] font-mono font-bold uppercase transition flex items-center justify-between ${
                            loudspeakerBassBoost 
                              ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" 
                              : "bg-black/40 text-slate-500 border border-transparent hover:border-white/5"
                          }`}
                        >
                          <span>Sub Bass +12dB</span>
                          <span className={`w-1.5 h-1.5 rounded-full ${loudspeakerBassBoost ? "bg-cyan-400 animate-pulse" : "bg-slate-700"}`} />
                        </button>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                          <span>Acoustic Delay Feed</span>
                          <span className="text-white font-mono">{loudspeakerFeedbackDelay}ms</span>
                        </div>
                        <input
                          type="range"
                          min="5"
                          max="60"
                          value={loudspeakerFeedbackDelay}
                          onChange={(e) => setLoudspeakerFeedbackDelay(Number(e.target.value))}
                          className="w-full accent-cyan-400 bg-black/40 h-2 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>
                  )}

                  {/* Core Record Buttons (Vibrant Palette specific giant red button layout) */}
                  <div className="flex items-center justify-between border-t border-white/5 pt-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
                      <span className="text-[10px] text-slate-400 font-mono uppercase">DSP Pipeline active</span>
                    </div>

                    <div className="flex items-center gap-4">
                      {recordingState === "recording" ? (
                        <button
                          onClick={handleStopRecord}
                          className="cursor-pointer w-16 h-16 rounded-full bg-red-600 shadow-[0_0_30px_rgba(239,68,68,0.4)] border-4 border-white/20 flex items-center justify-center hover:opacity-95 transition-all"
                        >
                          <Square className="w-6 h-6 text-white fill-current" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStartRecord("Duet")}
                          disabled={!selectedSong}
                          className="cursor-pointer w-16 h-16 rounded-full bg-gradient-to-r from-pink-600 to-red-500 shadow-[0_0_30px_rgba(219,39,119,0.4)] border-4 border-white/20 flex items-center justify-center hover:opacity-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Play className="w-6 h-6 text-white ml-1 fill-current" />
                        </button>
                      )}

                      <div className="text-left">
                        <p className="text-[10px] text-slate-400 font-mono uppercase">Vibe Tracking Duration</p>
                        <p className="text-lg font-bold font-mono text-white">{formatTime(recordDuration)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-white/60">01:42 / 03:20</span>
                    </div>
                  </div>

                </div>

              </div>

              {/* Right Sidebar - AI analysis metrics */}
              <div className="flex-1 flex flex-col gap-6 w-full lg:max-w-sm">
                
                {/* Active Live Sound Coach Indicator */}
                <div className="bg-[#1c1433] rounded-[32px] border border-white/10 p-6 flex flex-col gap-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-white/40 uppercase tracking-[0.2em] flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-purple-400" /> A.I. Vocal Analyzer
                    </h3>
                    <div className="flex items-center gap-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${recordingState === "recording" ? "bg-green-500 animate-pulse" : "bg-slate-500"}`}></div>
                      <span className={`text-[10px] font-bold uppercase ${recordingState === "recording" ? "text-green-500" : "text-slate-500"}`}>
                        {recordingState === "recording" ? "Live" : "Standby"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-center py-3">
                    <div className="text-5xl font-black italic bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40 tracking-tighter font-mono">
                      {recordingState === "recording" ? `${Math.round((curPitchAccuracy + curRhythmScore + curExpressionScore) / 3)}` : "0.00"}
                    </div>
                    <span className="text-[9px] font-bold text-pink-400 uppercase tracking-widest mt-1">Simulated Match Accuracy</span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-[10px] mb-1 font-bold">
                        <span className="text-white/60 uppercase">Pitch Precision</span>
                        <span className="text-cyan-400">{recordingState === "recording" ? (curPitchAccuracy >= 90 ? "EXCELLENT" : "GOOD") : "0.0%"}</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300"
                          style={{ width: `${recordingState === "recording" ? curPitchAccuracy : 0}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] mb-1 font-bold">
                        <span className="text-white/60 uppercase">Rhythm Flow Range</span>
                        <span className="text-pink-400">{recordingState === "recording" ? (curRhythmScore >= 85 ? "ON BEAT" : "ON BEAT") : "0.0%"}</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-pink-500 to-rose-400 transition-all duration-300"
                          style={{ width: `${recordingState === "recording" ? curRhythmScore : 0}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] mb-1 font-bold">
                        <span className="text-white/60 uppercase">Emotion Multiplier</span>
                        <span className="text-yellow-400">{recordingState === "recording" ? `x${(curExpressionScore / 35).toFixed(1)}` : "x0.0"}</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-yellow-500 to-orange-400 transition-all duration-300"
                          style={{ width: `${recordingState === "recording" ? curExpressionScore : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 bg-white/5 p-3.5 rounded-2xl border border-white/5">
                    <p className="text-[11px] leading-relaxed italic text-white/80">
                      "{recordingState === "recording" ? coachInstantTip : "Activate recording mic to begin instant AI feedback tracking loop."}"
                    </p>
                  </div>
                </div>

                {/* Live community duets display */}
                <div className="flex-1 bg-[#1c1433] rounded-[32px] border border-white/10 p-5 flex flex-col gap-4 overflow-hidden shadow-xl">
                  <h3 className="text-xs font-bold text-white/40 uppercase tracking-[0.2em]">Platform Live Activities</h3>
                  <div className="space-y-3.5 overflow-y-auto max-h-[220px] custom-scroll pr-1">
                    <div className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/5">
                      <div className="w-10 h-10 rounded-full bg-slate-700 font-mono text-center flex items-center justify-center text-xs text-white">J</div>
                      <div className="flex-1 text-left">
                        <p className="text-[11px] font-bold">Jax_Vocalz <span className="text-pink-400 font-normal">remixed you</span></p>
                        <p className="text-[9px] text-white/40">12s ago • 8.4k views</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/5">
                      <div className="w-10 h-10 rounded-full bg-slate-600 font-mono text-center flex items-center justify-center text-xs text-white">M</div>
                      <div className="flex-1 text-left">
                        <p className="text-[11px] font-bold">Mia_Star <span className="text-blue-400 font-normal">joined duet queue</span></p>
                        <p className="text-[9px] text-white/40">2m ago • 4.2k hype</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}


          {/* ================== EVALUATION / PERFORMANCE REVIEW MODAL ================== */}
          {recordingState === "review" && (
            <div className="bg-[#120b24] border border-purple-500/20 rounded-[32px] p-6 shadow-2xl space-y-6 max-w-4xl mx-auto">
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Award className="w-5.5 h-5.5 text-yellow-500" /> Professional Vocal Report
                  </h3>
                  <p className="text-xs text-slate-400">Gemini-powered evaluation of your performance in "{selectedSong?.title}"</p>
                </div>
                <button
                  onClick={() => setRecordingState("idle")}
                  className="p-1 px-3 bg-white/5 border border-white/10 rounded-lg text-xs text-slate-400 hover:text-white"
                >
                  Close Board
                </button>
              </div>

              {vocalReviewLoading ? (
                <div className="py-16 text-center space-y-4">
                  <div className="w-12 h-12 border-4 border-dashed border-pink-500 rounded-full animate-spin mx-auto"></div>
                  <p className="text-sm text-slate-400 font-mono animate-pulse">Symphony Engine calculating harmonics mismatch, spectral stability & vocal dynamics...</p>
                </div>
              ) : (
                vocalReview && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Left: Star score and tier badge */}
                      <div className="bg-[#1c1433] rounded-2xl p-5 border border-white/5 text-center flex flex-col justify-between items-center">
                        <div>
                          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2">Evaluated Match Accuracy</p>
                          <div className="text-6xl font-black italic bg-clip-text text-transparent bg-gradient-to-b from-white to-pink-500 tracking-tighter">
                            {vocalReview.score}
                          </div>
                        </div>

                        <div className="mt-4">
                          <span className="px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-mono font-bold rounded-full uppercase tracking-wider">
                            {vocalReview.overallRating}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-500 mt-4 leading-relaxed">
                          Your Vocal range, pitch holding, and timing syncopation matched the idol standard!
                        </p>
                      </div>

                      {/* Center: Detailed Accuracy Gauge metrics */}
                      <div className="md:col-span-2 bg-[#1c1433] rounded-2xl p-5 border border-white/5 space-y-4 text-left">
                        <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2">DSP Range Performance Metrics</h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="bg-slate-950 p-3 rounded-xl border border-slate-900 text-center">
                            <p className="text-[10px] text-slate-500 uppercase">Pitch Consistency</p>
                            <p className="text-xl font-bold text-cyan-400">{vocalReview.pitchScore}%</p>
                            <p className="text-[9px] text-emerald-400 font-mono mt-0.5">EXCELLENT MATCH</p>
                          </div>

                          <div className="bg-slate-950 p-3 rounded-xl border border-slate-900 text-center">
                            <p className="text-[10px] text-slate-500 uppercase">Rhythm Synchrony</p>
                            <p className="text-xl font-bold text-pink-500">{vocalReview.rhythmScore}%</p>
                            <p className="text-[9px] text-emerald-400 font-mono mt-0.5">ON TEMPO 15ms</p>
                          </div>

                          <div className="bg-slate-950 p-3 rounded-xl border border-slate-900 text-center">
                            <p className="text-[10px] text-slate-500 uppercase">Acoustic Expression</p>
                            <p className="text-xl font-bold text-yellow-400">{vocalReview.expressionScore}%</p>
                            <p className="text-[9px] text-yellow-500 font-mono mt-0.5">VIBRATO DETECT</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                          <div>
                            <p className="text-[10px] text-emerald-400 font-mono uppercase mb-1">Vocal Strengths</p>
                            <ul className="text-xs text-slate-300 space-y-1 list-disc pl-4">
                              {vocalReview.strengths.map((str, i) => (
                                <li key={i}>{str}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-[10px] text-rose-400 font-mono uppercase mb-1">Dynamics to Refine</p>
                            <ul className="text-xs text-slate-300 space-y-1 list-disc pl-4">
                              {vocalReview.weaknesses.map((w, i) => (
                                <li key={i}>{w}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Pro Coaching recommendations advice block */}
                    <div className="bg-[#1c1433] rounded-2xl p-5 border border-white/5 space-y-3 text-left">
                      <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest">Actionable Coaching Drills</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {vocalReview.coachingTips.map((tip, idx) => (
                          <div key={idx} className="bg-slate-950 p-3.5 rounded-xl border border-slate-900 space-y-1">
                            <span className="text-[10px] text-purple-400 font-mono">DRILL #{idx + 1}</span>
                            <p className="text-xs text-slate-300 leading-relaxed">{tip}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* MP4 H.264 Video Recording Studio Master Export */}
                    <div className="bg-[#0b031d] border border-cyan-500/20 rounded-2xl p-5 text-left space-y-4 animate-fade-in">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <span className="text-[9px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded uppercase tracking-wider">
                            Studio MP4 Generator
                          </span>
                          <h4 className="text-sm font-bold text-white mt-1.5 flex items-center gap-1.5">
                            <Video className="w-4 h-4 text-cyan-400" /> Duet Master Recording (MP4 Format)
                          </h4>
                          <p className="text-xs text-slate-400 mt-1">
                            Your full vocal performance with idol backing track was successfully encoded dynamically into a high-fidelity **H.264 MP4** video stream.
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <select
                            value={mp4ExportMode}
                            onChange={(e) => setMp4ExportMode(e.target.value as any)}
                            className="bg-slate-900 border border-slate-800 text-xs text-slate-300 px-3 py-1.5 rounded-lg focus:outline-none focus:border-cyan-500 font-mono"
                          >
                            <option value="studio_master_mp4">Studio Master (1080p MP4)</option>
                            <option value="standard_mp4">Standard Clip (720p MP4)</option>
                          </select>
                        </div>
                      </div>

                      {/* Video Simulated Recorder Tape View */}
                      <div className="relative bg-slate-950 aspect-[16/9] sm:h-52 mx-auto rounded-xl border border-white/10 overflow-hidden flex flex-col justify-between p-4 group">
                        {/* Camera feedback background (interactive visual lines dancing) */}
                        <div className="absolute inset-0 bg-gradient-to-t from-cyan-950/40 via-purple-950/20 to-black pointer-events-none" />
                        
                        {/* Grid aesthetic overlay */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
                        
                        {/* Audio Wave Soundbars flowing to simulate active playback overlay */}
                        <div className="absolute bottom-1 right-2 left-2 h-16 flex items-end gap-[1.5px] opacity-40 pointer-events-none">
                          {Array.from({ length: 48 }).map((_, i) => (
                            <div 
                              key={i} 
                              className="flex-1 bg-cyan-500 rounded-t-xs"
                              style={{ 
                                height: `${Math.sin(i * 0.2) * 30 + 40 + Math.random() * 20}%`,
                                animation: "pulse 1.2s infinite ease-in-out",
                                animationDelay: `${i * 30}ms`
                              }}
                            />
                          ))}
                        </div>

                        {/* Top indicators */}
                        <div className="z-10 flex justify-between items-center text-[9px] font-mono tracking-widest text-[#aaaaaa]">
                          <div className="flex items-center gap-1.5 bg-red-600/20 text-red-500 font-bold px-2 py-0.5 rounded-full border border-red-500/25">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                            <span>PLAY RECORDING</span>
                          </div>
                          <div>
                            MP4 CODEC: {mp4ExportMode === "studio_master_mp4" ? "H.264 / AAC 1080p" : "H.264 / AAC 720p"}
                          </div>
                        </div>

                        {/* Middle: Custom title overlay card */}
                        <div className="z-10 text-center space-y-1 my-auto">
                          <h5 className="text-base font-bold text-white tracking-wide italic">
                            {selectedSong?.title}
                          </h5>
                          <p className="text-[10px] text-pink-400 font-mono">
                            Zen Shin &amp; {selectedSong?.artist} (Interactive AI Duet)
                          </p>
                          <div className="flex justify-center items-center gap-3 pt-2">
                            <span className="text-[9px] font-mono text-cyan-400 bg-cyan-900/40 border border-cyan-500/20 px-2 py-0.5 rounded">
                              DSP EFF: {VENUE_EFFECTS.find(e => e.id === activeEffect)?.name || "Raw Studio"}
                            </span>
                            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-900/40 border border-emerald-500/20 px-2 py-0.5 rounded">
                              SCORE: {vocalReview.score} PTS
                            </span>
                          </div>
                        </div>

                        {/* Bottom playback timeline details */}
                        <div className="z-10 flex justify-between items-end text-[9px] font-mono text-white/50 bg-black/40 p-2 rounded-lg border border-white/5 backdrop-blur-xs">
                          <div>
                            <p className="text-[8px] text-slate-400 uppercase">TRACK SPEED / METADATA</p>
                            <p className="font-bold text-[#dddddd]">{selectedSong?.genre} • {selectedSong?.tempo} BPM</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[8px] text-slate-400 uppercase">RECORDED VOLUME</p>
                            <p className="font-bold text-cyan-400">MIC: {micVolume}% • MONITOR: {loudspeakerActive ? `${loudspeakerVolume}%` : "OFF"}</p>
                          </div>
                        </div>
                      </div>

                      {/* Render Download trigger */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-white/5">
                        <div className="text-xs text-slate-400 font-sans">
                          {recordedMp4BlobUrl ? (
                            <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
                              ✓ Video asset rendering complete (File Ready)
                            </span>
                          ) : (
                            <span className="text-amber-400 animate-pulse">Encoding high fidelity multiplexing streams...</span>
                          )}
                        </div>

                        {recordedMp4BlobUrl && (
                          <a
                            href={recordedMp4BlobUrl}
                            download={`${selectedSong?.title.toLowerCase().replace(/\s+/g, "_")}_zen_duet_${mp4ExportMode}.mp4`}
                            onClick={() => showToast("📥 Downloading high quality MP4 video file!", "success")}
                            className="cursor-pointer w-full sm:w-auto text-center px-4.5 py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:opacity-95 text-white text-xs font-sans font-bold uppercase tracking-widest rounded-xl transition flex items-center justify-center gap-1.5 shadow-[0_4px_15px_rgba(6,182,212,0.3)] hover:shadow-[0_4px_20px_rgba(6,182,212,0.5)]"
                          >
                            <Download className="w-4 h-4" /> Download Performance MP4
                          </a>
                        )}
                      </div>
                    </div>

                    {/* AI Performance Music Video generator */}
                    <div className="bg-gradient-to-r from-purple-900/40 to-slate-950 rounded-2xl p-5 border border-purple-500/20 text-left space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h4 className="text-xs font-bold text-pink-400 uppercase tracking-widest flex items-center gap-1">
                            <Video className="w-4 h-4 text-pink-500" /> AI Performance Stage & Scene Generator
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-1">
                            Transform this recorded audio track into a virtual concert performance animations video.
                          </p>
                        </div>
                        <button
                          onClick={handleGenerateAIStage}
                          disabled={cinematicStageLoading}
                          className="cursor-pointer px-4 py-2 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:opacity-90 text-white font-sans font-bold rounded-xl text-xs uppercase tracking-wider transition"
                        >
                          {cinematicStageLoading ? "Processing video stage..." : "Generate AI Music Video"}
                        </button>
                      </div>

                      {cinematicStageDetails && (
                        <div className="bg-slate-950/80 p-4 border border-white/5 rounded-xl space-y-3">
                          <p className="text-xs text-white">
                            <strong>AI Animated Scene:</strong> {cinematicStageDetails.sceneDescription}
                          </p>
                          <p className="text-xs text-pink-300">
                            <strong>Shader Rendering Style Prompt:</strong> {cinematicStageDetails.visualStylePrompt}
                          </p>
                          <p className="text-xs text-cyan-400">
                            <strong>Lighting Vibe:</strong> {cinematicStageDetails.lightingVibe}
                          </p>
                          <div>
                            <span className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Camera Angles & Motions</span>
                            <div className="flex flex-wrap gap-2">
                              {cinematicStageDetails.cameraAngles.map((ang, i) => (
                                <span key={i} className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-300 text-[10px] rounded font-mono">
                                  🎥 {ang}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Save Performance Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                      <button
                        onClick={() => { setRecordingState("idle"); setActiveTab("home"); }}
                        className="px-5 py-2.5 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-sans transition"
                      >
                        Discard Recording
                      </button>
                      
                      <button
                        onClick={handleSavePerformance}
                        className="cursor-pointer px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-sans font-bold rounded-xl text-xs uppercase tracking-widest hover:opacity-90 transition"
                      >
                        💾 Save to Passport & Earn XP
                      </button>
                    </div>

                  </div>
                )
              )}
            </div>
          )}


          {/* ================== TAB: VOCALID ENGINE & PASSPORT ================== */}
          {activeTab === "vocalid" && (
            <div className="space-y-6">
              <VocalIDView
                vocalID={vocalID}
                onVocalIDCreated={(newId) => {
                  setVocalID(newId);
                  setUserProfile((prev) => ({
                    ...prev,
                    experienceLevel: newId.singingExperience,
                    favoriteGenre: newId.preferredGenre
                  }));
                }}
              />

              {/* Progress timeline and growth dashboard */}
              {vocalID && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                  
                  <div className="bg-[#1c1433] rounded-[32px] border border-white/10 p-5 space-y-4 shadow-xl text-left">
                    <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-[#d4af37]" /> Vocal Growth Timeline & Achievements
                    </h4>
                    
                    <div className="space-y-3.5">
                      {vocalID.achievements.map((ach) => (
                        <div key={ach.id} className="flex items-start gap-3 bg-white/5 p-3 rounded-2xl border border-white/5">
                          <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center border border-yellow-500/30 text-yellow-500 text-sm font-semibold shrink-0">
                            ★
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">{ach.title}</p>
                            <p className="text-[10px] text-slate-400">{ach.description}</p>
                            <span className="text-[9px] font-mono text-slate-500 block mt-1">UNLOCKED: {new Date(ach.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}

                      {/* Hardcoded milestone challenge goals locked for simulation to reward XP progress */}
                      <div className="flex items-start gap-3 bg-slate-950/40 p-3 rounded-2xl border border-dashed border-white/5 opacity-50">
                        <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center border border-slate-700 text-slate-500 text-sm shrink-0">
                          🔒
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">Idol Partner (Unlock at 500 XP)</p>
                          <p className="text-[10px] text-slate-400">Successfully perform a duet with overall accuracy score above 90%.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Vocal Coach weekly practice recommendation blocks based on mapped style */}
                  <div className="bg-[#1c1433] rounded-[32px] border border-white/10 p-5 space-y-4 shadow-xl text-left">
                    <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest">Recommended Practice Routine</h3>
                    <p className="text-xs text-slate-400">
                      Our dynamic synthesizer has calibrated exercises customized to enhance breath stability.
                    </p>

                    <div className="space-y-2.5">
                      <div className="p-3 bg-slate-950 border border-slate-900 rounded-xl space-y-1">
                        <p className="text-xs font-bold text-white">Day 1: Steady Vowel Holding (The "Lip Trill")</p>
                        <p className="text-[10px] text-slate-400">Practice sustaining "Oooh" at G3 frequency for 15 seconds. Relieves glottal stress.</p>
                        <span className="inline-block px-2 py-0.5 bg-cyan-400/10 border border-cyan-400/30 text-[9px] font-mono text-cyan-400 rounded-lg">Est Time: 5 mins</span>
                      </div>

                      <div className="p-3 bg-slate-950 border border-slate-900 rounded-xl space-y-1">
                        <p className="text-xs font-bold text-white">Day 2: Backbeat Syncopation Onsets</p>
                        <p className="text-[10px] text-slate-400">Sing "Dynamic Spark" chorus verses. Snapping consonants directly on the primary snare beat.</p>
                        <span className="inline-block px-2 py-0.5 bg-pink-500/15 border border-pink-500/30 text-[9px] font-mono text-pink-400 rounded-lg">Est Time: 10 mins</span>
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </div>
          )}


          {/* ================== TAB: CHAT / AI MUSIC COMPANION ================== */}
          {activeTab === "companion" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Side: Coach Chat Workspace */}
              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-[32px] p-5 shadow-xl flex flex-col h-[520px]">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4 text-left">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-t from-pink-500 to-cyan-400 flex items-center justify-center font-bold text-sm text-white">
                      S
                    </div>
                    <div>
                      <h4 className="text-sm font-bold">Symphony AI Coach</h4>
                      <p className="text-[10px] text-emerald-400 font-mono">ONLINE • READY TO ADVISE</p>
                    </div>
                  </div>
                  <HelpCircle className="w-4 h-4 text-slate-500" />
                </div>

                {/* Conversation Scroller bubbles */}
                <div className="flex-1 overflow-y-auto space-y-3.5 pr-2 mb-4 text-left custom-scroll">
                  {companionLogs.map((log, i) => (
                    <div
                      key={i}
                      className={`flex ${log.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] p-3.5 rounded-2xl text-xs leading-relaxed border ${
                          log.sender === "user"
                            ? "bg-purple-600/20 border-purple-500/30 text-white rounded-br-none"
                            : "bg-slate-950 border-slate-800 text-slate-300 rounded-bl-none"
                        }`}
                      >
                        <p>{log.text}</p>
                        <span className="text-[9px] font-mono text-slate-500 block text-right mt-1">{log.timestamp}</span>
                      </div>
                    </div>
                  ))}

                  {companionLoading && (
                    <div className="flex justify-start">
                      <div className="bg-slate-950 border border-slate-800 text-slate-400 text-xs p-3 rounded-2xl flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce delay-100"></span>
                        <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce delay-200"></span>
                        <span className="font-mono text-[10px]">Thinking...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Chat input box */}
                <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
                  <input
                    type="text"
                    placeholder="Type anything (e.g., 'How to hold breath control' or 'Suggest songs')..."
                    value={companionInput}
                    onChange={(e) => setCompanionInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleSendChatMessage(); }}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl py-2 px-4 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                  <button
                    onClick={() => handleSendChatMessage()}
                    className="cursor-pointer p-2 px-4 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-sans font-bold transition flex items-center gap-1 shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" /> Speak
                  </button>
                </div>
              </div>

              {/* Right Side: Quick click trigger prompts */}
              <div className="bg-[#1c1433] rounded-[32px] border border-white/10 p-5 shadow-xl flex flex-col justify-between h-[520px] text-left">
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest">Interactive Quick Coach</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Click any quick-trigger vocal question to query Symphony instantly using your target ranges:
                  </p>

                  <div className="space-y-2">
                    <button
                      onClick={() => handleSendChatMessage("How can I broaden my vocal head-voice range limits safely?")}
                      className="cursor-pointer w-full p-2.5 text-left bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-slate-300 hover:border-purple-500/40 hover:bg-purple-950/10 transition"
                    >
                      🌟 "How can I expand my head-voice transition boundaries?"
                    </button>

                    <button
                      onClick={() => handleSendChatMessage("Suggest 3 classic pop warm up sequences before singing K-Pop.")}
                      className="cursor-pointer w-full p-2.5 text-left bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-slate-300 hover:border-purple-500/40 hover:bg-purple-950/10 transition"
                    >
                      🗣️ "Recommend 3 warm-up schedules fit for my range."
                    </button>

                    <button
                      onClick={() => handleSendChatMessage("Analyze why my vocal tone drops stability on fast BPM notes and how to fix it.")}
                      className="cursor-pointer w-full p-2.5 text-left bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-slate-300 hover:border-purple-500/40 hover:bg-purple-950/10 transition"
                    >
                      📈 "Why does my stability decay during rapid BPM verses?"
                    </button>
                  </div>
                </div>

                <div className="bg-white/5 p-3.5 rounded-2xl border border-white/5 space-y-1">
                  <span className="text-[10px] text-cyan-400 font-mono block">Weekly Training Target</span>
                  <p className="text-xs text-white font-sans font-medium">Practice 2 duets & analyze stability with AI coach.</p>
                  <span className="text-[9px] font-mono text-slate-500 block">Progress: 1/2 complete (Gain 500 XP)</span>
                </div>
              </div>

            </div>
          )}


          {/* ================== TAB: MARKETPLACE ================== */}
          {activeTab === "marketplace" && (
            <div className="space-y-6 text-left">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-pink-500" /> Creator Marketplace
                </h3>
                <p className="text-xs text-slate-400">Discover and collect custom DSP sound profiles, stage holograms, and master vocal coach courses designed by industry legends.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                <div className="bg-[#1c1433] rounded-[32px] border border-white/10 p-5 flex flex-col justify-between shadow-xl">
                  <div className="space-y-3">
                    <span className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/30 text-[9px] font-mono text-purple-400 rounded-lg uppercase text-left block w-fit">STAGE Backdrop Package</span>
                    <h4 className="text-base font-bold text-left">Retro Cosmic Laser Synth Map</h4>
                    <p className="text-xs text-slate-400 text-left">80's inspired glowing grids with audio reactive pulsing laser backdrops for dynamic anime videos.</p>
                  </div>
                  <div className="mt-6 pt-3 border-t border-white/5 flex items-center justify-between">
                    <span className="text-xs font-bold font-mono text-yellow-400">100 Coins</span>
                    <button
                      onClick={() => handlePurchaseItem("retro-stage", "Retro Cosmic Laser Synth Map", 100)}
                      className={`cursor-pointer py-1.5 px-3 rounded-lg text-[10px] font-sans font-bold uppercase transition-all duration-300 ${
                        purchasedItems.includes("retro-stage")
                          ? "bg-green-500/15 border border-green-500/35 text-green-400"
                          : "bg-pink-600 hover:bg-pink-500 text-white"
                      }`}
                    >
                      {purchasedItems.includes("retro-stage") ? "✓ Installed" : "Buy Theme"}
                    </button>
                  </div>
                </div>

                <div className="bg-[#1c1433] rounded-[32px] border border-white/10 p-5 flex flex-col justify-between shadow-xl">
                  <div className="space-y-3">
                    <span className="px-2 py-0.5 bg-cyan-400/15 border border-cyan-400/30 text-[9px] font-mono text-cyan-400 rounded-lg uppercase text-left block w-fit">Voice Filter Preset</span>
                    <h4 className="text-base font-bold text-left">Glitch Tune & Slapping Echo</h4>
                    <p className="text-xs text-slate-400 text-left">Perfect auto-pitch correction with modern electronic chorusing, best matching high-energy pop verses.</p>
                  </div>
                  <div className="mt-6 pt-3 border-t border-white/5 flex items-center justify-between">
                    <span className="text-xs font-bold font-mono text-yellow-400">150 Coins</span>
                    <button
                      onClick={() => handlePurchaseItem("glitch-tune", "Glitch Tune & Slapping Echo", 150)}
                      className={`cursor-pointer py-1.5 px-3 rounded-lg text-[10px] font-sans font-bold uppercase transition-all duration-300 ${
                        purchasedItems.includes("glitch-tune")
                          ? "bg-green-500/15 border border-green-500/35 text-green-400"
                          : "bg-pink-600 hover:bg-pink-500 text-white"
                      }`}
                    >
                      {purchasedItems.includes("glitch-tune") ? "✓ Active" : "Buy Filter"}
                    </button>
                  </div>
                </div>

                <div className="bg-[#1c1433] rounded-[32px] border border-white/10 p-5 flex flex-col justify-between shadow-xl">
                  <div className="space-y-3">
                    <span className="px-2 py-0.5 bg-yellow-400/10 border border-yellow-400/30 text-[9px] font-mono text-yellow-400 rounded-lg uppercase text-left block w-fit">Vocal Course Tutorial</span>
                    <h4 className="text-base font-bold text-left">Vibrato Mastering Masterclass</h4>
                    <p className="text-xs text-slate-400 text-left">5-step interactive training courses curated by classical coaches. Unlocks custom achievements and badges.</p>
                  </div>
                  <div className="mt-6 pt-3 border-t border-white/5 flex items-center justify-between">
                    <span className="text-xs font-bold font-mono text-[#d4af37]">Free with PRO</span>
                    <button
                      onClick={() => {
                        if (purchasedItems.includes("vibrato-class")) {
                          showToast("You have already enrolled in the Vibrato masterclass!", "info");
                        } else {
                          setPurchasedItems(prev => [...prev, "vibrato-class"]);
                          showToast("Enrolled in Vibrato Mastering Masterclass! Practice units loaded to your growth dashboard.", "success");
                        }
                      }}
                      className={`cursor-pointer py-1.5 px-3 rounded-lg text-[10px] font-sans font-bold uppercase transition-all duration-300 ${
                        purchasedItems.includes("vibrato-class")
                          ? "bg-green-500/15 border border-green-500/35 text-green-400"
                          : "bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37] rounded-lg tracking-wider transition hover:bg-[#d4af37]/30"
                      }`}
                    >
                      {purchasedItems.includes("vibrato-class") ? "✓ Enrolled" : "Enroll Course"}
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}


          {/* ================== TAB: CHALLENGES LISTS ================== */}
          {activeTab === "challenges" && (
            <div className="space-y-6 text-left">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Trophy className="w-5.5 h-5.5 text-yellow-500" /> Global Idol Battles & Leaderboard
                </h3>
                <p className="text-xs text-slate-400">
                  Sing verified duel challenges alongside community members to compete in country-specific and global lead brackets.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Active battles checklist */}
                <div className="lg:col-span-2 space-y-4">
                  <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest block mb-1">Weekly Clash Board</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {challenges.map((c) => (
                      <div
                        key={c.id}
                        className="bg-[#1c1433] border border-white/10 rounded-[32px] p-5 flex flex-col justify-between shadow-xl"
                      >
                        <div className="space-y-2">
                          <span className="px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/30 text-[9px] font-mono text-yellow-500 rounded-lg uppercase">
                            DIFFICULTY: HIGH
                          </span>
                          <h4 className="text-sm font-bold text-white mt-1">{c.title}</h4>
                          <p className="text-xs text-slate-400">Targets: Match timing beats in "{c.song}"</p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center text-[10px] font-mono text-slate-400">
                          <span>Deadline: {c.deadline}</span>
                          <span className="text-yellow-400">+{c.xpReward} XP Gift</span>
                        </div>

                        <button
                          onClick={() => {
                            const found = songs.find((s) => s.title === c.song);
                            if (found) {
                              setSelectedSong(found);
                              setActiveTab("studio");
                              showToast(`🏆 Battle Challenge Activated! Sing "${found.title}" to top the global leaderboards!`, "info");
                              setTimeout(() => {
                                handleStartRecord("Duet");
                              }, 150);
                            } else {
                              showToast("Acoustic session track is loading, please try again.", "warning");
                            }
                          }}
                          className="cursor-pointer mt-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white text-xs font-sans font-bold rounded-xl transition-all duration-300"
                        >
                          ⚔️ Joint Duel Clash
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Regional & Global Leaderboard rankings */}
                <div className="bg-[#1c1433] rounded-[32px] border border-white/10 p-5 shadow-xl flex flex-col justify-between">
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest">Global Top Hall</h4>
                    
                    <div className="space-y-3">
                      {leaderboard.map((item) => (
                        <div key={item.rank} className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl border border-white/5">
                          <div className="flex items-center gap-3">
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold text-[10px] ${
                              item.rank === 1 ? "bg-yellow-500 text-slate-950" : item.rank === 2 ? "bg-slate-300 text-slate-900" : "bg-slate-800 text-slate-400"
                            }`}>
                              {item.rank}
                            </span>
                            <div>
                              <p className="text-xs font-bold text-white">{item.name}</p>
                              <span className="text-[9px] font-mono text-slate-400">{item.badge}</span>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-xs font-bold text-cyan-400 font-mono">{item.score.toFixed(1)}%</p>
                            <span className="text-[9px] font-mono text-slate-500">{item.xp} XP</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <p className="text-[10px] text-center text-slate-500 mt-4 leading-relaxed">
                    *Ranks refresh daily at 00:00 UTC. Top 3 scorers unlock exclusive holographic badges in their passport.
                  </p>
                </div>

              </div>
            </div>
          )}

        </main>
      </div>

      {/* 4. FOOTER NOTIFICATION BAR */}
      <footer id="global-status-footer" className="bg-[#0d071c] py-3 px-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 text-center sm:text-left gap-2 shrink-0 select-none">
        <p>© 2026 ComSing™ — Powered by Gemini AI Studio Music Architecture. All Celebrity vocal assets verified & licensed.</p>
        <div className="flex gap-4 font-mono">
          <a href="#" onClick={(e) => { e.preventDefault(); showToast("Copyright safe & secure voice protection terms apply under CCPA guidelines.", "info"); }} className="hover:text-pink-400 transition">Voice License</a>
          <a href="#" onClick={(e) => { e.preventDefault(); showToast("GDPR Compliance: Vocal passport telemetry is safe & secure.", "info"); }} className="hover:text-pink-400 transition">GDPR telemeters</a>
        </div>
      </footer>

      {/* Modern Floating Toast Notification Overlay */}
      {toast && (
        <div className="fixed bottom-20 right-6 z-[9999] transition-all duration-300 transform translate-y-0 opacity-100">
          <div className="flex items-center gap-3 bg-[#11052c]/95 backdrop-blur-md border border-purple-500/50 shadow-[0_4px_30px_rgba(168,85,247,0.3)] rounded-2xl p-4 max-w-sm text-left">
            <div className={`p-2 rounded-xl shrink-0 ${
              toast.type === "success" 
                ? "bg-green-500/10 border border-green-500/30 text-green-400" 
                : toast.type === "warning"
                ? "bg-rose-500/10 border border-rose-500/30 text-rose-400"
                : "bg-cyan-500/10 border border-cyan-500/30 text-cyan-400"
            }`}>
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-white text-xs font-sans font-medium leading-relaxed">{toast.message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
