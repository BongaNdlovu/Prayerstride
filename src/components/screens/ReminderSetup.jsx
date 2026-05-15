import { useState } from 'react';
import { ArrowLeft, Clock } from 'lucide-react';

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
    <div className="flex h-full flex-col overflow-y-auto bg-sand px-6 pb-8">
      <button onClick={onBack} className="mt-3 w-fit text-navy">
        <ArrowLeft size={22} />
      </button>
      <div className="mt-6 rounded-[30px] border border-[#e6ddcf] bg-white/75 p-8 text-center shadow-sm">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#f1dfc8] text-gold">
          <Clock size={28} />
        </div>
      </div>
      <h1 className="mt-7 font-serif text-3xl leading-tight text-navy">
        When would you like
        <br />
        to be reminded?
      </h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">We'll send a gentle nudge so you never miss a moment to pray.</p>
      <div className="mt-6 space-y-3">
        {reminders.map((r, i) => (
          <button key={r.title} onClick={() => toggle(i)} className="flex w-full items-center justify-between rounded-2xl border border-[#e6ddcf] bg-white/70 p-4 text-left transition active:scale-[0.98]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f3e6d2] text-gold">
                <Clock size={20} />
              </div>
              <div>
                <div className="font-semibold text-slate-900">{r.title}</div>
                <div className="text-xs text-slate-500">{r.text}</div>
                <span className="mt-1 inline-block rounded-full border px-2 py-0.5 text-xs">{r.time}</span>
              </div>
            </div>
            <div className={`h-5 w-5 rounded-full border ${r.selected ? "border-navy bg-navy ring-4 ring-[#d8e4ee]" : "border-slate-300"}`} />
          </button>
        ))}
      </div>
      <button onClick={onContinue} className="mt-auto rounded-2xl bg-navy py-4 font-semibold text-white transition hover:bg-[#0a3358]">
        Continue
      </button>
    </div>
  );
}
