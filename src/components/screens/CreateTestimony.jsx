import { useState } from 'react';
import { X, Link2, CheckCircle2 } from 'lucide-react';
import AppScreen from '../ui/AppScreen';
import ToggleRow from '../ui/ToggleRow';
import { usePersistentState } from '../../hooks/usePersistentState';
import { usePrayerData } from '../../hooks/usePrayerData';

export default function CreateTestimony({ onBack, onDone, activeTab, onNavigate, user, prayerId, prayerTitle }) {
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const { prayers, markAnswered } = usePrayerData(user);
  const [selectedPrayerId, setSelectedPrayerId] = useState(prayerId || prayers.find((prayer) => prayer.answered)?.id || prayers[0]?.id);
  const [shared, setShared] = useState(false);
  const [success, setSuccess] = useState(false);
  const [, setLocalTestimonies] = usePersistentState('user:testimonies', []);
  const [, setNotifications] = usePersistentState('notifications:items', []);
  const [notificationActivity] = usePersistentState('notifications:prayerActivity', { prayerAnswered: true });
  const [notificationChannels] = usePersistentState('notifications:channels', { inApp: true });
  const selectedPrayer = prayers.find((prayer) => prayer.id === selectedPrayerId);
  const answeredOptions = [
    ...(selectedPrayer ? [selectedPrayer] : []),
    ...prayers.filter((prayer) => prayer.answered && prayer.id !== selectedPrayerId),
    ...prayers.filter((prayer) => !prayer.answered && prayer.id !== selectedPrayerId).slice(0, 2),
  ];

  const post = () => {
    if (!text.trim()) return;
    const linkedPrayer = prayers.find((prayer) => prayer.id === selectedPrayerId);
    if (selectedPrayerId) markAnswered(selectedPrayerId);
    const testimony = {
      id: `local-testimony-${Date.now()}`,
      prayerId: selectedPrayerId,
      userId: user?.id || 'me',
      name: user?.name || 'You',
      title: title.trim() || prayerTitle || linkedPrayer?.title || 'Answered prayer',
      text: text.trim(),
      praiseGod: 0,
      amen: 0,
      time: 'just now',
      shared,
    };
    setLocalTestimonies((current) => [testimony, ...current]);
    if (notificationChannels.inApp && notificationActivity.prayerAnswered) {
      setNotifications((current) => [
        { id: `n-${Date.now()}`, text: 'Your testimony was shared.', type: 'new', time: 'just now', read: false },
        ...current,
      ]);
    }
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onDone?.();
    }, 1800);
  };

  if (success) {
    return (
      <div className="flex h-full flex-col items-center justify-center overflow-y-auto bg-sand px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#e8f0f6] text-navy">
          <CheckCircle2 size={32} />
        </div>
        <h2 className="mt-6 font-serif text-2xl text-navy">Testimony shared</h2>
        <p className="mt-2 text-sm text-slate-600">Your story can encourage someone today.</p>
      </div>
    );
  }

  return (
    <AppScreen activeTab={activeTab} onNavigate={onNavigate} showNav={false}>
      <div className="flex min-h-full flex-col bg-sand px-5 pb-6">
        <div className="mt-4 flex items-center justify-between">
          <button onClick={onBack} className="text-sm text-slate-700"><X size={22} /></button>
          <h1 className="font-semibold text-slate-900">Create Testimony</h1>
          <button onClick={post} className="text-sm font-semibold text-navy">Post</button>
        </div>
        <h2 className="mt-10 font-serif text-3xl leading-tight text-navy">Share how God answered your prayer</h2>
        <p className="mt-3 text-sm leading-6 text-slate-500">Tell how God answered your prayer and what He taught you.</p>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-7 w-full rounded-2xl border border-[#e6ddcf] bg-white/80 p-4 text-sm outline-none focus:border-navy"
          placeholder="Testimony title"
        />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="mt-3 h-40 w-full resize-none rounded-2xl border border-[#e6ddcf] bg-white/80 p-4 text-sm outline-none focus:border-navy"
          placeholder="Write your testimony..."
        />
        <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
          <div className="flex gap-4">
            <Link2 size={18} />
          </div>
          <span>{text.length}/1500</span>
        </div>
        <div className="mt-6 space-y-3">
          <div className="rounded-2xl border border-[#e6ddcf] bg-white/75 p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-gold">Linked prayer</div>
            <div className="mt-3 space-y-2">
              {answeredOptions.map((prayer) => (
                <button
                  key={prayer.id}
                  onClick={() => setSelectedPrayerId(prayer.id)}
                  className={`flex w-full items-center justify-between rounded-2xl border px-3 py-3 text-left transition active:scale-[0.98] ${
                    selectedPrayerId === prayer.id ? 'border-navy bg-[#e8f0f6]' : 'border-[#e6ddcf] bg-sand'
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-slate-900">{prayer.title}</span>
                    <span className="text-xs text-slate-500">{prayer.answered ? 'Answered' : 'Marking as answered'}</span>
                  </span>
                  <span className={`h-4 w-4 shrink-0 rounded-full border ${selectedPrayerId === prayer.id ? 'border-navy bg-navy' : 'border-slate-300'}`} />
                </button>
              ))}
            </div>
          </div>
          <ToggleRow title="Allow others to share" subtitle="Yes, others can share this testimony." initial={shared} onChange={setShared} />
        </div>
        <p className="mt-6 text-center text-xs text-slate-400">By posting, you agree to our community guidelines.</p>
      </div>
    </AppScreen>
  );
}
