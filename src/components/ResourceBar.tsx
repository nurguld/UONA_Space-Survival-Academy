import type { ResourceId } from '../types'
import { RESOURCE_CONFIG, ResourceIcon } from './ResourceIcon'

interface Props {
  id: ResourceId
  value: number
  delta: number
  lastChange?: number
  animKey?: string
  breakdown?: string
}

export default function ResourceBar({
  id,
  value,
  delta,
  lastChange,
  animKey,
  breakdown,
}: Props) {
  const v = Math.max(0, Math.min(100, value))
  const meta = RESOURCE_CONFIG[id]
  const showLastChange = lastChange !== undefined && lastChange !== 0

  return (
    <div className="rounded-xl border border-white/40 bg-[#09132A]/90 shadow-[0_0_16px_rgba(255,255,255,0.08)] px-3.5 py-2.5 flex flex-col justify-between gap-2">
      <div>
        <div className="flex items-center justify-between gap-1.5 text-xs sm:text-sm font-semibold mb-2">
          <span className="inline-flex items-center gap-1.5 text-slate-100 min-w-0">
            <ResourceIcon id={id} className="w-4 h-4 shrink-0" />
            <span className="truncate">{meta.label}</span>
          </span>

          <div className="flex items-center gap-1.5 shrink-0">
            {showLastChange && (
              <span
                key={animKey}
                aria-label={`Son değişim ${lastChange > 0 ? `+${lastChange}` : lastChange}`}
                className={`delta-badge-anim text-[11px] font-bold px-1.5 py-0.5 rounded tabular-nums ${
                  lastChange > 0
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                    : 'bg-orange-500/20 text-orange-300 border border-orange-400/40'
                }`}
              >
                {lastChange > 0 ? `+${lastChange}` : lastChange}
              </span>
            )}
            <span className="text-slate-200 font-bold tabular-nums">{v}</span>
          </div>
        </div>

        <div
          role="progressbar"
          aria-label={meta.label}
          aria-valuenow={v}
          aria-valuemin={0}
          aria-valuemax={100}
          className="h-2.5 rounded-full bg-[#040917] border border-white/15 overflow-clip"
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${v}%`,
              backgroundColor: meta.color,
              boxShadow: `0 0 10px ${meta.color}`,
            }}
          />
        </div>
      </div>

      <div className="text-[11px] leading-snug">
        <p className={`font-semibold ${delta >= 0 ? 'text-emerald-400' : 'text-orange-400'}`}>
          Günlük net: {delta > 0 ? `+${delta}` : delta}
        </p>
        {breakdown && <p className="text-slate-300/85 mt-0.5">{breakdown}</p>}
      </div>
    </div>
  )
}