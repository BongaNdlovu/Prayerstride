import { Lock, ArrowLeft } from 'lucide-react';
import SceneImage from '../ui/SceneImage';

export default function AccountSuspended({ onAppeal, onSignIn }) {
  return (
    <div className="cinematic-bg relative flex h-full flex-col items-center justify-center overflow-y-auto px-6 text-center text-ivory">
      <SceneImage scene="texture" className="absolute inset-0 opacity-70" />
      <div className="absolute inset-0 bg-ink/68" />
      <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/18 text-red-100 ring-1 ring-red-200/20">
        <Lock size={36} />
      </div>
      <h1 className="relative z-10 mt-6 font-serif text-3xl text-ivory">Account Suspended</h1>
      <p className="relative z-10 mt-3 text-sm leading-6 text-ivory/70">This account has been suspended for violating PrayerStride&apos;s community guidelines. If you believe this is a mistake, you can appeal our decision.</p>
      <button onClick={onAppeal} className="cinematic-button relative z-10 mt-8 w-full rounded-2xl py-4 font-semibold text-ink transition active:scale-[0.98]">
        Appeal Decision
      </button>
      <button onClick={onSignIn} className="relative z-10 mt-3 text-sm font-semibold text-ivory/58">
        Back to Sign In
      </button>
    </div>
  );
}
