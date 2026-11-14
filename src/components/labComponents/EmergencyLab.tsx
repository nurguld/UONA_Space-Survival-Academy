import { useState } from 'react';
import { AlertOctagon, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function EmergencyLab() {
  const [selectedScenario, setSelectedScenario] = useState<number>(1);
  const [simulationResult, setSimulationResult] = useState<string | null>(null);

  const scenarios = [
    {
      id: 1,
      title: "Solar Flare (X-Ray Shock)",
      type: "Instantaneous Light & Comms Shock",
      solution: "Activate Blackout Mode & Optical Filters",
      desc: "High-energy X-rays arrive in 8 minutes, blinding sensors and comms.",
      damageLevels: { 1: "80% Damage (Systems Short-Circuited)", 2: "40% Damage (Partial Blackout)", 3: "10% Impact (Fiber Optic Shielding Active)" }
    },
    {
      id: 2,
      title: "CME (Solar Storm)",
      type: "Plasma & Radiation Wave",
      solution: "Engage Magnetic Shield & Regolith Armor",
      desc: "Massive particle wave traveling over days, threatening power grids.",
      damageLevels: { 1: "90% Damage (Grid & Crops Fried)", 2: "45% Damage (Manual Shutdown Saved Base)", 3: "15% Impact (Magnetic Deflection Successful)" }
    },
    {
      id: 3,
      title: "Cabin Pressure Drop",
      type: "Micro-Meteorite Hull Breach",
      solution: "Seal Regional Valve -> Replace Filter -> Equalize",
      desc: "Atmosphere leaking into the vacuum through a structural puncture.",
      damageLevels: { 1: "Critical Failure (Crew Unconscious)", 2: "40% Loss (Smart Doors Isolated Breach)", 3: "10% Minor Loss (Autonomous Foam Sealed It)" }
    },
    {
      id: 4,
      title: "Hydroponics Contamination",
      type: "Toxic Mold Outbreak",
      solution: "Turn on UV Sterilization & Balance Humidity",
      desc: "Moisture imbalance triggering toxic mold growth over potato crops.",
      damageLevels: { 1: "100% Food Loss (All Crops Spoiled)", 2: "50% Food Loss (Partial Harvest Saved)", 3: "10% Loss (Auto-UV Neutralized Mold)" }
    }
  ];

  const currentScenario = scenarios.find(s => s.id === selectedScenario)!;

  const runSimulation = () => {
    setSimulationResult(`Simulation running for ${currentScenario.title}... Defense protocol executed successfully!`);
  };

  return (
    <div className="p-6 bg-slate-950 text-cyan-400 rounded-xl border border-cyan-500/30 shadow-2xl">
      <div className="flex justify-between items-center mb-8 border-b border-cyan-800/50 pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-wider text-white">🚨 EMERGENCY RESPONSE LAB</h2>
          <p className="text-sm text-slate-400">Critical Threat Mitigation & Outpost Defense Training</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {scenarios.map(sc => (
          <button
            key={sc.id}
            onClick={() => { setSelectedScenario(sc.id); setSimulationResult(null); }}
            className={`p-3 rounded-xl border text-left font-semibold text-sm transition-all ${
              selectedScenario === sc.id
                ? 'bg-red-950/40 border-red-500 text-red-300 shadow-lg shadow-red-500/20'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-cyan-500'
            }`}
          >
            <span className="block text-xs font-mono opacity-70">Scenario 0{sc.id}</span>
            {sc.title}
          </button>
        ))}
      </div>

      <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-xl mb-6">
        <div className="flex items-center gap-3 mb-3">
          <ShieldAlert className="w-6 h-6 text-red-400 animate-bounce" />
          <h3 className="text-xl font-bold text-white">{currentScenario.title}</h3>
        </div>
        <p className="text-sm text-slate-300 mb-4">{currentScenario.desc}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-slate-950/50 p-4 rounded-lg border border-slate-800">
          <div>
            <span className="text-slate-400 block text-xs">THREAT NATURE:</span>
            <span className="font-semibold text-amber-300">{currentScenario.type}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-xs">REQUIRED PROTOCOL:</span>
            <span className="font-semibold text-emerald-300">{currentScenario.solution}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <button
          onClick={runSimulation}
          className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-600/30 transition flex items-center justify-center gap-2"
        >
          <AlertOctagon className="w-5 h-5" /> Execute Emergency Defense Protocol
        </button>

        {simulationResult && (
          <div className="p-4 bg-emerald-950/40 border border-emerald-500/50 rounded-xl text-emerald-300 flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 shrink-0" />
            <div>
              <span className="font-bold block">Protocol Verified:</span>
              <span className="text-sm">{simulationResult}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}