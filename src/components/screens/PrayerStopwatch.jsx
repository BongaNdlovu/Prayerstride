import { ArrowLeft, Pause, Play, RotateCcw, CheckCircle2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import AppScreen from '../ui/AppScreen';
import AppHeader from '../ui/AppHeader';
import AsyncState from '../ui/AsyncState';
import EmptyState from '../ui/EmptyState';
import { addPrayerSession, usePrayerSessions } from '../../hooks/usePrayerSessions';
import { useAuth } from '../../contexts/AuthContext.jsx';

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export default function PrayerStopwatch({ request, onBack, activeTab, onNavigate }) {
  const { user } = useAuth();
  const prayer = request;
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);
  const { totalSeconds, loading, error: sessionsError, retry } = usePrayerSessions();
  const savedMinutes = useMemo(() => Math.floor(totalSeconds / 60), [totalSeconds]);

  useEffect(() => {
    if (!running) return undefined;
    const id = window.setInterval(() => setSeconds((current) => current + 1), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  const complete = async () => {
    setError(null);
    if (!prayer?.id) {
      setError(new Error('Open a real prayer request before saving prayer time.'));
      return;
    }

    if (seconds > 0) {
      try {
        await addPrayerSession({ prayerId: prayer.id, title: prayer.title, seconds }, user);
      } catch (err) {
        setError(err);
        return;
      }
    }
    setRunning(false);
    setSeconds(0);
    onBack?.();
  };

  if (!prayer) {
    return (
      <AppScreen activeTab={activeTab} onNavigate={onNavigate} showNav={false}>
        <AppHeader title="Prayer Timer" onBack={onBack} />
        <EmptyState
          icon={ArrowLeft}
          title="Choose a prayer first"
          subtitle="Open a prayer request, then start the timer from its detail screen so your session can be saved correctly."
        />
      </AppScreen>
    );
  }

  return (
    <AppScreen activeTab={activeTab} onNavigate={onNavigate} showNav={false}>
      <AppHeader title="Prayer Timer" onBack={onBack} />
      <div className="flex min-h-[600px] flex-col px-6 pb-8 pt-8 text-center">
        <div className={`mx-auto flex h-44 w-44 items-center justify-center rounded-full border bg-[#fffaf0] shadow-glow transition ${running ? 'animate-pulse-slow border-candle ring-8 ring-candle/25' : 'border-[#e6ddcf]'}`}>
          <span className="font-serif text-5xl font-bold text-[#020817] drop-shadow-sm">{formatTime(seconds)}</span>
        </div>
        <h1 className="mt-8 font-serif text-3xl leading-tight text-navy">{prayer.title}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">Take a quiet moment to pray. When you finish, the session is added to your prayer time.</p>
        <AsyncState loading={loading} error={sessionsError || error} onRetry={retry}>
        <div className="warm-panel mt-6 rounded-2xl p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-gold">Total prayer time</p>
          <p className="mt-1 font-serif text-2xl text-navy">{savedMinutes} min</p>
        </div>
        </AsyncState>
        <div className="mt-auto grid grid-cols-3 gap-3">
          <button onClick={() => setSeconds(0)} className="flex h-14 items-center justify-center rounded-2xl border border-[#e6ddcf] bg-white text-navy transition active:scale-95">
            <RotateCcw size={20} />
          </button>
          <button onClick={() => setRunning((current) => !current)} className={`flex h-14 items-center justify-center rounded-2xl text-ink transition active:scale-95 ${running ? 'animate-pulse-slow bg-candle shadow-glow' : 'cinematic-button'}`}>
            {running ? <Pause size={23} /> : <Play size={23} />}
          </button>
          <button onClick={complete} className="flex h-14 items-center justify-center rounded-2xl border border-[#e6ddcf] bg-white text-navy transition active:scale-95">
            <CheckCircle2 size={21} />
          </button>
        </div>
      </div>
    </AppScreen>
  );
}
