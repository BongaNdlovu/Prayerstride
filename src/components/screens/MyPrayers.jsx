import { useState } from 'react';
import { FileText, HeartHandshake, Plus, Search } from 'lucide-react';
import AppScreen from '../ui/AppScreen';
import AppHeader from '../ui/AppHeader';
import Card from '../ui/Card';
import EmptyState from '../ui/EmptyState';
import { usePrayerData } from '../../hooks/usePrayerData';

export default function MyPrayers({ onBack, activeTab, onNavigate, onGo, user }) {
  const [tab, setTab] = useState('All');
  const { prayers } = usePrayerData();
  const myPrayers = prayers.filter((prayer) => prayer.authorUid === user?.uid);
  const tabs = ['All', 'Requests', 'Praise', 'Archived'];

  const filtered = tab === 'All' ? myPrayers : myPrayers.filter((p) => {
    if (tab === 'Requests') return p.status === 'active';
    if (tab === 'Praise') return p.status === 'answered';
    if (tab === 'Archived') return p.status === 'archived';
    return true;
  });

  const stats = {
    Active: myPrayers.filter((p) => p.status === 'active').length,
    Answered: myPrayers.filter((p) => p.status === 'answered').length,
    Archived: myPrayers.filter((p) => p.status === 'archived').length,
  };

  return (
    <AppScreen activeTab={activeTab} onNavigate={onNavigate}>
      <AppHeader title="My Prayers" onBack={onBack} />
      <div className="mt-4 px-4">
        <div className="rounded-[28px] border border-[#e6ddcf] bg-white/85 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-gold">Prayer Hub</p>
          <h2 className="mt-2 font-serif text-2xl leading-tight text-navy">Keep your prayer life moving.</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Return to requests you care about, share your own need, or find someone to pray for today.</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button onClick={() => onGo?.('discover')} className="flex items-center justify-center gap-2 rounded-2xl bg-navy px-3 py-3 text-sm font-semibold text-white transition active:scale-[0.98]">
              <Search size={17} />
              Pray now
            </button>
            <button onClick={() => onGo?.('create')} className="flex items-center justify-center gap-2 rounded-2xl border border-[#e6ddcf] bg-sand px-3 py-3 text-sm font-semibold text-navy transition active:scale-[0.98]">
              <Plus size={17} />
              New request
            </button>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {Object.entries(stats).map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-[#e6ddcf] bg-white/75 p-3 text-center">
              <div className="text-xl font-serif text-navy">{value}</div>
              <div className="text-[10px] text-slate-500">{label}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${tab === t ? 'bg-navy text-white' : 'bg-white text-slate-600'}`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="mt-4 space-y-2">
          {filtered.length === 0 ? (
            <EmptyState icon={FileText} title="No prayers here yet" subtitle="Switch tabs or create a new request." />
          ) : (
            filtered.map((p) => (
              <Card key={p.id} className="p-3" onClick={() => onGo?.('detail', { request: p })}>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <HeartHandshake size={16} className="text-gold" />
                    {p.title}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${p.status === 'answered' ? 'bg-[#e8f0f6] text-navy' : p.status === 'archived' ? 'bg-slate-100 text-slate-500' : 'bg-[#f2e7d6] text-gold'}`}>
                    {p.status}
                  </span>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </AppScreen>
  );
}
