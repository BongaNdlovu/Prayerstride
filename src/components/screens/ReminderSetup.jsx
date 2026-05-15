import { useState } from 'react';
import { ArrowLeft, Clock } from 'lucide-react';
import SceneImage from '../ui/SceneImage';

export default function ReminderSetup({ onBack, onContinue }) {
  const [reminders, setReminders] = useState([
    { title: "Morning Prayer", text: "Start your day with God.", time: "7:00 AM", selected: true },
    { title: "Evening Prayer", text: "End your day in peace.", time: "8:00 PM", selected: false },
  ]);

  const toggle = (idx) => {
    const next = [...reminders];
    next[idx].selected = !next[idx].selected;
    setReminders(next);
  };

  return (
    <div className="cinematic-bg relative flex h-full flex-col overflow-y-auto px-6 pb-8 text-ivory">
      <SceneImage scene="chapel" className="absolute inset-0 opacity-75" />
      <div className="absolute inset-0 bg-ink/62" />
      <button onClick={onBack} className="relative z-10 mt-3 w-fit text-ivory">
        <ArrowLeft size={22} />
      </button>
      <div className="glass-panel relative z-10 mt-6 rounded-[30px] p-8 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-candle text-ink">
          <Clock size={28} />
        </div>
      </div>
      <h1 className="relative z-10 mt-7 font-serif text-3xl leading-tight text-ivory">
        When would you like
        <br />
        to be reminded?
      </h1>
      <p className="relative z-10 mt-2 text-sm leading-6 text-ivory/70">We'll send a gentle nudge so you never miss a moment to pray.</p>
      <div className="relative z-10 mt-6 space-y-3">
        {reminders.map((r, i) => (
          <button key={r.title} onClick={() => toggle(i)} className="flex w-full items-center justify-between rounded-2xl border border-ivory/15 bg-ivory/10 p-4 text-left backdrop-blur transition active:scale-[0.98]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-candle/18 text-candle">
                <Clock size={20} />
              </div>
              <div>
                <div className="font-semibold text-ivory">{r.title}</div>
                <div className="text-xs text-ivory/58">{r.text}</div>
                <span className="mt-1 inline-block rounded-full border border-ivory/15 px-2 py-0.5 text-xs text-ivory/70">{r.time}</span>
              </div>
            </div>
            <div className={`h-5 w-5 rounded-full border ${r.selected ? "border-candle bg-candle ring-4 ring-candle/20" : "border-ivory/30"}`} />
          </button>
        ))}
      </div>
      <button onClick={onContinue} className="cinematic-button relative z-10 mt-auto rounded-2xl py-4 font-semibold text-ink transition active:scale-[0.98]">
        Continue
      </button>
    </div>
  );
}
