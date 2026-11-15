import type { Language } from '../context/LanguageContext'

export type ModuleId =
  | 'habitat'
  | 'life-support'
  | 'solar-array'
  | 'airlock'
  | 'radiation-shield'
  | 'water-recycler'
  | 'greenhouse'

export type ModuleConnectionRule = {
  id: string
  moduleId: ModuleId
  adjacentTo: ModuleId[]
  match: 'all' | 'any'
  label: string
  explanation: string
  source: string
  sourceUrl: string
}

const ISS_SOURCE = 'NASA — International Space Station'
const ISS_SOURCE_URL = 'https://www.nasa.gov/reference/international-space-station/'
const RADIATION_SOURCE = 'NASA — Space Radiation'
const RADIATION_SOURCE_URL = 'https://www.nasa.gov/directorates/esdmd/hhp/space-radiation/'
const VEGGIE_SOURCE = 'NASA — Veggie'
const VEGGIE_SOURCE_URL = 'https://science.nasa.gov/mission/veggie/'

export const MODULE_CONNECTION_RULES: ModuleConnectionRule[] = [
  {
    id: 'life-support-habitat',
    moduleId: 'life-support',
    adjacentTo: ['habitat'],
    match: 'all',
    label: 'Life Support ↔ Habitat',
    explanation:
      'The Habitat is the crew’s home, and Life Support helps manage cabin air. In this game, the two tiles must touch; real spacecraft layouts do not follow this tile rule.',
    source: ISS_SOURCE,
    sourceUrl: ISS_SOURCE_URL,
  },
  {
    id: 'airlock-habitat',
    moduleId: 'airlock',
    adjacentTo: ['habitat'],
    match: 'all',
    label: 'Airlock ↔ Habitat',
    explanation:
      'An airlock is a special doorway for going between the pressurized station and space. Our game puts it next to the Habitat so the crew can reach it.',
    source: ISS_SOURCE,
    sourceUrl: ISS_SOURCE_URL,
  },
  {
    id: 'radiation-habitat',
    moduleId: 'radiation-shield',
    adjacentTo: ['habitat'],
    match: 'all',
    label: 'Radiation Shelter ↔ Habitat',
    explanation:
      'Space radiation can be a health risk. The game puts this pretend shelter beside the Habitat for quick access; this is not a real shield design.',
    source: RADIATION_SOURCE,
    sourceUrl: RADIATION_SOURCE_URL,
  },
  {
    id: 'water-life-support',
    moduleId: 'water-recycler',
    adjacentTo: ['life-support'],
    match: 'all',
    label: 'Water Recycler ↔ Life Support',
    explanation:
      'Spacecraft can clean and reuse water. In this game, the Water Recycler touches Life Support to show that the systems work together; real systems do not have to use this tile layout.',
    source: ISS_SOURCE,
    sourceUrl: ISS_SOURCE_URL,
  },
  {
    id: 'greenhouse-habitat-life-support',
    moduleId: 'greenhouse',
    adjacentTo: ['habitat', 'life-support'],
    match: 'any',
    label: 'Greenhouse ↔ Habitat or Life Support',
    explanation:
      'NASA’s Veggie helps researchers grow plants on the space station. Our game places the Greenhouse next to the Habitat or Life Support to show how the systems support the crew.',
    source: VEGGIE_SOURCE,
    sourceUrl: VEGGIE_SOURCE_URL,
  },
  {
    id: 'solar-habitat-network',
    moduleId: 'solar-array',
    adjacentTo: [
      'habitat',
      'life-support',
      'airlock',
      'radiation-shield',
      'water-recycler',
      'greenhouse',
    ],
    match: 'any',
    label: 'Solar Array ↔ Habitat power network',
    explanation:
      'Solar arrays make electricity from sunlight. In this game, an array must touch another connected module to show where its power goes; real spacecraft use wiring and power systems.',
    source: ISS_SOURCE,
    sourceUrl: ISS_SOURCE_URL,
  },
]

const CONNECTION_RULES_TR: Record<string, { label: string; explanation: string }> = {
  'life-support-habitat': {
    label: 'Yaşam Desteği ↔ Habitat',
    explanation:
      'Habitat ekibin yaşam alanıdır; Yaşam Desteği ise kabin havasını yönetmeye yardımcı olur. Bu oyunda iki karenin birbirine değmesi gerekir; gerçek uzay araçları bu karo kuralına uymaz.',
  },
  'airlock-habitat': {
    label: 'Hava Kilidi ↔ Habitat',
    explanation:
      'Hava kilidi basınçlı istasyon ile dış uzay arasında geçiş sağlayan özel kapıdır. Oyunumuzda ekibin kolayca ulaşabilmesi için Habitat yanına yerleştirilir.',
  },
  'radiation-habitat': {
    label: 'Radyasyon Sığınağı ↔ Habitat',
    explanation:
      'Uzay radyasyonu sağlık riski oluşturabilir. Bu oyunda hızlı erişim için sığınak Habitat yanına konur; gerçek bir radyasyon kalkanı tasarımı değildir.',
  },
  'water-life-support': {
    label: 'Su Geri Dönüşümü ↔ Yaşam Desteği',
    explanation:
      'Uzay araçları suyu arıtıp yeniden kullanabilir. Bu oyunda iki sistemin birlikte çalıştığını göstermek için Su Geri Dönüşümü Yaşam Desteğine temas eder.',
  },
  'greenhouse-habitat-life-support': {
    label: 'Sera ↔ Habitat veya Yaşam Desteği',
    explanation:
      'NASA’nın Veggie deneyi araştırmacıların uzay istasyonunda bitki yetiştirmesine yardımcı olur. Oyunumuz sistemlerin ekibi nasıl desteklediğini göstermek için Serayı Habitat veya Yaşam Desteğinin yanına yerleştirir.',
  },
  'solar-habitat-network': {
    label: 'Güneş Paneli ↔ Habitat güç ağı',
    explanation:
      'Güneş panelleri gün ışığından elektrik üretir. Bu oyunda bir panel enerjisinin nereye gittiğini göstermek için bağlı başka bir modüle değmelidir; gerçek uzay araçları kablolama ve güç ağları kullanır.',
  },
}

export function getLocalizedConnectionRules(lang: Language): ModuleConnectionRule[] {
  if (lang === 'en') return MODULE_CONNECTION_RULES
  return MODULE_CONNECTION_RULES.map((rule) => {
    const tr = CONNECTION_RULES_TR[rule.id]
    return tr ? { ...rule, label: tr.label, explanation: tr.explanation } : rule
  })
}

export const BUILD_MODULES = [
  {
    id: 'habitat',
    name: 'Habitat',
    label: 'Living quarters',
    icon: '⌂',
    energyDemand: 3,
    energyOutput: 0,
    oxygenDemand: 2,
    oxygenOutput: 0,
    description: 'The crew’s space home for living, working, and resting.',
    science:
      'The International Space Station is built from connected modules. Some are pressurized living and working spaces, with systems that help the crew stay safe.',
    source: 'NASA — International Space Station',
    sourceUrl: 'https://www.nasa.gov/reference/international-space-station/',
    gameRule:
      'Build at least one home module for your crew. It is the center of this habitat mission.',
    connectionSummary:
      'Connect Life Support, Airlock, and Radiation Shelter directly to the Habitat.',
  },
  {
    id: 'life-support',
    name: 'Life Support',
    label: 'Life support',
    icon: '◉',
    energyDemand: 4,
    energyOutput: 0,
    oxygenDemand: 0,
    oxygenOutput: 8,
    description: 'Helps manage the air and other things astronauts need.',
    science:
      'Astronauts need breathable air and water. Spacecraft life-support systems help manage the cabin environment so crews can live and work in space.',
    source: 'NASA — ISS Research Explorer',
    sourceUrl: 'https://www.nasa.gov/mission/station/research-explorer/',
    gameRule:
      'Consumes power. Connect it directly to the Habitat and provide enough energy from solar arrays.',
    connectionSummary:
      'Must touch the Habitat. The Water Recycler can also touch Life Support.',
  },
  {
    id: 'solar-array',
    name: 'Power',
    label: 'Solar array',
    icon: '☼',
    energyDemand: 0,
    energyOutput: 10,
    oxygenDemand: 0,
    oxygenOutput: 0,
    description: 'Catches sunlight and turns it into electricity.',
    science:
      'The International Space Station uses large solar arrays to make electricity from sunlight. In this game, a shadow can block a panel; real power depends on many mission conditions.',
    source: 'NASA — International Space Station',
    sourceUrl: 'https://www.nasa.gov/reference/international-space-station/',
    gameRule:
      'Each sunlit array produces 10 game energy units. Modules above an array in the same column block light under this simplified game rule.',
    connectionSummary:
      'Must touch at least one non-solar module in the Habitat network to represent a power connection.',
  },
  {
    id: 'airlock',
    name: 'Airlock',
    label: 'Airlock',
    icon: '⇄',
    energyDemand: 1,
    energyOutput: 0,
    oxygenDemand: 1,
    oxygenOutput: 0,
    description: 'A special doorway for astronauts going outside.',
    science:
      'The space station’s Quest airlock is used for spacewalks. An airlock lets astronauts go outside without opening the whole pressurized station to space.',
    source: 'NASA — International Space Station',
    sourceUrl: 'https://www.nasa.gov/reference/international-space-station/',
    gameRule: 'Place at least one airlock and connect it directly to the Habitat.',
    connectionSummary:
      'Must touch the Habitat so the crew can access the controlled surface exit.',
  },
  {
    id: 'radiation-shield',
    name: 'Radiation Shelter',
    label: 'Radiation shelter',
    icon: '⬡',
    energyDemand: 1,
    energyOutput: 0,
    oxygenDemand: 1,
    oxygenOutput: 0,
    description: 'A pretend safe nook for the crew in this building game.',
    science:
      'Space radiation can be a health risk, so NASA monitors it during missions. This game tile is only an idea for a protected area; it does not show real shielding or guarantee safety.',
    source: 'NASA Space Radiation',
    sourceUrl: 'https://www.nasa.gov/directorates/esdmd/hhp/space-radiation/',
    gameRule:
      'Place at least one shelter module to meet the game objective. Its presence does not guarantee real radiation safety.',
    connectionSummary:
      'Must touch the Habitat. This is a game layout rule for quick crew access, not NASA guidance.',
  },
  {
    id: 'water-recycler',
    name: 'Water Recycler',
    label: 'Water recycler',
    icon: '≈',
    energyDemand: 2,
    energyOutput: 0,
    oxygenDemand: 0,
    oxygenOutput: 0,
    description: 'Cleans used water so the crew can reuse it.',
    science:
      'The space station has a water recovery system. Cleaning and reusing water helps astronauts make their limited supplies last.',
    source: 'NASA — ISS Research Explorer',
    sourceUrl: 'https://www.nasa.gov/mission/station/research-explorer/',
    gameRule:
      'Adds to the mission score and consumes energy. This educational simulation does not model real water-treatment processes.',
    connectionSummary:
      'If used, must touch Life Support to represent an integrated water-recovery loop.',
  },
  {
    id: 'greenhouse',
    name: 'Greenhouse',
    label: 'Greenhouse',
    icon: '✿',
    energyDemand: 2,
    energyOutput: 0,
    oxygenDemand: 0,
    oxygenOutput: 2,
    description: 'A little space garden for growing and studying plants.',
    science:
      'NASA’s Veggie is a garden on the space station. Researchers use it to learn how plants grow in microgravity, and it can provide fresh food for astronauts.',
    source: 'NASA — Veggie',
    sourceUrl: 'https://science.nasa.gov/mission/veggie/',
    gameRule:
      'An optional system that consumes energy. It is not required for this mission, but can expand your habitat design.',
    connectionSummary:
      'If used, must touch the Habitat or Life Support in this simplified game layout.',
  },
] as const

const BUILD_MODULES_TR: Record<
  ModuleId,
  {
    name: string
    label: string
    description: string
    science: string
    gameRule: string
    connectionSummary: string
  }
> = {
  habitat: {
    name: 'Habitat',
    label: 'Yaşam bölümü',
    description: 'Ekibin yaşaması, çalışması ve dinlenmesi için uzay evi.',
    science:
      'Uluslararası Uzay İstasyonu birbirine bağlı modüllerden oluşur. Bazıları ekibin güvende kalmasına yardımcı olan sistemlere sahip basınçlı yaşam ve çalışma alanlarıdır.',
    gameRule:
      'Ekibin için en az bir yaşam modülü kur. Bu habitat görevinin ana merkezidir.',
    connectionSummary:
      'Yaşam Desteği, Hava Kilidi ve Radyasyon Sığınağını doğrudan Habitata bağla.',
  },
  'life-support': {
    name: 'Yaşam Desteği',
    label: 'Yaşam desteği',
    description: 'Havayı ve astronotların ihtiyaç duyduğu temel sistemleri yönetir.',
    science:
      'Astronotlar solunabilir havaya ve suya ihtiyaç duyar. Yaşam destek sistemleri ekibin uzayda yaşayıp çalışabilmesi için kabin ortamını düzenler.',
    gameRule:
      'Enerji tüketir. Doğrudan Habitata bağla ve güneş panellerinden yeterli enerji sağla.',
    connectionSummary:
      'Habitata temas etmelidir. Su Geri Dönüşümü de Yaşam Desteğine bağlanabilir.',
  },
  'solar-array': {
    name: 'Güç',
    label: 'Güneş paneli',
    description: 'Güneş ışığını yakalar ve elektriğe dönüştürür.',
    science:
      'Uluslararası Uzay İstasyonu gün ışığından elektrik üretmek için büyük güneş panelleri kullanır. Bu oyunda gölge bir paneli engelleyebilir; gerçek güç birçok görev koşuluna bağlıdır.',
    gameRule:
      'Güneş alan her panel 10 oyun enerji birimi üretir. Aynı sütunda panelin üzerindeki modüller bu basitleştirilmiş kuralda ışığı engeller.',
    connectionSummary:
      'Güç bağlantısını göstermek için Habitat ağındaki güneş paneli olmayan en az bir modüle temas etmelidir.',
  },
  airlock: {
    name: 'Hava Kilidi',
    label: 'Hava kilidi',
    description: 'Astronotların dışarı çıkması için özel geçiş kapısı.',
    science:
      'İstasyonun Quest hava kilidi uzay yürüyüşleri için kullanılır. Hava kilidi, tüm istasyonun basıncını düşürmeden dışarı çıkış sağlar.',
    gameRule: 'En az bir hava kilidi yerleştir ve doğrudan Habitata bağla.',
    connectionSummary:
      'Ekibin kontrollü yüzey çıkışına ulaşabilmesi için Habitata temas etmelidir.',
  },
  'radiation-shield': {
    name: 'Radyasyon Sığınağı',
    label: 'Radyasyon sığınağı',
    description: 'Bu inşa oyununda ekip için güvenli sığınma bölmesi.',
    science:
      'Uzay radyasyonu sağlık riski oluşturabilir; bu yüzden NASA görevlerde radyasyonu izler. Bu oyun karosu korumalı alan fikrini temsil eder; gerçek zırh tasarımını göstermez.',
    gameRule:
      'Görev hedefini tamamlamak için en az bir sığınak yerleştir. Varlığı gerçek radyasyon güvenliğini garanti etmez.',
    connectionSummary:
      'Hızlı ekip erişimi için Habitata temas etmelidir; bu bir oyun yerleşim kuralıdır.',
  },
  'water-recycler': {
    name: 'Su Geri Dönüşümü',
    label: 'Su arıtma',
    description: 'Kullanılmış suyu temizleyerek ekibin tekrar kullanmasını sağlar.',
    science:
      'Uzay istasyonunda su geri kazanım sistemi bulunur. Suyun arıtılıp yeniden kullanılması sınırlı kaynakların daha uzun süre yetmesine yardımcı olur.',
    gameRule:
      'Görev puanına katkı sağlar ve enerji tüketir. Bu eğitici simülasyon gerçek su arıtma süreçlerini modellemez.',
    connectionSummary:
      'Kullanıldığında entegre su geri dönüşüm döngüsünü göstermek için Yaşam Desteğine temas etmelidir.',
  },
  greenhouse: {
    name: 'Sera',
    label: 'Sera',
    description: 'Bitki yetiştirmek ve incelemek için küçük uzay bahçesi.',
    science:
      'NASA’nın Veggie projesi uzay istasyonundaki bir bitki bahçesidir. Araştırmacılar mikro yerçekiminde bitki büyümesini inceler ve taze gıda sağlar.',
    gameRule:
      'Enerji tüketen isteğe bağlı bir sistemdir. Zorunlu değildir ancak habitat tasarımını zenginleştirir.',
    connectionSummary:
      'Kullanıldığında bu basitleştirilmiş düzende Habitata veya Yaşam Desteğine temas etmelidir.',
  },
}

export function getBuildModule(id: ModuleId, lang: Language = 'en') {
  const base = BUILD_MODULES.find((module) => module.id === id)!
  if (lang === 'en') return base
  const tr = BUILD_MODULES_TR[id]
  return {
    ...base,
    name: tr.name,
    label: tr.label,
    description: tr.description,
    science: tr.science,
    gameRule: tr.gameRule,
    connectionSummary: tr.connectionSummary,
  }
}

export function getLocalizedBuildModules(lang: Language) {
  return BUILD_MODULES.map((m) => getBuildModule(m.id, lang))
}
