import { Rocket } from 'lucide-react';

type LabTransitionOverlayProps = {
  visible: boolean;
};

export function LabTransitionOverlay({ visible }: LabTransitionOverlayProps) {
  if (!visible) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-slate-950/40 backdrop-blur-[2px] transition-all"
      aria-hidden="true"
    >
      <div className="flex animate-bounce items-center gap-2 text-cyan-400 drop-shadow-[0_0_20px_rgba(6,182,212,0.9)]">
        <Rocket className="h-16 w-16 -rotate-45 animate-pulse" />
        <span className="font-pixel text-lg tracking-widest text-white">LAUNCHING LAB...</span>
      </div>
    </div>
  );
}
