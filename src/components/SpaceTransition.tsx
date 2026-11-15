import { useLayoutEffect, useRef, useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import './SpaceTransition.css'

type SpaceTransitionProps = {
  transitionKey: string
}

export default function SpaceTransition({ transitionKey }: SpaceTransitionProps) {
  const { pick } = useLanguage()
  const previousKey = useRef<string | null>(null)
  const [visible, setVisible] = useState(false)

  useLayoutEffect(() => {
    if (previousKey.current === null) {
      previousKey.current = transitionKey
      return
    }

    if (previousKey.current === transitionKey) return
    previousKey.current = transitionKey

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const duration = reducedMotion ? 160 : 1100
    setVisible(true)

    const timer = window.setTimeout(() => setVisible(false), duration)
    return () => window.clearTimeout(timer)
  }, [transitionKey])

  if (!visible) return null

  return (
    <div className="space-transition" aria-hidden="true">
      <span className="space-transition-stars" />
      <span className="space-transition-destination" />
      <span className="space-transition-shuttle">🚀</span>
      <span className="space-transition-caption">
        {pick('WARPING TO NEXT MODULE', 'BİR SONRAKİ MODÜLE GEÇİLİYOR')}
      </span>
    </div>
  )
}
