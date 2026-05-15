import { Bell } from 'lucide-react';
import AppScreen from '../ui/AppScreen';
import AppHeader from '../ui/AppHeader';
import EmptyState from '../ui/EmptyState';
import { useNotifications, markRead } from '../../hooks/useNotifications';

export default function Notifications({ onBack, activeTab, onNavigate }) {
  const { notifications, loading } = useNotifications();

  const unreadItems = notifications.filter((n) => !n.read);

  return (
    <AppScreen activeTab={activeTab} onNavigate={onNavigate}>
      <AppHeader title="Notifications" onBack={onBack} />
      {notifications.length === 0 && !loading ? (
        <EmptyState icon={Bell} title="No notifications" subtitle="You are all caught up." />
      ) : (
        <div className="mt-4 px-4 space-y-6">
          {unreadItems.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">New</h3>
              <div className="mt-2 space-y-2">
                {unreadItems.map((n) => (
                  <div key={n.id} className="rounded-2xl border border-[#e6ddcf] bg-white/90 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm leading-5 text-slate-800">{n.message}</p>
                      <button onClick={() => markRead(n.id)} className="shrink-0 rounded-full bg-navy px-2 py-0.5 text-[10px] text-white">
                        Mark read
                      </button>
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
