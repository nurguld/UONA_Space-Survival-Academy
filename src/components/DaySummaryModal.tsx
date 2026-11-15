import { useEffect, useId, useRef } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import type { Resources } from '../types'
import { RESOURCE_CONFIG, RESOURCE_ORDER, ResourceIcon } from './ResourceIcon'
import dailyFactsData from '../data/dailyFacts.json'

const DAILY_FACTS = dailyFactsData as string[]

export interface DaySummaryData {
  day: number
  isNight: boolean
  before: Resources
  after: Resources
  completedBuilds?: string[]
}

interface DaySummaryModalProps {
  summary: DaySummaryData | null
  onClose: () => void
}

export default function DaySummaryModal({ summary, onClose }: DaySummaryModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const pressedOutsideRef = useRef(false)
  const titleId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (summary && !dialog.open) {
      dialog.showModal()
    } else if (!summary && dialog.open) {
      dialog.close()
    }
  }, [summary])

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

  const hasLowResource = summary
    ? RESOURCE_ORDER.some((id) => summary.after[id] < 30)
    : false
  const factText = summary
    ? DAILY_FACTS[(summary.day - 1) % DAILY_FACTS.length]
    : ''

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      {...({ closedby: 'any' } as Record<string, string>)}
      className="m-auto w-[min(94vw,35rem)] max-h-[92dvh] overflow-y-auto overscroll-contain rounded-2xl border border-slate-300/35 bg-gradient-to-b from-[#172133]/96 via-[#192336]/97 to-[#121A29]/98 backdrop-blur-xl text-slate-100 shadow-[0_20px_54px_rgba(4,9,20,0.72),0_0_24px_rgba(56,189,248,0.1)] p-5 sm:p-6"
    >
      {summary && (
        <div className="flex flex-col gap-3.5">
          {/* Üst Başlık ve Başarı Durumu */}
          <div className="flex items-start justify-between gap-3 border-b border-slate-300/20 pb-3.5">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-sky-400">
                {summary.isNight ? 'Ay Gecesi Değerlendirmesi' : 'Gün Sonu Değerlendirmesi'}
              </span>
              <h2 id={titleId} className="text-xl sm:text-2xl font-extrabold tracking-tight text-white mt-0.5 leading-snug">
                {summary.day}. Gün Tamamlandı!
              </h2>
              <p className="text-xs sm:text-sm text-slate-300/90 mt-1 leading-snug">
                {hasLowResource
                  ? 'Üs günü atlattı ancak bazı kaynaklar kritik düzeye yaklaştı; yarın takviye yap!'
                  : 'Bugün Ay üssünün enerji ve yaşam destek dengesini başarıyla korudun.'}
              </p>
            </div>

            <span
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold border ${
                hasLowResource
                  ? 'border-amber-300/45 bg-amber-500/18 text-amber-200'
                  : 'border-emerald-300/45 bg-emerald-500/18 text-emerald-200'
              }`}
            >
              {hasLowResource ? 'Dikkat!' : 'Başarılı!'}
            </span>
          </div>

          {/* Tamamlanan İnşaatlar Kutusu */}
          {summary.completedBuilds && summary.completedBuilds.length > 0 && (
            <div className="rounded-xl border border-emerald-400/40 bg-[#101829]/80 px-4 py-3 flex flex-col gap-1.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.09em] text-emerald-300">
                🛠️ Bugün Tamamlanan İnşaatlar
              </p>
              <ul className="text-sm text-slate-100 font-semibold space-y-1">
                {summary.completedBuilds.map((item) => (
                  <li key={item}>✓ {item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Öncesi -> Sonrası Kaynak Değişim Listesi */}
          <div className="rounded-xl border border-slate-300/20 bg-[#101829]/75 p-4 flex flex-col gap-2.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
              Kaynak Değişim Raporu
            </p>

            {RESOURCE_ORDER.map((id) => {
              const beforeVal = summary.before[id]
              const afterVal = summary.after[id]
              const diff = afterVal - beforeVal
              const meta = RESOURCE_CONFIG[id]

              return (
                <div
                  key={id}
                  className="flex items-center justify-between gap-2 text-sm"
                >
                  <span className="inline-flex items-center gap-2 font-semibold text-slate-200">
                    <ResourceIcon id={id} className="w-4 h-4 shrink-0" />
                    <span>{meta.label}</span>
                  </span>

                  <div className="flex items-center gap-2 tabular-nums">
                    <span className="text-slate-400 font-semibold">{beforeVal}</span>
                    <span className="text-slate-500">→</span>
                    <span className="font-bold text-white">{afterVal}</span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-md border min-w-10 text-center ${
                        diff > 0
                          ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-300'
                          : diff < 0
                            ? 'border-orange-400/40 bg-orange-500/15 text-orange-300'
                            : 'border-slate-300/20 bg-[#1B263B]/70 text-slate-300'
                      }`}
                    >
                      {diff > 0 ? `+${diff}` : diff}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Bugün Ne Öğrendik? */}
          <div className="rounded-xl border border-sky-300/25 bg-[#101829]/80 p-3.5 sm:p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-sky-300">
              Bugün Ne Öğrendik?
            </p>
            <p className="text-xs sm:text-sm text-slate-100/95 mt-1.5 leading-relaxed">{factText}</p>
          </div>

          {/* Devam Butonu */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <span className="text-xs text-slate-400">
              {summary.day} günlük görev tamamlandı
            </span>
            <button
              type="button"
              autoFocus
              onClick={onClose}
              className="px-5 sm:px-6 min-h-10 rounded-xl text-xs sm:text-sm font-extrabold bg-gradient-to-r from-[#0EA5D9] to-[#22C9EB] text-white shadow-[0_6px_18px_rgba(34,201,235,0.28)] hover:brightness-110 cursor-pointer transition-all"
            >
              {summary.day + 1}. Güne Geç →
            </button>
          </div>
        </div>
      )}
    </dialog>
  )
}
