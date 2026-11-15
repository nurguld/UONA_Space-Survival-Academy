import type { Language } from '../context/LanguageContext'
import type {
  DifficultyLevel,
  EventLogRecord,
  GameEvent,
  ModuleId,
  ResourceId,
  UpgradeLogItem,
} from '../types'
import dailyFactsTr from '../data/dailyFacts.json'

export const RESOURCE_LABELS: Record<
  ResourceId,
  Record<Language, { label: string; shortLabel: string }>
> = {
  energy: {
    en: { label: 'Energy', shortLabel: 'Energy' },
    tr: { label: 'Enerji', shortLabel: 'Enerji' },
  },
  oxygen: {
    en: { label: 'Oxygen / Water', shortLabel: 'Oxygen' },
    tr: { label: 'Oksijen / Su', shortLabel: 'Oksijen' },
  },
  food: {
    en: { label: 'Food', shortLabel: 'Food' },
    tr: { label: 'Gıda', shortLabel: 'Gıda' },
  },
  radiation: {
    en: { label: 'Shielding', shortLabel: 'Shield' },
    tr: { label: 'Radyasyon Koruması', shortLabel: 'Radyasyon' },
  },
  health: {
    en: { label: 'Crew Health', shortLabel: 'Health' },
    tr: { label: 'Mürettebat Sağlığı', shortLabel: 'Sağlık' },
  },
}

export const MODULE_TEXTS: Record<
  ModuleId,
  Record<Language, { name: string; description: string }>
> = {
  solar: {
    en: {
      name: 'Solar Array',
      description: 'Generates energy (stops during Lunar Night)',
    },
    tr: {
      name: 'Güneş paneli',
      description: 'Enerji üretir (Ay gecesinde durur)',
    },
  },
  lifeSupport: {
    en: {
      name: 'Life Support',
      description: 'Produces oxygen and water, consumes energy',
    },
    tr: {
      name: 'Yaşam destek',
      description: 'Oksijen ve su üretir, enerji harcar',
    },
  },
  greenhouse: {
    en: {
      name: 'Greenhouse',
      description: 'Produces food, consumes energy and water',
    },
    tr: {
      name: 'Sera',
      description: 'Gıda üretir, enerji ve su harcar',
    },
  },
  shield: {
    en: {
      name: 'Radiation Shield',
      description: 'Increases radiation protection',
    },
    tr: {
      name: 'Kalkan',
      description: 'Radyasyon güvenliğini artırır',
    },
  },
  exercise: {
    en: {
      name: 'Exercise Equipment',
      description: 'Maintains crew health in low gravity',
    },
    tr: {
      name: 'Egzersiz ekipmanı',
      description: 'Mürettebat sağlığını korur',
    },
  },
  battery: {
    en: {
      name: 'Battery Bank',
      description: 'Charges in daylight, supplies power during Lunar Night',
    },
    tr: {
      name: 'Batarya',
      description: 'Gündüz şarj olur, Ay gecesi enerji verir',
    },
  },
}

export const DIFFICULTY_TEXTS: Record<
  DifficultyLevel,
  Record<Language, { label: string; summary: string }>
> = {
  easy: {
    en: {
      label: 'Easy',
      summary: '6 starting budget · calmer space weather',
    },
    tr: {
      label: 'Kolay',
      summary: '6 başlangıç puanı · daha sakin uzay koşulları',
    },
  },
  normal: {
    en: {
      label: 'Normal',
      summary: '4 starting budget · balanced lunar base experience',
    },
    tr: {
      label: 'Normal',
      summary: '4 başlangıç puanı · dengeli Ay üssü deneyimi',
    },
  },
  hard: {
    en: {
      label: 'Hard',
      summary: '2 starting budget · more frequent space storms',
    },
    tr: {
      label: 'Zor',
      summary: '2 başlangıç puanı · daha sık uzay fırtınası',
    },
  },
}

export function getModuleName(moduleId: ModuleId, lang: Language): string {
  return MODULE_TEXTS[moduleId]?.[lang].name ?? moduleId
}

export function getModuleDesc(moduleId: ModuleId, lang: Language): string {
  return MODULE_TEXTS[moduleId]?.[lang].description ?? ''
}

export function getResourceLabel(resourceId: ResourceId, lang: Language): string {
  return RESOURCE_LABELS[resourceId][lang].label
}

export function getResourceShortLabel(resourceId: ResourceId, lang: Language): string {
  return RESOURCE_LABELS[resourceId][lang].shortLabel
}

export function formatUpgradeLabel(item: UpgradeLogItem, lang: Language): string {
  const name = getModuleName(item.moduleId, lang)
  const lv = lang === 'en' ? 'Lv.' : 'Sv.'
  return `${name} (${lv} ${item.prevLevel} → ${lv} ${item.targetLevel})`
}

interface TranslatedOption {
  label: string
  badge?: string
  explanation: string
}

interface TranslatedEventData {
  dayLabel?: string
  title: string
  description: string
  options: TranslatedOption[]
}

const EVENT_TRANSLATIONS_EN: Record<string, TranslatedEventData> = {
  'solar-storm': {
    title: 'Solar Storm Approaching',
    description:
      'High-energy solar particles are hitting the base. Your shield level determines how well you stay protected.',
    options: [
      {
        label: 'Move crew into the emergency shelter',
        explanation:
          'Without active shield protection, the crew retreated into the cramped shelter; radiation shielding and health dropped.',
      },
      {
        label: 'Manually wire backup panels to the shelter',
        explanation:
          'The crew reduced radiation exposure with an EVA, but it drained heavy energy and stamina.',
      },
      {
        label: 'Activate protective shield',
        explanation: 'Lv. 2 shielding protected the base but consumed significant energy.',
      },
      {
        label: 'Absorb with advanced magnetic shield',
        explanation: 'Lv. 3 shielding delivered maximum radiation protection with minimal energy cost!',
      },
    ],
  },
  micrometeoroid: {
    title: 'Micrometeoroid Impact',
    description:
      'A tiny space rock struck the outer hull. Pressure sensors are reporting an air leak.',
    options: [
      {
        label: 'Isolate the compartment and conserve reserves',
        explanation:
          'With limited repair capability, the compartment was sealed off and oxygen reserves fell.',
      },
      {
        label: 'Engage emergency pressure repair',
        explanation: 'Lv. 2 life support quickly sealed the leak and stabilized cabin pressure.',
      },
      {
        label: 'Trigger self-sealing hull liner',
        explanation: 'Lv. 3 systems sealed the breach instantly using minimal energy and boosted oxygen.',
      },
    ],
  },
  'lunar-dust': {
    title: 'Lunar Dust (Regolith) Buildup',
    description:
      'Electrostatically charged lunar dust is coating the solar panels and reducing power output.',
    options: [
      {
        label: 'Delay cleaning and ration power',
        explanation: 'Dust-covered panels caused solar energy generation to drop sharply.',
      },
      {
        label: 'Brush panels manually during EVA',
        explanation: 'Some power output was recovered, though the EVA fatigued the astronauts.',
      },
      {
        label: 'Run vibrational panel cleaning',
        explanation: 'Lv. 2 panels shook off the dust automatically without an EVA.',
      },
      {
        label: 'Activate electrostatic dust repeller for full output',
        explanation: 'Lv. 3 solar array repelled dust immediately and stored surplus power.',
      },
    ],
  },
  'water-filter': {
    title: 'Water Recycling Filter Clogged',
    description:
      'The main water filtration loop in Life Support has lost efficiency.',
    options: [
      {
        label: 'Switch to low-flow rationing mode',
        explanation: 'Without a backup line, water and oxygen flow had to be restricted.',
      },
      {
        label: 'Switch to dual-redundant filter line',
        explanation: 'Lv. 2 redundancy kept oxygen production steady.',
      },
      {
        label: 'Run closed-loop high-efficiency purification',
        explanation:
          'Lv. 3 purification produced both clean oxygen and greenhouse water using minimal power.',
      },
    ],
  },
  'greenhouse-blight': {
    title: 'Greenhouse Fungal Risk',
    description:
      'Rising humidity inside the closed hydroponic greenhouse triggered a crop blight.',
    options: [
      {
        label: 'Remove and discard affected crops',
        explanation: 'Unable to isolate compartments at Lv. 1, a large share of the harvest was lost.',
      },
      {
        label: 'Run UV sterilization cycle',
        explanation: 'Lv. 2 UV lamps stopped the fungus and protected the food supply.',
      },
      {
        label: 'Harvest cleanly from isolated biodomes',
        explanation: 'Lv. 3 modular biodomes quarantined the blight and yielded an extra harvest.',
      },
    ],
  },
  'crew-fatigue': {
    title: 'Low-Gravity Crew Fatigue',
    description:
      'Crew members are showing signs of sleep disruption and muscle fatigue in 1/6th gravity.',
    options: [
      {
        label: 'Shorten shifts and distribute extra rations',
        explanation: 'Without advanced fitness gear, rest and extra food helped the crew recover slowly.',
      },
      {
        label: 'Maintain standard shift schedule',
        explanation: 'No resources were spent, but crew health dropped noticeably.',
      },
      {
        label: 'Run guided resistance training session',
        explanation: 'Lv. 1 exercise equipment preserved muscle tone and crew morale.',
      },
      {
        label: 'Launch centrifuge & sleep optimization program',
        explanation: 'Lv. 2 exercise station kept the crew in peak shape and boosted efficiency.',
      },
    ],
  },
  'thermal-drop': {
    title: 'Extreme Cold in Crater Shadow',
    description:
      'Exterior temperatures plunged below -150 °C, putting heavy strain on thermal insulation.',
    options: [
      {
        label: 'Use thermal blankets and strict power rationing',
        explanation: 'Heaters were throttled back and cold stress weighed on crew health.',
      },
      {
        label: 'Distribute stored solar thermal heat',
        explanation: 'Lv. 2 solar thermal routing restored balance with less power drain.',
      },
      {
        label: 'Engage thermal shield insulation',
        explanation: 'Lv. 3 shielding trapped heat inside with zero energy loss.',
      },
    ],
  },
  'supply-beacon': {
    title: 'Orbital Supply Capsule',
    description:
      'An automated cargo capsule landed nearby. Your module capacity determines how much cargo you can recover.',
    options: [
      {
        label: 'Carry only the small emergency crate',
        explanation: 'Basic rover capacity could only haul a small package back to base.',
      },
      {
        label: 'Fully charge the rover and haul the entire payload',
        explanation: 'Lv. 2 solar infrastructure powered a full cargo recovery run.',
      },
      {
        label: 'Install the advanced hydroponic seed module',
        explanation: 'Lv. 3 greenhouse integrated the new seeds into production immediately!',
      },
    ],
  },
  'earth-day-2': {
    dayLabel: 'Day 2 · Message from Earth',
    title: 'Power Production May Fall Short',
    description:
      'Young astronaut, we reviewed the first telemetry from your lunar base. As consumption grows, we should act before power reserves dip. What is your plan?',
    options: [
      {
        label: 'Focus on upgrading the Solar Array',
        badge: 'Recommended',
        explanation:
          'Earth engineering updated panel calibration (+1 budget) and highlighted the Solar Array in your base — build & upgrade it to Lv. 2!',
      },
      {
        label: 'Prepare Battery infrastructure before Lunar Night',
        explanation:
          'Energy storage plan approved (+1 budget) and the Battery station was highlighted.',
      },
    ],
  },
  'earth-day-5': {
    dayLabel: 'Day 5 · Message from Earth',
    title: 'Hydroponic Greenhouse Check-In',
    description:
      'Earth agronomists spotted the first sprouts thriving! Still, without steady oxygen and water, plant growth will slow down.',
    options: [
      {
        label: 'Mix extra nutrient solution for the greenhouse',
        explanation:
          'A bit of water was spent to boost the crops; upgrading the Greenhouse secures permanent food gains.',
      },
      {
        label: 'Activate automated irrigation loop',
        badge: 'Module Bonus',
        explanation: 'Lv. 2 Greenhouse delivered a rich fresh harvest with zero water loss!',
      },
    ],
  },
  'earth-day-9': {
    dayLabel: 'Day 9 · Message from Earth',
    title: 'Low-Gravity Health Check',
    description:
      'Moon gravity is only one-sixth of Earth’s. Astronauts must exercise regularly to protect bone density and muscle strength.',
    options: [
      {
        label: 'Extend crew rest hours',
        explanation:
          'Short-term rest helped, but upgrading Exercise Equipment is key for lasting health.',
      },
      {
        label: 'Start full resistance workout routine',
        badge: 'Module Bonus',
        explanation: 'Lv. 2 Exercise station keeps the astronauts in top mission condition!',
      },
    ],
  },
  'earth-day-14': {
    dayLabel: 'Day 14 · Urgent Alert from Earth',
    title: '14-Day Lunar Night Starts Tomorrow!',
    description:
      'Tomorrow the Sun sets and your solar arrays will produce zero power for 14 Earth days. Today is your last daylight chance to prepare!',
    options: [
      {
        label: 'Dim non-essential lights and focus on batteries',
        badge: 'Recommended',
        explanation:
          'Earth sent an emergency night grant (+1 budget). Remember to build your Battery station before ending the day!',
      },
      {
        label: 'Top off high-capacity battery banks',
        badge: 'Module Bonus',
        explanation: 'Lv. 2 Battery captured maximum power from the final daylight hours!',
      },
    ],
  },
  'earth-day-15': {
    dayLabel: 'Day 15 · Lunar Night Begins',
    title: 'Period of Darkness: Temperature -180 °C',
    description:
      'The Sun has slipped below the horizon! Solar panels remain offline until Day 28. Mission Control stays on radio with you through the night.',
    options: [
      {
        label: 'Prioritize heating and life support',
        explanation: 'Power-saving protocols kept critical life support systems online.',
      },
      {
        label: 'Engage backup Battery power',
        badge: 'Module Bonus',
        explanation: 'Your Battery bank kept the base warm and well-lit through the dark!',
      },
    ],
  },
  'earth-day-21': {
    dayLabel: 'Day 21 · Message from Earth',
    title: 'Midpoint of Lunar Night',
    description:
      'You made it through a full week in total darkness, astronaut! Cosmic radiation outside remains intense. How are your shields holding up?',
    options: [
      {
        label: 'Reinforce inner cabin bulkheads',
        explanation:
          'Crew added temporary lining. Upgrading the Radiation Shield saves precious power.',
      },
      {
        label: 'Optimize armored radiation shielding',
        badge: 'Module Bonus',
        explanation: 'Lv. 2 Radiation Shield keeps the entire crew safely protected!',
      },
    ],
  },
  'earth-day-27': {
    dayLabel: 'Day 27 · Message from Earth',
    title: 'Sunrise Is on the Horizon!',
    description:
      'In just a few days the Sun rises again. Keep your resources balanced in this final stretch to complete the historic 30-day mission!',
    options: [
      {
        label: 'Finish final system checks and push onward',
        explanation:
          'Encouragement from Earth (+1 budget) and high team morale lifted crew health!',
      },
      {
        label: 'Synchronize all modules at peak efficiency',
        badge: 'Module Bonus',
        explanation: 'Strong Life Support carried the lunar base into dawn in great shape!',
      },
    ],
  },
}

export function localizeEvent(event: GameEvent, lang: Language): GameEvent {
  if (lang === 'tr') return event
  const trData = EVENT_TRANSLATIONS_EN[event.id]
  if (!trData) return event

  return {
    ...event,
    dayLabel: trData.dayLabel ?? event.dayLabel,
    title: trData.title,
    description: trData.description,
    options: event.options.map((opt, idx) => {
      const enOpt = trData.options[idx]
      if (!enOpt) return opt
      return {
        ...opt,
        label: enOpt.label,
        badge: enOpt.badge ?? opt.badge,
        explanation: enOpt.explanation,
      }
    }),
  }
}

export function localizeEventLog(record: EventLogRecord, lang: Language): EventLogRecord {
  if (lang === 'tr' || !record.eventId) return record
  const trData = EVENT_TRANSLATIONS_EN[record.eventId]
  if (!trData) return record
  const opt =
    typeof record.optionIndex === 'number' ? trData.options[record.optionIndex] : undefined
  return {
    ...record,
    title: trData.title,
    chosenLabel: opt?.label ?? record.chosenLabel,
    explanation: opt?.explanation ?? record.explanation,
  }
}

const DAILY_FACTS_EN: string[] = [
  'Solar panels generate electricity, but output depends completely on sunlight.',
  'Because the Moon lacks a thick atmosphere, surface temperatures swing from +120 °C in daylight to -180 °C at night.',
  'NASA’s ECLSS system recycles 93–98% of water in space and inspires the Life Support module on lunar bases.',
  'Hydroponic greenhouses grow plants in mineral-rich water solutions instead of heavy soil.',
  'Muscles and bones weaken in low gravity; astronauts aboard the ISS exercise about 2 hours every day.',
  'Because the Moon has no global magnetic field, the Radiation Shield blocks harmful solar particles.',
  'Unlike air and water, food cannot be recycled in space—it must be shipped from Earth or grown in greenhouses.',
  'One lunar day lasts about 29.5 Earth days: roughly half continuous sunlight and half continuous night.',
  'When energy falls below 25, Life Support and Radiation Shielding cannot operate at full capacity.',
  'When oxygen and water drop, not only astronauts suffer—greenhouse crops run dry as well.',
  'Lunar dust (regolith) is ultra-fine and jagged; buildup on panels and joints lowers efficiency.',
  'In a lunar base, every system is interconnected: strengthening one module protects the others.',
  'NASA Artemis missions target the Lunar South Pole because permanently shadowed craters may hold water ice.',
  'Charging Battery Banks before sunset is the key to surviving 14 days of continuous lunar darkness.',
  'During Lunar Night, solar panels stop completely; night power depends on Battery Banks and stored reserves.',
  'Preventing unnecessary energy drain is critical to keep heating and life support running in the dark.',
  'Scientists measure space radiation in millisieverts (mSv); the Moon receives about 2.6× more radiation than the ISS.',
  'Consistent sleep and workouts during long missions protect both muscle health and team morale.',
  'Closed-loop water purifiers can reclaim moisture even from crew sweat and exhaled breath.',
  'During intense solar storms, astronauts shelter inside heavily shielded compartments.',
  'Growing plants absorb carbon dioxide and release oxygen, helping support the base air loop.',
  'Even grain-of-sand micrometeoroids strike spacecraft hulls at thousands of kilometers per hour.',
  'Batteries store surplus daytime solar power chemically and deliver electricity after sunset.',
  'Earning daily budget rewards long-term planning—spending every point at once can leave you exposed.',
  'Moon dust is electrostatically charged, making it cling stubbornly to spacesuits and solar arrays.',
  'Radio signals between Earth and the Moon travel at light speed, taking roughly 1.3 seconds each way.',
  'High-level modules make late-night emergencies much easier to resolve near the end of Lunar Night.',
  'As sunlight returns on Day 29, solar arrays automatically resume clean energy generation.',
  'Keeping every vital resource above 50 as you near Day 30 gives you a strong safety margin.',
  'Completing a 30-day lunar mission means building a base that survives a full lunar day-night cycle!',
]

export function getDailyFact(dayIndex: number, lang: Language): string {
  const list = lang === 'en' ? DAILY_FACTS_EN : (dailyFactsTr as string[])
  const safeIdx = Math.max(0, Math.min(list.length - 1, dayIndex))
  return list[safeIdx] ?? list[0]
}
