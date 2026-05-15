import { ArrowLeft, Bell, Mail, ShieldCheck } from 'lucide-react';
import SceneImage from '../ui/SceneImage';

export default function StayConnected({ onBack, onContinue, onSkip }) {
  return (
    <div className="cinematic-bg relative flex h-full flex-col overflow-y-auto px-6 pb-8 text-ivory">
      <SceneImage scene="answered" className="absolute inset-0 opacity-75" />
      <div className="absolute inset-0 bg-ink/62" />
      <button onClick={onBack} className="relative z-10 mt-3 w-fit text-ivory">
        <ArrowLeft size={22} />
      </button>
      <div className="glass-panel relative z-10 mt-6 rounded-[30px] p-8 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-candle text-ink">
          <Bell size={28} />
        </div>
      </div>
      <h1 className="relative z-10 mt-7 font-serif text-3xl leading-tight text-ivory">Stay Connected</h1>
      <p className="relative z-10 mt-2 text-sm leading-6 text-ivory/70">Choose how you want to hear from PrayerStride.</p>
      <div className="relative z-10 mt-6 space-y-3">
        {[
          [Bell, 'Push Notifications', 'Receive reminders for prayer and answered requests.'],
          [Mail, 'Prayer Updates', 'Get encouragement and stories from the community.'],
        ].map(([Icon, title, subtitle]) => (
          <div key={title} className="flex items-center justify-between gap-4 rounded-2xl border border-ivory/15 bg-ivory/10 p-4 backdrop-blur">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-candle/18 text-candle">
                <Icon size={18} />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-ivory">{title}</div>
                <div className="mt-1 text-xs leading-5 text-ivory/58">{subtitle}</div>
              </div>
            </div>
            <div className="flex h-7 w-12 shrink-0 items-center rounded-full bg-candle p-1">
              <span className="h-5 w-5 translate-x-5 rounded-full bg-white shadow-sm" />
            </div>
          </div>
        ))}
      </div>
      <div className="glass-panel relative z-10 mt-4 flex items-start gap-2 rounded-2xl p-3">
        <ShieldCheck size={18} className="mt-0.5 shrink-0 text-candle" />
        <p className="text-xs leading-5 text-ivory/70">We will never spam you or share your information.</p>
      </div>
      <button onClick={onContinue} className="cinematic-button relative z-10 mt-auto rounded-2xl py-4 font-semibold text-ink transition active:scale-[0.98]">
        Continue
      </button>
      <button onClick={onSkip} className="relative z-10 mt-3 text-center text-sm font-semibold text-ivory/58">
        Not now
      </button>
    </div>
  );
}
