import { getBuildModule, type ModuleId } from "../data/buildModules";
import type { GridCell } from "../components/labComponents/BuildGrid";

export type ValidationResult = {
  success: boolean;
  messages: string[];
  score: number;
};

const REQUIRED_MODULES: { id: ModuleId; label: string; points: number }[] = [
  { id: "habitat", label: "Habitat modülü eksik.", points: 20 },
  { id: "life-support", label: "Yaşam destek sistemi eksik.", points: 20 },
  { id: "solar-array", label: "Güneş paneli eksik.", points: 15 },
  { id: "airlock", label: "Airlock / hava kilidi eksik.", points: 15 },
  { id: "radiation-shield", label: "Radyasyon koruması eksik.", points: 15 }
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

export function validateBuild(grid: GridCell[]): ValidationResult {
  const messages = REQUIRED_MODULES
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
    messages.push("Güneş panelleri gölgede; üzerlerindeki modülleri taşı.");
  }

  const { connected, total } = hasHabitatConnection(grid);
  if (total > 0 && connected.size !== total) {
    messages.push(`${total - connected.size} modül habitat sistemine bağlı değil. Modülleri kenar kenara yerleştir.`);
  }
  if (energyProduction < energyDemand) {
    messages.push(`Enerji yetersiz: ${energyProduction} üretim / ${energyDemand} ihtiyaç.`);
  }

  const missingPoints = REQUIRED_MODULES
    .filter(({ id }) => !grid.includes(id))
    .reduce((totalPoints, { points }) => totalPoints + points, 0);
  const score = Math.max(0, 100 - missingPoints
    - (grid.includes("solar-array") && sunlitPanels === 0 ? 10 : 0)
    - (total > 0 && connected.size !== total ? 10 : 0)
    - (energyProduction < energyDemand ? 10 : 0));
  const success = messages.length === 0;

  if (success) messages.push(`Üs göreve hazır. Enerji dengesi: ${energyProduction} üretim / ${energyDemand} ihtiyaç.`);

  return { success, messages, score };
}
