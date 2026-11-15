import { useLanguage } from '../../context/LanguageContext'
import {
  getLocalizedBuildModules,
  getLocalizedConnectionRules,
  type ModuleId,
} from '../../data/buildModules'

type Props = {
  selected: ModuleId | null
  onSelect: (id: ModuleId) => void
  onPointerStart: (
    id: ModuleId,
    sourceIndex: null,
    x: number,
    y: number,
    pointerId: number,
  ) => void
}

export default function ModuleSelector({ selected, onSelect, onPointerStart }: Props) {
  const { lang, pick } = useLanguage()
  const buildModules = getLocalizedBuildModules(lang)
  const connectionRules = getLocalizedConnectionRules(lang)
  const selectedModule = buildModules.find((module) => module.id === selected)
  const relatedConnections = selected
    ? connectionRules.filter(
        (rule) => rule.moduleId === selected || rule.adjacentTo.includes(selected),
      )
    : []

  return (
    <div className="module-selector" aria-label={pick('Module selection', 'Modül seçimi')}>
      {buildModules.map((module) => (
        <button
          key={module.id}
          type="button"
          className={selected === module.id ? 'selected' : ''}
          aria-pressed={selected === module.id}
          onClick={() => onSelect(module.id)}
          onPointerDown={(event) => {
            if (event.button !== 0) return
            onPointerStart(module.id, null, event.clientX, event.clientY, event.pointerId)
          }}
        >
          <span aria-hidden="true">{module.icon}</span>
          <strong>{module.name}</strong>
        </button>
      ))}
      {selected && (
        <section className="build-module-brief" aria-live="polite">
          <h3>{selectedModule?.name}</h3>
          <p>{selectedModule?.description}</p>
          <p>{selectedModule?.gameRule}</p>
          <div className="selector-connections">
            <strong>{pick('BUILD CONNECTIONS', 'İNŞA BAĞLANTILARI')}</strong>
            {relatedConnections.map((rule) => (
              <details key={rule.id}>
                <summary>{rule.label}</summary>
                <p>{rule.explanation}</p>
              </details>
            ))}
          </div>
          <small>
            {selectedModule?.energyOutput
              ? pick(
                  `Makes ${selectedModule.energyOutput} game energy`,
                  `${selectedModule.energyOutput} oyun enerjisi üretir`,
                )
              : pick(
                  `Uses ${selectedModule?.energyDemand} game energy`,
                  `${selectedModule?.energyDemand} oyun enerjisi kullanır`,
                )}
          </small>
        </section>
      )}
    </div>
  )
}
