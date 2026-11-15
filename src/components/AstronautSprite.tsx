import type { RefObject } from 'react'
import legLeftImg from '../assets/sprite-astro-leg-left.png'
import legRightImg from '../assets/sprite-astro-leg-right.png'
import torsoImg from '../assets/sprite-astro-torso.png'

interface AstronautSpriteProps {
  className?: string
  walking?: boolean
  night?: boolean
  frontLegRef?: RefObject<SVGGElement | null>
  backLegRef?: RefObject<SVGGElement | null>
}

/**
 * Orijinal `sprite-astronaut.png` çizimini koruyarak bacakları kalça ekseninden
 * bağımsız hareket ettiren katmanlı astronot bileşeni.
 */
export default function AstronautSprite({
  className = '',
  walking = false,
  night = false,
  frontLegRef,
  backLegRef,
}: AstronautSpriteProps) {
  return (
    <svg
      viewBox="0 0 177 260"
      aria-hidden="true"
      className={`overflow-visible ${night ? 'brightness-85' : ''} ${className}`}
    >
      {/* Arka (sol) bacak */}
      <g ref={backLegRef} className={walking ? 'astro-leg-back' : undefined}>
        <image href={legLeftImg} x="0" y="0" width="177" height="260" />
      </g>

      {/* Ön (sağ) bacak */}
      <g ref={frontLegRef} className={walking ? 'astro-leg-front' : undefined}>
        <image href={legRightImg} x="0" y="0" width="177" height="260" />
      </g>

      {/* Üst gövde, kask, el ve bel kemeri */}
      <image href={torsoImg} x="0" y="0" width="177" height="260" />
    </svg>
  )
}
