import { ArrowLeft, Clock, Video } from 'lucide-react';
import AppScreen from '../ui/AppScreen';
import AppHeader from '../ui/AppHeader';
import Card from '../ui/Card';
import { mockCalendarEvents } from '../../data/mockData';

export default function CalendarScreen({ onBack, activeTab, onNavigate }) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dates = Array.from({ length: 31 }, (_, i) => i + 1);
  const selected = 15;

  return (
    <AppScreen activeTab={activeTab} onNavigate={onNavigate}>
      <AppHeader title="Calendar" onBack={onBack} />
      <div className="mt-4 px-4">
        <h2 className="font-serif text-2xl text-navy">May 2025</h2>
        <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[10px] text-slate-500">
          {days.map((d) => <div key={d}>{d}</div>)}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1 text-center text-xs">
          {dates.map((d) => (
            <button
              key={d}
              className={`flex h-8 w-8 items-center justify-center rounded-full mx-auto ${d === selected ? 'bg-navy text-white' : 'text-slate-700'}`}
            >
              {d}
            </button>
          ))}
        </div>
        <h3 className="mt-6 font-serif text-lg text-navy">May {selected}</h3>
        <div className="mt-3 space-y-2">
          {mockCalendarEvents.map((ev) => (
            <Card key={ev.id} className="flex items-center justify-between p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e8f0f6] text-navy">
                  {ev.type === 'Live' ? <Video size={18} /> : <Clock size={18} />}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">{ev.title}</div>
                  <div className="text-xs text-slate-500">{ev.time} - {ev.type}</div>
                </div>
              </div>
              {ev.type === 'Live' && (
                <span className="rounded-full bg-navy px-2 py-1 text-[10px] font-semibold text-white">Join</span>
              )}
            </Card>
          ))}
        </div>
      </div>
    </AppScreen>
  );
}
