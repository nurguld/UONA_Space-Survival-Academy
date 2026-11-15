import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import html2canvas from 'html2canvas'
import Navbar from '../../components/Navbar'
import { RESOURCE_CONFIG, RESOURCE_ORDER } from '../../components/ResourceIcon'
import { useGame } from '../../context/GameContext'
import { analyzeLossReason } from '../../game/engine'
import { playClick } from '../../game/sound'
import type { GameState, ResourceId } from '../../types'

function formatCommanderTitle(name: string): string {
  return /^komutan\b/i.test(name) ? name : `Komutan ${name}`
}

const STAR_DOTS = [
  { cx: 90, cy: 110, r: 1.4, o: 0.7 },
  { cx: 185, cy: 55, r: 1.1, o: 0.5 },
  { cx: 340, cy: 145, r: 1.2, o: 0.6 },
  { cx: 520, cy: 82, r: 1.6, o: 0.8 },
  { cx: 690, cy: 135, r: 1.1, o: 0.45 },
  { cx: 880, cy: 70, r: 1.5, o: 0.75 },
  { cx: 1090, cy: 115, r: 1.2, o: 0.65 },
  { cx: 1210, cy: 195, r: 1.3, o: 0.5 },
  { cx: 65, cy: 360, r: 1.2, o: 0.45 },
  { cx: 1225, cy: 420, r: 1.5, o: 0.6 },
  { cx: 145, cy: 610, r: 1.3, o: 0.5 },
  { cx: 1160, cy: 640, r: 1.2, o: 0.55 },
]

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
  const commanderTitle = formatCommanderTitle(commanderName)
  const canvas = document.createElement('canvas')
  canvas.width = 1200
  canvas.height = isWon ? 640 : 740
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas oluşturulamadı')

  ctx.fillStyle = '#040814'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const cardGrad = ctx.createLinearGradient(0, 36, 0, canvas.height - 36)
  cardGrad.addColorStop(0, '#151F31')
  cardGrad.addColorStop(1, '#0B1323')
  ctx.fillStyle = cardGrad
  ctx.strokeStyle = 'rgba(203, 213, 225, 0.35)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.roundRect(36, 36, canvas.width - 72, canvas.height - 72, 24)
  ctx.fill()
  ctx.stroke()

  ctx.fillStyle = '#38BDF8'
  ctx.font = 'bold 16px sans-serif'
  ctx.fillText(
    isWon
      ? 'JUNIOR SPACE ACADEMY · BAŞARI SERTİFİKASI'
      : 'JUNIOR SPACE ACADEMY · GÖREV SONU RAPORU',
    80,
    98,
  )

  ctx.fillStyle = '#FFFFFF'
  ctx.font = 'bold 40px sans-serif'
  ctx.fillText(
    isWon ? commanderTitle : `Görev ${state.day}. Günde Sona Erdi`,
    80,
    152,
  )

  ctx.fillStyle = '#CBD5E1'
  ctx.font = '20px sans-serif'
  let cursorY = drawWrappedText(
    ctx,
    isWon
      ? `Ay Güney Kutbu üssünü ${maxDays} gün boyunca kesintisiz yöneterek görevi başarıyla tamamladı.`
      : `${commanderTitle} · Her başarısız deneme, bir sonraki görev için veri sağlar.`,
    80,
    196,
    1040,
    30,
  )

  if (!isWon && lossLesson) {
    cursorY += 16
    ctx.fillStyle = '#081020'
    ctx.strokeStyle = 'rgba(203, 213, 225, 0.25)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.roundRect(80, cursorY, 1040, 120, 16)
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = '#7DD3FC'
    ctx.font = 'bold 15px sans-serif'
    ctx.fillText('NEDEN OLDU & NASIL ÖNLENİRDİ?', 104, cursorY + 34)

    ctx.fillStyle = '#F1F5F9'
    ctx.font = '18px sans-serif'
    drawWrappedText(ctx, lossLesson, 104, cursorY + 66, 990, 26)
    cursorY += 148
  } else {
    cursorY += 36
  }

  ctx.fillStyle = '#94A3B8'
  ctx.font = 'bold 15px sans-serif'
  ctx.fillText('GÖREV SONU KAYNAK DURUMU', 80, cursorY)
  cursorY += 20

  const boxWidth = 192
  const gap = 20
  RESOURCE_ORDER.forEach((id, idx) => {
    const x = 80 + idx * (boxWidth + gap)
    ctx.fillStyle = '#081020'
    ctx.strokeStyle = 'rgba(203, 213, 225, 0.22)'
    ctx.lineWidth = 1.5
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
  const commanderTitle = formatCommanderTitle(commanderName)
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
    playClick()
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
    playClick()
    setDownloading(true)
    setDownloadError(null)
    try {
      const canvas = await html2canvas(certificateRef.current, {
        backgroundColor: '#0B1323',
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
    <div className="relative min-h-dvh overflow-x-clip bg-[#040814] text-white pb-12">
      {/* Yıldızlı Uzay Arka Planı (Brifing Sayfasıyla Uyumlu) */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top_center,rgba(56,189,248,0.12),transparent_58%),radial-gradient(ellipse_at_bottom_left,rgba(99,102,241,0.09),transparent_55%)]"
      >
        <svg viewBox="0 0 1280 720" className="w-full h-full opacity-80" preserveAspectRatio="xMidYMid slice">
          {STAR_DOTS.map((s) => (
            <circle key={`${s.cx}-${s.cy}`} cx={s.cx} cy={s.cy} r={s.r} fill="#E2E8F0" opacity={s.o} />
          ))}
        </svg>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        <Navbar />

        {state.status === 'playing' ? (
          <section className="mt-8 rounded-2xl border border-slate-300/35 bg-gradient-to-b from-[#151F31]/92 to-[#0B1323]/96 backdrop-blur-xl text-slate-100 shadow-[0_16px_40px_rgba(4,9,20,0.6)] p-6 sm:p-8 text-center">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-400">
              Görev Devam Ediyor
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mt-1.5">
              Henüz {state.day}. Gündesin, {commanderTitle}
            </h1>
            <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-xl mx-auto leading-relaxed">
              Komutan sertifikanı veya görev sonu analizini görmek için {rules.maxDays} günlük görevi tamamla.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                to="/oyun"
                onClick={() => playClick()}
                className="px-6 min-h-11 rounded-xl text-sm font-bold inline-flex items-center bg-gradient-to-r from-[#0EA5D9] to-[#22C9EB] text-white shadow-[0_6px_20px_rgba(34,201,235,0.3)] hover:brightness-110 transition-all"
              >
                Göreve Devam Et →
              </Link>
            </div>
          </section>
        ) : (
          <div className="mt-8 flex flex-col gap-5">
            {/* PNG Olarak İndirilebilir Sertifika / Rapor Kartı (html2canvas uyumlu saf hex/rgba renkler) */}
            <div
              ref={certificateRef}
              className="rounded-2xl p-6 sm:p-8"
              style={{
                background: 'linear-gradient(180deg, #151F31 0%, #0B1323 100%)',
                color: '#F1F5F9',
                border: '1px solid rgba(203, 213, 225, 0.35)',
                boxShadow: '0 16px 40px rgba(4, 9, 20, 0.6)',
              }}
            >
              <div
                className="flex flex-wrap items-start justify-between gap-4 pb-5"
                style={{ borderBottom: '1px solid rgba(203, 213, 225, 0.2)' }}
              >
                <div className="min-w-0">
                  <span
                    className="text-xs font-semibold uppercase tracking-[0.18em]"
                    style={{ color: '#38BDF8' }}
                  >
                    {isWon
                      ? 'Junior Space Academy · Başarı Sertifikası'
                      : 'Junior Space Academy · Görev Sonu Raporu'}
                  </span>
                  <h1
                    className="text-2xl sm:text-4xl font-extrabold tracking-tight mt-1 leading-tight"
                    style={{ color: '#FFFFFF' }}
                  >
                    {isWon
                      ? commanderTitle
                      : `Görev ${state.day}. Günde Sona Erdi`}
                  </h1>
                  <p className="text-sm sm:text-[15px] mt-1.5 leading-relaxed" style={{ color: '#CBD5E1' }}>
                    {isWon
                      ? `Ay Güney Kutbu üssünü ${rules.maxDays} gün boyunca kesintisiz yöneterek görevi başarıyla tamamladı.`
                      : `${commanderTitle} · Her başarısız deneme, bir sonraki görev için veri sağlar.`}
                  </p>
                </div>

                {isWon && (
                  <span
                    className="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold"
                    style={{
                      border: '1px solid rgba(103, 232, 249, 0.35)',
                      backgroundColor: '#081020',
                      color: '#E0F2FE',
                    }}
                  >
                    ✓ {rules.maxDays} Günlük Görev Tamamlandı
                  </span>
                )}

                {isLost && state.lossReason && (
                  <div
                    className="inline-flex items-center gap-2.5 rounded-xl px-3.5 py-2 shrink-0"
                    style={{
                      border: '1px solid rgba(203, 213, 225, 0.28)',
                      backgroundColor: '#081020',
                    }}
                  >
                    <CertIcon id={state.lossReason} className="w-5 h-5" />
                    <div className="text-left">
                      <p
                        className="text-[10px] font-bold uppercase tracking-[0.1em]"
                        style={{ color: '#7DD3FC' }}
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
                    border: '1px solid rgba(203, 213, 225, 0.22)',
                    backgroundColor: '#081020',
                  }}
                >
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: '#38BDF8' }}>
                    Neden Oldu &amp; Nasıl Önlenirdi?
                  </p>
                  <p className="text-xs sm:text-sm mt-1.5 leading-relaxed" style={{ color: '#E2E8F0' }}>
                    {lossLesson}
                  </p>
                </div>
              )}

              {/* Kritik Günler Özeti */}
              {criticalDays.length > 0 && (
                <div className="mt-5">
                  <p
                    className="text-[11px] font-bold uppercase tracking-[0.14em] mb-2.5"
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
                            border: '1px solid rgba(203, 213, 225, 0.2)',
                            backgroundColor: '#081020',
                          }}
                        >
                          <div className="flex items-center justify-between font-bold">
                            <span style={{ color: '#FFFFFF' }}>
                              {entry.day}. Gün · {entry.isNight ? 'Ay Gecesi' : 'Ay Gündüzü'}
                            </span>
                            {deltaVal !== null && (
                              <span className="tabular-nums" style={{ color: '#7DD3FC' }}>
                                {deltaVal}/gün
                              </span>
                            )}
                          </div>
                          {entry.event && (
                            <p className="mt-1.5 leading-relaxed" style={{ color: '#CBD5E1' }}>
                              Olay: <span style={{ color: '#E0F2FE' }}>{entry.event.title}</span> (
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
              <div className="mt-5">
                <p
                  className="text-[11px] font-bold uppercase tracking-[0.14em] mb-2.5"
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
                        className="rounded-xl px-3.5 py-3 flex items-center justify-between gap-2"
                        style={{
                          border: '1px solid rgba(203, 213, 225, 0.22)',
                          backgroundColor: '#081020',
                        }}
                      >
                        <span
                          className="inline-flex items-center gap-1.5 text-xs font-semibold min-w-0"
                          style={{ color: '#E2E8F0' }}
                        >
                          <CertIcon id={id} className="w-4 h-4 shrink-0" />
                          <span className="truncate">{meta.shortLabel}</span>
                        </span>
                        <span
                          className="text-base font-extrabold tabular-nums"
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
                  borderTop: '1px solid rgba(203, 213, 225, 0.2)',
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
                    Modül Geliştirme: <strong style={{ color: '#7DD3FC' }}>{totalUpgrades}</strong>
                  </span>
                  <span>·</span>
                  <span>
                    Yönetilen Olay: <strong style={{ color: '#E2E8F0' }}>{totalEvents}</strong>
                  </span>
                </div>
                <span className="text-xs" style={{ color: '#94A3B8' }}>
                  NASA Space Apps Challenge · Ay Üssü Simülasyonu
                </span>
              </div>
            </div>

            {/* Aksiyon Butonları (PNG'ye dahil edilmez, Brifing Sayfası Buton Yapısıyla Birebir) */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/hazirlik"
                  onClick={() => playClick()}
                  className="px-5 min-h-11 rounded-xl text-sm font-semibold inline-flex items-center border border-slate-300/40 bg-[#0A1224]/85 text-slate-200 hover:border-white hover:text-white hover:bg-[#131F3A] backdrop-blur-md transition-colors"
                >
                  ← Brifinge Dön
                </Link>
                <button
                  type="button"
                  onClick={handleReplay}
                  className="px-6 min-h-11 rounded-xl text-sm font-bold bg-gradient-to-r from-[#0EA5D9] to-[#22C9EB] text-white shadow-[0_6px_22px_rgba(34,201,235,0.3)] hover:brightness-110 cursor-pointer transition-all"
                >
                  Yeni Görev Başlat →
                </button>
              </div>

              <button
                type="button"
                disabled={downloading}
                onClick={handleDownloadCertificate}
                className="px-5 min-h-11 rounded-xl text-sm font-semibold inline-flex items-center gap-2 border border-slate-300/40 bg-[#0A1224]/85 text-slate-200 hover:border-cyan-300/65 hover:text-white hover:bg-[#131F3A] backdrop-blur-md disabled:opacity-50 cursor-pointer transition-colors"
              >
                <span aria-hidden="true">⬇</span>
                <span>
                  {downloading
                    ? 'Hazırlanıyor...'
                    : isWon
                      ? 'Sertifikayı PNG İndir'
                      : 'Görev Raporunu PNG İndir'}
                </span>
              </button>
            </div>

            {downloadError && (
              <p role="alert" className="text-xs text-sky-300">
                {downloadError}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
