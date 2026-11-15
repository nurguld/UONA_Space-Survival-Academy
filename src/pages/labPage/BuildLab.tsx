import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
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
  BUILD_GRID_SIZE,
  getCriticalPlacementErrors,
  getModuleConnectionChecks,
  validateBuild,
  type ValidationResult
} from "../../game/buildValidation";
import { LabTransitionOverlay } from "../../components/LabTransition";
import { useLabTransition } from "../../hooks/useLabTransition";

import "./BuildLab.css";

const GRID_SIZE = BUILD_GRID_SIZE;
const GRID_CELL_COUNT = GRID_SIZE * GRID_SIZE;
const DRAG_THRESHOLD = 6;

type PointerDrag = {
  moduleId: ModuleId;
  sourceIndex: number | null;
  pointerId: number;
  startX: number;
  startY: number;
  active: boolean;
};

type DragCursor = {
  icon: string;
  name: string;
  action: "PLACE" | "MOVE";
  x: number;
  y: number;
};

function getConnectionLabel(id: string) {
  const labels: Record<string, string> = {
    "life-support-habitat": "Life Support + Habitat",
    "airlock-habitat": "Airlock + Habitat",
    "radiation-habitat": "Shelter + Habitat",
    "water-life-support": "Water + Life Support",
    "greenhouse-habitat-life-support": "Garden + Habitat / Life Support",
    "solar-habitat-network": "Power link"
  };
  return labels[id] ?? id;
}

export default function BuildLab() {
  const { activeSection: view, isRocketFlying, transitionTo: setView } =
    useLabTransition<"briefing" | "construction">("briefing");
  const [infoModule, setInfoModule] = useState<ModuleId | null>(null);
  const [selected, setSelected] =
    useState<ModuleId | null>(null);

  const [grid, setGrid] = useState<GridCell[]>(
    Array(GRID_CELL_COUNT).fill(null)
  );

  const [result, setResult] =
    useState<ValidationResult | null>(null);
  const [connectionErrors, setConnectionErrors] = useState<string[]>([]);
  const [moveMode, setMoveMode] = useState(false);
  const [movingIndex, setMovingIndex] = useState<number | null>(null);
  const [dragCursor, setDragCursor] = useState<DragCursor | null>(null);
  const pointerDrag = useRef<PointerDrag | null>(null);
  const suppressClick = useRef(false);

  const placedCount = grid.filter(Boolean).length;
  const liveConnectionChecks = getModuleConnectionChecks(grid);
  const energyProduction = grid.reduce((total, cell, index) => {
    if (cell !== "solar-array") return total;
    const column = index % GRID_SIZE;
    const row = Math.floor(index / GRID_SIZE);
    const shadowed = Array.from({ length: row }, (_, previousRow) => grid[previousRow * GRID_SIZE + column])
      .some((moduleId) => moduleId !== null);
    return total + (shadowed ? 0 : BUILD_MODULES.find((module) => module.id === cell)!.energyOutput);
  }, 0);
  const energyDemand = grid.reduce((total, cell) => total + (cell ? BUILD_MODULES.find((module) => module.id === cell)!.energyDemand : 0), 0);
  const oxygenProduction = grid.reduce((total, cell) => total + (cell ? BUILD_MODULES.find((module) => module.id === cell)!.oxygenOutput : 0), 0);
  const oxygenDemand = grid.reduce((total, cell) => total + (cell ? BUILD_MODULES.find((module) => module.id === cell)!.oxygenDemand : 0), 0);

  function closeConnectionErrors() {
    setConnectionErrors([]);
  }

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

  useEffect(() => {
    if (connectionErrors.length === 0 && !result) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeConnectionErrors();
        setResult(null);
      }
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [connectionErrors.length, result]);

  function startPointerDrag(
    moduleId: ModuleId,
    sourceIndex: number | null,
    x: number,
    y: number,
    pointerId: number
  ) {
    pointerDrag.current = {
      moduleId,
      sourceIndex,
      pointerId,
      startX: x,
      startY: y,
      active: false
    };
  }

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

  const handleDrop = useCallback((index: number, moduleId: ModuleId, sourceIndex: number | null) => {
    if (sourceIndex !== null) {
      if (index === sourceIndex) return;
      setGrid((previous) => {
        const next = [...previous];
        [next[index], next[sourceIndex]] = [next[sourceIndex], next[index]];
        return next;
      });
      setMoveMode(false);
      setMovingIndex(null);
      setSelected(null);
      setResult(null);
      return;
    }

    if (grid[index] !== null) return;
    setGrid((previous) => previous.map((cell, cellIndex) => cellIndex === index ? moduleId : cell));
    setSelected(moduleId);
    setResult(null);
  }, [grid]);

  useEffect(() => {
    function handlePointerMove(event: PointerEvent) {
      const drag = pointerDrag.current;
      if (!drag || drag.pointerId !== event.pointerId) return;

      const distance = Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY);
      if (!drag.active && distance < DRAG_THRESHOLD) return;

      drag.active = true;
      const module = BUILD_MODULES.find((item) => item.id === drag.moduleId)!;
      setDragCursor({
        icon: module.icon,
        name: module.name,
        action: drag.sourceIndex === null ? "PLACE" : "MOVE",
        x: event.clientX,
        y: event.clientY
      });
    }

    function handlePointerUp(event: PointerEvent) {
      const drag = pointerDrag.current;
      if (!drag || drag.pointerId !== event.pointerId) return;

      pointerDrag.current = null;
      setDragCursor(null);
      if (!drag.active || event.type === "pointercancel") return;

      suppressClick.current = true;
      window.setTimeout(() => {
        suppressClick.current = false;
      }, 100);

      const target = document.elementFromPoint(event.clientX, event.clientY);
      const gridCell = target instanceof Element
        ? target.closest<HTMLElement>("[data-grid-index]")
        : null;
      if (!gridCell) return;

      handleDrop(Number(gridCell.dataset.gridIndex), drag.moduleId, drag.sourceIndex);
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [handleDrop]);

  function validateHabitat() {
    const placementErrors = getCriticalPlacementErrors(grid);
    if (placementErrors.length > 0) {
      setConnectionErrors(placementErrors);
      setResult(null);
      return;
    }

    setConnectionErrors([]);
    setResult(validateBuild(grid));
  }

  function resetBuild() {
    setGrid(Array(GRID_CELL_COUNT).fill(null));
    setSelected(null);
    setResult(null);
    setMoveMode(false);
    setMovingIndex(null);
    setConnectionErrors([]);
  }

  return (
    <main className="build-lab">
      <LabTransitionOverlay visible={isRocketFlying} />
      <div className="build-container">

        <nav className="build-navbar">
          <span className="build-brand">
            JUNIOR SPACE ACADEMY
          </span>

          <div className="build-nav-actions">
            <Link className="build-back-button" to="/labs" aria-label="Back to labs">
              ← BACK
            </Link>
            <span className="build-nav-label">BUILD LAB / 01</span>
          </div>
        </nav>

        <section className="build-lab-panel">
        <header className="build-header">
          <div className="build-lab-heading">
            <h1>Habitat Build Lab</h1>
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
              <span aria-hidden="true">▤</span> OVERVIEW
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
              <span aria-hidden="true">▶</span> BUILD
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
                <p>Meet the parts, then build a safe Moon home.</p>
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
                          Snap-together neighbors are a game rule. Real spacecraft connect systems with equipment and wiring, not a 4×4 tile map.
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
              Drag or select a module to place it.
            </p>

            <ModuleSelector
              selected={selected}
              onSelect={(id) => {
                if (suppressClick.current) return;
                setSelected(id);
              }}
              onPointerStart={startPointerDrag}
            />
          </aside>

          <section className={`build-main${dragCursor ? " pointer-dragging" : ""}`}>
            <div className="build-section-header">
              <h2>BUILD AREA</h2>

              <span className="build-counter">
                {placedCount} / {GRID_CELL_COUNT}
              </span>
            </div>

            <p className="build-hint">
              4 × 4 · Drag to place/move · Right-click to remove
            </p>

            <section className="build-live-resources" aria-label="Live resource balance">
              <div className={`build-resource-meter${energyProduction < energyDemand ? " deficit" : ""}`}>
                <div className="build-resource-heading">
                  <strong>POWER</strong>
                  <span>{energyProduction} / {energyDemand}</span>
                </div>
                <div className="build-resource-track" role="progressbar" aria-label="Power production compared to demand" aria-valuemin={0} aria-valuemax={Math.max(energyProduction, energyDemand, 1)} aria-valuenow={energyProduction}>
                  <span style={{ width: `${Math.min(100, energyProduction / Math.max(energyProduction, energyDemand, 1) * 100)}%` }} />
                </div>
                {energyProduction < energyDemand && <small>POWER LOW</small>}
              </div>
              <div className={`build-resource-meter oxygen${oxygenProduction < oxygenDemand ? " deficit" : ""}`}>
                <div className="build-resource-heading">
                  <strong>OXYGEN</strong>
                  <span>{oxygenProduction} / {oxygenDemand}</span>
                </div>
                <div className="build-resource-track" role="progressbar" aria-label="Oxygen production compared to demand" aria-valuemin={0} aria-valuemax={Math.max(oxygenProduction, oxygenDemand, 1)} aria-valuenow={oxygenProduction}>
                  <span style={{ width: `${Math.min(100, oxygenProduction / Math.max(oxygenProduction, oxygenDemand, 1) * 100)}%` }} />
                </div>
                {oxygenProduction < oxygenDemand && <small>OXYGEN LOW</small>}
              </div>
              <p>Game units</p>
            </section>

            <div className="build-grid-wrapper">
              <BuildGrid
                grid={grid}
                onPlace={(index) => {
                  if (suppressClick.current) return;
                  placeModule(index);
                }}
                movingIndex={movingIndex}
                onPointerStart={startPointerDrag}
                onContextRemove={removeModule}
              />
            </div>
            {dragCursor && (
              <div
                className="build-drag-cursor"
                style={{ left: dragCursor.x + 14, top: dragCursor.y + 14 }}
                aria-hidden="true"
              >
                <span>{dragCursor.icon}</span>
                <strong>{dragCursor.name}</strong>
                <small>{dragCursor.action}</small>
              </div>
            )}

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
                {moveMode ? "CANCEL" : "MOVE"}
              </button>
              <button
                className="build-primary-button"
                onClick={validateHabitat}
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
            {moveMode && (
              <p className="build-hint" aria-live="polite">
                {movingIndex === null ? "Choose a module to move." : "Choose its destination."}
              </p>
            )}

          </section>

          <aside className="build-info-sidebar">
            <h2>REQUIRED MODULES</h2>
            <p className="required-module-summary">Habitat · Life Support · Power · Airlock · Shelter</p>

            <section className="live-connections" aria-live="polite">
              <h3>CONNECTIONS</h3>
              <ul className="connection-check-list">
                {liveConnectionChecks.map((check) => (
                  <li className={`connection-check ${check.status}`} key={check.id}>
                    <span aria-hidden="true">
                      {check.status === "passed" ? "✓" : check.status === "failed" ? "!" : check.status === "optional" ? "—" : "·"}
                    </span>
                    <div>
                      <strong>{getConnectionLabel(check.id)}</strong>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </aside>

        </div>
        )}
        {connectionErrors.length > 0 && (
          <div className="build-error-backdrop" onClick={closeConnectionErrors} role="presentation">
            <section
              className="build-error-dialog"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="build-error-title"
              onClick={(event) => event.stopPropagation()}
            >
              <button type="button" className="build-error-close" onClick={closeConnectionErrors} aria-label="Close placement errors" autoFocus>×</button>
              <span className="build-error-icon" aria-hidden="true">!</span>
              <p className="build-eyebrow">CONNECTION CHECK FAILED</p>
              <h2 id="build-error-title">Required habitat setup</h2>
              <ul>{connectionErrors.map((error) => <li key={error}>{error}</li>)}</ul>
              <button type="button" className="build-primary-button" onClick={closeConnectionErrors}>BACK TO BUILD AREA</button>
            </section>
          </div>
        )}
        {result && (
          <div className="build-error-backdrop" onClick={() => setResult(null)} role="presentation">
            <section
              className="build-error-dialog build-score-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="build-score-title"
              onClick={(event) => event.stopPropagation()}
            >
              <button type="button" className="build-error-close" onClick={() => setResult(null)} aria-label="Close score details" autoFocus>×</button>
              <span className="build-score-icon" aria-hidden="true">{result.score}</span>
              <p className="build-eyebrow">BUILD REVIEW</p>
              <h2 id="build-score-title">Mission score: {result.score}/100</h2>
              <p>{result.messages[0]}</p>
              <section className="build-engineering-notes">
                <h4>{result.engineeringNotes.length > 0 ? "QUICK TIPS" : "GREAT WORK"}</h4>
                <ul>
                  {result.engineeringNotes.length > 0
                    ? result.engineeringNotes.slice(0, 4).map((note) => <li key={note}>{note}</li>)
                    : <li>All habitat systems are connected and resource needs are met.</li>}
                </ul>
              </section>
              <button type="button" className="build-primary-button" onClick={() => setResult(null)}>BACK TO BUILD AREA</button>
            </section>
          </div>
        )}
        </section>
      </div>
    </main>
  );
}
