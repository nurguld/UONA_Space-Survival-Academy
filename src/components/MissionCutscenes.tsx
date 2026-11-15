import { useEffect, useRef, useState } from 'react'
import cutscene1PrepImg from '../assets/cutscene-1-prep.jpg'
import cutscene2LaunchImg from '../assets/cutscene-2-launch.jpg'
import cutscene3SpaceImg from '../assets/cutscene-3-space.jpg'
import cutscene4LunarBaseImg from '../assets/cutscene-4-lunarbase.jpg'
import spriteAstronautImg from '../assets/sprite-astronaut.png'
import spriteRocketImg from '../assets/sprite-rocket.png'
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
  outline?: boolean
}

const IMAGE_CACHE = new Map<string, HTMLImageElement>()

function getCachedImage(src: string): HTMLImageElement {
  const existing = IMAGE_CACHE.get(src)
  if (existing) return existing
  const img = new Image()
  img.src = src
  IMAGE_CACHE.set(src, img)
  return img
}

function isImageReady(img: HTMLImageElement | undefined): img is HTMLImageElement {
  return Boolean(img && img.complete && img.naturalWidth > 0)
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

/** Görseli canvas'a oran bozmadan (cover) zoom ve pan ile çizer */
function drawBackdropCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  w: number,
  h: number,
  zoom = 1,
  focusX = 0.5,
  focusY = 0.5,
) {
  const iw = img.naturalWidth
  const ih = img.naturalHeight
  const baseScale = Math.max(w / iw, h / ih)
  const scale = baseScale * zoom
  const dw = iw * scale
  const dh = ih * scale
  const dx = (w - dw) * focusX
  const dy = (h - dh) * focusY
  ctx.drawImage(img, dx, dy, dw, dh)
}

/** Roket sprite'ının altına karikatür tarzı alev çizer */
function drawCartoonFlame(
  ctx: CanvasRenderingContext2D,
  nozzleY: number,
  thrust: number,
  timeSec: number,
  scaleFactor = 1,
) {
  if (thrust <= 0.02) return
  const flicker = 0.86 + Math.sin(timeSec * 46) * 0.16
  const flameLen = (52 + thrust * 56) * flicker * scaleFactor
  const halfW = 19 * thrust * scaleFactor

  // Dış turuncu alev (çizgi film konturlu)
  ctx.fillStyle = '#F97316'
  ctx.strokeStyle = '#1E293B'
  ctx.lineWidth = 2.4
  ctx.beginPath()
  ctx.moveTo(-halfW, nozzleY)
  ctx.quadraticCurveTo(-halfW * 1.15, nozzleY + flameLen * 0.48, 0, nozzleY + flameLen)
  ctx.quadraticCurveTo(halfW * 1.15, nozzleY + flameLen * 0.48, halfW, nozzleY)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  // İç parlak sarı alev
  ctx.fillStyle = '#FACC15'
  ctx.beginPath()
  ctx.moveTo(-halfW * 0.62, nozzleY)
  ctx.quadraticCurveTo(0, nozzleY + flameLen * 0.78, halfW * 0.62, nozzleY)
  ctx.closePath()
  ctx.fill()

  // Çekirdek beyaz parıltı
  ctx.fillStyle = '#FEF9C3'
  ctx.beginPath()
  ctx.moveTo(-halfW * 0.3, nozzleY)
  ctx.quadraticCurveTo(0, nozzleY + flameLen * 0.42, halfW * 0.3, nozzleY)
  ctx.closePath()
  ctx.fill()
}

/** Roket sprite'ını (opsiyonel iniş ayakları, kapak ve rampa ile) çizer */
function drawRocketSprite(
  ctx: CanvasRenderingContext2D,
  rocketImg: HTMLImageElement,
  x: number,
  y: number,
  targetHeight: number,
  angleRad: number,
  options: {
    thrust?: number
    timeSec?: number
    deployLegs?: number
    openHatch?: number
  } = {},
) {
  const { thrust = 0, timeSec = 0, deployLegs = 0, openHatch = 0 } = options
  const aspect = isImageReady(rocketImg)
    ? rocketImg.naturalWidth / rocketImg.naturalHeight
    : 178 / 440
  const h = targetHeight
  const w = h * aspect
  const s = h / 240

  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angleRad)

  // İniş ayakları (Ay'a iniş ve yerde duruş sahnelerinde)
  if (deployLegs > 0.05) {
    const legExt = deployLegs
    ctx.strokeStyle = '#1E293B'
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    const drawLeg = (dir: -1 | 1) => {
      const hipX = dir * w * 0.24
      const hipY = h * 0.31
      const footX = dir * w * (0.28 + 0.34 * legExt)
      const footY = h * 0.47 + 6 * s * legExt

      // Mavi payanda + koyu kontur
      ctx.lineWidth = 7 * s
      ctx.strokeStyle = '#1E293B'
      ctx.beginPath()
      ctx.moveTo(hipX, hipY)
      ctx.lineTo(footX, footY)
      ctx.stroke()

      ctx.lineWidth = 3.8 * s
      ctx.strokeStyle = '#60A5FA'
      ctx.beginPath()
      ctx.moveTo(hipX, hipY)
      ctx.lineTo(footX, footY)
      ctx.stroke()

      // Ayak pabucu
      ctx.fillStyle = '#94A3B8'
      ctx.strokeStyle = '#1E293B'
      ctx.lineWidth = 2 * s
      ctx.beginPath()
      ctx.ellipse(footX, footY + 1.5 * s, 7.5 * s, 3.2 * s, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
    }

    drawLeg(-1)
    drawLeg(1)
  }

  // Motor alevi (gövdenin arkasından çıkar)
  if (thrust > 0.02) {
    drawCartoonFlame(ctx, h * 0.44, thrust, timeSec, s)
  }

  // Birebir roket görseli
  if (isImageReady(rocketImg)) {
    ctx.drawImage(rocketImg, -w / 2, -h / 2, w, h)
  }

  // Sahne 5: Açık iniş kapısı ve merdiven rampası
  if (openHatch > 0.1) {
    const p = clamp01(openHatch)
    const doorX = 0
    const doorY = h * 0.21
    const doorW = 18 * s
    const doorH = 26 * s

    // Karanlık iç kabin kapısı
    ctx.fillStyle = '#1E293B'
    ctx.strokeStyle = '#0F172A'
    ctx.lineWidth = 2 * s
    ctx.beginPath()
    ctx.roundRect(doorX - doorW / 2, doorY - doorH / 2, doorW, doorH, [8 * s, 8 * s, 2, 2])
    ctx.fill()
    ctx.stroke()

    // Sıcak iç kabin ışığı
    ctx.fillStyle = `rgba(253, 224, 71, ${0.42 * p})`
    ctx.beginPath()
    ctx.roundRect(doorX - doorW * 0.34, doorY - doorH * 0.36, doorW * 0.68, doorH * 0.65, 4 * s)
    ctx.fill()

    // Yere uzanan merdiven rampası
    const rampStartX = doorX + 2 * s
    const rampStartY = doorY + doorH * 0.48
    const rampEndX = doorX + 34 * s * p
    const rampEndY = h * 0.495

    ctx.fillStyle = '#94A3B8'
    ctx.strokeStyle = '#1E293B'
    ctx.lineWidth = 2 * s
    ctx.beginPath()
    ctx.moveTo(rampStartX - 6 * s, rampStartY)
    ctx.lineTo(rampStartX + 6 * s, rampStartY)
    ctx.lineTo(rampEndX + 8 * s, rampEndY)
    ctx.lineTo(rampEndX - 6 * s, rampEndY)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
  }

  ctx.restore()
}

/** Astronot sprite'ını (yürüyüş/zıplama + opsiyonel bayrak ve çanta aksesuarlarıyla) çizer */
function drawAstronautSprite(
  ctx: CanvasRenderingContext2D,
  astroImg: HTMLImageElement,
  x: number,
  groundY: number,
  hopOffsetY: number,
  targetHeight: number,
  options: {
    facingRight?: boolean
    tiltRad?: number
    carryFlag?: boolean
    carryBag?: boolean
  } = {},
) {
  const { facingRight = true, tiltRad = 0, carryFlag = false, carryBag = false } = options
  const aspect = isImageReady(astroImg)
    ? astroImg.naturalWidth / astroImg.naturalHeight
    : 177 / 260
  const h = targetHeight
  const w = h * aspect
  const s = h / 82

  // Yerde yumuşak temas gölgesi (zıpladıkça küçülür)
  const shadowScale = Math.max(0.5, 1 - Math.abs(hopOffsetY) / 48)
  ctx.fillStyle = `rgba(15, 23, 42, ${0.42 * shadowScale})`
  ctx.beginPath()
  ctx.ellipse(x, groundY + 2 * s, 16 * s * shadowScale, 4.5 * s * shadowScale, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.save()
  ctx.translate(x, groundY + hopOffsetY)
  if (!facingRight) ctx.scale(-1, 1)
  ctx.rotate(tiltRad)

  // Bayrak (öndeki havaya kalkık elde)
  if (carryFlag) {
    const handX = w * 0.36
    const handY = -h * 0.62
    const poleTopY = handY - 34 * s

    ctx.strokeStyle = '#E2E8F0'
    ctx.lineWidth = 2.6 * s
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(handX, handY + 12 * s)
    ctx.lineTo(handX, poleTopY)
    ctx.stroke()

    ctx.fillStyle = '#38BDF8'
    ctx.strokeStyle = '#1E293B'
    ctx.lineWidth = 1.8 * s
    ctx.beginPath()
    ctx.moveTo(handX, poleTopY)
    ctx.lineTo(handX + 24 * s, poleTopY + 5 * s)
    ctx.lineTo(handX, poleTopY + 14 * s)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
  }

  // Birebir astronot görseli (ayaklar y=0'da yere oturur)
  if (isImageReady(astroImg)) {
    ctx.drawImage(astroImg, -w / 2, -h, w, h)
  }

  // Ekipman çantası (arkadaki kolda)
  if (carryBag) {
    const bagX = -w * 0.28
    const bagY = -h * 0.34
    ctx.fillStyle = '#D97706'
    ctx.strokeStyle = '#1E293B'
    ctx.lineWidth = 1.9 * s
    ctx.beginPath()
    ctx.roundRect(bagX - 8 * s, bagY, 15 * s, 12 * s, 3 * s)
    ctx.fill()
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(bagX - 0.5 * s, bagY, 4.5 * s, Math.PI, 0)
    ctx.stroke()
  }

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
  const distanceRef = useRef<HTMLSpanElement>(null)
  const onCompleteRef = useRef(onComplete)
  const [sceneIndex, setSceneIndex] = useState(0)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    playLaunch()

    // Tüm yüksek kaliteli çizimleri ve sprite'ları önbelleğe al
    const prepImg = getCachedImage(cutscene1PrepImg)
    const launchImg = getCachedImage(cutscene2LaunchImg)
    const spaceImg = getCachedImage(cutscene3SpaceImg)
    const baseImg = getCachedImage(cutscene4LunarBaseImg)
    const rocketImg = getCachedImage(spriteRocketImg)
    const astroImg = getCachedImage(spriteAstronautImg)

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = 960
    const H = 540
    const TOTAL_MS = 9000
    const SCENE_COUNT = 5
    const SCENE_MS = TOTAL_MS / SCENE_COUNT // Her sahne 1.80 sn

    const smokeParticles: Particle[] = []
    let prevScene = 0
    let smokeAccum = 0
    let landingBurstDone = false

    const spawnCartoonSmoke = (
      cx: number,
      cy: number,
      vx: number,
      vy: number,
      size: number,
      life: number,
      color = '#F1F5F9',
    ) => {
      smokeParticles.push({
        x: cx,
        y: cy,
        vx,
        vy,
        life: 0,
        maxLife: life,
        size,
        color,
        outline: true,
      })
    }

    const startTime = performance.now()
    let lastTime = startTime
    let rafId = 0

    const renderFrame = (now: number) => {
      const elapsed = now - startTime
      const dt = Math.min(0.05, (now - lastTime) / 1000)
      lastTime = now
      const timeSec = elapsed / 1000

      const progress = clamp01(elapsed / TOTAL_MS)
      const currentScene = Math.min(SCENE_COUNT - 1, Math.floor(elapsed / SCENE_MS))
      const sceneT = clamp01((elapsed - currentScene * SCENE_MS) / SCENE_MS)

      if (currentScene !== prevScene) {
        prevScene = currentScene
        smokeParticles.length = 0
        setSceneIndex(currentScene)
      }

      // Ay'a olan telemetri mesafesi (km) — DOM ref üzerinden doğrudan güncelleyerek 60fps akıcılığı koru
      const telemetryKm =
        currentScene <= 1
          ? Math.round(sceneT * (currentScene === 0 ? 0 : 12000))
          : currentScene === 2
            ? Math.round(12000 + easeInOutCubic(sceneT) * 358000)
            : 384400
      if (distanceRef.current) {
        distanceRef.current.textContent = `AY’A MESAFE: ${(384400 - telemetryKm).toLocaleString('tr-TR')} km`
      }

      // Sahne 4 iniş toz patlaması tetikleyici
      if (currentScene === 3 && sceneT > 0.56 && !landingBurstDone) {
        landingBurstDone = true
        for (let i = 0; i < 18; i++) {
          const dir = i % 2 === 0 ? -1 : 1
          const speed = 45 + (i % 5) * 28
          spawnCartoonSmoke(
            W * 0.5 + dir * (12 + (i % 4) * 10),
            415 + (i % 3) * 6,
            dir * speed,
            -8 - (i % 3) * 14,
            18 + (i % 4) * 8,
            1.1,
            i % 3 === 0 ? '#CBD5E1' : '#F8FAFC',
          )
        }
      }

      // 1. Arka plan temizliği
      ctx.fillStyle = '#060D20'
      ctx.fillRect(0, 0, W, H)

      const count = Math.max(1, Math.min(4, crewCount))

      // -----------------------------------------------------------
      // SAHNE 1: Dünyada Hazırlık
      // -----------------------------------------------------------
      if (currentScene === 0) {
        const zoom = 1 + sceneT * 0.06
        if (isImageReady(prepImg)) {
          drawBackdropCover(ctx, prepImg, W, H, zoom, 0.5, 0.62)
        }

        // Neşeyle fırlatma rampasına doğru el sallayarak yürüyen astronotlar
        for (let i = 0; i < count; i++) {
          const fromLeft = i < 2
          const startX = fromLeft ? 165 + i * 74 : 785 - (i - 2) * 74
          const endX = fromLeft ? 390 + i * 56 : 585 - (i - 2) * 56
          const ax = startX + (endX - startX) * easeInOutCubic(sceneT)
          const groundY = 488 - sceneT * 26 - (i % 2) * 8
          const walkPhase = timeSec * 9.5 + i * 1.4
          const hop = -Math.abs(Math.sin(walkPhase)) * 5.5
          const tilt = Math.sin(walkPhase) * 0.055
          const hScale = 102 - sceneT * 18

          drawAstronautSprite(ctx, astroImg, ax, groundY, hop, hScale, {
            facingRight: fromLeft,
            tiltRad: tilt,
          })
        }
      }

      // -----------------------------------------------------------
      // SAHNE 2: Fırlatma Anı (Bulutları Yaran Roket)
      // -----------------------------------------------------------
      else if (currentScene === 1) {
        // Hafif kamera titremesi ve bulut paralaksı
        const rumble = (1 - sceneT * 0.6) * 2.2
        const shakeX = Math.sin(timeSec * 52) * rumble
        const shakeY = Math.cos(timeSec * 47) * rumble

        ctx.save()
        ctx.translate(shakeX, shakeY)

        if (isImageReady(launchImg)) {
          drawBackdropCover(ctx, launchImg, W, H, 1.08, 0.5, 0.35 + sceneT * 0.4)
        }

        const p = easeInOutCubic(sceneT)
        const rx = 365 + p * 235
        const ry = 435 - p * 395
        const angle = 0.42
        const rHeight = 250 - p * 35

        // Duman parçacıkları oluştur
        smokeAccum += dt
        while (smokeAccum >= 0.032) {
          smokeAccum -= 0.032
          const exhaustX = rx - Math.sin(angle) * (rHeight * 0.46)
          const exhaustY = ry + Math.cos(angle) * (rHeight * 0.46)
          spawnCartoonSmoke(
            exhaustX + (Math.random() - 0.5) * 18,
            exhaustY + (Math.random() - 0.5) * 12,
            -48 + (Math.random() - 0.5) * 35,
            55 + Math.random() * 45,
            16 + Math.random() * 16,
            0.85,
            Math.random() > 0.35 ? '#F8FAFC' : '#CBD5E1',
          )
        }

        // Parçacıkları roketin arkasında çiz
        for (let i = smokeParticles.length - 1; i >= 0; i--) {
          const pt = smokeParticles[i]
          pt.life += dt
          if (pt.life >= pt.maxLife) {
            smokeParticles.splice(i, 1)
            continue
          }
          pt.x += pt.vx * dt
          pt.y += pt.vy * dt
          pt.vx *= 0.96
          pt.vy *= 0.96
          const a = 1 - pt.life / pt.maxLife
          const rad = pt.size * (0.85 + 0.7 * (1 - a))
          ctx.globalAlpha = a * 0.92
          ctx.fillStyle = pt.color
          ctx.strokeStyle = '#1E293B'
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.arc(pt.x, pt.y, rad, 0, Math.PI * 2)
          ctx.fill()
          ctx.stroke()
        }
        ctx.globalAlpha = 1

        drawRocketSprite(ctx, rocketImg, rx, ry, rHeight, angle, {
          thrust: 1,
          timeSec,
        })

        ctx.restore()
      }

      // -----------------------------------------------------------
      // SAHNE 3: Uzayda Yolculuk (Dünya'dan Ay'a)
      // -----------------------------------------------------------
      else if (currentScene === 2) {
        if (isImageReady(spaceImg)) {
          drawBackdropCover(ctx, spaceImg, W, H, 1 + sceneT * 0.04, 0.5, 0.5)
        }

        // Kesik yörünge yayı (Dünya -> Ay)
        const p0x = 275
        const p0y = 195
        const p1x = 540
        const p1y = 135
        const p2x = 765
        const p2y = 355

        ctx.save()
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.45)'
        ctx.lineWidth = 2.5
        ctx.setLineDash([7, 9])
        ctx.beginPath()
        ctx.moveTo(p0x, p0y)
        ctx.quadraticCurveTo(p1x, p1y, p2x, p2y)
        ctx.stroke()
        ctx.restore()

        const p = easeInOutCubic(sceneT)
        const rx = quadBezier(p0x, p1x, p2x, p)
        const ry = quadBezier(p0y, p1y, p2y, p)
        const vx = quadBezierTangent(p0x, p1x, p2x, p)
        const vy = quadBezierTangent(p0y, p1y, p2y, p)
        const rocketAngle = Math.atan2(vy, vx) + Math.PI / 2

        drawRocketSprite(ctx, rocketImg, rx, ry, 148 - p * 18, rocketAngle, {
          thrust: 0.72,
          timeSec,
        })
      }

      // -----------------------------------------------------------
      // SAHNE 4: Ay'a İniş (Kraterli Yüzey & Ay İniş Tozu)
      // -----------------------------------------------------------
      else if (currentScene === 3) {
        // Sol Ay düzlüğüne odaklanan yakın kadraj (üs binaları henüz görünmüyor)
        const zoom = 1.68 - sceneT * 0.08
        if (isImageReady(baseImg)) {
          drawBackdropCover(ctx, baseImg, W, H, zoom, 0.05, 0.88)
        }

        const landEase = easeOutCubic(Math.min(1, sceneT * 1.18))
        const rx = W * 0.5
        const ry = 85 + landEase * 238
        const thrust = sceneT < 0.75 ? 0.78 * (1 - sceneT * 0.8) : 0
        const legsOut = clamp01(sceneT * 2.4)

        // Roket indikçe yerden toz/duman bulutları yay
        if (sceneT > 0.45 && sceneT < 0.88) {
          smokeAccum += dt
          while (smokeAccum >= 0.045) {
            smokeAccum -= 0.045
            const dir = Math.random() > 0.5 ? 1 : -1
            spawnCartoonSmoke(
              rx + dir * (14 + Math.random() * 14),
              418,
              dir * (45 + Math.random() * 55),
              -12 - Math.random() * 20,
              15 + Math.random() * 12,
              0.9,
              Math.random() > 0.4 ? '#F1F5F9' : '#CBD5E1',
            )
          }
        }

        drawRocketSprite(ctx, rocketImg, rx, ry, 236, 0, {
          thrust,
          timeSec,
          deployLegs: legsOut,
        })

        // İniş toz bulutları
        for (let i = smokeParticles.length - 1; i >= 0; i--) {
          const pt = smokeParticles[i]
          pt.life += dt
          if (pt.life >= pt.maxLife) {
            smokeParticles.splice(i, 1)
            continue
          }
          pt.x += pt.vx * dt
          pt.y += pt.vy * dt
          pt.vx *= 0.93
          pt.vy *= 0.93
          const a = 1 - pt.life / pt.maxLife
          const rad = pt.size * (0.85 + 0.6 * (1 - a))
          ctx.globalAlpha = a * 0.9
          ctx.fillStyle = pt.color
          ctx.strokeStyle = '#1E293B'
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.arc(pt.x, pt.y, rad, 0, Math.PI * 2)
          ctx.fill()
          ctx.stroke()
        }
        ctx.globalAlpha = 1
      }

      // -----------------------------------------------------------
      // SAHNE 5: Üsse Varış (Kapı Açılır, Ekip Ay Kubbelerine Yürür)
      // -----------------------------------------------------------
      else {
        // Geniş plan: solda iniş roketi, sağda Yaşam Destek & Sera üssümüz
        const zoomOut = 1.07 - easeOutCubic(sceneT) * 0.07
        if (isImageReady(baseImg)) {
          drawBackdropCover(ctx, baseImg, W, H, zoomOut, 0.5, 0.5)
        }

        // Sol açık alanda inmiş JSA roketi (kapısı açık + merdiven rampalı)
        drawRocketSprite(ctx, rocketImg, 215, 292, 224, 0, {
          deployLegs: 1,
          openHatch: clamp01(sceneT * 3),
        })

        // Roketten çıkıp Yaşam Destek & Sera kubbelerine doğru düşük yerçekimli zıplamalarla ilerleyen astronotlar
        for (let i = 0; i < count; i++) {
          const appearDelay = i * 0.14
          const localP = clamp01((sceneT - appearDelay) / (1 - appearDelay))
          if (localP <= 0.02) continue

          const startX = 248
          const targetX = 485 - i * 38
          const ax = startX + (targetX - startX) * easeInOutCubic(localP)
          const groundY = 406 + (i % 2) * 14
          const hopCycle = localP * Math.PI * 4.5
          const hopY = -Math.abs(Math.sin(hopCycle)) * 22
          const hScale = 76

          drawAstronautSprite(ctx, astroImg, ax, groundY, hopY, hScale, {
            facingRight: true,
            tiltRad: Math.cos(hopCycle) * 0.06,
            carryFlag: i === 0,
            carryBag: i === 1 || (count === 1 && i === 0),
          })
        }
      }

      // 2. Sahne geçişlerinde kısa sinematik karartma
      const edgeFadeIn = sceneT < 0.09 ? 1 - sceneT / 0.09 : 0
      const edgeFadeOut = sceneT > 0.92 && currentScene < SCENE_COUNT - 1 ? (sceneT - 0.92) / 0.08 : 0
      const fadeAlpha = Math.max(edgeFadeIn, edgeFadeOut) * 0.45
      if (fadeAlpha > 0.01) {
        ctx.fillStyle = `rgba(3, 6, 18, ${fadeAlpha})`
        ctx.fillRect(0, 0, W, H)
      }

      // 3. Sinematik üst/alt ince siyah şeritler
      ctx.fillStyle = 'rgba(2, 6, 18, 0.82)'
      ctx.fillRect(0, 0, W, 18)
      ctx.fillRect(0, H - 18, W, 18)

      if (progress < 1) {
        rafId = window.requestAnimationFrame(renderFrame)
      } else {
        onCompleteRef.current()
      }
    }

    rafId = window.requestAnimationFrame(renderFrame)

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

  const sceneTitles = [
    'Dünyada Hazırlık',
    'Fırlatma Anı',
    'Uzayda Yolculuk',
    "Ay'a İniş",
    'Üsse Varış',
  ]

  const sceneDescriptions = [
    `${crewCount} astronot neşeyle el sallayarak Junior Space Academy roketine yürüyor.`,
    'Roket ateş ve duman bulutları eşliğinde gökyüzüne, bulutların ötesine yükseliyor!',
    'Dünya geride kaldı; yıldızların ve takımyıldızların arasından Ay’a süzülüyoruz.',
    'İniş ayakları açıldı! Kraterli Ay yüzeyine toz bulutları eşliğinde yumuşak iniş...',
    'Kapak açıldı! Astronotlar bayrak ve ekipmanlarıyla yaşam kubbelerine doğru zıplıyor.',
  ]

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Görev Başlangıç Sinematiği"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#030612]/94 backdrop-blur-md p-3 sm:p-5"
    >
      <div className="w-full max-w-4xl rounded-2xl border-2 border-cyan-400/50 bg-[#070E24] shadow-[0_0_70px_rgba(56,189,248,0.3)] overflow-hidden">
        {/* Üst telemetri şeridi */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#081229] border-b border-white/10 text-xs font-semibold text-slate-300">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="uppercase tracking-wider text-cyan-200">
              {sceneTitles[sceneIndex]}
            </span>
          </div>
          <span ref={distanceRef} className="font-mono text-amber-200">
            AY’A MESAFE: 384.400 km
          </span>
        </div>

        <canvas
          ref={canvasRef}
          width={960}
          height={540}
          className="w-full h-auto block bg-[#020511]"
        />

        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-[#09132B] border-t border-white/15">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <span className="shrink-0 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-200 border border-amber-300/40">
              Sahne {sceneIndex + 1} / 5
            </span>
            <p className="text-sm sm:text-base font-medium text-slate-100 leading-snug">
              {sceneDescriptions[sceneIndex]}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onCompleteRef.current()}
            className="shrink-0 px-5 min-h-10 rounded-xl text-sm font-semibold border border-white/30 bg-white/10 text-white hover:bg-white/20 cursor-pointer transition-colors"
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

/** Ay gökyüzünde karikatür tarzı parlak Güneş çizer */
function drawLunarSun(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  timeSec: number,
  alpha = 1,
) {
  if (alpha <= 0.01) return
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.translate(x, y)

  // Dış sıcak atmosfer parıltısı
  const glow = ctx.createRadialGradient(0, 0, radius * 0.4, 0, 0, radius * 3.1)
  glow.addColorStop(0, 'rgba(253, 224, 71, 0.55)')
  glow.addColorStop(0.45, 'rgba(251, 146, 60, 0.22)')
  glow.addColorStop(1, 'rgba(251, 146, 60, 0)')
  ctx.fillStyle = glow
  ctx.beginPath()
  ctx.arc(0, 0, radius * 3.1, 0, Math.PI * 2)
  ctx.fill()

  // Yavaşça dönen güneş ışınları
  ctx.save()
  ctx.rotate(timeSec * 0.45)
  ctx.strokeStyle = '#FDE047'
  ctx.lineWidth = 2.6
  ctx.lineCap = 'round'
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2
    const inner = radius + 4
    const outer = radius + (i % 2 === 0 ? 11 : 7)
    ctx.beginPath()
    ctx.moveTo(Math.cos(a) * inner, Math.sin(a) * inner)
    ctx.lineTo(Math.cos(a) * outer, Math.sin(a) * outer)
    ctx.stroke()
  }
  ctx.restore()

  // Çizgi film konturlu Güneş diski
  const discGrad = ctx.createRadialGradient(-radius * 0.28, -radius * 0.28, 2, 0, 0, radius)
  discGrad.addColorStop(0, '#FEF9C3')
  discGrad.addColorStop(0.65, '#FACC15')
  discGrad.addColorStop(1, '#F59E0B')
  ctx.fillStyle = discGrad
  ctx.strokeStyle = '#1E293B'
  ctx.lineWidth = 2.2
  ctx.beginPath()
  ctx.arc(0, 0, radius, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()

  ctx.restore()
}

function DayTransitionContent({
  targetDay,
  lunarNightStartDay,
  lunarNightEndDay,
  onComplete,
}: Omit<DayTransitionCutsceneProps, 'targetDay'> & { targetDay: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  const isNightStart = targetDay === lunarNightStartDay
  const isSunrise = targetDay === lunarNightEndDay + 1
  const isNight = targetDay >= lunarNightStartDay && targetDay <= lunarNightEndDay
  const daytimeSpan = Math.max(1, lunarNightStartDay - 1) // 14 gün
  const nightSpan = Math.max(1, lunarNightEndDay - lunarNightStartDay + 1) // 14 gün
  const dayInCycle =
    targetDay < lunarNightStartDay
      ? targetDay
      : targetDay > lunarNightEndDay
        ? targetDay - lunarNightEndDay
        : targetDay - lunarNightStartDay + 1

  useEffect(() => {
    if (isNightStart) {
      playAlert()
    }

    const baseImg = getCachedImage(cutscene4LunarBaseImg)
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = 960
    const H = 430
    const duration = isNightStart || isSunrise ? 1550 : 980

    // Ay gündüzü yörünge yayı (14 Dünya günü = 14 adım; her gün yalnızca 1/14 ilerler)
    const dayArcFraction = (day: number) => {
      if (day < lunarNightStartDay) {
        return 0.05 + ((day - 1) / Math.max(1, daytimeSpan - 1)) * 0.9
      }
      return 0.05 + ((day - lunarNightEndDay - 1) / Math.max(1, daytimeSpan - 1)) * 0.9
    }

    let fromArc = 0
    let toArc = 0
    if (isNightStart) {
      fromArc = dayArcFraction(lunarNightStartDay - 1) // ~0.95 (batı ufkuna çok yakın)
      toArc = 1.09 // ufkun altına batar
    } else if (isSunrise) {
      fromArc = -0.09 // doğu ufkunun altında
      toArc = 0.05 // ufuktan doğar
    } else if (!isNight) {
      // Gerçekçi 1/14 adımı hissedilir kılmak için bir önceki günden bugüne kayış
      const curr = dayArcFraction(targetDay)
      const prev = targetDay > 1 ? dayArcFraction(targetDay - 1) : curr - 0.06
      fromArc = prev
      toArc = curr
    } else {
      // Gece (16..28): 14 günlük gece döngüsü göstergesi adımı
      const prevNight = Math.max(1, dayInCycle - 1)
      fromArc = (prevNight - 1) / Math.max(1, nightSpan - 1)
      toArc = (dayInCycle - 1) / Math.max(1, nightSpan - 1)
    }

    const start = performance.now()
    let rafId = 0

    // Parabolik Ay gökyüzü yayı koordinatları (Dünya figürünün üzerinden süzülür)
    const p0x = 95
    const p0y = 285
    const p1x = 480
    const p1y = -48
    const p2x = 865
    const p2y = 285
    const horizonY = 278

    const renderFrame = (now: number) => {
      const elapsed = now - start
      const rawP = clamp01(elapsed / duration)
      const timeSec = elapsed / 1000
      const arcT = fromArc + (toArc - fromArc) * easeInOutCubic(rawP)

      // Sinematik yazı opacity eğrisi: sönükten belirginleş -> bekle -> sönükleş
      const fadeIn = clamp01(rawP / 0.24)
      const fadeOut = clamp01((1 - rawP) / 0.24)
      const textAlpha = Math.min(fadeIn, fadeOut)
      if (overlayRef.current) {
        overlayRef.current.style.opacity = String(textAlpha)
        overlayRef.current.style.transform = `scale(${0.96 + easeOutCubic(fadeIn) * 0.04})`
      }

      ctx.fillStyle = '#050B1D'
      ctx.fillRect(0, 0, W, H)

      // 1. Oyunun üs illüstrasyonu (çok hafif sinematik zoom)
      const camZoom = 1.01 + rawP * 0.05
      if (isImageReady(baseImg)) {
        drawBackdropCover(ctx, baseImg, W, H, camZoom, 0.5, 0.78)
      }

      // 2. Gece/gündüz atmosfer tonu
      let nightTintAlpha = 0
      if (isNightStart) {
        nightTintAlpha = easeInOutCubic(rawP) * 0.44
      } else if (isSunrise) {
        nightTintAlpha = (1 - easeInOutCubic(rawP)) * 0.44
      } else if (isNight) {
        nightTintAlpha = 0.44
      }

      if (nightTintAlpha > 0.01) {
        ctx.fillStyle = `rgba(4, 10, 32, ${nightTintAlpha})`
        ctx.fillRect(0, 0, W, H)
      }

      // Gündüz veya gündoğumu/günbatımı sıcak atmosfer parıltısı
      if (!isNight || isNightStart) {
        const dayWarmth = isNightStart
          ? (1 - rawP) * 0.26
          : isSunrise
            ? rawP * 0.24
            : 0.14
        if (dayWarmth > 0.01) {
          const sunXHint = quadBezier(p0x, p1x, p2x, clamp01(arcT))
          const sunYHint = quadBezier(p0y, p1y, p2y, clamp01(arcT))
          const atm = ctx.createRadialGradient(sunXHint, sunYHint, 10, sunXHint, sunYHint, 380)
          atm.addColorStop(0, `rgba(253, 224, 71, ${dayWarmth})`)
          atm.addColorStop(0.55, `rgba(251, 146, 60, ${dayWarmth * 0.4})`)
          atm.addColorStop(1, 'rgba(251, 146, 60, 0)')
          ctx.fillStyle = atm
          ctx.fillRect(0, 0, W, H)
        }
      }

      // 3. 14 Günlük Yörünge Yayı ve 14 Adım İşaretçisi
      ctx.save()
      ctx.strokeStyle =
        isNight && !isNightStart
          ? 'rgba(129, 140, 248, 0.28)'
          : 'rgba(253, 224, 71, 0.34)'
      ctx.lineWidth = 2
      ctx.setLineDash([6, 8])
      ctx.beginPath()
      ctx.moveTo(p0x, p0y)
      ctx.quadraticCurveTo(p1x, p1y, p2x, p2y)
      ctx.stroke()
      ctx.setLineDash([])

      // 14 günün küçük yörünge noktaları (hangi günde olduğumuzu gösterir)
      const totalDots = isNight && !isNightStart ? nightSpan : daytimeSpan
      for (let d = 0; d < totalDots; d++) {
        const frac = 0.05 + (d / Math.max(1, totalDots - 1)) * 0.9
        const dx = quadBezier(p0x, p1x, p2x, frac)
        const dy = quadBezier(p0y, p1y, p2y, frac)
        const isPassed = d < dayInCycle
        ctx.fillStyle =
          isNight && !isNightStart
            ? isPassed
              ? 'rgba(165, 180, 252, 0.85)'
              : 'rgba(148, 163, 184, 0.28)'
            : isPassed
              ? 'rgba(253, 224, 71, 0.9)'
              : 'rgba(255, 255, 255, 0.25)'
        ctx.beginPath()
        ctx.arc(dx, dy, isPassed ? 3.2 : 2.1, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.restore()

      // 4. Güneş (Gündüz, 15. Gün Batışı, 29. Gün Doğuşu) veya Gece Döngü İşaretçisi
      if (!isNight || isNightStart) {
        const sx = quadBezier(p0x, p1x, p2x, arcT)
        const sy = quadBezier(p0y, p1y, p2y, arcT)
        // Ufuk çizgisi altında yumuşakça gizlenerek gerçekçi batış/doğuş verir
        const horizonVisibility = clamp01((horizonY + 14 - sy) / 28)
        ctx.save()
        ctx.beginPath()
        ctx.rect(0, 0, W, horizonY + 10)
        ctx.clip()
        drawLunarSun(ctx, sx, sy, 23, timeSec, horizonVisibility)
        ctx.restore()
      } else {
        // Ay gecesi boyunca yörünge boyunca kayan gümüş-mavi Ay fazı işaretçisi + kayan yıldız
        const nightFrac = 0.05 + clamp01(arcT) * 0.9
        const mx = quadBezier(p0x, p1x, p2x, nightFrac)
        const my = quadBezier(p0y, p1y, p2y, nightFrac)

        const nightGlow = ctx.createRadialGradient(mx, my, 2, mx, my, 36)
        nightGlow.addColorStop(0, 'rgba(165, 180, 252, 0.75)')
        nightGlow.addColorStop(1, 'rgba(129, 140, 248, 0)')
        ctx.fillStyle = nightGlow
        ctx.beginPath()
        ctx.arc(mx, my, 36, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = '#E0E7FF'
        ctx.strokeStyle = '#1E293B'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(mx, my, 12, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()

        // Kayan yıldız efekti
        const shootX = W * 0.78 - rawP * 260
        const shootY = 58 + rawP * 85
        const shootAlpha = Math.sin(rawP * Math.PI) * 0.85
        if (shootAlpha > 0.05) {
          ctx.strokeStyle = `rgba(224, 242, 254, ${shootAlpha})`
          ctx.lineWidth = 2.2
          ctx.lineCap = 'round'
          ctx.beginPath()
          ctx.moveTo(shootX, shootY)
          ctx.lineTo(shootX + 42, shootY - 14)
          ctx.stroke()
        }
      }

      // 5. Sinematik merkez kontrast vinyeti ve üst/alt dar siyah şeritler
      const vignette = ctx.createRadialGradient(W * 0.5, H * 0.48, 40, W * 0.5, H * 0.48, W * 0.46)
      vignette.addColorStop(0, `rgba(4, 8, 22, ${0.58 * textAlpha})`)
      vignette.addColorStop(1, 'rgba(4, 8, 22, 0.1)')
      ctx.fillStyle = vignette
      ctx.fillRect(0, 0, W, H)

      ctx.fillStyle = 'rgba(2, 6, 18, 0.86)'
      ctx.fillRect(0, 0, W, 16)
      ctx.fillRect(0, H - 16, W, 16)

      if (rawP < 1) {
        rafId = window.requestAnimationFrame(renderFrame)
      } else {
        onCompleteRef.current()
      }
    }

    rafId = window.requestAnimationFrame(renderFrame)

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
  }, [dayInCycle, daytimeSpan, isNight, isNightStart, isSunrise, lunarNightEndDay, lunarNightStartDay, nightSpan, targetDay])

  let badge = `AY GÜNDÜZÜ · ${dayInCycle} / ${daytimeSpan}`
  let subtitle = 'Güneş 14 günlük Ay gündüzünde gökyüzünde yavaşça ilerliyor'
  let frameClass =
    'border-amber-300/60 shadow-[0_0_60px_rgba(251,191,36,0.28)]'
  let badgeClass = 'border-amber-300/50 bg-amber-400/20 text-amber-100'

  if (isNightStart) {
    badge = '14 GÜNLÜK KARANLIK DÖNEM'
    subtitle = 'Güneş ufuktan battı! Güneş panelleri durdu, bataryalar devrede.'
    frameClass =
      'border-orange-400/75 shadow-[0_0_65px_rgba(251,146,60,0.35)]'
    badgeClass = 'border-orange-400/60 bg-orange-500/25 text-orange-100'
  } else if (isSunrise) {
    badge = 'YENİ AY ŞAFAĞI'
    subtitle = '14 günlük Ay gecesi bitti! Güneş yeniden ufuktan yükseliyor.'
    frameClass =
      'border-emerald-400/75 shadow-[0_0_65px_rgba(52,211,153,0.35)]'
    badgeClass = 'border-emerald-400/60 bg-emerald-500/25 text-emerald-100'
  } else if (isNight) {
    badge = `AY GECESİ · ${dayInCycle} / ${nightSpan}`
    subtitle = 'Güneş ufkun altında · Üssün enerji stokunu koru'
    frameClass =
      'border-indigo-400/70 shadow-[0_0_60px_rgba(129,140,248,0.32)]'
    badgeClass = 'border-indigo-400/60 bg-indigo-500/25 text-indigo-100'
  }

  return (
    <div
      role="status"
      aria-live="polite"
      onClick={() => onCompleteRef.current()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#030612]/90 backdrop-blur-md p-3 sm:p-5 cursor-pointer"
    >
      <div
        className={`relative w-full max-w-3xl rounded-2xl border-2 bg-[#060D20] overflow-hidden ${frameClass}`}
      >
        <canvas
          ref={canvasRef}
          width={960}
          height={430}
          className="w-full h-auto block"
        />

        {/* Sönükten netleşip tekrar sönümlenen sinematik başlık katmanı (bar yok) */}
        <div
          ref={overlayRef}
          style={{ opacity: 0 }}
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center px-6"
        >
          <span
            className={`px-3.5 py-1 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] border backdrop-blur-sm ${badgeClass}`}
          >
            {badge}
          </span>
          <h2 className="mt-2.5 text-5xl sm:text-6xl font-black tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)]">
            GÜN {targetDay}
          </h2>
          <p className="mt-2 max-w-md text-xs sm:text-base font-medium text-slate-100 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
            {subtitle}
          </p>
        </div>

        <span className="pointer-events-none absolute bottom-6 right-5 text-[11px] font-medium text-slate-300/70">
          Geçmek için tıkla
        </span>
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
    const baseImg = getCachedImage(cutscene4LunarBaseImg)
    const rocketImg = getCachedImage(spriteRocketImg)
    const astroImg = getCachedImage(spriteAstronautImg)

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = 720
    const H = 280
    const sparks: Particle[] = []
    let last = performance.now()
    const start = last
    let rafId = 0
    let fireworkCooldown = 0

    const spawnFirework = (cx: number, cy: number) => {
      const palette = ['#34D399', '#38BDF8', '#FBBF24', '#F472B6', '#FFFFFF']
      const col = palette[Math.floor(Math.random() * palette.length)]
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * Math.PI * 2
        const spd = 65 + Math.random() * 85
        sparks.push({
          x: cx,
          y: cy,
          vx: Math.cos(a) * spd,
          vy: Math.sin(a) * spd,
          life: 0,
          maxLife: 0.9 + Math.random() * 0.45,
          size: 2.2 + Math.random() * 2,
          color: col,
        })
      }
    }

    spawnFirework(190, 90)
    spawnFirework(530, 80)

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const t = (now - start) / 1000

      fireworkCooldown -= dt
      if (fireworkCooldown <= 0) {
        fireworkCooldown = 0.85
        spawnFirework(120 + Math.random() * 480, 45 + Math.random() * 90)
      }

      ctx.fillStyle = '#061025'
      ctx.fillRect(0, 0, W, H)

      if (isImageReady(baseImg)) {
        drawBackdropCover(ctx, baseImg, W, H, 1.0, 0.5, 0.72)
      }

      // Sol düzlükte zıplayarak kutlayan astronotlar
      const count = Math.max(1, Math.min(4, crewCount))
      for (let i = 0; i < count; i++) {
        const ax = 115 + i * 52
        const hop = -Math.abs(Math.sin(t * 4.4 + i * 0.9)) * 22
        drawAstronautSprite(ctx, astroImg, ax, H - 30, hop, 68, {
          facingRight: true,
          carryFlag: i === 0,
        })
      }

      // Zafer dönüşü yapan roket
      const rocketCycle = (t * 0.34) % 1
      const ry = H - 30 - easeInOutCubic(rocketCycle) * (H + 60)
      drawRocketSprite(ctx, rocketImg, 215, ry, 136, 0, {
        thrust: 0.9,
        timeSec: t,
      })

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
        <canvas ref={canvasRef} width={720} height={280} className="w-full h-auto block" />

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
