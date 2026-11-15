import { Link, useNavigate } from 'react-router-dom'
import lunarHeroImg from '../assets/home-lunar-hero.jpg'
import Navbar from '../components/Navbar'
import { useGame } from '../context/GameContext'
import { playClick } from '../game/sound'

export default function Home() {
  const navigate = useNavigate()
  const { startGame } = useGame()

  const handleLaunch = () => {
    playClick()
    startGame()
    navigate('/oyun')
  }

  return (
    <div className="relative min-h-dvh overflow-clip bg-[#040814] text-white flex flex-col">
      {/* Tam Ekran Çizgi Ay Üssü Arka Planı */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
        <img
          src={lunarHeroImg}
          alt=""
          fetchPriority="high"
          className="w-full h-full object-cover object-right"
        />
        {/* Soldaki metin alanı için yumuşak koyu uzay geçişi */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#040814]/95 via-[#040814]/75 via-45% to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#040814]/45 via-transparent to-[#040814]/40" />
      </div>

      {/* Ön Plan İçerik */}
      <div className="relative z-10 max-w-6xl w-full mx-auto px-4 sm:px-6 flex-1 flex flex-col">
        <Navbar />

        <main className="my-auto py-8 sm:py-12 max-w-xl">
          {/* Başlık + Mission Trainer Rozeti */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-4xl sm:text-[3.4rem] font-extrabold tracking-tight text-white leading-none">
              JUNIOR
            </span>
            <span className="px-3.5 py-1 rounded-full text-[11px] font-semibold tracking-widest uppercase border border-cyan-400/35 bg-[#0F233A]/85 text-cyan-200/90 backdrop-blur-md">
              Mission Trainer
            </span>
          </div>

          <h1 className="text-4xl sm:text-[3.4rem] font-extrabold tracking-wide text-white leading-[1.06] mt-0.5">
            ASTRONAUT
          </h1>

          <p className="text-slate-300 text-sm sm:text-[15px] mt-3.5 max-w-[27rem] leading-relaxed">
            Gücü, oksijeni ve kalkanları yönet. 30 gün boyunca gerçekçi uzay krizlerine karşı Ay
            üssünü hayatta tut!
          </p>

          {/* Görev Seçimi: Ay Güney Kutbu Kartı */}
          <div className="mt-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 mb-2.5">
              Görev Seçimi
            </p>

            <div className="relative w-full max-w-[260px] h-[142px] rounded-xl border border-slate-300/40 bg-[#0A1124]/90 overflow-hidden shadow-[0_14px_34px_rgba(0,0,0,0.55)] backdrop-blur-md">
              <img
                src={lunarHeroImg}
                alt="Ay Güney Kutbu üssü önizlemesi"
                className="w-full h-full object-cover object-[76%_46%] scale-[1.08]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#081022] via-[#081022]/65 via-45% to-transparent" />

              <span className="absolute top-2.5 right-2.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#0D2B24]/85 text-emerald-300 border border-emerald-400/45 backdrop-blur-sm">
                Aktif
              </span>

              <div className="absolute inset-x-0 bottom-0 p-3">
                <span className="block font-bold text-sm tracking-wide text-white leading-tight">
                  AY GÜNEY KUTBU
                </span>
                <span className="block text-[11px] text-slate-300 mt-0.5">
                  30 gün · 14 gün Ay gecesi
                </span>
              </div>
            </div>
          </div>

          {/* Alt Eylem Butonları */}
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <Link
              to="/kaynaklar"
              onClick={() => playClick()}
              className="px-5 min-h-11 inline-flex items-center justify-center rounded-xl text-sm font-semibold border border-slate-300/45 bg-[#0A1124]/80 hover:bg-[#131F3A] text-slate-100 backdrop-blur-md transition-colors"
            >
              NASA Kaynakları
            </Link>

            <button
              type="button"
              onClick={handleLaunch}
              className="px-7 min-h-11 inline-flex items-center justify-center rounded-xl text-sm font-bold tracking-wider uppercase cursor-pointer bg-gradient-to-r from-[#0EA5D9] to-[#22C9EB] hover:brightness-110 text-white shadow-[0_0_24px_rgba(34,211,238,0.4)] transition-all"
            >
              GÖREVİ BAŞLAT →
            </button>

            <Link
              to="/hazirlik"
              onClick={() => playClick()}
              className="px-5 min-h-11 inline-flex items-center justify-center rounded-xl text-sm font-semibold border border-slate-300/45 bg-[#0A1124]/80 hover:bg-[#131F3A] text-slate-100 backdrop-blur-md transition-colors"
            >
              Komutan Brifingi
            </Link>
          </div>
        </main>
      </div>
    </div>
  )
}
