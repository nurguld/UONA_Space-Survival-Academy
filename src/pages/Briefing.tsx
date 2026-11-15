import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import briefingAstronautImg from '../assets/briefing-astronaut.png'
import BuildingSprite from '../components/BuildingSprite'
import Navbar from '../components/Navbar'
import { ResourceIcon } from '../components/ResourceIcon'
import { useGame } from '../context/GameContext'
import { playClick } from '../game/sound'
import type { ResourceId } from '../types'

interface WhyChain {
  title: string
  summary: string
  steps: { label: string; resourceId?: ResourceId }[]
}

const WHY_CHAINS: WhyChain[] = [
  {
    title: 'Enerji Zinciri',
    summary:
      'Enerji 25 altına düşerse Yaşam Destek ve Kalkan zayıflar. 15. günde Ay gecesi başlayınca güneş panelleri durur; önceden Batarya kur!',
    steps: [
      { label: 'Güneş + Batarya' },
      { label: 'Enerji', resourceId: 'energy' },
      { label: 'Yaşam Destek & Kalkan' },
      { label: 'Sağlık', resourceId: 'health' },
    ],
  },
  {
    title: 'Su ve Gıda Zinciri',
    summary:
      'Oksijen / su azalınca Sera verimi düşer ve gıda üretimi yavaşlar. Gıda ve su düşüşü doğrudan mürettebat sağlığını vurur.',
    steps: [
      { label: 'Yaşam Destek' },
      { label: 'Oksijen / Su', resourceId: 'oxygen' },
      { label: 'Sera · Gıda', resourceId: 'food' },
      { label: 'Sağlık', resourceId: 'health' },
    ],
  },
  {
    title: 'Koruma ve Direnç Zinciri',
    summary:
      'Radyasyon koruması %100 altında kaldıkça sağlık her gün azalır. Egzersiz ekipmanı günlük sağlık kaybını dengeler.',
    steps: [
      { label: 'Kalkan & Egzersiz' },
      { label: 'Radyasyon', resourceId: 'radiation' },
      { label: 'Sağlık', resourceId: 'health' },
    ],
  },
]

const STAR_DOTS = [
  { cx: 90, cy: 110, r: 1.4, o: 0.7 },
  { cx: 185, cy: 55, r: 1.1, o: 0.5 },
  { cx: 340, cy: 145, r: 1.2, o: 0.6 },
  { cx: 520, cy: 82, r: 1.6, o: 0.8 },
  { cx: 690, cy: 135, r: 1.1, o: 0.45 },
  { cx: 880, cy: 70, r: 1.5, o: 0.75 },
  { cx: 1090, cy: 115, r: 1.2, o: 0.65 },
  { cx: 1210, cy: 195, r: 1.3, o: 0.5 },
  { cx: 65, cy: 360, r: 1.2, o: 0.45 },
  { cx: 1225, cy: 420, r: 1.5, o: 0.6 },
  { cx: 145, cy: 610, r: 1.3, o: 0.5 },
  { cx: 1160, cy: 640, r: 1.2, o: 0.55 },
]

function ChainArrow() {
  return (
    <span aria-hidden="true" className="text-cyan-300 font-bold text-xs select-none">
      →
    </span>
  )
}

export default function Briefing() {
  const navigate = useNavigate()
  const { rules, startGame } = useGame()
  const [commanderName, setCommanderName] = useState(
    () => localStorage.getItem('jsa_commander') ?? '',
  )

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    playClick()
    const trimmed = commanderName.trim()
    if (trimmed) {
      localStorage.setItem('jsa_commander', trimmed)
    }
    startGame()
    navigate('/oyun')
  }

  return (
    <div className="relative min-h-dvh overflow-x-clip bg-[#040814] text-white pb-12">
      {/* Yıldızlı Uzay Arka Planı */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top_center,rgba(56,189,248,0.12),transparent_58%),radial-gradient(ellipse_at_bottom_left,rgba(99,102,241,0.09),transparent_55%)]"
      >
        <svg viewBox="0 0 1280 720" className="w-full h-full opacity-80" preserveAspectRatio="xMidYMid slice">
          {STAR_DOTS.map((s) => (
            <circle key={`${s.cx}-${s.cy}`} cx={s.cx} cy={s.cy} r={s.r} fill="#E2E8F0" opacity={s.o} />
          ))}
        </svg>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        <Navbar />

        {/* Üst Başlık + Astronot Maskot + Ana Sayfaya Dön */}
        <div className="mt-7 mb-5 flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-400">
              Görev Öncesi Hazırlık
            </span>
            <div className="flex items-center gap-3.5 mt-1">
              <h1 className="text-3xl sm:text-[2.65rem] font-extrabold tracking-tight text-white leading-tight">
                Komutan Brifingi
              </h1>
              <img
                src={briefingAstronautImg}
                alt=""
                draggable={false}
                aria-hidden="true"
                className="hidden sm:block w-[74px] h-auto object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.55)] select-none -my-3"
              />
            </div>
            <p className="text-slate-300 text-sm sm:text-[15px] mt-1.5 max-w-2xl leading-relaxed">
              Ay Güney Kutbu üssünün komutasını devralmadan önce sistemlerin birbirine nasıl
              bağlandığını ve 30 günlük kritik görev kurallarını incele.
            </p>
          </div>

          <Link
            to="/"
            onClick={() => playClick()}
            className="px-4 min-h-11 rounded-xl text-sm font-semibold inline-flex items-center border border-slate-300/40 bg-[#0A1224]/85 text-slate-200 hover:border-white hover:text-white hover:bg-[#131F3A] backdrop-blur-md transition-colors shrink-0"
          >
            ← Ana Sayfaya Dön
          </Link>
        </div>

        {/* 3 Temel Görev Kuralı */}
        <div className="grid sm:grid-cols-3 gap-4 mb-5">
          <div className="rounded-2xl border border-slate-300/35 bg-gradient-to-b from-[#172133]/88 to-[#0E1627]/94 backdrop-blur-md p-4 sm:p-5 shadow-[0_10px_28px_rgba(4,9,20,0.45)]">
            <p className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span aria-hidden="true">🌓</span>
              <span>1. 14 Günlük Ay Gecesi</span>
            </p>
            <p className="text-xs sm:text-[13px] text-slate-300 mt-2 leading-relaxed">
              {rules.lunarNightStartDay}. ve {rules.lunarNightEndDay}. günler arasında güneş batar ve
              güneş panelleri tamamen durur. Önceden Batarya kur!
            </p>
          </div>

          <div className="rounded-2xl border border-slate-300/35 bg-gradient-to-b from-[#172133]/88 to-[#0E1627]/94 backdrop-blur-md p-4 sm:p-5 shadow-[0_10px_28px_rgba(4,9,20,0.45)]">
            <p className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span aria-hidden="true">🔗</span>
              <span>2. Zincirleme Sistem Etkisi</span>
            </p>
            <p className="text-xs sm:text-[13px] text-slate-300 mt-2 leading-relaxed">
              Hiçbir kaynak tek başına değildir: düşük enerji yaşam desteğini, düşük oksijen serayı
              ve hepsi birlikte mürettebat sağlığını etkiler.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-300/35 bg-gradient-to-b from-[#172133]/88 to-[#0E1627]/94 backdrop-blur-md p-4 sm:p-5 shadow-[0_10px_28px_rgba(4,9,20,0.45)]">
            <p className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span aria-hidden="true">🎛️</span>
              <span>3. Bütçe &amp; Seviye Kilitleri</span>
            </p>
            <p className="text-xs sm:text-[13px] text-slate-300 mt-2 leading-relaxed">
              Her gün +{rules.dailyBudgetGain} bütçe puanı kazanırsın. Modülleri Sv. 2 ve Sv. 3
              yapmak acil olaylarda güçlü savunma seçeneklerinin kilidini açar.
            </p>
          </div>
        </div>

        {/* Ana İkili Panel: Sol "Kaynaklar Arası Etki Ağı" | Dikey Ayraç | Sağ "Üs Modülleri" */}
        <section
          aria-label="Sistem Etkileşim Ağı ve Üs Modülleri"
          className="mb-5 rounded-2xl border border-slate-300/35 bg-gradient-to-b from-[#151F31]/92 to-[#0B1323]/96 backdrop-blur-xl p-5 shadow-[0_16px_40px_rgba(4,9,20,0.6)] grid lg:grid-cols-[1.35fr_1fr] gap-5 lg:gap-0 items-stretch"
        >
          {/* Sol: Kaynaklar Arası Etki Ağı */}
          <div className="lg:pr-5 lg:border-r lg:border-slate-300/20 flex flex-col justify-between">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-300">
                  Neden Böyle Oluyor?
                </span>
                <h2 className="text-xl font-bold text-white mt-0.5">Kaynaklar Arası Etki Ağı</h2>
              </div>
              <span className="text-[11px] font-medium text-slate-200 bg-[#081020] border border-slate-300/25 rounded-full px-3 py-1">
                Tek bakışta sebep → sonuç
              </span>
            </div>

            <div className="grid gap-2.5">
              {WHY_CHAINS.map((chain) => (
                <div
                  key={chain.title}
                  className="rounded-xl border border-slate-300/20 bg-[#081020]/90 px-3.5 py-3 flex flex-col gap-1.5"
                >
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">
                      {chain.title}:
                    </span>
                    {chain.steps.map((step, idx) => (
                      <div key={step.label} className="inline-flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 rounded-md border border-slate-300/25 bg-[#121D34] px-2 py-0.5 text-[11px] font-semibold text-white">
                          {step.resourceId && (
                            <ResourceIcon id={step.resourceId} className="w-3 h-3 shrink-0" />
                          )}
                          <span>{step.label}</span>
                        </span>
                        {idx < chain.steps.length - 1 && <ChainArrow />}
                      </div>
                    ))}
                  </div>
                  <p className="text-[12px] text-slate-300 leading-relaxed">{chain.summary}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sağ: Büyük İllüstrasyonlu Üs Modülleri Kartları */}
          <div className="lg:pl-5 flex flex-col justify-between">
            <h2 className="text-xl font-bold text-white mb-3.5">Üs Modülleri</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2.5 flex-1">
              {rules.modules.map((mod) => (
                <div
                  key={mod.id}
                  title={mod.description}
                  className="rounded-xl border border-slate-300/30 bg-[#0A1324]/92 px-3 py-2.5 flex items-center gap-2.5 hover:border-cyan-300/45 transition-colors"
                >
                  <div className="w-14 h-14 flex items-center justify-center shrink-0">
                    <BuildingSprite moduleId={mod.id} level={1} alt={mod.name} />
                  </div>
                  <div className="min-w-0 flex-1 flex flex-col items-start">
                    <span className="inline-block text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-[#162238] border border-slate-300/25 text-slate-200 tabular-nums">
                      {mod.cost} puan
                    </span>
                    <p className="text-[13px] font-bold text-white leading-snug mt-1">
                      {mod.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Alt Komutan Adı & Görevi Başlat Çubuğu */}
        <section className="rounded-2xl border border-slate-300/35 bg-gradient-to-b from-[#172133]/92 to-[#0E1627]/95 backdrop-blur-xl p-4 sm:p-5 shadow-[0_14px_34px_rgba(4,9,20,0.55)]">
          <form onSubmit={handleSubmit} className="flex flex-col gap-1.5">
            <label htmlFor="commander-name" className="text-sm font-semibold text-white">
              Komutan Adı{' '}
              <span className="text-slate-400 text-xs font-normal">
                (Sertifika için isteğe bağlı)
              </span>
            </label>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                id="commander-name"
                name="commanderName"
                type="text"
                autoComplete="name"
                maxLength={40}
                enterKeyHint="done"
                aria-describedby="commander-help"
                value={commanderName}
                onChange={(e) => setCommanderName(e.target.value)}
                placeholder="Örn. Selin Yılmaz"
                className="flex-1 min-h-11 px-4 rounded-xl text-sm sm:text-base bg-[#070E1E] border border-slate-300/30 text-white placeholder:text-slate-500 focus-visible:outline-2 focus-visible:outline-cyan-300"
              />

              <button
                type="submit"
                className="px-7 min-h-11 rounded-xl text-sm sm:text-base font-bold bg-gradient-to-r from-[#22C9EB] to-[#38BDF8] text-slate-950 shadow-[0_0_24px_rgba(34,211,238,0.4)] hover:brightness-110 cursor-pointer transition-all shrink-0"
              >
                Görevi Başlat →
              </button>
            </div>

            <span id="commander-help" className="text-xs text-slate-400 mt-0.5">
              Görev sonunda alacağın Komutan Sertifikasında ve sonuç raporunda bu isim görünür.
            </span>
          </form>
        </section>
      </div>
    </div>
  )
}
