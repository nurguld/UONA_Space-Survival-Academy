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
      className="m-auto w-[min(94vw,36rem)] max-h-[92dvh] overflow-y-auto rounded-2xl border-2 border-white/40 bg-[#081228]/95 backdrop-blur-xl text-[#E6EAF5] shadow-[0_0_40px_rgba(255,255,255,0.12)] p-5 sm:p-6"
    >
      {summary && (
        <div className="flex flex-col gap-4">
          {/* Üst Başlık ve Başarı Durumu */}
          <div className="flex items-start justify-between gap-3 border-b border-white/20 pb-3.5">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-sky-400">
                {summary.isNight ? 'Ay Gecesi Değerlendirmesi' : 'Gün Sonu Değerlendirmesi'}
              </span>
              <h2 id={titleId} className="text-2xl sm:text-3xl font-bold text-white mt-0.5">
                {summary.day}. Gün Tamamlandı!
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                {hasLowResource
                  ? 'Üs günü atlattı ancak bazı kaynaklar kritik düzeye yaklaştı; yarın takviye yap!'
                  : 'Bugün Ay üssünün enerji ve yaşam destek dengesini başarıyla korudun.'}
              </p>
            </div>

            <span
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold border ${
                hasLowResource
                  ? 'border-amber-400/60 bg-amber-500/20 text-amber-200'
                  : 'border-emerald-400/70 bg-emerald-500/20 text-emerald-200'
              }`}
            >
              {hasLowResource ? 'Dikkat!' : 'Başarılı!'}
            </span>
          </div>

          {/* Tamamlanan İnşaatlar Kutusu */}
          {summary.completedBuilds && summary.completedBuilds.length > 0 && (
            <div className="rounded-xl border border-emerald-400/50 bg-emerald-500/15 px-4 py-3 flex flex-col gap-1.5">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                🛠️ Bugün Tamamlanan İnşaatlar
              </p>
              <ul className="text-sm text-white font-semibold space-y-1">
                {summary.completedBuilds.map((item) => (
                  <li key={item}>✓ {item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Öncesi -> Sonrası Kaynak Değişim Listesi */}
          <div className="rounded-xl border border-white/25 bg-[#050C1D]/85 p-4 flex flex-col gap-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
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
                  className="flex items-center justify-between gap-2 text-sm sm:text-base"
                >
                  <span className="inline-flex items-center gap-2 font-medium text-slate-100">
                    <ResourceIcon id={id} className="w-4 h-4 shrink-0" />
                    <span>{meta.label}</span>
                  </span>

                  <div className="flex items-center gap-2 tabular-nums">
                    <span className="text-slate-400">{beforeVal}</span>
                    <span className="text-cyan-300">→</span>
                    <span className="font-bold text-white">{afterVal}</span>
                    <span
                      className={`text-xs font-semibold px-1.5 py-0.5 rounded border min-w-10 text-center ${
                        diff > 0
                          ? 'border-emerald-400/45 bg-emerald-500/15 text-emerald-300'
                          : diff < 0
                            ? 'border-orange-400/45 bg-orange-500/15 text-orange-300'
                            : 'border-white/20 bg-white/5 text-slate-300'
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
          <div className="rounded-xl border border-cyan-400/35 bg-cyan-950/25 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-cyan-300">
              Bugün Ne Öğrendik?
            </p>
            <p className="text-sm text-slate-100 mt-1 leading-relaxed">{factText}</p>
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
              className="px-6 min-h-11 rounded-xl text-sm sm:text-base font-bold bg-gradient-to-r from-sky-400 to-cyan-300 text-slate-950 shadow-[0_0_20px_rgba(56,189,248,0.4)] hover:brightness-110 cursor-pointer transition-all"
            >
              {summary.day + 1}. Güne Geç →
            </button>
          </div>
        </div>
      )}
    </dialog>
  )
}
