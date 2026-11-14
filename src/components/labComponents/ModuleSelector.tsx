import { BUILD_MODULES, type ModuleId } from "../../data/buildModules";

type Props = {
  selected: ModuleId | null;
  onSelect: (id: ModuleId) => void;
};

export default function ModuleSelector({ selected, onSelect }: Props) {
  return (
    <div className="module-selector" aria-label="Modül seçimi">
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
          <h3>{BUILD_MODULES.find((module) => module.id === selected)?.name}</h3>
          <p>{BUILD_MODULES.find((module) => module.id === selected)?.description}</p>
          <p><strong>NASA teknolojilerinden esinlenen bilgi:</strong>{" "}
            {BUILD_MODULES.find((module) => module.id === selected)?.science}
          </p>
          <small>
            {BUILD_MODULES.find((module) => module.id === selected)?.energyOutput
              ? `+${BUILD_MODULES.find((module) => module.id === selected)?.energyOutput} enerji üretimi`
              : `${BUILD_MODULES.find((module) => module.id === selected)?.energyDemand} enerji ihtiyacı`}
          </small>
        </section>
      )}
    </div>
  );
}
