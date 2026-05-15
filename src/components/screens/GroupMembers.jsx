import { ArrowLeft, Search } from 'lucide-react';
import AppScreen from '../ui/AppScreen';
import AppHeader from '../ui/AppHeader';
import Avatar from '../ui/Avatar';
import { mockGroupMembers } from '../../data/mockData';

export default function GroupMembers({ onBack, activeTab, onNavigate }) {
  return (
    <AppScreen activeTab={activeTab} onNavigate={onNavigate}>
      <AppHeader title="Group Members" onBack={onBack} />
      <div className="mt-4 px-5">
        <p className="text-xs text-slate-500">{mockGroupMembers.length.toLocaleString()} members</p>
        <div className="mt-3 flex items-center gap-2 rounded-2xl border border-[#e6ddcf] bg-white/80 px-3 py-2.5">
          <Search size={16} className="text-slate-400" />
          <span className="text-sm text-slate-400">Search members</span>
        </div>
        <div className="mt-4 space-y-2">
          {mockGroupMembers.map((m) => (
            <div key={m.id} className="flex items-center gap-3 rounded-2xl border border-[#e6ddcf] bg-white/75 p-3">
              <Avatar color={m.avatarColor} name={m.name} />
              <div className="flex-1">
                <div className="text-sm font-semibold text-slate-900">{m.name}</div>
                <div className="text-xs text-slate-500">{m.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppScreen>
  );
}
