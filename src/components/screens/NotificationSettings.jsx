import { useEffect, useState } from 'react';
import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import AppScreen from '../ui/AppScreen';
import AppHeader from '../ui/AppHeader';
import ToggleRow from '../ui/ToggleRow';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext.jsx';

const defaults = {
  prayerActivity: true,
  testimonyReactions: true,
  pushEnabled: true,
};

export default function NotificationSettings({ onBack, activeTab, onNavigate }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState(defaults);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return undefined;
    return onSnapshot(doc(db, 'notificationSettings', user.uid), (snapshot) => {
      setSettings({ ...defaults, ...(snapshot.exists() ? snapshot.data() : {}) });
    });
  }, [user]);

  const updateSetting = async (key, value) => {
    if (!user) return;
    const next = { ...settings, [key]: value };
    setSettings(next);
    setError('');
    try {
      await setDoc(doc(db, 'notificationSettings', user.uid), {
        [key]: value,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch {
      setSettings(settings);
      setError('We could not save that preference. Please try again.');
    }
  };

  return (
    <AppScreen activeTab={activeTab} onNavigate={onNavigate}>
      <AppHeader title="Notifications" onBack={onBack} />
      <div className="mt-4 px-5 space-y-6">
        {error && <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Activity</h3>
          <div className="mt-2 space-y-2">
            <ToggleRow
              key={`prayer-${settings.prayerActivity}`}
              title="Prayer activity"
              subtitle="When someone prays for your request."
              initial={settings.prayerActivity}
              storageKey={null}
              onChange={(value) => updateSetting('prayerActivity', value)}
            />
            <ToggleRow
              key={`testimony-${settings.testimonyReactions}`}
              title="Testimony reactions"
              subtitle="When someone reacts to your testimony."
              initial={settings.testimonyReactions}
              storageKey={null}
              onChange={(value) => updateSetting('testimonyReactions', value)}
            />
          </div>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Channels</h3>
          <div className="mt-2 space-y-2">
            <ToggleRow
              key={`push-${settings.pushEnabled}`}
              title="Push notifications"
              subtitle="Allow Worker-sent push notifications for enabled activity."
              initial={settings.pushEnabled}
              storageKey={null}
              onChange={(value) => updateSetting('pushEnabled', value)}
            />
          </div>
        </div>
        <p className="rounded-2xl border border-[#e6ddcf] bg-white/60 p-4 text-xs leading-5 text-slate-500">
          Reminder, email, and weekly summary preferences are disabled until those backends are connected.
        </p>
      </div>
    </AppScreen>
  );
}
