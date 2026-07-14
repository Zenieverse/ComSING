import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  UploadCloud,
  FileAudio,
  FileVideo,
  Image as ImageIcon,
  Heart,
  Music,
  Trash2,
  Video,
  Disc,
  Search,
  Filter,
  Sparkles,
  Plus,
  X,
  Check,
  RotateCcw,
  Pencil,
  MoreVertical
} from "lucide-react";
import { DemoTrack } from "../types";

interface BurstHeart {
  id: number;
  buttonId: string;
  x: number;
  y: number;
  size: number;
  delay: number;
  angle: number;
  dx: number;
}

interface DemoHubViewProps {
  onShowToast: (message: string, type: "success" | "warning" | "info") => void;
}

export default function DemoHubView({ onShowToast }: DemoHubViewProps) {
  const [tracks, setTracks] = useState<DemoTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Player State
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(true);

  // Persistent user upvotes/likes
  const [upvotedTrackIds, setUpvotedTrackIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("comsing_upvoted_tracks");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("comsing_upvoted_tracks", JSON.stringify(upvotedTrackIds));
    } catch (e) {
      console.warn("Failed to save upvoted tracks to localStorage", e);
    }
  }, [upvotedTrackIds]);
  
  // UI filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");

  // Form upload state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadArtist, setUploadArtist] = useState("");
  const [uploadGenre, setUploadGenre] = useState("Synthpop / Dream Pop");
  const [uploadDesc, setUploadDesc] = useState("");
  const [uploadScore, setUploadScore] = useState<number>(92);
  
  // Uploaded files (as base64 or object URLs)
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Edit track states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTrackId, setEditingTrackId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editArtist, setEditArtist] = useState("");
  const [editGenre, setEditGenre] = useState("Synthpop / Dream Pop");
  const [editDesc, setEditDesc] = useState("");
  const [editScore, setEditScore] = useState<number>(92);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [activeMenuTrackId, setActiveMenuTrackId] = useState<string | null>(null);

  // Floating heart burst particles state & generator
  const [heartBursts, setHeartBursts] = useState<BurstHeart[]>([]);

  const triggerHeartBurst = (buttonId: string, e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const startX = e.clientX - rect.left;
    const startY = e.clientY - rect.top;
    
    const newHearts = Array.from({ length: 8 }).map((_, i) => ({
      id: Date.now() + i,
      buttonId,
      x: startX,
      y: startY,
      size: Math.random() * 12 + 12, // 12px to 24px
      delay: i * 0.04, // staggered delays
      angle: Math.random() * 60 - 30, // -30 to 30 degrees random angle
      dx: Math.random() * 80 - 40 // random horizontal sway
    }));

    setHeartBursts(prev => [...prev, ...newHearts]);
    
    // Clean up after 1.5 seconds
    setTimeout(() => {
      setHeartBursts(prev => prev.filter(h => !newHearts.some(nh => nh.id === h.id)));
    }, 1500);
  };

  // Refs for media elements
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [waveformBars, setWaveformBars] = useState<number[]>([]);

  // Generate random heights for visualizer bars on play
  useEffect(() => {
    const barsCount = 30;
    const generateBars = () => Array.from({ length: barsCount }, () => Math.floor(Math.random() * 85) + 15);
    setWaveformBars(generateBars());

    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setWaveformBars(generateBars());
      }, 150);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Load tracks from server on mount
  const fetchTracks = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/demohub/tracks");
      if (response.ok) {
        const data = await response.json();
        setTracks(data);

        // Check if we need to auto-play the newly published track (index 0)
        const shouldAutoplay = localStorage.getItem("comsing_autoplay_new") === "true";
        if (shouldAutoplay && data.length > 0) {
          localStorage.removeItem("comsing_autoplay_new");
          setSelectedGenre("All");
          setCurrentTrackIndex(0);
          setIsPlaying(true);
        }
      } else {
        console.error("Failed to fetch demohub tracks");
      }
    } catch (error) {
      console.error("Error loading demohub tracks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTracks();
  }, []);

  const activeTrack = currentTrackIndex >= 0 && currentTrackIndex < tracks.length ? tracks[currentTrackIndex] : null;

  // Handle switching tracks
  useEffect(() => {
    // Reset playheads
    setCurrentTime(0);
    setDuration(0);
    
    if (activeTrack) {
      // Pause any active media
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.load();
      }
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.load();
      }

      // If playing was active, automatically start the new track
      if (isPlaying) {
        setTimeout(() => {
          playMedia();
        }, 100);
      }
    } else {
      setIsPlaying(false);
    }
  }, [currentTrackIndex, activeTrack?.id]);

  // Triggered when user toggles play/pause button
  const handleTogglePlay = () => {
    if (!activeTrack) {
      if (tracks.length > 0) {
        setCurrentTrackIndex(0);
        setIsPlaying(true);
        setTimeout(() => playMedia(), 150);
      }
      return;
    }

    if (isPlaying) {
      pauseMedia();
    } else {
      playMedia();
    }
  };

  const playMedia = () => {
    setIsPlaying(true);
    if (activeTrack?.videoUrl && videoRef.current) {
      videoRef.current.play().catch(err => console.log("Video playback error:", err));
    } else if (activeTrack?.audioUrl && audioRef.current) {
      audioRef.current.play().catch(err => console.log("Audio playback error:", err));
    }
  };

  const pauseMedia = () => {
    setIsPlaying(false);
    if (videoRef.current) videoRef.current.pause();
    if (audioRef.current) audioRef.current.pause();
  };

  const handleNextTrack = () => {
    if (tracks.length === 0) return;
    const nextIndex = (currentTrackIndex + 1) % tracks.length;
    setCurrentTrackIndex(nextIndex);
  };

  const handlePrevTrack = () => {
    if (tracks.length === 0) return;
    const prevIndex = currentTrackIndex <= 0 ? tracks.length - 1 : currentTrackIndex - 1;
    setCurrentTrackIndex(prevIndex);
  };

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLMediaElement>) => {
    setCurrentTime(e.currentTarget.currentTime);
  };

  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLMediaElement>) => {
    setDuration(e.currentTarget.duration);
  };

  const handleScrub = (val: number) => {
    setCurrentTime(val);
    if (activeTrack?.videoUrl && videoRef.current) {
      videoRef.current.currentTime = val;
    } else if (activeTrack?.audioUrl && audioRef.current) {
      audioRef.current.currentTime = val;
    }
  };

  // Sync volume
  useEffect(() => {
    const currentVol = isMuted ? 0 : volume;
    if (audioRef.current) audioRef.current.volume = currentVol;
    if (videoRef.current) videoRef.current.volume = currentVol;
  }, [volume, isMuted, activeTrack]);

  // Handle Track Completion
  const handleEnded = () => {
    if (isLooping) {
      if (activeTrack?.videoUrl && videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play();
      } else if (activeTrack?.audioUrl && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else {
      handleNextTrack();
    }
  };

  // Upvote song
  const handleLikeTrack = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isLiked = upvotedTrackIds.includes(id);
    const url = isLiked ? `/api/demohub/tracks/${id}/unlike` : `/api/demohub/tracks/${id}/like`;
    try {
      const response = await fetch(url, { method: "POST" });
      if (response.ok) {
        const updated = await response.json();
        setTracks(prev => prev.map(t => t.id === id ? { ...t, likes: updated.likes } : t));
        if (isLiked) {
          setUpvotedTrackIds(prev => prev.filter(tid => tid !== id));
          onShowToast("Upvote removed", "info");
        } else {
          setUpvotedTrackIds(prev => [...prev, id]);
          onShowToast("Track upvoted! ❤️", "success");
          triggerHeartBurst(id, e);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete song
  const handleDeleteTrack = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this recorded track?")) return;
    
    try {
      const response = await fetch(`/api/demohub/tracks/${id}`, { method: "DELETE" });
      if (response.ok) {
        setTracks(prev => prev.filter(t => t.id !== id));
        if (activeTrack?.id === id) {
          setCurrentTrackIndex(-1);
          setIsPlaying(false);
        }
        onShowToast("Recorded song deleted successfully", "success");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Open edit modal and populate values
  const handleEditTrackClick = (track: DemoTrack, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTrackId(track.id);
    setEditTitle(track.title);
    setEditArtist(track.artist);
    setEditGenre(track.genre || "Synthpop / Dream Pop");
    setEditDesc(track.description || "");
    setEditScore(track.score || 92);
    setShowEditModal(true);
  };

  // Submit edit form
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTrackId) return;

    setIsSavingEdit(true);
    try {
      const response = await fetch(`/api/demohub/tracks/${editingTrackId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          artist: editArtist,
          genre: editGenre,
          description: editDesc,
          score: editScore,
        })
      });

      if (response.ok) {
        const result = await response.json();
        setTracks(prev => prev.map(t => t.id === editingTrackId ? { ...t, ...result.track } : t));
        setShowEditModal(false);
        onShowToast("🎉 Recorded track details updated successfully!", "success");
      } else {
        const errData = await response.json();
        onShowToast(errData.error || "Failed to update track", "warning");
      }
    } catch (err) {
      console.error(err);
      onShowToast("Error updating track details.", "warning");
    } finally {
      setIsSavingEdit(false);
    }
  };

  // File to base64 helper
  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  // Dynamically calculate the duration of an uploaded audio or video file
  const getMediaDuration = (file: File, isVideo: boolean): Promise<string> => {
    return new Promise((resolve) => {
      try {
        const objectUrl = URL.createObjectURL(file);
        const media = isVideo ? document.createElement("video") : document.createElement("audio");
        media.src = objectUrl;
        media.preload = "metadata";
        media.onloadedmetadata = () => {
          URL.revokeObjectURL(objectUrl);
          const seconds = media.duration;
          if (isNaN(seconds) || !isFinite(seconds) || seconds <= 0) {
            resolve("2:54");
            return;
          }
          const mins = Math.floor(seconds / 60);
          const secs = Math.floor(seconds % 60);
          resolve(`${mins}:${secs < 10 ? "0" : ""}${secs}`);
        };
        media.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          resolve("2:54");
        };
      } catch (err) {
        resolve("2:54");
      }
    });
  };

  // Handle Form Upload
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim() || !uploadArtist.trim()) {
      onShowToast("Please fill in Title and Artist fields.", "warning");
      return;
    }

    if (!audioFile && !videoFile) {
      onShowToast("Please upload at least an Audio track or a Video clip.", "warning");
      return;
    }

    setIsUploading(true);
    try {
      let audioUrl = "";
      let videoUrl = "";
      let imageUrl = "";
      let trackDuration = "2:54";

      // Dynamically detect duration of media file
      if (audioFile) {
        trackDuration = await getMediaDuration(audioFile, false);
      } else if (videoFile) {
        trackDuration = await getMediaDuration(videoFile, true);
      }

      // Convert uploaded files to persistent Base64 DataURIs
      if (audioFile) {
        audioUrl = await readFileAsBase64(audioFile);
      }
      if (videoFile) {
        videoUrl = await readFileAsBase64(videoFile);
      }
      if (imageFile) {
        imageUrl = await readFileAsBase64(imageFile);
      }

      const body = {
        title: uploadTitle,
        artist: uploadArtist,
        genre: uploadGenre,
        description: uploadDesc,
        audioUrl,
        videoUrl,
        imageUrl,
        duration: trackDuration,
        score: uploadScore
      };

      const response = await fetch("/api/demohub/tracks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        const result = await response.json();
        setTracks(prev => [result.track, ...prev]);
        setShowUploadModal(false);
        setSelectedGenre("All");
        
        // Clear forms
        setUploadTitle("");
        setUploadArtist("");
        setUploadGenre("Synthpop / Dream Pop");
        setUploadDesc("");
        setUploadScore(92);
        setAudioFile(null);
        setVideoFile(null);
        setImageFile(null);

        onShowToast("🎉 Recorded song added successfully to Demo Hub!", "success");
        // Start playing the newly added track
        setCurrentTrackIndex(0);
        setIsPlaying(true);
      } else {
        const errData = await response.json();
        onShowToast(errData.error || "Failed to save track to server", "warning");
      }
    } catch (err: any) {
      console.error(err);
      onShowToast("Error uploading media. Please check file sizes.", "warning");
    } finally {
      setIsUploading(false);
    }
  };

  const filteredTracks = tracks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.artist.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = selectedGenre === "All" || t.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  const genresList = ["All", "K-Pop", "Synthpop / Dream Pop", "Classic Rock", "C-Pop / Ballad"];

  // Format second duration (e.g. 132 -> "2:12")
  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div id="demohub-main-container" className="space-y-6 text-left">
      {/* Dynamic style for floating upvoted heart burst animation */}
      <style>{`
        @keyframes heartFloatUp {
          0% {
            transform: translate(-50%, -50%) scale(0.5) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          100% {
            transform: translate(calc(-50% + var(--dx, 0px)), -140px) scale(1.8) rotate(var(--angle, 15deg));
            opacity: 0;
          }
        }
        .animate-heart-float {
          animation: heartFloatUp 1.5s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
        }
      `}</style>

      {/* Hidden HTML5 Audio Element */}
      <audio
        ref={audioRef}
        src={activeTrack?.audioUrl || undefined}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      {/* Title & Introduction Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Disc className="w-6 h-6 text-pink-500 animate-spin-slow" /> ComSing Demo Hub
          </h3>
          <p className="text-xs text-slate-400">
            Immersive high-fidelity music player with synchronised audio, video, and cover artworks of your recorded songs.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="cursor-pointer self-start sm:self-center flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl text-xs font-sans font-bold shadow-lg shadow-pink-500/10 transition-all hover:scale-[1.03]"
        >
          <Plus className="w-4 h-4" /> Upload Recorded Song
        </button>
      </div>

      {/* Grid containing Track list and Immersive player */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left column: Search, filter & list (5 cols) */}
        <div className="lg:col-span-5 bg-[#140f26]/90 border border-white/5 rounded-[32px] p-5 flex flex-col h-[640px] shadow-2xl backdrop-blur-sm">
          
          {/* Filtering bar */}
          <div className="space-y-3 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search recorded tracks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0d071c] border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 transition-colors"
              />
            </div>

            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1 mr-1">
                <Filter className="w-2.5 h-2.5" /> Genres:
              </span>
              {genresList.map((genre) => (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all ${
                    selectedGenre === genre
                      ? "bg-pink-500/15 border border-pink-500/40 text-pink-400"
                      : "bg-[#0d071c] border border-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          {/* Tracks list scroll view */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {isLoading ? (
              <div className="h-full flex flex-col items-center justify-center space-y-2 text-slate-400 font-mono text-xs">
                <div className="w-5 h-5 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                <span>Scanning server vault...</span>
              </div>
            ) : filteredTracks.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-500 space-y-3">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-slate-400">
                  <Music className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-white/70">No recorded tracks found</p>
                  <p className="text-[10px] max-w-[200px]">Click 'Upload Recorded Song' to host your first master track.</p>
                </div>
              </div>
            ) : (
              filteredTracks.map((track, idx) => {
                const isSelected = activeTrack?.id === track.id;
                const originalIndex = tracks.findIndex(t => t.id === track.id);
                return (
                  <div
                    key={track.id}
                    onClick={() => {
                      setCurrentTrackIndex(originalIndex);
                      setIsPlaying(true);
                    }}
                    className={`group relative flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-300 border ${
                      isSelected
                        ? "bg-gradient-to-r from-pink-500/15 to-purple-500/5 border-pink-500/35"
                        : "bg-[#1c1433]/40 border-white/5 hover:bg-[#1c1433]/80 hover:border-white/10"
                    }`}
                  >
                    {/* Track Artwork Thumbnail */}
                    <div className="w-11 h-11 rounded-xl bg-slate-950 overflow-hidden relative shrink-0 flex items-center justify-center border border-white/5 shadow-inner">
                      {track.imageUrl ? (
                        <img
                          src={track.imageUrl}
                          alt={track.title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <Disc className={`w-5 h-5 text-purple-400 ${isSelected && isPlaying ? "animate-spin-slow" : ""}`} />
                      )}
                      
                      {/* Hover action overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        {isSelected && isPlaying ? (
                          <Pause className="w-4 h-4 text-white" />
                        ) : (
                          <Play className="w-4 h-4 text-white fill-white" />
                        )}
                      </div>
                    </div>

                    {/* Meta info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-xs font-bold truncate ${isSelected ? "text-pink-400 font-sans" : "text-white"}`}>
                          {track.title}
                        </p>
                        {track.videoUrl && (
                          <span className="text-[8px] bg-cyan-500/15 text-cyan-400 px-1 rounded uppercase font-mono tracking-widest flex items-center gap-0.5">
                            <Video className="w-2 h-2" /> Film
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">{track.artist}</p>
                      
                      {/* Extra info */}
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-[8px] font-mono text-slate-500 uppercase">{track.genre}</span>
                        <span className="text-[8px] text-slate-600">•</span>
                        <span className="text-[8px] font-mono text-slate-500">{track.duration || "2:45"}</span>
                        {track.score !== undefined && (
                          <>
                            <span className="text-[8px] text-slate-600">•</span>
                            <span className="text-[9px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                              🎤 {track.score}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions and indicators */}
                    <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                      {/* Heart (Upvote) Button */}
                      <button
                        onClick={(e) => handleLikeTrack(track.id, e)}
                        className={`p-2.5 rounded-xl transition-all duration-300 transform hover:scale-125 active:scale-90 flex items-center gap-1.5 border relative overflow-visible ${
                          upvotedTrackIds.includes(track.id)
                            ? "text-rose-400 bg-rose-500/15 border-rose-500/30 hover:bg-rose-500/25 shadow-sm shadow-rose-500/10"
                            : "text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border-transparent hover:border-rose-500/20"
                        }`}
                        title={upvotedTrackIds.includes(track.id) ? "Remove upvote" : "Upvote track"}
                      >
                        <Heart className={`w-4 h-4 transition-transform duration-300 ${upvotedTrackIds.includes(track.id) ? "fill-rose-500 scale-125 text-rose-500 animate-pulse" : ""}`} />
                        {track.likes > 0 && (
                          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                            upvotedTrackIds.includes(track.id) ? "bg-rose-500/20 text-rose-300" : "bg-slate-800 text-slate-300"
                          }`}>
                            {track.likes}
                          </span>
                        )}

                        {/* Floating Hearts Particle Burst */}
                        <div className="absolute inset-0 pointer-events-none overflow-visible">
                          {heartBursts.filter(h => h.buttonId === track.id).map(h => (
                            <span
                              key={h.id}
                              className="absolute animate-heart-float text-rose-500 fill-rose-500 select-none pointer-events-none"
                              style={{
                                left: `${h.x}px`,
                                top: `${h.y}px`,
                                fontSize: `${h.size}px`,
                                animationDelay: `${h.delay}s`,
                                '--angle': `${h.angle}deg`,
                                '--dx': `${h.dx}px`,
                              } as React.CSSProperties}
                            >
                              ❤️
                            </span>
                          ))}
                        </div>
                      </button>

                      {/* 3 Dots Actions Dropdown */}
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuTrackId(prev => prev === track.id ? null : track.id);
                          }}
                          className={`p-2 rounded-xl transition-all duration-300 transform hover:scale-110 active:scale-95 border ${
                            activeMenuTrackId === track.id
                              ? "text-pink-400 bg-pink-500/10 border-pink-500/20"
                              : "text-slate-400 hover:text-pink-400 hover:bg-pink-500/10 border-transparent hover:border-pink-500/10"
                          }`}
                          title="More actions"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>

                        {activeMenuTrackId === track.id && (
                          <>
                            {/* Full viewport click-away dismiss handler */}
                            <div
                              className="fixed inset-0 z-40 cursor-default"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuTrackId(null);
                              }}
                            />
                            
                            {/* Dropdown Menu Box */}
                            <div className="absolute right-0 mt-2 w-48 bg-[#140f26] border border-white/10 rounded-2xl py-1.5 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuTrackId(null);
                                  handleEditTrackClick(track, e);
                                }}
                                className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:text-pink-400 hover:bg-pink-500/10 flex items-center gap-2 transition-colors"
                              >
                                <Pencil className="w-3.5 h-3.5 text-pink-500" />
                                <span>Edit track details</span>
                              </button>
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuTrackId(null);
                                  handleDeleteTrack(track.id, e);
                                }}
                                className="w-full text-left px-4 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 flex items-center gap-2 transition-colors border-t border-white/5 mt-1 pt-2"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                <span>Delete track</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right column: Cinematic interactive player (7 cols) */}
        <div className="lg:col-span-7 bg-[#140f26]/90 border border-white/5 rounded-[32px] p-6 flex flex-col justify-between h-[640px] shadow-2xl relative overflow-hidden backdrop-blur-sm">
          
          {/* Cinematic Background Gradient */}
          <div className="absolute inset-0 bg-radial-gradient(circle_at_top,rgba(236,72,153,0.04),transparent_65%) pointer-events-none z-0" />

          {/* Player Display Stage */}
          <div className="relative z-10 flex-1 flex flex-col justify-between">
            {activeTrack ? (
              <div className="w-full flex-1 flex flex-col justify-between space-y-4">
                
                {/* Visualizer screen / Video theater */}
                <div className="w-full h-72 md:h-80 bg-slate-950 rounded-2xl border border-white/10 overflow-hidden relative flex items-center justify-center group shadow-2xl">
                  
                  {activeTrack.videoUrl ? (
                    <video
                      ref={videoRef}
                      src={activeTrack.videoUrl}
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={handleLoadedMetadata}
                      onEnded={handleEnded}
                      className="w-full h-full object-contain"
                      playsInline
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                      {/* Cover card background blur */}
                      {activeTrack.imageUrl && (
                        <div 
                          className="absolute inset-0 bg-cover bg-center filter blur-xl opacity-20 pointer-events-none"
                          style={{ backgroundImage: `url(${activeTrack.imageUrl})` }}
                        />
                      )}

                      {/* Spinning Vinyl Vinyl disc cover */}
                      <div className="relative">
                        <div className={`w-32 h-32 rounded-full bg-slate-900 border-4 border-slate-850 flex items-center justify-center shadow-2xl relative overflow-hidden ${
                          isPlaying ? "animate-spin-slow" : ""
                        }`}>
                          {activeTrack.imageUrl ? (
                            <img
                              src={activeTrack.imageUrl}
                              alt={activeTrack.title}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <Disc className="w-12 h-12 text-slate-600" />
                          )}
                          
                          {/* Inner Vinyl Center circle */}
                          <div className="absolute w-8 h-8 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#11052c]" />
                          </div>
                        </div>

                        {/* Tone arm emulated element */}
                        <div className={`absolute top-0 -right-4 w-12 h-16 origin-top-left transition-transform duration-700 ${
                          isPlaying ? "rotate-12" : "rotate-0"
                        }`}>
                          <div className="w-1 h-12 bg-slate-400 rounded-full ml-4 shadow" />
                          <div className="w-3 h-3 bg-pink-400 rounded-sm ml-3 shadow" />
                        </div>
                      </div>

                      {/* Floating ambient status */}
                      <p className="text-[10px] font-mono text-pink-400 tracking-widest uppercase mt-4 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 animate-pulse" /> Playing Master Track
                      </p>
                    </div>
                  )}

                  {/* Visualizer reactive waveform Overlay */}
                  <div className="absolute bottom-3 inset-x-4 h-12 flex items-end justify-center gap-1 pointer-events-none opacity-40 select-none">
                    {waveformBars.map((h, i) => (
                      <div
                        key={i}
                        className="w-1 bg-gradient-to-t from-pink-500 to-cyan-400 rounded-t transition-all duration-150"
                        style={{ height: isPlaying ? `${h}%` : "15%" }}
                      />
                    ))}
                  </div>
                </div>

                {/* Track details info */}
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 bg-pink-500/10 border border-pink-500/20 text-[9px] font-mono text-pink-400 rounded-lg uppercase tracking-wider">
                        {activeTrack.genre}
                      </span>
                      {activeTrack.score !== undefined && (
                        <span className="px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 text-[9px] font-mono text-cyan-400 rounded-lg uppercase tracking-wider flex items-center gap-1">
                          🎤 Score: <span className="font-bold">{activeTrack.score}</span>/100
                        </span>
                      )}
                    </div>
                    <h4 className="text-base font-bold text-white mt-1.5 truncate">{activeTrack.title}</h4>
                    <p className="text-xs text-slate-400 font-sans truncate">{activeTrack.artist}</p>
                    {activeTrack.description && (
                      <p className="text-[11px] text-slate-500 mt-2 line-clamp-2 italic font-sans max-w-lg">
                        "{activeTrack.description}"
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-[10px] text-slate-500 font-mono">
                      Recorded: {new Date(activeTrack.createdAt).toLocaleDateString()}
                    </span>

                    {/* Active Track Heart Upvote button */}
                    <button
                      onClick={(e) => handleLikeTrack(activeTrack.id, e)}
                      className={`px-3.5 py-1.5 rounded-full transition-all duration-300 transform hover:scale-110 active:scale-95 flex items-center gap-2 border text-xs font-semibold relative overflow-visible ${
                        upvotedTrackIds.includes(activeTrack.id)
                          ? "text-rose-400 bg-rose-500/25 border-rose-500/30 shadow-lg shadow-rose-500/10"
                          : "text-slate-300 hover:text-rose-400 hover:bg-rose-500/10 border-slate-800 hover:border-rose-500/20 bg-slate-900/60"
                      }`}
                      title={upvotedTrackIds.includes(activeTrack.id) ? "Remove upvote" : "Upvote track"}
                    >
                      <Heart className={`w-4 h-4 transition-transform duration-300 ${upvotedTrackIds.includes(activeTrack.id) ? "fill-rose-500 scale-125 text-rose-500 animate-pulse" : ""}`} />
                      <span className="font-mono">{activeTrack.likes} {activeTrack.likes === 1 ? "Upvote" : "Upvotes"}</span>

                      {/* Floating Hearts Particle Burst */}
                      <div className="absolute inset-0 pointer-events-none overflow-visible">
                        {heartBursts.filter(h => h.buttonId === activeTrack.id).map(h => (
                          <span
                            key={h.id}
                            className="absolute animate-heart-float text-rose-500 fill-rose-500 select-none pointer-events-none"
                            style={{
                              left: `${h.x}px`,
                              top: `${h.y}px`,
                              fontSize: `${h.size}px`,
                              animationDelay: `${h.delay}s`,
                              '--angle': `${h.angle}deg`,
                              '--dx': `${h.dx}px`,
                            } as React.CSSProperties}
                          >
                            ❤️
                          </span>
                        ))}
                      </div>
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-500 space-y-4">
                <div className="w-16 h-16 rounded-[24px] bg-[#1c1433] border border-white/5 flex items-center justify-center text-pink-400 animate-pulse">
                  <Disc className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">ComSing High-Fi Audiophile Stage</h4>
                  <p className="text-xs max-w-xs leading-relaxed">
                    Select any recorded song from the left inventory to start playing high-fidelity synced media, or upload a custom composition.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Player controls deck */}
          <div className="mt-6 pt-4 border-t border-white/5 relative z-10 space-y-4">
            
            {/* Progress Slider bar */}
            <div className="space-y-1">
              <div className="relative">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={(e) => handleScrub(Number(e.target.value))}
                  disabled={!activeTrack}
                  className="w-full h-1 bg-[#0d071c] rounded-lg appearance-none cursor-pointer accent-pink-500 focus:outline-none disabled:opacity-30 disabled:cursor-not-allowed"
                />
              </div>
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Deck buttons row */}
            <div className="flex items-center justify-between gap-4">
              
              {/* Loop and play modifiers */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsLooping(!isLooping)}
                  disabled={!activeTrack}
                  className={`p-2 rounded-xl transition-all ${
                    isLooping 
                      ? "text-pink-400 bg-pink-500/10 border border-pink-500/20" 
                      : "text-slate-400 hover:text-white"
                  } disabled:opacity-30`}
                  title="Repeat track"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Central playback control deck */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrevTrack}
                  disabled={tracks.length <= 1}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all disabled:opacity-30"
                  title="Previous Track"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                <button
                  onClick={handleTogglePlay}
                  className="w-12 h-12 rounded-full bg-pink-500 hover:bg-pink-600 text-slate-950 flex items-center justify-center cursor-pointer shadow-lg shadow-pink-500/20 transition-all hover:scale-105 active:scale-95"
                  title={isPlaying ? "Pause Track" : "Play Track"}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 text-slate-950 fill-slate-950" />
                  ) : (
                    <Play className="w-5 h-5 text-slate-950 fill-slate-950 ml-0.5" />
                  )}
                </button>

                <button
                  onClick={handleNextTrack}
                  disabled={tracks.length <= 1}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all disabled:opacity-30"
                  title="Next Track"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>

              {/* Volume controller card */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  disabled={!activeTrack}
                  className="p-2 text-slate-400 hover:text-white transition-colors"
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-pink-500" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={volume}
                  onChange={(e) => {
                    setVolume(Number(e.target.value));
                    setIsMuted(false);
                  }}
                  disabled={!activeTrack}
                  className="w-16 h-1 bg-[#0d071c] rounded-lg appearance-none cursor-pointer accent-pink-500 focus:outline-none disabled:opacity-30"
                  title="Volume level"
                />
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* ================== UPLOAD RECORDED SONG MODAL ================== */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[1000] flex items-center justify-center p-4">
          <div className="bg-[#1c1433] border border-white/10 rounded-[32px] w-full max-w-xl p-6 shadow-2xl space-y-6 text-left relative overflow-hidden">
            
            {/* Modal Ambient Glow */}
            <div className="absolute inset-0 bg-radial-gradient(circle_at_top,rgba(168,85,247,0.1),transparent_70%) pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between">
              <div>
                <h4 className="text-lg font-bold text-white flex items-center gap-2">
                  <UploadCloud className="w-5.5 h-5.5 text-pink-500" /> Upload Demo Masterpiece
                </h4>
                <p className="text-xs text-slate-400">Save your ComSing high-fidelity vocal session permanently to the vault.</p>
              </div>
              <button
                onClick={() => {
                  if (!isUploading) setShowUploadModal(false);
                }}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="relative z-10 space-y-4">
              
              {/* Grid with Title, Artist */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Song Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dreamer's Symphony"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    className="w-full bg-[#0d071c] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Artist / Vocalist</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Luna Star (AI Voice)"
                    value={uploadArtist}
                    onChange={(e) => setUploadArtist(e.target.value)}
                    className="w-full bg-[#0d071c] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500 transition-colors"
                  />
                </div>
              </div>

              {/* Genre & Description */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5 md:col-span-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Genre Category</label>
                  <select
                    value={uploadGenre}
                    onChange={(e) => setUploadGenre(e.target.value)}
                    className="w-full bg-[#0d071c] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500 transition-colors"
                  >
                    <option value="K-Pop">K-Pop</option>
                    <option value="Synthpop / Dream Pop">Synthpop</option>
                    <option value="Classic Rock">Classic Rock</option>
                    <option value="C-Pop / Ballad">C-Pop Ballad</option>
                    <option value="Electronic">Electronic</option>
                    <option value="Acoustic">Acoustic</option>
                  </select>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Session Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Synthesised with Saturated Harmony filter, deep venue hall."
                    value={uploadDesc}
                    onChange={(e) => setUploadDesc(e.target.value)}
                    className="w-full bg-[#0d071c] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500 transition-colors"
                  />
                </div>
              </div>

              {/* Vocal Performance Score Input on scale of 100 */}
              <div className="bg-[#0d071c]/60 border border-white/5 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Vocal Performance Score</label>
                    <p className="text-[9px] text-slate-500">Validated pitch, rhythm and tone accuracy rating (0-100)</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-pink-400 px-2.5 py-1 bg-pink-500/10 rounded-lg border border-pink-500/20">{uploadScore} PTS</span>
                </div>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={uploadScore}
                    onChange={(e) => setUploadScore(Number(e.target.value))}
                    className="w-full accent-pink-500 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={uploadScore}
                    onChange={(e) => setUploadScore(Math.max(0, Math.min(100, Number(e.target.value))))}
                    className="w-16 bg-[#0d071c] border border-white/10 rounded-xl px-2 py-1 text-center font-mono text-xs text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              {/* Drag and Drop Upload sections for audio, video, image */}
              <div className="space-y-3">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Recorded Media Uploads</label>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  
                  {/* Audio Picker card */}
                  <div className="relative border border-dashed border-white/10 hover:border-pink-500/50 rounded-2xl p-4 flex flex-col items-center justify-center text-center bg-[#0d071c]/50 transition-colors">
                    <input
                      type="file"
                      accept="audio/*,audio/mp3,audio/mpeg,audio/wav,.mp3,.wav"
                      onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <FileAudio className={`w-6 h-6 mb-1 ${audioFile ? "text-pink-400" : "text-slate-500"}`} />
                    <p className="text-[10px] font-sans text-slate-300 font-bold">
                      {audioFile ? "Audio Selected" : "Audio Track"}
                    </p>
                    <p className="text-[8px] text-slate-500 mt-0.5 truncate max-w-full px-1">
                      {audioFile ? audioFile.name : "MP3, WAV up to 15MB"}
                    </p>
                  </div>

                  {/* Video Picker card */}
                  <div className="relative border border-dashed border-white/10 hover:border-cyan-500/50 rounded-2xl p-4 flex flex-col items-center justify-center text-center bg-[#0d071c]/50 transition-colors">
                    <input
                      type="file"
                      accept="video/*,video/mp4,video/webm,.mp4,.webm"
                      onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <FileVideo className={`w-6 h-6 mb-1 ${videoFile ? "text-cyan-400" : "text-slate-500"}`} />
                    <p className="text-[10px] font-sans text-slate-300 font-bold">
                      {videoFile ? "Video Selected" : "Performance Film"}
                    </p>
                    <p className="text-[8px] text-slate-500 mt-0.5 truncate max-w-full px-1">
                      {videoFile ? videoFile.name : "MP4, WEBM clips"}
                    </p>
                  </div>

                  {/* Image Picker card */}
                  <div className="relative border border-dashed border-white/10 hover:border-purple-500/50 rounded-2xl p-4 flex flex-col items-center justify-center text-center bg-[#0d071c]/50 transition-colors">
                    <input
                      type="file"
                      accept="image/*,image/png,image/jpeg,image/jpg,image/webp,.png,.jpg,.jpeg,.webp"
                      onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <ImageIcon className={`w-6 h-6 mb-1 ${imageFile ? "text-purple-400" : "text-slate-500"}`} />
                    <p className="text-[10px] font-sans text-slate-300 font-bold">
                      {imageFile ? "Cover Artwork Added" : "Cover Image"}
                    </p>
                    <p className="text-[8px] text-slate-500 mt-0.5 truncate max-w-full px-1">
                      {imageFile ? imageFile.name : "PNG, JPG artwork"}
                    </p>
                  </div>

                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-sans font-bold transition-colors disabled:opacity-30"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="cursor-pointer flex items-center justify-center gap-2 px-5 py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-slate-950 font-bold text-xs font-sans rounded-xl shadow-lg shadow-pink-500/15 transition-all disabled:opacity-60"
                >
                  {isUploading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                      Encoding & Archiving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 text-slate-950" /> Publish Track
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ================== EDIT RECORDED SONG MODAL ================== */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[1000] flex items-center justify-center p-4">
          <div className="bg-[#1c1433] border border-white/10 rounded-[32px] w-full max-w-xl p-6 shadow-2xl space-y-6 text-left relative overflow-hidden">
            
            {/* Modal Ambient Glow */}
            <div className="absolute inset-0 bg-radial-gradient(circle_at_top,rgba(168,85,247,0.1),transparent_70%) pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between">
              <div>
                <h4 className="text-lg font-bold text-white flex items-center gap-2">
                  <Pencil className="w-5.5 h-5.5 text-pink-500" /> Edit Recorded Song Details
                </h4>
                <p className="text-xs text-slate-400">Modify metadata for this recorded track in your session vault.</p>
              </div>
              <button
                onClick={() => {
                  if (!isSavingEdit) setShowEditModal(false);
                }}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="relative z-10 space-y-4">
              
              {/* Grid with Title, Artist */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Song Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dreamer's Symphony"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-[#0d071c] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Artist / Vocalist</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Luna Star (AI Voice)"
                    value={editArtist}
                    onChange={(e) => setEditArtist(e.target.value)}
                    className="w-full bg-[#0d071c] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500 transition-colors"
                  />
                </div>
              </div>

              {/* Genre & Description */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5 md:col-span-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Genre Category</label>
                  <select
                    value={editGenre}
                    onChange={(e) => setEditGenre(e.target.value)}
                    className="w-full bg-[#0d071c] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500 transition-colors"
                  >
                    <option value="K-Pop">K-Pop</option>
                    <option value="Synthpop / Dream Pop">Synthpop</option>
                    <option value="Classic Rock">Classic Rock</option>
                    <option value="C-Pop / Ballad">C-Pop Ballad</option>
                    <option value="Electronic">Electronic</option>
                    <option value="Acoustic">Acoustic</option>
                    <option value="Pop Fav">Pop Fav</option>
                  </select>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Session Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Synthesised with Saturated Harmony filter, deep venue hall."
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="w-full bg-[#0d071c] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500 transition-colors"
                  />
                </div>
              </div>

              {/* Vocal Performance Score Input on scale of 100 */}
              <div className="bg-[#0d071c]/60 border border-white/5 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Vocal Performance Score</label>
                    <p className="text-[9px] text-slate-500">Validated pitch, rhythm and tone accuracy rating (0-100)</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-pink-400 px-2.5 py-1 bg-pink-500/10 rounded-lg border border-pink-500/20">{editScore} PTS</span>
                </div>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={editScore}
                    onChange={(e) => setEditScore(Number(e.target.value))}
                    className="w-full accent-pink-500 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editScore}
                    onChange={(e) => setEditScore(Math.max(0, Math.min(100, Number(e.target.value))))}
                    className="w-16 bg-[#0d071c] border border-white/10 rounded-xl px-2 py-1 text-center font-mono text-xs text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
                <button
                  type="button"
                  disabled={isSavingEdit}
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-sans font-bold transition-colors disabled:opacity-30"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="cursor-pointer flex items-center justify-center gap-2 px-5 py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-slate-950 font-bold text-xs font-sans rounded-xl shadow-lg shadow-pink-500/15 transition-all disabled:opacity-60"
                >
                  {isSavingEdit ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 text-slate-950" /> Save Changes
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
