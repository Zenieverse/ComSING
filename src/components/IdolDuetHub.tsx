import React from "react";
import { Mic2, Flame, Award, Heart, CheckCircle2, UserCheck } from "lucide-react";

interface Idol {
  id: string;
  name: string;
  genre: string;
  style: string;
  bio: string;
  vrange: string;
  popularity: string;
  gradient: string;
  challengeActive: string;
  isAi: boolean;
}

const IDOLS: Idol[] = [
  {
    id: "kai",
    name: "Kai Shin",
    genre: "K-Pop / Dance",
    style: "Crisp, Sync-perfect Tenor",
    bio: "Next-gen virtual dance icon known for rapid pitch syncopation and hyper-melodic hooks.",
    vrange: "C3 - B4",
    popularity: "9.2M listeners",
    gradient: "from-pink-500 via-purple-600 to-indigo-500",
    challengeActive: "Sync Battle Week active",
    isAi: true,
  },
  {
    id: "luna",
    name: "Luna Vance",
    genre: "Synthpop / Cyber",
    style: "Ethereal, Silky Whispering Alto",
    bio: "Independent cyber-reverb diva sweeping listeners across space-like harmonies and delay filters.",
    vrange: "E3 - D5",
    popularity: "5.8M listeners",
    gradient: "from-blue-500 to-cyan-400",
    challengeActive: "Vox Timbre Challenge active",
    isAi: true,
  },
  {
    id: "alistair",
    name: "Alistair Wilde",
    genre: "Vintage Rock / Blues",
    style: "Gritty, Gravelly Chest Baritone",
    bio: "Licensed legendary rock-star vocal model trained to harmonize raw, rasping chest dynamics.",
    vrange: "G2 - G4",
    popularity: "11.4M listeners",
    gradient: "from-amber-600 to-red-500",
    challengeActive: "Nostalgia Rock Battle open",
    isAi: false,
  },
  {
    id: "mei",
    name: "Mei Jing",
    genre: "C-Pop / Folk Ballad",
    style: "Silky Soprano & Falsetto Art",
    bio: "Holographic opera and modern pop legend with breath stability and crystalline ranges.",
    vrange: "A3 - F5",
    popularity: "8.1M listeners",
    gradient: "from-rose-400 to-orange-400",
    challengeActive: "Bamboo Stream Folk Duets",
    isAi: true,
  }
];

interface IdolDuetHubProps {
  onSelectSongByIdolArtist: (artistName: string) => void;
}

export default function IdolDuetHub({ onSelectSongByIdolArtist }: IdolDuetHubProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Mic2 className="w-5.5 h-5.5 text-pink-500" />
            Idol Collaboration Hub
          </h2>
          <p className="text-sm text-slate-400">
            Duet, harmonize, and perform with licensed virtual singers, AI idol voices, and award-winning artists.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-400">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Dynamic Sync Active
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {IDOLS.map((idol) => (
          <div
            key={idol.id}
            className="group relative bg-slate-900 border border-slate-800 hover:border-purple-500/30 rounded-2xl p-5 shadow-lg transition-all duration-300 flex flex-col justify-between"
          >
            {/* Visual gradient backdrop overlay */}
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r rounded-t-2xl" style={{ backgroundImage: `linear-gradient(to right, ${idol.gradient})` }} />

            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                    {idol.name}
                  </h3>
                  <span className="text-[10px] uppercase font-mono text-purple-400">{idol.genre}</span>
                </div>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-950 text-cyan-400 border border-slate-800 flex items-center gap-1">
                  {idol.isAi ? "AI IDOL" : "STATION VERIFIED"}
                </span>
              </div>

              {/* Bio description */}
              <p className="text-xs text-slate-400 leading-relaxed min-h-[50px]">{idol.bio}</p>

              {/* Range & Style tags */}
              <div className="bg-slate-950 rounded-xl p-3 border border-slate-900 space-y-1">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-slate-500">ACCENT:</span>
                  <span className="text-slate-300 truncate max-w-[130px]">{idol.style}</span>
                </div>
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-slate-500">KEY RANGE:</span>
                  <span className="text-cyan-400">{idol.vrange}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-950 space-y-3">
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3 text-pink-500 fill-current" /> {idol.popularity}
                </span>
                <span className="text-yellow-500 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-yellow-500" /> {idol.challengeActive}
                </span>
              </div>

              <button
                onClick={() => onSelectSongByIdolArtist(idol.name)}
                className="cursor-pointer w-full py-2 bg-slate-950 group-hover:bg-purple-600/10 border border-slate-800 group-hover:border-purple-500/40 text-xs font-sans text-slate-300 group-hover:text-white font-medium rounded-lg transition-all duration-300 flex items-center justify-center gap-1.5"
              >
                <UserCheck className="w-3.5 h-3.5" /> Select Duet Catalog
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
