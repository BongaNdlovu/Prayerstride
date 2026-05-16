import { useState } from 'react';
import { ArrowLeft, MoreHorizontal, Users, Send, CheckCircle2, Bookmark, Timer, Sparkles, Flag } from 'lucide-react';
import BottomNav from '../BottomNav';
import { usePersistentState } from '../../hooks/usePersistentState';
import { usePrayerData } from '../../hooks/usePrayerData';
import EncouragementThread from '../ui/EncouragementThread';
import SceneImage from '../ui/SceneImage';
import GlassCard from '../ui/GlassCard';
import { prayForRequest } from '../../lib/api';
import { submitReport as submitFirestoreReport } from '../../hooks/useReports';

export default function Detail({ request, user, onBack, onGo, activeTab, onNavigate }) {
  const prayer = request;
  const prayerKey = prayer?.id || prayer?.title || 'missing';
  const [prayed, setPrayed] = usePersistentState(`prayer:${prayerKey}:prayed`, false);
  const [bookmarked, setBookmarked] = usePersistentState(`prayer:${prayerKey}:bookmarked`, false);
  const [answered, setAnswered] = usePersistentState(`prayer:${prayerKey}:answered`, prayer?.answered || false);
  const { markAnswered } = usePrayerData(user);
  const [showAnswerMenu, setShowAnswerMenu] = useState(false);
  const [showReportMenu, setShowReportMenu] = useState(false);
  const [reported, setReported] = useState(false);
  const [error, setError] = useState(null);
  const prayedCount = (prayer?.count || 0) + (prayed ? 1 : 0);
  const isOwnPrayer = Boolean(
    (prayer?.authorUid && user?.uid && prayer.authorUid === user.uid)
    || (prayer?.userId && user?.id && prayer.userId === user.id)
    || prayer?.userId === 'me'
  );

  const handleMarkAnswered = async () => {
    if (!isOwnPrayer) return;
    setError(null);
    try {
      await markAnswered(prayer.id || prayer.title);
      setAnswered(true);
    } catch (err) {
      setError(err);
    }
    setShowAnswerMenu(false);
  };

  const handleCreateTestimony = () => {
    if (!isOwnPrayer) return;
    onGo?.('createTestimony', { prayerId: prayer.id, prayerTitle: prayer.title });
    setShowAnswerMenu(false);
  };

  const handlePray = async () => {
    setError(null);
    setPrayed(true);
    if (!prayer.id) return;

    try {
      await prayForRequest(prayer.id);
    } catch (error) {
      setPrayed(false);
      setError(error);
    }
  };

  const submitReport = async () => {
    setError(null);
    try {
      await submitFirestoreReport(prayer.id, 'prayer', 'User report', { uid: user?.uid || user?.id });
      setReported(true);
    } catch (err) {
      setError(err);
    }
    setShowReportMenu(false);
  };

  if (!prayer) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-sand px-6 text-center text-navy">
        <p className="font-serif text-2xl">Prayer not found</p>
        <p className="mt-2 text-sm text-slate-600">This request may have been removed or is still loading.</p>
        <button onClick={onBack} className="mt-5 rounded-2xl bg-navy px-5 py-3 text-sm font-semibold text-white">Go back</button>
      </div>
    );
  }

  return (
    <div className="cinematic-bg cinematic-texture relative flex h-full flex-col overflow-hidden text-ivory">
      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto pb-4">
      <div className="relative min-h-[260px] overflow-hidden rounded-b-[34px]">
        <SceneImage scene={answered ? 'answered' : 'chapel'} className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/20 via-ink/30 to-ink/90" />
      <div className="relative z-10 px-5 pb-8 pt-4">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="text-ivory">
            <ArrowLeft size={22} />
          </button>
          <div className="relative">
            <button onClick={() => setShowReportMenu(!showReportMenu)} className="text-ivory">
              <MoreHorizontal size={23} />
            </button>
            {showReportMenu && (
              <div className="absolute right-0 top-8 z-10 rounded-xl border border-[#e6ddcf] bg-white shadow-lg py-1 min-w-[140px]">
                <button
                  onClick={submitReport}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition"
                >
                  <Flag size={14} />
                  {reported ? 'Reported' : 'Report'}
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="mt-14">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-candle">Prayer Request</p>
          <h1 className="mt-2 font-serif text-3xl leading-tight text-ivory">{prayer.title}</h1>
        </div>
      </div>
      </div>
      <div className="-mt-6 px-5">
        <GlassCard className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-[#ded3c4]" />
            <div>
              <div className="font-semibold text-ivory">{prayer.name || 'You'}</div>
              <div className="text-xs text-ivory/55">Prayer Request - {prayer.time || 'just now'}</div>
            </div>
          </div>
          <p className="mt-4 text-[15px] leading-7 text-ivory/72">{prayer.text || 'Please pray over this request and stand with them today.'}</p>
          <div className="mt-5 flex items-center justify-between border-y border-ivory/12 py-3 text-sm text-ivory/58">
            <span className="flex items-center gap-2">
              <Users size={17} /> {prayedCount} praying
            </span>
            {answered && (
              <span className="flex items-center gap-2 text-candle">
                <CheckCircle2 size={16} /> Answered
              </span>
            )}
            <span className="flex items-center gap-2">
              <Send size={16} /> Share
            </span>
          </div>
          {prayed && (
            <div className="mt-4 rounded-2xl bg-ivory/12 p-4 text-ivory">
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle2 size={22} /> You prayed for this request
              </div>
              <p className="mt-1 text-xs">Thank you for standing with {prayer.name || 'them'} today.</p>
            </div>
          )}
          {error && (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
              <div className="font-semibold">That did not save yet</div>
              <p className="mt-1 text-xs">{error.message || 'Please check your connection and try again.'}</p>
            </div>
          )}
          {answered && (
            <div className="mt-4 rounded-2xl bg-candle/16 p-4 text-ivory">
              <div className="flex items-center gap-2 font-semibold">
                <Sparkles size={22} className="text-candle" /> This prayer has been answered!
              </div>
              {isOwnPrayer ? (
                <button
                  onClick={handleCreateTestimony}
                  className="cinematic-button mt-2 rounded-xl px-4 py-2 text-xs font-semibold text-ink transition active:scale-95"
                >
                  Share Your Testimony
                </button>
              ) : (
                <p className="mt-1 text-xs text-ivory/68">Celebrate with them and keep encouraging the community.</p>
              )}
            </div>
          )}
          <EncouragementThread threadId={prayer.id || prayer.title} currentUser={user} />
        </GlassCard>
      </div>
      </div>
      <div className="shrink-0 border-t border-ivory/10 bg-ink/86 px-5 py-3 backdrop-blur-xl">
      <div className="flex gap-3">
        <button onClick={() => onGo?.('prayerStopwatch', { request: prayer })} className="flex h-14 w-14 items-center justify-center rounded-2xl border border-ivory/12 bg-ivory/10 text-ivory transition active:scale-95">
          <Timer size={20} />
        </button>
        <button onClick={handlePray} className="cinematic-button flex-1 rounded-2xl px-5 py-4 font-semibold text-ink transition active:scale-[0.98]">
          {prayed ? "Pray Again" : "I'll Pray"}
        </button>
        <button onClick={() => setBookmarked((current) => !current)} className={`w-14 rounded-2xl border border-ivory/12 transition active:scale-95 ${bookmarked ? 'bg-candle/18 text-candle' : 'bg-ivory/10 text-ivory'}`}>
          <Bookmark className="mx-auto" size={20} fill={bookmarked ? 'currentColor' : 'none'} />
        </button>
        {!answered && isOwnPrayer && (
          <button
            onClick={() => setShowAnswerMenu(!showAnswerMenu)}
            className="flex h-14 w-14 items-center justify-center rounded-2xl border border-ivory/12 bg-ivory/10 text-ivory transition active:scale-95"
          >
            <Sparkles size={20} className="text-candle" />
          </button>
        )}
      </div>
      {showAnswerMenu && (
        <div className="mt-3 rounded-2xl border border-[#e6ddcf] bg-white/95 p-4 shadow-lg">
          <p className="text-sm font-semibold text-navy">Mark as Answered</p>
          <p className="mt-1 text-xs text-slate-600">Has this prayer been answered? You can mark it and share your testimony.</p>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              onClick={handleMarkAnswered}
              className="cinematic-button rounded-xl px-4 py-2.5 text-xs font-semibold text-ink transition active:scale-95"
            >
              Mark Answered
            </button>
            <button
              onClick={handleCreateTestimony}
              className="rounded-xl border border-[#e6ddcf] bg-sand px-4 py-2.5 text-xs font-semibold text-navy transition active:scale-95"
            >
              Create Testimony
            </button>
          </div>
        </div>
      )}
      </div>
      <BottomNav active={activeTab} onNavigate={onNavigate} />
    </div>
  );
}
