import { CheckCircle2, ChevronRight, Flag, Heart, MessageCircle, Plus, Sparkles } from 'lucide-react';
import { useState } from 'react';
import BottomNav from '../BottomNav';
import Card from '../ui/Card';
import { useTestimonies } from '../../hooks/useTestimonies';
import { usePrayerData } from '../../hooks/usePrayerData';
import { usePersistentState } from '../../hooks/usePersistentState';
import ImageHero from '../ui/ImageHero';
import { reactToTestimony } from '../../lib/api';
import { submitReport } from '../../hooks/useReports';

function ReactionButton({ active, count, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-2 text-xs font-semibold transition active:scale-95 ${
        active ? 'border-navy bg-[#e8f0f6] text-navy' : 'border-[#e6ddcf] bg-white text-slate-600'
      }`}
    >
      {label} - {count}
    </button>
  );
}

function TestimonyCard({ testimony, prayers, reactions, onReact, onPrayer, onOpen, user }) {
  const [reported, setReported] = useState(false);
  const relatedPrayer = prayers.find((prayer) => prayer.id === testimony.prayerId);
  const reacted = reactions[testimony.id] || {};
  const praiseGodCount = (testimony.praiseGod || 0) + (reacted.praiseGod ? 1 : 0);
  const amenCount = (testimony.amen || 0) + (reacted.amen ? 1 : 0);

  const handleReport = async (e) => {
    e.stopPropagation();
    if (reported) return;
    try {
      await submitReport(testimony.id, 'testimony', 'Reported by user', user);
      setReported(true);
    } catch {}
  };

  return (
    <Card className="p-4">
      <button onClick={() => onOpen?.(testimony)} className="w-full text-left">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-gold">Praise Report</div>
          <h3 className="mt-1 font-serif text-2xl leading-tight text-navy">{testimony.title}</h3>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e8f0f6] text-navy">
          <Sparkles size={20} />
        </div>
      </div>
      <p className="mt-2 text-xs text-slate-500">{testimony.name} - {testimony.time}</p>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{testimony.text}</p>
      <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-navy">
        Read full testimony
        <ChevronRight size={14} />
      </div>
      </button>

      {relatedPrayer && (
        <button
          onClick={() => onPrayer?.(relatedPrayer)}
          className="mt-4 flex w-full items-center justify-between rounded-2xl border border-[#e6ddcf] bg-sand p-3 text-left transition active:scale-[0.98]"
        >
          <span className="min-w-0">
            <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gold">
              <CheckCircle2 size={14} />
              Answered prayer
            </span>
            <span className="mt-1 block truncate text-sm font-semibold text-slate-900">{relatedPrayer.title}</span>
          </span>
          <ChevronRight size={18} className="shrink-0 text-slate-400" />
        </button>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <ReactionButton
          active={reacted.praiseGod}
          count={praiseGodCount}
          label="Praise God"
          onClick={() => onReact(testimony.id, 'praiseGod')}
        />
        <ReactionButton
          active={reacted.amen}
          count={amenCount}
          label="Amen"
          onClick={() => onReact(testimony.id, 'amen')}
        />
        <button
          onClick={handleReport}
          disabled={reported}
          className={`ml-auto rounded-full border px-2 py-2 text-xs transition ${reported ? 'border-slate-200 bg-slate-100 text-slate-400' : 'border-slate-200 bg-white text-slate-400 hover:text-red-500'}`}
          aria-label="Report testimony"
        >
          <Flag size={13} fill={reported ? 'currentColor' : 'none'} />
        </button>
      </div>
    </Card>
  );
}

export default function Praise({ activeTab, onNavigate, onGo, user }) {
  const [reactions, setReactions] = usePersistentState('praise:reactions', {});
  const { testimonies } = useTestimonies();
  const { prayers } = usePrayerData();
  const [searchQuery, setSearchQuery] = useState('');
  const filteredTestimonies = testimonies.filter((testimony) =>
    [testimony.title, testimony.text, testimony.name].some((value) =>
      value?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
  const featured = filteredTestimonies[0] || testimonies[0];

  const react = async (id, key) => {
    const alreadyReacted = Boolean(reactions[id]?.[key]);

    setReactions((current) => ({
      ...current,
      [id]: {
        ...current[id],
        [key]: !current[id]?.[key],
      },
    }));

    if (alreadyReacted) return;

    try {
      await reactToTestimony(id, key);
    } catch (error) {
      setReactions((current) => ({
        ...current,
        [id]: {
          ...current[id],
          [key]: false,
        },
      }));
    }
  };

  const openPrayer = (prayer) => {
    onGo?.('detail', { request: { ...prayer, answered: true } });
  };

  const openTestimony = (testimony) => {
    onGo?.('praiseDetail', { testimony });
  };

  return (
    <div className="cinematic-bg cinematic-texture relative flex h-full flex-col overflow-hidden text-ivory">
      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 pb-4">
        <div className="-mx-5">
          <ImageHero scene="answered" eyebrow="Praise" title="Answered prayers, remembered" subtitle="Celebrate light breaking through ordinary days." />
        </div>
        <div className="-mt-8 flex items-center justify-end">
          <button
            onClick={() => onGo?.('createTestimony')}
            className="cinematic-button relative z-20 flex h-12 w-12 items-center justify-center rounded-full text-ink shadow-glow transition active:scale-95"
            aria-label="Create testimony"
          >
            <Plus size={21} />
          </button>
        </div>

        {featured && (
          <div className="glass-panel mt-5 rounded-[28px] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-candle">Featured Testimony</p>
                <h2 className="mt-2 font-serif text-2xl leading-tight text-ivory">{featured.title}</h2>
                <p className="mt-2 text-sm leading-6 text-ivory/68">{featured.text}</p>
              </div>
              <Heart size={24} className="shrink-0 text-candle" />
            </div>
          </div>
        )}

        <input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="mt-4 w-full rounded-2xl border border-ivory/15 bg-ivory/10 px-4 py-3 text-sm text-ivory outline-none placeholder:text-ivory/45 focus:border-candle"
          placeholder="Search praise reports..."
        />

        <div className="mt-6 flex items-center justify-between">
          <h2 className="font-serif text-xl text-ivory">Recent Praise</h2>
          <span className="flex items-center gap-1 text-xs font-semibold text-ivory/55">
            <MessageCircle size={14} />
            {testimonies.length}
          </span>
        </div>
        <div className="mt-3 space-y-3">
          {filteredTestimonies.map((testimony) => (
            <TestimonyCard
              key={testimony.id}
              testimony={testimony}
              prayers={prayers}
              reactions={reactions}
              onReact={react}
              onPrayer={openPrayer}
              onOpen={openTestimony}
              user={user}
            />
          ))}
        </div>
      </div>
      <BottomNav active={activeTab} onNavigate={onNavigate} />
    </div>
  );
}
