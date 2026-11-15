import { Link } from 'react-router-dom'
import astronautImg from '../../assets/sprite-astronaut.png'
import BuildingSprite from '../../components/BuildingSprite'
import Navbar from '../../components/Navbar'
import { useLanguage, type Language } from '../../context/LanguageContext'
import { playClick } from '../../game/sound'
import type { ModuleId } from '../../types'

interface ScienceReference {
  id: string
  moduleId: ModuleId
  title: string
  nasaFact: string
  gameLink: string
  sourceName: string
  sourceUrl: string
}

const REFERENCES: Record<Language, ScienceReference[]> = {
  en: [
    {
      id: 'lunar-night',
      moduleId: 'solar',
      title: '14-Day Lunar Night & Extreme Cold',
      nasaFact:
        'Due to the Moon’s ~29.5-day rotation cycle, nighttime lasts roughly 14.7 Earth days. With no atmosphere, surface temperatures plunge to -180 °C (-292 °F) and solar arrays produce zero power.',
      gameLink:
        'Days 15–28 mark Lunar Night in the game: Solar Arrays pause and pre-built Battery Banks keep the base alive.',
      sourceName: 'NASA Artemis · Lunar Surface Power',
      sourceUrl: 'https://www.nasa.gov/mission/artemis/',
    },
    {
      id: 'eclss-oxygen-water',
      moduleId: 'lifeSupport',
      title: 'Daily Astronaut Oxygen & Water Needs',
      nasaFact:
        'Per NASA ECLSS data, an astronaut breathes ~0.84–0.89 kg of oxygen daily and uses ~2.4 kg of drinking/food water (~9.2 kg/day including hygiene). ISS systems recycle 93–98% of water.',
      gameLink:
        'In the game, the Life Support module handles daily oxygen/water production; letting it drop weakens both crew health and crops.',
      sourceName: 'NASA ISS ECLSS · Environmental Control and Life Support',
      sourceUrl: 'https://www.nasa.gov/international-space-station/space-station-life-support/',
    },
    {
      id: 'food-greenhouse',
      moduleId: 'greenhouse',
      title: 'Daily Food Consumption & Closed-Loop Farming',
      nasaFact:
        'An astronaut consumes ~0.62 kg of dry food daily (~1.75 kg hydrated, 2,500–3,000 kcal). Unlike air and water, food cannot be recycled, making local hydroponic growth vital for long missions.',
      gameLink:
        'In the game, the Greenhouse spends power and water to grow food daily, and higher levels unlock bonus options in supply events.',
      sourceName: 'NASA Space Food & Veggie Plant Growth',
      sourceUrl: 'https://www.nasa.gov/directorates/somd/space-food-systems/',
    },
    {
      id: 'lunar-radiation',
      moduleId: 'shield',
      title: 'Cosmic & Solar Radiation on the Lunar Surface',
      nasaFact:
        'Lacking a global magnetic field or thick atmosphere, the Moon receives ~1.37 mSv/day (~2.6× higher than the ISS). Solar Particle Events (SPEs) can spike radiation rapidly.',
      gameLink:
        'In the game, Radiation Shielding keeps daily radiation health loss minimal and unlocks safe protective responses during solar storms.',
      sourceName: 'NASA Space Radiation Analysis & Artemis',
      sourceUrl: 'https://www.nasa.gov/missions/artemis/nasa-releases-artemis-i-radiation-data/',
    },
    {
      id: 'microgravity-exercise',
      moduleId: 'exercise',
      title: 'Daily Exercise in Low Gravity',
      nasaFact:
        'Low gravity causes muscle atrophy and 1–1.5% bone mineral density loss per month. To counter this, ISS astronauts perform ~2–2.5 hours of resistance (ARED) and cardio (T2 treadmill) daily.',
      gameLink:
        'In the game, Exercise Equipment offsets daily crew health decay—without it, crew condition steadily erodes.',
      sourceName: 'NASA Human Research Program · Countermeasures',
      sourceUrl: 'https://www.nasa.gov/humans-in-space/exercising-in-space/',
    },
  ],
  tr: [
    {
      id: 'lunar-night',
      moduleId: 'solar',
      title: '14 Günlük Ay Gecesi ve Aşırı Soğuk',
      nasaFact:
        'Ay’ın yaklaşık 29,5 günlük dönüş döngüsü nedeniyle gece dönemi ~14,7 Dünya günü sürer. Atmosfer bulunmadığından yüzey sıcaklığı -180 °C (-292 °F) seviyelerine iner ve güneş panelleri elektrik üretemez.',
      gameLink:
        'Oyunda 15–28. günler arası Ay gecesidir: Güneş panelleri durur, önceden kurulan Batarya devrede kalarak üssü ayakta tutar.',
      sourceName: 'NASA Artemis · Lunar Surface Power',
      sourceUrl: 'https://www.nasa.gov/mission/artemis/',
    },
    {
      id: 'eclss-oxygen-water',
      moduleId: 'lifeSupport',
      title: 'Astronotların Günlük Oksijen ve Su İhtiyacı',
      nasaFact:
        'NASA Yaşam Destek (ECLSS) verilerine göre bir astronot günde ortalama ~0,84–0,89 kg oksijen solur; içme ve yemek için ~2,4 kg su (kişisel hijyen dahil ~9,2 kg/gün) tüketir. ISS sistemi suyun %93–98’ini geri dönüştürür.',
      gameLink:
        'Oyunda Yaşam Destek modülü günlük oksijen/su üretimini sağlar; seviye yetersiz kalırsa hem sağlık hem sera üretimi düşer.',
      sourceName: 'NASA ISS ECLSS · Environmental Control and Life Support',
      sourceUrl: 'https://www.nasa.gov/international-space-station/space-station-life-support/',
    },
    {
      id: 'food-greenhouse',
      moduleId: 'greenhouse',
      title: 'Günlük Gıda Tüketimi ve Kapalı Tarım',
      nasaFact:
        'Bir astronot günde yaklaşık 0,62 kg kuru gıda (ambalaj ve nem dahil ~1,75 kg, 2.500–3.000 kcal) tüketir. Hava ve sudan farklı olarak gıda geri dönüştürülemez; uzun görevlerde yerinde hidroponik üretim kritik önem taşır.',
      gameLink:
        'Oyunda Sera modülü enerji ve su kullanarak günlük gıda üretir; yüksek seviyeleri acil ikmal olaylarında bonus kilidini açar.',
      sourceName: 'NASA Space Food & Veggie Plant Growth',
      sourceUrl: 'https://www.nasa.gov/directorates/somd/space-food-systems/',
    },
    {
      id: 'lunar-radiation',
      moduleId: 'shield',
      title: 'Ay Yüzeyinde Kozmik ve Güneş Radyasyonu',
      nasaFact:
        'Ay’ın küresel manyetik alanı ve kalın atmosferi olmadığı için yüzeyde ölçülen doğal radyasyon dozu günde ~1,37 mSv’dir (ISS’tekinin ~2,6 katı). Güneş fırtınalarında (SPE) radyasyon hızla tehlikeli düzeye çıkar.',
      gameLink:
        'Oyunda Kalkan modülü radyasyon korumasını %100’e yakın tutarak günlük sağlık kaybını azaltır ve fırtına olaylarında sığınak açar.',
      sourceName: 'NASA Space Radiation Analysis & Artemis',
      sourceUrl: 'https://www.nasa.gov/missions/artemis/nasa-releases-artemis-i-radiation-data/',
    },
    {
      id: 'microgravity-exercise',
      moduleId: 'exercise',
      title: 'Düşük Yerçekiminde Günlük Egzersiz',
      nasaFact:
        'Düşük/mikro yerçekimi kas kaybına ve ayda %1–1,5 kemik mineral yoğunluğu kaybına yol açar. Bunu önlemek için ISS’teki astronotlar her gün yaklaşık 2–2,5 saat direnç (ARED) ve kardiyo (T2 koşu bandı) egzersizi yapar.',
      gameLink:
        'Oyunda Egzersiz Ekipmanı mürettebatın günlük sağlık düşüşünü dengeler; kurulmazsa sağlık her gün erir.',
      sourceName: 'NASA Human Research Program · Countermeasures',
      sourceUrl: 'https://www.nasa.gov/humans-in-space/exercising-in-space/',
    },
  ],
}

function ReferenceDiorama({ moduleId, title }: { moduleId: ModuleId; title: string }) {
  return (
    <div className="relative sm:w-[138px] h-[112px] sm:h-auto shrink-0 rounded-xl border border-slate-300/20 bg-[radial-gradient(circle_at_35%_22%,rgba(56,189,248,0.16),transparent_62%),linear-gradient(180deg,#081022_0%,#0C1730_74%,#334155_75%,#475569_100%)] p-2.5 flex items-end justify-center overflow-hidden">
      {/* Mini arka plan yıldızları ve Ay detayı */}
      <svg
        viewBox="0 0 120 80"
        className="pointer-events-none absolute inset-0 w-full h-full opacity-75"
        aria-hidden="true"
      >
        <circle cx="16" cy="14" r="1.1" fill="#E2E8F0" />
        <circle cx="96" cy="12" r="1.3" fill="#BAE6FD" />
        <circle cx="104" cy="30" r="0.9" fill="#CBD5E1" />
        <circle cx="44" cy="10" r="0.8" fill="#E2E8F0" />
        {moduleId === 'solar' && (
          <g>
            <circle cx="24" cy="24" r="10" fill="#CBD5E1" opacity="0.85" />
            <circle cx="28" cy="21" r="2.2" fill="#94A3B8" />
            <circle cx="20" cy="26" r="1.6" fill="#94A3B8" />
          </g>
        )}
        {moduleId === 'lifeSupport' && (
          <path
            d="M98 14 C103 21 103 27 98 29 C93 27 93 21 98 14 Z"
            fill="#38BDF8"
            stroke="#0F172A"
            strokeWidth="1.2"
          />
        )}
      </svg>

      {/* Modül 2.5D Sprite'ı */}
      <div className="relative z-10 h-[84px] flex items-end justify-center">
        <BuildingSprite
          moduleId={moduleId}
          level={moduleId === 'exercise' ? 1 : 2}
          alt={title}
        />
      </div>

      {/* Egzersiz kartında astronot detayı */}
      {moduleId === 'exercise' && (
        <img
          src={astronautImg}
          alt=""
          draggable={false}
          aria-hidden="true"
          className="relative z-20 -ml-6 h-[56px] w-auto object-contain drop-shadow-[0_3px_5px_rgba(0,0,0,0.65)] select-none"
        />
      )}
    </div>
  )
}

export default function Resources() {
  const { lang, pick } = useLanguage()

  return (
    <div className="relative min-h-dvh overflow-x-clip bg-[#040814] text-white pb-12">
      {/* Uzay Yıldız & Işıltı Arka Planı */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,rgba(56,189,248,0.14),transparent_55%),radial-gradient(ellipse_at_bottom_left,rgba(99,102,241,0.10),transparent_55%)]"
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        <Navbar />

        {/* Başlık ve Oyuna Dön CTA */}
        <div className="mt-7 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-400">
              {pick('Scientific Basis & Transparency', 'Bilimsel Dayanak & Şeffaflık')}
            </span>
            <h1 className="text-3xl sm:text-[2.65rem] font-extrabold tracking-tight text-white mt-1 leading-tight">
              {pick('NASA Resources & Data', 'NASA Kaynakları & Veriler')}
            </h1>
            <p className="text-slate-300 text-sm sm:text-[15px] mt-2 max-w-2xl leading-relaxed">
              {pick(
                'Junior Space Academy simulation balance is inspired by NASA data on lunar surface conditions, life support (ECLSS), space radiation, and astronaut health.',
                'Junior Space Academy oyun dengesi, NASA’nın Ay yüzeyi, yaşam destek (ECLSS), radyasyon ve astronot sağlığı verilerinden esinlenerek tasarlanmıştır.',
              )}
            </p>
          </div>

          <Link
            to="/oyun"
            onClick={() => playClick()}
            className="px-5 min-h-11 rounded-xl text-sm font-bold inline-flex items-center bg-gradient-to-r from-[#22C9EB] to-[#38BDF8] text-slate-950 shadow-[0_0_24px_rgba(34,211,238,0.4)] hover:brightness-110 transition-all shrink-0"
          >
            {pick('Return to Game →', 'Oyuna Dön →')}
          </Link>
        </div>

        {/* 3x2 Simetrik Kart Izgarası: 5 Bilimsel Kart + 1 Şeffaflık Kartı */}
        <div className="grid md:grid-cols-2 gap-4">
          {REFERENCES[lang].map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-slate-300/35 bg-gradient-to-b from-[#172133]/88 to-[#101829]/94 backdrop-blur-md p-4 sm:p-5 flex flex-col sm:flex-row items-stretch gap-4 shadow-[0_12px_30px_rgba(4,9,20,0.45)]"
            >
              <ReferenceDiorama moduleId={item.moduleId} title={item.title} />

              <div className="flex-1 min-w-0 flex flex-col justify-between gap-2.5">
                <div>
                  <h2 className="text-base sm:text-[17px] font-bold text-white leading-snug">
                    {item.title}
                  </h2>
                  <p className="text-[12.5px] sm:text-[13px] text-slate-300 mt-1.5 leading-relaxed">
                    {item.nasaFact}
                  </p>
                </div>

                <div className="rounded-xl border border-cyan-400/25 bg-[#081020]/90 px-3 py-2 text-[11.5px] text-slate-200 leading-relaxed">
                  <strong className="text-emerald-300 font-bold">
                    {pick('In-Game Connection:', 'Oyundaki Karşılığı:')}
                  </strong>{' '}
                  {item.gameLink}
                </div>

                <div className="text-[11.5px] text-slate-400">
                  <span>{pick('Source: ', 'Kaynak: ')}</span>
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-sky-300 hover:text-white inline-flex items-center gap-1 underline underline-offset-4 transition-colors"
                  >
                    <span>{item.sourceName}</span>
                    <span aria-hidden="true">↗</span>
                  </a>
                </div>
              </div>
            </article>
          ))}

          {/* 6. Kart: NASA Space Apps AI Şeffaflık ve Görsel Bildirimi */}
          <section
            aria-label={pick('Visual and AI Usage Disclosure', 'Görsel ve Yapay Zekâ Kullanım Bildirimi')}
            className="rounded-2xl border border-slate-300/35 bg-gradient-to-b from-[#172133]/88 to-[#101829]/94 backdrop-blur-md p-5 flex flex-col justify-between gap-3 shadow-[0_12px_30px_rgba(4,9,20,0.45)]"
          >
            <div>
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-amber-300">
                {pick('NASA Space Apps Transparency Notice', 'NASA Space Apps Şeffaflık Bildirimi')}
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-white mt-1 leading-snug">
                {pick('Asset Origins & AI Usage', 'Görsellerin Kaynağı & Yapay Zekâ Kullanımı')}
              </h2>
              <ul className="mt-3 space-y-2 text-[12.5px] sm:text-[13px] text-slate-200/90 list-disc pl-4 leading-relaxed">
                <li>
                  {pick(
                    'The home hero background and lunar base scene illustrations were generated specifically for this project; no official NASA or agency logos were altered or used.',
                    'Ana sayfa arka planı ve Ay üssü sahne illüstrasyonları projeye özel görsel üretim araçlarıyla oluşturulmuştur; hiçbir resmî NASA veya ajans logosu değiştirilmemiş ya da kullanılmamıştır.',
                  )}
                </li>
                <li>
                  {pick(
                    'In-app SVG icons (energy, oxygen/water, food, radiation, health) and module upgrade visuals were hand-crafted as custom vectors by the project team.',
                    'Uygulamadaki simge SVG’leri (enerji, oksijen/su, gıda, radyasyon, sağlık) ve seviye gelişim eklemeleri proje ekibi tarafından özel vektör olarak kodlanmıştır.',
                  )}
                </li>
                <li>
                  {pick(
                    'Game mechanics and the scientific summaries on this page are grounded in publicly available NASA Artemis and ISS documentation.',
                    'Oyun mekanikleri ve bu sayfadaki bilimsel özetler NASA’nın kamuya açık Artemis ve ISS dokümantasyonuna dayanır.',
                  )}
                </li>
              </ul>
            </div>

            <div>
              <a
                href="https://www.spaceappschallenge.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-amber-300 hover:text-white underline underline-offset-4 transition-colors"
              >
                <span>{pick('NASA Space Apps Challenge Rules', 'NASA Space Apps Challenge Kuralları')}</span>
                <span aria-hidden="true">↗</span>
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
