import { Flame } from 'lucide-react';

export default function StreakCalendar({ streak = 7, currentDayIndex = 6 }) {
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  
  return (
    <div className="flex w-full items-center gap-2">
      <div className="flex min-w-0 flex-1 items-center justify-between rounded-2xl bg-[#f7ecdc] px-2 py-2">
        {days.map((day, i) => {
          const isStreakDay = i <= currentDayIndex;
          const isCurrentDay = i === currentDayIndex;
          
          return (
            <div
              key={`${day}-${i}`}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-semibold transition
                ${isStreakDay 
                  ? 'bg-[#e8f0f6] text-navy' 
                  : 'bg-white/70 text-slate-400'
                }
                ${isCurrentDay ? 'ring-2 ring-gold/45' : ''}
              `}
            >
              {day}
            </div>
          );
        })}
      </div>
      <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#f7ecdc] px-3 py-2">
        <Flame size={16} className="text-[#C8892B]" />
        <span className="font-serif text-base font-semibold text-navy">{streak}</span>
      </div>
    </div>
  );
}
