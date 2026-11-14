interface Props {
  label: string
  value: number
  color: string
}

export default function ResourceBar({ label, value, color }: Props) {
  const v = Math.max(0, Math.min(100, value))
  return (
    <div className="bg-panel border-[3px] border-line shadow-[0_4px_0_#05070F] px-3 py-2 font-pixel">
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span className="text-muted">{v}</span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={v}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-2.5 bg-space border-2 border-line"
      >
        <div
          className="h-full"
          style={{
            width: `${v}%`,
            background: `repeating-linear-gradient(90deg, ${color} 0 6px, transparent 6px 8px)`,
          }}
        />
      </div>
    </div>
  )
}