import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import SpaceTransition from '../components/SpaceTransition'
import Button from '../components/Button'
import ResourceBar from '../components/ResourceBar'
import ResourceLab from '../components/labComponents/ResourceLab'
import EmergencyLab from '../components/labComponents/EmergencyLab'
import { Droplet, AlertTriangle, Cpu, BookOpen, ArrowLeft } from 'lucide-react'

export default function Home() {
  // 'home' -> Ana Sayfa
  // 'labHub' -> 4 Labın seçileceği ana menü kartları
  // 'resourceLab' -> Kaynak Labı
  // 'emergencyLab' -> Acil Durum Labı
  const [activeView, setActiveView] = useState<'home' | 'labHub' | 'resourceLab' | 'emergencyLab'>('home');

  return (
    <div className="max-w-6xl mx-auto px-6 py-4">
      <SpaceTransition transitionKey={activeView} />
      <Navbar />

      {/* Geri Dön Butonu (Eğer ana sayfa dışında bir lab içindeysek görünür) */}
      {activeView !== 'home' && (
        <button
          onClick={() => setActiveView(activeView === 'resourceLab' || activeView === 'emergencyLab' ? 'labHub' : 'home')}
          className="flex items-center gap-2 mt-6 mb-4 px-4 py-2 bg-slate-900 border border-slate-700 hover:border-cyan-500 text-slate-300 rounded-xl font-semibold text-sm transition"
        >
          <ArrowLeft className="w-4 h-4" /> Geri Dön
        </button>
      )}

      {/* 1. GÖRÜNÜM: ANA SAYFA */}
      {activeView === 'home' && (
        <>
          <h1 className="font-pixel text-6xl mt-12 text-white">Ay Üssü Komutanı</h1>
          <p className="text-slate-400 text-lg mt-4 max-w-xl">
            30 gün boyunca enerji, oksijen, gıda ve radyasyon koruması arasında denge kur.
          </p>
          <div className="flex gap-4 mt-6">
            <Button>Göreve Başla</Button>
            <Button variant="ghost" onClick={() => setActiveView('labHub')}>
              Eğitime Başla (Lablar)
            </Button>
          </div>
          <div className="grid gap-3 mt-10 max-w-sm">
            <ResourceBar label="Enerji" value={62} color="var(--color-energy)" />
            <ResourceBar label="Oksijen / Su" value={78} color="var(--color-oxygen)" />
            <ResourceBar label="Gıda" value={45} color="var(--color-food)" />
          </div>
        </>
      )}

      {/* 2. GÖRÜNÜM: 4'LÜ LAB SEÇİM MENÜSÜ (HUB) */}
      {activeView === 'labHub' && (
        <div className="mt-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white tracking-wider">🔬 SPACE ACADEMY TRAINING LABS</h2>
            <p className="text-slate-400 text-sm mt-1">Select a training module to simulate outpost crisis management and protocols.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Lab 1: Resource Management (Aktif) */}
            <div 
              onClick={() => setActiveView('resourceLab')}
              className="p-6 bg-slate-900/90 border border-cyan-500/30 hover:border-cyan-400 rounded-2xl shadow-xl cursor-pointer transition-all hover:scale-[1.02] group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400 group-hover:bg-cyan-500/20 transition">
                  <Droplet className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition">Resource Management Lab</h3>
                  <span className="text-xs font-mono text-cyan-500">Module 01 • Active Simulation</span>
                </div>
              </div>
              <p className="text-slate-400 text-sm">Simulate water, power, oxygen, and food depletion with cascading butterfly effects and base level scaling.</p>
            </div>

            {/* Lab 2: Emergency Response (Aktif) */}
            <div 
              onClick={() => setActiveView('emergencyLab')}
              className="p-6 bg-slate-900/90 border border-red-500/30 hover:border-red-400 rounded-2xl shadow-xl cursor-pointer transition-all hover:scale-[1.02] group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 group-hover:bg-red-500/20 transition">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-red-300 transition">Emergency Response Lab</h3>
                  <span className="text-xs font-mono text-red-500">Module 02 • Active Simulation</span>
                </div>
              </div>
              <p className="text-slate-400 text-sm">Train against solar flares, CME storms, hull breaches, and hydroponics mold contamination.</p>
            </div>

            {/* Lab 3: Arkadaşının modülü için yer tutucu (İleride eklenecek) */}
            <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl opacity-60">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-slate-800 rounded-xl text-slate-500">
                  <Cpu className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-400">Advanced Systems Lab</h3>
                  <span className="text-xs font-mono text-slate-500">Module 03 • Coming Soon</span>
                </div>
              </div>
              <p className="text-slate-500 text-sm">Reserved for upcoming telemetry and hardware automation training protocols.</p>
            </div>

            {/* Lab 4: Build Lab */}
            <Link
              to="/build-lab"
              className="block p-6 bg-slate-900/90 border border-cyan-500/30 hover:border-cyan-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 rounded-2xl shadow-xl cursor-pointer transition-all hover:scale-[1.02] group text-left no-underline"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400 group-hover:bg-cyan-500/20 transition">
                  <BookOpen className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition">Build Lab / Outpost Architecture</h3>
                  <span className="text-xs font-mono text-cyan-500">Module 04 • Active Simulation</span>
                </div>
              </div>
              <p className="text-slate-400 text-sm">Ay üssünü kur, sistem modüllerini yerleştir ve görevini doğrula.</p>
            </Link>
          </div>
        </div>
      )}

      {/* 3. GÖRÜNÜM: RESOURCE LAB İÇERİĞİ */}
      {activeView === 'resourceLab' && <ResourceLab />}

      {/* 4. GÖRÜNÜM: EMERGENCY LAB İÇERİĞİ */}
      {activeView === 'emergencyLab' && <EmergencyLab />}
    </div>
  )
}