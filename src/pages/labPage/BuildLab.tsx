import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import LanguageToggle from '../../components/LanguageToggle'
import LabStationBadge from '../../components/labComponents/LabStationBadge'
import ModuleSelector from '../../components/labComponents/ModuleSelector'
import ModuleIllustration from '../../components/labComponents/ModuleIllustration'
import BuildGrid, { type GridCell } from '../../components/labComponents/BuildGrid'
import { useLanguage, type Language } from '../../context/LanguageContext'
import {
  getBuildModule,
  getLocalizedBuildModules,
  getLocalizedConnectionRules,
  type ModuleId,
} from '../../data/buildModules'
import {
  BUILD_GRID_SIZE,
  getCriticalPlacementErrors,
  getModuleConnectionChecks,
  validateBuild,
  type ValidationResult,
} from '../../game/buildValidation'
import { LabTransitionOverlay } from '../../components/LabTransition'
import { handleInteractiveClick, playClick } from '../../game/sound'
import { useLabTransition } from '../../hooks/useLabTransition'

import './BuildLab.css'

const GRID_SIZE = BUILD_GRID_SIZE
const GRID_CELL_COUNT = GRID_SIZE * GRID_SIZE
const DRAG_THRESHOLD = 6

type PointerDrag = {
  moduleId: ModuleId
  sourceIndex: number | null
  pointerId: number
  startX: number
  startY: number
  active: boolean
}

type DragCursor = {
  icon: string
  name: string
  action: 'PLACE' | 'MOVE'
  x: number
  y: number
}

function getConnectionLabel(id: string, lang: Language) {
  const labels: Record<string, { en: string; tr: string }> = {
    'life-support-habitat': {
      en: 'Life Support + Habitat',
      tr: 'Yaşam Desteği + Habitat',
    },
    'airlock-habitat': {
      en: 'Airlock + Habitat',
      tr: 'Hava Kilidi + Habitat',
    },
    'radiation-habitat': {
      en: 'Shelter + Habitat',
      tr: 'Sığınak + Habitat',
    },
    'water-life-support': {
      en: 'Water + Life Support',
      tr: 'Su + Yaşam Desteği',
    },
    'greenhouse-habitat-life-support': {
      en: 'Garden + Habitat / Life Support',
      tr: 'Sera + Habitat / Yaşam Desteği',
    },
    'solar-habitat-network': {
      en: 'Power link',
      tr: 'Güç bağlantısı',
    },
  }
  return labels[id]?.[lang] ?? id
}

export default function BuildLab() {
  const { lang, pick } = useLanguage()
  const buildModules = getLocalizedBuildModules(lang)
  const connectionRules = getLocalizedConnectionRules(lang)

  const {
    activeSection: view,
    isRocketFlying,
    transitionTo: setView,
  } = useLabTransition<'briefing' | 'construction'>('briefing')
  const [infoModule, setInfoModule] = useState<ModuleId | null>(null)
  const [selected, setSelected] = useState<ModuleId | null>(null)

  const [grid, setGrid] = useState<GridCell[]>(Array(GRID_CELL_COUNT).fill(null))

  const [result, setResult] = useState<ValidationResult | null>(null)
  const [connectionErrors, setConnectionErrors] = useState<string[]>([])
  const [moveMode, setMoveMode] = useState(false)
  const [movingIndex, setMovingIndex] = useState<number | null>(null)
  const [dragCursor, setDragCursor] = useState<DragCursor | null>(null)
  const pointerDrag = useRef<PointerDrag | null>(null)
  const suppressClick = useRef(false)

  const placedCount = grid.filter(Boolean).length
  const liveConnectionChecks = getModuleConnectionChecks(grid, lang)
  const energyProduction = grid.reduce((total, cell, index) => {
    if (cell !== 'solar-array') return total
    const column = index % GRID_SIZE
    const row = Math.floor(index / GRID_SIZE)
    const shadowed = Array.from(
      { length: row },
      (_, previousRow) => grid[previousRow * GRID_SIZE + column],
    ).some((moduleId) => moduleId !== null)
    return total + (shadowed ? 0 : getBuildModule(cell, lang).energyOutput)
  }, 0)
  const energyDemand = grid.reduce(
    (total, cell) => total + (cell ? getBuildModule(cell, lang).energyDemand : 0),
    0,
  )
  const oxygenProduction = grid.reduce(
    (total, cell) => total + (cell ? getBuildModule(cell, lang).oxygenOutput : 0),
    0,
  )
  const oxygenDemand = grid.reduce(
    (total, cell) => total + (cell ? getBuildModule(cell, lang).oxygenDemand : 0),
    0,
  )

  function closeConnectionErrors() {
    setConnectionErrors([])
  }

  useEffect(() => {
    if (!infoModule) return

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setInfoModule(null)
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', closeOnEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [infoModule])

  useEffect(() => {
    if (connectionErrors.length === 0 && !result) return

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        closeConnectionErrors()
        setResult(null)
      }
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [connectionErrors.length, result])

  function startPointerDrag(
    moduleId: ModuleId,
    sourceIndex: number | null,
    x: number,
    y: number,
    pointerId: number,
  ) {
    pointerDrag.current = {
      moduleId,
      sourceIndex,
      pointerId,
      startX: x,
      startY: y,
      active: false,
    }
  }

  function placeModule(index: number) {
    if (moveMode) {
      if (movingIndex === null) {
        if (grid[index] === null) return
        setMovingIndex(index)
        return
      }

      if (index === movingIndex) {
        setMovingIndex(null)
        return
      }
      if (grid[index] !== null) {
        setMovingIndex(index)
        return
      }

      setGrid((previous) => {
        const next = [...previous]
        next[index] = next[movingIndex]
        next[movingIndex] = null
        return next
      })
      setMovingIndex(null)
      setResult(null)
      return
    }

    if (!selected) return
    if (grid[index] !== null) return

    setGrid((previous) => previous.map((cell, i) => (i === index ? selected : cell)))

    setResult(null)
  }

  function removeModule(index: number) {
    playClick()
    setGrid((previous) => previous.map((cell, i) => (i === index ? null : cell)))

    setResult(null)
  }

  const handleDrop = useCallback(
    (index: number, moduleId: ModuleId, sourceIndex: number | null) => {
      if (sourceIndex !== null) {
        if (index === sourceIndex) return
        playClick()
        setGrid((previous) => {
          const next = [...previous]
          ;[next[index], next[sourceIndex]] = [next[sourceIndex], next[index]]
          return next
        })
        setMoveMode(false)
        setMovingIndex(null)
        setSelected(null)
        setResult(null)
        return
      }

      if (grid[index] !== null) return
      playClick()
      setGrid((previous) =>
        previous.map((cell, cellIndex) => (cellIndex === index ? moduleId : cell)),
      )
      setSelected(moduleId)
      setResult(null)
    },
    [grid],
  )

  useEffect(() => {
    function handlePointerMove(event: PointerEvent) {
      const drag = pointerDrag.current
      if (!drag || drag.pointerId !== event.pointerId) return

      const distance = Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY)
      if (!drag.active && distance < DRAG_THRESHOLD) return

      drag.active = true
      const module = getBuildModule(drag.moduleId, lang)
      setDragCursor({
        icon: module.icon,
        name: module.name,
        action: drag.sourceIndex === null ? 'PLACE' : 'MOVE',
        x: event.clientX,
        y: event.clientY,
      })
    }

    function handlePointerUp(event: PointerEvent) {
      const drag = pointerDrag.current
      if (!drag || drag.pointerId !== event.pointerId) return

      pointerDrag.current = null
      setDragCursor(null)
      if (!drag.active || event.type === 'pointercancel') return

      suppressClick.current = true
      window.setTimeout(() => {
        suppressClick.current = false
      }, 100)

      const target = document.elementFromPoint(event.clientX, event.clientY)
      const gridCell =
        target instanceof Element ? target.closest<HTMLElement>('[data-grid-index]') : null
      if (!gridCell) return

      handleDrop(Number(gridCell.dataset.gridIndex), drag.moduleId, drag.sourceIndex)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('pointercancel', handlePointerUp)
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', handlePointerUp)
    }
  }, [handleDrop, lang])

  function validateHabitat() {
    const placementErrors = getCriticalPlacementErrors(grid, lang)
    if (placementErrors.length > 0) {
      setConnectionErrors(placementErrors)
      setResult(null)
      return
    }

    setConnectionErrors([])
    setResult(validateBuild(grid, lang))
  }

  function resetBuild() {
    setGrid(Array(GRID_CELL_COUNT).fill(null))
    setSelected(null)
    setResult(null)
    setMoveMode(false)
    setMovingIndex(null)
    setConnectionErrors([])
  }

  return (
    <main className="build-lab">
      <LabTransitionOverlay visible={isRocketFlying} />
      <div
        className="build-container"
        onClickCapture={(event) => handleInteractiveClick(event.target)}
      >
        <nav className="build-navbar" aria-label={pick('Build Lab navigation', 'İnşa Labı gezinti')}>
          <span className="build-brand">JUNIOR SPACE ACADEMY</span>

          <div className="build-nav-actions">
            <span className="build-nav-label">{pick('BUILD LAB / 01', 'İNŞA LABI / 01')}</span>
            <LanguageToggle />
          </div>
        </nav>
        <Link
          className="lab-back-button build-back-button"
          to="/labs"
          aria-label={pick('Back to labs', 'Laboratuvarlara dön')}
        >
          <ArrowLeft aria-hidden="true" />
          <span>{pick('BACK', 'GERİ')}</span>
        </Link>

        <section className="build-lab-panel">
          <header className="build-header">
            <div className="build-lab-heading lab-station-heading">
              <LabStationBadge station="build" />
              <h1>{pick('Habitat Build Lab', 'Habitat İnşa Laboratuvarı')}</h1>
            </div>
            <div
              className="build-mode-tabs"
              role="tablist"
              aria-label={pick('Build Lab sections', 'İnşa Laboratuvarı bölümleri')}
            >
              <button
                type="button"
                id="build-guide-tab"
                role="tab"
                aria-controls="build-guide-panel"
                aria-selected={view === 'briefing'}
                className={view === 'briefing' ? 'active' : ''}
                onClick={() => setView('briefing')}
              >
                <span aria-hidden="true">▤</span> {pick('OVERVIEW', 'GENEL BAKIŞ')}
              </button>
              <button
                type="button"
                id="build-simulation-tab"
                role="tab"
                aria-controls="build-simulation-panel"
                aria-selected={view === 'construction'}
                className={view === 'construction' ? 'active' : ''}
                onClick={() => setView('construction')}
              >
                <span aria-hidden="true">▶</span> {pick('BUILD', 'İNŞA ET')}
              </button>
            </div>
          </header>

          {view === 'briefing' ? (
            <section
              id="build-guide-panel"
              className="module-briefing"
              role="tabpanel"
              aria-labelledby="build-guide-tab"
            >
              <div className="briefing-heading">
                <div>
                  <p className="build-eyebrow">
                    {pick('ROVER RADIO / MESSAGE 01', 'KEŞİF RADYOSU / MESAJ 01')}
                  </p>
                  <h2 id="module-briefing-title">
                    {pick(
                      'Build a home for the next Moon explorers',
                      'Geleceğin Ay kaşifleri için bir üs inşa et',
                    )}
                  </h2>
                  <p>
                    {pick(
                      'Meet the parts, then build a safe Moon home.',
                      'Parçaları tanı, ardından güvenli bir Ay üssü kur.',
                    )}
                  </p>
                </div>
                <span className="briefing-count">{pick('7 SPACE PARTS', '7 UZAY PARÇASI')}</span>
              </div>

              <div className="module-card-grid">
                {buildModules.map((module, index) => (
                  <button
                    type="button"
                    key={module.id}
                    className={`module-info-card${infoModule === module.id ? ' active' : ''}`}
                    aria-pressed={infoModule === module.id}
                    onClick={() => setInfoModule(module.id)}
                  >
                    <ModuleIllustration moduleId={module.id} name={module.name} />
                    <span className="module-card-index">
                      {pick(`SPACE PART 0${index + 1}`, `UZAY PARÇASI 0${index + 1}`)}
                    </span>
                    <strong>{module.name}</strong>
                    <span className="module-card-summary">{module.description}</span>
                    <span className="module-card-energy">
                      {module.energyOutput > 0
                        ? pick(
                            `MAKES ${module.energyOutput} GAME POWER`,
                            `${module.energyOutput} OYUN GÜCÜ ÜRETİR`,
                          )
                        : pick(
                            `USES ${module.energyDemand} GAME POWER`,
                            `${module.energyDemand} OYUN GÜCÜ KULLANIR`,
                          )}
                    </span>
                    <span className="module-card-open">
                      {pick('OPEN SPACE-PART CARD →', 'PARÇA KARTINI AÇ →')}
                    </span>
                  </button>
                ))}
              </div>

              {infoModule &&
                (() => {
                  const module = getBuildModule(infoModule, lang)
                  const relatedConnections = connectionRules.filter(
                    (rule) => rule.moduleId === module.id || rule.adjacentTo.includes(module.id),
                  )
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
                          aria-label={pick('Close module information', 'Modül bilgisini kapat')}
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
                          <p className="build-eyebrow">
                            {pick('MOON BASE FIELD CARD', 'AY ÜSSÜ SAHA KARTI')}
                          </p>
                          <h3 id="module-dialog-title">
                            {module.icon} {module.name} — {module.label}
                          </h3>
                          <p className="module-science-copy">{module.science}</p>
                          <div className="module-connections">
                            <strong>
                              {pick('WHO DOES THIS PART WORK WITH?', 'BU PARÇA HANGİLERİYLE ÇALIŞIR?')}
                            </strong>
                            {relatedConnections.map((rule) => (
                              <article key={rule.id}>
                                <b>{rule.label.replace(' ↔ ', ' + ')}</b>
                                <p>{rule.explanation}</p>
                              </article>
                            ))}
                            <small>
                              {pick(
                                'Snap-together neighbors are a game rule. Real spacecraft connect systems with equipment and wiring, not a 4×4 tile map.',
                                'Yan yana bağlantı bir oyun kuralıdır. Gerçek uzay araçları sistemleri 4×4 karo haritası yerine kablolama ve ekipmanlarla bağlar.',
                              )}
                            </small>
                          </div>
                        </div>
                      </section>
                    </div>
                  )
                })()}

              <p className="module-source-note">
                {pick(
                  'Space facts are simplified for young explorers. Module placement, energy values, and panel shadows are game rules—not real spacecraft designs.',
                  'Uzay bilgileri genç kaşifler için sadeleştirilmiştir. Modül yerleşimi, enerji değerleri ve panel gölgeleri oyun kurallarıdır—gerçek uzay aracı tasarımları değildir.',
                )}
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
                <h2>{pick('MODULES', 'MODÜLLER')}</h2>

                <p className="build-hint">
                  {pick('Drag or select a module to place it.', 'Yerleştirmek için bir modül sürükle veya seç.')}
                </p>

                <ModuleSelector
                  selected={selected}
                  onSelect={(id) => {
                    if (suppressClick.current) return
                    setSelected(id)
                  }}
                  onPointerStart={startPointerDrag}
                />
              </aside>

              <section className={`build-main${dragCursor ? ' pointer-dragging' : ''}`}>
                <div className="build-section-header">
                  <h2>{pick('BUILD AREA', 'İNŞA ALANI')}</h2>

                  <span className="build-counter">
                    {placedCount} / {GRID_CELL_COUNT}
                  </span>
                </div>

                <p className="build-hint">
                  {pick(
                    '4 × 4 · Drag to place/move · Right-click to remove',
                    '4 × 4 · Yerleştirmek/taşımak için sürükle · Kaldırmak için sağ tıkla',
                  )}
                </p>

                <section
                  className="build-live-resources"
                  aria-label={pick('Live resource balance', 'Canlı kaynak dengesi')}
                >
                  <div
                    className={`build-resource-meter${energyProduction < energyDemand ? ' deficit' : ''}`}
                  >
                    <div className="build-resource-heading">
                      <strong>{pick('POWER', 'GÜÇ')}</strong>
                      <span>
                        {energyProduction} / {energyDemand}
                      </span>
                    </div>
                    <div
                      className="build-resource-track"
                      role="progressbar"
                      aria-label={pick(
                        'Power production compared to demand',
                        'İhtiyaca kıyasla güç üretimi',
                      )}
                      aria-valuemin={0}
                      aria-valuemax={Math.max(energyProduction, energyDemand, 1)}
                      aria-valuenow={energyProduction}
                    >
                      <span
                        style={{
                          width: `${Math.min(100, (energyProduction / Math.max(energyProduction, energyDemand, 1)) * 100)}%`,
                        }}
                      />
                    </div>
                    {energyProduction < energyDemand && (
                      <small>{pick('POWER LOW', 'GÜÇ DÜŞÜK')}</small>
                    )}
                  </div>
                  <div
                    className={`build-resource-meter oxygen${oxygenProduction < oxygenDemand ? ' deficit' : ''}`}
                  >
                    <div className="build-resource-heading">
                      <strong>{pick('OXYGEN', 'OKSİJEN')}</strong>
                      <span>
                        {oxygenProduction} / {oxygenDemand}
                      </span>
                    </div>
                    <div
                      className="build-resource-track"
                      role="progressbar"
                      aria-label={pick(
                        'Oxygen production compared to demand',
                        'İhtiyaca kıyasla oksijen üretimi',
                      )}
                      aria-valuemin={0}
                      aria-valuemax={Math.max(oxygenProduction, oxygenDemand, 1)}
                      aria-valuenow={oxygenProduction}
                    >
                      <span
                        style={{
                          width: `${Math.min(100, (oxygenProduction / Math.max(oxygenProduction, oxygenDemand, 1)) * 100)}%`,
                        }}
                      />
                    </div>
                    {oxygenProduction < oxygenDemand && (
                      <small>{pick('OXYGEN LOW', 'OKSİJEN DÜŞÜK')}</small>
                    )}
                  </div>
                  <p>{pick('Game units', 'Oyun birimi')}</p>
                </section>

                <div className="build-grid-wrapper">
                  <BuildGrid
                    grid={grid}
                    onPlace={(index) => {
                      if (suppressClick.current) return
                      placeModule(index)
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
                    <small>
                      {dragCursor.action === 'PLACE'
                        ? pick('PLACE', 'YERLEŞTİR')
                        : pick('MOVE', 'TAŞI')}
                    </small>
                  </div>
                )}

                <div className="build-actions">
                  <button
                    className="build-secondary-button"
                    aria-pressed={moveMode}
                    onClick={() => {
                      setMoveMode((active) => !active)
                      setMovingIndex(null)
                      setSelected(null)
                    }}
                  >
                    {moveMode ? pick('CANCEL', 'İPTAL') : pick('MOVE', 'TAŞI')}
                  </button>
                  <button className="build-primary-button" onClick={validateHabitat}>
                    {pick('VALIDATE HABITAT', 'HABİTATI DOĞRULA')}
                  </button>

                  <button className="build-secondary-button" onClick={resetBuild}>
                    {pick('RESET', 'SIFIRLA')}
                  </button>
                </div>
                {moveMode && (
                  <p className="build-hint" aria-live="polite">
                    {movingIndex === null
                      ? pick('Choose a module to move.', 'Taşımak için bir modül seç.')
                      : pick('Choose its destination.', 'Hedef hücreyi seç.')}
                  </p>
                )}
              </section>

              <aside className="build-info-sidebar">
                <h2>{pick('REQUIRED MODULES', 'ZORUNLU MODÜLLER')}</h2>
                <p className="required-module-summary">
                  {pick(
                    'Habitat · Life Support · Power · Airlock · Shelter',
                    'Habitat · Yaşam Desteği · Güç · Hava Kilidi · Sığınak',
                  )}
                </p>

                <section className="live-connections" aria-live="polite">
                  <h3>{pick('CONNECTIONS', 'BAĞLANTILAR')}</h3>
                  <ul className="connection-check-list">
                    {liveConnectionChecks.map((check) => (
                      <li className={`connection-check ${check.status}`} key={check.id}>
                        <span aria-hidden="true">
                          {check.status === 'passed'
                            ? '✓'
                            : check.status === 'failed'
                              ? '!'
                              : check.status === 'optional'
                                ? '—'
                                : '·'}
                        </span>
                        <div>
                          <strong>{getConnectionLabel(check.id, lang)}</strong>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              </aside>
            </div>
          )}
          {connectionErrors.length > 0 && (
            <div
              className="build-error-backdrop"
              onClick={closeConnectionErrors}
              role="presentation"
            >
              <section
                className="build-error-dialog"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="build-error-title"
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  type="button"
                  className="build-error-close"
                  onClick={closeConnectionErrors}
                  aria-label={pick('Close placement errors', 'Yerleşim hatalarını kapat')}
                  autoFocus
                >
                  ×
                </button>
                <span className="build-error-icon" aria-hidden="true">
                  !
                </span>
                <p className="build-eyebrow">
                  {pick('CONNECTION CHECK FAILED', 'BAĞLANTI KONTROLÜ BAŞARISIZ')}
                </p>
                <h2 id="build-error-title">
                  {pick('Required habitat setup', 'Zorunlu habitat kurulumu')}
                </h2>
                <ul>
                  {connectionErrors.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
                <button
                  type="button"
                  className="build-primary-button"
                  onClick={closeConnectionErrors}
                >
                  {pick('BACK TO BUILD AREA', 'İNŞA ALANINA DÖN')}
                </button>
              </section>
            </div>
          )}
          {result && (
            <div
              className="build-error-backdrop"
              onClick={() => setResult(null)}
              role="presentation"
            >
              <section
                className="build-error-dialog build-score-dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="build-score-title"
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  type="button"
                  className="build-error-close"
                  onClick={() => setResult(null)}
                  aria-label={pick('Close score details', 'Puan detaylarını kapat')}
                  autoFocus
                >
                  ×
                </button>
                <span className="build-score-icon" aria-hidden="true">
                  {result.score}
                </span>
                <p className="build-eyebrow">{pick('BUILD REVIEW', 'İNŞA DEĞERLENDİRMESİ')}</p>
                <h2 id="build-score-title">
                  {pick(`Mission score: ${result.score}/100`, `Görev puanı: ${result.score}/100`)}
                </h2>
                <p>{result.messages[0]}</p>
                <section className="build-engineering-notes">
                  <h4>
                    {result.engineeringNotes.length > 0
                      ? pick('QUICK TIPS', 'HIZLI İPUÇLARI')
                      : pick('GREAT WORK', 'HARİKA İŞ')}
                  </h4>
                  <ul>
                    {result.engineeringNotes.length > 0
                      ? result.engineeringNotes.slice(0, 4).map((note) => <li key={note}>{note}</li>)
                      : [
                          <li key="ok">
                            {pick(
                              'All habitat systems are connected and resource needs are met.',
                              'Tüm habitat sistemleri bağlı ve kaynak ihtiyaçları karşılandı.',
                            )}
                          </li>,
                        ]}
                  </ul>
                </section>
                <button
                  type="button"
                  className="build-primary-button"
                  onClick={() => setResult(null)}
                >
                  {pick('BACK TO BUILD AREA', 'İNŞA ALANINA DÖN')}
                </button>
              </section>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
