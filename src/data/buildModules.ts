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
    explanation: "The Habitat is the crew’s home, and Life Support helps manage cabin air. In this game, the two tiles must touch; real spacecraft layouts do not follow this tile rule.",
    source: ISS_SOURCE,
    sourceUrl: ISS_SOURCE_URL
  },
  {
    id: "airlock-habitat",
    moduleId: "airlock",
    adjacentTo: ["habitat"],
    match: "all",
    label: "Airlock ↔ Habitat",
    explanation: "An airlock is a special doorway for going between the pressurized station and space. Our game puts it next to the Habitat so the crew can reach it.",
    source: ISS_SOURCE,
    sourceUrl: ISS_SOURCE_URL
  },
  {
    id: "radiation-habitat",
    moduleId: "radiation-shield",
    adjacentTo: ["habitat"],
    match: "all",
    label: "Radiation Shelter ↔ Habitat",
    explanation: "Space radiation can be a health risk. The game puts this pretend shelter beside the Habitat for quick access; this is not a real shield design.",
    source: RADIATION_SOURCE,
    sourceUrl: RADIATION_SOURCE_URL
  },
  {
    id: "water-life-support",
    moduleId: "water-recycler",
    adjacentTo: ["life-support"],
    match: "all",
    label: "Water Recycler ↔ Life Support",
    explanation: "Spacecraft can clean and reuse water. In this game, the Water Recycler touches Life Support to show that the systems work together; real systems do not have to use this tile layout.",
    source: ISS_SOURCE,
    sourceUrl: ISS_SOURCE_URL
  },
  {
    id: "greenhouse-habitat-life-support",
    moduleId: "greenhouse",
    adjacentTo: ["habitat", "life-support"],
    match: "any",
    label: "Greenhouse ↔ Habitat or Life Support",
    explanation: "NASA’s Veggie helps researchers grow plants on the space station. Our game places the Greenhouse next to the Habitat or Life Support to show how the systems support the crew.",
    source: VEGGIE_SOURCE,
    sourceUrl: VEGGIE_SOURCE_URL
  },
  {
    id: "solar-habitat-network",
    moduleId: "solar-array",
    adjacentTo: ["habitat", "life-support", "airlock", "radiation-shield", "water-recycler", "greenhouse"],
    match: "any",
    label: "Solar Array ↔ Habitat power network",
    explanation: "Solar arrays make electricity from sunlight. In this game, an array must touch another connected module to show where its power goes; real spacecraft use wiring and power systems.",
    source: ISS_SOURCE,
    sourceUrl: ISS_SOURCE_URL
  }
];

export const BUILD_MODULES = [
  {
    id: "habitat", name: "Habitat", label: "Living quarters", icon: "⌂", energyDemand: 3, energyOutput: 0, oxygenDemand: 2, oxygenOutput: 0,
    description: "The crew’s space home for living, working, and resting.",
    science: "The International Space Station is built from connected modules. Some are pressurized living and working spaces, with systems that help the crew stay safe.",
    source: "NASA — International Space Station",
    sourceUrl: "https://www.nasa.gov/reference/international-space-station/",
    gameRule: "Build at least one home module for your crew. It is the center of this habitat mission.",
    connectionSummary: "Connect Life Support, Airlock, and Radiation Shelter directly to the Habitat."
  },
  {
    id: "life-support", name: "Life Support", label: "Life support", icon: "◉", energyDemand: 4, energyOutput: 0, oxygenDemand: 0, oxygenOutput: 8,
    description: "Helps manage the air and other things astronauts need.",
    science: "Astronauts need breathable air and water. Spacecraft life-support systems help manage the cabin environment so crews can live and work in space.",
    source: "NASA — ISS Research Explorer",
    sourceUrl: "https://www.nasa.gov/mission/station/research-explorer/",
    gameRule: "Consumes power. Connect it directly to the Habitat and provide enough energy from solar arrays.",
    connectionSummary: "Must touch the Habitat. The Water Recycler can also touch Life Support."
  },
  {
    id: "solar-array", name: "Power", label: "Solar array", icon: "☼", energyDemand: 0, energyOutput: 10, oxygenDemand: 0, oxygenOutput: 0,
    description: "Catches sunlight and turns it into electricity.",
    science: "The International Space Station uses large solar arrays to make electricity from sunlight. In this game, a shadow can block a panel; real power depends on many mission conditions.",
    source: "NASA — International Space Station",
    sourceUrl: "https://www.nasa.gov/reference/international-space-station/",
    gameRule: "Each sunlit array produces 10 game energy units. Modules above an array in the same column block light under this simplified game rule.",
    connectionSummary: "Must touch at least one non-solar module in the Habitat network to represent a power connection."
  },
  {
    id: "airlock", name: "Airlock", label: "Airlock", icon: "⇄", energyDemand: 1, energyOutput: 0, oxygenDemand: 1, oxygenOutput: 0,
    description: "A special doorway for astronauts going outside.",
    science: "The space station’s Quest airlock is used for spacewalks. An airlock lets astronauts go outside without opening the whole pressurized station to space.",
    source: "NASA — International Space Station",
    sourceUrl: "https://www.nasa.gov/reference/international-space-station/",
    gameRule: "Place at least one airlock and connect it directly to the Habitat.",
    connectionSummary: "Must touch the Habitat so the crew can access the controlled surface exit."
  },
  {
    id: "radiation-shield", name: "Radiation Shelter", label: "Radiation shelter", icon: "⬡", energyDemand: 1, energyOutput: 0, oxygenDemand: 1, oxygenOutput: 0,
    description: "A pretend safe nook for the crew in this building game.",
    science: "Space radiation can be a health risk, so NASA monitors it during missions. This game tile is only an idea for a protected area; it does not show real shielding or guarantee safety.",
    source: "NASA Space Radiation",
    sourceUrl: "https://www.nasa.gov/directorates/esdmd/hhp/space-radiation/",
    gameRule: "Place at least one shelter module to meet the game objective. Its presence does not guarantee real radiation safety.",
    connectionSummary: "Must touch the Habitat. This is a game layout rule for quick crew access, not NASA guidance."
  },
  {
    id: "water-recycler", name: "Water Recycler", label: "Water recycler", icon: "≈", energyDemand: 2, energyOutput: 0, oxygenDemand: 0, oxygenOutput: 0,
    description: "Cleans used water so the crew can reuse it.",
    science: "The space station has a water recovery system. Cleaning and reusing water helps astronauts make their limited supplies last.",
    source: "NASA — ISS Research Explorer",
    sourceUrl: "https://www.nasa.gov/mission/station/research-explorer/",
    gameRule: "Adds to the mission score and consumes energy. This educational simulation does not model real water-treatment processes.",
    connectionSummary: "If used, must touch Life Support to represent an integrated water-recovery loop."
  },
  {
    id: "greenhouse", name: "Greenhouse", label: "Greenhouse", icon: "✿", energyDemand: 2, energyOutput: 0, oxygenDemand: 0, oxygenOutput: 2,
    description: "A little space garden for growing and studying plants.",
    science: "NASA’s Veggie is a garden on the space station. Researchers use it to learn how plants grow in microgravity, and it can provide fresh food for astronauts.",
    source: "NASA — Veggie",
    sourceUrl: "https://science.nasa.gov/mission/veggie/",
    gameRule: "An optional system that consumes energy. It is not required for this mission, but can expand your habitat design.",
    connectionSummary: "If used, must touch the Habitat or Life Support in this simplified game layout."
  }
] as const;

export function getBuildModule(id: ModuleId) {
  return BUILD_MODULES.find((module) => module.id === id)!;
}
