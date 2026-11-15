import { useEffect, useId, useRef, useState } from 'react'
import { DIFFICULTY_CONFIG, getEffectiveBaseDrain } from '../game/engine'
import type { DifficultyLevel, MissionSetup } from '../types'

interface MissionSetupModalProps {
  isOpen: boolean
  initialCrewCount?: number
  initialDifficulty?: DifficultyLevel
  onConfirm: (setup: MissionSetup) => void
}

const CREW_OPTIONS = [1, 2, 3, 4] as const
const DIFFICULTIES: DifficultyLevel[] = ['easy', 'normal', 'hard']

export default function MissionSetupModal({
  isOpen,
  initialCrewCount = 3,
  initialDifficulty = 'normal',
  onConfirm,
}: MissionSetupModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const closingFromPropRef = useRef(false)

  const [crewCount, setCrewCount] = useState<number>(initialCrewCount)
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(initialDifficulty)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen && !dialog.open) {
      setCrewCount(initialCrewCount)
      setDifficulty(initialDifficulty)
      dialog.showModal()
    } else if (!isOpen && dialog.open) {
      closingFromPropRef.current = true
      dialog.close()
    }
  }, [isOpen, initialCrewCount, initialDifficulty])

  const dailyDrain = getEffectiveBaseDrain(crewCount)

  const handleConfirm = () => {
    onConfirm({ crewCount, difficulty })
  }

  const handleDialogClose = () => {
    if (closingFromPropRef.current) {
      closingFromPropRef.current = false
      return
    }
    handleConfirm()
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={handleDialogClose}
      {...({ closedby: 'any' } as Record<string, string>)}
      className="m-auto w-[min(94vw,42rem)] max-h-[92dvh] overflow-y-auto rounded-2xl border-2 border-white/40 bg-[#081228]/95 backdrop-blur-xl text-[#E6EAF5] shadow-[0_0_48px_rgba(56,189,248,0.24)] p-5 sm:p-6"
    >
      <div className="flex flex-col gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-300">
            Görev Planlama · 30 Günlük Ay Görevi
          </span>
          <h2 id={titleId} className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            Ekibini ve Zorluğu Seç
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
            Ay&apos;a inmeden önce kaç astronotla çalışacağını ve başlangıç bütçeni belirle.
          </p>
        </div>

        {/* 1. Mürettebat Sayısı Seçimi */}
        <div className="rounded-xl border border-white/25 bg-[#050C1D]/85 p-3.5 sm:p-4 flex flex-col gap-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
              Mürettebat Sayısı (1–4 Astronot)
            </span>
            <span className="text-xs text-slate-300">
              Günlük tüketim:{' '}
              <strong className="text-amber-200">
                Oksijen {dailyDrain.oxygen}, Gıda {dailyDrain.food}
              </strong>
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {CREW_OPTIONS.map((count) => {
              const selected = crewCount === count
              return (
                <button
                  key={count}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setCrewCount(count)}
                  className={`py-2.5 px-2 rounded-xl border text-center cursor-pointer transition-all ${
                    selected
                      ? 'border-cyan-300 bg-cyan-400/20 text-white shadow-[0_0_16px_rgba(56,189,248,0.3)]'
                      : 'border-white/20 bg-white/5 text-slate-300 hover:border-white/50'
                  }`}
                >
                  <div className="text-sm sm:text-base font-bold">👷 × {count}</div>
                  <div className="text-[11px] text-slate-300 mt-0.5">
                    {count === 1 ? 'Az tüketim' : count === 4 ? 'Hızlı inşaat' : `${count} iş gücü`}
                  </div>
                </button>
              )
            })}
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {crewCount === 1
              ? '1 astronot çok az oksijen ve gıda tüketir ama tek seferde yalnızca 1 inşaatı yavaşça ilerletebilir.'
              : `${crewCount} astronot daha fazla oksijen ve gıda tüketir; ancak birden fazla istasyonu aynı anda veya tek işi ${crewCount} kat hızda inşa edebilir!`}
          </p>
        </div>

        {/* 2. Zorluk / Başlangıç Bütçesi Seçimi */}
        <div className="rounded-xl border border-white/25 bg-[#050C1D]/85 p-3.5 sm:p-4 flex flex-col gap-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
            Görev Zorluğu &amp; Başlangıç Bütçesi
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {DIFFICULTIES.map((lvl) => {
              const cfg = DIFFICULTY_CONFIG[lvl]
              const selected = difficulty === lvl
              return (
                <button
                  key={lvl}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setDifficulty(lvl)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    selected
                      ? 'border-amber-300 bg-amber-400/20 text-white shadow-[0_0_16px_rgba(251,191,36,0.28)]'
                      : 'border-white/20 bg-white/5 text-slate-300 hover:border-white/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-sm">{cfg.label}</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-cyan-400/20 border border-cyan-300/40 text-cyan-200">
                      {cfg.startingBudget} puan
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 leading-snug">{cfg.summary}</p>
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <span className="text-xs text-slate-400">
            Seçimin: 👷 {crewCount} Astronot · {DIFFICULTY_CONFIG[difficulty].label} (
            {DIFFICULTY_CONFIG[difficulty].startingBudget} puan)
          </span>
          <button
            type="button"
            autoFocus
            onClick={handleConfirm}
            className="px-7 min-h-11 rounded-xl text-sm sm:text-base font-bold bg-gradient-to-r from-sky-400 to-cyan-300 text-slate-950 shadow-[0_0_24px_rgba(56,189,248,0.4)] hover:brightness-110 cursor-pointer transition-all"
          >
            Hikâyeye Geç →
          </button>
        </div>
      </div>
    </dialog>
  )
}
