import { useState } from 'react';
import { usePersistentState } from '../../hooks/usePersistentState';

export default function ToggleRow({ title, subtitle, initial = false, onChange, storageKey }) {
  const fallback = useState(initial);
  const persistent = usePersistentState(storageKey || `toggle:${title}`, initial);
  const [on, setOn] = storageKey === null ? fallback : persistent;

  const toggle = () => {
    const next = !on;
    setOn(next);
    onChange?.(next);
  };

  return (
    <button onClick={toggle} className="warm-panel flex w-full items-center justify-between gap-4 rounded-2xl p-4 text-left transition active:scale-[0.98]">
      <div className="min-w-0 flex-1">
        <div className="font-semibold text-slate-900">{title}</div>
        {subtitle && <div className="text-xs text-slate-500">{subtitle}</div>}
      </div>
      <div className={`relative h-8 w-14 shrink-0 rounded-full p-1 transition ${on ? 'bg-candle shadow-glow' : 'bg-slate-300'}`}>
        <div className={`h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${on ? 'translate-x-6' : 'translate-x-0'}`} />
      </div>
    </button>
  );
}
