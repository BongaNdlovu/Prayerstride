import { useState } from 'react';
import { ArrowLeft, Calendar } from 'lucide-react';
import AppScreen from '../ui/AppScreen';
import AppHeader from '../ui/AppHeader';
import Card from '../ui/Card';
import { mockAnnouncements } from '../../data/mockData';

export default function Announcements({ onBack, activeTab, onNavigate }) {
  const [tab, setTab] = useState('All');
  const tabs = ['All', 'Events', 'Updates', 'Prayer'];

  const filtered = tab === 'All' ? mockAnnouncements : mockAnnouncements.filter((a) => a.type === tab);

  return (
    <AppScreen activeTab={activeTab} onNavigate={onNavigate}>
      <AppHeader title="Announcements" onBack={onBack} />
      <div className="mt-4 px-4">
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${tab === t ? 'bg-navy text-white' : 'bg-white text-slate-600'}`}>
              {t}
            </button>
          ))}
        </div>
        <div className="mt-4 space-y-3">
          {filtered.map((a) => (
            <Card key={a.id} className="p-3">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e8f0f6] text-navy">
                  <Calendar size={18} />
                </div>
                <div>
                  <div className="font-semibold text-slate-900">{a.title}</div>
                  <div className="text-xs text-slate-500">{a.date} - {a.time}</div>
                  <span className="mt-1 inline-block rounded-full bg-[#f2e7d6] px-2 py-0.5 text-[10px] font-medium text-navy">{a.type}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppScreen>
  );
}
