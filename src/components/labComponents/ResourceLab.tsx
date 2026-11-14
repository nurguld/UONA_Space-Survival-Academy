import { useState } from 'react';
import { Droplet, Zap, Wind, Utensils, AlertTriangle, ShieldCheck, PlusCircle, BookOpen, Play, Info } from 'lucide-react';
import SpaceTransition from '../SpaceTransition';

export default function ResourceLab() {
  const [activeTab, setActiveTab] = useState<'guide' | 'simulation'>('guide');

  const [resources, setResources] = useState({
    water: 80,
    energy: 75,
    oxygen: 90,
    food: 85
  });

  const [baseLevel, setBaseLevel] = useState<number>(1);
  const [systemStatus, setSystemStatus] = useState<string>("All ECLSS systems nominal. Outpost stable.");

  const modifyResource = (targetKey: keyof typeof resources, amount: number) => {
    setResources(prev => {
      let updatedWater = prev.water;
      let updatedEnergy = prev.energy;
      let updatedOxygen = prev.oxygen;
      let updatedFood = prev.food;

      const currentTargetVal = Math.min(100, Math.max(0, prev[targetKey] + amount));
      
      if (targetKey === 'water') updatedWater = currentTargetVal;
      if (targetKey === 'energy') updatedEnergy = currentTargetVal;
      if (targetKey === 'oxygen') updatedOxygen = currentTargetVal;
      if (targetKey === 'food') updatedFood = currentTargetVal;

      const factor = baseLevel === 1 ? 0.4 : baseLevel === 2 ? 0.2 : 0.05;

      if (targetKey === 'water') {
        const delta = amount * (baseLevel === 1 ? 0.5 : 0.3);
        updatedOxygen = Math.min(100, Math.max(0, prev.oxygen + delta));
        updatedFood = Math.min(100, Math.max(0, prev.food + delta));
        setSystemStatus(`💧 Water adjustment modified ECLSS hydroponics and oxygen generation.`);
      } else if (targetKey === 'energy') {
        const delta = amount * factor;
        updatedWater = Math.min(100, Math.max(0, prev.water + delta));
        updatedOxygen = Math.min(100, Math.max(0, prev.oxygen + delta));
        setSystemStatus(`⚡ Fission power grid fluctuation impacted life support scrubbers and water recycling.`);
      } else if (targetKey === 'oxygen') {
        const delta = amount * (factor * 0.5);
        updatedEnergy = Math.min(100, Math.max(0, prev.energy + delta));
        setSystemStatus(`🌬️ Cabin partial pressure shift altered grid electrical load.`);
      } else if (targetKey === 'food') {
        if (amount < 0) {
          updatedEnergy = Math.min(100, Math.max(0, prev.energy + 10));
          updatedWater = Math.min(100, Math.max(0, prev.water - 5));
          setSystemStatus(`🍽️ Crew consumed rations: Caloric energy restored (+10%), water metabolized (-5%).`);
        } else {
          updatedEnergy = Math.min(100, Math.max(0, prev.energy - 10));
          updatedWater = Math.min(100, Math.max(0, prev.water - 10));
          setSystemStatus(`🥗 Bioregenerative harvest: Food increased, but required power (-10%) and water (-10%).`);
        }
      }

      return {
        water: Math.round(updatedWater),
        energy: Math.round(updatedEnergy),
        oxygen: Math.round(updatedOxygen),
        food: Math.round(updatedFood)
      };
    });
  };

  return (
    <div className="p-6 bg-slate-950 text-cyan-400 rounded-xl border border-cyan-500/30 shadow-2xl">
      <SpaceTransition transitionKey={activeTab} />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-cyan-800/50 pb-4 gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-wider text-white">💧 RESOURCE MANAGEMENT LAB</h2>
          <p className="text-sm text-slate-400">NASA ECLSS Standards & Interdependent Butterfly Matrix</p>
        </div>
        
        <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition-all ${
              activeTab === 'guide' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" /> Lab Guide & Overview
          </button>
          <button
            onClick={() => setActiveTab('simulation')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition-all ${
              activeTab === 'simulation' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Play className="w-4 h-4" /> Interactive Simulation
          </button>
        </div>
      </div>

      {activeTab === 'guide' && (
        <div className="space-y-6">
          <div className="p-5 bg-slate-900/80 border border-cyan-500/30 rounded-xl flex items-start gap-4">
            <Info className="w-6 h-6 text-cyan-400 shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-white mb-1">NASA ECLSS & Lunar Hab Ecosystem</h3>
              <p className="text-sm text-slate-300">
                In a lunar outpost, Environmental Control and Life Support Systems (ECLSS) maintain closed-loop resource recycling. A deficit in power or water instantly triggers cascading chain reactions across the habitat.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-slate-900/60 border border-cyan-500/20 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <Droplet className="w-6 h-6 text-cyan-400" />
                <h4 className="text-base font-bold text-white">Water Recovery System (WRS)</h4>
              </div>
              <p className="text-sm text-slate-400 mb-3">
                Achieves ~98% recovery by processing cabin humidity and wastewater. Feeds both hydroponic crop irrigation and oxygen electrolysis units.
              </p>
              <span className="text-xs font-mono text-cyan-300 bg-cyan-950/50 px-2.5 py-1 rounded border border-cyan-800/50">
                NASA Standard: 98% Closed-Loop Recovery
              </span>
            </div>

            <div className="p-5 bg-slate-900/60 border border-amber-500/20 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <Zap className="w-6 h-6 text-amber-400" />
                <h4 className="text-base font-bold text-white">Fission & Solar Power Grid</h4>
              </div>
              <p className="text-sm text-slate-400 mb-3">
                Maintains continuous power across 14-day lunar nights using fission surface reactors and regenerative fuel cells, driving thermal and life-support pumps.
              </p>
              <span className="text-xs font-mono text-amber-300 bg-amber-950/50 px-2.5 py-1 rounded border border-amber-800/50">
                NASA Standard: Surface Fission Power Grid
              </span>
            </div>

            <div className="p-5 bg-slate-900/60 border border-emerald-500/20 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <Wind className="w-6 h-6 text-emerald-400" />
                <h4 className="text-base font-bold text-white">Atmospheric Scrubbers</h4>
              </div>
              <p className="text-sm text-slate-400 mb-3">
                Regulates cabin partial pressure and strips carbon dioxide using Amine swing sorption, ensuring stable breathable air for the crew.
              </p>
              <span className="text-xs font-mono text-emerald-300 bg-emerald-950/50 px-2.5 py-1 rounded border border-emerald-800/50">
                NASA Standard: 14.7 psi Hab Pressure Control
              </span>
            </div>

            <div className="p-5 bg-slate-900/60 border border-purple-500/20 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <Utensils className="w-6 h-6 text-purple-400" />
                <h4 className="text-base font-bold text-white">Bioregenerative Crop Production</h4>
              </div>
              <p className="text-sm text-slate-400 mb-3">
                Utilizes LED growth chambers for dwarf crops. Consuming rations restores crew caloric energy, while harvesting requires dedicated power and water inputs.
              </p>
              <span className="text-xs font-mono text-purple-300 bg-purple-950/50 px-2.5 py-1 rounded border border-purple-800/50">
                NASA Standard: Space Crop Bioregeneration
              </span>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => setActiveTab('simulation')}
              className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl shadow-lg transition flex items-center gap-2 text-sm"
            >
              Proceed to Interactive Simulation <Play className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {activeTab === 'simulation' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <span className="text-sm text-slate-400">Test resource interdependence and butterfly effects in real time:</span>
            
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-300 font-semibold">Base Level:</span>
              {[1, 2, 3].map(lvl => (
                <button
                  key={lvl}
                  onClick={() => { setBaseLevel(lvl); setSystemStatus(`Base upgraded to Level ${lvl}. Matrix sensitivity updated.`); }}
                  className={`px-3 py-1 rounded-lg font-bold text-xs transition-all ${
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

          <div className="mb-6 p-4 bg-slate-900/90 border border-cyan-500/40 rounded-xl flex items-center gap-3 text-cyan-300 shadow-inner">
            <AlertTriangle className="w-5 h-5 text-cyan-400 shrink-0" />
            <span className="text-sm font-medium">{systemStatus}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-slate-900/80 border border-cyan-500/20 rounded-xl shadow-lg">
              <div className="flex justify-between items-center mb-3">
                <span className="flex items-center gap-2 font-bold text-cyan-300"><Droplet className="w-5 h-5 text-cyan-400" /> Water Reserve</span>
                <span className="text-lg font-mono font-bold text-white">{resources.water}%</span>
              </div>
              <div className="w-full bg-slate-800 h-3 rounded-full mb-4 overflow-hidden">
                <div className={`h-full transition-all duration-300 ${resources.water < 20 ? 'bg-red-500 animate-pulse' : 'bg-cyan-500'}`} style={{ width: `${resources.water}%` }}></div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => modifyResource('water', -15)} className="flex-1 py-2 bg-red-600/20 hover:bg-red-600/40 border border-red-500/40 text-red-300 rounded-lg text-xs font-semibold transition">
                  Consume (-15%)
                </button>
                <button onClick={() => modifyResource('water', 15)} className="flex-1 py-2 bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-500/40 text-cyan-300 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1">
                  <PlusCircle className="w-3.5 h-3.5" /> Replenish (+15%)
                </button>
              </div>
            </div>

            <div className="p-5 bg-slate-900/80 border border-amber-500/20 rounded-xl shadow-lg">
              <div className="flex justify-between items-center mb-3">
                <span className="flex items-center gap-2 font-bold text-amber-300"><Zap className="w-5 h-5 text-amber-400" /> Power Grid</span>
                <span className="text-lg font-mono font-bold text-white">{resources.energy}%</span>
              </div>
              <div className="w-full bg-slate-800 h-3 rounded-full mb-4 overflow-hidden">
                <div className={`h-full transition-all duration-300 ${resources.energy < 20 ? 'bg-red-500' : 'bg-amber-500'}`} style={{ width: `${resources.energy}%` }}></div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => modifyResource('energy', -15)} className="flex-1 py-2 bg-red-600/20 hover:bg-red-600/40 border border-red-500/40 text-red-300 rounded-lg text-xs font-semibold transition">
                  Draw Power (-15%)
                </button>
                <button onClick={() => modifyResource('energy', 15)} className="flex-1 py-2 bg-amber-600/20 hover:bg-amber-600/40 border border-amber-500/40 text-amber-300 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1">
                  <PlusCircle className="w-3.5 h-3.5" /> Generate (+15%)
                </button>
              </div>
            </div>

            <div className="p-5 bg-slate-900/80 border border-emerald-500/20 rounded-xl shadow-lg">
              <div className="flex justify-between items-center mb-3">
                <span className="flex items-center gap-2 font-bold text-emerald-300"><Wind className="w-5 h-5 text-emerald-400" /> Atmosphere / Oxygen</span>
                <span className="text-lg font-mono font-bold text-white">{resources.oxygen}%</span>
              </div>
              <div className="w-full bg-slate-800 h-3 rounded-full mb-4 overflow-hidden">
                <div className={`h-full transition-all duration-300 ${resources.oxygen < 20 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${resources.oxygen}%` }}></div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => modifyResource('oxygen', -15)} className="flex-1 py-2 bg-red-600/20 hover:bg-red-600/40 border border-red-500/40 text-red-300 rounded-lg text-xs font-semibold transition">
                  Deplete (-15%)
                </button>
                <button onClick={() => modifyResource('oxygen', 15)} className="flex-1 py-2 bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/40 text-emerald-300 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1">
                  <PlusCircle className="w-3.5 h-3.5" /> Release (+15%)
                </button>
              </div>
            </div>

            <div className="p-5 bg-slate-900/80 border border-purple-500/20 rounded-xl shadow-lg">
              <div className="flex justify-between items-center mb-3">
                <span className="flex items-center gap-2 font-bold text-purple-300"><Utensils className="w-5 h-5 text-purple-400" /> Hydroponics / Food</span>
                <span className="text-lg font-mono font-bold text-white">{resources.food}%</span>
              </div>
              <div className="w-full bg-slate-800 h-3 rounded-full mb-4 overflow-hidden">
                <div className="bg-purple-500 h-full transition-all duration-300" style={{ width: `${resources.food}%` }}></div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => modifyResource('food', -15)} className="flex-1 py-2 bg-red-600/20 hover:bg-red-600/40 border border-red-500/40 text-red-300 rounded-lg text-xs font-semibold transition">
                  Consume Food (+Energy)
                </button>
                <button onClick={() => modifyResource('food', 15)} className="flex-1 py-2 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/40 text-purple-300 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1">
                  <PlusCircle className="w-3.5 h-3.5" /> Harvest (-Energy)
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-slate-900 border border-cyan-500/30 rounded-xl flex items-center gap-4 text-sm text-slate-300">
            <ShieldCheck className="w-8 h-8 text-cyan-400 shrink-0" />
            <div>
              <span className="font-bold text-white">NASA ECLSS Matrix Active (Level {baseLevel}):</span>{' '}
              {baseLevel === 1 && "Consuming food restores crew energy while crop cultivation consumes grid power and WRS water."}
              {baseLevel === 2 && "Automated greenhouse regulators optimize power consumption during crop cycles by 50%."}
              {baseLevel === 3 && "Advanced closed-loop architecture achieves near-zero resource dissipation across all subsystems."}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}