import { useEffect, useState } from 'react';
import {
  Check,
  Droplets,
  Fan,
  Leaf,
  Lightbulb,
  Play,
  RotateCw,
  Sun,
  Waves,
  Wind,
  Zap,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import './ResourceLabGuide.css';

type StationId = 'water' | 'power' | 'air' | 'garden';

type Station = {
  id: StationId;
  title: string;
  shortTitle: string;
  color: string;
  icon: LucideIcon;
};

const STATIONS: Station[] = [
  { id: 'water', title: 'Water Recycler', shortTitle: 'WATER', color: 'cyan', icon: Droplets },
  { id: 'power', title: 'Sun Power', shortTitle: 'POWER', color: 'yellow', icon: Sun },
  { id: 'air', title: 'Fresh Air', shortTitle: 'AIR', color: 'green', icon: Fan },
  { id: 'garden', title: 'Space Garden', shortTitle: 'GARDEN', color: 'purple', icon: Leaf },
];

const STATION_CONTROLS = [
  { id: 'garden', label: 'GARDEN STATION CONTROL', icon: Leaf, color: 'garden' },
  { id: 'air', label: 'AIR QUALITY SYSTEM', icon: Wind, color: 'air' },
  { id: 'power', label: 'POWER GRID CONTROL', icon: Sun, color: 'power' },
  { id: 'water', label: 'ORBITAL SUPPLY FEED', icon: Waves, color: 'supply' },
] as const;

type ResourceLabGuideProps = {
  onStartSimulation: () => void;
  baseLevel: number;
};

function RobotGuide() {
  return (
    <svg className="resource-robot-art" viewBox="0 0 100 110" role="img" aria-label="Friendly robot guide">
      <ellipse cx="50" cy="103" rx="31" ry="5" fill="#071328" opacity=".55" />
      <path d="M50 10v10" stroke="#80f3ff" strokeWidth="5" strokeLinecap="round" />
      <circle cx="50" cy="8" r="5" fill="#ffe36e" />
      <rect x="22" y="22" width="56" height="48" rx="17" fill="#d9fbff" stroke="#69d7ed" strokeWidth="4" />
      <rect x="30" y="32" width="40" height="25" rx="11" fill="#11264c" />
      <ellipse cx="41" cy="44" rx="4" ry="5" fill="#74f6ff" />
      <ellipse cx="59" cy="44" rx="4" ry="5" fill="#74f6ff" />
      <path d="M42 53q8 6 16 0" fill="none" stroke="#74f6ff" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M22 39H12v15h10m56-15h10v15H78" fill="#a5eaf7" stroke="#69d7ed" strokeWidth="3" strokeLinejoin="round" />
      <rect x="31" y="69" width="38" height="27" rx="10" fill="#67dced" stroke="#a9f6ff" strokeWidth="3" />
      <rect x="42" y="77" width="16" height="10" rx="4" fill="#12305a" />
      <circle cx="50" cy="82" r="3" fill="#ffe36e" />
      <path d="M36 95l-5 7m33-7 5 7" stroke="#d9fbff" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}

export default function ResourceLabGuide({ onStartSimulation, baseLevel }: ResourceLabGuideProps) {
  const [selectedId, setSelectedId] = useState<StationId | null>(null);
  const [completed, setCompleted] = useState<StationId[]>([]);
  const [robotMessage, setRobotMessage] = useState('Hi, Cadet! I’m Pip. Our space station needs your help. Tap a glowing station to explore!');
  const [filterRunning, setFilterRunning] = useState(false);
  const [panelAngle, setPanelAngle] = useState(70);
  const [batteryCharged, setBatteryCharged] = useState(false);
  const [airClean, setAirClean] = useState(false);
  const [gardenWatered, setGardenWatered] = useState(false);
  const [gardenLit, setGardenLit] = useState(false);
  const [gardenGrown, setGardenGrown] = useState(false);

  const selectedStation = STATIONS.find((station) => station.id === selectedId);
  const solarCapture = Math.round(Math.cos((panelAngle * Math.PI) / 180) * 100);
  const allComplete = completed.length === STATIONS.length;
  const rippleLevels = [
    { level: 1, water: Math.round(15 * 0.5), power: Math.round(15 * 0.4) },
    { level: 2, water: Math.round(15 * 0.3), power: Math.round(15 * 0.2) },
    { level: 3, water: Math.round(15 * 0.3), power: Math.round(15 * 0.05) },
  ];

  useEffect(() => {
    if (!selectedId) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setSelectedId(null);
    }

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [selectedId]);

  function markComplete(id: StationId) {
    setCompleted((previous) => previous.includes(id) ? previous : [...previous, id]);
  }

  function selectStation(station: Station) {
    setSelectedId(station.id);
    const prompts: Record<StationId, string> = {
      water: 'The water tank is low. Can you wake up the recycling filter?',
      power: 'The station needs electricity. Can you turn the panel toward the Sun?',
      air: 'The air cleaner is quiet. Can you clear the CO₂ from the cabin?',
      garden: 'The seedlings are sleepy. Can you give them water and light?',
    };
    setRobotMessage(completed.includes(station.id)
      ? 'Nice work, Cadet! You already helped this station. Explore another system!'
      : prompts[station.id]);
  }

  function selectControl(id: StationId) {
    const station = STATIONS.find((item) => item.id === id);
    if (station) selectStation(station);
  }

  function recycleWater() {
    setFilterRunning(true);
    markComplete('water');
    setRobotMessage('Whoosh! The filter cleaned the used water so the crew can use it again. One small supply can go further when it is recycled!');
  }

  function chargeBattery() {
    if (solarCapture < 90) {
      setRobotMessage('Almost! Turn the panel closer to face the Sun so it can catch more light.');
      return;
    }
    setBatteryCharged(true);
    markComplete('power');
    setRobotMessage('Sun-powered! Solar panels turn sunlight into electricity. The station battery is charging!');
  }

  function cleanAir() {
    setAirClean(true);
    markComplete('air');
    setRobotMessage('The fan is moving air through the cleaner! It helps remove carbon dioxide that astronauts breathe out.');
  }

  function growGarden() {
    if (!gardenWatered || !gardenLit) {
      setRobotMessage('Plants need both water and light. Turn on both garden supplies, then help the seedlings grow!');
      return;
    }
    setGardenGrown(true);
    markComplete('garden');
    setRobotMessage('Look at those leaves grow! Space gardens help researchers learn how plants grow in microgravity and can provide fresh food.');
  }

  return (
    <section className="resource-guide" aria-labelledby="resource-guide-title">
      <header className="resource-guide-intro">
        <div>
          <span className="resource-guide-kicker">SPACE STATION ADVENTURE / LEVEL 01</span>
          <h3 id="resource-guide-title">The supply rocket is late!</h3>
          <p>Tap a station system to open Pip’s science window and discover its ripple effects.</p>
        </div>
        <div className="resource-progress" aria-label={`Mission progress: ${completed.length} of 4 stations completed`}>
          <div className="resource-progress-top"><strong>STATION CHECK</strong><span>{completed.length}/4</span></div>
          <div className="resource-progress-stars" aria-hidden="true">
            {STATIONS.map((station) => <span className={completed.includes(station.id) ? 'earned' : ''} key={station.id}>★</span>)}
          </div>
          <div className="resource-progress-track"><span style={{ width: `${completed.length * 25}%` }} /></div>
        </div>
      </header>

      <div className="resource-station-scene">
        <img
          className="resource-station-background"
          src="/resource-lab-background.png"
          alt="A moon base seen through a space station window"
        />
        <div className="resource-scene-shade" aria-hidden="true" />
        <div className="resource-scene-bio-panel" aria-hidden="true">
          <strong>BIO-ANALYSIS</strong>
          <span>PLANT HEALTH <b>96%</b></span>
          <span>LEAF SCAN <b>ACTIVE</b></span>
          <div className="resource-scene-bio-scan"><Leaf /><i /><i /><i /></div>
        </div>
        <div className="resource-scene-air-panel" aria-hidden="true">
          <Wind />
          <span><strong>AIR QUALITY</strong><b>OPTIMAL</b></span>
          <small>O₂ 21% · CO₂ 0.04%</small>
        </div>
        <div className="resource-scene-supply-panel" aria-hidden="true">
          <strong>ORBITAL SUPPLY DECK</strong>
          <span>H₂O RESERVE <b>88%</b></span>
          <span>POWER FLOW <b>ONLINE</b></span>
          <span>FEED PRESSURE <b>1.05 BAR</b></span>
          <div className="resource-scene-supply-meter"><i /></div>
        </div>
        <div className="resource-scene-garden-pod" aria-hidden="true">
          <div className="resource-scene-grow-crystal"><Leaf /></div>
          <span className="resource-scene-vine vine-one"><i /><i /><i /><i /></span>
          <span className="resource-scene-vine vine-two"><i /><i /><i /></span>
          <div className="resource-scene-garden-name">ORBITAL GARDEN <small>GROW BAY 01</small></div>
        </div>
        <div className="resource-scene-power-unit" aria-hidden="true">
          <div className="resource-scene-power-ring"><Zap /></div>
          <div className="resource-scene-power-readout"><b>POWER GRID</b><span>CORE OUTPUT</span><strong>1.2 GW</strong><i /></div>
          <div className="resource-scene-power-foot" />
        </div>
        <div className="resource-scene-orbital-feed" aria-hidden="true">
          <div className="resource-scene-feed-ring"><Waves /></div>
          <span>SUPPLY FEED</span>
        </div>
        <div className="resource-scene-control-deck">
          {STATION_CONTROLS.map(({ id, label, icon: Icon, color }) => {
            const station = STATIONS.find((item) => item.id === id);
            return (
              <button
                type="button"
                key={id}
                className={`resource-deck-control ${color}${selectedId === id ? ' selected' : ''}${station && completed.includes(station.id) ? ' completed' : ''}`}
                onClick={() => selectControl(id)}
                aria-pressed={selectedId === id}
                aria-label={label}
              >
                <Icon aria-hidden="true" />
                <span>{label}</span>
                {station && completed.includes(station.id) && <Check aria-label="Completed" />}
              </button>
            );
          })}
          </div>
        <span className="resource-scene-caption" aria-hidden="true">LUNAR OUTPOST · ORBITAL SUPPLY DECK</span>
      </div>

      {selectedStation && (
      <div className="resource-learning-backdrop" onClick={() => setSelectedId(null)} role="presentation">
      <section className={`resource-learning-panel ${selectedStation.color} ${selectedStation.id}`} role="dialog" aria-modal="true" aria-labelledby="resource-dialog-title" aria-describedby="resource-robot-message" onClick={(event) => event.stopPropagation()}>
        <div className="resource-robot">
          <RobotGuide />
          <span>PIP · YOUR ROBOT GUIDE</span>
        </div>
        <div className="resource-learning-content">
          <button type="button" className="resource-hud-button resource-dialog-close" onClick={() => setSelectedId(null)} aria-label="Close station information" autoFocus>
            <X aria-hidden="true" />
          </button>
          <div className="resource-learning-title">
            <span className="resource-learning-icon">
              {selectedStation.id === 'water' && <Droplets aria-hidden="true" />}
              {selectedStation.id === 'power' && <Sun aria-hidden="true" />}
              {selectedStation.id === 'air' && <Fan aria-hidden="true" />}
              {selectedStation.id === 'garden' && <Leaf aria-hidden="true" />}
            </span>
            <div>
              <span className="resource-learning-eyebrow">STATION STOP · {selectedStation.shortTitle}</span>
              <h4 id="resource-dialog-title">{selectedStation.title}</h4>
            </div>
          </div>

          <p className="resource-robot-message" id="resource-robot-message">{robotMessage}</p>

          <div className="resource-network-learning">
            <div className="resource-nasa-fact">
              <strong>NASA SCIENCE</strong>
              {selectedStation.id === 'water' && 'The space station recycles water. Water is also used to make oxygen, and plants need water to grow.'}
              {selectedStation.id === 'power' && 'The station’s solar arrays turn sunlight into electricity. That electricity helps run life-support and other station equipment.'}
              {selectedStation.id === 'air' && 'Life-support equipment removes carbon dioxide from cabin air. Making oxygen from water also uses station power.'}
              {selectedStation.id === 'garden' && 'NASA’s Veggie studies how plants grow in microgravity. Space plants need light and water, and can provide fresh food.'}
            </div>
            <div className="resource-game-ripple">
              <div className="resource-ripple-heading">
                <strong>GAME RIPPLE EFFECTS</strong>
                <span>Level {baseLevel} selected · all levels shown</span>
              </div>
              <ul>
                {rippleLevels.map(({ level, water, power }) => (
                  <li className={baseLevel === level ? 'active' : ''} key={level}>
                    <strong>LEVEL {level}</strong>
                    <span>
                      {selectedStation.id === 'water' && `Water ±15 → Air ±${water} · Food ±${water}`}
                      {selectedStation.id === 'power' && `Power ±15 → Water/Air/Food ±${power}`}
                      {selectedStation.id === 'air' && `Water ±15 → Air ±${water} · Power ±15 → Air ±${power}`}
                      {selectedStation.id === 'garden' && `Water ±15 → Food ±${water} · Power ±15 → Food ±${power}`}
                    </span>
                  </li>
                ))}
                {selectedStation.id === 'air' && <li><strong>AIR</strong><span>Changing air directly updates only the air reserve.</span></li>}
                {selectedStation.id === 'garden' && <li><strong>HARVEST</strong><span>Food +15 → Power −10 · Water −10</span></li>}
              </ul>
              <small>Effects are simplified game points per action, not NASA measurements. Real systems are more complex.</small>
            </div>
          </div>

          {selectedId === 'water' && (
            <div className="resource-mini-game">
              <div className={`resource-water-tank${filterRunning ? ' running' : ''}`} aria-label={filterRunning ? 'Water filter running' : 'Water filter waiting'}>
                <span className="resource-tank-water"><i /><i /><i /></span>
                <span className="resource-tank-filter"><Waves aria-hidden="true" /></span>
              </div>
              <div className="resource-mini-copy">
                <p>Used water goes through a filter before the crew can use it again.</p>
                <button type="button" className="resource-hud-button" onClick={recycleWater} disabled={filterRunning}>
                  <RotateCw aria-hidden="true" /> {filterRunning ? 'FILTER COMPLETE!' : 'START THE WATER FILTER'}
                </button>
              </div>
            </div>
          )}

          {selectedId === 'power' && (
            <div className="resource-mini-game">
              <div className="resource-solar-display" aria-label={`Panel turned ${panelAngle} degrees, collecting ${solarCapture} percent in this game model`}>
                <Sun className="resource-solar-sun" aria-hidden="true" />
                <div className="resource-solar-panel" style={{ transform: `rotate(${-panelAngle / 2}deg)` }}><i /><i /><i /></div>
                <div className={`resource-battery${batteryCharged ? ' charging' : ''}`}><span style={{ width: `${batteryCharged ? 100 : solarCapture}%` }} /></div>
                <small>BATTERY {batteryCharged ? 'CHARGING!' : `${solarCapture}%`}</small>
              </div>
              <div className="resource-mini-copy">
                <label htmlFor="solar-angle">Turn panel toward the Sun: <strong>{panelAngle}°</strong></label>
                <input id="solar-angle" type="range" min="0" max="90" value={panelAngle} onChange={(event) => setPanelAngle(Number(event.target.value))} />
                <button type="button" className="resource-hud-button" onClick={chargeBattery} disabled={batteryCharged}>
                  <Zap aria-hidden="true" /> {batteryCharged ? 'BATTERY CHARGED!' : 'CHARGE THE BATTERY'}
                </button>
              </div>
            </div>
          )}

          {selectedId === 'air' && (
            <div className="resource-mini-game">
              <div className={`resource-air-display${airClean ? ' cleaning' : ''}`} aria-label={airClean ? 'Air cleaning system active' : 'Air cleaning system waiting'}>
                <span className="resource-co2-dot">CO₂</span><span className="resource-co2-dot">CO₂</span><span className="resource-co2-dot">CO₂</span>
                <Fan aria-hidden="true" />
                <span className="resource-air-clean">AIR<br />CLEANER</span>
                <Wind aria-hidden="true" />
              </div>
              <div className="resource-mini-copy">
                <p>Astronauts breathe out carbon dioxide. The air system helps remove it from the cabin.</p>
                <button type="button" className="resource-hud-button" onClick={cleanAir} disabled={airClean}>
                  <Wind aria-hidden="true" /> {airClean ? 'AIR CLEANER ON!' : 'TURN ON THE AIR CLEANER'}
                </button>
              </div>
            </div>
          )}

          {selectedId === 'garden' && (
            <div className="resource-mini-game">
              <div className={`resource-garden-display${gardenGrown ? ' grown' : ''}`} aria-label={gardenGrown ? 'Space plants have grown' : 'Space seedlings'}>
                <span className="resource-garden-plant plant-one" />
                <span className="resource-garden-plant plant-two" />
                <span className="resource-garden-pot" />
                <span className={`resource-garden-light${gardenLit ? ' on' : ''}`}><Lightbulb aria-hidden="true" /></span>
              </div>
              <div className="resource-mini-copy">
                <p>Plants need water and light. Give both to the seedlings, then watch the garden grow.</p>
                <div className="resource-garden-controls">
                  <button type="button" className={`resource-hud-button ${gardenWatered ? 'active' : ''}`} onClick={() => {
                    setGardenWatered(true);
                    setRobotMessage('Water tank connected! Now switch on the grow light for your seedlings.');
                  }} disabled={gardenWatered}>
                    <Droplets aria-hidden="true" /> {gardenWatered ? 'WATERED!' : 'ADD WATER'}
                  </button>
                  <button type="button" className={`resource-hud-button ${gardenLit ? 'active' : ''}`} onClick={() => {
                    setGardenLit(true);
                    setRobotMessage('Grow light on! Give the seedlings water too, then help them grow.');
                  }} disabled={gardenLit}>
                    <Lightbulb aria-hidden="true" /> {gardenLit ? 'LIGHT ON!' : 'TURN ON LIGHT'}
                  </button>
                </div>
                <button type="button" className="resource-hud-button" onClick={growGarden} disabled={gardenGrown}>
                  <Leaf aria-hidden="true" /> {gardenGrown ? 'GARDEN GROWING!' : 'GROW THE SEEDLINGS'}
                </button>
              </div>
            </div>
          )}

          {completed.includes(selectedStation.id) && (
            <p className="resource-science-note"><span>SPACE FACT</span>{selectedStation.id === 'water' && 'Spacecraft can clean and reuse water to help limited supplies last longer.'}{selectedStation.id === 'power' && 'Solar panels use sunlight to make electricity for spacecraft.'}{selectedStation.id === 'air' && 'Astronauts need clean cabin air, so life-support systems help remove carbon dioxide.'}{selectedStation.id === 'garden' && 'NASA studies how plants grow in microgravity and how space gardens may help crews.'}</p>
          )}
        </div>
      </section>
      </div>
      )}

      {allComplete && (
        <div className="resource-complete-banner" role="status">
          <div>
            <span>★ ★ ★ ★</span>
            <h4>STATION READY, CADET!</h4>
            <p>You helped all four systems. The crew is ready for its next mission!</p>
          </div>
          <button type="button" className="resource-hud-button" onClick={onStartSimulation}><Play aria-hidden="true" /> OPEN INTERACTIVE SIMULATION</button>
        </div>
      )}
    </section>
  );
}
