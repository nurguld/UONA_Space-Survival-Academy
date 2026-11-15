import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { ResourceIcon } from '../components/ResourceIcon'
import { useGame } from '../context/GameContext'
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

function ChainArrow() {
  return (
    <span aria-hidden="true" className="text-cyan-300 font-bold text-sm select-none">
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
    const trimmed = commanderName.trim()
    if (trimmed) {
      localStorage.setItem('jsa_commander', trimmed)
    }
    startGame()
    navigate('/oyun')
  }

  return (
    <div className="min-h-dvh bg-[#040814] text-white pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Navbar />

        <div className="mt-8 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-sky-400">
              Görev Öncesi Hazırlık
            </span>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mt-1">
              Komutan Brifingi
            </h1>
            <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-2xl">
              Ay Güney Kutbu üssünün komutasını devralmadan önce sistemlerin birbirine nasıl
              bağlandığını ve 30 günlük kritik görev kurallarını incele.
            </p>
          </div>

          <Link
            to="/"
            className="px-4 min-h-11 rounded-xl text-sm font-semibold inline-flex items-center border border-white/30 bg-white/5 text-slate-200 hover:border-white hover:text-white transition-colors"
          >
            ← Ana Sayfaya Dön
          </Link>
        </div>

        {/* 3 Temel Görev Kuralı */}
        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          <div className="rounded-2xl border border-amber-400/50 bg-[#081228]/85 p-5">
            <p className="text-sm font-bold text-amber-300">1. 14 Günlük Ay Gecesi</p>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              {rules.lunarNightStartDay}. ve {rules.lunarNightEndDay}. günler arasında güneş batar ve
              güneş panelleri tamamen durur. Önceden Batarya kur!
            </p>
          </div>

          <div className="rounded-2xl border border-orange-400/50 bg-[#081228]/85 p-5">
            <p className="text-sm font-bold text-orange-300">2. Zincirleme Sistem Etkisi</p>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              Hiçbir kaynak tek başına değildir: düşük enerji yaşam desteğini, düşük oksijen serayı
              ve hepsi birlikte mürettebat sağlığını etkiler.
            </p>
          </div>

          <div className="rounded-2xl border border-sky-400/50 bg-[#081228]/85 p-5">
            <p className="text-sm font-bold text-sky-300">3. Bütçe &amp; Seviye Kilitleri</p>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              Her gün +{rules.dailyBudgetGain} bütçe puanı kazanırsın. Modülleri Sv. 2 ve Sv. 3
              yapmak acil olaylarda güçlü savunma seçeneklerinin kilidini açar.
            </p>
          </div>
        </div>

        {/* "Neden?" Kaynaklar Arası Etki Ağı */}
        <section
          aria-label="Sistemler Arası Neden Ağı"
          className="mb-6 rounded-2xl border border-white/40 bg-[#081228]/90 backdrop-blur-md p-5 sm:p-6 shadow-[0_0_32px_rgba(255,255,255,0.08)]"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300">
                Neden Böyle Oluyor?
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
                Kaynaklar Arası Etki Ağı
              </h2>
            </div>
            <span className="text-xs text-slate-300 bg-[#050C1D] border border-white/20 rounded-lg px-3 py-1">
              Tek bakışta sebep → sonuç
            </span>
          </div>

          <div className="grid gap-3.5">
            {WHY_CHAINS.map((chain) => (
              <div
                key={chain.title}
                className="rounded-xl border border-white/25 bg-[#050C1D]/85 p-4 flex flex-col gap-2.5"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">
                    {chain.title}:
                  </span>
                  {chain.steps.map((step, idx) => (
                    <div key={step.label} className="inline-flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/30 bg-[#0B1733] px-2.5 py-1 text-xs sm:text-sm font-semibold text-white">
                        {step.resourceId && (
                          <ResourceIcon id={step.resourceId} className="w-3.5 h-3.5 shrink-0" />
                        )}
                        <span>{step.label}</span>
                      </span>
                      {idx < chain.steps.length - 1 && <ChainArrow />}
                    </div>
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{chain.summary}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 6 Üs Modülü Özeti */}
        <section className="mb-6 rounded-2xl border border-white/40 bg-[#081228]/85 p-5 sm:p-6">
          <h2 className="text-xl font-bold mb-4">Üs Modülleri</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {rules.modules.map((mod) => (
              <div
                key={mod.id}
                className="rounded-xl bg-[#050C1D]/90 border border-white/20 p-3.5 flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-white">{mod.name}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-cyan-500/15 border border-cyan-400/40 text-cyan-300">
                    {mod.cost} puan
                  </span>
                </div>
                <p className="text-xs text-slate-300">{mod.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Komutan Adı ve Başlatma Formu */}
        <section className="rounded-2xl border-2 border-white/45 bg-[#0A1530]/90 p-5 sm:p-6 shadow-[0_0_32px_rgba(255,255,255,0.08)]">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="flex-1 flex flex-col gap-1.5">
              <label htmlFor="commander-name" className="text-sm font-semibold text-white">
                Komutan Adı{' '}
                <span className="text-slate-400 text-xs font-normal">
                  (Sertifika için isteğe bağlı)
                </span>
              </label>
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
                className="w-full min-h-12 px-4 rounded-xl text-base bg-[#050C1D] border border-white/35 text-white placeholder:text-slate-500 focus-visible:outline-2 focus-visible:outline-cyan-300"
              />
              <span id="commander-help" className="text-xs text-slate-300">
                Görev sonunda alacağın Komutan Sertifikasında ve sonuç raporunda bu isim görünür.
              </span>
            </div>

            <button
              type="submit"
              className="px-8 min-h-12 rounded-xl text-base font-bold bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 shadow-[0_0_24px_rgba(251,191,36,0.4)] hover:brightness-110 cursor-pointer transition-all shrink-0"
            >
              Görevi Başlat →
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}