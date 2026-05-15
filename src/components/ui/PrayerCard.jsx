import { Users, Bookmark } from 'lucide-react';

export default function PrayerCard({ prayer, onPress }) {
  return (
    <button onClick={onPress} className="glass-panel w-full rounded-[24px] p-4 text-left text-ivory transition active:scale-[0.98]">
      <div className="flex items-center justify-between text-xs text-ivory/55">
        <span>{prayer.name} - 2h ago</span>
        <span className="rounded-full bg-candle/18 px-2 py-1 text-candle">{prayer.tag}</span>
      </div>
      <h4 className="mt-2 font-serif text-xl leading-tight text-ivory">{prayer.title}</h4>
      <p className="mt-2 line-clamp-3 text-sm leading-5 text-ivory/68">{prayer.text}</p>
      <div className="mt-3 flex items-center justify-between text-xs text-ivory/55">
        <span className="flex items-center gap-1">
          <Users size={14} /> {prayer.count} praying
        </span>
        <Bookmark size={16} />
      </div>
    </button>
  );
}
