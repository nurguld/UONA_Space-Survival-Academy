import { useState } from 'react'
import Navbar from '../components/Navbar'
import Button from '../components/Button'
import ResourceBar from '../components/ResourceBar'
import ResourceLab from '../components/labComponents/ResourceLab'
import EmergencyLab from '../components/labComponents/EmergencyLab'

export default function Home() {
  // Hangi ekranın açık olduğunu takip ediyoruz: 'home' | 'resourceLab' | 'emergencyLab'
  const [activeTab, setActiveTab] = useState<'home' | 'resourceLab' | 'emergencyLab'>('home');

  return (
    <div className="max-w-6xl mx-auto px-6">
      <Navbar />

      {/* Üst menü veya hızlı test butonları ile lablar arası geçiş */}
      <div className="flex gap-3 my-6">
        <button 
          onClick={() => setActiveTab('home')}
          className={`px-4 py-2 rounded-lg font-bold text-sm ${activeTab === 'home' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 text-slate-400'}`}
        >
          Ana Sayfa
        </button>
        <button 
          onClick={() => setActiveTab('resourceLab')}
          className={`px-4 py-2 rounded-lg font-bold text-sm ${activeTab === 'resourceLab' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 text-slate-400'}`}
        >
          💧 Resource Lab
        </button>
        <button 
          onClick={() => setActiveTab('emergencyLab')}
          className={`px-4 py-2 rounded-lg font-bold text-sm ${activeTab === 'emergencyLab' ? 'bg-red-500 text-white' : 'bg-slate-900 text-slate-400'}`}
        >
          🚨 Emergency Lab
        </button>
      </div>

      {/* Aktif sekmeye göre gösterilecek içerik */}
      {activeTab === 'resourceLab' ? (
        <ResourceLab />
      ) : activeTab === 'emergencyLab' ? (
        <EmergencyLab />
      ) : (
        <>
          <h1 className="font-pixel text-6xl mt-12">Ay Üssü Komutanı</h1>
          <p className="text-muted text-lg mt-4 max-w-xl">
            30 gün boyunca enerji, oksijen, gıda ve radyasyon koruması arasında denge kur.
          </p>
          <div className="flex gap-4 mt-6">
            <Button>Göreve Başla</Button>
            <Button variant="ghost" onClick={() => setActiveTab('resourceLab')}>
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
    </div>
  )
}