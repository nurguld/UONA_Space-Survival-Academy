import { useEffect, useId, useRef, useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { getDifficultyInfo, getEffectiveBaseDrain } from '../game/engine'
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
  const { lang, pick } = useLanguage()
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
            {pick('Mission Planning · 30-Day Lunar Mission', 'Görev Planlama · 30 Günlük Ay Görevi')}
          </span>
          <h2 id={titleId} className="text-xl sm:text-2xl font-extrabold tracking-tight text-white mt-0.5 leading-snug">
            {pick('Select Commander, Crew, and Difficulty', 'Komutanını, Ekibini ve Zorluğu Seç')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300/90 mt-1 leading-relaxed">
            {pick(
              'Before landing on the Moon, enter your commander name, choose your crew size, and pick your starting budget.',
              "Ay'a inmeden önce komutan adını gir, kaç astronotla çalışacağını ve başlangıç bütçeni belirle.",
            )}
          </p>
        </div>

        {/* 1. Komutan Adı (Zorunlu — Brifing'de girildiyse hazır gelir) */}
        <div className="rounded-xl border border-slate-300/20 bg-[#081020]/90 p-3.5 sm:p-4 flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label
              htmlFor={nameInputId}
              className="text-[11px] font-bold uppercase tracking-[0.12em] text-sky-400"
            >
              {pick('Commander Name', 'Komutan Adı')}
            </label>
            <span
              className={`text-[11px] font-semibold ${
                canStart ? 'text-emerald-300' : 'text-sky-300'
              }`}
            >
              {canStart
                ? pick('✓ Ready for certificate', '✓ Sertifika için hazır')
                : pick('Required to launch', 'Başlamak için zorunlu')}
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
            placeholder={pick('e.g. Alex Mercer', 'Örn. Ahmet Demir')}
            className="w-full min-h-10 px-3.5 rounded-xl text-sm bg-[#0E172A] border border-slate-300/30 text-white placeholder:text-slate-500 focus-visible:outline-2 focus-visible:outline-cyan-300"
          />
        </div>

        {/* 2. Mürettebat Sayısı Seçimi */}
        <div className="rounded-xl border border-slate-300/20 bg-[#081020]/90 p-3.5 sm:p-4 flex flex-col gap-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-sky-400">
              {pick('Crew Size (1–4 Astronauts)', 'Mürettebat Sayısı (1–4 Astronot)')}
            </span>
            <span className="text-xs text-slate-300">
              {pick('Daily drain:', 'Günlük tüketim:')}{' '}
              <strong className="text-sky-200">
                {pick(
                  `Oxygen ${dailyDrain.oxygen}, Food ${dailyDrain.food}`,
                  `Oksijen ${dailyDrain.oxygen}, Gıda ${dailyDrain.food}`,
                )}
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
                    {count === 1
                      ? pick('Low drain', 'Az tüketim')
                      : count === 4
                        ? pick('Fast build', 'Hızlı inşaat')
                        : pick(`${count}× workforce`, `${count} iş gücü`)}
                  </div>
                </button>
              )
            })}
          </div>

          <p className="text-xs text-slate-300/90 leading-relaxed">
            {crewCount === 1
              ? pick(
                  '1 astronaut uses very little oxygen and food, but can only advance 1 build slowly at a time.',
                  '1 astronot çok az oksijen ve gıda tüketir ama tek seferde yalnızca 1 inşaatı yavaşça ilerletebilir.',
                )
              : pick(
                  `${crewCount} astronauts consume more oxygen and food, yet can build multiple stations simultaneously or finish a single upgrade ${crewCount}× faster!`,
                  `${crewCount} astronot daha fazla oksijen ve gıda tüketir; ancak birden fazla istasyonu aynı anda veya tek işi ${crewCount} kat hızda inşa edebilir!`,
                )}
          </p>
        </div>

        {/* 3. Zorluk / Başlangıç Bütçesi Seçimi */}
        <div className="rounded-xl border border-slate-300/20 bg-[#081020]/90 p-3.5 sm:p-4 flex flex-col gap-2.5">
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-sky-400">
            {pick('Mission Difficulty & Starting Budget', 'Görev Zorluğu & Başlangıç Bütçesi')}
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {DIFFICULTIES.map((lvl) => {
              const cfg = getDifficultyInfo(lvl, lang)
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
                      {cfg.startingBudget} {pick('pts', 'puan')}
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
              ? `${pick('Commander', 'Komutan')}: ${trimmedCommander} · 👷 ${crewCount} · ${getDifficultyInfo(difficulty, lang).label} (${getDifficultyInfo(difficulty, lang).startingBudget}${pick('p', 'p')})`
              : pick('Enter your commander name above to continue.', 'Devam etmek için yukarıya komutan adını yaz.')}
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
            {pick('Continue to Story →', 'Hikâyeye Geç →')}
          </button>
        </div>
      </div>
    </dialog>
  )
}
