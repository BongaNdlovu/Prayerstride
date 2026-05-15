import { Settings, ChevronRight, Heart, Bell, BookOpen, Calendar, BarChart3, Award, Clock, Users, Camera, ShieldCheck } from 'lucide-react';
import PrayingHandsIcon from '../PrayingHandsIcon';
import BottomNav from '../BottomNav';
import { usePersistentState } from '../../hooks/usePersistentState';
import { usePrayerData } from '../../hooks/usePrayerData';

export default function Profile({ activeTab, onNavigate, onGo, user }) {
  const [avatar, setAvatar] = usePersistentState(`profile:${user?.id || 'guest'}:avatar`, '');
  const { prayers } = usePrayerData(user);
  const [profile] = usePersistentState(`profile:${user?.id || 'guest'}`, {
    name: user?.name || 'Guest',
    handle: user?.handle || '',
    bio: '',
  });
  const userPrayers = prayers.filter((prayer) => prayer.userId === user?.id || prayer.userId === 'me');
  const answeredCount = userPrayers.filter((prayer) => prayer.status === 'answered').length;
  const menu = [
    { icon: PrayingHandsIcon, label: 'My Prayers', key: 'myPrayers' },
    { icon: Heart, label: 'Answered Prayers', key: 'answeredPrayers' },
    { icon: BarChart3, label: 'My Stats', key: 'myStats' },
    { icon: Calendar, label: 'Calendar', key: 'calendar' },
    { icon: Users, label: 'Groups', key: 'groups' },
    { icon: BookOpen, label: 'Devotions', key: 'devotions' },
    { icon: Award, label: 'Achievements', key: 'achievements' },
    { icon: Clock, label: 'Prayer Stopwatch', key: 'prayerStopwatch' },
    { icon: Clock, label: 'Reminders', key: 'reminderSettings' },
    { icon: Bell, label: 'Notifications', key: 'notifications' },
    { icon: ShieldCheck, label: 'Stewardship Console', key: 'adminDashboard' },
    { icon: Settings, label: 'Settings', key: 'settings' },
  ];

  const uploadAvatar = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-sand">
      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-4 pb-4">
      <div className="mt-4 flex items-center justify-between">
        <h1 className="font-serif text-3xl text-navy">Profile</h1>
        <button onClick={() => onGo?.('settings')} className="text-navy"><Settings size={22} /></button>
      </div>
      <div className="warm-panel mt-6 rounded-[28px] p-4 text-center">
        <label className="relative mx-auto block h-20 w-20 cursor-pointer">
          {avatar ? (
            <img src={avatar} alt="" className="h-20 w-20 rounded-full object-cover" />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#ded3c4] text-navy">
              <Camera size={24} />
            </div>
          )}
          <span className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-navy text-white shadow-sm">
            <Camera size={14} />
          </span>
          <input type="file" accept="image/*" onChange={uploadAvatar} className="sr-only" />
        </label>
        <h2 className="mt-3 font-serif text-xl text-navy">{profile.name || user?.name || 'Guest'}</h2>
        <p className="mt-1 text-xs text-slate-500">{profile.bio || user?.email || 'Sign in to sync your prayer journey.'}</p>
        <div className="mt-5 grid grid-cols-3 gap-2">
          {[
            [userPrayers.length, "Prayers"],
            [answeredCount, "Answered"],
            [7, "Streak"],
          ].map(([n, l]) => (
            <div key={l} className="rounded-2xl bg-white/65 p-3">
              <div className="font-serif text-2xl text-navy">{n}</div>
              <div className="text-xs text-slate-500">{l}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-5 space-y-3">
        {menu.map((item) => (
          <button key={item.label} onClick={() => onGo?.(item.key)} className="warm-panel flex min-h-[58px] w-full items-center justify-between gap-3 rounded-2xl p-4 transition active:scale-[0.98]">
            <span className="flex min-w-0 items-center gap-3 font-semibold text-slate-800">
              <item.icon size={19} className="text-navy" />
              <span className="truncate">{item.label}</span>
            </span>
            <ChevronRight size={18} className="text-slate-400" />
          </button>
        ))}
      </div>
      </div>
      <BottomNav active={activeTab} onNavigate={onNavigate} />
    </div>
  );
}
