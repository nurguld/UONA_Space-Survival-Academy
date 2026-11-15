import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react'
import lifeSupportArtwork from '../../assets/map-lifesupport.png'
import greenhouseArtwork from '../../assets/map-greenhouse.png'
import shieldArtwork from '../../assets/map-shield.png'
import solarArtwork from '../../assets/map-solar.png'
import Navbar from '../../components/Navbar'
import AdvancedSystemsLab from '../../components/labComponents/AdvancedSystemsLab'
import EmergencyLab from '../../components/labComponents/EmergencyLab'
import ResourceLab from '../../components/labComponents/ResourceLab'
import { useLanguage, type Language } from '../../context/LanguageContext'
import { handleInteractiveClick, playClick } from '../../game/sound'
import './LabsHub.css'

type LStr = Record<Language, string>

const LABS: {
  id: 'build' | 'resources' | 'emergency' | 'systems'
  number: string
  title: LStr
  subtitle: LStr
  detail: LStr
  tag: LStr
  artwork: string
  accent: 'cyan' | 'blue' | 'rose' | 'violet'
  to: string
}[] = [
  {
    id: 'build',
    number: '01',
    title: { en: 'Habitat Build Lab', tr: 'Habitat İnşa Laboratuvarı' },
    subtitle: { en: 'Design the Moon base.', tr: 'Ay üssünü tasarla.' },
    detail: {
      en: 'Place modules and validate their connections.',
      tr: 'Modülleri yerleştir, bağlantılarını doğrula.',
    },
    tag: { en: 'BASE DESIGN', tr: 'ÜS TASARIMI' },
    artwork: lifeSupportArtwork,
    accent: 'cyan',
    to: '/labs/build',
  },
  {
    id: 'resources',
    number: '02',
    title: { en: 'Resource Lab', tr: 'Kaynak Laboratuvarı' },
    subtitle: {
      en: 'Balance life-support systems.',
      tr: 'Yaşam destek sistemlerini dengele.',
    },
    detail: {
      en: 'Explore water, power, oxygen, and food resources.',
      tr: 'Su, enerji, oksijen ve gıda kaynaklarını keşfet.',
    },
    tag: { en: 'LIFE SUPPORT', tr: 'YAŞAM DESTEĞİ' },
    artwork: greenhouseArtwork,
    accent: 'blue',
    to: '/labs/resources',
  },
  {
    id: 'emergency',
    number: '03',
    title: { en: 'Emergency Lab', tr: 'Acil Durum Laboratuvarı' },
    subtitle: { en: 'Help the crew during alerts.', tr: 'Uyarılarda ekibe yardım et.' },
    detail: {
      en: 'Test your decisions in fictional space scenarios.',
      tr: 'Kurgusal uzay senaryolarında kararlarını dene.',
    },
    tag: { en: 'MISSION CONTROL', tr: 'GÖREV KONTROLÜ' },
    artwork: shieldArtwork,
    accent: 'rose',
    to: '/labs/emergency',
  },
  {
    id: 'systems',
    number: '04',
    title: { en: 'Advanced Systems', tr: 'İleri Sistemler' },
    subtitle: { en: 'Run space science experiments.', tr: 'Uzay bilimi deneyleri yap.' },
    detail: {
      en: 'Explore gravity, radiation, solar power, and heat.',
      tr: 'Yerçekimi, radyasyon, güneş enerjisi ve ısıyı keşfet.',
    },
    tag: { en: 'SCIENCE STATION', tr: 'BİLİM İSTASYONU' },
    artwork: solarArtwork,
    accent: 'violet',
    to: '/labs/systems',
  },
]

function LabsBackdrop() {
  return (
    <div aria-hidden="true" className="labs-backdrop">
      <span className="labs-backdrop-stars" />
      <span className="labs-backdrop-moon" />
      <span className="labs-backdrop-grid" />
    </div>
  )
}

export default function LabsHub() {
  const { lang, pick } = useLanguage()

  return (
    <div className="labs-page">
      <LabsBackdrop />
      <div className="labs-page-content">
        <Navbar />

        <main className="labs-hub">
          <section className="labs-hub-hero">
            <div className="labs-hub-copy">
              <span className="labs-kicker">
                <Sparkles aria-hidden="true" />{' '}
                {pick(
                  'JUNIOR SPACE ACADEMY · TRAINING STATION',
                  'JUNIOR SPACE ACADEMY · EĞİTİM İSTASYONU',
                )}
              </span>
              <h1>{pick('Choose your laboratory', 'Laboratuvarını seç')}</h1>
              <p>
                {pick(
                  'Explore the systems that keep a lunar base running. Select a station to begin.',
                  'Ay üssünü çalışır tutan sistemleri keşfet. Başlamak için bir istasyon seç.',
                )}
              </p>
            </div>
            <div className="labs-orbit-display" aria-hidden="true">
              <span className="labs-orbit-ring labs-orbit-ring-one" />
              <span className="labs-orbit-ring labs-orbit-ring-two" />
              <span className="labs-orbit-moon">●</span>
              <span className="labs-orbit-satellite">✦</span>
              <span className="labs-orbit-caption">
                {pick('LUNAR', 'AY')}
                <br />
                {pick('RESEARCH', 'ARAŞTIRMASI')}
              </span>
            </div>
          </section>

          <div className="labs-list-heading">
            <span>{pick('OPEN LABORATORIES', 'AÇIK LABORATUVARLAR')}</span>
            <span>{pick('04 STATIONS', '04 İSTASYON')}</span>
          </div>

          <section
            className="labs-card-grid"
            aria-label={pick('Laboratory selection', 'Laboratuvar seçimi')}
          >
            {LABS.map((lab) => (
              <Link
                key={lab.id}
                to={lab.to}
                onClick={() => playClick()}
                className={`lab-select-card lab-accent-${lab.accent}`}
              >
                <span className="lab-card-index">{lab.number}</span>
                <span className="lab-card-icon" aria-hidden="true">
                  <img src={lab.artwork} alt="" />
                </span>
                <span className="lab-card-tag">{lab.tag[lang]}</span>
                <span className="lab-card-title">{lab.title[lang]}</span>
                <span className="lab-card-subtitle">{lab.subtitle[lang]}</span>
                <span className="lab-card-detail">{lab.detail[lang]}</span>
                <span className="lab-card-action">
                  {pick('OPEN STATION', 'İSTASYONU AÇ')} <ArrowRight aria-hidden="true" />
                </span>
              </Link>
            ))}
          </section>

          <footer className="labs-hub-footer">
            <span>
              <span className="labs-footer-dot" /> {pick('SYSTEMS READY', 'SİSTEMLER HAZIR')}
            </span>
            <Link to="/oyun" onClick={() => playClick()}>
              {pick('RETURN TO MISSION', 'GÖREVE DÖN')} <ArrowRight aria-hidden="true" />
            </Link>
          </footer>
        </main>
      </div>
    </div>
  )
}

export function LabWorkspace() {
  const { labId } = useParams()
  const { lang, pick } = useLanguage()
  const selectedLab = LABS.find((lab) => lab.id === labId)

  if (!selectedLab || selectedLab.id === 'build') {
    return <Navigate to="/labs" replace />
  }

  return (
    <div className="labs-page lab-workspace-page">
      <LabsBackdrop />
      <div className="labs-page-content">
        <Navbar />

        <main
          className="lab-workspace"
          onClickCapture={(e) => handleInteractiveClick(e.target)}
        >
          <div className="lab-workspace-topline">
            <Link to="/labs" onClick={() => playClick()} className="lab-back-button">
              <ArrowLeft aria-hidden="true" />
              <span>{pick('BACK', 'GERİ')}</span>
            </Link>
            <span>
              {pick('LAB', 'LAB')} {selectedLab.number} <i /> {selectedLab.tag[lang]}
            </span>
          </div>

          {selectedLab.id === 'resources' && <ResourceLab />}
          {selectedLab.id === 'emergency' && <EmergencyLab />}
          {selectedLab.id === 'systems' && <AdvancedSystemsLab />}
        </main>
      </div>
    </div>
  )
}
