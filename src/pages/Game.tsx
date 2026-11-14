import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import ResourceBar from '../components/ResourceBar'
import Button from '../components/Button'
import Card from '../components/Card'
import BaseScene from '../components/BaseScene'
import UpgradeModal from '../components/UpgradeModal'
import EventModal from '../components/EventModal'
import { useGame } from '../context/GameContext'
import { calculateDailyDelta, calculateSystemEffects } from '../game/engine'
import type { ModuleId, ResourceId } from '../types'

const RESOURCE_META: { id: ResourceId; label: string; color: string }[] = [
  { id: 'energy', label: 'Enerji', color: 'var(--color-energy)' },
  { id: 'oxygen', label: 'Oksijen / Su', color: 'var(--color-oxygen)' },
  { id: 'food', label: 'Gıda', color: 'var(--color-food)' },
  { id: 'radiation', label: 'Radyasyon Koruması', color: 'var(--color-radiation)' },
  { id: 'health', label: 'Mürettebat Sağlığı', color: 'var(--color-health)' },
]

export default function Game() {
  const { state, rules, tutorial, startGame, upgradeModule, nextDay, resolveEvent } = useGame()
  const [selectedModuleId, setSelectedModuleId] = useState<ModuleId | null>(null)

  const dailyDelta = calculateDailyDelta(state.modules, state.day, state.resources)
  const { interactions } = calculateSystemEffects(state.resources)
  const activeTutorial = tutorial.find((t) => t.day === state.day)
  const isPlaying = state.status === 'playing'

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-10">
      <Navbar />

      {/* Üst Görev Kontrol Çubuğu */}
      <div className="flex flex-wrap items-center justify-between gap-4 my-5">
        <div>
          <h1 className="font-pixel text-3xl sm:text-4xl">Ay Üssü Kontrol Paneli</h1>
          <p className="text-muted text-sm mt-1">
            Mevcut Bütçe:{' '}
            <span className="font-pixel text-accent text-lg font-bold">{state.budget} puan</span>
            {' · '}Her yeni günde +{rules.dailyBudgetGain} puan
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button type="button" variant="ghost" onClick={startGame}>
            Sıfırla
          </Button>
          <Button
            type="button"
            disabled={!isPlaying || state.activeEvent !== null}
            onClick={nextDay}
          >
            Günü Bitir →
          </Button>
        </div>
      </div>

      {/* Kaynak Çubukları */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
        {RESOURCE_META.map((res) => {
          const delta = dailyDelta[res.id]
          return (
            <div key={res.id} className="flex flex-col gap-1">
              <ResourceBar label={res.label} value={state.resources[res.id]} color={res.color} />
              <span
                className={`font-pixel text-xs px-1 ${
                  delta >= 0 ? 'text-food' : 'text-radiation'
                }`}
              >
                Günlük net: {delta > 0 ? `+${delta}` : delta}
              </span>
            </div>
          )
        })}
      </div>

      {/* Sistem Etkileşimleri Özeti */}
      {interactions.length > 0 && (
        <div aria-label="Sistem Etkileşimleri" className="flex flex-wrap gap-2 mb-5">
          {interactions.map((item) => (
            <span
              key={item.text}
              className={`font-pixel text-xs px-3 py-1.5 border-2 bg-panel ${
                item.severity === 'good'
                  ? 'border-food/60 text-food'
                  : item.severity === 'danger'
                    ? 'border-radiation text-radiation'
                    : 'border-energy/60 text-energy'
              }`}
            >
              {item.text}
            </span>
          ))}
        </div>
      )}

      {/* Görev Sonu Kartı */}
      {!isPlaying && (
        <Card
          className={`mb-5 ${
            state.status === 'won' ? 'border-food' : 'border-radiation'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-pixel text-2xl">
                {state.status === 'won'
                  ? 'Tebrikler! 30 Gün Hayatta Kaldın!'
                  : `Görev Başarısız (${state.day}. Gün)`}
              </h2>
              <p className="text-muted text-sm mt-1">
                {state.status === 'won'
                  ? 'Ay üssü mürettebatı tüm zorlukları başarıyla yönetti.'
                  : `Tükenen kaynak: ${
                      RESOURCE_META.find((r) => r.id === state.lossReason)?.label ?? state.lossReason
                    }`}
              </p>
            </div>
            <div className="flex gap-3">
              <Button type="button" onClick={startGame}>
                Tekrar Oyna
              </Button>
              <Link
                to="/sonuc"
                className="font-pixel text-lg px-5 min-h-11 inline-flex items-center border-[3px] border-line text-white"
              >
                Sonuç Ekranı
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* Etkileşimli Pixel Ay Üssü Sahnesi */}
      <BaseScene
        day={state.day}
        maxDays={rules.maxDays}
        lunarNightStartDay={rules.lunarNightStartDay}
        modules={state.modules}
        modulesDef={rules.modules}
        budget={state.budget}
        disabled={!isPlaying || state.activeEvent !== null}
        onSelectModule={setSelectedModuleId}
      />

      <p className="font-pixel text-xs text-muted mt-3">
        İpucu: Geliştirmek istediğin yapının üzerine gelip <span className="text-accent">↑</span> okuna tıkla; yükseltme öncesi günlük değişimi görebilirsin.
      </p>

      {/* İlk 3 Gün Rehber Kutusu */}
      {isPlaying && activeTutorial && (
        <Card className="mt-4 border-accent">
          <p className="font-pixel text-sm text-accent">{activeTutorial.title}</p>
          <p className="text-sm mt-1">{activeTutorial.message}</p>
        </Card>
      )}

      {/* Modül Yükseltme Onay Penceresi */}
      <UpgradeModal
        moduleId={selectedModuleId}
        modulesDef={rules.modules}
        levels={state.modules}
        resources={state.resources}
        day={state.day}
        budget={state.budget}
        disabled={!isPlaying || state.activeEvent !== null}
        onConfirm={upgradeModule}
        onClose={() => setSelectedModuleId(null)}
      />

      {/* Olay Karar Penceresi */}
      <EventModal
        event={state.activeEvent}
        modules={state.modules}
        modulesDef={rules.modules}
        onSelect={resolveEvent}
      />
    </div>
  )
}