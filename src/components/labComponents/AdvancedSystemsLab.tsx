import { useState } from 'react'
import {
  BookOpen,
  Orbit,
  Play,
  RotateCcw,
  Shield,
  Sun,
  Thermometer,
} from 'lucide-react'
import { useLanguage, type Language } from '../../context/LanguageContext'
import { LabTransitionOverlay } from '../LabTransition'
import { useLabTransition } from '../../hooks/useLabTransition'
import LabStationBadge from './LabStationBadge'
import './AdvancedSystemsLab.css'

type ExperimentId = 'gravity' | 'radiation' | 'solar' | 'thermal'
type WorldId = 'earth' | 'moon' | 'mars'
type ShieldId = 'aluminum' | 'water' | 'regolith'
type LStr = Record<Language, string>

const EXPERIMENTS: {
  id: ExperimentId
  title: LStr
  summary: LStr
  hook: LStr
  fact: LStr
  challenge: LStr
  science: LStr
  icon: typeof Orbit
}[] = [
  {
    id: 'gravity',
    title: { en: 'Gravity', tr: 'Yerçekimi' },
    summary: {
      en: 'A rover has one test rock and three worlds to visit.',
      tr: 'Bir keşif aracının tek bir test taşı ve ziyaret edeceği üç dünyası var.',
    },
    hook: {
      en: 'ROVER LOG 01 · The great drop-off',
      tr: 'KEŞİF KAYDI 01 · Büyük düşüş deneyi',
    },
    fact: {
      en: 'The Moon’s gravity is about one-sixth as strong as Earth’s. The same rock weighs less there, even though it is still the same rock.',
      tr: 'Ay’ın kütleçekimi Dünya’nın yaklaşık altıda biri kadardır. Aynı taş aynı kütlede olsa bile Ay’da çok daha hafif gelir.',
    },
    challenge: {
      en: 'The rover is filming a slow-motion video. Which world should it visit?',
      tr: 'Keşif aracı ağır çekim bir video çekiyor. Hangi dünyaya gitmeli?',
    },
    science: {
      en: 'The rover crew is testing how gravity changes a falling object. Gravity is a world’s pull: it keeps our feet on Earth and guides moons around planets. The Moon and Mars pull less strongly than Earth, so the same object falls differently in our simple model.',
      tr: 'Ekip, kütleçekiminin düşen bir cismi nasıl etkilediğini test ediyor. Kütleçekimi bir gök cisminin çekim kuvvetidir: ayaklarımızı yerde tutar ve uyduları gezegenlerin yörüngesinde tutar. Ay ve Mars Dünya’dan daha zayıf çektiği için basit modelimizde aynı nesne farklı düşer.',
    },
    icon: Orbit,
  },
  {
    id: 'radiation',
    title: { en: 'Radiation', tr: 'Radyasyon' },
    summary: {
      en: 'A space explorer is packing for a trip beyond Earth.',
      tr: 'Bir uzay kaşifi Dünya ötesi yolculuk için hazırlanıyor.',
    },
    hook: {
      en: 'ROVER LOG 02 · The cosmic-ray puzzle',
      tr: 'KEŞİF KAYDI 02 · Kozmik ışın bulmacası',
    },
    fact: {
      en: 'Some radiation in space comes from energetic particles. NASA monitors it because it can affect astronaut health.',
      tr: 'Uzaydaki radyasyonun bir kısmı yüksek enerjili parçacıklardan gelir. NASA astronot sağlığını etkileyebildiği için bunu yakından izler.',
    },
    challenge: {
      en: 'Can your imaginary shield change the reading in our pretend detector?',
      tr: 'Hayali kalkanın sanal dedektörümüzdeki ölçümü değiştirebilir mi?',
    },
    science: {
      en: 'The explorer’s detector has spotted invisible particles traveling through space. Earth’s atmosphere protects us from much of this environment, but astronauts travel beyond it. Scientists study radiation and possible protection; our pretend detector is a learning model, not a real safety test.',
      tr: 'Kaşifin dedektörü uzayda yol alan görünmez parçacıklar saptadı. Dünya’nın atmosferi bizi büyük ölçüde korur, ancak astronotlar atmosferin ötesine gider. Sanal dedektörümüz gerçek bir güvenlik testi değil, bir öğrenme modelidir.',
    },
    icon: Shield,
  },
  {
    id: 'solar',
    title: { en: 'Solar Energy', tr: 'Güneş Enerjisi' },
    summary: {
      en: 'The rover battery is low. Can you catch more sunlight?',
      tr: 'Keşif aracının bataryası azaldı. Daha fazla güneş ışığı yakalayabilir misin?',
    },
    hook: {
      en: 'ROVER LOG 03 · Follow that sunshine',
      tr: 'KEŞİF KAYDI 03 · Güneşi takip et',
    },
    fact: {
      en: 'A solar panel catches sunlight more directly when it faces the Sun than when it is turned edge-on.',
      tr: 'Bir güneş paneli yan dönmek yerine doğrudan Güneş’e baktığında ışığı çok daha verimli toplar.',
    },
    challenge: {
      en: 'Can you point the panel to wake up the rover’s pretend battery?',
      tr: 'Paneli doğru açıyla yönlendirip bataryayı uyandırabilir misin?',
    },
    science: {
      en: 'The rover needs power for its instruments. Solar arrays turn sunlight into electricity, and the angle toward the Sun affects how much light reaches a surface. Real spacecraft also deal with shadows and other power-system limits.',
      tr: 'Keşif aracının cihazları için güce ihtiyacı var. Güneş panelleri gün ışığını elektriğe çevirir ve Güneş’e olan açı yüzeye ulaşan ışık miktarını belirler. Gerçek uzay araçları gölgeler ve diğer güç sınırlarıyla da baş eder.',
    },
    icon: Sun,
  },
  {
    id: 'thermal',
    title: { en: 'Thermal', tr: 'Termal Kontrol' },
    summary: {
      en: 'A science box is swinging between sunny and shady spots.',
      tr: 'Bir bilim kutusu güneşli ve gölgeli noktalar arasında gidip geliyor.',
    },
    hook: {
      en: 'ROVER LOG 04 · Too hot, too cold?',
      tr: 'KEŞİF KAYDI 04 · Çok mu sıcak, çok mu soğuk?',
    },
    fact: {
      en: 'A spacecraft can absorb heat, make heat, store heat, and release heat.',
      tr: 'Bir uzay aracı ısıyı soğurabilir, üretebilir, depolayabilir ve dışarı verebilir.',
    },
    challenge: {
      en: 'Can you help the science box stay comfy with insulation?',
      tr: 'Yalıtımla bilim kutusunun ideal sıcaklıkta kalmasına yardım edebilir misin?',
    },
    science: {
      en: 'The rover’s science instruments work best within certain temperatures. Engineers balance heat with tools such as insulation, special coatings, and radiators. Our temperature dial is a pretend model, not a forecast for a real spacecraft.',
      tr: 'Bilim cihazları belirli sıcaklık aralıklarında en iyi şekilde çalışır. Mühendisler yalıtım, özel kaplamalar ve radyatörlerle ısıyı dengeler. Sıcaklık göstergemiz gerçek bir uçuş tahmini değil, eğitim modelidir.',
    },
    icon: Thermometer,
  },
]

const WORLDS: Record<WorldId, { name: LStr; gravity: number }> = {
  earth: { name: { en: 'Earth', tr: 'Dünya' }, gravity: 9.81 },
  moon: { name: { en: 'Moon', tr: 'Ay' }, gravity: 1.62 },
  mars: { name: { en: 'Mars', tr: 'Mars' }, gravity: 3.71 },
}

const SHIELDS: Record<ShieldId, { name: LStr; modelFactor: number; note: LStr }> = {
  aluminum: {
    name: { en: 'Aluminum', tr: 'Alüminyum' },
    modelFactor: 0.035,
    note: {
      en: 'A common spacecraft structural material; shielding behavior depends on particle energy and configuration.',
      tr: 'Yaygın bir uzay aracı yapı malzemesidir; koruma davranışı parçacık enerjisine ve yapıya göre değişir.',
    },
  },
  water: {
    name: { en: 'Water-rich layer', tr: 'Su açısından zengin katman' },
    modelFactor: 0.055,
    note: {
      en: 'Hydrogen-rich materials are studied for radiation protection; this model does not predict real dose.',
      tr: 'Hidrojen bakımından zengin malzemeler radyasyondan korunma için incelenir; bu model gerçek doz tahmini yapmaz.',
    },
  },
  regolith: {
    name: { en: 'Lunar regolith', tr: 'Ay regoliti' },
    modelFactor: 0.045,
    note: {
      en: 'Using local soil as bulk shielding is a habitat-design concept, not a guarantee of safety.',
      tr: 'Yerel toprağı kütle kalkanı olarak kullanmak bir üs tasarım konseptidir, güvenlik garantisi değildir.',
    },
  },
}

export default function AdvancedSystemsLab() {
  const { lang, pick } = useLanguage()
  const {
    activeSection: activeTab,
    isRocketFlying,
    transitionTo: handleTabChange,
  } = useLabTransition<'guide' | 'simulation'>('guide')
  const [experiment, setExperiment] = useState<ExperimentId>('gravity')
  const [guideExperiment, setGuideExperiment] = useState<ExperimentId>('gravity')

  const [world, setWorld] = useState<WorldId>('earth')
  const [mass, setMass] = useState(10)
  const [dropHeight, setDropHeight] = useState(10)
  const [dropRun, setDropRun] = useState(0)

  const [shield, setShield] = useState<ShieldId>('water')
  const [shieldThickness, setShieldThickness] = useState(10)

  const [panelAngle, setPanelAngle] = useState(0)

  const [sunlight, setSunlight] = useState(true)
  const [insulation, setInsulation] = useState(50)
  const [thermalTemperature, setThermalTemperature] = useState(20)

  const currentWorld = WORLDS[world]
  const fallTime = Math.sqrt((2 * dropHeight) / currentWorld.gravity)
  const weight = mass * currentWorld.gravity
  const relativeRadiation = Math.round(
    100 * Math.exp(-SHIELDS[shield].modelFactor * shieldThickness),
  )
  const solarOutput = Math.max(0, Math.round(Math.cos((panelAngle * Math.PI) / 180) * 100))

  function runThermalStep() {
    const insulationFactor = 1 - insulation / 100
    const temperatureChange = (sunlight ? 18 : -14) * insulationFactor
    setThermalTemperature((temperature) =>
      Math.round(Math.max(-80, Math.min(100, temperature + temperatureChange)) * 10) / 10,
    )
  }

  function resetThermalExperiment() {
    setThermalTemperature(20)
  }

  return (
    <section className="advanced-lab" aria-label={pick('Space Science Lab', 'Uzay Bilimleri Laboratuvarı')}>
      <LabTransitionOverlay visible={isRocketFlying} />

      <header className="advanced-lab-header">
        <div className="advanced-lab-title lab-station-heading">
          <LabStationBadge station="systems" />
          <div>
            <h2>{pick('SPACE SCIENCE LAB', 'UZAY BİLİMLERİ LABORATUVARI')}</h2>
            <p>
              {pick(
                'Explore the physics behind space exploration through four guided experiments.',
                'Dört rehberli deneyle uzay keşfinin arkasındaki fiziği keşfet.',
              )}
            </p>
          </div>
        </div>
        <div
          className="advanced-lab-tabs"
          role="tablist"
          aria-label={pick('Advanced Lab sections', 'İleri Laboratuvar bölümleri')}
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'guide'}
            className={activeTab === 'guide' ? 'active' : ''}
            onClick={() => handleTabChange('guide')}
          >
            <BookOpen aria-hidden="true" /> {pick('LAB GUIDE & OVERVIEW', 'LAB REHBERİ & GENEL BAKIŞ')}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'simulation'}
            className={activeTab === 'simulation' ? 'active' : ''}
            onClick={() => handleTabChange('simulation')}
          >
            <Play aria-hidden="true" /> {pick('INTERACTIVE EXPERIMENTS', 'İNTERAKTİF DENEYLER')}
          </button>
        </div>
      </header>

      {activeTab === 'guide' ? (
        <div className="advanced-guide" role="tabpanel">
          <div className="advanced-guide-hero">
            <div className="advanced-hero-orbit advanced-hero-orbit-one" aria-hidden="true" />
            <div className="advanced-hero-orbit advanced-hero-orbit-two" aria-hidden="true" />
            <div className="advanced-hero-copy">
              <span className="advanced-hero-kicker">
                {pick('ROVER FIELD JOURNAL / 4 LOGS', 'KEŞİF SAHA GÜNLÜĞÜ / 4 KAYIT')}
              </span>
              <h3>
                {pick('A rover found four space puzzles!', 'Keşif aracı dört uzay bilmecesi buldu!')}
              </h3>
              <p>
                {pick(
                  'Open a field log, learn the science clue, then help the rover investigate.',
                  'Bir saha kaydı aç, bilim ipucunu öğren ve keşif aracının incelemesine yardım et.',
                )}
              </p>
              <span className="advanced-mission-count">
                <Orbit aria-hidden="true" /> {pick('4 MINI MISSIONS', '4 MİNİ GÖREV')}
              </span>
            </div>
            <div className="advanced-hero-planet" aria-hidden="true">
              <span>✦</span>
              <i />
              <b />
            </div>
          </div>

          <div className="advanced-guide-section-heading">
            <div>
              <span>{pick('CHOOSE YOUR MISSION', 'GÖREVİNİ SEÇ')}</span>
              <p>
                {pick(
                  'Choose one of the rover’s discoveries.',
                  'Keşif aracının bulgularından birini seç.',
                )}
              </p>
            </div>
            <span className="advanced-tip">
              <span aria-hidden="true">✦</span> {pick('Curiosity powered', 'Merakla çalışır')}
            </span>
          </div>

          <div className="advanced-experiment-cards">
            {EXPERIMENTS.map(({ id, title, icon: Icon }, index) => (
              <button
                type="button"
                className={`advanced-experiment-card ${id}${guideExperiment === id ? ' selected' : ''}`}
                key={id}
                aria-pressed={guideExperiment === id}
                onClick={() => setGuideExperiment(id)}
              >
                <span className="advanced-card-index">
                  {pick('ROVER LOG', 'KEŞİF KAYDI')} 0{index + 1}
                </span>
                <span className="advanced-card-icon">
                  <Icon aria-hidden="true" />
                </span>
                <strong>{title[lang]}</strong>
                <span className="advanced-card-select">
                  {guideExperiment === id
                    ? pick('MISSION SELECTED', 'GÖREV SEÇİLDİ')
                    : pick('OPEN MISSION', 'GÖREVİ AÇ')}{' '}
                  <span aria-hidden="true">→</span>
                </span>
              </button>
            ))}
          </div>

          {(() => {
            const briefing = EXPERIMENTS.find((item) => item.id === guideExperiment)!
            const BriefingIcon = briefing.icon
            const noteNumber = EXPERIMENTS.findIndex((item) => item.id === guideExperiment) + 1
            return (
              <article className={`advanced-mission-briefing ${briefing.id}`}>
                <div className="advanced-briefing-art" aria-hidden="true">
                  <span className="advanced-briefing-star star-one">✦</span>
                  <span className="advanced-briefing-star star-two">✧</span>
                  <BriefingIcon />
                  <span className="advanced-briefing-art-label">
                    {pick(`FIELD NOTE 0${noteNumber}`, `SAHA NOTU 0${noteNumber}`)}
                  </span>
                </div>
                <div className="advanced-briefing-copy">
                  <span className="advanced-briefing-kicker">{briefing.hook[lang]}</span>
                  <h3>
                    {briefing.title[lang]}: {pick('rover field report', 'keşif saha raporu')}
                  </h3>
                  <p>{briefing.science[lang]}</p>
                  <div className="advanced-fact-and-challenge">
                    <div className="advanced-did-you-know">
                      <span aria-hidden="true">★</span>
                      <p>
                        <strong>{pick('SPACE SECRET', 'UZAY SIRRI')}</strong>
                        {briefing.fact[lang]}
                      </p>
                    </div>
                    <div className="advanced-challenge">
                      <span aria-hidden="true">?</span>
                      <p>
                        <strong>{pick('YOUR CHALLENGE', 'GÖREVİN')}</strong>
                        {briefing.challenge[lang]}
                      </p>
                    </div>
                  </div>
                  <div className="advanced-briefing-footer">
                    <button
                      type="button"
                      onClick={() => {
                        setExperiment(guideExperiment)
                        handleTabChange('simulation')
                      }}
                    >
                      <Play aria-hidden="true" /> {pick('TRY THIS MISSION', 'BU GÖREVİ DENE')}
                    </button>
                  </div>
                </div>
              </article>
            )
          })()}

          <p className="advanced-model-note">
            {pick(
              'Mission models are simplified for learning. They are not engineering design tools or NASA flight predictions.',
              'Görev modelleri öğrenme için sadeleştirilmiştir. Mühendislik tasarım aracı veya NASA uçuş tahmini değillerdir.',
            )}
          </p>
        </div>
      ) : (
        <div className="advanced-simulation" role="tabpanel">
          <nav
            className="advanced-experiment-tabs"
            aria-label={pick('Choose an experiment', 'Bir deney seç')}
          >
            {EXPERIMENTS.map(({ id, title, icon: Icon }) => (
              <button
                type="button"
                key={id}
                aria-pressed={experiment === id}
                className={experiment === id ? 'active' : ''}
                onClick={() => setExperiment(id)}
              >
                <Icon aria-hidden="true" />
                {title[lang]}
              </button>
            ))}
          </nav>

          {experiment === 'gravity' && (
            <section className="experiment-panel">
              <div className="experiment-panel-heading">
                <Orbit aria-hidden="true" />
                <div>
                  <h3>{pick('Gravity Experiment', 'Yerçekimi Deneyi')}</h3>
                  <p>
                    {pick(
                      'Keep the object and drop height fixed; compare how gravity changes its weight and ideal free-fall time.',
                      'Nesneyi ve bırakma yüksekliğini sabit tut; kütleçekiminin ağırlığı ve ideal serbest düşüş süresini nasıl değiştirdiğini karşılaştır.',
                    )}
                  </p>
                </div>
              </div>
              <div className="experiment-controls">
                <label>
                  {pick('World', 'Gök cismi')}
                  <select value={world} onChange={(event) => setWorld(event.target.value as WorldId)}>
                    {Object.entries(WORLDS).map(([id, item]) => (
                      <option key={id} value={id}>
                        {item.name[lang]}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  {pick('Object mass:', 'Nesne kütlesi:')} <strong>{mass} kg</strong>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={mass}
                    onChange={(event) => setMass(Number(event.target.value))}
                  />
                </label>
                <label>
                  {pick('Drop height:', 'Bırakma yüksekliği:')} <strong>{dropHeight} m</strong>
                  <input
                    type="range"
                    min="2"
                    max="30"
                    value={dropHeight}
                    onChange={(event) => setDropHeight(Number(event.target.value))}
                  />
                </label>
              </div>
              <div className="gravity-results">
                {Object.entries(WORLDS).map(([id, item]) => (
                  <div className={world === id ? 'selected' : ''} key={id}>
                    <span>{item.name[lang]}</span>
                    <strong>{(mass * item.gravity).toFixed(1)} N</strong>
                    <small>
                      {Math.sqrt((2 * dropHeight) / item.gravity).toFixed(2)}{' '}
                      {pick('s fall time', 'sn düşüş süresi')}
                    </small>
                  </div>
                ))}
              </div>
              <div className="gravity-drop-stage" key={dropRun}>
                <span className="gravity-height-label">{dropHeight} m</span>
                <span
                  className="gravity-drop-object"
                  style={{
                    animation:
                      dropRun === 0 ? 'none' : `advanced-gravity-drop ${fallTime}s linear forwards`,
                  }}
                />
                <span className="gravity-ground" />
              </div>
              <button
                type="button"
                className="advanced-action-button"
                onClick={() => setDropRun((run) => run + 1)}
              >
                <Play aria-hidden="true" />{' '}
                {pick(
                  `DROP OBJECT ON ${currentWorld.name.en.toUpperCase()}`,
                  `NESNEYİ ${currentWorld.name.tr.toLocaleUpperCase('tr-TR')} ÜZERİNDE BIRAK`,
                )}
              </button>
              <p className="experiment-footnote">
                {pick(
                  `On ${currentWorld.name.en}, gravity is ${currentWorld.gravity.toFixed(2)} m/s². This ${mass} kg object weighs ${weight.toFixed(1)} N and takes about ${fallTime.toFixed(2)} seconds to fall ${dropHeight} m.`,
                  `${currentWorld.name.tr} üzerinde kütleçekimi ivmesi ${currentWorld.gravity.toFixed(2)} m/s²’dir. Bu ${mass} kg kütleli nesne ${weight.toFixed(1)} N ağırlığındadır ve ${dropHeight} m mesafeden düşmesi yaklaşık ${fallTime.toFixed(2)} saniye sürer.`,
                )}
              </p>
              <p className="experiment-footnote">
                {pick(
                  'Ideal free fall only: air resistance and surface impact are not modeled. Moon gravity is about one-sixth of Earth’s (NASA).',
                  'Yalnızca ideal serbest düşüş: hava direnci ve yüzey çarpması modellenmemiştir. Ay çekimi Dünya’nın yaklaşık altıda biridir (NASA).',
                )}
              </p>
            </section>
          )}

          {experiment === 'radiation' && (
            <section className="experiment-panel">
              <div className="experiment-panel-heading">
                <Shield aria-hidden="true" />
                <div>
                  <h3>{pick('Radiation Experiment', 'Radyasyon Deneyi')}</h3>
                  <p>
                    {pick(
                      'Change a conceptual shielding material and thickness to see the model’s relative transmission index.',
                      'Modelin göreli geçirgenlik indeksini görmek için kavramsal kalkan malzemesini ve kalınlığını değiştir.',
                    )}
                  </p>
                </div>
              </div>
              <div className="experiment-controls">
                <label>
                  {pick('Shield material', 'Kalkan malzemesi')}
                  <select
                    value={shield}
                    onChange={(event) => setShield(event.target.value as ShieldId)}
                  >
                    {Object.entries(SHIELDS).map(([id, item]) => (
                      <option key={id} value={id}>
                        {item.name[lang]}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  {pick('Shield thickness:', 'Kalkan kalınlığı:')} <strong>{shieldThickness} cm</strong>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    value={shieldThickness}
                    onChange={(event) => setShieldThickness(Number(event.target.value))}
                  />
                </label>
              </div>
              <div className="radiation-meter">
                <div className="radiation-meter-label">
                  <span>{pick('Illustrative radiation transmission', 'Örnek radyasyon geçirgenliği')}</span>
                  <strong>{relativeRadiation}%</strong>
                </div>
                <div className="radiation-meter-track">
                  <span style={{ width: `${relativeRadiation}%` }} />
                </div>
                <p>{SHIELDS[shield].note[lang]}</p>
              </div>
              <aside className="advanced-caution">
                <Shield aria-hidden="true" />
                <p>
                  <strong>{pick('Model limitation:', 'Model sınırı:')}</strong>{' '}
                  {pick(
                    'The percentage is generated by a simple classroom formula. It is not a dose, measured shielding value, or safety recommendation; NASA notes that space-radiation risk and countermeasures involve substantial uncertainty.',
                    'Yüzde değeri basit bir ders formülüyle hesaplanır. Gerçek bir radyasyon dozu, ölçülmüş kalkan değeri veya güvenlik tavsiyesi değildir; NASA uzay radyasyonu riski ve önlemlerinin önemli belirsizlikler içerdiğini belirtir.',
                  )}
                </p>
              </aside>
            </section>
          )}

          {experiment === 'solar' && (
            <section className="experiment-panel">
              <div className="experiment-panel-heading">
                <Sun aria-hidden="true" />
                <div>
                  <h3>{pick('Solar Energy Experiment', 'Güneş Enerjisi Deneyi')}</h3>
                  <p>
                    {pick(
                      'Rotate the panel relative to the incoming sunlight and observe idealized output.',
                      'Paneli gelen güneş ışığına göre döndür ve ideal enerji çıkışını gözlemle.',
                    )}
                  </p>
                </div>
              </div>
              <div className="solar-experiment-scene">
                <span className="solar-experiment-sun" aria-hidden="true">
                  ☀
                </span>
                <span className="solar-rays" aria-hidden="true" />
                <span
                  className="solar-panel-art"
                  style={{ transform: `translate(-50%, -50%) rotate(${panelAngle}deg)` }}
                  aria-hidden="true"
                >
                  <i />
                  <i />
                  <i />
                </span>
              </div>
              <label className="solar-angle-control">
                {pick('Panel angle from directly facing the Sun:', 'Panelin Güneş’e dik açıdan sapması:')}{' '}
                <strong>{panelAngle}°</strong>
                <input
                  type="range"
                  min="0"
                  max="90"
                  value={panelAngle}
                  onChange={(event) => setPanelAngle(Number(event.target.value))}
                />
              </label>
              <div className="solar-output">
                <div className="solar-output-track">
                  <span style={{ width: `${solarOutput}%` }} />
                </div>
                <strong>{solarOutput}%</strong>
                <span>{pick('idealized output', 'ideal çıkış')}</span>
              </div>
              <p className="experiment-footnote">
                {pick(
                  'The idealized model follows a cosine of the incidence angle: maximum when facing the Sun, approaching zero edge-on. Real panels also depend on cells, temperature, shadow, and system losses.',
                  'İdeal model geliş açısının kosinüsünü izler: Güneş’e tam baktığında maksimum, dik/kenar konumunda sıfıra yakın olur. Gerçek paneller hücre yapısına, sıcaklığa, gölgeye ve sistem kayıplarına da bağlıdır.',
                )}
              </p>
            </section>
          )}

          {experiment === 'thermal' && (
            <section className="experiment-panel">
              <div className="experiment-panel-heading">
                <Thermometer aria-hidden="true" />
                <div>
                  <h3>{pick('Thermal Experiment', 'Termal Deney')}</h3>
                  <p>
                    {pick(
                      'Compare the effect of sunlight or shade and insulation on a simplified habitat temperature.',
                      'Güneş ışığı veya gölgenin ve yalıtımın sadeleştirilmiş yaşam alanı sıcaklığı üzerindeki etkisini karşılaştır.',
                    )}
                  </p>
                </div>
              </div>
              <div className="experiment-controls">
                <label>
                  {pick('Environment', 'Ortam')}
                  <select
                    value={sunlight ? 'sunlight' : 'shade'}
                    onChange={(event) => setSunlight(event.target.value === 'sunlight')}
                  >
                    <option value="sunlight">
                      {pick('Direct sunlight', 'Doğrudan güneş ışığı')}
                    </option>
                    <option value="shade">
                      {pick('Shade / facing deep space', 'Gölge / derin uzaya dönük')}
                    </option>
                  </select>
                </label>
                <label>
                  {pick('Insulation:', 'Yalıtım:')} <strong>{insulation}%</strong>
                  <input
                    type="range"
                    min="0"
                    max="90"
                    step="10"
                    value={insulation}
                    onChange={(event) => setInsulation(Number(event.target.value))}
                  />
                </label>
              </div>
              <div className="thermal-readout">
                <Thermometer aria-hidden="true" />
                <div>
                  <span>{pick('SIMULATED CABIN TEMPERATURE', 'SİMÜLE EDİLEN KABİN SICAKLIĞI')}</span>
                  <strong>{thermalTemperature.toFixed(1)} °C</strong>
                </div>
                <span
                  className={
                    thermalTemperature < 0 || thermalTemperature > 35
                      ? 'thermal-warning'
                      : 'thermal-stable'
                  }
                >
                  {thermalTemperature < 0 || thermalTemperature > 35
                    ? pick('OUTSIDE COMFORT RANGE', 'KONFOR ARALIĞI DIŞINDA')
                    : pick('COMFORT RANGE', 'KONFOR ARALIĞINDA')}
                </span>
              </div>
              <div className="thermal-actions">
                <button
                  type="button"
                  className="advanced-action-button"
                  onClick={runThermalStep}
                >
                  <Play aria-hidden="true" /> {pick('SIMULATE 1 HOUR', '1 SAAT SİMÜLE ET')}
                </button>
                <button
                  type="button"
                  className="advanced-reset-button"
                  onClick={resetThermalExperiment}
                >
                  <RotateCcw aria-hidden="true" /> {pick('RESET', 'SIFIRLA')}
                </button>
              </div>
              <p className="experiment-footnote">
                {pick(
                  'Teaching model only: each simulated hour applies a fixed warming/cooling step moderated by insulation. Actual spacecraft temperatures require detailed thermal analysis of radiation, stored heat, materials, and mission conditions.',
                  'Yalnızca eğitim modelidir: her simüle edilen saat yalıtımla yumuşatılan sabit bir ısınma/soğuma adımı uygular. Gerçek uzay aracı sıcaklıkları radyasyon, depolanan ısı, malzemeler ve görev koşullarının ayrıntılı analizini gerektirir.',
                )}
              </p>
            </section>
          )}
        </div>
      )}
    </section>
  )
}
