import { useState } from 'react';
import { ArrowLeft, Search, Check, Plus } from 'lucide-react';
import AppScreen from '../ui/AppScreen';
import AppHeader from '../ui/AppHeader';
import Avatar from '../ui/Avatar';
import { mockFollowing } from '../../data/mockData';

export default function Following({ onBack, activeTab, onNavigate }) {
  const [tab, setTab] = useState('Following');
  const tabs = ['Following', 'Suggested'];

  const list = tab === 'Following' ? mockFollowing.filter((u) => u.following) : mockFollowing.filter((u) => !u.following);

  return (
    <AppScreen activeTab={activeTab} onNavigate={onNavigate}>
      <AppHeader title="Following" onBack={onBack} />
      <div className="mt-4 px-4">
        <div className="flex items-center gap-2 rounded-2xl border border-[#e6ddcf] bg-white/80 px-3 py-2.5">
          <Search size={16} className="text-slate-400" />
          <span className="text-sm text-slate-400">Search people</span>
        </div>
        <div className="mt-4 flex gap-2">
          {tabs.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${tab === t ? 'bg-navy text-white' : 'bg-white text-slate-600'}`}>
              {t}
            </button>
          ))}
        </div>
        <div className="mt-4 space-y-2">
          {list.map((u) => (
            <div key={u.id} className="flex items-center justify-between rounded-2xl border border-[#e6ddcf] bg-white/75 p-3">
              <div className="flex items-center gap-3">
                <Avatar color="#ded3c4" name={u.name} />
                <div>
                  <div className="text-sm font-semibold text-slate-900">{u.name}</div>
                  <div className="text-xs text-slate-500">{u.title}</div>
                </div>
              </div>
              <button className={`flex h-8 w-8 items-center justify-center rounded-full ${u.following ? 'bg-navy text-white' : 'border border-slate-300 text-slate-600'}`}>
                {u.following ? <Check size={16} /> : <Plus size={16} />}
              </button>
            </div>
          ))}
        </div>
      </div>
    </AppScreen>
  );
}
