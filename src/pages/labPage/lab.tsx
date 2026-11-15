import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, Boxes, Cpu, Droplets } from 'lucide-react'
import Navbar from '../../components/Navbar'
import SpaceTransition from '../../components/SpaceTransition'
import AdvancedSystemsLab from '../../components/labComponents/AdvancedSystemsLab'
import EmergencyLab from '../../components/labComponents/EmergencyLab'
import ResourceLab from '../../components/labComponents/ResourceLab'
import { playClick } from '../../game/sound'

type InlineLabId = 'resources' | 'emergency' | 'systems'

const INLINE_LABS: {
  id: InlineLabId
  code: string
  title: string
  subtitle: string
  accent: string
  activeBorder: string
  icon: typeof Droplets
}[] = [
  {
    id: 'resources',
    code: 'LAB 02',
    title: 'Kaynak Laboratuvarı',
    subtitle: 'Su, enerji, oksijen ve gıda dengesini (ECLSS) canlı test et.',
    accent: 'text-cyan-300',
    activeBorder: 'border-cyan-400/75 bg-[#0C1D38]/95 shadow-[0_0_24px_rgba(34,211,238,0.22)]',
    icon: Droplets,
  },
  {
    id: 'emergency',
    code: 'LAB 03',
    title: 'Acil Durum Laboratuvarı',
    subtitle: 'Güneş fırtınası ve sensör alarmlarında kriz müdahalesi yap.',
    accent: 'text-rose-300',
    activeBorder: 'border-rose-400/75 bg-[#241122]/95 shadow-[0_0_24px_rgba(244,63,94,0.22)]',
    icon: AlertTriangle,
  },
  {
    id: 'systems',
    code: 'LAB 04',
    title: 'İleri Sistemler',
    subtitle: 'Yerçekimi, radyasyon kalkanı, güneş açısı ve termal deneyler.',
    accent: 'text-violet-300',
    activeBorder: 'border-violet-400/75 bg-[#181336]/95 shadow-[0_0_24px_rgba(167,139,250,0.22)]',
    icon: Cpu,
  },
]

export default function LabsHub() {
  const [activeLab, setActiveLab] = useState<InlineLabId>('resources')

  return (
    <div className="relative min-h-dvh overflow-x-clip bg-[#040814] text-white pb-14">
      <SpaceTransition transitionKey={activeLab} />

      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,rgba(56,189,248,0.13),transparent_55%),radial-gradient(ellipse_at_bottom_left,rgba(139,92,246,0.10),transparent_55%)]"
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        <Navbar />

        {/* Başlık Satırı */}
        <div className="mt-7 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-400">
              İnteraktif Bilim &amp; Simülasyon
            </span>
            <h1 className="text-3xl sm:text-[2.65rem] font-extrabold tracking-tight text-white mt-1 leading-tight">
              Uzay Laboratuvarları
            </h1>
            <p className="text-slate-300 text-sm sm:text-[15px] mt-2 max-w-2xl leading-relaxed">
              Ay üssünün hayatta kalma sistemlerini, yerleşim kurallarını ve kriz senaryolarını özel
              laboratuvar alanlarında deneyimle.
            </p>
          </div>

          <Link
            to="/oyun"
            onClick={() => playClick()}
            className="px-5 min-h-11 rounded-xl text-sm font-bold inline-flex items-center bg-gradient-to-r from-[#22C9EB] to-[#38BDF8] text-slate-950 shadow-[0_0_24px_rgba(34,211,238,0.38)] hover:brightness-110 transition-all shrink-0"
          >
            Oyuna Dön →
          </Link>
        </div>

        {/* 4 Laboratuvar Seçim Kartı */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
          {/* 1. Tam Ekran Özel Sayfa: Habitat Build Lab */}
          <Link
            to="/labs/build"
            onClick={() => playClick()}
            className="group rounded-2xl border border-amber-400/50 bg-gradient-to-b from-[#1E1A16]/90 to-[#111528]/95 hover:border-amber-300 p-4 flex flex-col justify-between gap-3 transition-all shadow-[0_10px_28px_rgba(4,9,20,0.45)] hover:-translate-y-0.5"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-300">
                  LAB 01 · TAM EKRAN
                </span>
                <Boxes className="w-4 h-4 text-amber-300" />
              </div>
              <h2 className="text-base font-bold text-white mt-1.5 group-hover:text-amber-200 transition-colors">
                Habitat İnşa Laboratuvarı
              </h2>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                6×6 ızgarada sürükle-bırak üs tasarımı ve modül bağlantı kuralları.
              </p>
            </div>
            <span className="text-xs font-bold text-amber-300 inline-flex items-center gap-1">
              Laboratuvarı Aç →
            </span>
          </Link>

          {/* 2–4. Sayfa İçi İnteraktif Laboratuvarlar */}
          {INLINE_LABS.map((lab) => {
            const Icon = lab.icon
            const selected = activeLab === lab.id
            return (
              <button
                key={lab.id}
                type="button"
                aria-pressed={selected}
                onClick={() => {
                  playClick()
                  setActiveLab(lab.id)
                }}
                className={`text-left rounded-2xl border p-4 flex flex-col justify-between gap-3 cursor-pointer transition-all hover:-translate-y-0.5 ${
                  selected
                    ? lab.activeBorder
                    : 'border-slate-300/30 bg-gradient-to-b from-[#172133]/85 to-[#101829]/92 hover:border-slate-300/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-[0.16em] ${lab.accent}`}>
                      {lab.code}
                    </span>
                    <Icon className={`w-4 h-4 ${lab.accent}`} />
                  </div>
                  <h2 className="text-base font-bold text-white mt-1.5">{lab.title}</h2>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{lab.subtitle}</p>
                </div>
                <span className={`text-xs font-bold ${selected ? lab.accent : 'text-slate-400'}`}>
                  {selected ? '● Şu An Açık' : 'Seç ve Aç →'}
                </span>
              </button>
            )
          })}
        </div>

        {/* Seçili Laboratuvar Alanı */}
        <section aria-label="Aktif Laboratuvar">
          {activeLab === 'resources' && <ResourceLab />}
          {activeLab === 'emergency' && <EmergencyLab />}
          {activeLab === 'systems' && <AdvancedSystemsLab />}
        </section>
      </div>
    </div>
  )
}
