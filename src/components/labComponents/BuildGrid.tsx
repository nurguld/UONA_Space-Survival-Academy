import { useLanguage } from '../../context/LanguageContext'
import {
  getBuildModule,
  MODULE_CONNECTION_RULES,
  type ModuleId,
} from '../../data/buildModules'

export type GridCell = ModuleId | null

type Props = {
  grid: GridCell[]
  onPlace: (index: number) => void
  movingIndex?: number | null
  onPointerStart: (
    id: ModuleId,
    sourceIndex: number,
    x: number,
    y: number,
    pointerId: number,
  ) => void
  onContextRemove: (index: number) => void
}

const GRID_SIZE = 4

function areConnected(first: ModuleId, second: ModuleId) {
  return MODULE_CONNECTION_RULES.some((rule) =>
    rule.moduleId === first
      ? rule.adjacentTo.includes(second)
      : rule.moduleId === second && rule.adjacentTo.includes(first),
  )
}

function hasMissingConnection(moduleId: ModuleId | null, adjacentModules: Array<ModuleId | null>) {
  if (!moduleId) return false
  return MODULE_CONNECTION_RULES
    .filter((rule) => rule.moduleId === moduleId)
    .some((rule) =>
      rule.match === 'all'
        ? !rule.adjacentTo.every((targetId) => adjacentModules.includes(targetId))
        : !rule.adjacentTo.some((targetId) => adjacentModules.includes(targetId)),
    )
}

function getNeighbors(index: number) {
  const row = Math.floor(index / GRID_SIZE)
  const column = index % GRID_SIZE
  return {
    top: row > 0 ? index - GRID_SIZE : -1,
    right: column < GRID_SIZE - 1 ? index + 1 : -1,
    bottom: row < GRID_SIZE - 1 ? index + GRID_SIZE : -1,
    left: column > 0 ? index - 1 : -1,
  }
}

export default function BuildGrid({
  grid,
  onPlace,
  movingIndex = null,
  onPointerStart,
  onContextRemove,
}: Props) {
  const { lang, pick } = useLanguage()

  return (
    <div
      className="build-grid"
      role="grid"
      aria-label={pick('4 by 4 habitat build area', '4×4 habitat inşa alanı')}
    >
      {grid.map((cell, index) => {
        const module = cell ? getBuildModule(cell, lang) : null
        const row = Math.floor(index / GRID_SIZE) + 1
        const column = (index % GRID_SIZE) + 1
        const neighbors = getNeighbors(index)
        const adjacentModules = Object.entries(neighbors)
          .filter(([, neighborIndex]) => neighborIndex >= 0)
          .map(([direction, neighborIndex]) => ({
            direction,
            index: neighborIndex,
            moduleId: grid[neighborIndex],
          }))
        const connectionFailed = hasMissingConnection(
          cell,
          adjacentModules.map(({ moduleId }) => moduleId),
        )
        const connectionEdges = cell
          ? adjacentModules.flatMap(({ direction, index: neighborIndex, moduleId }) => {
              const neighboringModules = Object.values(getNeighbors(neighborIndex))
                .filter((cellIndex) => cellIndex >= 0)
                .map((cellIndex) => grid[cellIndex])
              const compatible = moduleId !== null && areConnected(cell, moduleId)
              const failed = connectionFailed || hasMissingConnection(moduleId, neighboringModules)

              return compatible
                ? [{ direction, status: 'connected' }]
                : failed
                  ? [{ direction, status: 'failed' }]
                  : []
            })
          : []
        const solarIsSunlit =
          cell === 'solar-array' &&
          !Array.from(
            { length: row - 1 },
            (_, previousRow) => grid[previousRow * GRID_SIZE + column - 1],
          ).some((item) => item !== null)

        return (
          <button
            key={index}
            type="button"
            className={`grid-cell${module ? ' occupied' : ''}${solarIsSunlit ? ' sunlit' : ''}${cell === 'solar-array' && !solarIsSunlit ? ' shadowed' : ''}${movingIndex === index ? ' moving' : ''}${connectionFailed ? ' connection-bad' : ''}`}
            role="gridcell"
            data-grid-index={index}
            aria-label={pick(
              `Row ${row}, column ${column}${module ? `, ${module.name}` : ', empty'}`,
              `Satır ${row}, sütun ${column}${module ? `, ${module.name}` : ', boş'}`,
            )}
            title={
              module
                ? `${module.name}${
                    connectionFailed
                      ? pick(' · Missing required neighbor', ' · Gerekli komşu eksik')
                      : ''
                  }${
                    cell === 'solar-array'
                      ? solarIsSunlit
                        ? pick(' · In sunlight', ' · Güneş ışığında')
                        : pick(' · In shadow', ' · Gölgede')
                      : ''
                  }`
                : pick(
                    `Position ${String(index + 1).padStart(2, '0')}`,
                    `Konum ${String(index + 1).padStart(2, '0')}`,
                  )
            }
            onClick={() => onPlace(index)}
            onPointerDown={(event) => {
              if (!cell || event.button !== 0) return
              onPointerStart(cell, index, event.clientX, event.clientY, event.pointerId)
            }}
            onContextMenu={(event) => {
              if (!cell) return
              event.preventDefault()
              onContextRemove(index)
            }}
          >
            {module ? (
              <>
                <span aria-hidden="true">{module.icon}</span>
                <span className="grid-module-label">{module.label}</span>
                {cell === 'solar-array' && (
                  <span className="solar-status" aria-hidden="true">
                    {solarIsSunlit ? '☀' : '◌'}
                  </span>
                )}
              </>
            ) : (
              <span className="grid-cell-number" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
            )}
            {connectionEdges.map(({ direction, status }) => (
              <i
                className={`grid-connection-edge ${direction}${status === 'failed' ? ' failed' : ''}`}
                key={direction}
                aria-hidden="true"
              />
            ))}
            {movingIndex === index && (
              <span className="moving-label">{pick('MOVING', 'TAŞINIYOR')}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
