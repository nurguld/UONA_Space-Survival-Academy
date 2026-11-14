export type ModuleId =
  | "habitat"
  | "life-support"
  | "solar-array"
  | "airlock"
  | "radiation-shield"
  | "water-recycler"
  | "greenhouse";

export type ModuleConnectionRule = {
  id: string;
  moduleId: ModuleId;
  adjacentTo: ModuleId[];
  match: "all" | "any";
  label: string;
  explanation: string;
  source: string;
  sourceUrl: string;
};

const ISS_SOURCE = "NASA — International Space Station";
const ISS_SOURCE_URL = "https://www.nasa.gov/reference/international-space-station/";
const RADIATION_SOURCE = "NASA — Space Radiation";
const RADIATION_SOURCE_URL = "https://www.nasa.gov/directorates/esdmd/hhp/space-radiation/";
const VEGGIE_SOURCE = "NASA — Veggie";
const VEGGIE_SOURCE_URL = "https://science.nasa.gov/mission/veggie/";

export const MODULE_CONNECTION_RULES: ModuleConnectionRule[] = [
  {
    id: "life-support-habitat",
    moduleId: "life-support",
    adjacentTo: ["habitat"],
    match: "all",
    label: "Life Support ↔ Habitat",
    explanation: "The habitat is the crew's pressurized living volume; the life-support system maintains habitable cabin conditions. In this game, edge contact represents their system interface, not a NASA-prescribed physical layout.",
    source: ISS_SOURCE,
    sourceUrl: ISS_SOURCE_URL
  },
  {
    id: "airlock-habitat",
    moduleId: "airlock",
    adjacentTo: ["habitat"],
    match: "all",
    label: "Airlock ↔ Habitat",
    explanation: "An airlock provides a controlled route between a pressurized station and space. NASA describes the ISS Quest airlock as a dedicated spacewalk access point; direct edge contact is the game's simplified layout rule.",
    source: ISS_SOURCE,
    sourceUrl: ISS_SOURCE_URL
  },
  {
    id: "radiation-habitat",
    moduleId: "radiation-shield",
    adjacentTo: ["habitat"],
    match: "all",
    label: "Radiation Shelter ↔ Habitat",
    explanation: "NASA identifies space radiation as a crew health risk. The game places a shelter beside the habitat for quick access; this adjacency is a gameplay assumption, not a NASA engineering prescription.",
    source: RADIATION_SOURCE,
    sourceUrl: RADIATION_SOURCE_URL
  },
  {
    id: "water-life-support",
    moduleId: "water-recycler",
    adjacentTo: ["life-support"],
    match: "all",
    label: "Water Recycler ↔ Life Support",
    explanation: "Water recovery supports long-duration life-support operations. Edge contact represents a simplified resource-system interface; NASA does not require these systems to occupy adjacent tiles.",
    source: ISS_SOURCE,
    sourceUrl: ISS_SOURCE_URL
  },
  {
    id: "greenhouse-habitat-life-support",
    moduleId: "greenhouse",
    adjacentTo: ["habitat", "life-support"],
    match: "all",
    label: "Greenhouse ↔ Habitat + Life Support",
    explanation: "NASA's Veggie experiments grow plants aboard the ISS. The game connects the greenhouse to crew space and life support to represent access to a controlled environment; this exact tile layout is a gameplay simplification.",
    source: VEGGIE_SOURCE,
    sourceUrl: VEGGIE_SOURCE_URL
  },
  {
    id: "solar-habitat-network",
    moduleId: "solar-array",
    adjacentTo: ["habitat", "life-support", "airlock", "radiation-shield", "water-recycler", "greenhouse"],
    match: "any",
    label: "Solar Array ↔ Habitat power network",
    explanation: "NASA describes ISS modules as interconnected through electrical and other service lines. A solar array must touch a non-solar module here to represent that interface; real spacecraft use dedicated wiring and power systems.",
    source: ISS_SOURCE,
    sourceUrl: ISS_SOURCE_URL
  }
];

export const BUILD_MODULES = [
  {
    id: "habitat", name: "Habitat", label: "Living quarters", icon: "⌂", energyDemand: 3, energyOutput: 0,
    description: "A pressurized module where crew members live, work, and rest.",
    science: "The International Space Station is an orbital laboratory assembled from pressurized modules. Living areas depend on power, air, and other support systems to keep the crew safe.",
    source: "NASA — International Space Station",
    sourceUrl: "https://www.nasa.gov/reference/international-space-station/",
    gameRule: "Represents the crew's primary living area. Place at least one to meet the mission objective.",
    connectionSummary: "Connect Life Support, Airlock, and Radiation Shelter directly to the Habitat."
  },
  {
    id: "life-support", name: "Life Support", label: "Life support", icon: "◉", energyDemand: 4, energyOutput: 0,
    description: "Manages cabin air and other conditions the crew needs to stay healthy.",
    science: "NASA studies how spacecraft systems can maintain a safe environment for crews. Air and water management are essential needs for long-duration missions.",
    source: "NASA — ISS Research Explorer",
    sourceUrl: "https://www.nasa.gov/mission/station/research-explorer/",
    gameRule: "Consumes power. Connect it directly to the Habitat and provide enough energy from solar arrays.",
    connectionSummary: "Must touch the Habitat. The Water Recycler can also touch Life Support."
  },
  {
    id: "solar-array", name: "Power", label: "Solar array", icon: "☼", energyDemand: 0, energyOutput: 10,
    description: "Converts sunlight into electrical power for habitat systems.",
    science: "NASA reports that the International Space Station's solar arrays provide electrical power and span a large area. Real output depends on mission and lighting conditions; the tile-shadow rule here is a simplified teaching model.",
    source: "NASA — International Space Station",
    sourceUrl: "https://www.nasa.gov/reference/international-space-station/",
    gameRule: "Each sunlit array produces 10 game energy units. Modules above an array in the same column block light under this simplified game rule.",
    connectionSummary: "Must touch at least one non-solar module in the Habitat network to represent a power connection."
  },
  {
    id: "airlock", name: "Airlock", label: "Airlock", icon: "⇄", energyDemand: 1, energyOutput: 0,
    description: "Provides a controlled passage between the habitat and the lunar surface.",
    science: "The ISS Quest airlock provides a dedicated route for spacewalks. Airlocks allow crew to move outside without opening the entire pressurized habitat to space.",
    source: "NASA — International Space Station",
    sourceUrl: "https://www.nasa.gov/reference/international-space-station/",
    gameRule: "Place at least one airlock and connect it directly to the Habitat.",
    connectionSummary: "Must touch the Habitat so the crew can access the controlled surface exit."
  },
  {
    id: "radiation-shield", name: "Radiation Shelter", label: "Radiation shelter", icon: "⬡", energyDemand: 1, energyOutput: 0,
    description: "Represents a protected area intended to reduce crew exposure to space radiation.",
    science: "NASA identifies space radiation as a significant crew health risk and monitors the radiation environment during missions. This is an educational game module; it does not represent a real shield design or measured protection level.",
    source: "NASA Space Radiation",
    sourceUrl: "https://www.nasa.gov/directorates/esdmd/hhp/space-radiation/",
    gameRule: "Place at least one shelter module to meet the game objective. Its presence does not guarantee real radiation safety.",
    connectionSummary: "Must touch the Habitat. This is a game layout rule for quick crew access, not NASA guidance."
  },
  {
    id: "water-recycler", name: "Water Recycler", label: "Water recycler", icon: "≈", energyDemand: 2, energyOutput: 0,
    description: "Represents a system that recovers and reuses water during a mission.",
    science: "Space station research explores ways to support crews with limited supplies. Recovering and reusing water is important for reducing the amount of consumables needed on long missions.",
    source: "NASA — ISS Research Explorer",
    sourceUrl: "https://www.nasa.gov/mission/station/research-explorer/",
    gameRule: "Adds to the mission score and consumes energy. This educational simulation does not model real water-treatment processes.",
    connectionSummary: "If used, must touch Life Support to represent an integrated water-recovery loop."
  },
  {
    id: "greenhouse", name: "Greenhouse", label: "Greenhouse", icon: "✿", energyDemand: 2, energyOutput: 0,
    description: "A controlled growing space for plants and crop research.",
    science: "NASA's Veggie is a space garden on the ISS used to study plant growth in microgravity. The research also explores fresh food and crew well-being.",
    source: "NASA — Veggie",
    sourceUrl: "https://science.nasa.gov/mission/veggie/",
    gameRule: "An optional system that consumes energy. It is not required for this mission, but can expand your habitat design.",
    connectionSummary: "If used, must touch both Habitat and Life Support in this simplified game layout."
  }
] as const;

export function getBuildModule(id: ModuleId) {
  return BUILD_MODULES.find((module) => module.id === id)!;
}
