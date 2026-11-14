import { useState } from 'react';
import { Droplet, Zap, Wind, Utensils, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function ResourceLab() {
  const [resources, setResources] = useState({
    water: 80,
    energy: 75,
    oxygen: 90,
    food: 85
  });

  const [baseLevel, setBaseLevel] = useState<number>(1);
  const [activeCrisis, setActiveCrisis] = useState<string | null>(null);

  const consumeResource = (resourceKey: keyof typeof resources, amount: number) => {
    setResources(prev => {
      const newValue = Math.max(0, prev[resourceKey] - amount);
      if (newValue < 20) {
        triggerCascadeEffect(resourceKey, baseLevel);
      }
      return { ...prev, [resourceKey]: newValue };
    });
  };

  const triggerCascadeEffect = (key: string, level: number) => {
    if (key === 'water') {
      if (level === 1) {
        setActiveCrisis("⚠️ WATER CRISIS (Level 1): Oxygen production halted, Hydroponics dried! (80% Performance Loss)");
        setResources(prev => ({ ...prev, oxygen: Math.max(0, prev.oxygen - 30), food: Math.max(0, prev.food - 30) }));
      } else if (level === 2) {
        setActiveCrisis("⚡ WATER CRISIS (Level 2): Smart valves engaged, Hydroponics operating at 50% efficiency.");
        setResources(prev => ({ ...prev, food: Math.max(0, prev.food - 15) }));
      } else {
        setActiveCrisis("🛡️ WATER CRISIS (Level 3): Closed-loop recycling active, crisis minimized (15% impact).");
      }
    } else if (key === 'energy') {
      if (level === 1) {
        setActiveCrisis("⚠️ POWER CRISIS (Level 1): Life support systems locked, freezing hazard! (90% System Collapse)");
        setResources(prev => ({ ...prev, water: Math.max(0, prev.water - 40), oxygen: Math.max(0, prev.oxygen - 40) }));
      } else {
        setActiveCrisis("⚡ POWER CRISIS: Power-saving mode engaged, controlled subsystem shutdown.");
      }
    }
  };

  return (
    <div className="p-6 bg-slate-950 text-cyan-400 rounded-xl border border-cyan-500/30 shadow-2xl">
      <div className="flex justify-between items-center mb-8 border-b border-cyan-800/50 pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-wider text-white">💧 RESOURCE MANAGEMENT LAB</h2>
          <p className="text-sm text-slate-400">Outpost Resource Simulation & Butterfly Effect Matrix</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-300 font-semibold">Base Level:</span>
          {[1, 2, 3].map(lvl => (
            <button
              key={lvl}
              onClick={() => setBaseLevel(lvl)}
              className={`px-4 py-2 rounded-lg font-bold transition-all ${
                baseLevel === lvl 
                  ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/50' 
                  : 'bg-slate-900 text-slate-400 border border-slate-700 hover:border-cyan-500'
              }`}
            >
              Level {lvl}
            </button>
          ))}
        </div>
      </div>

      {activeCrisis && (
        <div className="mb-6 p-4 bg-amber-950/40 border border-amber-500/50 rounded-xl flex items-center gap-3 text-amber-300 animate-pulse">
          <AlertTriangle className="w-6 h-6 shrink-0" />
          <span className="font-medium">{activeCrisis}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 bg-slate-900/80 border border-cyan-500/20 rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-3">
            <span className="flex items-center gap-2 font-bold text-cyan-300"><Droplet className="w-5 h-5 text-cyan-400" /> Water Reserve</span>
            <span className="text-lg font-mono font-bold text-white">{resources.water}%</span>
          </div>
          <div className="w-full bg-slate-800 h-3 rounded-full mb-4 overflow-hidden">
            <div className={`h-full transition-all duration-300 ${resources.water < 20 ? 'bg-red-500 animate-ping' : 'bg-cyan-500'}`} style={{ width: `${resources.water}%` }}></div>
          </div>
          <button 
            onClick={() => consumeResource('water', 25)}
            className="w-full py-2 bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-500/40 text-cyan-300 rounded-lg text-sm font-semibold transition"
          >
            Consume Water / Test (-25%)
          </button>
        </div>

        <div className="p-5 bg-slate-900/80 border border-amber-500/20 rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-3">
            <span className="flex items-center gap-2 font-bold text-amber-300"><Zap className="w-5 h-5 text-amber-400" /> Power Grid</span>
            <span className="text-lg font-mono font-bold text-white">{resources.energy}%</span>
          </div>
          <div className="w-full bg-slate-800 h-3 rounded-full mb-4 overflow-hidden">
            <div className={`h-full transition-all duration-300 ${resources.energy < 20 ? 'bg-red-500' : 'bg-amber-500'}`} style={{ width: `${resources.energy}%` }}></div>
          </div>
          <button 
            onClick={() => consumeResource('energy', 25)}
            className="w-full py-2 bg-amber-600/20 hover:bg-amber-600/40 border border-amber-500/40 text-amber-300 rounded-lg text-sm font-semibold transition"
          >
            Consume Power / Test (-25%)
          </button>
        </div>

        <div className="p-5 bg-slate-900/80 border border-emerald-500/20 rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-3">
            <span className="flex items-center gap-2 font-bold text-emerald-300"><Wind className="w-5 h-5 text-emerald-400" /> Atmosphere / Oxygen</span>
            <span className="text-lg font-mono font-bold text-white">{resources.oxygen}%</span>
          </div>
          <div className="w-full bg-slate-800 h-3 rounded-full mb-4 overflow-hidden">
            <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${resources.oxygen}%` }}></div>
          </div>
          <button 
            onClick={() => consumeResource('oxygen', 25)}
            className="w-full py-2 bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/40 text-emerald-300 rounded-lg text-sm font-semibold transition"
          >
            Deplete Oxygen (-25%)
          </button>
        </div>

        <div className="p-5 bg-slate-900/80 border border-purple-500/20 rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-3">
            <span className="flex items-center gap-2 font-bold text-purple-300"><Utensils className="w-5 h-5 text-purple-400" /> Hydroponics / Food</span>
            <span className="text-lg font-mono font-bold text-white">{resources.food}%</span>
          </div>
          <div className="w-full bg-slate-800 h-3 rounded-full mb-4 overflow-hidden">
            <div className="bg-purple-500 h-full transition-all duration-300" style={{ width: `${resources.food}%` }}></div>
          </div>
          <button 
            onClick={() => consumeResource('food', 25)}
            className="w-full py-2 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/40 text-purple-300 rounded-lg text-sm font-semibold transition"
          >
            Consume Food / Test (-25%)
          </button>
        </div>
      </div>

      <div className="mt-8 p-4 bg-slate-900 border border-cyan-500/30 rounded-xl flex items-center gap-4 text-sm text-slate-300">
        <ShieldCheck className="w-8 h-8 text-cyan-400 shrink-0" />
        <div>
          <span className="font-bold text-white">Current Base Status (Level {baseLevel}):</span>{' '}
          {baseLevel === 1 && "Primitive outpost architecture active. When resources drop below 20%, cascading crises severely impact the base by 80%."}
          {baseLevel === 2 && "Advanced outpost architecture active. Smart valves and automated sub-systems cut crisis impact in half."}
          {baseLevel === 3 && "Autonomous colony active. Closed-loop recycling systems mitigate resource drops to a minimal 15% impact."}
        </div>
      </div>
    </div>
  );
}