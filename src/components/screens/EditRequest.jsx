import { useState } from 'react';
import { ArrowLeft, Trash2, AlertTriangle } from 'lucide-react';
import ToggleRow from '../ui/ToggleRow';
import Card from '../ui/Card';
import SceneImage from '../ui/SceneImage';
import { deletePrayer, updatePrayer } from '../../hooks/usePrayers';

export default function EditRequest({ onBack, request }) {
  const [title, setTitle] = useState(request?.title || '');
  const [text, setText] = useState(request?.text || '');
  const [privacy, setPrivacy] = useState(request?.privacy || 'community');
  const [urgency, setUrgency] = useState(request?.urgent ?? request?.urgency ?? false);
  const [allowShare, setAllowShare] = useState(request?.allowShare !== false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    if (!request?.id) {
      setError('This request could not be found.');
      return;
    }
    if (!title.trim() || !text.trim()) {
      setError('Add a title and prayer request before saving.');
      return;
    }

    setBusy(true);
    setError('');
    try {
      await updatePrayer(request.id, {
        title: title.trim(),
        body: text.trim(),
        isAnonymous: Boolean(request?.isAnonymous ?? request?.anonymous),
        privacy,
        urgent: urgency,
        allowShare,
      });
      onBack();
    } catch {
      setError('We could not save this request. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!request?.id) {
      setError('This request could not be found.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await deletePrayer(request.id);
      setDeleted(true);
    } catch {
      setError('We could not delete this request. Please try again.');
      setShowDelete(false);
    } finally {
      setBusy(false);
    }
  };

  if (deleted) {
    return (
      <div className="cinematic-bg relative flex h-full flex-col items-center justify-center overflow-y-auto px-6 text-center text-ivory">
        <SceneImage scene="texture" className="absolute inset-0 opacity-70" />
        <div className="absolute inset-0 bg-ink/66" />
        <h2 className="relative z-10 font-serif text-2xl text-ivory">Request deleted</h2>
        <p className="relative z-10 mt-2 text-sm text-ivory/68">Your prayer request has been removed.</p>
        <button onClick={onBack} className="cinematic-button relative z-10 mt-6 rounded-2xl px-6 py-3 font-semibold text-ink">Back</button>
      </div>
    );
  }

  return (
    <div className="cinematic-bg relative flex h-full flex-col overflow-y-auto px-5 pb-8 text-ivory">
      <SceneImage scene="dawn" className="absolute inset-0 opacity-70" />
      <div className="absolute inset-0 bg-ink/62" />
      <div className="relative z-10 mt-4 flex items-center justify-between">
        <button onClick={onBack} className="text-ivory/70"><ArrowLeft size={22} /></button>
        <h1 className="font-semibold text-ivory">Edit Request</h1>
        <button disabled={busy} onClick={save} className="text-sm font-semibold text-candle disabled:opacity-50">{busy ? 'Saving' : 'Save'}</button>
      </div>
      {error && <p className="relative z-10 mt-4 rounded-2xl border border-red-300/30 bg-red-950/35 px-4 py-3 text-sm text-red-100">{error}</p>}
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        className="relative z-10 mt-6 w-full rounded-2xl border border-ivory/15 bg-ivory/10 p-4 text-sm text-ivory outline-none placeholder:text-ivory/45 focus:border-candle"
      />
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="relative z-10 mt-4 h-40 w-full resize-none rounded-2xl border border-ivory/15 bg-ivory/10 p-4 text-sm text-ivory outline-none focus:border-candle"
      />
      <div className="relative z-10 mt-6 space-y-3">
        <Card className="flex items-center justify-between p-4">
          <div>
            <div className="font-semibold text-slate-900">Privacy</div>
            <div className="text-xs text-slate-500 capitalize">{privacy}</div>
          </div>
          <button onClick={() => setPrivacy((p) => (p === 'community' ? 'private' : 'community'))} className="text-xs font-semibold text-navy">Change</button>
        </Card>
        <ToggleRow title="Urgency" subtitle="Mark as time-sensitive" initial={urgency} onChange={setUrgency} />
        <ToggleRow title="Allow others to share" subtitle="Yes, others can share this request" initial={allowShare} onChange={setAllowShare} />
      </div>
      <button disabled={busy} onClick={() => setShowDelete(true)} className="relative z-10 mt-auto flex items-center justify-center gap-2 rounded-2xl border border-red-200/30 bg-red-500/15 py-4 font-semibold text-red-100 disabled:opacity-60">
        <Trash2 size={18} /> Delete Request
      </button>
      {showDelete && (
        <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pb-8">
          <div className="w-full rounded-3xl bg-sand p-6 text-ink">
            <div className="flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-700"><AlertTriangle size={24} /></div>
            </div>
            <h3 className="mt-4 text-center font-serif text-xl text-navy">Delete this request?</h3>
            <p className="mt-2 text-center text-sm text-slate-600">This action cannot be undone.</p>
            <div className="mt-5 space-y-2">
              <button disabled={busy} onClick={remove} className="w-full rounded-2xl bg-red-700 py-3 font-semibold text-white disabled:opacity-60">{busy ? 'Deleting...' : 'Delete'}</button>
              <button onClick={() => setShowDelete(false)} className="w-full rounded-2xl border py-3 font-semibold text-slate-700">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
