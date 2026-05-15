import { Bell, Search, Flame, Heart, ChevronRight } from 'lucide-react';
import PrayingHandsIcon from '../PrayingHandsIcon';
import BottomNav from '../BottomNav';
import PrayerCard from '../ui/PrayerCard';
import { usePrayers } from '../../hooks/usePrayers';
import ImageHero from '../ui/ImageHero';
import GlassCard from '../ui/GlassCard';

export default function HomeScreen({ onNavigate, onGo, activeTab }) {
  const { prayers, loading } = usePrayers();

  return (
    <div className="cinematic-bg cinematic-texture relative flex h-full flex-col overflow-hidden text-ivory">
      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto pb-4">
      <ImageHero
        scene="dawn"
        eyebrow="PrayerStride"
        title="Begin in quiet light"
        subtitle="A daily walk in prayer, presence, and hope."
        action={(
          <div className="flex gap-3">
            <button onClick={() => onGo('notifications')} className="flex h-11 w-11 items-center justify-center rounded-full bg-ivory/14 text-ivory backdrop-blur"><Bell size={20} /></button>
            <button onClick={() => onGo('discover')} className="flex h-11 w-11 items-center justify-center rounded-full bg-ivory/14 text-ivory backdrop-blur"><Search size={20} /></button>
          </div>
        )}
      />
      <div className="-mt-5 px-4">
        <GlassCard className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-candle">Today's Prayer Mission</p>
              <h2 className="mt-2 font-serif text-2xl text-ivory">Pray for peace in our home</h2>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-candle text-ink shadow-glow">
              <PrayingHandsIcon size={25} />
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-ivory/72">A family has asked for prayer during a difficult season. Take two quiet minutes and lift them up.</p>
          <button onClick={() => prayers.length > 0 && onGo("detail", { request: prayers[0] })} className="cinematic-button mt-5 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 font-semibold text-ink transition active:scale-[0.98]">
            Pray Now <ChevronRight size={18} />
          </button>
        </GlassCard>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <GlassCard><Flame className="text-candle" /><div className="mt-2 text-2xl font-serif text-ivory">7 days</div><p className="text-xs text-ivory/58">walking with God</p></GlassCard>
          <GlassCard><Heart className="text-candle" /><div className="mt-2 text-2xl font-serif text-ivory">2</div><p className="text-xs text-ivory/58">answered prayers this week</p></GlassCard>
        </div>
        <div className="mt-6 flex items-center justify-between">
          <h3 className="font-serif text-xl text-ivory">Prayer Requests</h3>
          <button onClick={() => onGo("discover")} className="text-xs font-semibold text-candle">
            View all
          </button>
        </div>
        <div className="mt-3 space-y-3">
          {prayers.map((p) => (
            <PrayerCard key={p.id} prayer={p} onPress={() => onGo("detail", { request: p })} />
          ))}
        </div>
      </div>
      </div>
      <BottomNav active={activeTab} onNavigate={onNavigate} />
    </div>
  );
}
