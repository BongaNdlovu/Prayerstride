import { useState } from 'react';
import { X, Link2, CheckCircle2 } from 'lucide-react';
import AppScreen from '../ui/AppScreen';
import ToggleRow from '../ui/ToggleRow';
import { addTestimony } from '../../hooks/useTestimonies';
import { usePrayerData } from '../../hooks/usePrayerData';

export default function CreateTestimony({ onBack, onDone, activeTab, onNavigate, user, prayerId, prayerTitle }) {
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const { prayers } = usePrayerData();
  const [selectedPrayerId, setSelectedPrayerId] = useState(prayerId || null);
  const [shared, setShared] = useState(false);
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const ownPrayers = prayers.filter((prayer) => prayer.authorUid === user?.uid);
  const selectedPrayer = ownPrayers.find((prayer) => prayer.id === selectedPrayerId);
  const answeredOptions = [
    ...(selectedPrayer ? [selectedPrayer] : []),
    ...ownPrayers.filter((prayer) => prayer.answered && prayer.id !== selectedPrayerId),
    ...ownPrayers.filter((prayer) => !prayer.answered && prayer.id !== selectedPrayerId).slice(0, 2),
  ];
  const activePrayerId = selectedPrayer ? selectedPrayerId : answeredOptions[0]?.id;

  const post = async () => {
    if (busy) return;
    if (!text.trim() || !user || !activePrayerId) {
      setError('Choose a prayer and write your testimony before posting.');
      return;
    }

    setBusy(true);
    setError('');
    try {
      await addTestimony({
        title: title.trim() || prayerTitle || 'Answered prayer',
        body: text.trim(),
        prayerId: activePrayerId,
        shared,
        isAnonymous: false,
        tags: [],
      }, user);
    } catch {
      setError('We could not share this testimony. Please try again.');
      setBusy(false);
      return;
    }

    setBusy(false);
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
          <button disabled={busy} onClick={post} className="text-sm font-semibold text-navy disabled:opacity-50">{busy ? 'Posting' : 'Post'}</button>
        </div>
        <h2 className="mt-10 font-serif text-3xl leading-tight text-navy">Share how God answered your prayer</h2>
        <p className="mt-3 text-sm leading-6 text-slate-500">Tell how God answered your prayer and what He taught you.</p>
        {!answeredOptions.length ? (
          <div className="mt-7 rounded-2xl border border-[#e6ddcf] bg-white/80 p-5 text-center">
            <p className="font-semibold text-slate-900">No prayer to link yet</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">Create your own prayer request first. Once it is answered, you can share the testimony here.</p>
            <button onClick={onDone} className="mt-4 rounded-2xl bg-navy px-5 py-3 text-sm font-semibold text-white">
              Back to Praise
            </button>
          </div>
        ) : (
        <>
        {error && <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-7 w-full rounded-2xl border border-[#e6ddcf] bg-white/80 p-4 text-sm outline-none focus:border-navy"
          placeholder="Testimony title"
        />
        <textarea
          value={text}
          maxLength={1500}
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
                    activePrayerId === prayer.id ? 'border-navy bg-[#e8f0f6]' : 'border-[#e6ddcf] bg-sand'
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-slate-900">{prayer.title}</span>
                    <span className="text-xs text-slate-500">{prayer.answered ? 'Answered' : 'Marking as answered'}</span>
                  </span>
                  <span className={`h-4 w-4 shrink-0 rounded-full border ${activePrayerId === prayer.id ? 'border-navy bg-navy' : 'border-slate-300'}`} />
                </button>
              ))}
            </div>
          </div>
          <ToggleRow title="Allow others to share" subtitle="Yes, others can share this testimony." initial={shared} onChange={setShared} />
        </div>
        <p className="mt-6 text-center text-xs text-slate-400">By posting, you agree to our community guidelines.</p>
        </>
        )}
      </div>
    </AppScreen>
  );
}
