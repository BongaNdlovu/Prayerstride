import { BookOpen, ChevronRight, Clock, Flame, Heart, Send, Timer } from 'lucide-react';
import AppScreen from '../ui/AppScreen';
import AppHeader from '../ui/AppHeader';
import Card from '../ui/Card';
import AsyncState from '../ui/AsyncState';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { usePrayerData } from '../../hooks/usePrayerData';
import { usePrayerSessions } from '../../hooks/usePrayerSessions';
import { useTestimonies } from '../../hooks/useTestimonies';

export default function MyStats({ onBack, activeTab, onNavigate, onGo }) {
  const { user } = useAuth();
  const { prayers, loading: prayersLoading, error: prayersError, retry: retryPrayers } = usePrayerData();
  const { totalSeconds, loading: sessionsLoading, error: sessionsError, retry: retrySessions } = usePrayerSessions();
  const { testimonies, loading: testimoniesLoading, error: testimoniesError, retry: retryTestimonies } = useTestimonies();

  const ownPrayers = prayers.filter((prayer) => prayer.authorUid === user?.uid);
  const ownTestimonies = testimonies.filter((testimony) => testimony.authorUid === user?.uid);
  const answeredCount = ownPrayers.filter((prayer) => prayer.status === 'answered').length;
  const prayerMinutes = Math.floor(totalSeconds / 60);
  const loading = prayersLoading || sessionsLoading || testimoniesLoading;
  const error = prayersError || sessionsError || testimoniesError;
  const retry = () => {
    retryPrayers?.();
    retrySessions?.();
    retryTestimonies?.();
  };

  return (
    <AppScreen activeTab={activeTab} onNavigate={onNavigate}>
      <AppHeader title="Stats" onBack={onBack} />
      <div className="mt-4 space-y-4 px-5">
        <AsyncState loading={loading} error={error} onRetry={retry}>
          <Card className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gold">Prayer Rhythm</p>
                <h2 className="mt-2 font-serif text-3xl leading-tight text-navy">{prayerMinutes} min saved</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">Your stats now come from live prayers, testimonies, and stopwatch sessions.</p>
              </div>
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#e8f0f6] text-navy">
                <Flame size={25} />
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            {[
              [BookOpen, ownPrayers.length, 'Your prayers'],
              [Heart, answeredCount, 'Answered'],
              [Send, ownTestimonies.length, 'Testimonies'],
              [Clock, `${prayerMinutes}m`, 'Prayer time'],
            ].map(([Icon, value, label]) => (
              <Card key={label} className="p-4">
                <Icon size={20} className="text-gold" />
                <div className="mt-3 font-serif text-2xl text-navy">{value}</div>
                <div className="text-xs text-slate-500">{label}</div>
              </Card>
            ))}
          </div>

          <button onClick={() => onGo?.('myPrayers')} className="flex w-full items-center justify-between rounded-2xl border border-[#e6ddcf] bg-white/80 p-4 text-left transition active:scale-[0.98]">
            <span className="font-semibold text-slate-900">Open your prayer requests</span>
            <ChevronRight size={18} className="text-slate-400" />
          </button>
          <button onClick={() => onGo?.('prayerStopwatch')} className="flex w-full items-center justify-between rounded-2xl border border-[#e6ddcf] bg-white/80 p-4 text-left transition active:scale-[0.98]">
            <span className="flex items-center gap-3 font-semibold text-slate-900">
              <Timer size={18} className="text-navy" />
              Open prayer stopwatch
            </span>
            <ChevronRight size={18} className="text-slate-400" />
          </button>
        </AsyncState>
      </div>
    </AppScreen>
  );
}
