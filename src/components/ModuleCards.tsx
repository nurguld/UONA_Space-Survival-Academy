import type { ModuleDef, ModuleId, ModuleLevels, ResourceId } from '../types'
import Button from './Button'
import Card from './Card'

interface ModuleCardsProps {
  modulesDef: ModuleDef[]
  levels: ModuleLevels
  budget: number
  disabled: boolean
  onUpgrade: (moduleId: ModuleId) => void
}

const MODULE_COLORS: Record<ModuleId, string> = {
  solar: 'var(--color-energy)',
  lifeSupport: 'var(--color-oxygen)',
  greenhouse: 'var(--color-food)',
  shield: 'var(--color-radiation)',
  exercise: 'var(--color-health)',
}

const RESOURCE_LABELS: Record<ResourceId, string> = {
  energy: 'Enerji',
  oxygen: 'Oksijen',
  food: 'Gıda',
  radiation: 'Kalkan',
  health: 'Sağlık',
}

export default function ModuleCards({
  modulesDef,
  levels,
  budget,
  disabled,
  onUpgrade,
}: ModuleCardsProps) {
  return (
    <section aria-label="Üs Modülleri">
      <div className="module-grid">
        {modulesDef.map((mod) => {
          const level = levels[mod.id]
          const isMax = level >= mod.maxLevel
          const canAfford = budget >= mod.cost

          return (
            <Card key={mod.id} className="module-card">
              {/* Satır 1: İkon + İsim + Seviye */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div
                    className="w-7 h-7 border-2 border-white/30"
                    style={{ backgroundColor: MODULE_COLORS[mod.id] }}
                  />
                  <span className="font-pixel text-xs px-2 py-0.5 bg-space border-2 border-line text-muted">
                    Sv. {level} / {mod.maxLevel}
                  </span>
                </div>
                <h3 className="font-pixel text-xl leading-tight">{mod.name}</h3>
              </div>

              {/* Satır 2: Açıklama + Günlük Etki Rozetleri */}
              <div className="flex flex-col gap-2">
                <p className="text-sm text-muted leading-snug">{mod.description}</p>
                <div className="flex flex-wrap gap-1.5 mt-auto">
                  {(Object.entries(mod.perDay) as [ResourceId, number][]).map(([resId, val]) => (
                    <span
                      key={resId}
                      className={`font-pixel text-xs px-2 py-0.5 border ${
                        val >= 0
                          ? 'border-food/50 text-food bg-food/10'
                          : 'border-radiation/50 text-radiation bg-radiation/10'
                      }`}
                    >
                      {RESOURCE_LABELS[resId]} {val > 0 ? `+${val}` : val}/gün
                    </span>
                  ))}
                </div>
              </div>

              {/* Satır 3: Yükselt Butonu */}
              <Button
                type="button"
                variant={isMax ? 'ghost' : 'primary'}
                disabled={disabled || isMax || !canAfford}
                onClick={() => onUpgrade(mod.id)}
                className="w-full text-sm px-3"
              >
                {isMax ? 'Maksimum' : `Yükselt · ${mod.cost} puan`}
              </Button>
            </Card>
          )
        })}
      </div>
    </section>
  )
}