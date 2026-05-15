import { ArrowLeft, Clock } from 'lucide-react';
import AppScreen from '../ui/AppScreen';
import AppHeader from '../ui/AppHeader';
import ToggleRow from '../ui/ToggleRow';
import { mockReminders } from '../../data/mockData';

export default function Reminders({ onBack, activeTab, onNavigate }) {
  const daily = mockReminders.filter((r) => r.category === 'daily');
  const weekly = mockReminders.filter((r) => r.category === 'weekly');
  const followup = mockReminders.filter((r) => r.category === 'followup');

  return (
    <AppScreen activeTab={activeTab} onNavigate={onNavigate}>
      <AppHeader title="Reminders" onBack={onBack} />
      <div className="mt-4 px-4 space-y-6">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Daily Reminders</h3>
          <div className="mt-2 space-y-2">
            {daily.map((r) => (
              <ToggleRow key={r.id} title={r.title} subtitle={`${r.time} - ${r.schedule}`} initial={r.enabled} />
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Weekly Reminders</h3>
          <div className="mt-2 space-y-2">
            {weekly.map((r) => (
              <ToggleRow key={r.id} title={r.title} subtitle={`${r.time} - ${r.schedule}`} initial={r.enabled} />
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Follow-up Reminders</h3>
          <div className="mt-2 space-y-2">
            {followup.map((r) => (
              <ToggleRow key={r.id} title={r.title} subtitle={r.schedule} initial={r.enabled} />
            ))}
          </div>
        </div>
      </div>
    </AppScreen>
  );
}
