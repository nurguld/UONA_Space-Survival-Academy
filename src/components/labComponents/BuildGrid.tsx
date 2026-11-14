import { getBuildModule, type ModuleId } from "../../data/buildModules";

export type GridCell = ModuleId | null;

type Props = {
  grid: GridCell[];
  onPlace: (index: number) => void;
  movingIndex?: number | null;
};

export default function BuildGrid({ grid, onPlace, movingIndex = null }: Props) {
  return (
    <div className="build-grid" role="grid" aria-label="5 by 5 habitat build area">
      {grid.map((cell, index) => {
        const module = cell ? getBuildModule(cell) : null;
        const row = Math.floor(index / 5) + 1;
        const column = (index % 5) + 1;
        const solarIsSunlit = cell === "solar-array"
          && !Array.from({ length: row - 1 }, (_, previousRow) => grid[previousRow * 5 + column - 1])
            .some((item) => item !== null);

        return (
          <button
            key={index}
            type="button"
            className={`grid-cell${module ? " occupied" : ""}${solarIsSunlit ? " sunlit" : ""}${cell === "solar-array" && !solarIsSunlit ? " shadowed" : ""}${movingIndex === index ? " moving" : ""}`}
            role="gridcell"
            aria-label={`Row ${row}, column ${column}${module ? `, ${module.name}` : ", empty"}`}
            title={module ? `${module.name}${cell === "solar-array" ? solarIsSunlit ? " · In sunlight" : " · In shadow" : ""}` : `Position ${index + 1}`}
            onClick={() => onPlace(index)}
          >
            {module ? (
              <>
                <span aria-hidden="true">{module.icon}</span>
                <span className="grid-module-label">{module.label}</span>
                {cell === "solar-array" && <span className="solar-status" aria-hidden="true">{solarIsSunlit ? "☀" : "◌"}</span>}
              </>
            ) : (
              <span className="grid-cell-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
            )}
            {movingIndex === index && <span className="moving-label">MOVING</span>}
          </button>
        );
      })}
    </div>
  );
}
