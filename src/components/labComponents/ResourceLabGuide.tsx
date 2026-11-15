import { useEffect, useState } from 'react'
import {
  Check,
  Droplets,
  Fan,
  Leaf,
  Lightbulb,
  Play,
  RotateCw,
  Sun,
  Waves,
  Wind,
  Zap,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useLanguage, type Language } from '../../context/LanguageContext'
import './ResourceLabGuide.css'

type StationId = 'water' | 'power' | 'air' | 'garden'

type Station = {
  id: StationId
  title: Record<Language, string>
  shortTitle: Record<Language, string>
  color: string
  icon: LucideIcon
}

const STATIONS: Station[] = [
  {
    id: 'water',
    title: { en: 'Water Recycler', tr: 'Su Geri Dönüşümü' },
    shortTitle: { en: 'WATER', tr: 'SU' },
    color: 'cyan',
    icon: Droplets,
  },
  {
    id: 'power',
    title: { en: 'Sun Power', tr: 'Güneş Enerjisi' },
    shortTitle: { en: 'POWER', tr: 'GÜÇ' },
    color: 'yellow',
    icon: Sun,
  },
  {
    id: 'air',
    title: { en: 'Fresh Air', tr: 'Temiz Hava' },
    shortTitle: { en: 'AIR', tr: 'HAVA' },
    color: 'green',
    icon: Fan,
  },
  {
    id: 'garden',
    title: { en: 'Space Garden', tr: 'Uzay Bahçesi' },
    shortTitle: { en: 'GARDEN', tr: 'BAHÇE' },
    color: 'purple',
    icon: Leaf,
  },
]

const STATION_CONTROLS = [
  {
    id: 'garden',
    label: { en: 'GARDEN STATION CONTROL', tr: 'BAHÇE İSTASYONU KONTROLÜ' },
    icon: Leaf,
    color: 'garden',
  },
  {
    id: 'air',
    label: { en: 'AIR QUALITY SYSTEM', tr: 'HAVA KALİTESİ SİSTEMİ' },
    icon: Wind,
    color: 'air',
  },
  {
    id: 'power',
    label: { en: 'POWER GRID CONTROL', tr: 'GÜÇ ŞEBEKESİ KONTROLÜ' },
    icon: Sun,
    color: 'power',
  },
  {
    id: 'water',
    label: { en: 'ORBITAL SUPPLY FEED', tr: 'YÖRÜNGE İKMAL HATTI' },
    icon: Waves,
    color: 'supply',
  },
] as const

type ResourceLabGuideProps = {
  onStartSimulation: () => void
  baseLevel: number
}

function RobotGuide() {
  const { pick } = useLanguage()
  return (
    <svg
      className="resource-robot-art"
      viewBox="0 0 100 110"
      role="img"
      aria-label={pick('Friendly robot guide', 'Dost canlısı robot rehber')}
    >
      <ellipse cx="50" cy="103" rx="31" ry="5" fill="#071328" opacity=".55" />
      <path d="M50 10v10" stroke="#80f3ff" strokeWidth="5" strokeLinecap="round" />
      <circle cx="50" cy="8" r="5" fill="#ffe36e" />
      <rect x="22" y="22" width="56" height="48" rx="17" fill="#d9fbff" stroke="#69d7ed" strokeWidth="4" />
      <rect x="30" y="32" width="40" height="25" rx="11" fill="#11264c" />
      <ellipse cx="41" cy="44" rx="4" ry="5" fill="#74f6ff" />
      <ellipse cx="59" cy="44" rx="4" ry="5" fill="#74f6ff" />
      <path d="M42 53q8 6 16 0" fill="none" stroke="#74f6ff" strokeWidth="2.5" strokeLinecap="round" />
      <path
        d="M22 39H12v15h10m56-15h10v15H78"
        fill="#a5eaf7"
        stroke="#69d7ed"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <rect x="31" y="69" width="38" height="27" rx="10" fill="#67dced" stroke="#a9f6ff" strokeWidth="3" />
      <rect x="42" y="77" width="16" height="10" rx="4" fill="#12305a" />
      <circle cx="50" cy="82" r="3" fill="#ffe36e" />
      <path d="M36 95l-5 7m33-7 5 7" stroke="#d9fbff" strokeWidth="6" strokeLinecap="round" />
    </svg>
  )
}

export default function ResourceLabGuide({ onStartSimulation, baseLevel }: ResourceLabGuideProps) {
  const { lang, pick } = useLanguage()
  const [selectedId, setSelectedId] = useState<StationId | null>(null)
  const [completed, setCompleted] = useState<StationId[]>([])
  const [robotMessage, setRobotMessage] = useState<Record<Language, string>>({
    en: 'Hi, Cadet! I’m Pip. Our space station needs your help. Tap a glowing station to explore!',
    tr: 'Merhaba Aday! Ben Pip. Uzay istasyonumuzun yardımına ihtiyacı var. Keşfetmek için ışıklı bir istasyona dokun!',
  })
  const [filterRunning, setFilterRunning] = useState(false)
  const [panelAngle, setPanelAngle] = useState(70)
  const [batteryCharged, setBatteryCharged] = useState(false)
  const [airClean, setAirClean] = useState(false)
  const [gardenWatered, setGardenWatered] = useState(false)
  const [gardenLit, setGardenLit] = useState(false)
  const [gardenGrown, setGardenGrown] = useState(false)

  const selectedStation = STATIONS.find((station) => station.id === selectedId)
  const solarCapture = Math.round(Math.cos((panelAngle * Math.PI) / 180) * 100)
  const allComplete = completed.length === STATIONS.length
  const rippleLevels = [
    { level: 1, water: Math.round(15 * 0.5), power: Math.round(15 * 0.4) },
    { level: 2, water: Math.round(15 * 0.3), power: Math.round(15 * 0.2) },
    { level: 3, water: Math.round(15 * 0.3), power: Math.round(15 * 0.05) },
  ]

  useEffect(() => {
    if (!selectedId) return

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setSelectedId(null)
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [selectedId])

  function markComplete(id: StationId) {
    setCompleted((previous) => (previous.includes(id) ? previous : [...previous, id]))
  }

  function selectStation(station: Station) {
    setSelectedId(station.id)
    const prompts: Record<StationId, Record<Language, string>> = {
      water: {
        en: 'The water tank is low. Can you wake up the recycling filter?',
        tr: 'Su tankı azaldı. Geri dönüşüm filtresini çalıştırabilir misin?',
      },
      power: {
        en: 'The station needs electricity. Can you turn the panel toward the Sun?',
        tr: 'İstasyonun elektriğe ihtiyacı var. Paneli Güneş’e doğru çevirebilir misin?',
      },
      air: {
        en: 'The air cleaner is quiet. Can you clear the CO₂ from the cabin?',
        tr: 'Hava temizleyici beklemede. Kabindeki CO₂ gazını temizleyebilir misin?',
      },
      garden: {
        en: 'The seedlings are sleepy. Can you give them water and light?',
        tr: 'Fideler uykulu görünüyor. Onlara su ve ışık verebilir misin?',
      },
    }
    setRobotMessage(
      completed.includes(station.id)
        ? {
            en: 'Nice work, Cadet! You already helped this station. Explore another system!',
            tr: 'Harika iş, Aday! Bu istasyona zaten yardım ettin. Başka bir sistemi keşfet!',
          }
        : prompts[station.id],
    )
  }

  function selectControl(id: StationId) {
    const station = STATIONS.find((item) => item.id === id)
    if (station) selectStation(station)
  }

  function recycleWater() {
    setFilterRunning(true)
    markComplete('water')
    setRobotMessage({
      en: 'Whoosh! The filter cleaned the used water so the crew can use it again. One small supply can go further when it is recycled!',
      tr: 'Vuuuş! Filtre kirli suyu temizledi; ekip yeniden kullanabilir. Küçük bir stok geri dönüştürüldüğünde çok daha uzun süre yeter!',
    })
  }

  function chargeBattery() {
    if (solarCapture < 90) {
      setRobotMessage({
        en: 'Almost! Turn the panel closer to face the Sun so it can catch more light.',
        tr: 'Neredeyse oldu! Daha fazla ışık yakalamak için paneli Güneş’e daha çok döndür.',
      })
      return
    }
    setBatteryCharged(true)
    markComplete('power')
    setRobotMessage({
      en: 'Sun-powered! Solar panels turn sunlight into electricity. The station battery is charging!',
      tr: 'Güneş enerjisi devrede! Güneş panelleri ışığı elektriğe dönüştürür. İstasyon bataryası şarj oluyor!',
    })
  }

  function cleanAir() {
    setAirClean(true)
    markComplete('air')
    setRobotMessage({
      en: 'The fan is moving air through the cleaner! It helps remove carbon dioxide that astronauts breathe out.',
      tr: 'Fan havayı temizleyiciden geçiriyor! Astronotların soluduğu karbondioksiti gidermeye yardımcı olur.',
    })
  }

  function growGarden() {
    if (!gardenWatered || !gardenLit) {
      setRobotMessage({
        en: 'Plants need both water and light. Turn on both garden supplies, then help the seedlings grow!',
        tr: 'Bitkilerin hem suya hem ışığa ihtiyacı var. Her iki bahçe kaynağını da aç, sonra fideleri büyüt!',
      })
      return
    }
    setGardenGrown(true)
    markComplete('garden')
    setRobotMessage({
      en: 'Look at those leaves grow! Space gardens help researchers learn how plants grow in microgravity and can provide fresh food.',
      tr: 'Yaprakların büyümesine bak! Uzay bahçeleri mikro yerçekiminde bitki gelişimini incelemeye ve taze gıda sağlamaya yardımcı olur.',
    })
  }

  return (
    <section className="resource-guide" aria-labelledby="resource-guide-title">
      <header className="resource-guide-intro">
        <div>
          <span className="resource-guide-kicker">
            {pick('SPACE STATION ADVENTURE / LEVEL 01', 'UZAY İSTASYONU MACERASI / SEVİYE 01')}
          </span>
          <h3 id="resource-guide-title">
            {pick('The supply rocket is late!', 'İkmal roketi gecikti!')}
          </h3>
          <p>
            {pick(
              'Tap a station system to open Pip’s science window and discover its ripple effects.',
              'Pip’in bilim penceresini açmak ve zincirleme etkileri keşfetmek için bir istasyon sistemine dokun.',
            )}
          </p>
        </div>
        <div
          className="resource-progress"
          aria-label={pick(
            `Mission progress: ${completed.length} of 4 stations completed`,
            `Görev ilerlemesi: 4 istasyondan ${completed.length} tamamlandı`,
          )}
        >
          <div className="resource-progress-top">
            <strong>{pick('STATION CHECK', 'İSTASYON KONTROLÜ')}</strong>
            <span>{completed.length}/4</span>
          </div>
          <div className="resource-progress-stars" aria-hidden="true">
            {STATIONS.map((station) => (
              <span className={completed.includes(station.id) ? 'earned' : ''} key={station.id}>
                ★
              </span>
            ))}
          </div>
          <div className="resource-progress-track">
            <span style={{ width: `${completed.length * 25}%` }} />
          </div>
        </div>
      </header>

      <div className="resource-station-scene">
        <img
          className="resource-station-background"
          src="/resource-lab-background.png"
          alt={pick(
            'A moon base seen through a space station window',
            'Uzay istasyonu penceresinden görünen bir Ay üssü',
          )}
        />
        <div className="resource-scene-shade" aria-hidden="true" />
        <div className="resource-scene-bio-panel" aria-hidden="true">
          <strong>{pick('BIO-ANALYSIS', 'BİYO-ANALİZ')}</strong>
          <span>
            {pick('PLANT HEALTH', 'BİTKİ SAĞLIĞI')} <b>96%</b>
          </span>
          <span>
            {pick('LEAF SCAN', 'YAPRAK TARAMA')} <b>{pick('ACTIVE', 'AKTİF')}</b>
          </span>
          <div className="resource-scene-bio-scan">
            <Leaf />
            <i />
            <i />
            <i />
          </div>
        </div>
        <div className="resource-scene-air-panel" aria-hidden="true">
          <Wind />
          <span>
            <strong>{pick('AIR QUALITY', 'HAVA KALİTESİ')}</strong>
            <b>{pick('OPTIMAL', 'OPTİMAL')}</b>
          </span>
          <small>O₂ 21% · CO₂ 0.04%</small>
        </div>
        <div className="resource-scene-supply-panel" aria-hidden="true">
          <strong>{pick('ORBITAL SUPPLY DECK', 'YÖRÜNGE İKMAL GÜVERTESİ')}</strong>
          <span>
            {pick('H₂O RESERVE', 'H₂O REZERVİ')} <b>88%</b>
          </span>
          <span>
            {pick('POWER FLOW', 'GÜÇ AKIŞI')} <b>{pick('ONLINE', 'ÇEVRİMİÇİ')}</b>
          </span>
          <span>
            {pick('FEED PRESSURE', 'BESLEME BASINCI')} <b>1.05 BAR</b>
          </span>
          <div className="resource-scene-supply-meter">
            <i />
          </div>
        </div>
        <div className="resource-scene-garden-pod" aria-hidden="true">
          <div className="resource-scene-grow-crystal">
            <Leaf />
          </div>
          <span className="resource-scene-vine vine-one">
            <i />
            <i />
            <i />
            <i />
          </span>
          <span className="resource-scene-vine vine-two">
            <i />
            <i />
            <i />
          </span>
          <div className="resource-scene-garden-name">
            {pick('ORBITAL GARDEN', 'YÖRÜNGE BAHÇESİ')} <small>{pick('GROW BAY 01', 'SERA BÖLMESİ 01')}</small>
          </div>
        </div>
        <div className="resource-scene-power-unit" aria-hidden="true">
          <div className="resource-scene-power-ring">
            <Zap />
          </div>
          <div className="resource-scene-power-readout">
            <b>{pick('POWER GRID', 'GÜÇ ŞEBEKESİ')}</b>
            <span>{pick('CORE OUTPUT', 'ÇEKİRDEK ÇIKIŞI')}</span>
            <strong>1.2 GW</strong>
            <i />
          </div>
          <div className="resource-scene-power-foot" />
        </div>
        <div className="resource-scene-orbital-feed" aria-hidden="true">
          <div className="resource-scene-feed-ring">
            <Waves />
          </div>
          <span>{pick('SUPPLY FEED', 'İKMAL HATTI')}</span>
        </div>
        <div className="resource-scene-control-deck">
          {STATION_CONTROLS.map(({ id, label, icon: Icon, color }) => {
            const station = STATIONS.find((item) => item.id === id)
            return (
              <button
                type="button"
                key={id}
                className={`resource-deck-control ${color}${selectedId === id ? ' selected' : ''}${station && completed.includes(station.id) ? ' completed' : ''}`}
                onClick={() => selectControl(id)}
                aria-pressed={selectedId === id}
                aria-label={label[lang]}
              >
                <Icon aria-hidden="true" />
                <span>{label[lang]}</span>
                {station && completed.includes(station.id) && (
                  <Check aria-label={pick('Completed', 'Tamamlandı')} />
                )}
              </button>
            )
          })}
        </div>
        <span className="resource-scene-caption" aria-hidden="true">
          {pick('LUNAR OUTPOST · ORBITAL SUPPLY DECK', 'AY KARAKOLU · YÖRÜNGE İKMAL GÜVERTESİ')}
        </span>
      </div>

      {selectedStation && (
        <div
          className="resource-learning-backdrop"
          onClick={() => setSelectedId(null)}
          role="presentation"
        >
          <section
            className={`resource-learning-panel ${selectedStation.color} ${selectedStation.id}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="resource-dialog-title"
            aria-describedby="resource-robot-message"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="resource-robot">
              <RobotGuide />
              <span>{pick('PIP · YOUR ROBOT GUIDE', 'PIP · ROBOT REHBERİN')}</span>
            </div>
            <div className="resource-learning-content">
              <button
                type="button"
                className="resource-hud-button resource-dialog-close"
                onClick={() => setSelectedId(null)}
                aria-label={pick('Close station information', 'İstasyon bilgisini kapat')}
                autoFocus
              >
                <X aria-hidden="true" />
              </button>
              <div className="resource-learning-title">
                <span className="resource-learning-icon">
                  {selectedStation.id === 'water' && <Droplets aria-hidden="true" />}
                  {selectedStation.id === 'power' && <Sun aria-hidden="true" />}
                  {selectedStation.id === 'air' && <Fan aria-hidden="true" />}
                  {selectedStation.id === 'garden' && <Leaf aria-hidden="true" />}
                </span>
                <div>
                  <span className="resource-learning-eyebrow">
                    {pick('STATION STOP', 'İSTASYON DURAĞI')} · {selectedStation.shortTitle[lang]}
                  </span>
                  <h4 id="resource-dialog-title">{selectedStation.title[lang]}</h4>
                </div>
              </div>

              <p className="resource-robot-message" id="resource-robot-message">
                {robotMessage[lang]}
              </p>

              <div className="resource-network-learning">
                <div className="resource-nasa-fact">
                  <strong>{pick('NASA SCIENCE', 'NASA BİLİMİ')}</strong>
                  {selectedStation.id === 'water' &&
                    pick(
                      'The space station recycles water. Water is also used to make oxygen, and plants need water to grow.',
                      'Uzay istasyonu suyu geri dönüştürür. Su aynı zamanda oksijen üretmek için kullanılır ve bitkilerin büyümesi için suya ihtiyacı vardır.',
                    )}
                  {selectedStation.id === 'power' &&
                    pick(
                      'The station’s solar arrays turn sunlight into electricity. That electricity helps run life-support and other station equipment.',
                      'İstasyonun güneş panelleri ışığı elektriğe dönüştürür. Bu elektrik yaşam desteği ve diğer sistemleri çalıştırır.',
                    )}
                  {selectedStation.id === 'air' &&
                    pick(
                      'Life-support equipment removes carbon dioxide from cabin air. Making oxygen from water also uses station power.',
                      'Yaşam destek ekipmanı kabin havasındaki karbondioksiti temizler. Sudan oksijen üretmek de istasyon gücü gerektirir.',
                    )}
                  {selectedStation.id === 'garden' &&
                    pick(
                      'NASA’s Veggie studies how plants grow in microgravity. Space plants need light and water, and can provide fresh food.',
                      'NASA’nın Veggie deneyi bitkilerin mikro yerçekiminde nasıl büyüdüğünü inceler. Uzay bitkileri ışık ile suya ihtiyaç duyar ve taze gıda sağlayabilir.',
                    )}
                </div>
                <div className="resource-game-ripple">
                  <div className="resource-ripple-heading">
                    <strong>{pick('GAME RIPPLE EFFECTS', 'OYUN ZİNCİRLEME ETKİLERİ')}</strong>
                    <span>
                      {pick(
                        `Level ${baseLevel} selected · all levels shown`,
                        `Seviye ${baseLevel} seçili · tüm seviyeler gösteriliyor`,
                      )}
                    </span>
                  </div>
                  <ul>
                    {rippleLevels.map(({ level, water, power }) => (
                      <li className={baseLevel === level ? 'active' : ''} key={level}>
                        <strong>{pick(`LEVEL ${level}`, `SEVİYE ${level}`)}</strong>
                        <span>
                          {selectedStation.id === 'water' &&
                            pick(
                              `Water ±15 → Air ±${water} · Food ±${water}`,
                              `Su ±15 → Hava ±${water} · Gıda ±${water}`,
                            )}
                          {selectedStation.id === 'power' &&
                            pick(
                              `Power ±15 → Water/Air/Food ±${power}`,
                              `Güç ±15 → Su/Hava/Gıda ±${power}`,
                            )}
                          {selectedStation.id === 'air' &&
                            pick(
                              `Water ±15 → Air ±${water} · Power ±15 → Air ±${power}`,
                              `Su ±15 → Hava ±${water} · Güç ±15 → Hava ±${power}`,
                            )}
                          {selectedStation.id === 'garden' &&
                            pick(
                              `Water ±15 → Food ±${water} · Power ±15 → Food ±${power}`,
                              `Su ±15 → Gıda ±${water} · Güç ±15 → Gıda ±${power}`,
                            )}
                        </span>
                      </li>
                    ))}
                    {selectedStation.id === 'air' && (
                      <li>
                        <strong>{pick('AIR', 'HAVA')}</strong>
                        <span>
                          {pick(
                            'Changing air directly updates only the air reserve.',
                            'Havayı değiştirmek yalnızca hava stoğunu doğrudan günceller.',
                          )}
                        </span>
                      </li>
                    )}
                    {selectedStation.id === 'garden' && (
                      <li>
                        <strong>{pick('HARVEST', 'HASAT')}</strong>
                        <span>
                          {pick(
                            'Food +15 → Power −10 · Water −10',
                            'Gıda +15 → Güç −10 · Su −10',
                          )}
                        </span>
                      </li>
                    )}
                  </ul>
                  <small>
                    {pick(
                      'Effects are simplified game points per action, not NASA measurements. Real systems are more complex.',
                      'Etkiler NASA ölçümleri değil, eylem başına basitleştirilmiş oyun puanlarıdır. Gerçek sistemler daha karmaşıktır.',
                    )}
                  </small>
                </div>
              </div>

              {selectedId === 'water' && (
                <div className="resource-mini-game">
                  <div
                    className={`resource-water-tank${filterRunning ? ' running' : ''}`}
                    aria-label={
                      filterRunning
                        ? pick('Water filter running', 'Su filtresi çalışıyor')
                        : pick('Water filter waiting', 'Su filtresi bekliyor')
                    }
                  >
                    <span className="resource-tank-water">
                      <i />
                      <i />
                      <i />
                    </span>
                    <span className="resource-tank-filter">
                      <Waves aria-hidden="true" />
                    </span>
                  </div>
                  <div className="resource-mini-copy">
                    <p>
                      {pick(
                        'Used water goes through a filter before the crew can use it again.',
                        'Kullanılmış su ekibin yeniden kullanabilmesi için bir filtreden geçer.',
                      )}
                    </p>
                    <button
                      type="button"
                      className="resource-hud-button"
                      onClick={recycleWater}
                      disabled={filterRunning}
                    >
                      <RotateCw aria-hidden="true" />{' '}
                      {filterRunning
                        ? pick('FILTER COMPLETE!', 'FİLTRE TAMAMLANDI!')
                        : pick('START THE WATER FILTER', 'SU FİLTRESİNİ BAŞLAT')}
                    </button>
                  </div>
                </div>
              )}

              {selectedId === 'power' && (
                <div className="resource-mini-game">
                  <div
                    className="resource-solar-display"
                    aria-label={pick(
                      `Panel turned ${panelAngle} degrees, collecting ${solarCapture} percent in this game model`,
                      `Panel ${panelAngle} derece çevrildi, bu oyun modelinde %${solarCapture} enerji topluyor`,
                    )}
                  >
                    <Sun className="resource-solar-sun" aria-hidden="true" />
                    <div
                      className="resource-solar-panel"
                      style={{ transform: `rotate(${-panelAngle / 2}deg)` }}
                    >
                      <i />
                      <i />
                      <i />
                    </div>
                    <div className={`resource-battery${batteryCharged ? ' charging' : ''}`}>
                      <span style={{ width: `${batteryCharged ? 100 : solarCapture}%` }} />
                    </div>
                    <small>
                      {pick('BATTERY', 'BATARYA')}{' '}
                      {batteryCharged ? pick('CHARGING!', 'ŞARJ OLUYOR!') : `${solarCapture}%`}
                    </small>
                  </div>
                  <div className="resource-mini-copy">
                    <label htmlFor="solar-angle">
                      {pick('Turn panel toward the Sun:', 'Paneli Güneş’e çevir:')}{' '}
                      <strong>{panelAngle}°</strong>
                    </label>
                    <input
                      id="solar-angle"
                      type="range"
                      min="0"
                      max="90"
                      value={panelAngle}
                      onChange={(event) => setPanelAngle(Number(event.target.value))}
                    />
                    <button
                      type="button"
                      className="resource-hud-button"
                      onClick={chargeBattery}
                      disabled={batteryCharged}
                    >
                      <Zap aria-hidden="true" />{' '}
                      {batteryCharged
                        ? pick('BATTERY CHARGED!', 'BATARYA DOLDU!')
                        : pick('CHARGE THE BATTERY', 'BATARYAYI ŞARJ ET')}
                    </button>
                  </div>
                </div>
              )}

              {selectedId === 'air' && (
                <div className="resource-mini-game">
                  <div
                    className={`resource-air-display${airClean ? ' cleaning' : ''}`}
                    aria-label={
                      airClean
                        ? pick('Air cleaning system active', 'Hava temizleme sistemi aktif')
                        : pick('Air cleaning system waiting', 'Hava temizleme sistemi bekliyor')
                    }
                  >
                    <span className="resource-co2-dot">CO₂</span>
                    <span className="resource-co2-dot">CO₂</span>
                    <span className="resource-co2-dot">CO₂</span>
                    <Fan aria-hidden="true" />
                    <span className="resource-air-clean">
                      {pick('AIR', 'HAVA')}
                      <br />
                      {pick('CLEANER', 'TEMİZLEYİCİ')}
                    </span>
                    <Wind aria-hidden="true" />
                  </div>
                  <div className="resource-mini-copy">
                    <p>
                      {pick(
                        'Astronauts breathe out carbon dioxide. The air system helps remove it from the cabin.',
                        'Astronotlar dışarı karbondioksit verir. Hava sistemi bunu kabinden uzaklaştırmaya yardımcı olur.',
                      )}
                    </p>
                    <button
                      type="button"
                      className="resource-hud-button"
                      onClick={cleanAir}
                      disabled={airClean}
                    >
                      <Wind aria-hidden="true" />{' '}
                      {airClean
                        ? pick('AIR CLEANER ON!', 'HAVA TEMİZLEYİCİ AÇIK!')
                        : pick('TURN ON THE AIR CLEANER', 'HAVA TEMİZLEYİCİYİ AÇ')}
                    </button>
                  </div>
                </div>
              )}

              {selectedId === 'garden' && (
                <div className="resource-mini-game">
                  <div
                    className={`resource-garden-display${gardenGrown ? ' grown' : ''}`}
                    aria-label={
                      gardenGrown
                        ? pick('Space plants have grown', 'Uzay bitkileri büyüdü')
                        : pick('Space seedlings', 'Uzay fideleri')
                    }
                  >
                    <span className="resource-garden-plant plant-one" />
                    <span className="resource-garden-plant plant-two" />
                    <span className="resource-garden-pot" />
                    <span className={`resource-garden-light${gardenLit ? ' on' : ''}`}>
                      <Lightbulb aria-hidden="true" />
                    </span>
                  </div>
                  <div className="resource-mini-copy">
                    <p>
                      {pick(
                        'Plants need water and light. Give both to the seedlings, then watch the garden grow.',
                        'Bitkilerin suya ve ışığa ihtiyacı vardır. İkisini de fidelere ver ve bahçenin büyümesini izle.',
                      )}
                    </p>
                    <div className="resource-garden-controls">
                      <button
                        type="button"
                        className={`resource-hud-button ${gardenWatered ? 'active' : ''}`}
                        onClick={() => {
                          setGardenWatered(true)
                          setRobotMessage({
                            en: 'Water tank connected! Now switch on the grow light for your seedlings.',
                            tr: 'Su tankı bağlandı! Şimdi fidelerin için büyüme ışığını aç.',
                          })
                        }}
                        disabled={gardenWatered}
                      >
                        <Droplets aria-hidden="true" />{' '}
                        {gardenWatered ? pick('WATERED!', 'SULANDI!') : pick('ADD WATER', 'SU EKLE')}
                      </button>
                      <button
                        type="button"
                        className={`resource-hud-button ${gardenLit ? 'active' : ''}`}
                        onClick={() => {
                          setGardenLit(true)
                          setRobotMessage({
                            en: 'Grow light on! Give the seedlings water too, then help them grow.',
                            tr: 'Büyüme ışığı açık! Fidelere su da ver, sonra büyümelerine yardım et.',
                          })
                        }}
                        disabled={gardenLit}
                      >
                        <Lightbulb aria-hidden="true" />{' '}
                        {gardenLit ? pick('LIGHT ON!', 'IŞIK AÇIK!') : pick('TURN ON LIGHT', 'IŞIĞI AÇ')}
                      </button>
                    </div>
                    <button
                      type="button"
                      className="resource-hud-button"
                      onClick={growGarden}
                      disabled={gardenGrown}
                    >
                      <Leaf aria-hidden="true" />{' '}
                      {gardenGrown
                        ? pick('GARDEN GROWING!', 'BAHÇE BÜYÜYOR!')
                        : pick('GROW THE SEEDLINGS', 'FİDELERİ BÜYÜT')}
                    </button>
                  </div>
                </div>
              )}

              {completed.includes(selectedStation.id) && (
                <p className="resource-science-note">
                  <span>{pick('SPACE FACT', 'UZAY BİLGİSİ')}</span>
                  {selectedStation.id === 'water' &&
                    pick(
                      'Spacecraft can clean and reuse water to help limited supplies last longer.',
                      'Uzay araçları sınırlı stokların daha uzun yetmesi için suyu arıtıp yeniden kullanabilir.',
                    )}
                  {selectedStation.id === 'power' &&
                    pick(
                      'Solar panels use sunlight to make electricity for spacecraft.',
                      'Güneş panelleri uzay araçları için gün ışığından elektrik üretir.',
                    )}
                  {selectedStation.id === 'air' &&
                    pick(
                      'Astronauts need clean cabin air, so life-support systems help remove carbon dioxide.',
                      'Astronotlar temiz kabin havasına ihtiyaç duyar; yaşam destek sistemleri karbondioksiti uzaklaştırır.',
                    )}
                  {selectedStation.id === 'garden' &&
                    pick(
                      'NASA studies how plants grow in microgravity and how space gardens may help crews.',
                      'NASA bitkilerin mikro yerçekiminde nasıl geliştiğini ve uzay bahçelerinin ekiplere nasıl destek olabileceğini araştırır.',
                    )}
                </p>
              )}
            </div>
          </section>
        </div>
      )}

      {allComplete && (
        <div className="resource-complete-banner" role="status">
          <div>
            <span>★ ★ ★ ★</span>
            <h4>{pick('STATION READY, CADET!', 'İSTASYON HAZIR, ADAY!')}</h4>
            <p>
              {pick(
                'You helped all four systems. The crew is ready for its next mission!',
                'Dört sisteme de yardım ettin. Ekip bir sonraki göreve hazır!',
              )}
            </p>
          </div>
          <button type="button" className="resource-hud-button" onClick={onStartSimulation}>
            <Play aria-hidden="true" />{' '}
            {pick('OPEN INTERACTIVE SIMULATION', 'İNTERAKTİF SİMÜLASYONU AÇ')}
          </button>
        </div>
      )}
    </section>
  )
}
