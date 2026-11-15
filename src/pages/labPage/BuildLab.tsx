import { useEffect, useState } from "react";
import ModuleSelector from "../../components/labComponents/ModuleSelector";
import ModuleIllustration from "../../components/labComponents/ModuleIllustration";
import BuildGrid, {
  type GridCell
} from "../../components/labComponents/BuildGrid";
import {
  BUILD_MODULES,
  MODULE_CONNECTION_RULES,
  type ModuleId
} from "../../data/buildModules";
import {
  getModuleConnectionChecks,
  validateBuild,
  type ValidationResult
} from "../../game/buildValidation";
import { LabTransitionOverlay } from "../../components/LabTransition";
import { useLabTransition } from "../../hooks/useLabTransition";

import "./BuildLab.css";

const GRID_SIZE = 25;

export default function BuildLab() {
  const { activeSection: view, isRocketFlying, transitionTo: setView } =
    useLabTransition<"briefing" | "construction">("briefing");
  const [infoModule, setInfoModule] = useState<ModuleId | null>(null);
  const [selected, setSelected] =
    useState<ModuleId | null>(null);

  const [grid, setGrid] = useState<GridCell[]>(
    Array(GRID_SIZE).fill(null)
  );

  const [result, setResult] =
    useState<ValidationResult | null>(null);
  const [moveMode, setMoveMode] = useState(false);
  const [movingIndex, setMovingIndex] = useState<number | null>(null);

  const placedCount = grid.filter(Boolean).length;
  const liveConnectionChecks = getModuleConnectionChecks(grid);

  useEffect(() => {
    if (!infoModule) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setInfoModule(null);
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [infoModule]);

  function placeModule(index: number) {
    if (moveMode) {
      if (movingIndex === null) {
        if (grid[index] === null) return;
        setMovingIndex(index);
        return;
      }

      if (index === movingIndex) {
        setMovingIndex(null);
        return;
      }
      if (grid[index] !== null) {
        setMovingIndex(index);
        return;
      }

      setGrid((previous) => {
        const next = [...previous];
        next[index] = next[movingIndex];
        next[movingIndex] = null;
        return next;
      });
      setMovingIndex(null);
      setResult(null);
      return;
    }

    if (!selected) return;
    if (grid[index] !== null) return;

    setGrid((previous) =>
      previous.map((cell, i) =>
        i === index ? selected : cell
      )
    );

    setResult(null);
  }

  function removeModule(index: number) {
    setGrid((previous) =>
      previous.map((cell, i) =>
        i === index ? null : cell
      )
    );

    setResult(null);
  }

  function resetBuild() {
    setGrid(Array(GRID_SIZE).fill(null));
    setSelected(null);
    setResult(null);
    setMoveMode(false);
    setMovingIndex(null);
  }

  return (
    <main className="build-lab">
      <LabTransitionOverlay visible={isRocketFlying} />
      <div className="build-container">

        <nav className="build-navbar">
          <span className="build-brand">
            JUNIOR SPACE ACADEMY
          </span>

          <span className="build-nav-label">
            BUILD LAB / 01
          </span>
        </nav>

        <section className="build-lab-panel">
        <header className="build-header">
          <div className="build-lab-heading">
            <p className="build-eyebrow">LUNAR OUTPOST <span>·</span> ENGINEERING SIMULATION</p>
            <h1>Lunar Habitat Build Lab</h1>
            <p className="build-description">
              Explore habitat systems, then build and validate your lunar outpost.
            </p>
          </div>
          <div className="build-mode-tabs" role="tablist" aria-label="Build Lab sections">
            <button
              type="button"
              id="build-guide-tab"
              role="tab"
              aria-controls="build-guide-panel"
              aria-selected={view === "briefing"}
              className={view === "briefing" ? "active" : ""}
              onClick={() => setView("briefing")}
            >
              <span aria-hidden="true">▤</span> LAB GUIDE &amp; OVERVIEW
            </button>
            <button
              type="button"
              id="build-simulation-tab"
              role="tab"
              aria-controls="build-simulation-panel"
              aria-selected={view === "construction"}
              className={view === "construction" ? "active" : ""}
              onClick={() => setView("construction")}
            >
              <span aria-hidden="true">▶</span> INTERACTIVE SIMULATION
            </button>
          </div>
        </header>

        {view === "briefing" ? (
          <section
            id="build-guide-panel"
            className="module-briefing"
            role="tabpanel"
            aria-labelledby="build-guide-tab"
          >
            <div className="briefing-heading">
              <div>
                <p className="build-eyebrow">ROVER RADIO / MESSAGE 01</p>
                <h2 id="module-briefing-title">Build a home for the next Moon explorers</h2>
                <p>A scout rover found a safe landing spot. Now the astronaut crew is on the way, and they need a habitat! Meet the space-station parts before you snap your outpost together.</p>
              </div>
              <span className="briefing-count">7 SPACE PARTS</span>
            </div>

            <div className="module-card-grid">
              {BUILD_MODULES.map((module, index) => (
                <button
                  type="button"
                  key={module.id}
                  className={`module-info-card${infoModule === module.id ? " active" : ""}`}
                  aria-pressed={infoModule === module.id}
                  onClick={() => setInfoModule(module.id)}
                >
                  <ModuleIllustration moduleId={module.id} name={module.name} />
                  <span className="module-card-index">SPACE PART 0{index + 1}</span>
                  <strong>{module.name}</strong>
                  <span className="module-card-summary">{module.description}</span>
                  <span className="module-card-energy">
                    {module.energyOutput > 0
                      ? `MAKES ${module.energyOutput} GAME POWER`
                      : `USES ${module.energyDemand} GAME POWER`}
                  </span>
                  <span className="module-card-open">OPEN SPACE-PART CARD →</span>
                </button>
              ))}
            </div>

            {infoModule && (() => {
              const module = BUILD_MODULES.find((item) => item.id === infoModule)!;
              const relatedConnections = MODULE_CONNECTION_RULES.filter(
                (rule) => rule.moduleId === module.id || rule.adjacentTo.includes(module.id)
              );
              return (
                <div
                  className="module-modal-backdrop"
                  onClick={() => setInfoModule(null)}
                  role="presentation"
                >
                  <section
                    className="module-detail-panel"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="module-dialog-title"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <button
                      type="button"
                      className="module-modal-close"
                      aria-label="Close module information"
                      autoFocus
                      onClick={() => setInfoModule(null)}
                    >
                      ×
                    </button>
                    <div className="module-modal-art">
                      <span className="module-modal-orbit" aria-hidden="true" />
                      <ModuleIllustration moduleId={module.id} name={module.name} />
                      <span className="module-modal-scanline" aria-hidden="true" />
                    </div>
                    <div className="module-modal-copy">
                      <p className="build-eyebrow">MOON BASE FIELD CARD</p>
                      <h3 id="module-dialog-title">{module.icon} {module.name} — {module.label}</h3>
                      <p className="module-science-copy">{module.science}</p>
                      <div className="module-connections">
                        <strong>WHO DOES THIS PART WORK WITH?</strong>
                        {relatedConnections.map((rule) => (
                          <article key={rule.id}>
                            <b>{rule.label.replace(" ↔ ", " + ")}</b>
                            <p>{rule.explanation}</p>
                          </article>
                        ))}
                        <small>
                          Snap-together neighbors are a game rule. Real spacecraft connect systems with equipment and wiring, not a 5×5 tile map.
                        </small>
                      </div>
                      <div className="module-game-note">
                        <strong>YOUR GAME-BUILD CLUE</strong>
                        <p>{module.gameRule}</p>
                        <small>
                          {module.energyOutput > 0
                            ? `SIMULATION: +${module.energyOutput} ENERGY OUTPUT`
                            : `SIMULATION: ${module.energyDemand} ENERGY USE`}
                        </small>
                      </div>
                    </div>
                  </section>
                </div>
              );
            })()}

            <p className="module-source-note">
              Space facts are simplified for young explorers. Module placement, energy values, and panel shadows are game rules—not real spacecraft designs.
            </p>
          </section>
        ) : (
        <div
          id="build-simulation-panel"
          className="build-workspace"
          role="tabpanel"
          aria-labelledby="build-simulation-tab"
        >

          <aside className="build-sidebar">
            <h2>MODULES</h2>

            <p className="build-hint">
              Help the rover crew move in: choose a space part, then tap a tile to place it.
            </p>

            <ModuleSelector
              selected={selected}
              onSelect={setSelected}
            />
          </aside>

          <section className="build-main">
            <div className="build-section-header">
              <h2>BUILD AREA</h2>

              <span className="build-counter">
                {placedCount} / {GRID_SIZE}
              </span>
            </div>

            <p className="build-hint">
              Select a module, then an empty tile. Place modules edge to edge to connect them.
            </p>

            <div className="build-grid-wrapper">
              <BuildGrid
                grid={grid}
                onPlace={placeModule}
                movingIndex={movingIndex}
              />
            </div>

            <div className="build-actions">
              <button
                className="build-secondary-button"
                aria-pressed={moveMode}
                onClick={() => {
                  setMoveMode((active) => !active);
                  setMovingIndex(null);
                  setSelected(null);
                }}
              >
                {moveMode ? "CANCEL MOVE" : "MOVE MODULE"}
              </button>
              <button
                className="build-primary-button"
                onClick={() =>
                  setResult(validateBuild(grid))
                }
              >
                VALIDATE HABITAT
              </button>

              <button
                className="build-secondary-button"
                onClick={resetBuild}
              >
                RESET
              </button>
            </div>
            <p className="build-hint" aria-live="polite">
              {moveMode
                ? movingIndex === null
                ? "Select an occupied tile, then choose an empty destination."
                : "Module selected. Choose an empty tile for its new position."
                : "Use MOVE MODULE to reposition a module instead of rotating it."}
            </p>

            <div className="build-mission-panel">
              <h3>MISSION BRIEF</h3>

              <p>
                Mission: Build the systems your crew needs to live safely on the Moon.
              </p>

              <p>
                Required: Habitat, Life Support, Power, Airlock, and Radiation Shelter.
              </p>
            </div>

            {result && (
              <div className={`build-result ${result.success ? "success" : "blocked"}`}>
                <h3>
                  {result.success
                    ? "✓ VALIDATION PASSED"
                    : "× BUILD BLOCKED"}
                </h3>

                {result.success ? (
                  <>
                    <p>{result.messages[0]}</p>
                    <p className="mission-score">
                      Mission score: <strong>{result.score} / 100</strong>
                      <small>Optional Water Recycler and Greenhouse modules add bonus points.</small>
                    </p>
                  </>
                ) : (
                  <>
                    <p className="blocking-summary">
                      {result.blockingErrors.length} critical issue{result.blockingErrors.length === 1 ? "" : "s"} must be fixed before scoring.
                    </p>
                    <ul className="blocking-error-list">
                      {result.blockingErrors.map((error) => (
                        <li key={error}>{error}</li>
                      ))}
                    </ul>
                    <p className="score-locked">Score locked until all critical checks pass.</p>
                  </>
                )}
                <ul className="connection-check-list" aria-label="System connection checks">
                  {result.connectionChecks.map((check) => (
                    <li className={`connection-check ${check.status}`} key={check.id}>
                      <span aria-hidden="true">
                        {check.status === "passed" ? "✓" : check.status === "failed" ? "!" : check.status === "optional" ? "—" : "·"}
                      </span>
                      <div>
                        <strong>{check.label}</strong>
                        <small>{check.detail}</small>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {grid.some(Boolean) && (
              <div className="build-tools">
                <h3>REMOVE MODULE</h3>
                <p className="build-hint">
                  Select a position below to remove its module.
                </p>

                <div className="build-remove-list">
                  {grid.map((cell, index) =>
                    cell ? (
                      <button
                        key={index}
                        onClick={() => removeModule(index)}
                        title={`Remove ${cell}`}
                      >
                        {index + 1} ×
                      </button>
                    ) : null
                  )}
                </div>
              </div>
            )}
          </section>

          <aside className="build-info-sidebar">
            <h2>MISSION OBJECTIVES</h2>

            <div className="build-objective">
              <span>01</span>
              <p>Build a habitat.</p>
            </div>

            <div className="build-objective">
              <span>02</span>
              <p>Add life support.</p>
            </div>

            <div className="build-objective">
              <span>03</span>
              <p>Provide power.</p>
            </div>

            <div className="build-objective">
              <span>04</span>
              <p>Enable safe entry and exit.</p>
            </div>

            <div className="build-objective">
              <span>05</span>
              <p>Add radiation protection.</p>
            </div>

            <section className="live-connections" aria-live="polite">
              <h3>SYSTEM CONNECTIONS</h3>
              <p>Required edge-to-edge links. Green means connected; amber means place or move a module.</p>
              <ul className="connection-check-list">
                {liveConnectionChecks.map((check) => (
                  <li className={`connection-check ${check.status}`} key={check.id}>
                    <span aria-hidden="true">
                      {check.status === "passed" ? "✓" : check.status === "failed" ? "!" : check.status === "optional" ? "—" : "·"}
                    </span>
                    <div>
                      <strong>{check.label}</strong>
                      <small>{check.detail}</small>
                    </div>
                  </li>
                ))}
              </ul>
              <small className="connection-source-note">
                Tile connections are part of this building game. Real spacecraft use equipment and wiring instead of a tile map.
              </small>
            </section>
          </aside>

        </div>
        )}
        </section>
      </div>
    </main>
  );
}
