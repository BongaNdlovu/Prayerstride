import { CalendarDays, Heart, Sparkles, Users } from 'lucide-react';
import TopLogo from '../TopLogo';
import SceneImage from '../ui/SceneImage';

export default function Welcome({ onContinue }) {
  return (
    <div className="cinematic-bg cinematic-texture relative flex h-full flex-col overflow-y-auto px-6 pb-8 text-ivory">
      <SceneImage scene="bible" className="absolute inset-x-0 top-0 h-56 opacity-75" />
      <div className="relative z-10 mt-8">
        <TopLogo small />
      </div>
      <div className="glass-panel relative z-10 mt-10 rounded-[28px] p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-candle">Today</p>
            <p className="mt-1 font-serif text-2xl text-ivory">Start with a quiet step</p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-candle text-ink">
            <Sparkles size={24} />
          </div>
        </div>
      </div>
      <h1 className="relative z-10 mt-8 font-serif text-4xl leading-tight text-ivory">
        Welcome to
        <br />
        PrayerStride
      </h1>
      <p className="relative z-10 mt-3 text-sm leading-6 text-ivory/72">Build a daily prayer habit, pray for others, and celebrate answered prayers together.</p>
      <div className="relative z-10 mt-6 space-y-3">
        {[
          [CalendarDays, "Daily Habit", "Grow closer to God with consistent prayer."],
          [Users, "Pray for Others", "Lift up real people and real needs."],
          [Heart, "Celebrate Answers", "Share testimonies of God's faithfulness."],
        ].map(([Icon, title, text]) => (
          <div key={title} className="glass-panel flex items-center gap-4 rounded-2xl p-4">
            <Icon className="text-candle" size={23} />
            <div>
              <div className="font-semibold text-ivory">{title}</div>
              <div className="text-xs text-ivory/60">{text}</div>
            </div>
          </div>
        ))}
      </div>
      <button onClick={onContinue} className="cinematic-button relative z-10 mt-auto rounded-2xl py-4 font-semibold text-ink transition active:scale-[0.98]">
        Continue
      </button>
    </div>
  );
}
