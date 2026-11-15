import clickSfxUrl from '../assets/sfx-click.mp3'
import upgradeCompleteSfxUrl from '../assets/sfx-upgrade-complete.wav'

const MUTE_KEY = 'jsa_muted'
// Ses seviyesini tek yerden ayarlamak için (0.1 kısık - 0.6 çok yüksek)
const MASTER_VOLUME = 0.55

let audioCtx: AudioContext | null = null
const audioCache = new Map<string, HTMLAudioElement>()

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

export function getSoundMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === 'true'
  } catch {
    return false
  }
}

export function setSoundMuted(muted: boolean): void {
  try {
    localStorage.setItem(MUTE_KEY, String(muted))
  } catch {
    // localStorage kapalıysa sessizce yoksay
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

export function playLaunch(): void {
  try {
    const ctx = getContext()
    if (!ctx) return

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(110, now)
    osc.frequency.exponentialRampToValueAtTime(340, now + 1.15)

    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(MASTER_VOLUME * 0.3, now + 0.15)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.3)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 1.32)
  } catch {
    // Tarayıcı ses kısıtı varsa oyunu engelleme
  }
  playTone(523, 0.16, 'triangle', 0.7, 2.8)
  playTone(659, 0.22, 'triangle', 0.8, 2.94)
}

export function playSignal(): void {
  playTone(880, 0.08, 'sine', 0.65, 0)
  playTone(1318, 0.1, 'sine', 0.7, 0.1)
  playTone(1046, 0.14, 'triangle', 0.75, 0.22)
}
