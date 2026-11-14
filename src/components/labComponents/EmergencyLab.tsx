import { useState } from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle, BookOpen, Play, Info, Rocket } from 'lucide-react';

export default function EmergencyLab() {
  const [activeTab, setActiveTab] = useState<'guide' | 'simulation'>('guide');
  const [isRocketFlying, setIsRocketFlying] = useState<boolean>(false);
  const [selectedScenario, setSelectedScenario] = useState<number>(1);
  const [baseLevel, setBaseLevel] = useState<number>(1);
  const [defended, setDefended] = useState<boolean>(false);

  const handleTabChange = (targetTab: 'guide' | 'simulation') => {
    if (activeTab === targetTab) return;
    setIsRocketFlying(true);
    
    setTimeout(() => {
      setActiveTab(targetTab);
    }, 300);

    setTimeout(() => {
      setIsRocketFlying(false);
    }, 700);
  };

  const scenarios = [
    {
      id: 1,
      title: "Solar Flare (X-Ray Shock)",
      type: "Instantaneous Light & Comms Shock",
      solution: "Activate Faraday Cage & Optical Filters",
      desc: "High-energy X-rays arrive in 8 minutes from active solar regions, blinding external sensors and comms.",
      damage: { 
        1: "80% System Failure (Sensors Blinded)", 
        2: "40% Partial Blackout (Auto-Filters Engaged)", 
        3: "10% Minimal Impact (Protected)" 
      }
    },
    {
      id: 2,
      title: "CME (Solar Storm)",
      type: "Plasma & Radiation Wave",
      solution: "Engage Magnetic Shield & Regolith Armor",
      desc: "Coronal Mass Ejection plasma wave traveling over days, threatening lunar surface power grids.",
      damage: { 
        1: "90% Grid & Crops Fried", 
        2: "45% Power Loss (Manual Isolation)", 
        3: "15% Deflected Successfully" 
      }
    },
    {
      id: 3,
      title: "Cabin Pressure Drop",
      type: "Micro-Meteorite Hull Breach",
      desc: "Atmosphere leaking into lunar vacuum through a high-velocity structural micrometeoroid puncture.",
      damage: { 
        1: "Critical Air Loss (Crew Unconscious)", 
        2: "40% Air Loss (Smart Doors Isolated)", 
        3: "10% Minor Loss (Auto-Sealed)" 
      }
    },
    {
      id: 4,
      title: "Hydroponics Contamination",
      type: "Toxic Mold Outbreak",
      solution: "Turn on UV Sterilization & Balance Humidity",
      desc: "Closed-loop moisture imbalance triggering toxic pathogen and mold growth over crop bays.",
      damage: { 
        1: "100% Food Loss (All Crops Spoiled)", 
        2: "50% Food Loss (Partial Harvest Saved)", 
        3: "10% Loss (Auto-UV Neutralized Mold)" 
      }
    }
  ];

  const currentScenario = scenarios.find(s => s.id === selectedScenario)!;

  return (
    <div className="relative p-6 bg-slate-950 text-cyan-400 rounded-xl border border-cyan-500/30 shadow-2xl max-w-4xl mx-auto overflow-hidden">
      {isRocketFlying && (
        <div className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center bg-slate-950/40 backdrop-blur-[2px] transition-all">
          <div className="animate-bounce text-red-400 drop-shadow-[0_0_20px_rgba(239,68,68,0.9)] flex items-center gap-2">
            <Rocket className="w-16 h-16 transform -rotate-45 animate-pulse" />
            <span className="text-white font-pixel text-lg tracking-widest">DEPLOYING PROTOCOLS...</span>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-cyan-800/50 pb-4 gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-wider text-white">🚨 EMERGENCY RESPONSE LAB</h2>
          <p className="text-xs text-slate-400">NASA Space Weather & Habitat Defense Protocols</p>
        </div>
        
        <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => handleTabChange('guide')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition-all ${
              activeTab === 'guide' ? 'bg-red-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" /> Lab Guide & Overview
          </button>
          <button
            onClick={() => handleTabChange('simulation')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition-all ${
              activeTab === 'simulation' ? 'bg-red-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Play className="w-4 h-4" /> Interactive Simulation
          </button>
        </div>
      </div>

      {activeTab === 'guide' && (
        <div className="space-y-6">
          <div className="p-5 bg-slate-900/80 border border-red-500/30 rounded-xl flex items-start gap-4">
            <Info className="w-6 h-6 text-red-400 shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-white mb-1">NASA Space Weather & Habitat Safety</h3>
              <p className="text-sm text-slate-300">
                Lunar habitats operate without Earth's magnetosphere protection, exposing crews to solar proton events, micrometeorites, and biological imbalances. Review standard NASA mitigation protocols below.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scenarios.map(sc => (
              <div key={sc.id} className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldAlert className="w-5 h-5 text-red-400" />
                  <h4 className="text-base font-bold text-white">{sc.title}</h4>
                </div>
                <p className="text-xs text-slate-400 mb-3">{sc.desc}</p>
                <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800 text-xs">
                  <span className="text-slate-400 block text-[10px]">NASA PROTOCOL:</span>
                  <span className="font-semibold text-emerald-300">{sc.solution}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'simulation' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <span className="text-xs text-slate-400">Select a threat scenario and test defense protocols across outpost levels:</span>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-300 font-semibold">Level:</span>
              {[1, 2, 3].map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setBaseLevel(lvl)}
                  className={`px-3 py-1 rounded-lg font-bold text-xs transition-all ${
                    baseLevel === lvl 
                      ? 'bg-red-500 text-white shadow-md shadow-red-500/40' 
                      : 'bg-slate-900 text-slate-400 border border-slate-700 hover:border-red-500'
                  }`}
                >
                  Lvl {lvl}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
            {scenarios.map(sc => (
              <button
                key={sc.id}
                onClick={() => { setSelectedScenario(sc.id); setDefended(false); }}
                className={`p-3 rounded-xl border text-left font-semibold text-xs transition-all ${
                  selectedScenario === sc.id
                    ? 'bg-red-950/40 border-red-500 text-red-300 shadow-lg'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-cyan-500'
                }`}
              >
                <span className="block font-mono text-[10px] opacity-70">Threat 0{sc.id}</span>
                {sc.title.split(' ')[0]} {sc.title.split(' ')[1]}
              </button>
            ))}
          </div>

          <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl mb-6">
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className="w-5 h-5 text-red-400" />
              <h3 className="text-lg font-bold text-white">{currentScenario.title}</h3>
            </div>
            <p className="text-xs text-slate-300 mb-4">{currentScenario.desc}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs mb-4">
              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">NASA PROTOCOL:</span>
                <span className="font-semibold text-emerald-300">{currentScenario.solution}</span>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">PREDICTED IMPACT (Level {baseLevel}):</span>
                <span className="font-semibold text-red-300">{currentScenario.damage[baseLevel as keyof typeof currentScenario.damage]}</span>
              </div>
            </div>

            <button
              onClick={() => setDefended(true)}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-600/30 transition flex items-center justify-center gap-2 text-sm"
            >
              <AlertTriangle className="w-4 h-4" /> Execute Defense Protocol
            </button>

            {defended && (
              <div className="mt-4 p-3 bg-emerald-950/40 border border-emerald-500/50 rounded-xl text-emerald-300 flex items-center gap-2 text-xs">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>NASA protocol successfully verified at Outpost Level {baseLevel}. Threat mitigated!</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}