import {
  getBuildModule,
  MODULE_CONNECTION_RULES,
  type ModuleId
} from "../data/buildModules";
import type { GridCell } from "../components/labComponents/BuildGrid";

export type ConnectionCheck = {
  id: string;
  label: string;
  status: "pending" | "passed" | "failed" | "optional";
  detail: string;
};

export type ValidationResult = {
  success: boolean;
  messages: string[];
  score: number | null;
  blockingErrors: string[];
  connectionChecks: ConnectionCheck[];
};

const REQUIRED_MODULES: { id: ModuleId; label: string }[] = [
  { id: "habitat", label: "Habitat module is missing." },
  { id: "life-support", label: "Life support system is missing." },
  { id: "solar-array", label: "Solar array is missing." },
  { id: "airlock", label: "Airlock is missing." },
  { id: "radiation-shield", label: "Radiation shelter is missing." }
];

function isSunlit(grid: GridCell[], index: number) {
  const column = index % 5;
  for (let row = 0; row < Math.floor(index / 5); row += 1) {
    if (grid[row * 5 + column] !== null) return false;
  }
  return true;
}

function hasHabitatConnection(grid: GridCell[]) {
  const start = grid.findIndex((cell) => cell === "habitat");
  if (start < 0) return { connected: new Set<number>(), total: grid.filter(Boolean).length };

  const connected = new Set([start]);
  const queue = [start];
  while (queue.length > 0) {
    const index = queue.shift()!;
    const row = Math.floor(index / 5);
    const column = index % 5;
    const neighbors = [
      row > 0 ? index - 5 : -1,
      row < 4 ? index + 5 : -1,
      column > 0 ? index - 1 : -1,
      column < 4 ? index + 1 : -1
    ];

    for (const neighbor of neighbors) {
      if (neighbor >= 0 && grid[neighbor] !== null && !connected.has(neighbor)) {
        connected.add(neighbor);
        queue.push(neighbor);
      }
    }
  }

  return { connected, total: grid.filter(Boolean).length };
}

function getAdjacentCells(grid: GridCell[], index: number) {
  const row = Math.floor(index / 5);
  const column = index % 5;
  return [
    row > 0 ? index - 5 : -1,
    row < 4 ? index + 5 : -1,
    column > 0 ? index - 1 : -1,
    column < 4 ? index + 1 : -1
  ]
    .filter((neighbor) => neighbor >= 0)
    .map((neighbor) => grid[neighbor])
    .filter((id): id is ModuleId => id !== null);
}

export function getModuleConnectionChecks(grid: GridCell[]): ConnectionCheck[] {
  return MODULE_CONNECTION_RULES.map((rule) => {
    const sourceIndices = grid.flatMap((id, index) => id === rule.moduleId ? [index] : []);
    const source = getBuildModule(rule.moduleId);

    if (sourceIndices.length === 0) {
      const required = REQUIRED_MODULES.some(({ id }) => id === rule.moduleId);
      return {
        id: rule.id,
        label: rule.label,
        status: required ? "pending" : "optional",
        detail: required
          ? `Place ${source.name} to check this connection.`
          : `${source.name} is optional and is not part of this build.`
      };
    }

    const disconnectedSource = sourceIndices.find((index) => {
      const adjacent = getAdjacentCells(grid, index);
      return rule.match === "all"
        ? !rule.adjacentTo.every((targetId) => adjacent.includes(targetId))
        : !rule.adjacentTo.some((targetId) => adjacent.includes(targetId));
    });

    if (disconnectedSource === undefined) {
      return {
        id: rule.id,
        label: rule.label,
        status: "passed",
        detail: "Required adjacent system connection is present."
      };
    }

    const adjacent = getAdjacentCells(grid, disconnectedSource);
    const missingTargets = rule.match === "all"
      ? rule.adjacentTo.filter((targetId) => !adjacent.includes(targetId))
      : rule.adjacentTo;
    const targetNames = missingTargets.map((id) => getBuildModule(id).name).join(
      rule.match === "all" ? " and " : ", "
    );

    return {
      id: rule.id,
      label: rule.label,
      status: "failed",
      detail: rule.match === "all"
        ? `Place ${targetNames} directly next to ${source.name}.`
        : `Place ${source.name} next to a module in the habitat system network (${targetNames}).`
    };
  });
}

export function validateBuild(grid: GridCell[]): ValidationResult {
  const blockingErrors = REQUIRED_MODULES
    .filter(({ id }) => !grid.includes(id))
    .map(({ label }) => label);
  const sunlitPanels = grid.reduce(
    (total, cell, index) => total + (cell === "solar-array" && isSunlit(grid, index) ? 1 : 0),
    0
  );
  const energyProduction = sunlitPanels * getBuildModule("solar-array").energyOutput;
  const energyDemand = grid.reduce(
    (total, id) => total + (id ? getBuildModule(id).energyDemand : 0),
    0
  );

  if (grid.includes("solar-array") && sunlitPanels === 0) {
    blockingErrors.push("All solar arrays are in shadow. Move them to a column with a clear path to sunlight.");
  }

  const { connected, total } = hasHabitatConnection(grid);
  const connectionChecks = getModuleConnectionChecks(grid);
  blockingErrors.push(...connectionChecks
    .filter((check) => check.status === "failed")
    .map((check) => check.detail));

  const networkDisconnected = total > 0 && connected.size !== total;
  if (networkDisconnected) {
    blockingErrors.push(`${total - connected.size} placed module(s) are disconnected from the habitat network. Connect every module edge to edge.`);
  }
  if (energyProduction < energyDemand) {
    blockingErrors.push(`Power shortage: the habitat needs ${energyDemand} energy units, but sunlit arrays produce ${energyProduction}.`);
  }

  const uniqueBlockingErrors = [...new Set(blockingErrors)];
  const success = uniqueBlockingErrors.length === 0;
  const score = success
    ? 80 + (grid.includes("water-recycler") ? 10 : 0) + (grid.includes("greenhouse") ? 10 : 0)
    : null;
  const messages = success
    ? [`Habitat is mission-ready. Energy balance: ${energyProduction} generated / ${energyDemand} required.`]
    : uniqueBlockingErrors;

  return {
    success,
    messages,
    score,
    blockingErrors: uniqueBlockingErrors,
    connectionChecks
  };
}
