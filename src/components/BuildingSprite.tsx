import { MODULE_SPRITES } from '../game/moduleSprites'
import type { ModuleId } from '../types'

interface BuildingSpriteProps {
  moduleId: ModuleId
  level: number
  alt: string
  night?: boolean
  dimmed?: boolean
  hoverScale?: boolean
  className?: string
}

const SPRITE_DIMS: Record<ModuleId, { w: number; h: number }> = {
  solar: { w: 274, h: 380 },
  battery: { w: 344, h: 380 },
  lifeSupport: { w: 380, h: 308 },
  greenhouse: { w: 376, h: 380 },
  exercise: { w: 380, h: 324 },
  shield: { w: 377, h: 380 },
}

const OUTLINE = '#1E293B'

function SolarAttachments({ level, layer }: { level: number; layer: 'back' | 'front' }) {
  if (layer === 'back') {
    return (
      <>
        {/* Sv.2: Sağ yan yedek katlanır güneş kanadı */}
        {level >= 2 && (
          <g stroke={OUTLINE} strokeWidth="5" strokeLinejoin="round" strokeLinecap="round">
            <line x1="186" y1="158" x2="226" y2="148" stroke="#64748B" strokeWidth="9" />
            <line x1="186" y1="158" x2="226" y2="148" stroke={OUTLINE} strokeWidth="3.5" />
            <polygon points="222,52 328,84 294,186 190,152" fill="#EAB308" />
            <polygon points="229,64 316,90 286,174 201,146" fill="#1D4ED8" />
            <line x1="258" y1="73" x2="230" y2="155" stroke="#93C5FD" strokeWidth="2.5" />
            <line x1="288" y1="82" x2="258" y2="165" stroke="#93C5FD" strokeWidth="2.5" />
            <line x1="215" y1="104" x2="301" y2="132" stroke="#93C5FD" strokeWidth="2.5" />
          </g>
        )}

        {/* Sv.3: Sol yan kanat — 3 panelli güneş dizilimi */}
        {level >= 3 && (
          <g stroke={OUTLINE} strokeWidth="5" strokeLinejoin="round" strokeLinecap="round">
            <line x1="72" y1="115" x2="26" y2="104" stroke="#64748B" strokeWidth="9" />
            <polygon points="-44,34 62,64 32,162 -72,130" fill="#EAB308" />
            <polygon points="-36,46 51,71 25,151 -60,124" fill="#1D4ED8" />
            <line x1="-6" y1="54" x2="-32" y2="133" stroke="#93C5FD" strokeWidth="2.5" />
            <line x1="22" y1="62" x2="-4" y2="142" stroke="#93C5FD" strokeWidth="2.5" />
            <line x1="-49" y1="84" x2="38" y2="110" stroke="#93C5FD" strokeWidth="2.5" />
          </g>
        )}
      </>
    )
  }

  return (
    <>
      {/* Sv.2: Şasi yan güç dönüştürücü kutusu */}
      {level >= 2 && (
        <g stroke={OUTLINE} strokeWidth="4.5" strokeLinejoin="round">
          <rect x="86" y="268" width="44" height="32" rx="6" fill="#475569" />
          <rect x="94" y="276" width="16" height="12" rx="2" fill="#FACC15" strokeWidth="3" />
          <circle cx="119" cy="282" r="4" fill="#38BDF8" strokeWidth="2.5" />
        </g>
      )}

      {/* Sv.3: Aktif enerji durum çubukları */}
      {level >= 3 && (
        <g>
          <path
            d="M132 284 C148 292 162 292 174 282"
            fill="none"
            stroke="#F59E0B"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <circle cx="176" cy="280" r="5" fill="#4ADE80" stroke={OUTLINE} strokeWidth="2.5" />
        </g>
      )}

      {/* Sv.4: Tepe güneş odaklama kulesi ve parıltı */}
      {level >= 4 && (
        <g stroke={OUTLINE} strokeWidth="4.5" strokeLinejoin="round" strokeLinecap="round">
          <path d="M168 34 L182 -10 L196 38 Z" fill="#94A3B8" />
          <circle cx="182" cy="-14" r="13" fill="#FEF08A" />
          <circle cx="182" cy="-14" r="22" fill="#FDE047" opacity="0.32" stroke="none" />
          <path d="M182 -34 L182 -44 M202 -20 L212 -24 M162 -20 L152 -24" stroke="#FDE047" strokeWidth="3.5" />
        </g>
      )}
    </>
  )
}

function BatteryAttachments({ level, layer }: { level: number; layer: 'back' | 'front' }) {
  if (layer === 'back') {
    return (
      <>
        {/* Sv.2: Sağ yan yardımcı silindir kapasitör hücresi */}
        {level >= 2 && (
          <g stroke={OUTLINE} strokeWidth="5" strokeLinejoin="round">
            <path d="M276 112 C310 100 326 118 326 146" fill="none" stroke="#F59E0B" strokeWidth="7" />
            <rect x="304" y="136" width="54" height="150" rx="18" fill="#64748B" />
            <rect x="313" y="164" width="36" height="92" rx="10" fill="#F59E0B" strokeWidth="4" />
            <rect x="321" y="122" width="20" height="16" rx="4" fill="#94A3B8" strokeWidth="4" />
          </g>
        )}

        {/* Sv.3: Sol yan endüstriyel soğutma radyatörü */}
        {level >= 3 && (
          <g stroke={OUTLINE} strokeWidth="5" strokeLinejoin="round">
            <rect x="-24" y="142" width="48" height="142" rx="10" fill="#475569" />
            <line x1="-14" y1="164" x2="12" y2="164" stroke="#94A3B8" strokeWidth="5" />
            <line x1="-14" y1="190" x2="12" y2="190" stroke="#94A3B8" strokeWidth="5" />
            <line x1="-14" y1="216" x2="12" y2="216" stroke="#94A3B8" strokeWidth="5" />
            <line x1="-14" y1="242" x2="12" y2="242" stroke="#38BDF8" strokeWidth="5" />
          </g>
        )}
      </>
    )
  }

  return (
    <>
      {/* Sv.1+: Ön yüzde dijital LED şarj çubuğu */}
      {level >= 1 && (
        <g transform="skewY(14)">
          <rect x="50" y="96" width="76" height="18" rx="5" fill="#0F172A" stroke={OUTLINE} strokeWidth="3.5" />
          <rect x="56" y="101" width="14" height="8" rx="2" fill="#4ADE80" />
          <rect x="74" y="101" width="14" height="8" rx="2" fill={level >= 2 ? '#4ADE80' : '#334155'} />
          <rect x="92" y="101" width="14" height="8" rx="2" fill={level >= 3 ? '#38BDF8' : '#334155'} />
          <rect x="110" y="101" width="10" height="8" rx="2" fill={level >= 4 ? '#38BDF8' : '#334155'} />
        </g>
      )}

      {/* Sv.3: Sağ yüzde ekstra voltaj gösterge şeridi */}
      {level >= 3 && (
        <g transform="skewY(-14)">
          <rect x="236" y="216" width="54" height="16" rx="4" fill="#0F172A" stroke={OUTLINE} strokeWidth="3.5" />
          <rect x="242" y="220" width="42" height="8" rx="2" fill="#38BDF8" />
        </g>
      )}

      {/* Sv.4: Tepe plazma bobini & elektrik parıltısı */}
      {level >= 4 && (
        <g stroke={OUTLINE} strokeWidth="4.5" strokeLinejoin="round" strokeLinecap="round">
          <ellipse cx="172" cy="52" rx="34" ry="12" fill="#475569" />
          <rect x="158" y="6" width="28" height="44" rx="6" fill="#64748B" />
          <ellipse cx="172" cy="22" rx="22" ry="7" fill="#38BDF8" strokeWidth="3" />
          <ellipse cx="172" cy="36" rx="22" ry="7" fill="#38BDF8" strokeWidth="3" />
          <circle cx="172" cy="-4" r="14" fill="#7DD3FC" />
          <circle cx="172" cy="-4" r="24" fill="#38BDF8" opacity="0.28" stroke="none" />
          <path d="M138 -12 L152 -2 M206 -12 L192 -2" stroke="#7DD3FC" strokeWidth="3.5" />
        </g>
      )}
    </>
  )
}

function LifeSupportAttachments({ level, layer }: { level: number; layer: 'back' | 'front' }) {
  if (layer === 'back') {
    return (
      <>
        {/* Sv.2: Sol tarafta dev O₂ basınç silindiri */}
        {level >= 2 && (
          <g stroke={OUTLINE} strokeWidth="5" strokeLinejoin="round">
            <path d="M24 148 H74" stroke="#94A3B8" strokeWidth="10" />
            <rect x="-18" y="68" width="52" height="148" rx="20" fill="#38BDF8" />
            <rect x="-10" y="96" width="36" height="92" rx="8" fill="#BAE6FD" strokeWidth="3" />
            <circle cx="8" cy="126" r="10" fill="#F8FAFC" strokeWidth="3" />
            <line x1="8" y1="126" x2="13" y2="120" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
          </g>
        )}

        {/* Sv.3: Sağ yana bağlı ikincil hava kilidi kapsülü */}
        {level >= 3 && (
          <g stroke={OUTLINE} strokeWidth="5" strokeLinejoin="round">
            <rect x="320" y="164" width="84" height="94" rx="24" fill="#E2E8F0" />
            <rect x="332" y="226" width="72" height="28" rx="8" fill="#38BDF8" strokeWidth="4" />
            <circle cx="366" cy="196" r="16" fill="#0F172A" stroke="#38BDF8" strokeWidth="4" />
            <circle cx="366" cy="196" r="8" fill="#FACC15" opacity="0.9" stroke="none" />
          </g>
        )}
      </>
    )
  }

  return (
    <>
      {/* Sv.3: Üst gelişmiş iletişim & meteoroloji sensörü */}
      {level >= 3 && (
        <g stroke={OUTLINE} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round">
          <rect x="236" y="-8" width="12" height="32" rx="4" fill="#94A3B8" />
          <ellipse cx="242" cy="-14" rx="18" ry="10" transform="rotate(-25 242 -14)" fill="#E2E8F0" />
          <circle cx="244" cy="-22" r="4" fill="#38BDF8" />
        </g>
      )}

      {/* Sv.4: Tepe biyosfer O₂ arıtma halkası ve parlayan kule */}
      {level >= 4 && (
        <g stroke={OUTLINE} strokeWidth="4.5" strokeLinejoin="round" strokeLinecap="round">
          <rect x="188" y="-28" width="18" height="36" rx="6" fill="#64748B" />
          <ellipse cx="197" cy="-16" rx="34" ry="11" fill="none" stroke="#38BDF8" strokeWidth="6" />
          <ellipse cx="197" cy="-16" rx="34" ry="11" fill="none" stroke="#BAE6FD" strokeWidth="2.5" />
          <circle cx="197" cy="-34" r="11" fill="#4ADE80" />
          <circle cx="197" cy="-34" r="20" fill="#4ADE80" opacity="0.28" stroke="none" />
        </g>
      )}
    </>
  )
}

function GreenhouseAttachments({ level, layer }: { level: number; layer: 'back' | 'front' }) {
  if (layer === 'back') {
    return (
      <>
        {/* Sv.2: Sağ dış hidroponik besin tankı ve boru hattı */}
        {level >= 2 && (
          <g stroke={OUTLINE} strokeWidth="5" strokeLinejoin="round">
            <path d="M318 145 L364 145 L364 185" fill="none" stroke="#38BDF8" strokeWidth="9" />
            <rect x="336" y="172" width="54" height="122" rx="16" fill="#0EA5E9" />
            <rect x="345" y="198" width="36" height="68" rx="8" fill="#7DD3FC" strokeWidth="3" />
          </g>
        )}
      </>
    )
  }

  return (
    <>
      {/* Sv.2: Cam çatı havalandırma fanı */}
      {level >= 2 && (
        <g stroke={OUTLINE} strokeWidth="4">
          <ellipse cx="176" cy="84" rx="28" ry="16" fill="#94A3B8" />
          <ellipse cx="176" cy="84" rx="18" ry="10" fill="#1E293B" strokeWidth="2.5" />
          <path d="M164 84 H188 M176 76 V92" stroke="#38BDF8" strokeWidth="3.5" strokeLinecap="round" />
        </g>
      )}

      {/* Sv.3: Mor UV bitki büyütme ışıkları & ön dış saksı */}
      {level >= 3 && (
        <>
          <g strokeLinecap="round">
            <line x1="120" y1="68" x2="292" y2="112" stroke="#E879F9" strokeWidth="7" opacity="0.85" />
            <line x1="120" y1="68" x2="292" y2="112" stroke="#F5D0FE" strokeWidth="2.5" />
          </g>
          <g stroke={OUTLINE} strokeWidth="4.5" strokeLinejoin="round">
            <polygon points="54,302 206,356 206,386 54,332" fill="#475569" />
            <circle cx="88" cy="306" r="14" fill="#22C55E" />
            <circle cx="116" cy="316" r="16" fill="#4ADE80" />
            <circle cx="148" cy="328" r="15" fill="#22C55E" />
            <circle cx="178" cy="339" r="13" fill="#4ADE80" />
          </g>
        </>
      )}

      {/* Sv.4: Çatı biyo-kubbesi & mini bakım dronu */}
      {level >= 4 && (
        <>
          <g stroke={OUTLINE} strokeWidth="4.5" strokeLinejoin="round">
            <ellipse cx="212" cy="54" rx="34" ry="14" fill="#64748B" />
            <path d="M182 52 C182 14 242 14 242 52 Z" fill="#67E8F9" fillOpacity="0.82" />
            <circle cx="212" cy="32" r="9" fill="#4ADE80" strokeWidth="3" />
          </g>
          <g className="animate-bounce" style={{ animationDuration: '2.6s' }}>
            <circle cx="352" cy="42" r="16" fill="#F8FAFC" stroke={OUTLINE} strokeWidth="4" />
            <rect x="342" y="36" width="20" height="10" rx="5" fill="#0F172A" />
            <circle cx="348" cy="41" r="2.5" fill="#38BDF8" />
            <circle cx="356" cy="41" r="2.5" fill="#38BDF8" />
            <circle cx="352" cy="58" r="6" fill="#38BDF8" opacity="0.35" />
          </g>
        </>
      )}
    </>
  )
}

function ExerciseAttachments({ level, layer }: { level: number; layer: 'back' | 'front' }) {
  if (level <= 0) return null

  if (layer === 'back') {
    return (
      <>
        {/* Sv.3: Arka yapay yerçekimi güç kemeri direği */}
        {level >= 3 && (
          <g stroke={OUTLINE} strokeWidth="5" strokeLinejoin="round" strokeLinecap="round">
            <path d="M62 114 C68 -18 308 -18 318 112" fill="none" stroke="#94A3B8" strokeWidth="14" />
            <path d="M62 114 C68 -18 308 -18 318 112" fill="none" stroke="#38BDF8" strokeWidth="4" strokeDasharray="16 14" />
            <circle cx="190" cy="14" r="14" fill="#38BDF8" />
            <circle cx="190" cy="14" r="22" fill="#38BDF8" opacity="0.28" stroke="none" />
          </g>
        )}
      </>
    )
  }

  return (
    <>
      {/* Sv.2: Ön merkez kondisyon bisikleti & biyo-nabız ekranı */}
      {level >= 2 && (
        <>
          <g stroke={OUTLINE} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round">
            <rect x="178" y="246" width="54" height="18" rx="6" fill="#475569" />
            <circle cx="194" cy="236" r="15" fill="#38BDF8" />
            <line x1="208" y1="242" x2="224" y2="206" stroke="#94A3B8" strokeWidth="7" />
            <line x1="214" y1="204" x2="232" y2="200" stroke="#F59E0B" strokeWidth="6" />
          </g>
          <g>
            <rect x="268" y="42" width="44" height="24" rx="6" fill="#0F172A" stroke="#38BDF8" strokeWidth="3" />
            <polyline
              points="274,56 282,56 286,47 291,62 296,52 306,52"
              fill="none"
              stroke="#4ADE80"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </>
      )}

      {/* Sv.3: Platform ön kenar hologram ışık noktaları */}
      {level >= 3 && (
        <g>
          <circle cx="190" cy="306" r="6" fill="#38BDF8" stroke={OUTLINE} strokeWidth="2.5" />
          <circle cx="110" cy="274" r="5" fill="#4ADE80" stroke={OUTLINE} strokeWidth="2.5" />
          <circle cx="272" cy="272" r="5" fill="#4ADE80" stroke={OUTLINE} strokeWidth="2.5" />
        </g>
      )}
    </>
  )
}

function ShieldAttachments({ level, layer }: { level: number; layer: 'back' | 'front' }) {
  if (layer === 'back') {
    return (
      <>
        {/* Sv.2: Sağ arka yedek erken uyarı radarı */}
        {level >= 2 && (
          <g stroke={OUTLINE} strokeWidth="5" strokeLinejoin="round" strokeLinecap="round">
            <rect x="304" y="108" width="20" height="36" rx="5" fill="#64748B" />
            <ellipse cx="330" cy="92" rx="28" ry="18" transform="rotate(-32 330 92)" fill="#CBD5E1" />
            <circle cx="342" cy="76" r="5" fill="#FBBF24" />
          </g>
        )}

        {/* Sv.3: Sağ & sol kalkan jeneratör pilonları */}
        {level >= 3 && (
          <g stroke={OUTLINE} strokeWidth="5" strokeLinejoin="round">
            <rect x="-14" y="132" width="32" height="106" rx="8" fill="#475569" />
            <circle cx="2" cy="122" r="14" fill="#FB923C" />
            <circle cx="2" cy="122" r="22" fill="#FB923C" opacity="0.3" stroke="none" />

            <rect x="358" y="132" width="32" height="106" rx="8" fill="#475569" />
            <circle cx="374" cy="122" r="14" fill="#FB923C" />
            <circle cx="374" cy="122" r="22" fill="#FB923C" opacity="0.3" stroke="none" />
          </g>
        )}
      </>
    )
  }

  return (
    <>
      {/* Sv.2: Ön zırh ayaklarında uyarı fenerleri */}
      {level >= 2 && (
        <g stroke={OUTLINE} strokeWidth="3.5">
          <circle cx="48" cy="240" r="8" fill="#FB923C" />
          <circle cx="192" cy="278" r="8" fill="#4ADE80" />
        </g>
      )}

      {/* Sv.4: Tepe plazma kalkan projektörü & enerji ağı */}
      {level >= 4 && (
        <g stroke={OUTLINE} strokeWidth="4.5" strokeLinejoin="round" strokeLinecap="round">
          <rect x="176" y="72" width="34" height="58" rx="8" fill="#475569" />
          <polygon points="193,14 216,58 193,76 170,58" fill="#38BDF8" />
          <circle cx="193" cy="48" r="28" fill="#38BDF8" opacity="0.22" stroke="none" />
          <path
            d="M24 148 C70 28 308 28 354 148"
            fill="none"
            stroke="#FB923C"
            strokeWidth="4"
            strokeDasharray="14 10"
            opacity="0.85"
          />
        </g>
      )}
    </>
  )
}

function AttachmentsOverlay({
  moduleId,
  level,
  layer,
}: {
  moduleId: ModuleId
  level: number
  layer: 'back' | 'front'
}) {
  switch (moduleId) {
    case 'solar':
      return <SolarAttachments level={level} layer={layer} />
    case 'battery':
      return <BatteryAttachments level={level} layer={layer} />
    case 'lifeSupport':
      return <LifeSupportAttachments level={level} layer={layer} />
    case 'greenhouse':
      return <GreenhouseAttachments level={level} layer={layer} />
    case 'exercise':
      return <ExerciseAttachments level={level} layer={layer} />
    case 'shield':
      return <ShieldAttachments level={level} layer={layer} />
  }
}

export default function BuildingSprite({
  moduleId,
  level,
  alt,
  night = false,
  dimmed = false,
  hoverScale = false,
  className = '',
}: BuildingSpriteProps) {
  const dims = SPRITE_DIMS[moduleId]

  return (
    <div
      style={{ aspectRatio: `${dims.w} / ${dims.h}` }}
      className={`relative h-full w-auto max-w-none select-none transition-transform duration-150 ${
        hoverScale ? 'group-hover:scale-[1.04]' : ''
      } ${className}`}
    >
      {/* Arka Katman Yükseltme Parçaları (kanatlar, tanklar, direkler) */}
      <svg
        viewBox={`0 0 ${dims.w} ${dims.h}`}
        className={`pointer-events-none absolute inset-0 w-full h-full overflow-visible ${
          dimmed ? 'opacity-45 grayscale contrast-75' : ''
        }`}
        aria-hidden="true"
      >
        <AttachmentsOverlay moduleId={moduleId} level={level} layer="back" />
      </svg>

      {/* Ana 2.5D Bina Çizimi */}
      <img
        src={MODULE_SPRITES[moduleId]}
        alt={alt}
        draggable={false}
        className={`relative z-[1] w-full h-full object-contain drop-shadow-[0_6px_8px_rgba(0,0,0,0.4)] ${
          dimmed ? 'opacity-45 grayscale contrast-75' : ''
        } ${night ? 'brightness-85' : ''}`}
      />

      {/* Ön Katman Yükseltme Parçaları (kuleler, LED göstergeler, dron, kalkan kubbesi) */}
      <svg
        viewBox={`0 0 ${dims.w} ${dims.h}`}
        className={`pointer-events-none absolute inset-0 z-[2] w-full h-full overflow-visible ${
          dimmed ? 'opacity-45 grayscale contrast-75' : ''
        }`}
        aria-hidden="true"
      >
        <AttachmentsOverlay moduleId={moduleId} level={level} layer="front" />
      </svg>
    </div>
  )
}
