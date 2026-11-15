import { useEffect, useId, useRef } from 'react'
import homeLunarHeroImg from '../assets/home-lunar-hero.jpg'

interface IntroModalProps {
  isOpen: boolean
  onStart: () => void
}

export default function IntroModal({ isOpen, onStart }: IntroModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const closingFromPropRef = useRef(false)
  const commanderName = localStorage.getItem('jsa_commander')?.trim() || ''

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen && !dialog.open) {
      dialog.showModal()
    } else if (!isOpen && dialog.open) {
      closingFromPropRef.current = true
      dialog.close()
    }
  }, [isOpen])

  const handleDialogClose = () => {
    if (closingFromPropRef.current) {
      closingFromPropRef.current = false
      return
    }
    onStart()
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={handleDialogClose}
      {...({ closedby: 'any' } as Record<string, string>)}
      className="m-auto w-[min(94vw,38rem)] max-h-[92dvh] overflow-y-auto rounded-2xl border-2 border-white/40 bg-[#081228]/95 backdrop-blur-xl text-[#E6EAF5] shadow-[0_0_48px_rgba(56,189,248,0.24)] p-0"
    >
      {/* Üst Hikâye Görseli */}
      <div className="relative h-44 sm:h-52 w-full overflow-clip">
        <img
          src={homeLunarHeroImg}
          alt="Ay Güney Kutbu Üssü"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#081228] via-[#081228]/35 to-transparent" />
        <span className="absolute top-4 left-5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-amber-300/60 bg-amber-500/20 text-amber-200 backdrop-blur-md">
          Görevimiz: Ay&apos;da İlk Üs
        </span>
      </div>

      {/* Eski Hikâye Anlatımı ve Başlat Butonu */}
      <div className="p-5 sm:p-6 pt-3 flex flex-col gap-4">
        <h2 id={titleId} className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          {commanderName ? `Hoş Geldin, Komutan ${commanderName}!` : 'Hoş Geldin Genç Astronot!'}
        </h2>

        <div className="space-y-3 text-sm sm:text-base text-slate-200 leading-relaxed">
          <p>
            Dünya&apos;dan ayrıldın ve Ay&apos;ın Güney Kutbu&apos;na ulaştın. Artık küçük ekibinle
            birlikte burada <strong>30 gün boyunca</strong> hayatta kalmalısın.
          </p>
          <p className="text-slate-300">
            Yeterli oksijenimiz, suyumuz ve enerjimiz var mı? Bitkilerimizi büyütebilecek miyiz?
            Üssümüzü uzaydaki tehlikelerden koruyabilecek miyiz?
          </p>
          <p className="font-semibold text-cyan-300">
            Ay üssünün geleceği senin kararlarına bağlı!
          </p>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            autoFocus
            onClick={onStart}
            className="px-7 min-h-12 rounded-xl text-base font-bold bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 shadow-[0_0_24px_rgba(251,191,36,0.45)] hover:brightness-110 cursor-pointer transition-all"
          >
            Görev Başlıyor →
          </button>
        </div>
      </div>
    </dialog>
  )
}
