import { Search, Users, ChevronRight } from 'lucide-react';
import AppScreen from '../ui/AppScreen';
import Card from '../ui/Card';
import { mockGroups } from '../../data/mockData';

export default function Groups({ onBack, activeTab, onNavigate, onGroup }) {
  return (
    <AppScreen activeTab={activeTab} onNavigate={onNavigate}>
      <div className="mt-4 px-4">
        <h1 className="font-serif text-3xl text-navy">Groups</h1>
        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-[#e6ddcf] bg-white/80 px-3 py-3">
          <Search size={18} className="text-slate-400" />
          <span className="text-sm text-slate-400">Search groups</span>
        </div>
        <h2 className="mt-6 font-serif text-xl text-navy">Featured Prayer Circles</h2>
        <div className="mt-3 space-y-3">
          {mockGroups.map((g) => (
            <Card key={g.id} onClick={() => onGroup?.(g.id)} className="p-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl" style={{ backgroundColor: g.image }} />
                <div className="flex-1">
                  <div className="font-semibold text-slate-900">{g.name}</div>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Users size={12} /> {g.members.toLocaleString()} members
                  </div>
                  <p className="mt-1 text-xs leading-4 text-slate-500 line-clamp-2">{g.description}</p>
                </div>
                <ChevronRight size={18} className="text-slate-400" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppScreen>
  );
}
