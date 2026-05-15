import { ArrowLeft } from 'lucide-react';
import AppScreen from '../ui/AppScreen';
import AppHeader from '../ui/AppHeader';
import ToggleRow from '../ui/ToggleRow';
import { usePersistentState } from '../../hooks/usePersistentState';

export default function NotificationSettings({ onBack, activeTab, onNavigate }) {
  const [prayerActivity, setPrayerActivity] = usePersistentState('notifications:prayerActivity', {
    newRequest: true,
    prayerAnswered: true,
    prayerUpdates: true,
    requestMatched: false,
  });
  const [reminders, setReminders] = usePersistentState('notifications:reminders', {
    dailyReminder: true,
    eveningReflection: true,
    weeklySummary: false,
  });
  const [channels, setChannels] = usePersistentState('notifications:channels', {
    push: true,
    email: false,
    inApp: true,
  });

  return (
    <AppScreen activeTab={activeTab} onNavigate={onNavigate}>
      <AppHeader title="Notifications" onBack={onBack} />
      <div className="mt-4 px-5 space-y-6">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Prayer Activity</h3>
          <div className="mt-2 space-y-2">
            <ToggleRow
              title="New prayer request"
              subtitle="When someone posts a request nearby."
              initial={prayerActivity.newRequest}
              onChange={(value) => setPrayerActivity({ ...prayerActivity, newRequest: value })}
            />
            <ToggleRow
              title="Prayer answered"
              subtitle="When a request you follow is answered."
              initial={prayerActivity.prayerAnswered}
              onChange={(value) => setPrayerActivity({ ...prayerActivity, prayerAnswered: value })}
            />
            <ToggleRow
              title="Prayer updates & comments"
              subtitle="Activity on your requests."
              initial={prayerActivity.prayerUpdates}
              onChange={(value) => setPrayerActivity({ ...prayerActivity, prayerUpdates: value })}
            />
            <ToggleRow
              title="Request matched"
              subtitle="Requests that match your prayer focus."
              initial={prayerActivity.requestMatched}
              onChange={(value) => setPrayerActivity({ ...prayerActivity, requestMatched: value })}
            />
          </div>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Reminders</h3>
          <div className="mt-2 space-y-2">
            <ToggleRow
              title="Daily prayer reminder"
              subtitle="Your chosen prayer time."
              initial={reminders.dailyReminder}
              onChange={(value) => setReminders({ ...reminders, dailyReminder: value })}
            />
            <ToggleRow
              title="Evening reflection"
              subtitle="A prompt to reflect on your day."
              initial={reminders.eveningReflection}
              onChange={(value) => setReminders({ ...reminders, eveningReflection: value })}
            />
            <ToggleRow
              title="Weekly summary"
              subtitle="A summary of your prayer activity."
              initial={reminders.weeklySummary}
              onChange={(value) => setReminders({ ...reminders, weeklySummary: value })}
            />
          </div>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Channels</h3>
          <div className="mt-2 space-y-2">
            <ToggleRow
              title="Push notifications"
              initial={channels.push}
              onChange={(value) => setChannels({ ...channels, push: value })}
            />
            <ToggleRow
              title="Email"
              initial={channels.email}
              onChange={(value) => setChannels({ ...channels, email: value })}
            />
            <ToggleRow
              title="In-app messages"
              initial={channels.inApp}
              onChange={(value) => setChannels({ ...channels, inApp: value })}
            />
          </div>
        </div>
      </div>
    </AppScreen>
  );
}
