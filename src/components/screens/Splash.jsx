import TopLogo from '../TopLogo';
import { Sparkles } from 'lucide-react';
import SceneImage from '../ui/SceneImage';

export default function Splash({ onEnter }) {
  return (
    <div className="cinematic-bg relative flex h-full w-full max-w-full flex-col justify-between overflow-x-hidden overflow-y-auto px-8 pb-[calc(3.5rem+env(safe-area-inset-bottom))] text-center text-ivory">
      <SceneImage scene="chapel" className="absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/25 via-ink/55 to-ink" />
      <div className="relative z-10 mt-24 flex-1 pt-10">
        <TopLogo />
        <div className="glass-panel mx-auto mt-12 max-w-[260px] rounded-[28px] p-5 shadow-glow">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-candle text-ink">
            <Sparkles size={24} />
          </div>
          <p className="mt-4 font-serif text-2xl leading-tight text-ivory">
            Prayer changes things.
          </p>
          <p className="mt-2 text-sm leading-6 text-ivory/72">
            You are not walking alone.
          </p>
        </div>
      </div>
      <div className="relative z-10 space-y-6">
        <button onClick={onEnter} className="cinematic-button mx-auto block w-full max-w-[260px] rounded-2xl px-5 py-4 font-semibold text-ink transition active:scale-[0.98]">
          Enter PrayerStride
        </button>
      </div>
    </div>
  );
}
