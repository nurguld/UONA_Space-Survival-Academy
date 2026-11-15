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
  const nameInputRef = useRef<HTMLInputElement>(null)
  const titleId = useId()
  const nameInputId = useId()
  const closingFromPropRef = useRef(false)

  const [commanderName, setCommanderName] = useState<string>(
    () => localStorage.getItem('jsa_commander') ?? '',
  )
  const [crewCount, setCrewCount] = useState<number>(initialCrewCount)
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(initialDifficulty)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen && !dialog.open) {
      const savedName = localStorage.getItem('jsa_commander') ?? ''
      setCommanderName(savedName)
      setCrewCount(initialCrewCount)
      setDifficulty(initialDifficulty)
      dialog.showModal()
      if (!savedName.trim()) {
        requestAnimationFrame(() => nameInputRef.current?.focus())
      }
    } else if (!isOpen && dialog.open) {
      closingFromPropRef.current = true
      dialog.close()
    }
  }, [isOpen, initialCrewCount, initialDifficulty])

  const trimmedCommander = commanderName.trim()
  const canStart = trimmedCommander.length > 0
  const dailyDrain = getEffectiveBaseDrain(crewCount)

  const handleConfirm = () => {
    if (!trimmedCommander) {
      nameInputRef.current?.focus()
      return
    }
    localStorage.setItem('jsa_commander', trimmedCommander)
    onConfirm({ crewCount, difficulty })
  }

  const handleDialogClose = () => {
    if (closingFromPropRef.current) {
      closingFromPropRef.current = false
      return
    }
    if (trimmedCommander) {
      handleConfirm()
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(e) => {
        if (!canStart) {
          e.preventDefault()
          nameInputRef.current?.focus()
        }
      }}
      onClose={handleDialogClose}
      {...({ closedby: canStart ? 'any' : 'none' } as Record<string, string>)}
      className="m-auto w-[min(94vw,42rem)] max-h-[92dvh] overflow-y-auto overscroll-contain rounded-2xl border border-slate-300/35 bg-gradient-to-b from-[#172133]/96 via-[#192336]/97 to-[#121A29]/98 backdrop-blur-xl text-slate-100 shadow-[0_20px_54px_rgba(4,9,20,0.72),0_0_24px_rgba(56,189,248,0.1)] p-5 sm:p-6"
    >
      <div className="flex flex-col gap-3.5">
        <div className="border-b border-slate-300/20 pb-3.5">
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-sky-400">
            Görev Planlama · 30 Günlük Ay Görevi
          </span>
          <h2 id={titleId} className="text-xl sm:text-2xl font-extrabold tracking-tight text-white mt-0.5 leading-snug">
            Komutanını, Ekibini ve Zorluğu Seç
          </h2>
          <p className="text-xs sm:text-sm text-slate-300/90 mt-1 leading-relaxed">
            Ay&apos;a inmeden önce komutan adını gir, kaç astronotla çalışacağını ve başlangıç bütçeni belirle.
          </p>
        </div>

        {/* 1. Komutan Adı (Zorunlu — Brifing'de girildiyse hazır gelir) */}
        <div className="rounded-xl border border-slate-300/20 bg-[#081020]/90 p-3.5 sm:p-4 flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label
              htmlFor={nameInputId}
              className="text-[11px] font-bold uppercase tracking-[0.12em] text-sky-400"
            >
              Komutan Adı
            </label>
            <span
              className={`text-[11px] font-semibold ${
                canStart ? 'text-emerald-300' : 'text-sky-300'
              }`}
            >
              {canStart ? '✓ Sertifika için hazır' : 'Başlamak için zorunlu'}
            </span>
          </div>

          <input
            ref={nameInputRef}
            id={nameInputId}
            type="text"
            autoComplete="name"
            maxLength={40}
            value={commanderName}
            onChange={(e) => setCommanderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && canStart) {
                e.preventDefault()
                handleConfirm()
              }
            }}
            placeholder="Örn. Ahmet Demir"
            className="w-full min-h-10 px-3.5 rounded-xl text-sm bg-[#0E172A] border border-slate-300/30 text-white placeholder:text-slate-500 focus-visible:outline-2 focus-visible:outline-cyan-300"
          />
        </div>

        {/* 2. Mürettebat Sayısı Seçimi */}
        <div className="rounded-xl border border-slate-300/20 bg-[#081020]/90 p-3.5 sm:p-4 flex flex-col gap-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-sky-400">
              Mürettebat Sayısı (1–4 Astronot)
            </span>
            <span className="text-xs text-slate-300">
              Günlük tüketim:{' '}
              <strong className="text-sky-200">
                Oksijen {dailyDrain.oxygen}, Gıda {dailyDrain.food}
              </strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                      ? 'border-cyan-300/75 bg-[#12253E] text-white shadow-[0_0_16px_rgba(56,189,248,0.24)]'
                      : 'border-slate-300/20 bg-[#101829]/80 text-slate-300 hover:border-slate-300/50'
                  }`}
                >
                  <div className="text-sm sm:text-base font-bold">👷 × {count}</div>
                  <div className="text-[11px] text-slate-300/90 mt-0.5">
                    {count === 1 ? 'Az tüketim' : count === 4 ? 'Hızlı inşaat' : `${count} iş gücü`}
                  </div>
                </button>
              )
            })}
          </div>

          <p className="text-xs text-slate-300/90 leading-relaxed">
            {crewCount === 1
              ? '1 astronot çok az oksijen ve gıda tüketir ama tek seferde yalnızca 1 inşaatı yavaşça ilerletebilir.'
              : `${crewCount} astronot daha fazla oksijen ve gıda tüketir; ancak birden fazla istasyonu aynı anda veya tek işi ${crewCount} kat hızda inşa edebilir!`}
          </p>
        </div>

        {/* 3. Zorluk / Başlangıç Bütçesi Seçimi */}
        <div className="rounded-xl border border-slate-300/20 bg-[#081020]/90 p-3.5 sm:p-4 flex flex-col gap-2.5">
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-sky-400">
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
                      ? 'border-cyan-300/75 bg-[#12253E] text-white shadow-[0_0_16px_rgba(56,189,248,0.22)]'
                      : 'border-slate-300/20 bg-[#101829]/80 text-slate-300 hover:border-slate-300/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-sm">{cfg.label}</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#0A1224] border border-cyan-300/40 text-cyan-200">
                      {cfg.startingBudget} puan
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300/90 mt-1 leading-snug">{cfg.summary}</p>
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <span className="text-xs text-slate-400">
            {canStart
              ? `Komutan: ${trimmedCommander} · 👷 ${crewCount} · ${DIFFICULTY_CONFIG[difficulty].label} (${DIFFICULTY_CONFIG[difficulty].startingBudget}p)`
              : 'Devam etmek için yukarıya komutan adını yaz.'}
          </span>
          <button
            type="button"
            disabled={!canStart}
            autoFocus={canStart}
            onClick={handleConfirm}
            className={`px-7 min-h-11 rounded-xl text-sm sm:text-base font-bold transition-all ${
              canStart
                ? 'bg-gradient-to-r from-[#0EA5D9] to-[#22C9EB] text-white shadow-[0_6px_22px_rgba(34,201,235,0.3)] hover:brightness-110 cursor-pointer'
                : 'border border-slate-500/30 bg-[#1A2436]/85 text-slate-400 cursor-not-allowed'
            }`}
          >
            Hikâyeye Geç →
          </button>
        </div>
      </div>
    </dialog>
  )
}
