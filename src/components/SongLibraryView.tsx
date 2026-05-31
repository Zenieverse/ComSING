import React, { useState } from "react";
import { Search, Music, Sparkles, SlidersHorizontal, ChevronRight, Activity } from "lucide-react";
import { Song } from "../types";

interface SongLibraryViewProps {
  songs: Song[];
  selectedSong: Song | null;
  onSongSelect: (song: Song) => void;
  onStartRecord: (mode: "Solo" | "Duet" | "Trio") => void;
}

export default function SongLibraryView({
  songs,
  selectedSong,
  onSongSelect,
  onStartRecord,
}: SongLibraryViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");

  const genres = ["All", "K-Pop", "Synthpop / Dream Pop", "Classic Rock", "C-Pop / Ballad"];
  const difficulties = ["All", "Easy", "Medium", "Hard"];

  const filteredSongs = songs.filter((song) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      song.title.toLowerCase().includes(term) ||
      song.artist.toLowerCase().includes(term) ||
      (song.composer && song.composer.toLowerCase().includes(term)) ||
      (song.lyricist && song.lyricist.toLowerCase().includes(term));
    const matchesGenre = selectedGenre === "All" || song.genre === selectedGenre;
    const matchesDifficulty = selectedDifficulty === "All" || song.difficulty === selectedDifficulty;
    return matchesSearch && matchesGenre && matchesDifficulty;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Songs search & navigation */}
      <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col h-[520px]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-sans font-medium text-white flex items-center gap-2">
            <Music className="w-5 h-5 text-purple-400" />
            Vocal Arena Song Catalogue
          </h3>
          <span className="text-xs font-mono text-slate-500">{filteredSongs.length} Tracks Available</span>
        </div>

        {/* Filters bar */}
        <div className="space-y-3 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by title, artist, composer, lyricist..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-400">
              <SlidersHorizontal className="w-3 h-3 text-purple-400" /> Style:
            </div>
            {genres.map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGenre(g)}
                className={`py-1 px-2.5 rounded-lg text-xs font-sans transition ${
                  selectedGenre === g
                    ? "bg-purple-600/20 border border-purple-500 text-purple-300"
                    : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-400">
              <Sparkles className="w-3 h-3 text-cyan-400" /> Grade:
            </div>
            {difficulties.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDifficulty(d)}
                className={`py-1 px-2.5 rounded-lg text-xs font-sans transition ${
                  selectedDifficulty === d
                    ? "bg-cyan-500/20 border border-cyan-500 text-cyan-300"
                    : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Song Listing overflow */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scroll">
          {filteredSongs.length > 0 ? (
            filteredSongs.map((song) => (
              <div
                key={song.id}
                onClick={() => onSongSelect(song)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                  selectedSong?.id === song.id
                    ? "bg-purple-950/20 border-purple-500/60 shadow-md shadow-purple-950/20"
                    : "bg-slate-950/60 border-slate-800/40 hover:bg-slate-950 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center font-mono font-bold text-sm ${
                      selectedSong?.id === song.id
                        ? "bg-purple-500 text-white"
                        : "bg-slate-900 border border-slate-800 text-purple-400"
                    }`}
                  >
                    ♩
                  </div>
                  <div>
                    <h4 className="text-sm font-sans font-medium text-white group-hover:text-purple-300 transition">
                      {song.title}
                    </h4>
                    <p className="text-xs text-slate-400">by {song.artist}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <span className="inline-block py-0.5 px-2 bg-slate-900 border border-slate-800 text-slate-300 text-[10px] font-mono rounded">
                      Range {song.range}
                    </span>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">{song.tempo} BPM</p>
                  </div>

                  <span
                    className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${
                      song.difficulty === "Easy"
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : song.difficulty === "Medium"
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                        : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                    }`}
                  >
                    {song.difficulty}
                  </span>

                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-purple-400 transition" />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-slate-500 text-sm">
              No music tracks found matching the criteria.
            </div>
          )}
        </div>
      </div>

      {/* Song Details Pane */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col h-[520px]">
        {selectedSong ? (
          <div className="flex flex-col h-full justify-between">
            <div className="space-y-4 overflow-y-auto pr-1">
              <div>
                <span className="inline-block px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-mono uppercase mb-2">
                  {selectedSong.genre}
                </span>
                <h3 className="text-lg font-bold text-white leading-tight">{selectedSong.title}</h3>
                <p className="text-sm text-purple-300 font-sans">Sing Duet with: {selectedSong.artist}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    Composer: <span className="text-purple-300">{selectedSong.composer}</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    Lyricist: <span className="text-cyan-300">{selectedSong.lyricist}</span>
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed bg-slate-950/40 p-3 border border-slate-800/40 rounded-xl">
                {selectedSong.description}
              </p>

              {/* Waveform graphic visualization */}
              <div>
                <p className="text-[10px] font-mono text-slate-500 uppercase mb-2 flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-cyan-500" /> Estimated Wave Spectrogram
                </p>
                <div className="flex items-end gap-[2px] h-12 bg-slate-950 rounded-lg p-2 border border-slate-800/50">
                  {selectedSong.audioWaveform.map((val, idx) => (
                    <div
                      key={idx}
                      className="flex-1 bg-cyan-500 rounded-t"
                      style={{
                        height: `${val}%`,
                        opacity: 0.4 + (val / 100) * 0.6,
                      }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-mono text-slate-500 uppercase mb-2">Lyric Snippet</p>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 h-24 overflow-y-auto text-xs font-mono text-slate-400 space-y-1">
                  {selectedSong.lyrics.map((l, i) => (
                    <p key={i} className="truncate">
                      {l}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {/* Start Session Recording Actions */}
            <div className="pt-4 border-t border-slate-800">
              <label className="block text-[10px] font-mono text-slate-500 uppercase mb-2">Select Arena Mode</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onStartRecord("Duet")}
                  className="cursor-pointer py-2.5 px-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:opacity-90 text-white font-sans font-medium rounded-xl text-xs transition shadow-lg shadow-purple-900/20"
                >
                  👫 Duet with {selectedSong.artist.split(" ")[0]}
                </button>
                <button
                  onClick={() => onStartRecord("Solo")}
                  className="cursor-pointer py-2.5 px-3 bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white font-sans font-medium rounded-xl text-xs transition"
                >
                  🎤 Solo Training
                </button>
              </div>
              <p className="text-[10px] text-center text-slate-500 mt-2.5">
                Each session unlocks customizable Smart Effects, Auto-Tune, and real-time Vocal coaching advice!
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <div className="w-12 h-12 rounded-full border border-dashed border-slate-800 flex items-center justify-center text-xl mb-3">
              ♫
            </div>
            <p className="text-sm">Select a song track from the catalogue tree to preview lyrics, ranges, and idol parts.</p>
          </div>
        )}
      </div>
    </div>
  );
}
