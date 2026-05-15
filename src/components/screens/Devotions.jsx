import { ArrowLeft, BookOpen, ChevronRight } from 'lucide-react';
import AppScreen from '../ui/AppScreen';
import AppHeader from '../ui/AppHeader';
import Card from '../ui/Card';
import { mockDevotions } from '../../data/mockData';

export default function Devotions({ onBack, onGo, activeTab, onNavigate }) {
  const today = mockDevotions[0];

  return (
    <AppScreen activeTab={activeTab} onNavigate={onNavigate}>
      <AppHeader title="Devotions" onBack={onBack} />
      <div className="mt-4 px-4">
        <div className="flex gap-2 overflow-x-auto">
          {['Mon 12', 'Tue 13', 'Wed 14', 'Thu 15', 'Fri 16'].map((d, i) => (
            <button key={d} className={`shrink-0 rounded-2xl px-3 py-2 text-center text-xs font-semibold ${i === 2 ? 'bg-navy text-white' : 'bg-white text-slate-600'}`}>
              <div className="text-[10px] opacity-80">{d.split(' ')[0]}</div>
              <div className="mt-0.5 text-sm">{d.split(' ')[1]}</div>
            </button>
          ))}
        </div>
        <h2 className="mt-6 text-xs font-semibold uppercase tracking-wider text-slate-500">Today&apos;s Devotion</h2>
        <Card className="mt-2 p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-gold">Devotion</div>
          <h3 className="mt-1 font-serif text-2xl text-navy">{today.title}</h3>
          <p className="mt-1 text-sm text-slate-600">{today.reference}</p>
          <button onClick={() => onGo?.('guideDetail')} className="mt-4 flex items-center gap-1 text-xs font-semibold text-navy">
            Read now <ChevronRight size={14} />
          </button>
        </Card>
        <h2 className="mt-6 font-serif text-xl text-navy">Recent Devotions</h2>
        <div className="mt-3 space-y-3">
          {mockDevotions.slice(1).map((d) => (
            <Card key={d.id} className="flex items-center justify-between p-3" onClick={() => onGo?.('guideDetail')}>
              <div>
                <div className="font-semibold text-slate-900">{d.title}</div>
                <div className="text-xs text-slate-500">{d.reference}</div>
              </div>
              <ChevronRight size={18} className="text-slate-400" />
            </Card>
          ))}
        </div>
      </div>
    </AppScreen>
  );
}
