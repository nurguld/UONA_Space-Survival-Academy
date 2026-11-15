import { useEffect, useRef, useState } from 'react'
import { playAlert, playLaunch } from '../game/sound'

interface LaunchCutsceneProps {
  isOpen: boolean
  crewCount: number
  onComplete: () => void
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  color: string
}

interface Star {
  x: number
  y: number
  r: number
  phase: number
  speed: number
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v))
}

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
}

function quadBezier(p0: number, p1: number, p2: number, t: number): number {
  const u = 1 - t
  return u * u * p0 + 2 * u * t * p1 + t * t * p2
}

function quadBezierTangent(p0: number, p1: number, p2: number, t: number): number {
  return 2 * (1 - t) * (p1 - p0) + 2 * t * (p2 - p1)
}

function drawRocket(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angleRad: number,
  thrust: number,
  timeSec: number,
  scale = 1,
) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angleRad)
  ctx.scale(scale, scale)

  // İniş ayakları
  ctx.strokeStyle = '#94A3B8'
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.moveTo(-10, 14)
  ctx.lineTo(-18, 25)
  ctx.moveTo(10, 14)
  ctx.lineTo(18, 25)
  ctx.stroke()

  // Motor alevi
  if (thrust > 0.02) {
    const flicker = 0.85 + Math.sin(timeSec * 48) * 0.18
    const flameLen = (18 + thrust * 24) * flicker
    const grad = ctx.createLinearGradient(0, 18, 0, 18 + flameLen)
    grad.addColorStop(0, '#FFFFFF')
    grad.addColorStop(0.28, '#FDE047')
    grad.addColorStop(0.7, '#F97316')
    grad.addColorStop(1, 'rgba(239, 68, 68, 0)')

    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.moveTo(-7 * thrust, 18)
    ctx.quadraticCurveTo(0, 18 + flameLen * 1.15, 7 * thrust, 18)
    ctx.closePath()
    ctx.fill()
  }

  // Yan kanatçıklar
  ctx.fillStyle = '#EF4444'
  ctx.beginPath()
  ctx.moveTo(-11, 5)
  ctx.lineTo(-20, 20)
  ctx.lineTo(-10, 17)
  ctx.closePath()
  ctx.fill()

  ctx.beginPath()
  ctx.moveTo(11, 5)
  ctx.lineTo(20, 20)
  ctx.lineTo(10, 17)
  ctx.closePath()
  ctx.fill()

  // Roket gövdesi
  const bodyGrad = ctx.createLinearGradient(-12, 0, 12, 0)
  bodyGrad.addColorStop(0, '#CBD5E1')
  bodyGrad.addColorStop(0.45, '#FFFFFF')
  bodyGrad.addColorStop(1, '#94A3B8')
  ctx.fillStyle = bodyGrad
  ctx.beginPath()
  ctx.moveTo(0, -34)
  ctx.bezierCurveTo(12, -18, 13, 4, 11, 18)
  ctx.lineTo(-11, 18)
  ctx.bezierCurveTo(-13, 4, -12, -18, 0, -34)
  ctx.closePath()
  ctx.fill()

  // Kırmızı burun konisi
  ctx.fillStyle = '#EF4444'
  ctx.beginPath()
  ctx.moveTo(0, -34)
  ctx.bezierCurveTo(7, -25, 9, -17, 10, -13)
  ctx.lineTo(-10, -13)
  ctx.bezierCurveTo(-9, -17, -7, -25, 0, -34)
  ctx.closePath()
  ctx.fill()

  // Pencere
  ctx.fillStyle = '#38BDF8'
  ctx.strokeStyle = '#0F172A'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(0, -1, 5.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()

  // Pencere parıltısı
  ctx.fillStyle = '#E0F2FE'
  ctx.beginPath()
  ctx.arc(-1.6, -2.6, 1.8, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

function drawAstronaut(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  walkPhase: number,
  facingRight = true,
) {
  ctx.save()
  ctx.translate(x, y)
  if (!facingRight) ctx.scale(-1, 1)

  const swing = Math.sin(walkPhase) * 3.5

  // Sırt çantası
  ctx.fillStyle = '#94A3B8'
  ctx.fillRect(-7.5, -18, 4.5, 11)

  // Bacaklar
  ctx.strokeStyle = '#E2E8F0'
  ctx.lineWidth = 3.2
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(-2, -7)
  ctx.lineTo(-2 + swing, 0)
  ctx.moveTo(2.5, -7)
  ctx.lineTo(2.5 - swing, 0)
  ctx.stroke()

  // Gövde
  ctx.fillStyle = '#F8FAFC'
  ctx.beginPath()
  ctx.roundRect(-4.5, -19, 9.5, 12.5, 3)
  ctx.fill()

  // Kol
  ctx.strokeStyle = '#F8FAFC'
  ctx.lineWidth = 2.6
  ctx.beginPath()
  ctx.moveTo(3, -16)
  ctx.lineTo(6.5 - swing * 0.6, -10)
  ctx.stroke()

  // Kask
  ctx.fillStyle = '#F8FAFC'
  ctx.strokeStyle = '#38BDF8'
  ctx.lineWidth = 1.4
  ctx.beginPath()
  ctx.arc(0.5, -24.5, 6.2, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()

  // Altın vizör
  ctx.fillStyle = '#FBBF24'
  ctx.beginPath()
  ctx.ellipse(2.3, -24.5, 3.8, 2.7, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

export function LaunchCutscene({ isOpen, crewCount, onComplete }: LaunchCutsceneProps) {
  if (!isOpen) return null
  return <LaunchCutsceneContent crewCount={crewCount} onComplete={onComplete} />
}

function LaunchCutsceneContent({
  crewCount,
  onComplete,
}: Omit<LaunchCutsceneProps, 'isOpen'>) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const onCompleteRef = useRef(onComplete)
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    playLaunch()

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = 960
    const H = 500
    const TOTAL_MS = 5100
    const FLIGHT_END_T = 0.56 // ~2.85 sn uçuş + iniş

    const stars: Star[] = Array.from({ length: 85 }, (_, i) => ({
      x: ((i * 137.5) % 1) * W,
      y: ((i * 73.1 + 0.13) % 0.85) * H,
      r: 0.9 + ((i * 19) % 10) * 0.17,
      phase: i * 0.9,
      speed: 1.5 + (i % 4) * 0.7,
    }))

    const particles: Particle[] = []
    let touchDustSpawned = false
    let prevStep = 0
    let rafId = 0
    let lastTime = performance.now()
    const startTime = lastTime

    const spawnParticles = (
      count: number,
      x: number,
      y: number,
      vxBase: number,
      vyBase: number,
      spread: number,
      colors: string[],
      sizeRange: [number, number],
      lifeRange: [number, number],
    ) => {
      for (let i = 0; i < count; i++) {
        const angle = (Math.random() - 0.5) * spread
        const spd = 0.6 + Math.random() * 0.9
        const cos = Math.cos(angle)
        const sin = Math.sin(angle)
        particles.push({
          x: x + (Math.random() - 0.5) * 6,
          y: y + (Math.random() - 0.5) * 6,
          vx: (vxBase * cos - vyBase * sin) * spd,
          vy: (vxBase * sin + vyBase * cos) * spd,
          life: 0,
          maxLife: lifeRange[0] + Math.random() * (lifeRange[1] - lifeRange[0]),
          size: sizeRange[0] + Math.random() * (sizeRange[1] - sizeRange[0]),
          color: colors[i % colors.length],
        })
      }
    }

    const step = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000)
      lastTime = now
      const elapsed = now - startTime
      const progress = clamp01(elapsed / TOTAL_MS)
      const timeSec = elapsed / 1000

      const nextStep = progress < 0.34 ? 0 : progress < 0.62 ? 1 : 2
      if (nextStep !== prevStep) {
        prevStep = nextStep
        setStepIndex(nextStep)
      }

      // 1. Arka Plan Gökyüzü
      const skyGrad = ctx.createLinearGradient(0, 0, 0, H)
      skyGrad.addColorStop(0, '#020511')
      skyGrad.addColorStop(0.65, '#07112A')
      skyGrad.addColorStop(1, '#0B1736')
      ctx.fillStyle = skyGrad
      ctx.fillRect(0, 0, W, H)

      // Yıldızlar
      for (const s of stars) {
        const alpha = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(timeSec * s.speed + s.phase))
        ctx.fillStyle = `rgba(226, 232, 240, ${alpha.toFixed(2)})`
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fill()
      }

      // Yörünge kılavuz yayı
      ctx.save()
      ctx.setLineDash([7, 8])
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(155, 360)
      ctx.quadraticCurveTo(430, 35, 695, 336)
      ctx.stroke()
      ctx.restore()

      // 2. Sol Altta Parlayan Dünya
      const earthX = 140
      const earthY = 430
      const earthR = 115
      const earthHalo = ctx.createRadialGradient(earthX, earthY, earthR * 0.85, earthX, earthY, earthR * 1.32)
      earthHalo.addColorStop(0, 'rgba(56, 189, 248, 0.35)')
      earthHalo.addColorStop(1, 'rgba(56, 189, 248, 0)')
      ctx.fillStyle = earthHalo
      ctx.beginPath()
      ctx.arc(earthX, earthY, earthR * 1.32, 0, Math.PI * 2)
      ctx.fill()

      const earthGrad = ctx.createRadialGradient(earthX - 35, earthY - 40, 18, earthX, earthY, earthR)
      earthGrad.addColorStop(0, '#60A5FA')
      earthGrad.addColorStop(0.55, '#2563EB')
      earthGrad.addColorStop(1, '#1E3A8A')
      ctx.fillStyle = earthGrad
      ctx.beginPath()
      ctx.arc(earthX, earthY, earthR, 0, Math.PI * 2)
      ctx.fill()

      // Dünya kıtaları
      ctx.save()
      ctx.beginPath()
      ctx.arc(earthX, earthY, earthR, 0, Math.PI * 2)
      ctx.clip()
      ctx.fillStyle = 'rgba(34, 197, 94, 0.82)'
      ctx.beginPath()
      ctx.ellipse(earthX - 28, earthY - 38, 36, 22, -0.35, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(earthX + 35, earthY - 12, 28, 34, 0.4, 0, Math.PI * 2)
      ctx.fill()
      // Hareket eden bulut şeridi
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)'
      const cloudShift = (timeSec * 12) % 90
      ctx.beginPath()
      ctx.ellipse(earthX - 40 + cloudShift * 0.4, earthY - 62, 42, 8, -0.2, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()

      // 3. Sağda Ay Yüzeyi ve Ay Üssü Kubbesi
      const moonGrad = ctx.createLinearGradient(520, 320, 760, 500)
      moonGrad.addColorStop(0, '#94A3B8')
      moonGrad.addColorStop(0.5, '#64748B')
      moonGrad.addColorStop(1, '#334155')
      ctx.fillStyle = moonGrad
      ctx.beginPath()
      ctx.moveTo(470, H)
      ctx.quadraticCurveTo(680, 312, W, 348)
      ctx.lineTo(W, H)
      ctx.closePath()
      ctx.fill()

      // Kraterler
      ctx.fillStyle = 'rgba(51, 65, 85, 0.55)'
      ctx.beginPath()
      ctx.ellipse(620, 405, 32, 10, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(760, 442, 44, 13, 0, 0, Math.PI * 2)
      ctx.fill()

      // İniş pisti işareti
      const padX = 695
      const padY = 362
      ctx.fillStyle = '#334155'
      ctx.fillRect(padX - 30, padY - 3, 60, 6)
      ctx.fillStyle = '#FBBF24'
      ctx.fillRect(padX - 24, padY - 3, 8, 3)
      ctx.fillRect(padX + 16, padY - 3, 8, 3)

      // Ay Üssü Kubbesi (Sağda)
      const domeX = 845
      const domeY = 360
      const domeWarmth = clamp01((progress - 0.65) / 0.35)
      const domeGlow = ctx.createRadialGradient(domeX, domeY - 16, 4, domeX, domeY - 16, 62)
      domeGlow.addColorStop(0, `rgba(56, 189, 248, ${(0.25 + domeWarmth * 0.4).toFixed(2)})`)
      domeGlow.addColorStop(1, 'rgba(56, 189, 248, 0)')
      ctx.fillStyle = domeGlow
      ctx.beginPath()
      ctx.arc(domeX, domeY - 16, 62, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = `rgba(14, 165, 233, ${(0.28 + domeWarmth * 0.35).toFixed(2)})`
      ctx.strokeStyle = '#7DD3FC'
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.arc(domeX, domeY, 42, Math.PI, 0)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      // Kubbe penceresi ve anten
      ctx.fillStyle = domeWarmth > 0.2 ? '#4ADE80' : '#94A3B8'
      ctx.beginPath()
      ctx.arc(domeX, domeY - 16, 7, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#CBD5E1'
      ctx.fillRect(domeX - 48, domeY, 96, 10)

      // 4. Roket Uçuş & İniş Hesabı
      const flightT = clamp01(progress / FLIGHT_END_T)
      const easedFlight = easeInOutCubic(flightT)
      const rx = quadBezier(155, 430, padX, easedFlight)
      const ry = quadBezier(355, 38, padY - 25, easedFlight)

      const dx = quadBezierTangent(155, 430, padX, easedFlight)
      const dy = quadBezierTangent(355, 38, padY - 25, easedFlight)
      const tangentAngle = Math.atan2(dy, dx) + Math.PI / 2

      // İnişe yaklaşırken roketi dikey konuma (0 rad) yumuşakça çevir
      const uprightBlend = clamp01((flightT - 0.62) / 0.35)
      const rocketAngle = tangentAngle * (1 - easeOutCubic(uprightBlend))

      const thrust =
        progress < FLIGHT_END_T
          ? flightT > 0.85
            ? 0.65 * (1 - (flightT - 0.85) / 0.15)
            : 1
          : 0

      // Motor egzoz parçacıkları
      if (thrust > 0.15) {
        const tailX = rx - Math.sin(rocketAngle) * 24
        const tailY = ry + Math.cos(rocketAngle) * 24
        const exhaustVx = -Math.sin(rocketAngle) * -130
        const exhaustVy = Math.cos(rocketAngle) * 130
        spawnParticles(
          2,
          tailX,
          tailY,
          exhaustVx,
          exhaustVy,
          0.7,
          ['#FDE047', '#F97316', '#38BDF8', '#CBD5E1'],
          [2.5, 6],
          [0.25, 0.55],
        )
      }

      // Ay'a dokunuş toz patlaması
      if (progress >= FLIGHT_END_T && !touchDustSpawned) {
        touchDustSpawned = true
        spawnParticles(22, padX - 10, padY - 2, -95, -24, 0.7, ['#E2E8F0', '#94A3B8'], [3, 8], [0.5, 1.0])
        spawnParticles(22, padX + 10, padY - 2, 95, -24, 0.7, ['#E2E8F0', '#94A3B8'], [3, 8], [0.5, 1.0])
      }

      // 5. İniş Sonrası Astronotların Çıkışı ve Kubbeye Zıplaması
      if (progress >= FLIGHT_END_T + 0.03) {
        const crewTotal = Math.max(1, Math.min(4, crewCount))
        const exitStart = FLIGHT_END_T + 0.04
        const exitDuration = 0.36

        // Kapı ışık huzmesi
        ctx.fillStyle = 'rgba(56, 189, 248, 0.22)'
        ctx.beginPath()
        ctx.moveTo(padX + 6, padY - 18)
        ctx.lineTo(padX + 34, padY)
        ctx.lineTo(padX + 6, padY)
        ctx.closePath()
        ctx.fill()

        for (let i = 0; i < crewTotal; i++) {
          const delay = i * 0.055
          const tAstro = clamp01((progress - (exitStart + delay)) / (exitDuration - delay * 0.5))
          if (tAstro <= 0) continue

          const startX = padX + 8
          const targetX = domeX - 42 - i * 16
          const ax = startX + (targetX - startX) * easeOutCubic(tAstro)
          const hops = 3
          const hopHeight = Math.abs(Math.sin(tAstro * Math.PI * hops)) * 22 * (1 - tAstro * 0.35)
          const groundY = padY - tAstro * 2
          const ay = groundY - hopHeight

          // Gölge
          ctx.fillStyle = 'rgba(15, 23, 42, 0.45)'
          ctx.beginPath()
          ctx.ellipse(ax, groundY + 1, 7, 2.5, 0, 0, Math.PI * 2)
          ctx.fill()

          drawAstronaut(ctx, ax, ay, tAstro * 18 + i, true)
        }
      }

      // 6. Parçacıkları Güncelle & Çiz
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.life += dt
        if (p.life >= p.maxLife) {
          particles.splice(i, 1)
          continue
        }
        p.x += p.vx * dt
        p.y += p.vy * dt
        p.vx *= 0.96
        p.vy *= 0.96
        const alpha = 1 - p.life / p.maxLife
        ctx.globalAlpha = alpha
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * (0.6 + 0.5 * (1 - alpha)), 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1

      // Roket
      drawRocket(ctx, rx, ry, rocketAngle, thrust, timeSec, 1)

      if (progress < 1) {
        rafId = window.requestAnimationFrame(step)
      } else {
        onCompleteRef.current()
      }
    }

    rafId = window.requestAnimationFrame(step)

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        onCompleteRef.current()
      }
    }
    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.cancelAnimationFrame(rafId)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [crewCount])

  const captions = [
    'Dünya’dan roket ateşlendi! Ay’a doğru yola çıkılıyor...',
    'Ay yörüngesinden yüzeye frenleyerek iniş yapılıyor...',
    `${crewCount} astronot iniş modülünden çıkıp Ay üssüne yerleşiyor!`,
  ]

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Görev Başlangıç Animasyonu"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#030612]/92 backdrop-blur-md p-4"
    >
      <div className="w-full max-w-3xl rounded-2xl border-2 border-cyan-400/50 bg-[#070E24] shadow-[0_0_60px_rgba(56,189,248,0.28)] overflow-hidden">
        <canvas
          ref={canvasRef}
          width={960}
          height={500}
          className="w-full h-auto block bg-[#020511]"
        />

        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 bg-[#09132B] border-t border-white/15">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-200 border border-amber-300/40">
              Aşama {stepIndex + 1} / 3
            </span>
            <p className="text-sm sm:text-base font-medium text-slate-100">
              {captions[stepIndex]}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onCompleteRef.current()}
            className="px-5 min-h-10 rounded-xl text-sm font-semibold border border-white/30 bg-white/10 text-white hover:bg-white/20 cursor-pointer transition-colors"
          >
            Atla →
          </button>
        </div>
      </div>
    </div>
  )
}

interface DayTransitionCutsceneProps {
  targetDay: number | null
  lunarNightStartDay: number
  lunarNightEndDay: number
  onComplete: () => void
}

export function DayTransitionCutscene({
  targetDay,
  lunarNightStartDay,
  lunarNightEndDay,
  onComplete,
}: DayTransitionCutsceneProps) {
  if (targetDay === null) return null
  return (
    <DayTransitionContent
      key={targetDay}
      targetDay={targetDay}
      lunarNightStartDay={lunarNightStartDay}
      lunarNightEndDay={lunarNightEndDay}
      onComplete={onComplete}
    />
  )
}

function DayTransitionContent({
  targetDay,
  lunarNightStartDay,
  lunarNightEndDay,
  onComplete,
}: Omit<DayTransitionCutsceneProps, 'targetDay'> & { targetDay: number }) {
  const onCompleteRef = useRef(onComplete)
  const [fillPct, setFillPct] = useState(0)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  const isNightStart = targetDay === lunarNightStartDay
  const isSunrise = targetDay === lunarNightEndDay + 1
  const isNight = targetDay >= lunarNightStartDay && targetDay <= lunarNightEndDay

  useEffect(() => {
    if (isNightStart) {
      playAlert()
    }

    const duration = isNightStart || isSunrise ? 1050 : 620
    const start = performance.now()
    let rafId = 0

    const tick = (now: number) => {
      const p = clamp01((now - start) / duration)
      setFillPct(Math.round(easeOutCubic(p) * 100))
      if (p < 1) {
        rafId = window.requestAnimationFrame(tick)
      } else {
        onCompleteRef.current()
      }
    }

    rafId = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(rafId)
  }, [isNightStart, isSunrise])

  let badge = 'AY GÜNDÜZÜ'
  let icon = '☀️'
  let subtitle = 'Güneş panelleri enerji üretiyor'
  let barColor = 'bg-amber-300'
  let ringClass =
    'border-amber-300/60 bg-amber-400/15 text-amber-200 shadow-[0_0_50px_rgba(251,191,36,0.3)]'

  if (isNightStart) {
    badge = '14 GÜNLÜK KARANLIK DÖNEM'
    icon = '🌙'
    subtitle = 'Ay gecesi başlıyor! Güneş panelleri durdu, bataryalar devrede.'
    barColor = 'bg-orange-400'
    ringClass =
      'border-orange-400/75 bg-orange-500/20 text-orange-100 shadow-[0_0_50px_rgba(251,146,60,0.35)]'
  } else if (isSunrise) {
    badge = 'AYDINLIK GERİ DÖNDÜ'
    icon = '🌅'
    subtitle = 'Ay gecesi bitti! Güneş panelleri yeniden enerji üretmeye başladı!'
    barColor = 'bg-emerald-300'
    ringClass =
      'border-emerald-400/75 bg-emerald-500/20 text-emerald-100 shadow-[0_0_50px_rgba(52,211,153,0.35)]'
  } else if (isNight) {
    badge = 'AY GECESİ'
    icon = '🌙'
    subtitle = 'Güneş kapalı · Üssün enerji stokunu koru'
    barColor = 'bg-indigo-300'
    ringClass =
      'border-indigo-400/70 bg-indigo-500/20 text-indigo-100 shadow-[0_0_45px_rgba(129,140,248,0.3)]'
  }

  return (
    <div
      role="status"
      aria-live="polite"
      onClick={() => onCompleteRef.current()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#030714]/88 backdrop-blur-md p-4 cursor-pointer"
    >
      <div
        className={`max-w-md w-full rounded-3xl border-2 px-8 py-7 text-center flex flex-col items-center gap-3 ${ringClass}`}
      >
        <span
          className="text-5xl select-none inline-block"
          aria-hidden="true"
          style={{
            transform: `translateY(${Math.sin((fillPct / 100) * Math.PI) * -8}px) scale(${0.92 + (fillPct / 100) * 0.12})`,
          }}
        >
          {icon}
        </span>
        <span className="text-xs font-bold uppercase tracking-[0.22em] opacity-90">{badge}</span>
        <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
          GÜN {targetDay}
        </h2>
        <p className="text-sm sm:text-base text-slate-100/95 leading-snug">{subtitle}</p>
        <div className="w-full h-1.5 rounded-full bg-white/15 overflow-hidden mt-1">
          <div className={`h-full ${barColor}`} style={{ width: `${fillPct}%` }} />
        </div>
      </div>
    </div>
  )
}

interface VictoryCutsceneProps {
  isOpen: boolean
  crewCount: number
  onContinue: () => void
}

export function VictoryCutscene({ isOpen, crewCount, onContinue }: VictoryCutsceneProps) {
  if (!isOpen) return null
  return <VictoryCutsceneContent crewCount={crewCount} onContinue={onContinue} />
}

function VictoryCutsceneContent({
  crewCount,
  onContinue,
}: Omit<VictoryCutsceneProps, 'isOpen'>) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = 720
    const H = 260
    const sparks: Particle[] = []
    let last = performance.now()
    const start = last
    let rafId = 0
    let fireworkCooldown = 0

    const spawnFirework = (cx: number, cy: number) => {
      const palette = ['#34D399', '#38BDF8', '#FBBF24', '#F472B6', '#FFFFFF']
      const col = palette[Math.floor(Math.random() * palette.length)]
      for (let i = 0; i < 26; i++) {
        const a = (i / 26) * Math.PI * 2
        const spd = 65 + Math.random() * 90
        sparks.push({
          x: cx,
          y: cy,
          vx: Math.cos(a) * spd,
          vy: Math.sin(a) * spd,
          life: 0,
          maxLife: 0.9 + Math.random() * 0.5,
          size: 2.2 + Math.random() * 2,
          color: col,
        })
      }
    }

    spawnFirework(180, 95)
    spawnFirework(540, 85)

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const t = (now - start) / 1000

      fireworkCooldown -= dt
      if (fireworkCooldown <= 0) {
        fireworkCooldown = 0.85
        spawnFirework(110 + Math.random() * 500, 50 + Math.random() * 90)
      }

      ctx.fillStyle = '#061025'
      ctx.fillRect(0, 0, W, H)

      // Ay zemini
      ctx.fillStyle = '#475569'
      ctx.beginPath()
      ctx.moveTo(0, H)
      ctx.quadraticCurveTo(W * 0.5, H - 56, W, H - 16)
      ctx.lineTo(W, H)
      ctx.closePath()
      ctx.fill()

      // Zıplayarak kutlayan astronotlar
      const count = Math.max(1, Math.min(4, crewCount))
      for (let i = 0; i < count; i++) {
        const ax = 150 + i * 48
        const jump = Math.abs(Math.sin(t * 4.5 + i * 0.9)) * 18
        drawAstronaut(ctx, ax, H - 24 - jump, t * 8 + i, true)
      }

      // Yükselen dönüş roketi
      const rocketCycle = (t * 0.35) % 1
      const ry = H - 30 - easeInOutCubic(rocketCycle) * (H + 20)
      drawRocket(ctx, W * 0.68, ry, 0, 1, t, 0.95)

      // Havai fişekler
      for (let i = sparks.length - 1; i >= 0; i--) {
        const p = sparks[i]
        p.life += dt
        if (p.life >= p.maxLife) {
          sparks.splice(i, 1)
          continue
        }
        p.vy += 45 * dt
        p.x += p.vx * dt
        p.y += p.vy * dt
        ctx.globalAlpha = 1 - p.life / p.maxLife
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1

      rafId = window.requestAnimationFrame(tick)
    }

    rafId = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(rafId)
  }, [crewCount])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="30 Gün Zafer Kutlaması"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#030714]/92 backdrop-blur-md p-4"
    >
      <div className="w-full max-w-2xl rounded-3xl border-2 border-emerald-400/70 bg-[#08132B] shadow-[0_0_70px_rgba(52,211,153,0.35)] overflow-hidden flex flex-col items-center text-center">
        <canvas ref={canvasRef} width={720} height={260} className="w-full h-auto block" />

        <div className="p-6 sm:p-7 flex flex-col items-center gap-3.5">
          <span className="px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-emerald-400/60 bg-emerald-500/20 text-emerald-200">
            30 / 30 Gün Tamamlandı
          </span>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Tebrikler Komutan!
          </h2>

          <p className="text-sm sm:text-base text-slate-200 max-w-lg leading-relaxed">
            {crewCount} kişilik ekibin 14 günlük Ay gecesini ve tüm uzay tehlikelerini başarıyla
            atlattı. Ay üssün 30 gün boyunca ayakta kaldı!
          </p>

          <button
            type="button"
            autoFocus
            onClick={onContinue}
            className="mt-1 px-8 min-h-12 rounded-xl text-base font-bold bg-gradient-to-r from-emerald-400 to-cyan-300 text-slate-950 shadow-[0_0_24px_rgba(52,211,153,0.45)] hover:brightness-110 cursor-pointer transition-all"
          >
            Görev Özetini Gör →
          </button>
        </div>
      </div>
    </div>
  )
}
