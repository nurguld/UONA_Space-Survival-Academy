import {
  BUILD_MODULES,
  MODULE_CONNECTION_RULES,
  type ModuleId
} from "../../data/buildModules";

type Props = {
  selected: ModuleId | null;
  onSelect: (id: ModuleId) => void;
};

export default function ModuleSelector({ selected, onSelect }: Props) {
  const selectedModule = BUILD_MODULES.find((module) => module.id === selected);
  const relatedConnections = selected
    ? MODULE_CONNECTION_RULES.filter(
        (rule) => rule.moduleId === selected || rule.adjacentTo.includes(selected)
      )
    : [];

  return (
    <div className="module-selector" aria-label="Module selection">
      {BUILD_MODULES.map((module) => (
        <button
          key={module.id}
          type="button"
          className={selected === module.id ? "selected" : ""}
          aria-pressed={selected === module.id}
          onClick={() => onSelect(module.id)}
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
            <strong>REQUIRED CONNECTIONS</strong>
            {relatedConnections.map((rule) => (
              <details key={rule.id}>
                <summary>{rule.label}</summary>
                <p>{rule.explanation}</p>
                <a href={rule.sourceUrl} target="_blank" rel="noreferrer">
                  {rule.source} ↗
                </a>
              </details>
            ))}
          </div>
          <a href={selectedModule?.sourceUrl} target="_blank" rel="noreferrer">
            {selectedModule?.source} ↗
          </a>
          <small>
            {selectedModule?.energyOutput
              ? `+${selectedModule.energyOutput} energy output`
              : `${selectedModule?.energyDemand} energy demand`}
          </small>
        </section>
      )}
    </div>
  );
}
