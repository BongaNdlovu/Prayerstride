import { ArrowLeft, Award } from 'lucide-react';
import AppScreen from '../ui/AppScreen';
import AppHeader from '../ui/AppHeader';
import ProgressRing from '../ui/ProgressRing';
import Card from '../ui/Card';
import { mockAchievements } from '../../data/mockData';

export default function Achievements({ onBack, activeTab, onNavigate }) {
  const completed = mockAchievements.filter((a) => a.completed).length;
  const progress = Math.round((completed / mockAchievements.length) * 100);

  return (
    <AppScreen activeTab={activeTab} onNavigate={onNavigate}>
      <AppHeader title="Achievements" onBack={onBack} />
      <div className="mt-4 px-4">
        <div className="flex items-center justify-between rounded-2xl border border-[#e6ddcf] bg-white/80 p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Overall Progress</p>
            <p className="mt-1 text-3xl font-serif text-navy">{progress}%</p>
            <p className="text-xs text-slate-500">{completed} of {mockAchievements.length} completed</p>
          </div>
          <ProgressRing progress={progress} size={72} stroke={8} />
        </div>
        <div className="mt-6 space-y-3">
          {mockAchievements.map((a) => (
            <Card key={a.id} className="flex items-center gap-3 p-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${a.completed ? 'bg-[#e8f0f6] text-navy' : 'bg-slate-100 text-slate-400'}`}>
                <Award size={20} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">{a.name}</span>
                  <span className="text-xs text-slate-500">{a.current}/{a.total}</span>
                </div>
                <div className="mt-1 h-1.5 w-full rounded-full bg-slate-100">
                  <div className="h-1.5 rounded-full bg-navy transition-all" style={{ width: `${(a.current / a.total) * 100}%` }} />
                </div>
                <p className="mt-1 text-[11px] text-slate-500">{a.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppScreen>
  );
}
