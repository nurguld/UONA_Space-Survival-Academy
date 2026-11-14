import { useEffect, useId, useRef } from 'react'
import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react'
import type {
  ModuleDef,
  ModuleId,
  ModuleLevels,
  ResourceId,
  Resources,
} from '../types'
import { EVENTS, calculateDailyDelta } from '../game/engine'
import Button from './Button'

interface UpgradeModalProps {
  moduleId: ModuleId | null
  modulesDef: ModuleDef[]
  levels: ModuleLevels
  resources: Resources
  day: number
  budget: number
  disabled: boolean
  onConfirm: (moduleId: ModuleId) => void
  onClose: () => void
}

const RESOURCE_LABELS: Record<ResourceId, string> = {
  energy: 'Enerji',
  oxygen: 'Oksijen / Su',
  food: 'Gıda',
  radiation: 'Radyasyon Koruması',
  health: 'Mürettebat Sağlığı',
}

const RESOURCE_IDS: ResourceId[] = ['energy', 'oxygen', 'food', 'radiation', 'health']

export default function UpgradeModal({
  moduleId,
  modulesDef,
  levels,
  resources,
  day,
  budget,
  disabled,
  onConfirm,
  onClose,
}: UpgradeModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const pressedOutsideRef = useRef(false)
  const titleId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (moduleId && !dialog.open) {
      dialog.showModal()
    } else if (!moduleId && dialog.open) {
      dialog.close()
    }
  }, [moduleId])

  const mod = moduleId ? modulesDef.find((m) => m.id === moduleId) ?? null : null
  const currentLevel = mod ? levels[mod.id] : 0
  const isMax = mod ? currentLevel >= mod.maxLevel : false
  const nextLevel = mod ? Math.min(mod.maxLevel, currentLevel + 1) : 0
  const canAfford = mod ? budget >= mod.cost : false

  const currentDelta = calculateDailyDelta(levels, day, resources)
  const nextLevels: ModuleLevels = mod
    ? { ...levels, [mod.id]: nextLevel }
    : levels
  const nextDelta = calculateDailyDelta(nextLevels, day, resources)

  const unlockedEventCount = mod
    ? EVENTS.flatMap((ev) => ev.options).filter(
        (opt) => opt.requires?.moduleId === mod.id && opt.requires.minLevel === nextLevel,
      ).length
    : 0

  const isOutside = (e: ReactPointerEvent<HTMLDialogElement>, dialog: HTMLDialogElement) => {
    const r = dialog.getBoundingClientRect()
    return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom
  }

  const handlePointerDown = (e: ReactPointerEvent<HTMLDialogElement>) => {
    if ('closedBy' in HTMLDialogElement.prototype) return
    const dialog = dialogRef.current
    pressedOutsideRef.current = dialog ? isOutside(e, dialog) : false
  }

  const handlePointerUp = (e: ReactPointerEvent<HTMLDialogElement>) => {
    if ('closedBy' in HTMLDialogElement.prototype) return
    const dialog = dialogRef.current
    if (pressedOutsideRef.current && dialog && isOutside(e, dialog)) {
      onClose()
    }
    pressedOutsideRef.current = false
  }

  const formatSigned = (val: number) => (val > 0 ? `+${val}` : `${val}`)

  let body: ReactNode = null
  if (mod) {
    const affectedIds = RESOURCE_IDS.filter(
      (id) => mod.perDay[id] !== undefined || currentDelta[id] !== nextDelta[id],
    )

    body = (
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="font-pixel text-xs uppercase tracking-wider text-accent">
              Modül Geliştirme
            </span>
            <h2 id={titleId} className="font-pixel text-2xl mt-1">
              {mod.name} · {isMax ? `Sv. ${currentLevel} (Maksimum)` : `Sv. ${currentLevel} → Sv. ${nextLevel}`}
            </h2>
            <p className="text-muted text-sm mt-1">{mod.description}</p>
          </div>
        </div>

        {!isMax && (
          <div className="bg-space border-2 border-line p-3.5 flex flex-col gap-2">
            <p className="font-pixel text-xs text-muted uppercase">
              Yükseltme Sonrası Günlük Net Değişim
            </p>
            {affectedIds.map((id) => {
              const before = currentDelta[id]
              const after = nextDelta[id]
              const improved = after > before
              return (
                <div key={id} className="flex items-center justify-between text-sm font-pixel">
                  <span>{RESOURCE_LABELS[id]}</span>
                  <span>
                    <span className="text-muted">{formatSigned(before)}</span>
                    <span className="mx-2 text-accent">→</span>
                    <span className={improved ? 'text-food font-bold' : 'text-radiation font-bold'}>
                      {formatSigned(after)} /gün
                    </span>
                  </span>
                </div>
              )
            })}

            {unlockedEventCount > 0 && (
              <p className="font-pixel text-xs text-accent border-t border-line pt-2 mt-1">
                Yeni Kilit: Sv. {nextLevel} ile olaylarda {unlockedEventCount} yeni savunma seçeneği açılır!
              </p>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-sm font-pixel border-t border-line pt-3">
          <span>
            Maliyet:{' '}
            <strong className={canAfford ? 'text-accent' : 'text-radiation'}>
              {isMax ? '-' : `${mod.cost} puan`}
            </strong>
          </span>
          <span className="text-muted">
            Bütçe: {budget} {!isMax && canAfford ? `→ ${budget - mod.cost} puan` : 'puan'}
          </span>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Vazgeç
          </Button>
          {!isMax && (
            <Button
              type="button"
              autoFocus
              disabled={disabled || !canAfford}
              onClick={() => {
                onConfirm(mod.id)
                onClose()
              }}
            >
              {canAfford ? `Onayla (-${mod.cost} p)` : 'Yetersiz Bütçe'}
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      {...({ closedby: 'any' } as Record<string, string>)}
      className="m-auto w-[min(92vw,32rem)] bg-panel text-[#E6EAF5] border-[3px] border-accent shadow-[0_8px_0_#05070F] p-6"
    >
      {body}
    </dialog>
  )
}