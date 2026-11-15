import type { ModuleId } from '../types'

import clickSfxUrl from '../assets/sfx-click.mp3'
import upgradeCompleteSfxUrl from '../assets/sfx-upgrade-complete.wav'
import bookSfxUrl from '../assets/sfx-book.mp3'
import waterSfxUrl from '../assets/sfx-water.mp3'
import batterySfxUrl from '../assets/sfx-batarya.mp3'
import electricSfxUrl from '../assets/sfx-elektrik.mp3'
import shieldSfxUrl from '../assets/sfx-shield.mp3'
import gymSfxUrl from '../assets/gym.wav'
import rocketSfxUrl from '../assets/sfx-rocket.mp3'
import spaceAmbientUrl from '../assets/sfx-space.mp3'

const MUTE_KEY = 'jsa_muted'
// Ses seviyesini tek yerden ayarlamak için (0.1 kısık - 0.6 çok yüksek)
const MASTER_VOLUME = 0.55

type SoundChannel = 'book' | 'module' | 'launch'

interface ClipSpec {
  src: string
  offsetSec?: number
  durationSec?: number
  fadeInSec?: number
  fadeOutSec?: number
  volume?: number
  channel: SoundChannel
}

const BOOK_PAGE_CLIP: ClipSpec = {
  src: bookSfxUrl,
  offsetSec: 5.55,
  durationSec: 0.78,
  fadeInSec: 0.02,
  fadeOutSec: 0.16,
  volume: 1.55,
  channel: 'book',
}

const LAUNCH_ROCKET_CLIP: ClipSpec = {
  src: rocketSfxUrl,
  offsetSec: 0.45,
  durationSec: 6.0,
  fadeInSec: 0.15,
  fadeOutSec: 1.15,
  volume: 0.6,
  channel: 'launch',
}

const WATER_MODULE_CLIP: ClipSpec = {
  src: waterSfxUrl,
  offsetSec: 10.95,
  durationSec: 1.3,
  fadeInSec: 0.12,
  fadeOutSec: 0.35,
  volume: 2.2,
  channel: 'module',
}

const MODULE_OPEN_CLIPS: Record<ModuleId, ClipSpec> = {
  lifeSupport: WATER_MODULE_CLIP,
  greenhouse: WATER_MODULE_CLIP,
  battery: {
    src: batterySfxUrl,
    offsetSec: 0.08,
    durationSec: 1.1,
    fadeInSec: 0.04,
    fadeOutSec: 0.3,
    volume: 0.55,
    channel: 'module',
  },
  solar: {
    src: electricSfxUrl,
    offsetSec: 0.1,
    durationSec: 1.1,
    fadeInSec: 0.03,
    fadeOutSec: 0.25,
    volume: 0.65,
    channel: 'module',
  },
  shield: {
    src: shieldSfxUrl,
    offsetSec: 0.18,
    durationSec: 1.25,
    fadeInSec: 0.05,
    fadeOutSec: 0.35,
    volume: 0.55,
    channel: 'module',
  },
  exercise: {
    src: gymSfxUrl,
    offsetSec: 0,
    durationSec: 1.15,
    fadeInSec: 0.02,
    fadeOutSec: 0.2,
    volume: 0.75,
    channel: 'module',
  },
}

let audioCtx: AudioContext | null = null
const audioCache = new Map<string, HTMLAudioElement>()
const decodedBuffers = new Map<string, AudioBuffer>()
const pendingDecodes = new Map<string, Promise<AudioBuffer | null>>()
const channelTokens = new Map<SoundChannel, number>()
const activeStops = new Map<SoundChannel, () => void>()

function playAudioFile(src: string, volume = MASTER_VOLUME): void {
  try {
    if (typeof window === 'undefined' || getSoundMuted()) return

    let base = audioCache.get(src)
    if (!base) {
      base = new Audio(src)
      base.preload = 'auto'
      audioCache.set(src, base)
    }

    const player =
      !base.paused && base.currentTime > 0
        ? (base.cloneNode(true) as HTMLAudioElement)
        : base

    player.volume = Math.max(0, Math.min(1, volume))
    player.currentTime = 0
    void player.play().catch(() => {
      // Otomatik oynatma veya tarayıcı ses kısıtı varsa oyunu engelleme
    })
  } catch {
    // Ses oynatma hatasını sessizce yoksay
  }
}

function getContext(): AudioContext | null {
  if (typeof window === 'undefined' || getSoundMuted()) return null

  const AudioCtor =
    window.AudioContext ||
    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext

  if (!AudioCtor) return null

  if (!audioCtx) {
    audioCtx = new AudioCtor()
  }
  if (audioCtx.state === 'suspended') {
    void audioCtx.resume()
  }
  return audioCtx
}

async function loadAudioBuffer(ctx: AudioContext, src: string): Promise<AudioBuffer | null> {
  const cached = decodedBuffers.get(src)
  if (cached) return cached

  let pending = pendingDecodes.get(src)
  if (!pending) {
    pending = fetch(src)
      .then((res) => (res.ok ? res.arrayBuffer() : Promise.reject(new Error('fetch_failed'))))
      .then((buf) => ctx.decodeAudioData(buf))
      .then((decoded) => {
        decodedBuffers.set(src, decoded)
        return decoded
      })
      .catch(() => null)
      .finally(() => {
        pendingDecodes.delete(src)
      })
    pendingDecodes.set(src, pending)
  }

  return pending
}

function stopChannel(channel: SoundChannel): void {
  channelTokens.set(channel, (channelTokens.get(channel) ?? 0) + 1)
  const stopFn = activeStops.get(channel)
  if (stopFn) {
    activeStops.delete(channel)
    stopFn()
  }
}

function stopAllChannels(): void {
  stopChannel('book')
  stopChannel('module')
  stopChannel('launch')
}

function startBufferedClip(ctx: AudioContext, buffer: AudioBuffer, spec: ClipSpec, token: number): void {
  if (getSoundMuted() || channelTokens.get(spec.channel) !== token || ctx.state === 'closed') {
    return
  }

  const now = ctx.currentTime
  const safeOffset = Math.max(0, Math.min(spec.offsetSec ?? 0, Math.max(0, buffer.duration - 0.05)))
  const remaining = Math.max(0.05, buffer.duration - safeOffset)
  const playDur = Math.min(spec.durationSec ?? remaining, remaining)
  const fadeIn = Math.min(spec.fadeInSec ?? 0.02, playDur * 0.25)
  const fadeOut = Math.min(spec.fadeOutSec ?? 0.2, Math.max(0.02, playDur - fadeIn))
  const peakGain = Math.max(0.001, MASTER_VOLUME * (spec.volume ?? 1))

  const source = ctx.createBufferSource()
  source.buffer = buffer
  source.loop = false

  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.linearRampToValueAtTime(peakGain, now + fadeIn)

  const fadeOutStart = now + playDur - fadeOut
  if (fadeOutStart > now + fadeIn) {
    gain.gain.setValueAtTime(peakGain, fadeOutStart)
  }
  gain.gain.linearRampToValueAtTime(0.0001, now + playDur)

  source.connect(gain)
  gain.connect(ctx.destination)

  let stopped = false
  const stopFn = () => {
    if (stopped) return
    stopped = true
    try {
      const t = ctx.currentTime
      gain.gain.cancelScheduledValues(t)
      gain.gain.setValueAtTime(Math.max(0.0001, gain.gain.value), t)
      gain.gain.linearRampToValueAtTime(0.0001, t + 0.04)
      source.stop(t + 0.05)
    } catch {
      // Zaten durmuş kaynak hatasını yoksay
    }
  }

  activeStops.set(spec.channel, stopFn)
  source.onended = () => {
    stopped = true
    if (channelTokens.get(spec.channel) === token) {
      activeStops.delete(spec.channel)
    }
    source.disconnect()
    gain.disconnect()
  }

  source.start(now, safeOffset, playDur + 0.02)
  source.stop(now + playDur + 0.03)
}

function playAudioClip(spec: ClipSpec): void {
  try {
    const ctx = getContext()
    if (!ctx) return

    stopChannel(spec.channel)
    const token = (channelTokens.get(spec.channel) ?? 0) + 1
    channelTokens.set(spec.channel, token)

    const cached = decodedBuffers.get(spec.src)
    if (cached) {
      startBufferedClip(ctx, cached, spec, token)
      return
    }

    void loadAudioBuffer(ctx, spec.src).then((buffer) => {
      if (!buffer) return
      if (ctx.state === 'suspended') {
        void ctx.resume()
      }
      startBufferedClip(ctx, buffer, spec, token)
    })
  } catch {
    // Ses oynatma hatasını sessizce yoksay
  }
}

/**
 * Oyun modülü ve günlük seslerini arka planda önbelleğe alır.
 */
export function preloadGameSounds(): void {
  try {
    const ctx = getContext()
    if (!ctx) return

    const urls = new Set<string>([
      BOOK_PAGE_CLIP.src,
      LAUNCH_ROCKET_CLIP.src,
      ...Object.values(MODULE_OPEN_CLIPS).map((clip) => clip.src),
    ])
    for (const url of urls) {
      void loadAudioBuffer(ctx, url)
    }
  } catch {
    // Ön yükleme hatalarını sessizce yoksay
  }
}

export function getSoundMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === 'true'
  } catch {
    return false
  }
}

export function setSoundMuted(muted: boolean): void {
  if (muted) {
    stopAllChannels()
    stopHomeAmbient()
  }
  try {
    localStorage.setItem(MUTE_KEY, String(muted))
  } catch {
    // localStorage kapalıysa sessizce yoksay
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('jsa-mute-change'))
  }
}

function playTone(
  freq: number,
  durationSec: number,
  type: OscillatorType = 'triangle',
  level = 0.85,
  delaySec = 0,
): void {
  try {
    const ctx = getContext()
    if (!ctx) return

    const start = ctx.currentTime + delaySec
    const holdUntil = start + Math.max(0.02, durationSec * 0.45)
    const peakGain = Math.min(0.8, MASTER_VOLUME * level)

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = type
    osc.frequency.setValueAtTime(freq, start)

    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(peakGain, start + 0.015)
    gain.gain.setValueAtTime(peakGain, holdUntil)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + durationSec)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(start)
    osc.stop(start + durationSec + 0.02)
  } catch {
    // Tarayıcı ses kısıtı varsa oyunu engelleme
  }
}

export function playClick(): void {
  playAudioFile(clickSfxUrl, 0.55)
}

/** Günlük açılışında ve gün değişiminde tek seferlik sayfa çevirme sesi çalar. */
export function playBookPage(): void {
  playAudioClip(BOOK_PAGE_CLIP)
}

/** Tıklanan modül açıldığında o modüle özel kısa ses efektini çalar. */
export function playModuleOpen(moduleId: ModuleId): void {
  playAudioClip(MODULE_OPEN_CLIPS[moduleId])
}

export function playNextDay(): void {
  playTone(440, 0.09, 'triangle', 0.8, 0)
  playTone(587, 0.12, 'triangle', 0.85, 0.07)
}

export function playUpgrade(): void {
  playTone(523, 0.1, 'triangle', 0.9, 0)
  playTone(659, 0.1, 'triangle', 0.95, 0.08)
  playTone(784, 0.18, 'triangle', 1, 0.16)
  playTone(1046, 0.2, 'sine', 0.6, 0.16)
}

export function playUpgradeComplete(): void {
  playAudioFile(upgradeCompleteSfxUrl, 0.7)
}

export function playAlert(): void {
  playTone(720, 0.12, 'square', 0.45, 0)
  playTone(540, 0.16, 'square', 0.45, 0.14)
}

export function playWin(): void {
  const notes = [523, 659, 784, 1046]
  notes.forEach((n, idx) => {
    playTone(n, 0.22, 'triangle', 0.95, idx * 0.11)
    playTone(n * 1.5, 0.16, 'sine', 0.35, idx * 0.11)
  })
}

export function playLose(): void {
  playTone(330, 0.18, 'triangle', 0.9, 0)
  playTone(262, 0.18, 'triangle', 0.9, 0.16)
  playTone(196, 0.32, 'sine', 0.95, 0.32)
}

/** Başlangıç roket fırlatma animasyonu sırasında roket ses efektini çalar. */
export function playLaunch(): void {
  playAudioClip(LAUNCH_ROCKET_CLIP)
}

/** Başlangıç animasyonu geçildiğinde veya kapandığında roket sesini yumuşakça durdurur. */
export function stopLaunch(): void {
  stopChannel('launch')
}

export function playSignal(): void {
  playTone(880, 0.08, 'sine', 0.65, 0)
  playTone(1318, 0.1, 'sine', 0.7, 0.1)
  playTone(1046, 0.14, 'triangle', 0.75, 0.22)
}

let homeAmbientAudio: HTMLAudioElement | null = null
let homeAmbientActive = false
let detachHomeUnlock: (() => void) | null = null

/**
 * Yalnızca Ana Sayfa açıkken arka planda uzay ambiyansını döngüde çalar.
 * Tarayıcı otomatik oynatmayı engellerse ilk kullanıcı etkileşiminde başlatır.
 */
export function startHomeAmbient(): void {
  if (typeof window === 'undefined' || getSoundMuted()) return

  homeAmbientActive = true

  if (!homeAmbientAudio) {
    homeAmbientAudio = new Audio(spaceAmbientUrl)
    homeAmbientAudio.loop = true
    homeAmbientAudio.preload = 'auto'
  }
  homeAmbientAudio.volume = Math.min(1, MASTER_VOLUME * 0.52)

  const clearUnlock = () => {
    if (detachHomeUnlock) {
      detachHomeUnlock()
      detachHomeUnlock = null
    }
  }

  const attemptPlay = () => {
    if (!homeAmbientActive || !homeAmbientAudio || getSoundMuted()) return
    void homeAmbientAudio
      .play()
      .then(() => {
        if (!homeAmbientActive || getSoundMuted()) {
          homeAmbientAudio?.pause()
          return
        }
        clearUnlock()
      })
      .catch(() => {
        if (!homeAmbientActive || detachHomeUnlock) return
        const unlock = () => {
          attemptPlay()
        }
        window.addEventListener('pointerdown', unlock, { passive: true })
        window.addEventListener('keydown', unlock, { passive: true })
        detachHomeUnlock = () => {
          window.removeEventListener('pointerdown', unlock)
          window.removeEventListener('keydown', unlock)
        }
      })
  }

  attemptPlay()
}

/** Ana sayfadan çıkıldığında arka plan uzay ambiyansını durdurur. */
export function stopHomeAmbient(): void {
  homeAmbientActive = false
  if (detachHomeUnlock) {
    detachHomeUnlock()
    detachHomeUnlock = null
  }
  if (homeAmbientAudio) {
    homeAmbientAudio.pause()
    homeAmbientAudio.currentTime = 0
  }
}
