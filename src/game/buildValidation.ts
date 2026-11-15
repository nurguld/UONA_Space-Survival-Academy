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
  engineeringNotes: string[];
};

export const BUILD_GRID_SIZE = 4;

const REQUIRED_MODULES: ModuleId[] = [
  "habitat",
  "life-support",
  "solar-array",
  "airlock",
  "radiation-shield"
];
const REQUIRED_HABITAT_CONNECTIONS = new Set([
  "life-support-habitat",
  "airlock-habitat",
  "radiation-habitat"
]);

function isSunlit(grid: GridCell[], index: number) {
  const column = index % BUILD_GRID_SIZE;
  for (let row = 0; row < Math.floor(index / BUILD_GRID_SIZE); row += 1) {
    if (grid[row * BUILD_GRID_SIZE + column] !== null) return false;
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
    const row = Math.floor(index / BUILD_GRID_SIZE);
    const column = index % BUILD_GRID_SIZE;
    const neighbors = [
      row > 0 ? index - BUILD_GRID_SIZE : -1,
      row < BUILD_GRID_SIZE - 1 ? index + BUILD_GRID_SIZE : -1,
      column > 0 ? index - 1 : -1,
      column < BUILD_GRID_SIZE - 1 ? index + 1 : -1
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
  const row = Math.floor(index / BUILD_GRID_SIZE);
  const column = index % BUILD_GRID_SIZE;
  return [
    row > 0 ? index - BUILD_GRID_SIZE : -1,
    row < BUILD_GRID_SIZE - 1 ? index + BUILD_GRID_SIZE : -1,
    column > 0 ? index - 1 : -1,
    column < BUILD_GRID_SIZE - 1 ? index + 1 : -1
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
      const required = REQUIRED_MODULES.includes(rule.moduleId);
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

export function getCriticalPlacementErrors(grid: GridCell[]): string[] {
  const missingModules = REQUIRED_MODULES
    .filter((id) => !grid.includes(id))
    .map((id) => `${getBuildModule(id).name} is required.`);
  const missingHabitatConnections = grid.includes("habitat")
    ? getModuleConnectionChecks(grid)
      .filter((check) => REQUIRED_HABITAT_CONNECTIONS.has(check.id) && check.status === "failed")
      .map((check) => check.detail)
    : [];

  return [...missingModules, ...missingHabitatConnections];
}

export function validateBuild(grid: GridCell[]): ValidationResult {
  const sunlitPanels = grid.reduce(
    (total, cell, index) => total + (cell === "solar-array" && isSunlit(grid, index) ? 1 : 0),
    0
  );
  const energyProduction = sunlitPanels * getBuildModule("solar-array").energyOutput;
  const energyDemand = grid.reduce(
    (total, id) => total + (id ? getBuildModule(id).energyDemand : 0),
    0
  );
  const oxygenProduction = grid.reduce(
    (total, id, index) => total + (id && (id !== "solar-array" || isSunlit(grid, index)) ? getBuildModule(id).oxygenOutput : 0),
    0
  );
  const oxygenDemand = grid.reduce(
    (total, id) => total + (id ? getBuildModule(id).oxygenDemand : 0),
    0
  );

  const { connected, total } = hasHabitatConnection(grid);
  const connectionChecks = getModuleConnectionChecks(grid);
  const networkDisconnected = total > 0 && connected.size !== total;
  const powerDeficit = Math.max(0, energyDemand - energyProduction);
  const oxygenDeficit = Math.max(0, oxygenDemand - oxygenProduction);
  const shadowedPanels = grid.filter((cell) => cell === "solar-array").length - sunlitPanels;
  const failedNonCriticalLinks = connectionChecks.filter(
    (check) => check.status === "failed" && !REQUIRED_HABITAT_CONNECTIONS.has(check.id)
  );
  const disconnectedModules = networkDisconnected ? total - connected.size : 0;
  const score = Math.max(0, Math.min(100,
    80
      + (grid.includes("water-recycler") ? 10 : 0)
      + (grid.includes("greenhouse") ? 10 : 0)
      - Math.min(20, powerDeficit * 5)
      - Math.min(20, oxygenDeficit * 5)
      - Math.min(20, shadowedPanels * 10)
      - Math.min(15, disconnectedModules * 5)
      - Math.min(15, failedNonCriticalLinks.length * 5)
  ));
  const engineeringNotes = [
    ...(powerDeficit > 0 ? ["Add or uncover solar panels to meet power needs."] : []),
    ...(oxygenDeficit > 0 ? ["Connect Life Support to provide enough oxygen."] : []),
    ...(shadowedPanels > 0 ? ["Move shadowed solar panels into clear sunlight."] : []),
    ...(disconnectedModules > 0 ? ["Connect every placed module to the habitat network."] : []),
    ...failedNonCriticalLinks.map((check) => check.detail),
    ...(!grid.includes("water-recycler") ? ["Add Water Recycler for +10 points."] : []),
    ...(!grid.includes("greenhouse") ? ["Add Greenhouse for +10 points."] : [])
  ];
  const success = engineeringNotes.length === 0;
  const messages = [
    `Habitat score: ${score}/100. Power ${energyProduction}/${energyDemand}; oxygen ${oxygenProduction}/${oxygenDemand}.`
  ];

  return {
    success,
    messages,
    score,
    blockingErrors: [],
    connectionChecks,
    engineeringNotes
  };
}
