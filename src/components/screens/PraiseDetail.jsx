import { useState } from 'react';
import { ArrowLeft, CheckCircle2, ChevronRight, Flag, Heart, MessageCircle, Sparkles } from 'lucide-react';
import BottomNav from '../BottomNav';
import EncouragementThread from '../ui/EncouragementThread';
import GlassCard from '../ui/GlassCard';
import SceneImage from '../ui/SceneImage';
import { useTestimonies } from '../../hooks/useTestimonies';
import { usePrayerData } from '../../hooks/usePrayerData';
import { usePersistentState } from '../../hooks/usePersistentState';
import { reactToTestimony } from '../../lib/api';
import { submitReport } from '../../hooks/useReports';

function ReactionButton({ active, count, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-2 text-xs font-semibold transition active:scale-95 ${
        active ? 'border-candle bg-candle text-ink' : 'border-ivory/15 bg-ivory/10 text-ivory/70'
      }`}
    >
      {label} - {count}
    </button>
  );
}

export default function PraiseDetail({ testimony, onBack, onGo, activeTab, onNavigate, user }) {
  const { testimonies } = useTestimonies();
  const { prayers } = usePrayerData();
  const [reactions, setReactions] = usePersistentState('praise:reactions', {});
  const [reported, setReported] = useState(false);
  const [reportError, setReportError] = useState(null);
  const selected = testimony || testimonies[0] || {};
  const relatedPrayer = prayers.find((prayer) => prayer.id === selected.prayerId);
  const reacted = reactions[selected.id] || {};
  const praiseGodCount = (selected.praiseGod || 0) + (reacted.praiseGod ? 1 : 0);
  const amenCount = (selected.amen || 0) + (reacted.amen ? 1 : 0);

  const react = async (key) => {
    const alreadyReacted = Boolean(reactions[selected.id]?.[key]);

    setReactions((current) => ({
      ...current,
      [selected.id]: {
        ...current[selected.id],
        [key]: !current[selected.id]?.[key],
      },
    }));

    if (alreadyReacted) return;

    try {
      await reactToTestimony(selected.id, key);
    } catch (error) {
      setReactions((current) => ({
        ...current,
        [selected.id]: {
          ...current[selected.id],
          [key]: false,
        },
      }));
    }
  };

  const handleReport = async () => {
    if (reported || !selected.id) return;
    setReportError(null);
    try {
      await submitReport(selected.id, 'testimony', 'Reported by user', user);
      setReported(true);
    } catch (err) {
      setReportError(err);
    }
  };

  const openPrayer = () => {
    if (!relatedPrayer) return;
    onGo?.('detail', { request: { ...relatedPrayer, answered: true } });
  };

  if (!selected.id) {
    return (
      <div className="flex h-full items-center justify-center bg-sand">
        <p className="text-sm text-slate-500">No testimony selected.</p>
      </div>
    );
  }

  return (
    <div className="cinematic-bg cinematic-texture relative flex h-full flex-col overflow-hidden text-ivory">
      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto pb-4">
        <div className="relative min-h-[260px] overflow-hidden rounded-b-[34px]">
          <SceneImage scene="answered" className="absolute inset-0" />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/18 via-ink/38 to-ink/92" />
            <div className="relative z-10 px-5 pb-8 pt-4">
            <div className="flex items-center justify-between">
              <button onClick={onBack} className="text-ivory">
                <ArrowLeft size={22} />
              </button>
              <button onClick={handleReport} className={`text-ivory transition ${reported ? 'opacity-50' : 'hover:text-red-300'}`} aria-label="Report testimony">
                <Flag size={20} fill={reported ? 'currentColor' : 'none'} />
              </button>
            </div>
            {reportError && (
              <p className="mt-2 text-xs text-red-300">{reportError.message || 'Could not submit report.'}</p>
            )}
            <div className="mt-14">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-candle">Praise Report</p>
              <h1 className="mt-2 font-serif text-3xl leading-tight text-ivory">{selected.title}</h1>
              <p className="mt-3 text-sm text-ivory/62">{selected.name} - {selected.time}</p>
            </div>
          </div>
        </div>

        <div className="-mt-6 px-5">
          <GlassCard className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-candle text-ink">
                <Sparkles size={20} />
              </div>
              <div>
                <div className="font-semibold text-ivory">{selected.name}</div>
                <div className="text-xs text-ivory/55">Shared a testimony</div>
              </div>
            </div>

            <p className="mt-5 text-[15px] leading-7 text-ivory/76">{selected.text}</p>

            {relatedPrayer && (
              <button
                onClick={openPrayer}
                className="mt-5 flex w-full items-center justify-between rounded-2xl border border-candle/20 bg-candle/10 p-4 text-left transition active:scale-[0.98]"
              >
                <span className="min-w-0">
                  <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-candle">
                    <CheckCircle2 size={14} />
                    Answered prayer
                  </span>
                  <span className="mt-1 block truncate text-sm font-semibold text-ivory">{relatedPrayer.title}</span>
                </span>
                <ChevronRight size={18} className="shrink-0 text-ivory/45" />
              </button>
            )}

            <div className="mt-5 flex flex-wrap gap-2 border-y border-ivory/12 py-4">
              <ReactionButton active={reacted.praiseGod} count={praiseGodCount} label="Praise God" onClick={() => react('praiseGod')} />
              <ReactionButton active={reacted.amen} count={amenCount} label="Amen" onClick={() => react('amen')} />
              <span className="ml-auto flex items-center gap-1 text-xs font-semibold text-ivory/55">
                <MessageCircle size={14} />
                Encourage
              </span>
            </div>

            <EncouragementThread threadId={`testimony:${selected.id}`} currentUser={user} />
          </GlassCard>
        </div>
      </div>

      <div className="shrink-0 border-t border-ivory/10 bg-ink/86 px-5 py-3 backdrop-blur-xl">
        <button onClick={() => react('praiseGod')} className="cinematic-button flex h-14 w-full items-center justify-center gap-2 rounded-2xl font-semibold text-ink transition active:scale-[0.98]">
          <Heart size={18} fill={reacted.praiseGod ? 'currentColor' : 'none'} />
          Praise God
        </button>
      </div>
      <BottomNav active={activeTab} onNavigate={onNavigate} />
    </div>
  );
}
