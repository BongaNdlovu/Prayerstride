import PrayingHandsIcon from './PrayingHandsIcon';

export default function TopLogo({ small = false }) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <div className="relative text-navy">
        <PrayingHandsIcon size={small ? 30 : 44} strokeWidth={1.5} />
        <span className="absolute -right-2 -top-3 text-gold">✦</span>
      </div>
      <div className={`${small ? "text-2xl" : "text-4xl"} font-serif text-navy`}>PrayerStride</div>
      <div className="text-xs text-slate-600">A daily walk in prayer</div>
    </div>
  );
}