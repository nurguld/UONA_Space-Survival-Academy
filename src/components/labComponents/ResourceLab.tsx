import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Droplet, Zap, Wind, Utensils, AlertTriangle, ShieldCheck, PlusCircle, BookOpen, Play, X } from 'lucide-react';
import { LabTransitionOverlay } from '../LabTransition';
import { useLabTransition } from '../../hooks/useLabTransition';
import ResourceLabGuide from './ResourceLabGuide';

const RESOURCE_LABELS = {
  water: 'Water',
  energy: 'Power',
  oxygen: 'Oxygen',
  food: 'Food'
} as const;

export default function ResourceLab() {
  const { activeSection: activeTab, isRocketFlying, transitionTo: handleTabChange } =
    useLabTransition<'guide' | 'simulation'>('guide');

  const [resources, setResources] = useState({
    water: 80,
    energy: 75,
    oxygen: 90,
    food: 85
  });

  const [baseLevel, setBaseLevel] = useState<number>(1);
  const [systemStatus, setSystemStatus] = useState<string>("All ECLSS systems nominal. Outpost stable.");
  const [depletedResource, setDepletedResource] = useState<keyof typeof resources | null>(null);

  useEffect(() => {
    if (!depletedResource) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setDepletedResource(null);
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [depletedResource]);

  const modifyResource = (targetKey: keyof typeof resources, amount: number) => {
    const previous = resources;
    if (amount < 0 && previous[targetKey] === 0) {
      setDepletedResource(targetKey);
      return;
    }
    const consumesWater =
      (targetKey === 'water' && amount < 0) ||
      (targetKey === 'energy' && amount < 0) ||
      targetKey === 'food';
    if (consumesWater && previous.water === 0) {
      setDepletedResource('water');
      return;
    }

    let updatedWater = previous.water;
    let updatedEnergy = previous.energy;
    let updatedOxygen = previous.oxygen;
    let updatedFood = previous.food;

    const currentTargetVal = Math.min(100, Math.max(0, previous[targetKey] + amount));
      
    if (targetKey === 'water') updatedWater = currentTargetVal;
    if (targetKey === 'energy') updatedEnergy = currentTargetVal;
    if (targetKey === 'oxygen') updatedOxygen = currentTargetVal;
    if (targetKey === 'food') updatedFood = currentTargetVal;

    const factor = baseLevel === 1 ? 0.4 : baseLevel === 2 ? 0.2 : 0.05;

    if (targetKey === 'water') {
      const delta = amount * (baseLevel === 1 ? 0.5 : 0.3);
      updatedOxygen = Math.min(100, Math.max(0, previous.oxygen + delta));
      updatedFood = Math.min(100, Math.max(0, previous.food + delta));
      setSystemStatus(`💧 Water adjustment modified ECLSS hydroponics and oxygen generation.`);
    } else if (targetKey === 'energy') {
      const delta = amount * factor;
      updatedWater = Math.min(100, Math.max(0, previous.water + delta));
      updatedOxygen = Math.min(100, Math.max(0, previous.oxygen + delta));
      updatedFood = Math.min(100, Math.max(0, previous.food + delta));
      setSystemStatus(`⚡ Solar power adjustment affected water recovery, air equipment, and garden lights in this game model.`);
    } else if (targetKey === 'oxygen') {
      setSystemStatus(`🌬️ Cabin air adjusted. In this game model, the change directly updates the air reserve only.`);
    } else if (targetKey === 'food') {
      if (amount < 0) {
        updatedEnergy = Math.min(100, Math.max(0, previous.energy + 10));
        updatedWater = Math.min(100, Math.max(0, previous.water - 5));
        setSystemStatus(`🍽️ Crew consumed rations: Caloric energy restored (+10%), water metabolized (-5%).`);
      } else {
        updatedEnergy = Math.min(100, Math.max(0, previous.energy - 10));
        updatedWater = Math.min(100, Math.max(0, previous.water - 10));
        setSystemStatus(`🥗 Bioregenerative harvest: Food increased, but required power (-10%) and water (-10%).`);
      }
    }

    const updatedResources = {
      water: Math.round(updatedWater),
      energy: Math.round(updatedEnergy),
      oxygen: Math.round(updatedOxygen),
      food: Math.round(updatedFood)
    };
    setResources(updatedResources);

    const depleted = (Object.keys(updatedResources) as (keyof typeof resources)[])
      .find((key) => previous[key] > 0 && updatedResources[key] === 0);
    if (depleted) setDepletedResource(depleted);
  };

  return (
    <div className="resource-lab relative p-6 bg-slate-950 text-cyan-400 rounded-xl border border-cyan-500/30 shadow-2xl overflow-hidden">
      <LabTransitionOverlay visible={isRocketFlying} />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-cyan-800/50 pb-4 gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-wider text-white">💧 RESOURCE MANAGEMENT LAB</h2>
          <p className="text-sm text-slate-400">Episode 01: The Last Crate of Supplies</p>
        </div>
        
        <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => handleTabChange('guide')}
            aria-pressed={activeTab === 'guide'}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition-all ${
              activeTab === 'guide' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            } resource-hud-button resource-hud-tab`}
          >
            <BookOpen className="w-4 h-4" /> Lab Guide & Overview
          </button>
          <button
            onClick={() => handleTabChange('simulation')}
            aria-pressed={activeTab === 'simulation'}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition-all ${
              activeTab === 'simulation' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            } resource-hud-button resource-hud-tab`}
          >
            <Play className="w-4 h-4" /> Interactive Simulation
          </button>
        </div>
      </div>

      <div className={activeTab === 'guide' ? '' : 'hidden'}>
        <ResourceLabGuide onStartSimulation={() => handleTabChange('simulation')} baseLevel={baseLevel} />
      </div>

      {activeTab === 'simulation' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <span className="text-sm text-slate-400">Try resource changes and watch their simplified ripple effects:</span>
            
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-300 font-semibold">Base Level:</span>
              {[1, 2, 3].map(lvl => (
                <button
                  key={lvl}
                  onClick={() => { setBaseLevel(lvl); setSystemStatus(`Base upgraded to Level ${lvl}. Matrix sensitivity updated.`); }}
                  aria-pressed={baseLevel === lvl}
                  className={`px-3 py-1 rounded-lg font-bold text-xs transition-all ${
                    baseLevel === lvl 
                      ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/50' 
                      : 'bg-slate-900 text-slate-400 border border-slate-700 hover:border-cyan-500'
                  } resource-hud-button resource-hud-level`}
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
                <button onClick={() => modifyResource('water', -15)} disabled={resources.water === 0} className="resource-hud-button resource-hud-action resource-hud-negative flex-1 py-2 bg-red-600/20 hover:bg-red-600/40 border border-red-500/40 text-red-300 rounded-lg text-xs font-semibold transition">
                  <Droplet className="w-3.5 h-3.5" /> Consume (-15%)
                </button>
                <button onClick={() => modifyResource('water', 15)} className="resource-hud-button resource-hud-action flex-1 py-2 bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-500/40 text-cyan-300 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1">
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
                <button onClick={() => modifyResource('energy', -15)} disabled={resources.energy === 0 || resources.water === 0} className="resource-hud-button resource-hud-action resource-hud-negative flex-1 py-2 bg-red-600/20 hover:bg-red-600/40 border border-red-500/40 text-red-300 rounded-lg text-xs font-semibold transition">
                  <Zap className="w-3.5 h-3.5" /> Draw Power (-15%)
                </button>
                <button onClick={() => modifyResource('energy', 15)} className="resource-hud-button resource-hud-action flex-1 py-2 bg-amber-600/20 hover:bg-amber-600/40 border border-amber-500/40 text-amber-300 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1">
                  <Zap className="w-3.5 h-3.5" /> Generate (+15%)
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
                <button onClick={() => modifyResource('oxygen', -15)} disabled={resources.oxygen === 0} className="resource-hud-button resource-hud-action resource-hud-negative flex-1 py-2 bg-red-600/20 hover:bg-red-600/40 border border-red-500/40 text-red-300 rounded-lg text-xs font-semibold transition">
                  <Wind className="w-3.5 h-3.5" /> Deplete (-15%)
                </button>
                <button onClick={() => modifyResource('oxygen', 15)} className="resource-hud-button resource-hud-action flex-1 py-2 bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/40 text-emerald-300 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1">
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
                <button onClick={() => modifyResource('food', -15)} disabled={resources.food === 0 || resources.water === 0} className="resource-hud-button resource-hud-action resource-hud-negative flex-1 py-2 bg-red-600/20 hover:bg-red-600/40 border border-red-500/40 text-red-300 rounded-lg text-xs font-semibold transition">
                  <Utensils className="w-3.5 h-3.5" /> Consume Food (+Energy)
                </button>
                <button onClick={() => modifyResource('food', 15)} disabled={resources.energy === 0 || resources.water === 0} className="resource-hud-button resource-hud-action flex-1 py-2 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/40 text-purple-300 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1">
                  <Utensils className="w-3.5 h-3.5" /> Harvest (-Energy)
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-slate-900 border border-cyan-500/30 rounded-xl flex items-center gap-4 text-sm text-slate-300">
            <ShieldCheck className="w-8 h-8 text-cyan-400 shrink-0" />
            <div>
              <span className="font-bold text-white">GAME MODEL · BASE LEVEL {baseLevel}:</span>{' '}
                  {baseLevel === 1 && "Resource changes have their strongest ripple effects in this learning model."}
                  {baseLevel === 2 && "The same action causes smaller ripple effects in this learning model."}
                  {baseLevel === 3 && "The same action causes the smallest ripple effects in this learning model."}
            </div>
          </div>
        </div>
      )}
      {depletedResource && createPortal(
        <div
          className="resource-depletion-backdrop"
          onClick={() => setDepletedResource(null)}
          role="presentation"
        >
          <section
            className="resource-depletion-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="resource-depletion-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="resource-depletion-close"
              aria-label="Close resource warning"
              onClick={() => setDepletedResource(null)}
              autoFocus
            >
              <X aria-hidden="true" />
            </button>
            <AlertTriangle className="resource-depletion-icon" aria-hidden="true" />
            <p className="resource-depletion-kicker">RESOURCE ALERT</p>
            <h3 id="resource-depletion-title">{RESOURCE_LABELS[depletedResource]} is depleted</h3>
            <p>{RESOURCE_LABELS[depletedResource]} has reached 0%. Further consumption is stopped.</p>
            <button
              type="button"
              className="resource-depletion-confirm"
              onClick={() => setDepletedResource(null)}
            >
              GOT IT
            </button>
          </section>
        </div>,
        document.body
      )}
    </div>
  );
}