import React, { useState, useEffect } from "react";
import { Mic, Activity, Zap, Check, Trophy, HeartPulse } from "lucide-react";
import { VocalID } from "../types";

interface VocalIDViewProps {
  vocalID: VocalID | null;
  onVocalIDCreated: (id: VocalID) => void;
}

export default function VocalIDView({ vocalID, onVocalIDCreated }: VocalIDViewProps) {
  const [singingExperience, setSingingExperience] = useState("Casual Hobbyist");
  const [favoriteGenre, setFavoriteGenre] = useState("Pop / R&B");
  const [genderVibe, setGenderVibe] = useState("high");
  const [calibrating, setCalibrating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeFrequencies, setActiveFrequencies] = useState<number[]>(Array(15).fill(10));
  const [isDone, setIsDone] = useState(false);

  // Frequency simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (calibrating) {
      interval = setInterval(() => {
        setActiveFrequencies(Array.from({ length: 15 }, () => Math.floor(Math.random() * 80) + 10));
        setProgress((prev) => {
          if (prev >= 100) {
            setCalibrating(false);
            clearInterval(interval);
            fetchVocalProfile();
            return 100;
          }
          return prev + 10;
        });
      }, 300);
    }
    return () => clearInterval(interval);
  }, [calibrating]);

  const startCalibration = () => {
    setCalibrating(true);
    setProgress(0);
    setIsDone(false);
  };

  const fetchVocalProfile = async () => {
    try {
      const response = await fetch("/api/vocal-id/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ singingExperience, favoriteGenre, genderVibe }),
      });
      const data = await response.json();
      onVocalIDCreated(data);
      setIsDone(true);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-slate-900 border border-purple-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Activity className="w-24 h-24 text-cyan-500" />
      </div>

      <h3 className="text-xl font-sans font-medium text-white mb-2 flex items-center gap-2">
        <span className="p-1 px-2.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30 font-mono text-xs text-uppercase">VocalID™ Engine</span>
        Voice DNA Profile
      </h3>
      <p className="text-sm text-slate-400 mb-6">
        Map your custom vocal range, power, and timbre. Your unique digital voice print synchronizes with AI engines to optimize dynamic idol harmonies.
      </p>

      {!vocalID ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono text-purple-300 uppercase mb-2">Singing Experience</label>
              <select
                value={singingExperience}
                onChange={(e) => setSingingExperience(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
              >
                <option>Shower VIP (Total Beginner)</option>
                <option>Casual Hobbyist</option>
                <option>Aspiring Vocal Artist</option>
                <option>Professional Performer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-purple-300 uppercase mb-2">Preferred Style</label>
              <select
                value={favoriteGenre}
                onChange={(e) => setFavoriteGenre(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
              >
                <option>Pop / R&B</option>
                <option>Synthpop / Dream Pop</option>
                <option>Classic Rock</option>
                <option>C-Pop / Ballad</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-purple-300 uppercase mb-2">Voice Style Target</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setGenderVibe("high")}
                  className={`py-2 px-3 text-xs font-sans rounded-lg border transition ${
                    genderVibe === "high"
                      ? "bg-purple-500/10 border-purple-500 text-white"
                      : "bg-slate-950 border-slate-800 text-slate-400"
                  }`}
                >
                  Soprano / Tenor
                </button>
                <button
                  type="button"
                  onClick={() => setGenderVibe("low")}
                  className={`py-2 px-3 text-xs font-sans rounded-lg border transition ${
                    genderVibe === "low"
                      ? "bg-purple-500/10 border-purple-500 text-white"
                      : "bg-slate-950 border-slate-800 text-slate-400"
                  }`}
                >
                  Alto / Baritone
                </button>
              </div>
            </div>
          </div>

          {!calibrating && !isDone && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center text-center">
              <p className="text-xs font-mono text-cyan-400 mb-3 uppercase tracking-wider flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5" /> Mic Ready for Calibration
              </p>
              <button
                onClick={startCalibration}
                className="cursor-pointer px-6 py-2.5 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-cyan-500 text-white hover:opacity-90 font-sans font-medium rounded-lg text-sm transition shadow-lg shadow-purple-900/40"
              >
                Start Vocal ID Test Setup
              </button>
              <p className="text-[11px] text-slate-500 mt-2">
                *Requires singing simple sustained vowels for 5 seconds to map sound frequencies.
              </p>
            </div>
          )}

          {calibrating && (
            <div className="bg-slate-950 border border-purple-500/30 rounded-xl p-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-mono text-purple-300">CALIBRATING YOUR VOCAL FREQUENCY...</span>
                <span className="text-xs font-mono text-cyan-400">{progress}%</span>
              </div>
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mb-6">
                <div
                  className="bg-gradient-to-r from-purple-500 to-cyan-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Responsive Soundwaves simulation */}
              <div className="flex justify-center items-end gap-1 h-16 mb-4">
                {activeFrequencies.map((val, idx) => (
                  <div
                    key={idx}
                    className="w-1.5 bg-purple-500 rounded-full transition-all duration-150"
                    style={{
                      height: `${val}%`,
                      opacity: 0.3 + (val / 100) * 0.7,
                      backgroundColor: idx % 3 === 0 ? "#ec4899" : idx % 3 === 1 ? "#3b82f6" : "#a855f7",
                    }}
                  />
                ))}
              </div>
              <p className="text-xs font-mono text-center text-slate-400 italic">
                Sing: "Ahhhhh-Ooooh-Eeeeeh" in comfortable pitches
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active Vocal Passport Dashboard details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <p className="text-[10px] font-mono text-slate-500 uppercase">VOCAL PASSPORT ID</p>
                <p className="text-lg font-mono font-bold text-cyan-400">{vocalID.vocalIDNumber}</p>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Power Engine</span>
                  <span className="font-mono text-white">{vocalID.vocalDNA.power}%</span>
                </div>
                <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full" style={{ width: `${vocalID.vocalDNA.power}%` }} />
                </div>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Breath Control</span>
                  <span className="font-mono text-white">{vocalID.vocalDNA.breath}%</span>
                </div>
                <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                  <div className="bg-pink-500 h-full" style={{ width: `${vocalID.vocalDNA.breath}%` }} />
                </div>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <p className="text-[10px] font-mono text-slate-500 uppercase">VOCAL REPERTOIRE</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl font-bold text-white">{vocalID.pitchRange}</span>
                  <span className="text-[10px] font-mono text-purple-400">({vocalID.timbre})</span>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Vocal Range Depth</span>
                  <span className="font-mono text-white">{vocalID.vocalDNA.rangeScore}%</span>
                </div>
                <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                  <div className="bg-cyan-500 h-full" style={{ width: `${vocalID.vocalDNA.rangeScore}%` }} />
                </div>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Vocal Pitch Stability</span>
                  <span className="font-mono text-white">{vocalID.vocalDNA.stability}%</span>
                </div>
                <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full" style={{ width: `${vocalID.vocalDNA.stability}%` }} />
                </div>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center border border-yellow-500/30">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-[10px] font-mono text-slate-500">EXPERIENCE RANK</p>
                  <p className="text-sm font-sans font-medium text-white">{vocalID.level} (XP {vocalID.xp})</p>
                </div>
              </div>

              <div className="mt-4 border-t border-slate-900 pt-3">
                <p className="text-[10px] font-mono text-slate-500 mb-1.5 uppercase">Unlocked Badge</p>
                <div className="flex items-center gap-1 text-xs text-yellow-400 font-mono">
                  <Zap className="w-3.5 h-3.5 fill-current" /> Born To Harmony
                </div>
              </div>

              <button
                onClick={startCalibration}
                className="cursor-pointer w-full mt-3 py-1.5 border border-purple-500/20 text-purple-400 hover:bg-purple-500/10 font-sans font-medium rounded-lg text-xs transition"
              >
                Re-Calibrate DNA Voice
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-gradient-to-r from-purple-900/30 to-slate-900 border border-purple-500/20 rounded-xl p-3">
            <HeartPulse className="w-5 h-5 text-pink-500" />
            <span className="text-xs text-purple-200">
              <strong>Engine Sync Alert:</strong> Your <strong>Vocal DNA Profile</strong> was updated and exported to the dynamic AI Duet harmonizer!
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
