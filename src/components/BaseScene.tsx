import type { ReactNode } from 'react'
import type { ModuleDef, ModuleId, ModuleLevels } from '../types'
import { isLunarNight } from '../game/engine'

interface BaseSceneProps {
  day: number
  maxDays: number
  lunarNightStartDay: number
  modules: ModuleLevels
  modulesDef: ModuleDef[]
  budget: number
  disabled: boolean
  onSelectModule: (moduleId: ModuleId) => void
}

interface SlotProps {
  label: string
  level: number
  def?: ModuleDef
  budget: number
  disabled: boolean
  onClick: () => void
  children: ReactNode
}

function SceneModuleSlot({
  label,
  level,
  def,
  budget,
  disabled,
  onClick,
  children,
}: SlotProps) {
  const isMax = def ? level >= def.maxLevel : false
  const canAfford = def ? budget >= def.cost : false

  let arrowText = '↑ Kur'
  if (isMax) {
    arrowText = 'MAX'
  } else if (level > 0) {
    arrowText = `↑ ${def?.cost ?? 0}p`
  } else if (def) {
    arrowText = `↑ Kur · ${def.cost}p`
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="group relative flex flex-col items-center cursor-pointer disabled:cursor-default focus:outline-none"
    >
      {/* Hover / Focus Yükseltme Oku */}
      <span
        className={`mb-1 px-2 py-0.5 font-pixel text-xs border-2 shadow-[0_2px_0_#05070F] transition-all opacity-80 sm:opacity-0 sm:translate-y-1 sm:group-hover:opacity-100 sm:group-hover:translate-y-0 sm:group-focus-visible:opacity-100 sm:group-focus-visible:translate-y-0 ${
          isMax
            ? 'bg-panel border-line text-muted'
            : canAfford
              ? 'bg-accent border-space text-space font-bold'
              : 'bg-panel border-radiation/70 text-radiation'
        }`}
      >
        {arrowText}
      </span>

      <span className="font-pixel text-xs bg-panel border-2 border-line group-hover:border-accent group-focus-visible:border-accent px-2 py-0.5 mb-2 transition-colors">
        {label} · Sv.{level}
      </span>

      <div className="transition-transform group-hover:-translate-y-0.5">{children}</div>
    </button>
  )
}

export default function BaseScene({
  day,
  maxDays,
  lunarNightStartDay,
  modules,
  modulesDef,
  budget,
  disabled,
  onSelectModule,
}: BaseSceneProps) {
  const night = isLunarNight(day)
  const daysUntilNight = lunarNightStartDay - day
  const getDef = (id: ModuleId) => modulesDef.find((m) => m.id === id)

  let statusText = 'Ay Gündüzü · Güneş panelleri aktif'
  let statusBorder = 'border-energy/60 text-energy'

  if (night) {
    statusText = 'Ay Gecesi · Güneş panelleri kapalı!'
    statusBorder = 'border-radiation text-radiation'
  } else if (daysUntilNight > 0 && daysUntilNight <= 4) {
    statusText = `Uyarı: Ay gecesi ${daysUntilNight} gün içinde`
    statusBorder = 'border-radiation text-radiation'
  }

  return (
    <section
      aria-label="Ay Üssü Sahnesi"
      className={`relative border-[3px] border-line shadow-[0_6px_0_#05070F] overflow-clip transition-colors ${
        night ? 'bg-[#060914]' : 'bg-[#0D1530]'
      }`}
    >
      {/* Üst Bilgi Şeridi */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="bg-energy text-space font-pixel font-bold px-4 py-2 border-[3px] border-space shadow-[0_3px_0_#05070F] text-lg">
          Gün {day} / {maxDays}
        </div>

        <div
          className={`bg-panel/95 font-pixel text-sm px-4 py-2 border-[3px] shadow-[0_3px_0_#05070F] ${statusBorder}`}
        >
          {statusText}
        </div>
      </div>

      {/* Gökyüzü ve Ay Yüzeyi */}
      <div className="relative h-64 sm:h-72 flex flex-col justify-end px-4 sm:px-8 pb-6">
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none opacity-80"
          style={{
            backgroundImage:
              'radial-gradient(2px 2px at 12% 24%, #ffffff, transparent), radial-gradient(2px 2px at 28% 55%, #9AA6C7, transparent), radial-gradient(2px 2px at 46% 18%, #ffffff, transparent), radial-gradient(2px 2px at 64% 40%, #38BDF8, transparent), radial-gradient(2px 2px at 78% 22%, #ffffff, transparent), radial-gradient(2px 2px at 90% 52%, #FBBF24, transparent)',
          }}
        />

        {/* Dünya / Güneş */}
        <div aria-hidden="true" className="absolute right-8 top-4 flex items-center gap-4">
          {!night && (
            <div className="w-8 h-8 bg-energy border-2 border-yellow-200 shadow-[0_0_16px_rgba(251,191,36,0.65)]" />
          )}
          <div className="w-11 h-11 bg-[#2563EB] border-[3px] border-[#60A5FA] relative">
            <div className="w-4 h-3 bg-[#4ADE80] absolute top-1 left-1" />
            <div className="w-3 h-3 bg-[#4ADE80] absolute bottom-1 right-1" />
          </div>
        </div>

        {/* Tıklanabilir Modüller Satırı */}
        <div className="relative z-10 flex flex-wrap items-end justify-around gap-4">
          <SceneModuleSlot
            label="Güneş"
            level={modules.solar}
            def={getDef('solar')}
            budget={budget}
            disabled={disabled}
            onClick={() => onSelectModule('solar')}
          >
            <div className="flex items-end gap-1">
              {Array.from({ length: modules.solar }).map((_, idx) => (
                <div
                  key={idx}
                  className={`w-7 h-10 border-2 ${
                    night
                      ? 'bg-slate-800 border-slate-600 opacity-50'
                      : 'bg-blue-900 border-energy'
                  }`}
                />
              ))}
            </div>
          </SceneModuleSlot>

          <SceneModuleSlot
            label="Yaşam destek"
            level={modules.lifeSupport}
            def={getDef('lifeSupport')}
            budget={budget}
            disabled={disabled}
            onClick={() => onSelectModule('lifeSupport')}
          >
            <div className="relative w-24 h-14 bg-oxygen/20 border-[3px] border-oxygen rounded-t-full flex items-end justify-center pb-1">
              <div className="w-4 h-6 bg-panel border-2 border-oxygen" />
            </div>
          </SceneModuleSlot>

          {/* Pixel Astronot */}
          <div aria-hidden="true" className="flex flex-col items-center mb-0.5">
            <div className="w-4 h-4 bg-white border-2 border-line" />
            <div className="w-5 h-5 bg-slate-200 border-2 border-line" />
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-slate-400" />
              <div className="w-2 h-2 bg-slate-400" />
            </div>
          </div>

          <SceneModuleSlot
            label="Sera"
            level={modules.greenhouse}
            def={getDef('greenhouse')}
            budget={budget}
            disabled={disabled}
            onClick={() => onSelectModule('greenhouse')}
          >
            <div className="relative w-24 h-14 bg-food/20 border-[3px] border-food rounded-t-full flex items-end justify-around px-3 pb-1">
              <div className="w-2 h-5 bg-food" />
              <div className="w-2 h-7 bg-food" />
              <div className="w-2 h-4 bg-food" />
            </div>
          </SceneModuleSlot>

          <SceneModuleSlot
            label="Kalkan"
            level={modules.shield}
            def={getDef('shield')}
            budget={budget}
            disabled={disabled}
            onClick={() => onSelectModule('shield')}
          >
            <div
              className={`w-10 h-14 border-[3px] flex items-center justify-center ${
                modules.shield >= 2
                  ? 'bg-radiation/25 border-radiation shadow-[0_0_14px_rgba(251,146,60,0.45)]'
                  : 'bg-slate-700/40 border-slate-500'
              }`}
            >
              <div className="w-3 h-8 bg-radiation/80" />
            </div>
          </SceneModuleSlot>

          <SceneModuleSlot
            label="Egzersiz"
            level={modules.exercise}
            def={getDef('exercise')}
            budget={budget}
            disabled={disabled}
            onClick={() => onSelectModule('exercise')}
          >
            {modules.exercise > 0 ? (
              <div className="w-14 h-11 bg-health/20 border-[3px] border-health flex items-center justify-center">
                <div className="w-6 h-2 bg-health" />
              </div>
            ) : (
              <div className="w-14 h-11 border-2 border-dashed border-health/60 bg-health/5 flex items-center justify-center font-pixel text-xs text-health">
                + Kur
              </div>
            )}
          </SceneModuleSlot>
        </div>

        {/* Ay Regolit Zemini */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-7 bg-[#2A324B] border-t-[3px] border-[#4B5882]"
        />
      </div>
    </section>
  )
}