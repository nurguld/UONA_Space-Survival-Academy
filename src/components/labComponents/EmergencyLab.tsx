import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import {
  Activity,
  AlertTriangle,
  BookOpen,
  Check,
  CheckCircle2,
  ClipboardList,
  DoorClosed,
  Info,
  Leaf,
  MoveRight,
  Play,
  Radio,
  RotateCcw,
  Shield,
  ShieldAlert,
  Siren,
  Sparkles,
  Sun,
  Users,
  Wind,
  X,
  Zap,
} from 'lucide-react'
import greenhouseArtwork from '../../assets/map-greenhouse.png'
import lifeSupportArtwork from '../../assets/map-lifesupport.png'
import shieldArtwork from '../../assets/map-shield.png'
import solarArtwork from '../../assets/map-solar.png'
import { useLanguage, type Language } from '../../context/LanguageContext'
import { handleInteractiveClick } from '../../game/sound'
import { LabTransitionOverlay } from '../LabTransition'
import { useLabTransition } from '../../hooks/useLabTransition'
import LabStationBadge from './LabStationBadge'
import './EmergencyLab.css'

type ActionId =
  | 'pause-eva'
  | 'guide-shelter'
  | 'check-dosimeter'
  | 'check-weather'
  | 'protect-power'
  | 'brief-crew'
  | 'count-crew'
  | 'seal-module'
  | 'check-pressure'
  | 'pause-harvest'
  | 'isolate-garden'
  | 'log-observation'

type LStr = Record<Language, string>

type MissionAction = {
  id: ActionId
  title: LStr
  detail: LStr
  feedback: LStr
  icon: typeof Shield
}

type EmergencyMission = {
  id: string
  title: LStr
  signal: LStr
  description: LStr
  sceneLabel: LStr
  crewStatus: LStr
  hazardStatus: LStr
  science: LStr
  actions: MissionAction[]
}

function shuffleActions(actions: MissionAction[], previousOrder?: MissionAction[]) {
  const shuffled = [...actions]

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
  }

  if (
    shuffled.length > 1 &&
    previousOrder?.length === shuffled.length &&
    shuffled.every((action, index) => action.id === previousOrder[index].id)
  ) {
    ;[shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]]
  }

  return shuffled
}

const MISSIONS: EmergencyMission[] = [
  {
    id: 'radiation',
    title: { en: 'The Sun Sends a Warning', tr: 'Güneş Uyarı Gönderiyor' },
    signal: { en: 'SPACE WEATHER ALERT', tr: 'UZAY HAVASI ALARMI' },
    description: {
      en: 'Be the crew’s space-weather helper! A monitor spots a radiation warning while two astronauts are getting ready to go outside.',
      tr: 'Ekibin uzay havası yardımcısı ol! İki astronot dışarı çıkmaya hazırlanırken monitörde bir radyasyon uyarısı belirdi.',
    },
    sceneLabel: {
      en: 'LUNAR BASE / EXTERIOR ACTIVITY PAUSED',
      tr: 'AY ÜSSÜ / DIŞ GÖREV DURAKLATILDI',
    },
    crewStatus: { en: 'Crew near the airlock', tr: 'Ekip hava kilidine yakın' },
    hazardStatus: { en: 'Radiation alert', tr: 'Radyasyon uyarısı' },
    science: {
      en: 'Space has energetic particles that can be harmful to people. NASA monitors space radiation, and astronauts can wear dosimeters that measure radiation. This story is a game, not a real safety plan.',
      tr: 'Uzayda insanlara zarar verebilecek yüksek enerjili parçacıklar bulunur. NASA uzay radyasyonunu izler ve astronotlar radyasyonu ölçen dozimetreler takabilir. Bu hikâye gerçek bir güvenlik planı değil, eğitici bir oyundur.',
    },
    actions: [
      {
        id: 'pause-eva',
        title: { en: 'Pause the spacewalk', tr: 'Uzay yürüyüşünü duraklat' },
        detail: { en: 'Hold the outside task for now.', tr: 'Dış görevi şimdilik beklet.' },
        feedback: {
          en: 'Outside activity is paused. The crew has time to follow the mission plan.',
          tr: 'Dış görev duraklatıldı. Ekibin görev planını uygulamak için vakti var.',
        },
        icon: DoorClosed,
      },
      {
        id: 'guide-shelter',
        title: { en: 'Guide crew to the safe room', tr: 'Ekibi güvenli odaya yönlendir' },
        detail: {
          en: 'Move the crew to the planned protected area.',
          tr: 'Ekibi planlanan korumalı alana taşı.',
        },
        feedback: {
          en: 'Crew is together in the designated safe area.',
          tr: 'Ekip belirlenen güvenli alanda bir arada.',
        },
        icon: Users,
      },
      {
        id: 'check-dosimeter',
        title: { en: 'Check the radiation monitor', tr: 'Radyasyon monitörünü kontrol et' },
        detail: {
          en: 'Review the monitor and crew dosimeter status.',
          tr: 'Monitör ve ekip dozimetre durumunu incele.',
        },
        feedback: {
          en: 'Monitor status checked. Mission Control has the latest information.',
          tr: 'Monitör durumu kontrol edildi. Görev Kontrol en güncel bilgiye sahip.',
        },
        icon: Activity,
      },
    ],
  },
  {
    id: 'storm',
    title: { en: 'Storm Watch at Mission Control', tr: 'Görev Kontrolde Fırtına Nöbeti' },
    signal: { en: 'SOLAR STORM WATCH', tr: 'GÜNEŞ FIRTINASI İZLEME' },
    description: {
      en: 'A new space-weather alert pops up! Help Mission Control check the latest information and keep the crew in the loop.',
      tr: 'Yeni bir uzay havası uyarısı ekranda belirdi! Görev Kontrolün güncel verileri incelemesine ve ekibi bilgilendirmesine yardım et.',
    },
    sceneLabel: { en: 'MISSION CONTROL / STAY ALERT', tr: 'GÖREV KONTROL / DİKKAT MODU' },
    crewStatus: { en: 'Crew awaiting update', tr: 'Ekip güncelleme bekliyor' },
    hazardStatus: { en: 'Space weather watch', tr: 'Uzay havası takibi' },
    science: {
      en: 'NASA teams watch the space-radiation environment and support mission operations. Space weather can change, so real crews follow their mission’s instructions.',
      tr: 'NASA ekipleri uzay radyasyonu ortamını izler ve görev operasyonlarını destekler. Uzay havası değişebilir; bu nedenle gerçek ekipler görev talimatlarını uygular.',
    },
    actions: [
      {
        id: 'check-weather',
        title: { en: 'Open the space-weather feed', tr: 'Uzay havası akışını aç' },
        detail: {
          en: 'Bring the latest monitoring update to the console.',
          tr: 'En son izleme verisini konsola getir.',
        },
        feedback: {
          en: 'Update received. Mission Control can make decisions using monitored conditions.',
          tr: 'Güncelleme alındı. Görev Kontrol izlenen koşullara göre karar verebilir.',
        },
        icon: Sun,
      },
      {
        id: 'protect-power',
        title: { en: 'Protect essential systems', tr: 'Temel sistemleri korumaya al' },
        detail: {
          en: 'Flag life support and communications as priority systems.',
          tr: 'Yaşam desteği ve iletişimi öncelikli sistemler olarak işaretle.',
        },
        feedback: {
          en: 'Essential systems are marked for protection. The outpost keeps its lifelines in view.',
          tr: 'Temel sistemler koruma altına alındı. Karakol hayati hatlarını güvenceye aldı.',
        },
        icon: Zap,
      },
      {
        id: 'brief-crew',
        title: { en: 'Send a crew briefing', tr: 'Ekibe brifing gönder' },
        detail: {
          en: 'Tell the crew what is happening and what to expect next.',
          tr: 'Ekibe neler olduğunu ve sıradaki adımları bildir.',
        },
        feedback: {
          en: 'Crew has been briefed and knows to follow the mission plan.',
          tr: 'Ekip bilgilendirildi ve görev planını takip etmeye hazır.',
        },
        icon: Radio,
      },
    ],
  },
  {
    id: 'pressure',
    title: { en: 'The Habitat Pressure Puzzle', tr: 'Habitat Basınç Bulmacası' },
    signal: { en: 'HABITAT SENSOR / PRESSURE CHANGE', tr: 'HABİTAT SENSÖRÜ / BASINÇ DEĞİŞİMİ' },
    description: {
      en: 'Be a habitat detective! A sensor reports a pressure change in one room, and the crew is in the next module.',
      tr: 'Habitat dedektifi ol! Bir sensör bir odada basınç değişimi bildiriyor ve ekip yan modülde.',
    },
    sceneLabel: { en: 'HABITAT / MODULE CHECK', tr: 'HABİTAT / MODÜL KONTROLÜ' },
    crewStatus: { en: 'Crew in neighboring module', tr: 'Ekip komşu modülde' },
    hazardStatus: { en: 'Pressure sensor warning', tr: 'Basınç sensörü uyarısı' },
    science: {
      en: 'The International Space Station is made of connected modules, including pressurized places where astronauts live and work. This pretend mission is for learning; real crews use their own checklists.',
      tr: 'Uluslararası Uzay İstasyonu, astronotların yaşadığı ve çalıştığı basınçlı bağlantılı modüllerden oluşur. Bu hayali görev öğrenme amaçlıdır; gerçek ekipler kendi kontrol listelerini kullanır.',
    },
    actions: [
      {
        id: 'count-crew',
        title: { en: 'Check in with every crewmate', tr: 'Tüm ekip arkadaşlarıyla bağlantı kur' },
        detail: {
          en: 'Use the radio to confirm everyone is in a safe area.',
          tr: 'Herkesin güvenli bölgede olduğunu telsizle doğrula.',
        },
        feedback: {
          en: 'Crew check complete. Mission Control knows where everyone is.',
          tr: 'Ekip yoklaması tamamlandı. Görev Kontrol herkesin yerini biliyor.',
        },
        icon: Users,
      },
      {
        id: 'seal-module',
        title: { en: 'Secure the affected module', tr: 'Etkilenen modülü yalıt' },
        detail: {
          en: 'Use the training control to close the module hatch.',
          tr: 'Eğitim kontrolüyle modül kapağını kapat.',
        },
        feedback: {
          en: 'The training module is isolated. The crew remains together in the neighboring area.',
          tr: 'Eğitim modülü yalıtıldı. Ekip yan bölmede bir arada güvende.',
        },
        icon: DoorClosed,
      },
      {
        id: 'check-pressure',
        title: { en: 'Read the pressure sensors', tr: 'Basınç sensörlerini oku' },
        detail: {
          en: 'Compare the module reading with the habitat status panel.',
          tr: 'Modül ölçümünü habitat durum paneliyle karşılaştır.',
        },
        feedback: {
          en: 'Sensor readings are logged for the team to review.',
          tr: 'Sensör verileri ekibin incelemesi için kaydedildi.',
        },
        icon: Wind,
      },
    ],
  },
  {
    id: 'garden',
    title: { en: 'Mystery in the Space Garden', tr: 'Uzay Bahçesindeki Gizem' },
    signal: { en: 'GARDEN SENSOR / CHECK PLANTS', tr: 'BAHÇE SENSÖRÜ / BİTKİ KONTROLÜ' },
    description: {
      en: 'A camera spots something unusual in the space garden! Help the crew pause, look closely, and save a science note.',
      tr: 'Bir kamera uzay bahçesinde olağandışı bir durum yakaladı! Ekibin durup yakından incelemesine ve bilim notu kaydetmesine yardım et.',
    },
    sceneLabel: { en: 'SPACE GARDEN / OBSERVATION MODE', tr: 'UZAY BAHÇESİ / GÖZLEM MODU' },
    crewStatus: { en: 'Crew ready to inspect', tr: 'Ekip incelemeye hazır' },
    hazardStatus: { en: 'Unknown plant change', tr: 'Bilinmeyen bitki değişimi' },
    science: {
      en: 'NASA’s Veggie is a garden on the space station. It helps researchers study how plants grow in microgravity and can give astronauts fresh food. Our mystery is made up for this game.',
      tr: 'NASA’nın Veggie projesi istasyondaki bir bahçedir. Bitkilerin mikro yerçekiminde gelişimini incelemeye yardımcı olur ve taze gıda sağlayabilir. Buradaki gizem oyun için kurgulanmıştır.',
    },
    actions: [
      {
        id: 'pause-harvest',
        title: { en: 'Pause garden work', tr: 'Bahçe çalışmasını durdur' },
        detail: {
          en: 'Ask the crew to stop handling plants for a moment.',
          tr: 'Ekipten bitkilere dokunmayı bir süreliğine durdurmasını iste.',
        },
        feedback: {
          en: 'Garden work is paused while the crew checks the unusual patch.',
          tr: 'Ekip olağandışı bölgeyi kontrol ederken bahçe işi duraklatıldı.',
        },
        icon: Leaf,
      },
      {
        id: 'isolate-garden',
        title: { en: 'Mark the garden zone', tr: 'Bahçe bölgesini işaretle' },
        detail: {
          en: 'Keep the observation area separate in the training map.',
          tr: 'Eğitim haritasında gözlem alanını ayrı tut.',
        },
        feedback: {
          en: 'The garden zone is marked so the observation can be checked calmly.',
          tr: 'Gözlemin sakin şekilde incelenebilmesi için bahçe bölgesi işaretlendi.',
        },
        icon: ShieldAlert,
      },
      {
        id: 'log-observation',
        title: { en: 'Save a plant photo and note', tr: 'Bitki fotoğrafı ve notu kaydet' },
        detail: {
          en: 'Record what the camera spotted for the science team.',
          tr: 'Kameranın yakaladığını bilim ekibi için kaydet.',
        },
        feedback: {
          en: 'Observation saved. Good science starts with careful notes.',
          tr: 'Gözlem kaydedildi. İyi bilim dikkatli notlarla başlar.',
        },
        icon: ClipboardList,
      },
    ],
  },
]

export default function EmergencyLab() {
  const { lang, pick } = useLanguage()
  const {
    activeSection: activeTab,
    isRocketFlying,
    transitionTo: handleTabChange,
  } = useLabTransition<'guide' | 'simulation'>('guide')
  const [missionIndex, setMissionIndex] = useState(0)
  const [openBriefing, setOpenBriefing] = useState<{
    id: string
    originX: number
    originY: number
  } | null>(null)
  const briefingTriggerRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const closeBriefingRef = useRef<HTMLButtonElement | null>(null)
  const [finishedActions, setFinishedActions] = useState<Record<string, ActionId[]>>({})
  const [displayedActions, setDisplayedActions] = useState<Record<string, MissionAction[]>>(() =>
    Object.fromEntries(MISSIONS.map((mission) => [mission.id, shuffleActions(mission.actions)])),
  )
  const [failedMissions, setFailedMissions] = useState<Record<string, LStr>>({})
  const [lastAction, setLastAction] = useState<MissionAction | null>(null)

  const mission = MISSIONS[missionIndex]
  const missionActions = finishedActions[mission.id] ?? []
  const missionDisplayActions = displayedActions[mission.id] ?? mission.actions
  const nextAction = mission.actions[missionActions.length]
  const missionFailure = failedMissions[mission.id]
  const completedMissions = MISSIONS.filter((item) =>
    item.actions.every((action) => (finishedActions[item.id] ?? []).includes(action.id)),
  ).length
  const isMissionComplete = mission.actions.every((action) => missionActions.includes(action.id))
  const isMissionFailed = Boolean(missionFailure)
  const crewMoved =
    missionActions.includes('guide-shelter') || missionActions.includes('count-crew')
  const systemSecured =
    missionActions.includes('protect-power') ||
    missionActions.includes('seal-module') ||
    missionActions.includes('isolate-garden')
  const statusValue = Math.round((missionActions.length / mission.actions.length) * 100)

  function showBriefing(id: string, trigger: HTMLButtonElement) {
    const bounds = trigger.getBoundingClientRect()
    briefingTriggerRefs.current[id] = trigger
    setOpenBriefing({
      id,
      originX: bounds.left + bounds.width / 2 - window.innerWidth / 2,
      originY: bounds.top + bounds.height / 2 - window.innerHeight / 2,
    })
  }

  function closeBriefing() {
    const currentId = openBriefing?.id
    setOpenBriefing(null)
    if (currentId) {
      requestAnimationFrame(() => briefingTriggerRefs.current[currentId]?.focus())
    }
  }

  useEffect(() => {
    if (!openBriefing) return

    const currentId = openBriefing.id
    closeBriefingRef.current?.focus()
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpenBriefing(null)
        requestAnimationFrame(() => briefingTriggerRefs.current[currentId]?.focus())
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [openBriefing])

  function performAction(action: MissionAction) {
    if (isMissionFailed || isMissionComplete) return
    if (!nextAction) return
    if (action.id !== nextAction.id) {
      setFailedMissions((previous) => ({
        ...previous,
        [mission.id]: {
          en: `That tool was used too soon. The crew needed “${nextAction.title.en}” first.`,
          tr: `Bu araç çok erken kullanıldı. Ekibin önce “${nextAction.title.tr}” adımına ihtiyacı vardı.`,
        },
      }))
      setLastAction(null)
      return
    }

    setFinishedActions((previous) => ({
      ...previous,
      [mission.id]: [...(previous[mission.id] ?? []), action.id],
    }))
    setLastAction(action)
  }

  function selectMission(index: number) {
    setMissionIndex(index)
    setLastAction(null)
  }

  function retryMission() {
    setFinishedActions((previous) => ({ ...previous, [mission.id]: [] }))
    setDisplayedActions((previous) => ({
      ...previous,
      [mission.id]: shuffleActions(mission.actions, previous[mission.id]),
    }))
    setFailedMissions((previous) => {
      const next = { ...previous }
      delete next[mission.id]
      return next
    })
    setLastAction(null)
  }

  function restartAllMissions() {
    setFinishedActions({})
    setDisplayedActions((previous) =>
      Object.fromEntries(
        MISSIONS.map((item) => [item.id, shuffleActions(item.actions, previous[item.id])]),
      ),
    )
    setFailedMissions({})
    setMissionIndex(0)
    setLastAction(null)
  }

  return (
    <div className="relative mx-auto max-w-4xl overflow-hidden rounded-xl border border-red-500/30 bg-slate-950 p-6 text-cyan-400 shadow-2xl">
      <LabTransitionOverlay visible={isRocketFlying} />

      <div className="mb-6 flex flex-col items-start justify-between gap-4 border-b border-cyan-800/50 pb-4 md:flex-row md:items-center">
        <div className="lab-station-heading">
          <LabStationBadge station="emergency" />
          <div>
            <h2 className="text-xl font-bold tracking-wider text-white">
              {pick('EMERGENCY RESPONSE LAB', 'ACİL DURUM MÜDAHALE LABORATUVARI')}
            </h2>
            <p className="text-xs text-slate-400">
              {pick('Episode 02: The Aurora Outpost radio log', 'Bölüm 02: Aurora Karakolu telsiz kaydı')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 p-1.5">
          <button
            type="button"
            onClick={() => handleTabChange('guide')}
            aria-pressed={activeTab === 'guide'}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${activeTab === 'guide' ? 'bg-red-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            <BookOpen className="h-4 w-4" /> {pick('Mission Briefing', 'Görev Brifingi')}
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('simulation')}
            aria-pressed={activeTab === 'simulation'}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${activeTab === 'simulation' ? 'bg-red-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            <Play className="h-4 w-4" /> {pick('Rescue Mission', 'Kurtarma Görevi')}
          </button>
        </div>
      </div>

      {activeTab === 'guide' ? (
        <div className="emergency-briefing">
          <section className="emergency-briefing-hero">
            <div className="emergency-briefing-icon">
              <Radio aria-hidden="true" />
            </div>
            <div className="emergency-briefing-copy">
              <span className="emergency-briefing-kicker">
                <i /> {pick('INCOMING FROM AURORA OUTPOST', 'AURORA KARAKOLUNDAN GELEN İLETİ')}
              </span>
              <h3>{pick('Mission briefing', 'Görev brifingi')}</h3>
              <p>
                {pick(
                  'Four sealed alerts. Open a message to reveal the situation and its space-science clue.',
                  'Dört mühürlü uyarı. Durumu ve uzay bilimi ipucunu görmek için bir mesaj aç.',
                )}
              </p>
            </div>
            <div className="emergency-briefing-count">
              <strong>04</strong>
              <span>{pick('RADIO LOGS', 'TELSİZ KAYDI')}</span>
            </div>
          </section>

          <div className="emergency-briefing-section-heading">
            <span>{pick('INCOMING MESSAGES', 'GELEN MESAJLAR')}</span>
            <span>{pick('SELECT AN ENVELOPE TO OPEN', 'AÇMAK İÇİN BİR ZARF SEÇ')}</span>
          </div>

          <div className="emergency-briefing-grid">
            {MISSIONS.map((item, index) => (
              <article key={item.id} className={`emergency-briefing-card briefing-${item.id}`}>
                <button
                  type="button"
                  className="emergency-envelope"
                  ref={(element) => {
                    briefingTriggerRefs.current[item.id] = element
                  }}
                  aria-haspopup="dialog"
                  aria-expanded={openBriefing?.id === item.id}
                  aria-controls={`briefing-letter-${item.id}`}
                  onClick={(event) => showBriefing(item.id, event.currentTarget)}
                >
                  <span className="emergency-envelope-flap" aria-hidden="true" />
                  <span className="emergency-envelope-topline">
                    <span>{pick('INCOMING', 'GELEN')} · 0{index + 1}</span>
                    <ShieldAlert aria-hidden="true" />
                  </span>
                  <strong>{item.title[lang]}</strong>
                  <span className="emergency-envelope-signal">{item.signal[lang]}</span>
                  <span className="emergency-envelope-seal" aria-hidden="true">
                    ✦
                  </span>
                  <span className="emergency-envelope-hint">
                    {pick('OPEN MESSAGE', 'MESAJI AÇ')} <MoveRight aria-hidden="true" />
                  </span>
                </button>
              </article>
            ))}
          </div>

          <div className="emergency-briefing-footer">
            <span>
              <Info aria-hidden="true" />{' '}
              {pick('Training scenarios are fictional.', 'Eğitim senaryoları kurgusaldır.')}
            </span>
            <button type="button" onClick={() => handleTabChange('simulation')}>
              {pick('Enter Mission Control', 'Görev Kontrolüne Gir')} <Play aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : (
        <div className="emergency-adventure">
          <div className="emergency-adventure-heading">
            <div>
              <span className="emergency-adventure-kicker">
                <Siren aria-hidden="true" />{' '}
                {pick('JUNIOR MISSION CONTROL', 'GENÇ GÖREV KONTROL')}
              </span>
              <h3>{pick('Your crew needs a helper!', 'Ekibinin bir yardımcıya ihtiyacı var!')}</h3>
              <p>
                {pick(
                  'Choose the best tool for the situation. A rushed move can fail the drill, but you can always retry.',
                  'Duruma en uygun aracı seç. Aceleci bir hamle tatbikatı başarısız kılabilir ama her zaman tekrar deneyebilirsin.',
                )}
              </p>
            </div>
            <div
              className="emergency-patch-count"
              aria-label={pick(
                `${completedMissions} of ${MISSIONS.length} adventure patches earned`,
                `${MISSIONS.length} macera armasından ${completedMissions} kazanıldı`,
              )}
            >
              <span>{pick('MISSION PATCHES', 'GÖREV ARMALARI')}</span>
              <strong>
                {'★'.repeat(completedMissions)}
                <span>{'☆'.repeat(MISSIONS.length - completedMissions)}</span>
              </strong>
            </div>
          </div>

          <div className="emergency-adventure-layout">
            <nav
              className="emergency-adventure-map"
              aria-label={pick('Choose an adventure', 'Bir macera seç')}
            >
              <span className="emergency-map-title">{pick('MISSION MAP', 'GÖREV HARİTASI')}</span>
              {MISSIONS.map((item, index) => {
                const done = item.actions.every((action) =>
                  (finishedActions[item.id] ?? []).includes(action.id),
                )
                const failed = Boolean(failedMissions[item.id])
                return (
                  <button
                    type="button"
                    key={item.id}
                    aria-current={missionIndex === index ? 'step' : undefined}
                    className={`${missionIndex === index ? 'active' : ''} ${done ? 'done' : ''} ${failed ? 'failed' : ''}`}
                    onClick={() => selectMission(index)}
                  >
                    <span>
                      {done ? <Check aria-hidden="true" /> : failed ? '!' : `0${index + 1}`}
                    </span>
                    <strong>{item.title[lang]}</strong>
                  </button>
                )
              })}
              {completedMissions > 0 && (
                <button type="button" className="emergency-map-restart" onClick={restartAllMissions}>
                  <RotateCcw aria-hidden="true" />{' '}
                  {pick('Start a new adventure', 'Yeni macera başlat')}
                </button>
              )}
            </nav>

            <section
              className={`emergency-adventure-main${isMissionFailed ? ' failed' : ''}`}
              aria-live="polite"
            >
              <div className={`emergency-space-scene scene-${mission.id}`}>
                <span className="emergency-scene-stars" aria-hidden="true" />
                <span className="emergency-scene-label">{mission.sceneLabel[lang]}</span>
                <span className="emergency-scene-hazard">
                  {mission.id === 'radiation' || mission.id === 'storm' ? (
                    <Sun aria-hidden="true" />
                  ) : mission.id === 'pressure' ? (
                    <Wind aria-hidden="true" />
                  ) : (
                    <Leaf aria-hidden="true" />
                  )}
                </span>
                <div
                  className={`emergency-scene-crew${crewMoved ? ' moved' : ''}`}
                  aria-label={mission.crewStatus[lang]}
                >
                  <span>👩‍🚀</span>
                  <span>👨‍🚀</span>
                </div>
                <div
                  className={`emergency-scene-base${systemSecured ? ' secured' : ''}`}
                  aria-hidden="true"
                >
                  <span className="emergency-base-window" />
                  <span className="emergency-base-door" />
                  <span className="emergency-base-panel">●</span>
                </div>
                <div
                  className={`emergency-scene-shelter${crewMoved ? ' active' : ''}`}
                  aria-hidden="true"
                >
                  <Shield aria-hidden="true" />
                  <span>{pick('SAFE ZONE', 'GÜVENLİ ALAN')}</span>
                </div>
                <div className="emergency-scene-status">
                  <span>
                    <i className="emergency-status-dot" />
                    {mission.hazardStatus[lang]}
                  </span>
                  <span>
                    <Users aria-hidden="true" />
                    {crewMoved ? pick('Crew together', 'Ekip bir arada') : mission.crewStatus[lang]}
                  </span>
                  <span>
                    <Zap aria-hidden="true" />
                    {systemSecured
                      ? pick('Systems secured', 'Sistemler güvende')
                      : pick('Systems online', 'Sistemler çevrimiçi')}
                  </span>
                </div>
              </div>

              <div className="emergency-adventure-story">
                <span className="emergency-transmission">
                  <Radio aria-hidden="true" />{' '}
                  {pick('INCOMING TRANSMISSION', 'GELEN İLETİ')}
                </span>
                <p>{lastAction ? lastAction.feedback[lang] : mission.description[lang]}</p>
              </div>

              <div className="emergency-action-heading">
                <div>
                  <span>{pick('MISSION CONTROL CONSOLE', 'GÖREV KONTROL KONSOLU')}</span>
                  <p>
                    {pick(
                      'Think about what the crew needs first, then choose a tool.',
                      'Ekibin ilk önce neye ihtiyacı olduğunu düşün, ardından bir araç seç.',
                    )}
                  </p>
                </div>
                <span>
                  {missionActions.length} / {mission.actions.length} {pick('tasks', 'görev')}
                </span>
              </div>

              <div className="emergency-action-console">
                {missionDisplayActions.map((action) => {
                  const done = missionActions.includes(action.id)
                  const ActionIcon = action.icon
                  return (
                    <button
                      type="button"
                      key={action.id}
                      disabled={done || isMissionFailed || isMissionComplete}
                      className={`emergency-console-action${done ? ' complete' : ''}`}
                      onClick={() => performAction(action)}
                    >
                      <span className="emergency-console-icon">
                        {done ? <CheckCircle2 aria-hidden="true" /> : <ActionIcon aria-hidden="true" />}
                      </span>
                      <span className="emergency-console-copy">
                        <strong>{action.title[lang]}</strong>
                        <small>{done ? pick('DONE!', 'TAMAMLANDI!') : action.detail[lang]}</small>
                      </span>
                      {!done && <MoveRight className="emergency-console-arrow" aria-hidden="true" />}
                    </button>
                  )
                })}
              </div>

              {isMissionFailed ? (
                <div className="emergency-adventure-failed" role="alert">
                  <span className="emergency-failed-icon">
                    <AlertTriangle aria-hidden="true" />
                  </span>
                  <div>
                    <strong>{pick('MISSION FAILED', 'GÖREV BAŞARISIZ')}</strong>
                    <p>
                      {missionFailure?.[lang]}{' '}
                      {pick(
                        'Follow the highlighted order and try again.',
                        'Doğru sırayı takip edip tekrar dene.',
                      )}
                    </p>
                  </div>
                  <button type="button" onClick={retryMission}>
                    <RotateCcw aria-hidden="true" /> {pick('RETRY MISSION', 'TEKRAR DENE')}
                  </button>
                </div>
              ) : isMissionComplete ? (
                <div className="emergency-adventure-complete">
                  <span className="emergency-complete-stars" aria-hidden="true">
                    ★
                  </span>
                  <div>
                    <strong>{pick('MISSION COMPLETE!', 'GÖREV TAMAMLANDI!')}</strong>
                    <p>
                      {pick(
                        `${mission.title.en} is complete in the correct order. You earned one mission patch!`,
                        `${mission.title.tr} doğru sırayla tamamlandı. Bir görev arması kazandın!`,
                      )}
                    </p>
                  </div>
                  {missionIndex < MISSIONS.length - 1 ? (
                    <button type="button" onClick={() => selectMission(missionIndex + 1)}>
                      {pick('NEXT ADVENTURE', 'SONRAKİ MACERA')} <MoveRight aria-hidden="true" />
                    </button>
                  ) : (
                    <button type="button" onClick={restartAllMissions}>
                      {pick('PLAY AGAIN', 'TEKRAR OYNA')} <RotateCcw aria-hidden="true" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="emergency-task-progress">
                  <span>{pick('TASK PROGRESS', 'GÖREV İLERLEMESİ')}</span>
                  <span className="emergency-task-track">
                    <i style={{ width: `${statusValue}%` }} />
                  </span>
                  <strong>{statusValue}%</strong>
                  <small>{pick('mission actions complete', 'görev adımı tamamlandı')}</small>
                </div>
              )}

              <div className="emergency-adventure-science">
                <BookOpen aria-hidden="true" />
                <p>
                  <strong>{pick('SPACE FACT', 'UZAY BİLGİSİ')}</strong>
                  {mission.science[lang]}
                </p>
              </div>
            </section>
          </div>

          <p className="emergency-adventure-note">
            <AlertTriangle aria-hidden="true" />{' '}
            {pick(
              'This is a fictional learning game, not a real emergency procedure. Mission meters are game progress only; real crews follow approved mission-control guidance.',
              'Bu kurgusal bir öğrenme oyunudur, gerçek bir acil durum prosedürü değildir. Görev sayaçları yalnızca oyun ilerlemesidir; gerçek ekipler onaylı görev kontrol yönergelerini izler.',
            )}
          </p>
        </div>
      )}
      {openBriefing &&
        (() => {
          const selectedMission = MISSIONS.find((item) => item.id === openBriefing.id)
          if (!selectedMission) return null
          const SignalArtwork =
            selectedMission.id === 'radiation'
              ? shieldArtwork
              : selectedMission.id === 'storm'
                ? solarArtwork
                : selectedMission.id === 'pressure'
                  ? lifeSupportArtwork
                  : greenhouseArtwork
          const SignalMarker =
            selectedMission.id === 'radiation'
              ? ShieldAlert
              : selectedMission.id === 'storm'
                ? Zap
                : selectedMission.id === 'pressure'
                  ? Activity
                  : Sparkles

          return createPortal(
            <div
              className="emergency-letter-overlay"
              onClickCapture={(event) => handleInteractiveClick(event.target)}
            >
              <button
                type="button"
                className="emergency-letter-backdrop"
                aria-label={pick('Close mission letter', 'Görev mektubunu kapat')}
                onClick={closeBriefing}
              />
              <article
                id={`briefing-letter-${selectedMission.id}`}
                className={`emergency-letter-paper briefing-${selectedMission.id}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby={`briefing-title-${selectedMission.id}`}
                style={
                  {
                    '--paper-origin-x': `${openBriefing.originX}px`,
                    '--paper-origin-y': `${openBriefing.originY}px`,
                  } as CSSProperties
                }
              >
                <div className="emergency-letter-paper-header">
                  <span className="emergency-letter-origin">
                    <Radio aria-hidden="true" /> {pick('AURORA OUTPOST', 'AURORA KARAKOLU')}
                  </span>
                  <span className="emergency-letter-live">
                    <i /> {pick('INCOMING TRANSMISSION', 'GELEN İLETİ')}
                  </span>
                  <button
                    type="button"
                    ref={closeBriefingRef}
                    aria-label={pick('Close mission letter', 'Görev mektubunu kapat')}
                    onClick={closeBriefing}
                  >
                    <X aria-hidden="true" />
                  </button>
                </div>
                <div className="emergency-letter-paper-body">
                  <div className="emergency-letter-signal-row">
                    <span
                      className={`emergency-letter-signal-icon emblem-${selectedMission.id}`}
                      aria-hidden="true"
                    >
                      <span className="emergency-letter-emblem-orbit" />
                      <img className="emergency-letter-emblem-art" src={SignalArtwork} alt="" />
                      <SignalMarker className="emergency-letter-emblem-marker" />
                    </span>
                    <span className="emergency-letter-paper-signal">
                      {selectedMission.signal[lang]}
                    </span>
                    <span className="emergency-letter-log">
                      {pick('LOG', 'KAYIT')} 0
                      {MISSIONS.findIndex((item) => item.id === selectedMission.id) + 1}
                    </span>
                  </div>
                  <h3 id={`briefing-title-${selectedMission.id}`}>
                    {selectedMission.title[lang]}
                  </h3>
                  <div className="emergency-letter-divider">
                    <span />
                  </div>
                  <div className="emergency-letter-situation">
                    <span className="emergency-letter-section-label">
                      {pick('SITUATION REPORT', 'DURUM RAPORU')}
                    </span>
                    <p>{selectedMission.description[lang]}</p>
                  </div>
                  <div className="emergency-letter-paper-fact">
                    <div className="emergency-letter-fact-icon">
                      <span className="emergency-letter-fact-orbit" />
                      <BookOpen aria-hidden="true" />
                      <i aria-hidden="true" />
                    </div>
                    <div>
                      <strong>{pick('SPACE SCIENCE', 'UZAY BİLİMİ')}</strong>
                      <p>{selectedMission.science[lang]}</p>
                    </div>
                  </div>
                  <div className="emergency-letter-paper-footer">
                    <span>
                      <Activity aria-hidden="true" />{' '}
                      {pick(
                        'TRAINING DATA · FICTIONAL SCENARIO',
                        'EĞİTİM VERİSİ · KURGUSAL SENARYO',
                      )}
                    </span>
                    <span className="emergency-letter-signal-bars" aria-hidden="true">
                      <i />
                      <i />
                      <i />
                      <i />
                    </span>
                  </div>
                </div>
              </article>
            </div>,
            document.body,
          )
        })()}
    </div>
  )
}
