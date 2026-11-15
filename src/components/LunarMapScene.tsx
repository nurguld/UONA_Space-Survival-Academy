import {
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
  type RefObject,
} from 'react'
import mapCursorImg from '../assets/map-cursor.png'
import mapTerrainWideImg from '../assets/map-terrain-wide.jpg'
import { MODULE_SPRITES } from '../game/moduleSprites'
import { playClick } from '../game/sound'
import AstronautSprite from './AstronautSprite'
import BuildingSprite from './BuildingSprite'
import type {
  ActiveBuild,
  ModuleDef,
  ModuleId,
  ModuleLevels,
  SceneNavigationHandle,
} from '../types'

interface LunarMapSceneProps {
  night: boolean
  modules: ModuleLevels
  modulesDef: ModuleDef[]
  activeBuilds: Partial<Record<ModuleId, ActiveBuild>>
  budget: number
  disabled: boolean
  highlightedModuleId: ModuleId | null
  headerSlot?: ReactNode
  navigationRef?: RefObject<SceneNavigationHandle | null>
  onSelectModule: (moduleId: ModuleId) => void
}

interface BuildingNode {
  id: ModuleId
  label: string
  sector: string
  sprite: string
  footX: number
  footY: number
  heightPct: number
  hitCx: number
  hitCy: number
  hitRx: number
  hitRy: number
  doorX: number
  doorY: number
}

// 16:9 kamera penceresi + 2568x768 panoramik Ay haritası (birebir orantılı, kırpmasız)
const VIEW_W = 160
const VIEW_H = 90
const WORLD_W = 334
const WORLD_H = 100
const MAX_CAM_X = WORLD_W - VIEW_W
const MAX_CAM_Y = WORLD_H - VIEW_H

const WALK_MIN_X = 11
const WALK_MAX_X = 323
const WALK_MIN_Y = 23
const WALK_MAX_Y = 93.5
const WALK_SPEED = 54 // birim / sn (uzun mesafede de akıcı, ~2.3 sn doğu/batı seferi)
const NEAR_DOOR_RADIUS = 13.5

const BUILDINGS: BuildingNode[] = [
  // BATI SEKTÖRÜ — Enerji Çiftliği
  {
    id: 'solar',
    label: 'Güneş paneli',
    sector: 'Enerji Alanı',
    sprite: MODULE_SPRITES.solar,
    footX: 44,
    footY: 56,
    heightPct: 20,
    hitCx: 44,
    hitCy: 51,
    hitRx: 8.5,
    hitRy: 5.5,
    doorX: 44,
    doorY: 62,
  },
  {
    id: 'battery',
    label: 'Batarya',
    sector: 'Enerji Alanı',
    sprite: MODULE_SPRITES.battery,
    footX: 78,
    footY: 75,
    heightPct: 14.5,
    hitCx: 78,
    hitCy: 71,
    hitRx: 6.5,
    hitRy: 4.5,
    doorX: 78,
    doorY: 80.5,
  },

  // MERKEZ SEKTÖRÜ — Ana Yaşam & Sera Meydanı
  {
    id: 'lifeSupport',
    label: 'Yaşam destek',
    sector: 'Merkez Üs',
    sprite: MODULE_SPRITES.lifeSupport,
    footX: 138,
    footY: 49,
    heightPct: 24,
    hitCx: 138,
    hitCy: 42,
    hitRx: 11.5,
    hitRy: 7.5,
    doorX: 138,
    doorY: 54.5,
  },
  {
    id: 'greenhouse',
    label: 'Sera',
    sector: 'Merkez Üs',
    sprite: MODULE_SPRITES.greenhouse,
    footX: 185,
    footY: 45,
    heightPct: 24,
    hitCx: 185,
    hitCy: 38,
    hitRx: 10.5,
    hitRy: 7.2,
    doorX: 185,
    doorY: 50.5,
  },
  {
    id: 'exercise',
    label: 'Egzersiz',
    sector: 'Merkez Üs',
    sprite: MODULE_SPRITES.exercise,
    footX: 194,
    footY: 79,
    heightPct: 20.5,
    hitCx: 194,
    hitCy: 73.5,
    hitRx: 11.2,
    hitRy: 6.5,
    doorX: 194,
    doorY: 85,
  },

  // DOĞU SEKTÖRÜ — Uzak Radyasyon & Radar Karakolu
  {
    id: 'shield',
    label: 'Kalkan',
    sector: 'Koruma Karakolu',
    sprite: MODULE_SPRITES.shield,
    footX: 292,
    footY: 56,
    heightPct: 24.5,
    hitCx: 292,
    hitCy: 49,
    hitRx: 11.5,
    hitRy: 7.5,
    doorX: 292,
    doorY: 62,
  },
]

const PLAZA_CENTER = { x: 164, y: 63 }

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

const INITIAL_CAM = {
  x: clamp(PLAZA_CENTER.x - VIEW_W / 2, 0, MAX_CAM_X),
  y: clamp(PLAZA_CENTER.y - VIEW_H / 2, 0, MAX_CAM_Y),
}

const WORLD_CONTAINER_STYLE = {
  width: `${(WORLD_W / VIEW_W) * 100}%`,
  height: `${(WORLD_H / VIEW_H) * 100}%`,
  willChange: 'transform',
} as const

const ASTRO_OUTER_STATIC_STYLE = {
  height: '12.5%',
  aspectRatio: '177 / 260',
  transform: 'translate(-50%, -94%)',
  willChange: 'left, top',
} as const

const ASTRO_SHADOW_STATIC_STYLE = {
  willChange: 'transform, opacity',
} as const

const ASTRO_INNER_STATIC_STYLE = {
  willChange: 'transform',
} as const

const MINIMAP_CAM_STATIC_STYLE = {
  width: `${(VIEW_W / WORLD_W) * 100}%`,
  height: `${(VIEW_H / WORLD_H) * 100}%`,
} as const

const MAP_CURSOR_STYLE = {
  cursor: `url("${mapCursorImg}") 4 4, pointer`,
} as const

const KEYCAP_CLASS =
  'inline-flex items-center justify-center w-5 h-5 rounded-[5px] border-[1.5px] border-slate-950 bg-gradient-to-b from-slate-100 to-slate-300 text-[10px] font-black text-slate-900 shadow-[0_2px_0_#475569] leading-none'

function isInsideBuilding(x: number, y: number, pad = 1.6): boolean {
  for (const b of BUILDINGS) {
    const nx = (x - b.hitCx) / (b.hitRx + pad)
    const ny = (y - b.hitCy) / (b.hitRy + pad)
    if (nx * nx + ny * ny <= 1) return true
  }
  return false
}

function clampWalkPoint(x: number, y: number): { x: number; y: number } {
  let px = clamp(x, WALK_MIN_X, WALK_MAX_X)
  let py = clamp(y, WALK_MIN_Y, WALK_MAX_Y)
  for (const b of BUILDINGS) {
    const rx = b.hitRx + 2.0
    const ry = b.hitRy + 2.0
    const nx = (px - b.hitCx) / rx
    const ny = (py - b.hitCy) / ry
    const d2 = nx * nx + ny * ny
    if (d2 < 1) {
      const len = Math.sqrt(d2) || 0.01
      px = clamp(b.hitCx + (nx / len) * rx * 1.03, WALK_MIN_X, WALK_MAX_X)
      py = clamp(b.hitCy + (ny / len) * ry * 1.03, WALK_MIN_Y, WALK_MAX_Y)
    }
  }
  return { x: px, y: py }
}

function hasLineOfSight(ax: number, ay: number, bx: number, by: number): boolean {
  const dist = Math.hypot(bx - ax, by - ay)
  const steps = Math.max(2, Math.ceil(dist / 2.2))
  for (let i = 1; i < steps; i++) {
    const t = i / steps
    if (isInsideBuilding(ax + (bx - ax) * t, ay + (by - ay) * t, 1.3)) {
      return false
    }
  }
  return true
}

/** Geniş Ay haritası için A* + görüş hattı yumuşatma (binaların etrafından dolaşır) */
function findWalkPath(
  sx: number,
  sy: number,
  tx: number,
  ty: number,
): { x: number; y: number }[] {
  const start = clampWalkPoint(sx, sy)
  const end = clampWalkPoint(tx, ty)

  if (hasLineOfSight(start.x, start.y, end.x, end.y)) {
    return [end]
  }

  const step = 4
  const cols = Math.floor((WALK_MAX_X - WALK_MIN_X) / step) + 1
  const rows = Math.floor((WALK_MAX_Y - WALK_MIN_Y) / step) + 1
  const toCol = (x: number) => clamp(Math.round((x - WALK_MIN_X) / step), 0, cols - 1)
  const toRow = (y: number) => clamp(Math.round((y - WALK_MIN_Y) / step), 0, rows - 1)
  const toX = (c: number) => WALK_MIN_X + c * step
  const toY = (r: number) => WALK_MIN_Y + r * step

  const sc = toCol(start.x)
  const sr = toRow(start.y)
  const tc = toCol(end.x)
  const tr = toRow(end.y)
  const total = cols * rows
  const idx = (c: number, r: number) => r * cols + c

  const blocked = new Uint8Array(total)
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (isInsideBuilding(toX(c), toY(r), 1.4)) {
        blocked[idx(c, r)] = 1
      }
    }
  }
  blocked[idx(sc, sr)] = 0
  blocked[idx(tc, tr)] = 0

  const gScore = new Float32Array(total).fill(Infinity)
  const cameFrom = new Int32Array(total).fill(-1)
  const closed = new Uint8Array(total)
  const startId = idx(sc, sr)
  const goalId = idx(tc, tr)
  gScore[startId] = 0

  const open: number[] = [startId]
  const dirs = [
    [1, 0, 1],
    [-1, 0, 1],
    [0, 1, 1],
    [0, -1, 1],
    [1, 1, 1.414],
    [-1, 1, 1.414],
    [1, -1, 1.414],
    [-1, -1, 1.414],
  ] as const

  let found = false
  while (open.length > 0) {
    let bestPos = 0
    let bestF = Infinity
    for (let i = 0; i < open.length; i++) {
      const id = open[i]
      const r = Math.floor(id / cols)
      const c = id % cols
      const f = gScore[id] + Math.hypot(tc - c, tr - r)
      if (f < bestF) {
        bestF = f
        bestPos = i
      }
    }

    const current = open[bestPos]
    open.splice(bestPos, 1)
    if (current === goalId) {
      found = true
      break
    }
    if (closed[current]) continue
    closed[current] = 1

    const cr = Math.floor(current / cols)
    const cc = current % cols
    for (const [dc, dr, cost] of dirs) {
      const nc = cc + dc
      const nr = cr + dr
      if (nc < 0 || nc >= cols || nr < 0 || nr >= rows) continue
      const nid = idx(nc, nr)
      if (closed[nid] || blocked[nid]) continue
      if (dc !== 0 && dr !== 0 && (blocked[idx(cc + dc, cr)] || blocked[idx(cc, cr + dr)])) {
        continue
      }
      const nextG = gScore[current] + cost
      if (nextG < gScore[nid]) {
        gScore[nid] = nextG
        cameFrom[nid] = current
        open.push(nid)
      }
    }
  }

  if (!found) return [end]

  const raw: { x: number; y: number }[] = []
  let cur = goalId
  while (cur !== -1 && cur !== startId) {
    const r = Math.floor(cur / cols)
    const c = cur % cols
    raw.push({ x: toX(c), y: toY(r) })
    cur = cameFrom[cur]
  }
  raw.reverse()
  if (raw.length > 0) {
    raw[raw.length - 1] = end
  } else {
    raw.push(end)
  }

  const smoothed: { x: number; y: number }[] = []
  let anchor = start
  let i = 0
  while (i < raw.length) {
    let furthest = i
    for (let j = raw.length - 1; j > i; j--) {
      if (hasLineOfSight(anchor.x, anchor.y, raw[j].x, raw[j].y)) {
        furthest = j
        break
      }
    }
    smoothed.push(raw[furthest])
    anchor = raw[furthest]
    i = furthest + 1
  }
  return smoothed
}

function getNearestDoorModule(x: number, y: number): BuildingNode | null {
  let nearest: BuildingNode | null = null
  let bestDist = NEAR_DOOR_RADIUS
  for (const b of BUILDINGS) {
    const d = Math.hypot(x - b.doorX, y - b.doorY)
    if (d <= bestDist) {
      bestDist = d
      nearest = b
    }
  }
  return nearest
}

export default function LunarMapScene({
  night,
  modules,
  modulesDef,
  activeBuilds,
  budget,
  disabled,
  highlightedModuleId,
  headerSlot,
  navigationRef,
  onSelectModule,
}: LunarMapSceneProps) {
  const worldRef = useRef<HTMLDivElement>(null)
  const astroOuterRef = useRef<HTMLDivElement>(null)
  const astroInnerRef = useRef<HTMLDivElement>(null)
  const astroShadowRef = useRef<HTMLSpanElement>(null)
  const astroFrontLegRef = useRef<SVGGElement>(null)
  const astroBackLegRef = useRef<SVGGElement>(null)
  const minimapAstroRef = useRef<HTMLSpanElement>(null)
  const minimapCamRef = useRef<HTMLSpanElement>(null)
  const dustElsRef = useRef<(SVGEllipseElement | null)[]>([])

  const astroRef = useRef<{ x: number; y: number }>({ x: PLAZA_CENTER.x, y: PLAZA_CENTER.y })
  const camRef = useRef<{ x: number; y: number }>({ x: INITIAL_CAM.x, y: INITIAL_CAM.y })
  const facingRef = useRef<1 | -1>(1)
  const hopPhaseRef = useRef(0)
  const hopVisualRef = useRef({ hop: 0, tilt: 0, stride: 0 })
  const dustRef = useRef<
    { x: number; y: number; vx: number; vy: number; age: number; maxAge: number; size: number }[]
  >([
    { x: 0, y: 0, vx: 0, vy: 0, age: 1, maxAge: 0.45, size: 1 },
    { x: 0, y: 0, vx: 0, vy: 0, age: 1, maxAge: 0.45, size: 1 },
    { x: 0, y: 0, vx: 0, vy: 0, age: 1, maxAge: 0.45, size: 1 },
    { x: 0, y: 0, vx: 0, vy: 0, age: 1, maxAge: 0.45, size: 1 },
  ])
  const dustCursorRef = useRef(0)
  const nearIdRef = useRef<ModuleId | null>(null)
  const offscreenHintRef = useRef<'left' | 'right' | null>(null)
  const guidedBuildingRef = useRef<BuildingNode | null>(null)
  const pathRef = useRef<{ x: number; y: number }[]>([])
  const arrivalCbRef = useRef<(() => void) | null>(null)
  const keysRef = useRef<Set<string>>(new Set())
  const disabledRef = useRef(disabled)
  const onSelectRef = useRef(onSelectModule)

  const [nearModuleId, setNearModuleId] = useState<ModuleId | null>(null)
  const [offscreenHintDir, setOffscreenHintDir] = useState<'left' | 'right' | null>(null)
  const [clickTarget, setClickTarget] = useState<{ x: number; y: number; key: number } | null>(null)
  const hasClickTargetRef = useRef(false)

  const guidedBuilding = highlightedModuleId
    ? (BUILDINGS.find((b) => b.id === highlightedModuleId) ?? null)
    : null

  useEffect(() => {
    guidedBuildingRef.current = guidedBuilding
    if (!guidedBuilding) {
      offscreenHintRef.current = null
    }
  }, [guidedBuilding])

  useEffect(() => {
    disabledRef.current = disabled
    onSelectRef.current = onSelectModule
    if (disabled) {
      pathRef.current = []
      arrivalCbRef.current = null
      keysRef.current.clear()
    }
  }, [disabled, onSelectModule])

  // 60fps sıfır-React-rerender doğrudan DOM transform döngüsü (kamera takibi + Ay zıplayışı + mini-harita)
  useEffect(() => {
    let rafId = 0
    let last = performance.now()

    const spawnLandingDust = (x: number, y: number) => {
      for (let i = 0; i < 2; i++) {
        const slot = dustCursorRef.current % dustRef.current.length
        dustCursorRef.current += 1
        const dir = i === 0 ? -1 : 1
        dustRef.current[slot] = {
          x: x + dir * 0.9,
          y: y + 0.3,
          vx: dir * (3.2 + Math.random() * 2.0),
          vy: -1.8 - Math.random() * 1.4,
          age: 0,
          maxAge: 0.48,
          size: 1.0 + Math.random() * 0.45,
        }
      }
    }

    const applyAstroAndCameraDom = (
      x: number,
      y: number,
      hop: number,
      tilt: number,
      stride: number,
      face: 1 | -1,
      cx: number,
      cy: number,
    ) => {
      if (worldRef.current) {
        const txPct = -((cx / WORLD_W) * 100)
        const tyPct = -((cy / WORLD_H) * 100)
        worldRef.current.style.transform = `translate3d(${txPct.toFixed(3)}%, ${tyPct.toFixed(3)}%, 0)`
      }
      if (astroOuterRef.current) {
        astroOuterRef.current.style.left = `${(x / WORLD_W) * 100}%`
        astroOuterRef.current.style.top = `${(y / WORLD_H) * 100}%`
        astroOuterRef.current.style.zIndex = String(Math.round(y * 10))
      }
      if (astroInnerRef.current) {
        astroInnerRef.current.style.transform = `translate3d(0, -${hop.toFixed(2)}%, 0) rotate(${(face * tilt).toFixed(2)}deg) scaleX(${face})`
      }
      if (astroShadowRef.current) {
        const s = Math.max(0.54, 1 - hop * 0.013)
        const op = Math.max(0.24, 0.62 - hop * 0.011)
        astroShadowRef.current.style.transform = `translateX(-50%) scale(${s.toFixed(3)})`
        astroShadowRef.current.style.opacity = op.toFixed(3)
      }
      const frontAngle = stride * 38
      const backAngle = -stride * 38

      if (astroFrontLegRef.current) {
        astroFrontLegRef.current.setAttribute(
          'transform',
          `rotate(${frontAngle.toFixed(2)} 97.5 184.5)`,
        )
      }
      if (astroBackLegRef.current) {
        astroBackLegRef.current.setAttribute(
          'transform',
          `rotate(${backAngle.toFixed(2)} 59.5 186)`,
        )
      }
      if (minimapAstroRef.current) {
        minimapAstroRef.current.style.left = `${(x / WORLD_W) * 100}%`
        minimapAstroRef.current.style.top = `${(y / WORLD_H) * 100}%`
      }
      if (minimapCamRef.current) {
        minimapCamRef.current.style.left = `${(cx / WORLD_W) * 100}%`
        minimapCamRef.current.style.top = `${(cy / WORLD_H) * 100}%`
      }
    }

    applyAstroAndCameraDom(
      astroRef.current.x,
      astroRef.current.y,
      hopVisualRef.current.hop,
      hopVisualRef.current.tilt,
      hopVisualRef.current.stride,
      facingRef.current,
      camRef.current.x,
      camRef.current.y,
    )

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now

      let stepMovedDist = 0
      let posChanged = false
      let motionChanged = false

      if (!disabledRef.current) {
        const keys = keysRef.current
        let kx = 0
        let ky = 0
        if (keys.has('ArrowLeft') || keys.has('KeyA')) kx -= 1
        if (keys.has('ArrowRight') || keys.has('KeyD')) kx += 1
        if (keys.has('ArrowUp') || keys.has('KeyW')) ky -= 1
        if (keys.has('ArrowDown') || keys.has('KeyS')) ky += 1

        const cur = astroRef.current

        if (kx !== 0 || ky !== 0) {
          if (pathRef.current.length > 0) {
            pathRef.current = []
            arrivalCbRef.current = null
          }
          if (hasClickTargetRef.current) {
            hasClickTargetRef.current = false
            setClickTarget(null)
          }
          const len = Math.hypot(kx, ky)
          const stepX = (kx / len) * WALK_SPEED * dt
          const stepY = (ky / len) * WALK_SPEED * dt

          const next = clampWalkPoint(cur.x + stepX, cur.y + stepY)
          const d = Math.hypot(next.x - cur.x, next.y - cur.y)
          if (d > 0.01) {
            if (Math.abs(kx) > 0.1) facingRef.current = kx > 0 ? 1 : -1
            astroRef.current = next
            stepMovedDist = d
            posChanged = true
          }
        } else if (pathRef.current.length > 0) {
          const wp = pathRef.current[0]
          const dx = wp.x - cur.x
          const dy = wp.y - cur.y
          const dist = Math.hypot(dx, dy)
          const maxStep = WALK_SPEED * dt

          if (Math.abs(dx) > 0.35) facingRef.current = dx > 0 ? 1 : -1

          if (dist <= maxStep) {
            astroRef.current = { x: wp.x, y: wp.y }
            pathRef.current.shift()
            stepMovedDist = dist
            posChanged = true

            if (pathRef.current.length === 0) {
              if (hasClickTargetRef.current) {
                hasClickTargetRef.current = false
                setClickTarget(null)
              }
              const cb = arrivalCbRef.current
              arrivalCbRef.current = null
              cb?.()
            }
          } else {
            const nx = cur.x + (dx / dist) * maxStep
            const ny = cur.y + (dy / dist) * maxStep
            astroRef.current = { x: nx, y: ny }
            stepMovedDist = maxStep
            posChanged = true
          }
        }
      }

      const isMovingNow = stepMovedDist > 0.01

      if (isMovingNow) {
        const prevPhase = hopPhaseRef.current
        const nextPhase = prevPhase + stepMovedDist * 0.19
        hopPhaseRef.current = nextPhase

        if (Math.floor(prevPhase / Math.PI) !== Math.floor(nextPhase / Math.PI)) {
          spawnLandingDust(astroRef.current.x, astroRef.current.y)
        }

        const hop = Math.abs(Math.sin(nextPhase)) * 28
        const stride = (1 - Math.cos(nextPhase)) * 0.5
        const tilt = -Math.cos(nextPhase) * 4.5
        hopVisualRef.current = { hop, tilt, stride }
        motionChanged = true
      } else if (
        hopVisualRef.current.hop > 0.15 ||
        Math.abs(hopVisualRef.current.tilt) > 0.1 ||
        Math.abs(hopVisualRef.current.stride) > 0.02
      ) {
        const decay = Math.pow(0.004, dt)
        const nextHop = hopVisualRef.current.hop * decay
        const nextTilt = hopVisualRef.current.tilt * decay
        const nextStride = hopVisualRef.current.stride * decay
        if (nextHop <= 0.15 && Math.abs(nextTilt) <= 0.1 && Math.abs(nextStride) <= 0.02) {
          hopVisualRef.current = { hop: 0, tilt: 0, stride: 0 }
          hopPhaseRef.current = 0
        } else {
          hopVisualRef.current = { hop: nextHop, tilt: nextTilt, stride: nextStride }
        }
        motionChanged = true
      }

      // Yumuşak üstel takip kamerası (astronot yürüdükçe haritayı akıcı kaydırır)
      const targetCamX = clamp(astroRef.current.x - VIEW_W / 2, 0, MAX_CAM_X)
      const targetCamY = clamp(astroRef.current.y - VIEW_H / 2, 0, MAX_CAM_Y)
      const camLerp = 1 - Math.pow(0.0015, dt)
      const dxCam = targetCamX - camRef.current.x
      const dyCam = targetCamY - camRef.current.y
      let camChanged = false
      if (Math.abs(dxCam) > 0.04 || Math.abs(dyCam) > 0.04) {
        camRef.current = {
          x: camRef.current.x + dxCam * camLerp,
          y: camRef.current.y + dyCam * camLerp,
        }
        camChanged = true
      }

      if (posChanged || motionChanged || camChanged) {
        applyAstroAndCameraDom(
          astroRef.current.x,
          astroRef.current.y,
          hopVisualRef.current.hop,
          hopVisualRef.current.tilt,
          hopVisualRef.current.stride,
          facingRef.current,
          camRef.current.x,
          camRef.current.y,
        )
      }

      if (posChanged) {
        const nextNear = getNearestDoorModule(astroRef.current.x, astroRef.current.y)?.id ?? null
        if (nextNear !== nearIdRef.current) {
          nearIdRef.current = nextNear
          setNearModuleId(nextNear)
        }
      }

      // Ekran dışındaki rehber hedef yön okunu güncelle
      const guided = guidedBuildingRef.current
      if (guided) {
        const cx = camRef.current.x
        let dir: 'left' | 'right' | null = null
        if (guided.footX < cx + 10) dir = 'left'
        else if (guided.footX > cx + VIEW_W - 10) dir = 'right'
        if (dir !== offscreenHintRef.current) {
          offscreenHintRef.current = dir
          setOffscreenHintDir(dir)
        }
      }

      // Ay tozu havuzunu DOM üzerinden güncelle
      const puffs = dustRef.current
      for (let i = 0; i < puffs.length; i++) {
        const p = puffs[i]
        const el = dustElsRef.current[i]
        if (!el) continue
        if (p.age < p.maxAge) {
          p.age += dt
          if (p.age >= p.maxAge) {
            el.setAttribute('fill-opacity', '0')
          } else {
            p.x += p.vx * dt
            p.y += p.vy * dt
            p.vx *= 0.92
            const r = p.size * (1 + p.age * 1.4)
            const a = (1 - p.age / p.maxAge) * 0.55
            el.setAttribute('cx', p.x.toFixed(2))
            el.setAttribute('cy', p.y.toFixed(2))
            el.setAttribute('rx', r.toFixed(2))
            el.setAttribute('ry', (r * 0.55).toFixed(2))
            el.setAttribute('fill-opacity', a.toFixed(3))
          }
        }
      }

      rafId = window.requestAnimationFrame(tick)
    }

    rafId = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(rafId)
  }, [])

  // WASD / Ok tuşları + yakındaki binayı E ile açma
  useEffect(() => {
    const isWalkKey = (code: string) =>
      code === 'ArrowUp' ||
      code === 'ArrowDown' ||
      code === 'ArrowLeft' ||
      code === 'ArrowRight' ||
      code === 'KeyW' ||
      code === 'KeyA' ||
      code === 'KeyS' ||
      code === 'KeyD'

    const onKeyDown = (e: KeyboardEvent) => {
      if (disabledRef.current) return
      if (document.querySelector('dialog[open], [role="dialog"][aria-modal="true"]')) return
      const targetEl = e.target as HTMLElement | null
      if (
        targetEl &&
        (targetEl.tagName === 'INPUT' ||
          targetEl.tagName === 'TEXTAREA' ||
          targetEl.isContentEditable)
      ) {
        return
      }

      if (isWalkKey(e.code)) {
        e.preventDefault()
        keysRef.current.add(e.code)
        pathRef.current = []
        arrivalCbRef.current = null
        if (hasClickTargetRef.current) {
          hasClickTargetRef.current = false
          setClickTarget(null)
        }
      } else if (e.code === 'KeyE') {
        const near = getNearestDoorModule(astroRef.current.x, astroRef.current.y)
        if (near) {
          e.preventDefault()
          onSelectRef.current(near.id)
        }
      }
    }

    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.code)
    }

    const onBlur = () => {
      keysRef.current.clear()
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
    }
  }, [])

  const startWalkTo = (tx: number, ty: number, onArrive?: () => void) => {
    const target = clampWalkPoint(tx, ty)
    const route = findWalkPath(astroRef.current.x, astroRef.current.y, target.x, target.y)
    pathRef.current = route
    arrivalCbRef.current = onArrive ?? null
  }

  const navigateToBuilding = (b: BuildingNode) => {
    if (disabled) return
    const distToDoor = Math.hypot(astroRef.current.x - b.doorX, astroRef.current.y - b.doorY)
    if (distToDoor <= 2.2) {
      onSelectModule(b.id)
      return
    }
    playClick()
    hasClickTargetRef.current = true
    setClickTarget({ x: b.doorX, y: b.doorY, key: Date.now() })
    startWalkTo(b.doorX, b.doorY, () => {
      if (!disabledRef.current) onSelectRef.current(b.id)
    })
  }

  useImperativeHandle(navigationRef, () => ({
    walkToModule: (moduleId: ModuleId) => {
      const target = BUILDINGS.find((b) => b.id === moduleId)
      if (target) navigateToBuilding(target)
    },
  }))

  const handleTerrainClick = (e: MouseEvent<HTMLDivElement>) => {
    if (disabled) return
    const rect = worldRef.current?.getBoundingClientRect()
    if (!rect) return
    playClick()
    const wx = ((e.clientX - rect.left) / rect.width) * WORLD_W
    const wy = ((e.clientY - rect.top) / rect.height) * WORLD_H
    const snapped = clampWalkPoint(wx, wy)
    hasClickTargetRef.current = true
    setClickTarget({ x: snapped.x, y: snapped.y, key: Date.now() })
    startWalkTo(snapped.x, snapped.y)
  }

  const handleBuildingClick = (e: MouseEvent<HTMLButtonElement>, b: BuildingNode) => {
    e.stopPropagation()
    if (disabled) return
    if (e.detail === 0) {
      onSelectModule(b.id)
      return
    }
    navigateToBuilding(b)
  }

  const getDef = (id: ModuleId) => modulesDef.find((m) => m.id === id)

  return (
    <div className="relative w-full h-full min-w-[680px] overflow-hidden select-none">
      {/* Kaydırılabilir Geniş Dünya Sahnesi */}
      <div
        ref={worldRef}
        style={WORLD_CONTAINER_STYLE}
        className="relative top-0 left-0"
      >
        {/* Panoramik 2.5D Ay Zemini */}
        <img
          src={mapTerrainWideImg}
          alt="Geniş Ay Üssü Haritası"
          fetchPriority="high"
          draggable={false}
          className={`absolute inset-0 w-full h-full object-fill transition-all duration-700 ${
            night ? 'brightness-60 saturate-75' : 'brightness-100'
          }`}
        />

        {/* Ay Gecesi Ortam Karartması */}
        {night && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[#020617]/42 transition-opacity duration-700"
          />
        )}

        {/* Bölgeler Arası Uzun Yürüyüş Yolları + Rota + Ay Tozu */}
        <svg
          aria-hidden="true"
          viewBox={`0 0 ${WORLD_W} ${WORLD_H}`}
          className="pointer-events-none absolute inset-0 w-full h-full z-[4]"
        >
          {/* Batı Enerji Alanı - Merkez - Doğu Kalkan Karakolu ana yolu */}
          <path
            d="M 44 62 Q 72 68 78 80.5 M 78 80.5 Q 112 72 138 54.5 M 138 54.5 L 164 63 L 185 50.5 M 164 63 L 194 85 M 185 50.5 Q 242 54 292 62"
            fill="none"
            stroke="rgba(226, 232, 240, 0.25)"
            strokeWidth={1.1}
            strokeDasharray="2.2 2"
            strokeLinecap="round"
          />
          {/* Merkez Meydan halkası */}
          <ellipse
            cx={PLAZA_CENTER.x}
            cy={PLAZA_CENTER.y}
            rx={13}
            ry={6.5}
            fill="rgba(226, 232, 240, 0.14)"
            stroke="rgba(148, 163, 184, 0.35)"
            strokeWidth={0.45}
            strokeDasharray="1.8 1.4"
          />
          {/* Sektör zemin tabelaları */}
          <text
            x={56}
            y={91}
            textAnchor="middle"
            fill="rgba(15, 23, 42, 0.45)"
            fontSize="3.4"
            fontWeight="700"
            letterSpacing="0.3"
          >
            ⚡ ENERJİ ALANI
          </text>
          <text
            x={164}
            y={91}
            textAnchor="middle"
            fill="rgba(15, 23, 42, 0.45)"
            fontSize="3.4"
            fontWeight="700"
            letterSpacing="0.3"
          >
            🏠 MERKEZ ÜS
          </text>
          <text
            x={292}
            y={91}
            textAnchor="middle"
            fill="rgba(15, 23, 42, 0.45)"
            fontSize="3.4"
            fontWeight="700"
            letterSpacing="0.3"
          >
            🛡️ KORUMA KARAKOLU
          </text>

          {/* 4 havuzlu Ay tozu elipsi */}
          {[0, 1, 2, 3].map((slot) => (
            <ellipse
              key={slot}
              ref={(el) => {
                dustElsRef.current[slot] = el
              }}
              cx={0}
              cy={0}
              rx={1}
              ry={0.55}
              fill="#E2E8F0"
              fillOpacity={0}
            />
          ))}
        </svg>

        {/* Tüm Zemin Yürüme Tıklama Katmanı */}
        <div
          aria-hidden="true"
          onClick={handleTerrainClick}
          style={disabled ? undefined : MAP_CURSOR_STYLE}
          className="absolute inset-x-0 bottom-0 top-[18%] z-[6]"
        />

        {/* Mouse İle Tıklanan Hedef İşareti (Zemin Halkası + Yanıp Sönen Aşağı Ok) */}
        {clickTarget && !disabled && (
          <div
            key={clickTarget.key}
            aria-hidden="true"
            style={{
              left: `${(clickTarget.x / WORLD_W) * 100}%`,
              top: `${(clickTarget.y / WORLD_H) * 100}%`,
            }}
            className="pointer-events-none absolute z-[8] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
          >
            <svg
              viewBox="0 0 28 28"
              className="map-target-arrow w-6 h-6 -mt-7 drop-shadow-[0_2px_7px_rgba(0,216,255,0.95)]"
            >
              <defs>
                <linearGradient id="map-target-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22F3FF" />
                  <stop offset="55%" stopColor="#00B4F8" />
                  <stop offset="100%" stopColor="#0369C7" />
                </linearGradient>
              </defs>
              <path
                d="M14 25 L4 13 H10 V3 H18 V13 H24 Z"
                fill="url(#map-target-cyan)"
                stroke="#082F49"
                strokeWidth="2.4"
                strokeLinejoin="round"
              />
            </svg>
            <div className="relative w-7 h-3.5 -mt-1 flex items-center justify-center">
              <span className="map-target-ring absolute inset-0 rounded-full border-2 border-cyan-300 bg-cyan-400/25 shadow-[0_0_12px_rgba(0,216,255,0.85)]" />
              <span className="relative w-2 h-1 rounded-full bg-cyan-200" />
            </div>
          </div>
        )}

        {/* 6 Adet 2.5D Bina Sprite'ı (Y konumuna göre derinlik sıralı) */}
        {BUILDINGS.map((b) => {
          const level = modules[b.id]
          const def = getDef(b.id)
          const build = activeBuilds[b.id]
          const isMax = def ? level >= def.maxLevel : false
          const canAfford = def ? budget >= def.cost : false
          const isUnbuiltExercise = b.id === 'exercise' && level === 0
          const hasEnergyShield = b.id === 'shield' && level >= 3
          const isGuided = highlightedModuleId === b.id
          const isNearby = nearModuleId === b.id
          const isBatteryActiveAtNight = night && b.id === 'battery' && level > 0
          const buildingZ = Math.round(b.footY * 10)

          let arrowText = '↑ Kur'
          if (build) {
            arrowText =
              build.assignedCrew > 0 ? `👷 × ${build.assignedCrew} çalışıyor` : '⏸ Duraklatıldı'
          } else if (isMax) {
            arrowText = 'MAX'
          } else if (level > 0) {
            arrowText = `↑ ${def?.cost ?? 0} puan`
          } else if (def) {
            arrowText = `↑ Kur · ${def.cost} puan`
          }

          const buildDone = build ? build.totalWork - build.remainingWork : 0
          const buildEta =
            build && build.assignedCrew > 0
              ? `${Math.ceil(build.remainingWork / build.assignedCrew)} gün`
              : 'Durdu'

          return (
            <button
              key={b.id}
              type="button"
              data-module-anchor={b.id}
              disabled={disabled}
              onClick={(e) => handleBuildingClick(e, b)}
              style={{
                left: `${(b.footX / WORLD_W) * 100}%`,
                top: `${(b.footY / WORLD_H) * 100}%`,
                height: `${b.heightPct}%`,
                zIndex: buildingZ,
                transform: 'translate(-50%, -100%)',
                ...(disabled ? undefined : MAP_CURSOR_STYLE),
              }}
              className="group absolute flex flex-col items-center justify-end disabled:cursor-default focus:outline-none"
            >
              {/* Üst Eylem / Yakınlık Rozeti */}
              <div className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-0.5 whitespace-nowrap">
                {isGuided ? (
                  <span className="tutorial-pulse px-2.5 py-0.5 rounded-full text-[11px] font-bold border border-amber-200 bg-amber-400 text-slate-950 shadow-md">
                    Şimdi dene · {arrowText}
                  </span>
                ) : isNearby ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold border border-emerald-200 bg-emerald-400 text-slate-950 shadow-[0_0_12px_rgba(52,211,153,0.75)]">
                    [E] Aç · {arrowText}
                  </span>
                ) : (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border backdrop-blur-sm transition-all opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 group-focus-visible:opacity-100 group-focus-visible:translate-y-0 ${
                      build
                        ? 'opacity-100 translate-y-0 bg-amber-400 border-amber-200 text-slate-950'
                        : isMax
                          ? 'bg-slate-900/90 border-slate-500 text-slate-300'
                          : canAfford
                            ? 'bg-cyan-400 border-cyan-200 text-slate-950 shadow-[0_0_12px_rgba(56,189,248,0.65)]'
                            : 'bg-slate-900/90 border-amber-400/60 text-amber-300'
                    }`}
                  >
                    {arrowText}
                  </span>
                )}
              </div>

              {/* Zemin Gölgesi */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[82%] h-[18%] rounded-full bg-[#020617]/40 blur-[2px]"
              />

              {/* Kalkan Sv.3+ Parlayan Enerji Kubbesi */}
              {hasEnergyShield && (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-2 rounded-full border-2 border-orange-400/75 shadow-[0_0_24px_rgba(251,146,60,0.45)]"
                />
              )}

              {/* 2.5D Bina Sprite Görseli (Seviyeye Göre Gelişen Eklemeler) */}
              <BuildingSprite
                moduleId={b.id}
                level={level}
                alt={b.label}
                night={night}
                dimmed={isUnbuiltExercise}
                hoverScale
              />

              {/* Egzersiz Sv.0 Kilidi */}
              {isUnbuiltExercise && (
                <span className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 py-0.5 rounded-md border border-dashed border-white/80 bg-[#070E22]/85 text-[10px] font-bold text-slate-200 whitespace-nowrap">
                  Kurulmadı
                </span>
              )}

              {/* İnşaat Halindeki Atanmış Ekip */}
              {build && build.assignedCrew > 0 && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-4 bottom-1 flex items-end -space-x-2"
                >
                  {Array.from({ length: Math.min(2, build.assignedCrew) }).map((_, idx) => (
                    <AstronautSprite
                      key={idx}
                      walking
                      night={night}
                      className="h-9 aspect-[177/260] astro-walking drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]"
                    />
                  ))}
                </div>
              )}

              {/* Modül Adı ve İnşaat İlerleme Etiketi */}
              <div className="pointer-events-none absolute top-[102%] left-1/2 -translate-x-1/2 flex flex-col items-center gap-0.5">
                <span
                  className={`text-[11px] font-semibold bg-[#09132A]/92 border rounded-md px-2 py-0.5 backdrop-blur-sm whitespace-nowrap shadow-md ${
                    build
                      ? 'border-amber-300 text-amber-200'
                      : isGuided || isNearby
                        ? 'border-emerald-300 text-emerald-100'
                        : isBatteryActiveAtNight
                          ? 'border-emerald-400/80 text-emerald-200'
                          : 'border-white/45 group-hover:border-white text-slate-100'
                  }`}
                >
                  {b.label} · Sv.{level}
                </span>
                {build && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/25 border border-amber-300/70 text-amber-200 whitespace-nowrap">
                    🔨 {buildDone}/{build.totalWork} · {buildEta}
                  </span>
                )}
              </div>
            </button>
          )
        })}

        {/* 2D Haritada Bacak Adımıyla Yürüyen Astronot */}
        <div
          ref={astroOuterRef}
          aria-hidden="true"
          style={ASTRO_OUTER_STATIC_STYLE}
          className="pointer-events-none absolute"
        >
          <span
            ref={astroShadowRef}
            style={ASTRO_SHADOW_STATIC_STYLE}
            className="absolute bottom-[3%] left-1/2 w-[66%] h-[16%] rounded-full bg-[#020617] blur-[1px]"
          />
          <div
            ref={astroInnerRef}
            className="relative h-full w-full"
            style={ASTRO_INNER_STATIC_STYLE}
          >
            <AstronautSprite
              night={night}
              frontLegRef={astroFrontLegRef}
              backLegRef={astroBackLegRef}
              className="h-full w-full drop-shadow-[0_4px_5px_rgba(0,0,0,0.45)]"
            />
          </div>
        </div>
      </div>

      {/* Kamera Penceresine Sabit Opsiyonel Üst Bilgi */}
      {headerSlot}

      {/* Ekran Dışında Kalan Rehber Modülü İçin Yön Oku */}
      {guidedBuilding && offscreenHintDir && !disabled && (
        <button
          type="button"
          onClick={() => navigateToBuilding(guidedBuilding)}
          className={`tutorial-pulse absolute top-1/2 -translate-y-1/2 z-[945] px-3 py-1.5 rounded-full text-xs font-bold border border-amber-200 bg-amber-400 text-slate-950 shadow-lg cursor-pointer ${
            offscreenHintDir === 'left' ? 'left-4' : 'right-24'
          }`}
        >
          {offscreenHintDir === 'left'
            ? `← ${guidedBuilding.label}`
            : `${guidedBuilding.label} →`}
        </button>
      )}

      {/* Sol Alt Görsel Kontrol İpucu (Mavi İmleç + 3D WASD & E Tuşları) */}
      <div className="pointer-events-none absolute bottom-3 left-3 sm:left-4 z-[940] hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-[#09132A]/85 border border-white/20 text-[11px] font-semibold text-slate-100 backdrop-blur-md shadow-lg">
        <div className="flex items-center gap-1.5">
          <img
            src={mapCursorImg}
            alt=""
            className="w-5 h-5 object-contain drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)]"
          />
          <span>Tıkla &amp; Yürü</span>
        </div>
        <span className="h-6 w-px bg-white/15" />
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-center gap-0.5">
            <span className={KEYCAP_CLASS}>W</span>
            <div className="flex items-center gap-0.5">
              {(['A', 'S', 'D'] as const).map((k) => (
                <span key={k} className={KEYCAP_CLASS}>
                  {k}
                </span>
              ))}
            </div>
          </div>
          <span>Hareket Et</span>
        </div>
        <span className="h-6 w-px bg-white/15" />
        <div className="flex items-center gap-1.5">
          <span className={KEYCAP_CLASS}>E</span>
          <span>Aç</span>
        </div>
      </div>

      {/* Sağ Üst İnteraktif Radar Mini-Harita */}
      <div
        aria-label="Üs Mini Haritası"
        className="absolute top-[5.5rem] right-3 sm:right-4 z-[940] w-36 sm:w-44 rounded-xl border border-cyan-400/35 bg-[#070E22]/82 p-1.5 backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.18)]"
      >
        <div className="flex items-center justify-between px-1 pb-1 text-[9px] font-bold uppercase tracking-wider text-slate-300">
          <span>Üs Haritası</span>
          <span className="text-cyan-300">3 Sektör</span>
        </div>
        <div className="relative w-full aspect-[334/100] rounded-lg bg-[#1A243B] border border-white/10 overflow-hidden">
          {/* Ufuk çizgisi */}
          <div className="absolute inset-x-0 top-0 h-[18%] bg-[#060B18]" />

          {/* Aktif kamera görüş çerçevesi */}
          <span
            ref={minimapCamRef}
            style={MINIMAP_CAM_STATIC_STYLE}
            className="pointer-events-none absolute border border-white/55 bg-white/10 rounded-[2px]"
          />

          {/* 6 Bina Noktası (tıklayınca kamera ile yürür) */}
          {BUILDINGS.map((b) => {
            const build = activeBuilds[b.id]
            const isGuided = highlightedModuleId === b.id
            const isUnbuilt = b.id === 'exercise' && modules.exercise === 0
            return (
              <button
                key={b.id}
                type="button"
                title={`${b.label} (${b.sector})`}
                aria-label={`${b.label} konumuna git`}
                disabled={disabled}
                onClick={() => navigateToBuilding(b)}
                style={{
                  left: `${(b.footX / WORLD_W) * 100}%`,
                  top: `${(b.footY / WORLD_H) * 100}%`,
                }}
                className="group/dot absolute -translate-x-1/2 -translate-y-1/2 p-1 cursor-pointer disabled:cursor-default focus:outline-none"
              >
                <span
                  className={`block w-2.5 h-2.5 rounded-full border border-slate-950 transition-transform group-hover/dot:scale-125 ${
                    isGuided || build
                      ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)]'
                      : isUnbuilt
                        ? 'bg-slate-400'
                        : 'bg-emerald-300'
                  }`}
                />
              </button>
            )
          })}

          {/* Astronot canlı konumu */}
          <span
            ref={minimapAstroRef}
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-cyan-300 border border-slate-950 shadow-[0_0_8px_rgba(56,189,248,1)]"
          />
        </div>
      </div>
    </div>
  )
}
