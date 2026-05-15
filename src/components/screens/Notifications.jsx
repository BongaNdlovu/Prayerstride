import { Check, Trash2, Bell } from 'lucide-react';
import AppScreen from '../ui/AppScreen';
import AppHeader from '../ui/AppHeader';
import { mockNotifications } from '../../data/mockData';
import EmptyState from '../ui/EmptyState';
import { usePersistentState } from '../../hooks/usePersistentState';

export default function Notifications({ onBack, activeTab, onNavigate }) {
  const [items, setItems] = usePersistentState('notifications:items', mockNotifications);

  const markAllRead = () => setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  const clearAll = () => setItems([]);

  const newItems = items.filter((n) => !n.read);
  const earlierItems = items.filter((n) => n.read);

  return (
    <AppScreen activeTab={activeTab} onNavigate={onNavigate}>
      <AppHeader title="Notifications" onBack={onBack} rightAction={
        <div className="flex gap-1">
          <button onClick={markAllRead} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/70 text-slate-600"><Check size={16} /></button>
          <button onClick={clearAll} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/70 text-slate-600"><Trash2 size={16} /></button>
        </div>
      } />
      {items.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" subtitle="You are all caught up." />
      ) : (
        <div className="mt-4 px-4 space-y-6">
          {newItems.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">New</h3>
              <div className="mt-2 space-y-2">
                {newItems.map((n) => (
                  <div key={n.id} className="rounded-2xl border border-[#e6ddcf] bg-white/90 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm leading-5 text-slate-800">{n.text}</p>
                      <span className="shrink-0 rounded-full bg-navy px-2 py-0.5 text-[10px] text-white">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {earlierItems.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Earlier</h3>
              <div className="mt-2 space-y-2">
                {earlierItems.map((n) => (
                  <div key={n.id} className="rounded-2xl border border-[#e6ddcf] bg-white/60 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm leading-5 text-slate-600">{n.text}</p>
                      <span className="shrink-0 text-[10px] text-slate-400">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </AppScreen>
  );
}
