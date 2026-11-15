import {
  BUILD_MODULES,
  MODULE_CONNECTION_RULES,
  type ModuleId
} from "../../data/buildModules";

type Props = {
  selected: ModuleId | null;
  onSelect: (id: ModuleId) => void;
  onPointerStart: (
    id: ModuleId,
    sourceIndex: null,
    x: number,
    y: number,
    pointerId: number
  ) => void;
};

export default function ModuleSelector({ selected, onSelect, onPointerStart }: Props) {
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
          onPointerDown={(event) => {
            if (event.button !== 0) return;
            onPointerStart(module.id, null, event.clientX, event.clientY, event.pointerId);
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
            <strong>BUILD CONNECTIONS</strong>
            {relatedConnections.map((rule) => (
              <details key={rule.id}>
                <summary>{rule.label}</summary>
                <p>{rule.explanation}</p>
              </details>
            ))}
          </div>
          <small>
            {selectedModule?.energyOutput
              ? `Makes ${selectedModule.energyOutput} game energy`
              : `Uses ${selectedModule?.energyDemand} game energy`}
          </small>
        </section>
      )}
    </div>
  );
}
