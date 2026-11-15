import { useEffect, useId, useRef, useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { playBookPage, playClick } from '../game/sound'
import {
  formatUpgradeLabel,
  getResourceLabel,
  localizeEventLog,
} from '../i18n/gameTranslations'
import type { DayLog, ResourceId } from '../types'

interface LogbookModalProps {
  isOpen: boolean
  history: DayLog[]
  onClose: () => void
}

const RESOURCE_IDS: ResourceId[] = ['energy', 'oxygen', 'food', 'radiation', 'health']

function DeskAstronaut({ isNight }: { isNight: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 110 64" className="w-16 sm:w-20 h-10 sm:h-12 shrink-0">
      <circle cx="20" cy="20" r="13" fill="#0F172A" stroke="#64748B" strokeWidth="1.5" />
      <polygon points="30,26 36,30 28,31" fill="#0F172A" />
      {isNight ? (
        <path d="M23 14a7 7 0 1 0 0 12 5.5 5.5 0 0 1 0-12Z" fill="#BAE6FD" />
      ) : (
        <g>
          <circle cx="20" cy="20" r="5" fill="#FBBF24" />
          <line x1="20" y1="11" x2="20" y2="13" stroke="#FDE047" strokeWidth="1.5" />
          <line x1="20" y1="27" x2="20" y2="29" stroke="#FDE047" strokeWidth="1.5" />
          <line x1="11" y1="20" x2="13" y2="20" stroke="#FDE047" strokeWidth="1.5" />
          <line x1="27" y1="20" x2="29" y2="20" stroke="#FDE047" strokeWidth="1.5" />
        </g>
      )}
      <rect x="76" y="28" width="8" height="20" rx="3" fill="#B45309" stroke="#0F172A" strokeWidth="1.5" />
      <rect x="52" y="34" width="22" height="16" rx="5" fill="#E2E8F0" stroke="#0F172A" strokeWidth="2" />
      <circle cx="64" cy="22" r="13" fill="#F8FAFC" stroke="#0F172A" strokeWidth="2" />
      <rect x="53" y="15" width="17" height="12" rx="5" fill="#1E293B" />
      <path d="M56 18 L60 18" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" />
      <polygon points="28,46 80,46 92,58 40,58" fill="#B45309" stroke="#0F172A" strokeWidth="2" />
      <polygon points="48,48 68,48 73,54 53,54" fill="#F8FAFC" stroke="#0F172A" strokeWidth="1.5" />
      <line x1="48" y1="40" x2="55" y2="49" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function LogbookDrawerContent({
  history,
  onClose,
}: {
  history: DayLog[]
  onClose: () => void
}) {
  const { lang, pick } = useLanguage()
  const panelRef = useRef<HTMLElement>(null)
  const titleId = useId()
  const [pageIndex, setPageIndex] = useState(() => Math.max(0, history.length - 1))

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      }
    }
    const onPointerDown = (e: globalThis.PointerEvent) => {
      const target = e.target as HTMLElement | null
      if (!target) return
      if (panelRef.current?.contains(target)) return
      if (target.closest('[data-logbook-toggle="true"]')) return
      onClose()
    }

    window.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [onClose])

  const safeIndex = Math.min(pageIndex, Math.max(0, history.length - 1))
  const entry = history[safeIndex]
  const formatSigned = (val: number) => (val > 0 ? `+${val}` : `${val}`)
  const localizedEvent = entry?.event ? localizeEventLog(entry.event, lang) : undefined
  const upgradeLabels = entry
    ? entry.upgradeItems && entry.upgradeItems.length > 0
      ? entry.upgradeItems.map((u) => formatUpgradeLabel(u, lang))
      : entry.upgrades
    : []

  return (
    <section
      ref={panelRef}
      role="dialog"
      aria-labelledby={titleId}
      className="logbook-drawer-up fixed bottom-[4.75rem] right-3 sm:right-4 z-[955] w-[min(94vw,25rem)] max-h-[min(74dvh,36rem)] flex flex-col rounded-2xl border border-slate-300/40 bg-[#1B273E]/96 backdrop-blur-xl text-slate-100 shadow-[0_16px_44px_rgba(6,12,28,0.68),0_0_24px_rgba(56,189,248,0.14)]"
    >
      {/* Defter İkonunu İşaret Eden Aşağı Bağlantı Oku */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-[7px] right-[12.2rem] sm:right-[13rem] w-3.5 h-3.5 rotate-45 bg-[#182338] border-r border-b border-slate-300/40"
      />

      {/* Üst Başlık + Masada Astronot + Kapat */}
      <div className="flex items-center justify-between gap-2 px-4 pt-3.5 pb-2.5 rounded-t-2xl bg-gradient-to-b from-[#132038] to-[#142036] shrink-0">
        <div className="min-w-0">
          <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-sky-400">
            {pick('Commander Flight Log', 'Komutan Seyir Defteri')}
          </span>
          <h2 id={titleId} className="text-lg sm:text-xl font-bold tracking-tight text-white leading-tight">
            {pick('Mission Logbook', 'Görev Günlüğü')}
          </h2>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <DeskAstronaut isNight={entry?.isNight ?? false} />
          <button
            type="button"
            onClick={() => {
              playClick()
              onClose()
            }}
            aria-label={pick('Close Logbook', 'Günlüğü Kapat')}
            className="inline-flex items-center gap-1.5 px-2.5 h-8 rounded-full text-xs font-medium text-slate-200 hover:bg-white/10 hover:text-white cursor-pointer transition-colors"
          >
            <span>{pick('Close', 'Kapat')}</span>
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-slate-300/45 text-xs leading-none">
              ×
            </span>
          </button>
        </div>
      </div>

      {/* Gün Sekmeleri (Defter Klasör Kulakçıkları) */}
      {history.length > 0 && (
        <div className="flex items-end justify-between gap-2 px-4 pt-1.5 bg-[#111A2E] border-b border-slate-300/35 shrink-0">
          <div className="flex flex-wrap items-end gap-1.5 max-h-16 overflow-y-auto overscroll-contain pt-0.5">
            {history.map((item, idx) => {
              const active = idx === safeIndex
              const hasUpgrade = item.upgrades.length > 0
              const hasEvent = Boolean(item.event)
              return (
                <button
                  key={item.day}
                  type="button"
                  onClick={() => {
                    if (idx !== safeIndex) {
                      playBookPage()
                    } else {
                      playClick()
                    }
                    setPageIndex(idx)
                  }}
                  className={`relative text-xs font-bold px-3 py-1.5 rounded-t-lg border-t border-x cursor-pointer transition-colors ${
                    active
                      ? 'bg-[#1B273E] text-white border-slate-300/45 -mb-px pb-[7px]'
                      : 'bg-[#101829]/80 text-slate-300 border-slate-400/25 mb-1 rounded-b-lg border-b hover:text-white hover:border-slate-300/45'
                  }`}
                >
                  {pick(`D${item.day}`, `G${item.day}`)}
                  {(hasUpgrade || hasEvent) && (
                    <span className="inline-flex gap-1 ml-1.5 align-middle">
                      {hasUpgrade && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />}
                      {hasEvent && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          <svg aria-hidden="true" viewBox="0 0 24 28" className="w-4 h-5 mb-1.5 shrink-0 opacity-85">
            <rect x="3" y="4" width="18" height="21" rx="2" fill="#CBD5E1" stroke="#0F172A" strokeWidth="1.5" />
            <line x1="7" y1="10" x2="17" y2="10" stroke="#334155" strokeWidth="1.5" />
            <line x1="7" y1="14" x2="17" y2="14" stroke="#334155" strokeWidth="1.5" />
            <line x1="7" y1="18" x2="14" y2="18" stroke="#334155" strokeWidth="1.5" />
            <line x1="7" y1="2" x2="7" y2="6" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
            <line x1="12" y1="2" x2="12" y2="6" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
            <line x1="17" y1="2" x2="17" y2="6" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      )}

      {/* Kaydırılabilir Çizgili Defter Sayfası */}
      <div
        style={{
          backgroundImage:
            'repeating-linear-gradient(to bottom, transparent 0, transparent 27px, rgba(148, 163, 184, 0.08) 28px)',
        }}
        className="flex-1 overflow-y-auto overscroll-contain px-4 py-3.5 flex flex-col gap-3.5 bg-[#1B273E]"
      >
        {entry && (
          <>
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-300/20">
              <h3 className="text-lg sm:text-xl font-bold text-[#F5D06F]">
                {pick(`Day ${entry.day} Entry`, `Gün ${entry.day} Sayfası`)}
              </h3>
              <span
                className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-full border ${
                  entry.isNight
                    ? 'border-sky-300/40 bg-[#13223A] text-sky-200'
                    : 'border-[#D9A441]/55 bg-[#2B241A]/90 text-[#F5D06F]'
                }`}
              >
                <span aria-hidden="true">{entry.isNight ? '🌙' : '☀️'}</span>
                {entry.isNight
                  ? pick('Lunar Night', 'Ay Gecesi')
                  : pick('Lunar Day', 'Ay Gündüzü')}
              </span>
            </div>

            {/* 1. Geliştirmeler */}
            <div>
              <h4 className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-sky-400 mb-1">
                <span>{pick('Upgrades Completed', 'Yapılan Geliştirmeler')}</span>
                <svg aria-hidden="true" viewBox="0 0 16 16" className="w-3.5 h-3.5">
                  <path
                    d="M11.5 2.5a3 3 0 0 0-3.8 3.8L2.8 11.2a1.2 1.2 0 0 0 1.7 1.7l4.9-4.9a3 3 0 0 0 3.8-3.8l-1.8 1.8-1.7-1.7 1.8-1.8Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                </svg>
              </h4>
              {upgradeLabels.length > 0 ? (
                <ul className="flex flex-wrap gap-1.5">
                  {upgradeLabels.map((up, i) => (
                    <li
                      key={`${up}-${i}`}
                      className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#21453F] border border-emerald-400/40 text-emerald-100"
                    >
                      ↑ {up}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-200/90">
                  {pick('No modules were upgraded today.', 'Bu gün modül geliştirmesi yapılmadı.')}
                </p>
              )}
            </div>

            {/* 2. Yaşanan Olay ve Kararın */}
            <div>
              <h4 className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#F0A35E] mb-1.5">
                <span>{pick('Event & Decision', 'Yaşanan Olay ve Kararın')}</span>
                <svg aria-hidden="true" viewBox="0 0 16 16" className="w-3.5 h-3.5">
                  <path
                    d="M8 2L1.8 13.2h12.4L8 2Zm0 4.2v3.5m0 1.8v.4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </h4>
              {localizedEvent ? (
                <div className="rounded-xl bg-[#10182B]/92 border border-slate-300/30 p-3.5 flex flex-col gap-1.5 shadow-inner">
                  <p className="text-sm font-bold text-white leading-snug">{localizedEvent.title}</p>
                  <p className="text-xs text-slate-200 leading-snug">
                    <span className="text-sky-300 font-semibold">
                      {pick('Decision: ', 'Tercih: ')}
                    </span>
                    {localizedEvent.chosenLabel}
                  </p>
                  <p className="text-[11px] text-slate-300/90 leading-relaxed">
                    {localizedEvent.explanation}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(Object.entries(localizedEvent.effects) as [ResourceId, number][]).map(
                      ([resId, val]) => (
                        <span
                          key={resId}
                          className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md border ${
                            val >= 0
                              ? 'border-emerald-400/35 text-emerald-100 bg-[#274F46]'
                              : 'border-orange-400/40 text-orange-100 bg-[#4A2825]'
                          }`}
                        >
                          {getResourceLabel(resId, lang)} {formatSigned(val)}
                        </span>
                      ),
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-200/90">
                  {pick('No unusual events occurred today.', 'Bu gün olağan dışı bir olay yaşanmadı.')}
                </p>
              )}
            </div>

            {/* 3. Gün Sonu Net Değişim */}
            <div>
              <h4 className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-300/85 mb-1">
                <span>{pick('Net Daily Change', 'Gün Sonu Net Değişim')}</span>
                <svg aria-hidden="true" viewBox="0 0 16 16" className="w-3.5 h-3.5">
                  <path
                    d="M2 12.5h12M3.5 9.5l3-3 2.5 2 3.5-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </h4>
              {entry.dailyDelta ? (
                <div className="flex flex-wrap gap-1.5">
                  {RESOURCE_IDS.map((id) => {
                    const val = entry.dailyDelta![id]
                    return (
                      <span
                        key={id}
                        className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md border ${
                          val >= 0
                            ? 'border-emerald-400/35 text-emerald-100 bg-[#274F46]'
                            : 'border-orange-400/40 text-orange-100 bg-[#4A2825]'
                        }`}
                      >
                        {getResourceLabel(id, lang)} {formatSigned(val)}
                      </span>
                    )
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-200/90">
                  {pick('Day is still in progress.', 'Gün henüz tamamlanmadı.')}
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Alt Sayfa Çevirme Çubuğu */}
      <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-t border-slate-300/20 bg-[#182338] rounded-b-2xl shrink-0">
        <button
          type="button"
          disabled={safeIndex <= 0}
          onClick={() => {
            playBookPage()
            setPageIndex((i) => Math.max(0, i - 1))
          }}
          className="px-3.5 h-8 rounded-xl text-xs font-semibold border border-slate-300/45 bg-[#121B2E]/90 text-slate-100 hover:bg-[#223252] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          {pick('← Previous Day', '← Önceki Gün')}
        </button>

        <span className="text-xs font-medium text-slate-300">
          {pick(`Page ${safeIndex + 1} / ${history.length}`, `Sayfa ${safeIndex + 1} / ${history.length}`)}
        </span>

        <button
          type="button"
          disabled={safeIndex >= history.length - 1}
          onClick={() => {
            playBookPage()
            setPageIndex((i) => Math.min(history.length - 1, i + 1))
          }}
          className="px-3.5 h-8 rounded-xl text-xs font-semibold border border-slate-300/45 bg-[#121B2E]/90 text-slate-100 hover:bg-[#223252] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          {pick('Next Day →', 'Sonraki Gün →')}
        </button>
      </div>
    </section>
  )
}

export default function LogbookModal({ isOpen, history, onClose }: LogbookModalProps) {
  if (!isOpen) return null
  return <LogbookDrawerContent key={history.length} history={history} onClose={onClose} />
}
