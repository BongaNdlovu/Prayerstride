import { useState } from 'react';
import { ArrowLeft, Trash2, AlertTriangle } from 'lucide-react';
import ToggleRow from '../ui/ToggleRow';
import Card from '../ui/Card';
import SceneImage from '../ui/SceneImage';

export default function EditRequest({ onBack, request }) {
  const [text, setText] = useState(request?.text || '');
  const [privacy, setPrivacy] = useState(request?.privacy || 'community');
  const [urgency, setUrgency] = useState(request?.urgency || false);
  const [allowShare, setAllowShare] = useState(request?.allowShare !== false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleted, setDeleted] = useState(false);

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
        <button className="text-sm font-semibold text-candle">Save</button>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="relative z-10 mt-6 h-40 w-full resize-none rounded-2xl border border-ivory/15 bg-ivory/10 p-4 text-sm text-ivory outline-none focus:border-candle"
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
      <button onClick={() => setShowDelete(true)} className="relative z-10 mt-auto flex items-center justify-center gap-2 rounded-2xl border border-red-200/30 bg-red-500/15 py-4 font-semibold text-red-100">
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
              <button onClick={() => setDeleted(true)} className="w-full rounded-2xl bg-red-700 py-3 font-semibold text-white">Delete</button>
              <button onClick={() => setShowDelete(false)} className="w-full rounded-2xl border py-3 font-semibold text-slate-700">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
