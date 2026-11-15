import { useState } from "react";
import {
  BookOpen,
  Orbit,
  Play,
  RotateCcw,
  Shield,
  Sun,
  Thermometer,
} from "lucide-react";
import { LabTransitionOverlay } from "../LabTransition";
import { useLabTransition } from "../../hooks/useLabTransition";
import "./AdvancedSystemsLab.css";

type ExperimentId = "gravity" | "radiation" | "solar" | "thermal";
type WorldId = "earth" | "moon" | "mars";
type ShieldId = "aluminum" | "water" | "regolith";

const EXPERIMENTS: {
  id: ExperimentId;
  title: string;
  summary: string;
  hook: string;
  fact: string;
  challenge: string;
  science: string;
  icon: typeof Orbit;
}[] = [
  {
    id: "gravity",
    title: "Gravity",
    summary: "A rover has one test rock and three worlds to visit.",
    hook: "ROVER LOG 01 · The great drop-off",
    fact: "The Moon’s gravity is about one-sixth as strong as Earth’s. The same rock weighs less there, even though it is still the same rock.",
    challenge: "The rover is filming a slow-motion video. Which world should it visit?",
    science: "The rover crew is testing how gravity changes a falling object. Gravity is a world’s pull: it keeps our feet on Earth and guides moons around planets. The Moon and Mars pull less strongly than Earth, so the same object falls differently in our simple model.",
    icon: Orbit,
  },
  {
    id: "radiation",
    title: "Radiation",
    summary: "A space explorer is packing for a trip beyond Earth.",
    hook: "ROVER LOG 02 · The cosmic-ray puzzle",
    fact: "Some radiation in space comes from energetic particles. NASA monitors it because it can affect astronaut health.",
    challenge: "Can your imaginary shield change the reading in our pretend detector?",
    science: "The explorer’s detector has spotted invisible particles traveling through space. Earth’s atmosphere protects us from much of this environment, but astronauts travel beyond it. Scientists study radiation and possible protection; our pretend detector is a learning model, not a real safety test.",
    icon: Shield,
  },
  {
    id: "solar",
    title: "Solar Energy",
    summary: "The rover battery is low. Can you catch more sunlight?",
    hook: "ROVER LOG 03 · Follow that sunshine",
    fact: "A solar panel catches sunlight more directly when it faces the Sun than when it is turned edge-on.",
    challenge: "Can you point the panel to wake up the rover’s pretend battery?",
    science: "The rover needs power for its instruments. Solar arrays turn sunlight into electricity, and the angle toward the Sun affects how much light reaches a surface. Real spacecraft also deal with shadows and other power-system limits.",
    icon: Sun,
  },
  {
    id: "thermal",
    title: "Thermal",
    summary: "A science box is swinging between sunny and shady spots.",
    hook: "ROVER LOG 04 · Too hot, too cold?",
    fact: "A spacecraft can absorb heat, make heat, store heat, and release heat.",
    challenge: "Can you help the science box stay comfy with insulation?",
    science: "The rover’s science instruments work best within certain temperatures. Engineers balance heat with tools such as insulation, special coatings, and radiators. Our temperature dial is a pretend model, not a forecast for a real spacecraft.",
    icon: Thermometer,
  },
];

const WORLDS: Record<WorldId, { name: string; gravity: number }> = {
  earth: { name: "Earth", gravity: 9.81 },
  moon: { name: "Moon", gravity: 1.62 },
  mars: { name: "Mars", gravity: 3.71 },
};

const SHIELDS: Record<ShieldId, { name: string; modelFactor: number; note: string }> = {
  aluminum: { name: "Aluminum", modelFactor: 0.035, note: "A common spacecraft structural material; shielding behavior depends on particle energy and configuration." },
  water: { name: "Water-rich layer", modelFactor: 0.055, note: "Hydrogen-rich materials are studied for radiation protection; this model does not predict real dose." },
  regolith: { name: "Lunar regolith", modelFactor: 0.045, note: "Using local soil as bulk shielding is a habitat-design concept, not a guarantee of safety." },
};

export default function AdvancedSystemsLab() {
  const { activeSection: activeTab, isRocketFlying, transitionTo: handleTabChange } =
    useLabTransition<"guide" | "simulation">("guide");
  const [experiment, setExperiment] = useState<ExperimentId>("gravity");
  const [guideExperiment, setGuideExperiment] = useState<ExperimentId>("gravity");

  const [world, setWorld] = useState<WorldId>("earth");
  const [mass, setMass] = useState(10);
  const [dropHeight, setDropHeight] = useState(10);
  const [dropRun, setDropRun] = useState(0);

  const [shield, setShield] = useState<ShieldId>("water");
  const [shieldThickness, setShieldThickness] = useState(10);

  const [panelAngle, setPanelAngle] = useState(0);

  const [sunlight, setSunlight] = useState(true);
  const [insulation, setInsulation] = useState(50);
  const [thermalTemperature, setThermalTemperature] = useState(20);

  const currentWorld = WORLDS[world];
  const fallTime = Math.sqrt((2 * dropHeight) / currentWorld.gravity);
  const weight = mass * currentWorld.gravity;
  const relativeRadiation = Math.round(100 * Math.exp(-SHIELDS[shield].modelFactor * shieldThickness));
  const solarOutput = Math.max(0, Math.round(Math.cos((panelAngle * Math.PI) / 180) * 100));

  function runThermalStep() {
    const insulationFactor = 1 - insulation / 100;
    const temperatureChange = (sunlight ? 18 : -14) * insulationFactor;
    setThermalTemperature((temperature) =>
      Math.round(Math.max(-80, Math.min(100, temperature + temperatureChange)) * 10) / 10
    );
  }

  function resetThermalExperiment() {
    setThermalTemperature(20);
  }

  return (
    <section className="advanced-lab" aria-label="Space Science Lab">
      <LabTransitionOverlay visible={isRocketFlying} />

      <header className="advanced-lab-header">
        <div className="advanced-lab-title">
          <h2><Orbit aria-hidden="true" /> SPACE SCIENCE LAB</h2>
          <p>Explore the physics behind space exploration through four guided experiments.</p>
        </div>
        <div className="advanced-lab-tabs" role="tablist" aria-label="Advanced Lab sections">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "guide"}
            className={activeTab === "guide" ? "active" : ""}
            onClick={() => handleTabChange("guide")}
          >
            <BookOpen aria-hidden="true" /> LAB GUIDE &amp; OVERVIEW
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "simulation"}
            className={activeTab === "simulation" ? "active" : ""}
            onClick={() => handleTabChange("simulation")}
          >
            <Play aria-hidden="true" /> INTERACTIVE EXPERIMENTS
          </button>
        </div>
      </header>

      {activeTab === "guide" ? (
        <div className="advanced-guide" role="tabpanel">
          <div className="advanced-guide-hero">
            <div className="advanced-hero-orbit advanced-hero-orbit-one" aria-hidden="true" />
            <div className="advanced-hero-orbit advanced-hero-orbit-two" aria-hidden="true" />
            <div className="advanced-hero-copy">
              <span className="advanced-hero-kicker">ROVER FIELD JOURNAL / 4 LOGS</span>
              <h3>A rover found four space puzzles!</h3>
              <p>Open a field log, learn the science clue, then help the rover investigate.</p>
              <span className="advanced-mission-count"><Orbit aria-hidden="true" /> 4 MINI MISSIONS</span>
            </div>
            <div className="advanced-hero-planet" aria-hidden="true">
              <span>✦</span>
              <i />
              <b />
            </div>
          </div>

          <div className="advanced-guide-section-heading">
            <div>
              <span>CHOOSE YOUR MISSION</span>
              <p>Choose one of the rover’s discoveries.</p>
            </div>
            <span className="advanced-tip"><span aria-hidden="true">✦</span> Curiosity powered</span>
          </div>

          <div className="advanced-experiment-cards">
            {EXPERIMENTS.map(({ id, title, icon: Icon }, index) => (
              <button
                type="button"
                className={`advanced-experiment-card ${id}${guideExperiment === id ? " selected" : ""}`}
                key={id}
                aria-pressed={guideExperiment === id}
                onClick={() => setGuideExperiment(id)}
              >
                <span className="advanced-card-index">ROVER LOG 0{index + 1}</span>
                <span className="advanced-card-icon"><Icon aria-hidden="true" /></span>
                <strong>{title}</strong>
                <span className="advanced-card-select">{guideExperiment === id ? "MISSION SELECTED" : "OPEN MISSION"} <span aria-hidden="true">→</span></span>
              </button>
            ))}
          </div>

          {(() => {
            const briefing = EXPERIMENTS.find((item) => item.id === guideExperiment)!;
            const BriefingIcon = briefing.icon;
            return (
              <article className={`advanced-mission-briefing ${briefing.id}`}>
                <div className="advanced-briefing-art" aria-hidden="true">
                  <span className="advanced-briefing-star star-one">✦</span>
                  <span className="advanced-briefing-star star-two">✧</span>
                  <BriefingIcon />
                  <span className="advanced-briefing-art-label">FIELD NOTE 0{EXPERIMENTS.findIndex((item) => item.id === guideExperiment) + 1}</span>
                </div>
                <div className="advanced-briefing-copy">
                  <span className="advanced-briefing-kicker">{briefing.hook}</span>
                  <h3>{briefing.title}: rover field report</h3>
                  <p>{briefing.science}</p>
                  <div className="advanced-fact-and-challenge">
                    <div className="advanced-did-you-know">
                      <span aria-hidden="true">★</span>
                      <p><strong>SPACE SECRET</strong>{briefing.fact}</p>
                    </div>
                    <div className="advanced-challenge">
                      <span aria-hidden="true">?</span>
                      <p><strong>YOUR CHALLENGE</strong>{briefing.challenge}</p>
                    </div>
                  </div>
                  <div className="advanced-briefing-footer">
                    <button
                      type="button"
                      onClick={() => {
                        setExperiment(guideExperiment);
                        handleTabChange("simulation");
                      }}
                    >
                      <Play aria-hidden="true" /> TRY THIS MISSION
                    </button>
                  </div>
                </div>
              </article>
            );
          })()}

          <p className="advanced-model-note">
            Mission models are simplified for learning. They are not engineering design tools or NASA flight predictions.
          </p>
        </div>
      ) : (
        <div className="advanced-simulation" role="tabpanel">
          <nav className="advanced-experiment-tabs" aria-label="Choose an experiment">
            {EXPERIMENTS.map(({ id, title, icon: Icon }) => (
              <button
                type="button"
                key={id}
                aria-pressed={experiment === id}
                className={experiment === id ? "active" : ""}
                onClick={() => setExperiment(id)}
              >
                <Icon aria-hidden="true" />
                {title}
              </button>
            ))}
          </nav>

          {experiment === "gravity" && (
            <section className="experiment-panel">
              <div className="experiment-panel-heading">
                <Orbit aria-hidden="true" />
                <div><h3>Gravity Experiment</h3><p>Keep the object and drop height fixed; compare how gravity changes its weight and ideal free-fall time.</p></div>
              </div>
              <div className="experiment-controls">
                <label>
                  World
                  <select value={world} onChange={(event) => setWorld(event.target.value as WorldId)}>
                    {Object.entries(WORLDS).map(([id, item]) => <option key={id} value={id}>{item.name}</option>)}
                  </select>
                </label>
                <label>
                  Object mass: <strong>{mass} kg</strong>
                  <input type="range" min="1" max="50" value={mass} onChange={(event) => setMass(Number(event.target.value))} />
                </label>
                <label>
                  Drop height: <strong>{dropHeight} m</strong>
                  <input type="range" min="2" max="30" value={dropHeight} onChange={(event) => setDropHeight(Number(event.target.value))} />
                </label>
              </div>
              <div className="gravity-results">
                {Object.entries(WORLDS).map(([id, item]) => (
                  <div className={world === id ? "selected" : ""} key={id}>
                    <span>{item.name}</span>
                    <strong>{(mass * item.gravity).toFixed(1)} N</strong>
                    <small>{Math.sqrt((2 * dropHeight) / item.gravity).toFixed(2)} s fall time</small>
                  </div>
                ))}
              </div>
              <div className="gravity-drop-stage" key={dropRun}>
                <span className="gravity-height-label">{dropHeight} m</span>
                <span
                  className="gravity-drop-object"
                  style={{
                    animation: dropRun === 0 ? "none" : `advanced-gravity-drop ${fallTime}s linear forwards`,
                  }}
                />
                <span className="gravity-ground" />
              </div>
              <button type="button" className="advanced-action-button" onClick={() => setDropRun((run) => run + 1)}>
                <Play aria-hidden="true" /> DROP OBJECT ON {currentWorld.name.toUpperCase()}
              </button>
              <p className="experiment-footnote">
                On {currentWorld.name}, gravity is {currentWorld.gravity.toFixed(2)} m/s². This {mass} kg object weighs {weight.toFixed(1)} N and takes about {fallTime.toFixed(2)} seconds to fall {dropHeight} m.
              </p>
              <p className="experiment-footnote">Ideal free fall only: air resistance and surface impact are not modeled. Moon gravity is about one-sixth of Earth’s (NASA).</p>
            </section>
          )}

          {experiment === "radiation" && (
            <section className="experiment-panel">
              <div className="experiment-panel-heading">
                <Shield aria-hidden="true" />
                <div><h3>Radiation Experiment</h3><p>Change a conceptual shielding material and thickness to see the model’s relative transmission index.</p></div>
              </div>
              <div className="experiment-controls">
                <label>
                  Shield material
                  <select value={shield} onChange={(event) => setShield(event.target.value as ShieldId)}>
                    {Object.entries(SHIELDS).map(([id, item]) => <option key={id} value={id}>{item.name}</option>)}
                  </select>
                </label>
                <label>
                  Shield thickness: <strong>{shieldThickness} cm</strong>
                  <input type="range" min="0" max="30" value={shieldThickness} onChange={(event) => setShieldThickness(Number(event.target.value))} />
                </label>
              </div>
              <div className="radiation-meter">
                <div className="radiation-meter-label"><span>Illustrative radiation transmission</span><strong>{relativeRadiation}%</strong></div>
                <div className="radiation-meter-track"><span style={{ width: `${relativeRadiation}%` }} /></div>
                <p>{SHIELDS[shield].note}</p>
              </div>
              <aside className="advanced-caution"><Shield aria-hidden="true" /><p><strong>Model limitation:</strong> The percentage is generated by a simple classroom formula. It is not a dose, measured shielding value, or safety recommendation; NASA notes that space-radiation risk and countermeasures involve substantial uncertainty.</p></aside>
            </section>
          )}

          {experiment === "solar" && (
            <section className="experiment-panel">
              <div className="experiment-panel-heading">
                <Sun aria-hidden="true" />
                <div><h3>Solar Energy Experiment</h3><p>Rotate the panel relative to the incoming sunlight and observe idealized output.</p></div>
              </div>
              <div className="solar-experiment-scene">
                <span className="solar-experiment-sun" aria-hidden="true">☀</span>
                <span className="solar-rays" aria-hidden="true" />
                <span className="solar-panel-art" style={{ transform: `translate(-50%, -50%) rotate(${panelAngle}deg)` }} aria-hidden="true"><i /><i /><i /></span>
              </div>
              <label className="solar-angle-control">
                Panel angle from directly facing the Sun: <strong>{panelAngle}°</strong>
                <input type="range" min="0" max="90" value={panelAngle} onChange={(event) => setPanelAngle(Number(event.target.value))} />
              </label>
              <div className="solar-output">
                <div className="solar-output-track"><span style={{ width: `${solarOutput}%` }} /></div>
                <strong>{solarOutput}%</strong>
                <span>idealized output</span>
              </div>
              <p className="experiment-footnote">The idealized model follows a cosine of the incidence angle: maximum when facing the Sun, approaching zero edge-on. Real panels also depend on cells, temperature, shadow, and system losses.</p>
            </section>
          )}

          {experiment === "thermal" && (
            <section className="experiment-panel">
              <div className="experiment-panel-heading">
                <Thermometer aria-hidden="true" />
                <div><h3>Thermal Experiment</h3><p>Compare the effect of sunlight or shade and insulation on a simplified habitat temperature.</p></div>
              </div>
              <div className="experiment-controls">
                <label>
                  Environment
                  <select value={sunlight ? "sunlight" : "shade"} onChange={(event) => setSunlight(event.target.value === "sunlight")}>
                    <option value="sunlight">Direct sunlight</option>
                    <option value="shade">Shade / facing deep space</option>
                  </select>
                </label>
                <label>
                  Insulation: <strong>{insulation}%</strong>
                  <input type="range" min="0" max="90" step="10" value={insulation} onChange={(event) => setInsulation(Number(event.target.value))} />
                </label>
              </div>
              <div className="thermal-readout">
                <Thermometer aria-hidden="true" />
                <div><span>SIMULATED CABIN TEMPERATURE</span><strong>{thermalTemperature.toFixed(1)} °C</strong></div>
                <span className={thermalTemperature < 0 || thermalTemperature > 35 ? "thermal-warning" : "thermal-stable"}>
                  {thermalTemperature < 0 || thermalTemperature > 35 ? "OUTSIDE COMFORT RANGE" : "COMFORT RANGE"}
                </span>
              </div>
              <div className="thermal-actions">
                <button type="button" className="advanced-action-button" onClick={runThermalStep}><Play aria-hidden="true" /> SIMULATE 1 HOUR</button>
                <button type="button" className="advanced-reset-button" onClick={resetThermalExperiment}><RotateCcw aria-hidden="true" /> RESET</button>
              </div>
              <p className="experiment-footnote">Teaching model only: each simulated hour applies a fixed warming/cooling step moderated by insulation. Actual spacecraft temperatures require detailed thermal analysis of radiation, stored heat, materials, and mission conditions.</p>
            </section>
          )}
        </div>
      )}
    </section>
  );
}
