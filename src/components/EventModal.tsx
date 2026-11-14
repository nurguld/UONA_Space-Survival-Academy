import { useEffect, useId, useRef } from 'react'
import type { GameEvent, ModuleDef, ModuleLevels, ResourceId } from '../types'
import { isOptionUnlocked } from '../game/engine'

interface EventModalProps {
  event: GameEvent | null
  modules: ModuleLevels
  modulesDef: ModuleDef[]
  onSelect: (optionIndex: number) => void
}

const RESOURCE_LABELS: Record<ResourceId, string> = {
  energy: 'Enerji',
  oxygen: 'Oksijen',
  food: 'Gıda',
  radiation: 'Radyasyon',
  health: 'Sağlık',
}

export default function EventModal({
  event,
  modules,
  modulesDef,
  onSelect,
}: EventModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (event && !dialog.open) {
      dialog.showModal()
    } else if (!event && dialog.open) {
      dialog.close()
    }
  }, [event])

  const getModuleName = (id: string) =>
    modulesDef.find((m) => m.id === id)?.name ?? id

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(e) => e.preventDefault()}
      {...({ closedby: 'none' } as Record<string, string>)}
      className="m-auto w-[min(92vw,36rem)] bg-panel text-[#E6EAF5] border-[3px] border-radiation shadow-[0_8px_0_#05070F] p-6"
    >
      {event && (
        <div className="flex flex-col gap-4">
          <div>
            <span className="font-pixel text-xs uppercase tracking-wider text-radiation">
              Acil Durum Raporu
            </span>
            <h2 id={titleId} className="font-pixel text-2xl mt-1">
              {event.title}
            </h2>
            <p className="text-muted text-sm mt-2">{event.description}</p>
          </div>

          <div className="flex flex-col gap-3">
            {event.options.map((opt, index) => {
              const unlocked = isOptionUnlocked(opt, modules)
              const reqText = opt.requires
                ? `${getModuleName(opt.requires.moduleId)} Sv. ${opt.requires.minLevel}`
                : null

              return (
                <button
                  key={opt.label}
                  type="button"
                  autoFocus={index === 0}
                  disabled={!unlocked}
                  onClick={() => onSelect(index)}
                  className={`text-left p-3.5 border-[3px] transition-colors ${
                    unlocked
                      ? 'bg-space border-line hover:border-accent cursor-pointer'
                      : 'bg-space/50 border-line/40 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-pixel text-base font-bold">{opt.label}</span>
                    {reqText && (
                      <span
                        className={`font-pixel text-xs px-2 py-0.5 border ${
                          unlocked
                            ? 'border-food text-food'
                            : 'border-radiation text-radiation'
                        }`}
                      >
                        {unlocked ? `Açık · ${reqText}` : `Kilitli · ${reqText} gerekli`}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-muted mt-1">{opt.explanation}</p>

                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {(Object.entries(opt.effects) as [ResourceId, number][]).map(([resId, val]) => (
                      <span
                        key={resId}
                        className={`font-pixel text-xs px-2 py-0.5 border ${
                          val >= 0
                            ? 'border-food/50 text-food'
                            : 'border-radiation/50 text-radiation'
                        }`}
                      >
                        {RESOURCE_LABELS[resId]} {val > 0 ? `+${val}` : val}
                      </span>
                    ))}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </dialog>
  )
}