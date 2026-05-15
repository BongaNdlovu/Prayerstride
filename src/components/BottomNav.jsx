import { BarChart3, Heart, Home, Plus, User } from 'lucide-react';
import PrayingHandsIcon from './PrayingHandsIcon';

const items = [
  ["home", Home, "Home"],
  ["prayers", PrayingHandsIcon, "Prayers"],
  ["create", Plus, "Create"],
  ["praise", Heart, "Praise"],
  ["stats", BarChart3, "Stats"],
  ["profile", User, "Profile"],
];

export default function BottomNav({ active, onNavigate }) {
  return (
    <div className="z-30 shrink-0 border-t border-ivory/10 bg-ink/82 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_-18px_55px_rgba(2,7,18,0.36)] backdrop-blur-xl">
      <div className="grid grid-cols-6 items-end gap-0.5 text-[10px] text-ivory/52">
        {items.map(([key, Icon, label]) => {
          const selected = active === key;
          return (
            <button key={key} onClick={() => onNavigate(key)} className="flex min-w-0 flex-col items-center gap-1 rounded-2xl px-1 py-1.5 transition active:scale-95">
              <div className={`${key === "create" ? "cinematic-button flex h-11 w-11 items-center justify-center rounded-full text-ink shadow-glow" : selected ? "flex h-8 w-8 items-center justify-center rounded-full bg-ivory/14 text-candle" : "flex h-8 w-8 items-center justify-center text-ivory/55"}`}>
                <Icon size={key === "create" ? 23 : 20} strokeWidth={selected || key === "create" ? 2.4 : 1.8} />
              </div>
              <span className={`w-full truncate text-center leading-none ${selected ? "font-semibold text-candle" : ""}`}>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
