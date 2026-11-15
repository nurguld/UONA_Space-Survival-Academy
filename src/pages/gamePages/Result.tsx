import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import html2canvas from 'html2canvas'
import Navbar from '../../components/Navbar'
import { RESOURCE_CONFIG, RESOURCE_ORDER } from '../../components/ResourceIcon'
import { useGame } from '../../context/GameContext'
import { analyzeLossReason } from '../../game/engine'
import type { GameState, ResourceId } from '../../types'

const CERT_COLORS: Record<ResourceId, string> = {
  energy: '#FCD34D',
  oxygen: '#7DD3FC',
  food: '#34D399',
  radiation: '#FB923C',
  health: '#C4B5FD',
}

function CertIcon({ id, className = 'w-4 h-4 shrink-0' }: { id: ResourceId; className?: string }) {
  const color = CERT_COLORS[id]
  switch (id) {
    case 'energy':
      return (
        <svg aria-hidden="true" viewBox="0 0 16 16" className={className} style={{ color }}>
          <path d="M9 1L3 9h4l-1 6 7-8H9l0-6z" fill="currentColor" />
        </svg>
      )
    case 'oxygen':
      return (
        <svg aria-hidden="true" viewBox="0 0 16 16" className={className} style={{ color }}>
          <path
            d="M8 1.5C8 1.5 3.5 6.8 3.5 10a4.5 4.5 0 0 0 9 0C12.5 6.8 8 1.5 8 1.5Z"
            fill="currentColor"
            fillOpacity="0.25"
            stroke="currentColor"
            strokeWidth="1.6"
          />
        </svg>
      )
    case 'food':
      return (
        <svg aria-hidden="true" viewBox="0 0 16 16" className={className} style={{ color }}>
          <path
            d="M13 3C7 3 3.5 6.5 3.5 12.5c6 0 9.5-3.5 9.5-9.5Z"
            fill="currentColor"
            fillOpacity="0.88"
          />
        </svg>
      )
    case 'radiation':
      return (
        <svg aria-hidden="true" viewBox="0 0 16 16" className={className} style={{ color }}>
          <path
            d="M8 1.5L2.5 4v4.2c0 3.3 2.3 5.5 5.5 6.3 3.2-.8 5.5-3 5.5-6.3V4L8 1.5Z"
            fill="currentColor"
            fillOpacity="0.2"
            stroke="currentColor"
            strokeWidth="1.6"
          />
        </svg>
      )
    case 'health':
      return (
        <svg aria-hidden="true" viewBox="0 0 16 16" className={className} style={{ color }}>
          <path
            d="M8 13.5S2.5 9.8 2.5 5.8A3 3 0 0 1 8 4a3 3 0 0 1 5.5 1.8c0 4-5.5 7.7-5.5 7.7Z"
            fill="currentColor"
          />
        </svg>
      )
  }
}

function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): number {
  const words = text.split(' ')
  let line = ''
  let currentY = y
  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, currentY)
      line = word
      currentY += lineHeight
    } else {
      line = testLine
    }
  }
  if (line) {
    ctx.fillText(line, x, currentY)
    currentY += lineHeight
  }
  return currentY
}

function renderFallbackCertificatePng(
  commanderName: string,
  state: GameState,
  maxDays: number,
  lossLesson: string | null,
  totalUpgrades: number,
  totalEvents: number,
): string {
  const isWon = state.status === 'won'
  const canvas = document.createElement('canvas')
  canvas.width = 1200
  canvas.height = isWon ? 640 : 740
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas oluşturulamadı')

  ctx.fillStyle = '#040814'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#081228'
  ctx.strokeStyle = isWon ? '#FCD34D' : '#FB923C'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.roundRect(36, 36, canvas.width - 72, canvas.height - 72, 24)
  ctx.fill()
  ctx.stroke()

  ctx.fillStyle = isWon ? '#FCD34D' : '#FDBA74'
  ctx.font = 'bold 18px sans-serif'
  ctx.fillText(
    isWon
      ? 'JUNIOR SPACE ACADEMY · BAŞARI SERTİFİKASI'
      : 'JUNIOR SPACE ACADEMY · GÖREV SONU RAPORU',
    80,
    98,
  )

  ctx.fillStyle = '#FFFFFF'
  ctx.font = 'bold 42px sans-serif'
  ctx.fillText(
    isWon ? `Komutan ${commanderName}` : `Görev ${state.day}. Günde Sona Erdi`,
    80,
    154,
  )

  ctx.fillStyle = '#CBD5E1'
  ctx.font = '20px sans-serif'
  let cursorY = drawWrappedText(
    ctx,
    isWon
      ? `Ay Güney Kutbu üssünü ${maxDays} gün boyunca kesintisiz yöneterek görevi başarıyla tamamladı.`
      : `Komutan: ${commanderName} · Her başarısız deneme, bir sonraki görev için veri sağlar.`,
    80,
    198,
    1040,
    30,
  )

  if (!isWon && lossLesson) {
    cursorY += 16
    ctx.fillStyle = 'rgba(120, 53, 15, 0.35)'
    ctx.strokeStyle = '#FCD34D'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.roundRect(80, cursorY, 1040, 120, 16)
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = '#FCD34D'
    ctx.font = 'bold 16px sans-serif'
    ctx.fillText('NEDEN OLDU & NASIL ÖNLENİRDİ?', 104, cursorY + 34)

    ctx.fillStyle = '#F1F5F9'
    ctx.font = '18px sans-serif'
    drawWrappedText(ctx, lossLesson, 104, cursorY + 66, 990, 26)
    cursorY += 148
  } else {
    cursorY += 36
  }

  ctx.fillStyle = '#94A3B8'
  ctx.font = 'bold 16px sans-serif'
  ctx.fillText('GÖREV SONU KAYNAK DURUMU', 80, cursorY)
  cursorY += 20

  const boxWidth = 192
  const gap = 20
  RESOURCE_ORDER.forEach((id, idx) => {
    const x = 80 + idx * (boxWidth + gap)
    ctx.fillStyle = '#050C1D'
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.roundRect(x, cursorY, boxWidth, 92, 14)
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = '#E2E8F0'
    ctx.font = '600 16px sans-serif'
    ctx.fillText(RESOURCE_CONFIG[id].shortLabel, x + 18, cursorY + 34)

    ctx.fillStyle = CERT_COLORS[id]
    ctx.font = 'bold 30px sans-serif'
    ctx.fillText(String(state.resources[id]), x + 18, cursorY + 72)
  })

  const footerY = canvas.height - 84
  ctx.fillStyle = '#CBD5E1'
  ctx.font = '18px sans-serif'
  ctx.fillText(
    `Gün: ${state.day} / ${maxDays}  ·  Modül Geliştirme: ${totalUpgrades}  ·  Yönetilen Olay: ${totalEvents}`,
    80,
    footerY,
  )

  ctx.fillStyle = '#94A3B8'
  ctx.textAlign = 'right'
  ctx.fillText('NASA Space Apps Challenge · Ay Üssü Simülasyonu', canvas.width - 80, footerY)

  return canvas.toDataURL('image/png')
}

export default function Result() {
  const navigate = useNavigate()
  const { state, rules, startGame } = useGame()
  const certificateRef = useRef<HTMLDivElement>(null)
  const [downloading, setDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)

  const commanderName = localStorage.getItem('jsa_commander')?.trim() || 'Komutan Adayı'
  const isWon = state.status === 'won'
  const isLost = state.status === 'lost'
  const lossLesson = isLost ? analyzeLossReason(state) : null

  const totalUpgrades = state.history.reduce((sum, entry) => sum + entry.upgrades.length, 0)
  const totalEvents = state.history.filter((entry) => entry.event !== undefined).length

  const criticalDays = isLost
    ? state.history
        .filter(
          (entry) =>
            entry.event !== undefined ||
            (state.lossReason !== null &&
              entry.dailyDelta !== undefined &&
              entry.dailyDelta[state.lossReason] < 0),
        )
        .slice(-3)
    : []

  const handleReplay = () => {
    startGame()
    navigate('/oyun')
  }

  const triggerDownload = (dataUrl: string) => {
    const link = document.createElement('a')
    const safeName = commanderName.toLowerCase().replace(/[^a-z0-9çğıöşü]+/gi, '-')
    link.download = `junior-space-academy-sertifika-${safeName || 'komutan'}.png`
    link.href = dataUrl
    link.click()
  }

  const handleDownloadCertificate = async () => {
    if (!certificateRef.current || downloading) return
    setDownloading(true)
    setDownloadError(null)
    try {
      const canvas = await html2canvas(certificateRef.current, {
        backgroundColor: '#081228',
        scale: 2,
        useCORS: true,
        onclone: (clonedDoc) => {
          clonedDoc.documentElement.style.backgroundColor = '#040814'
          clonedDoc.documentElement.style.color = '#F8FAFC'
          clonedDoc.body.style.backgroundColor = '#040814'
          clonedDoc.body.style.color = '#F8FAFC'
        },
      })
      triggerDownload(canvas.toDataURL('image/png'))
    } catch {
      try {
        const fallbackUrl = renderFallbackCertificatePng(
          commanderName,
          state,
          rules.maxDays,
          lossLesson,
          totalUpgrades,
          totalEvents,
        )
        triggerDownload(fallbackUrl)
      } catch {
        setDownloadError('Sertifika görseli oluşturulurken bir sorun oluştu.')
      }
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="min-h-dvh bg-[#040814] text-white pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <Navbar />

        {state.status === 'playing' ? (
          <section className="mt-8 rounded-2xl border-2 border-white/40 bg-[#081228]/90 p-6 sm:p-8 text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-sky-400">
              Görev Devam Ediyor
            </span>
            <h1 className="text-2xl sm:text-4xl font-bold mt-2">
              Henüz {state.day}. Gündesin, {commanderName}
            </h1>
            <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-xl mx-auto">
              Komutan sertifikanı veya görev sonu analizini görmek için 30 günlük görevi tamamla.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                to="/oyun"
                className="px-6 min-h-11 rounded-xl text-sm font-bold inline-flex items-center bg-gradient-to-r from-sky-400 to-cyan-300 text-slate-950"
              >
                Göreve Devam Et →
              </Link>
            </div>
          </section>
        ) : (
          <div className="mt-8 flex flex-col gap-6">
            {/* PNG Olarak İndirilebilir Sertifika / Rapor Kartı (html2canvas uyumlu saf hex renkler) */}
            <div
              ref={certificateRef}
              className="rounded-2xl p-6 sm:p-8"
              style={{
                backgroundColor: '#081228',
                color: '#F8FAFC',
                border: isWon
                  ? '2px solid rgba(252, 211, 77, 0.8)'
                  : '2px solid rgba(251, 146, 60, 0.8)',
                boxShadow: isWon
                  ? '0 0 40px rgba(251, 191, 36, 0.16)'
                  : '0 0 40px rgba(251, 146, 60, 0.14)',
              }}
            >
              <div
                className="flex flex-wrap items-start justify-between gap-4 pb-5"
                style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.18)' }}
              >
                <div>
                  <span
                    className="text-xs font-semibold uppercase tracking-widest"
                    style={{ color: isWon ? '#FCD34D' : '#FDBA74' }}
                  >
                    {isWon
                      ? 'Junior Space Academy · Başarı Sertifikası'
                      : 'Junior Space Academy · Görev Sonu Raporu'}
                  </span>
                  <h1 className="text-2xl sm:text-4xl font-bold tracking-tight mt-1">
                    {isWon
                      ? `Komutan ${commanderName}`
                      : `Görev ${state.day}. Günde Sona Erdi`}
                  </h1>
                  <p className="text-sm sm:text-base mt-1.5" style={{ color: '#CBD5E1' }}>
                    {isWon
                      ? `Ay Güney Kutbu üssünü ${rules.maxDays} gün boyunca kesintisiz yöneterek görevi başarıyla tamamladı.`
                      : `Komutan: ${commanderName} · Her başarısız deneme, bir sonraki görev için veri sağlar.`}
                  </p>
                </div>

                {isLost && state.lossReason && (
                  <div
                    className="inline-flex items-center gap-2 rounded-xl px-3.5 py-2"
                    style={{
                      border: '1px solid rgba(251, 146, 60, 0.6)',
                      backgroundColor: 'rgba(124, 45, 18, 0.35)',
                    }}
                  >
                    <CertIcon id={state.lossReason} className="w-5 h-5" />
                    <div className="text-left">
                      <p
                        className="text-[11px] uppercase tracking-wider"
                        style={{ color: '#FDBA74' }}
                      >
                        Tükenen Kaynak
                      </p>
                      <p className="text-sm font-bold" style={{ color: '#FFFFFF' }}>
                        {RESOURCE_CONFIG[state.lossReason].label}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Kayıp Durumunda Otomatik Ders Kutusu */}
              {isLost && lossLesson && (
                <div
                  className="mt-5 rounded-xl p-4 sm:p-5"
                  style={{
                    border: '1px solid rgba(252, 211, 77, 0.6)',
                    backgroundColor: 'rgba(120, 53, 15, 0.24)',
                  }}
                >
                  <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#FCD34D' }}>
                    Neden Oldu &amp; Nasıl Önlenirdi?
                  </p>
                  <p className="text-sm sm:text-base mt-1.5 leading-relaxed" style={{ color: '#F1F5F9' }}>
                    {lossLesson}
                  </p>
                </div>
              )}

              {/* Kritik Günler Özeti */}
              {criticalDays.length > 0 && (
                <div className="mt-5">
                  <p
                    className="text-xs font-semibold uppercase tracking-wider mb-2.5"
                    style={{ color: '#94A3B8' }}
                  >
                    Kayıptan Önceki Kritik Günler
                  </p>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {criticalDays.map((entry) => {
                      const deltaVal =
                        state.lossReason && entry.dailyDelta
                          ? entry.dailyDelta[state.lossReason]
                          : null
                      return (
                        <div
                          key={entry.day}
                          className="rounded-xl p-3.5 text-xs"
                          style={{
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            backgroundColor: '#050C1D',
                          }}
                        >
                          <div className="flex items-center justify-between font-bold">
                            <span style={{ color: '#FFFFFF' }}>
                              {entry.day}. Gün · {entry.isNight ? 'Ay Gecesi' : 'Ay Gündüzü'}
                            </span>
                            {deltaVal !== null && (
                              <span className="tabular-nums" style={{ color: '#FDBA74' }}>
                                {deltaVal}/gün
                              </span>
                            )}
                          </div>
                          {entry.event && (
                            <p className="mt-1.5" style={{ color: '#CBD5E1' }}>
                              Olay: <span style={{ color: '#FDE68A' }}>{entry.event.title}</span> (
                              {entry.event.chosenLabel})
                            </p>
                          )}
                          {entry.upgrades.length > 0 && (
                            <p className="mt-1" style={{ color: '#6EE7B7' }}>
                              Kurulum: {entry.upgrades.join(', ')}
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Final Kaynak Durumu */}
              <div className="mt-6">
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-3"
                  style={{ color: '#94A3B8' }}
                >
                  Görev Sonu Kaynak Durumu
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {RESOURCE_ORDER.map((id) => {
                    const meta = RESOURCE_CONFIG[id]
                    return (
                      <div
                        key={id}
                        className="rounded-xl p-3 flex items-center justify-between gap-2"
                        style={{
                          border: '1px solid rgba(255, 255, 255, 0.25)',
                          backgroundColor: '#050C1D',
                        }}
                      >
                        <span
                          className="inline-flex items-center gap-1.5 text-xs font-medium min-w-0"
                          style={{ color: '#E2E8F0' }}
                        >
                          <CertIcon id={id} className="w-4 h-4 shrink-0" />
                          <span className="truncate">{meta.shortLabel}</span>
                        </span>
                        <span
                          className="text-base font-bold tabular-nums"
                          style={{ color: CERT_COLORS[id] }}
                        >
                          {state.resources[id]}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* İstatistik Satırı */}
              <div
                className="mt-5 pt-4 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm"
                style={{
                  borderTop: '1px solid rgba(255, 255, 255, 0.18)',
                  color: '#CBD5E1',
                }}
              >
                <div className="flex flex-wrap gap-3">
                  <span>
                    Tamamlanan Gün: <strong style={{ color: '#FFFFFF' }}>{state.day}</strong> /{' '}
                    {rules.maxDays}
                  </span>
                  <span>·</span>
                  <span>
                    Modül Geliştirme: <strong style={{ color: '#67E8F9' }}>{totalUpgrades}</strong>
                  </span>
                  <span>·</span>
                  <span>
                    Yönetilen Olay: <strong style={{ color: '#FCD34D' }}>{totalEvents}</strong>
                  </span>
                </div>
                <span className="text-xs" style={{ color: '#94A3B8' }}>
                  NASA Space Apps Challenge · Ay Üssü Simülasyonu
                </span>
              </div>
            </div>

            {/* Aksiyon Butonları (PNG'ye dahil edilmez) */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/hazirlik"
                  className="px-5 min-h-11 rounded-xl text-sm font-semibold inline-flex items-center border border-white/30 text-slate-100 hover:border-white"
                >
                  Brifinge Dön
                </Link>
                <button
                  type="button"
                  onClick={handleReplay}
                  className="px-6 min-h-11 rounded-xl text-sm font-bold bg-gradient-to-r from-sky-400 to-cyan-300 text-slate-950 shadow-[0_0_20px_rgba(56,189,248,0.35)] hover:brightness-110 cursor-pointer"
                >
                  Yeni Görev Başlat →
                </button>
              </div>

              <button
                type="button"
                disabled={downloading}
                onClick={handleDownloadCertificate}
                className="px-6 min-h-11 rounded-xl text-sm font-bold border border-amber-300/70 bg-amber-400/15 text-amber-200 hover:bg-amber-400/25 disabled:opacity-50 cursor-pointer transition-colors"
              >
                {downloading
                  ? 'Hazırlanıyor...'
                  : isWon
                    ? 'Sertifikayı PNG İndir'
                    : 'Görev Raporunu PNG İndir'}
              </button>
            </div>

            {downloadError && (
              <p role="alert" className="text-xs text-orange-300">
                {downloadError}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}