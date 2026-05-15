import { MessageCircle, Send, MoreHorizontal, Edit2, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import AsyncState from './AsyncState';
import {
  addEncouragement,
  deleteEncouragement,
  updateEncouragement,
  useEncouragements,
} from '../../hooks/useEncouragements';

export default function EncouragementThread({ threadId, currentUser }) {
  const [draft, setDraft] = useState('');
  const { comments, loading, error, retry } = useEncouragements(threadId);
  const [submitError, setSubmitError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [showMenu, setShowMenu] = useState(null);

  const post = async () => {
    if (!draft.trim()) return;
    setSubmitError(null);
    try {
      await addEncouragement(threadId, draft, {
        uid: currentUser?.uid || currentUser?.id,
        displayName: currentUser?.name,
        email: currentUser?.email,
      });
      setDraft('');
    } catch (err) {
      setSubmitError(err);
    }
  };

  const isOwnComment = (comment) => {
    return comment.authorUid === currentUser?.uid || comment.authorUid === currentUser?.id;
  };

  const startEdit = (comment) => {
    setEditingId(comment.id);
    setEditText(comment.text);
    setShowMenu(null);
  };

  const saveEdit = async () => {
    if (!editText.trim()) return;
    setSubmitError(null);
    try {
      await updateEncouragement(editingId, editText);
      setEditingId(null);
      setEditText('');
    } catch (err) {
      setSubmitError(err);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const deleteComment = async (commentId) => {
    setSubmitError(null);
    try {
      await deleteEncouragement(commentId);
      setShowMenu(null);
    } catch (err) {
      setSubmitError(err);
    }
  };

  return (
    <section className="mt-5">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-xl text-navy">Encouragements</h3>
        <span className="flex items-center gap-1 text-xs font-semibold text-slate-500">
          <MessageCircle size={14} />
          {comments.length}
        </span>
      </div>

      <div className="mt-3 flex gap-2">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') post();
          }}
          className="min-w-0 flex-1 rounded-2xl border border-[#e6ddcf] bg-sand px-4 py-3 text-sm outline-none focus:border-navy"
          placeholder="Write encouragement..."
        />
        <button onClick={post} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-navy text-white transition active:scale-95">
          <Send size={18} />
        </button>
      </div>
      {submitError && (
        <p className="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
          {submitError.message || 'Could not save that encouragement. Please try again.'}
        </p>
      )}

      <AsyncState loading={loading} error={error} empty={comments.length === 0} emptyTitle="No encouragements yet" emptySubtitle="Be the first to leave a kind word." onRetry={retry}>
      <div className="mt-3 space-y-3">
        {comments.map((comment) => (
          <div key={comment.id} className="rounded-2xl bg-sand p-3 relative">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-xs font-semibold text-slate-700">{comment.authorName || 'PrayerStride member'}</div>
                {editingId === comment.id ? (
                  <div className="mt-2">
                    <input
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full rounded-xl border border-[#e6ddcf] bg-white px-3 py-2 text-sm outline-none focus:border-navy"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit();
                        if (e.key === 'Escape') cancelEdit();
                      }}
                      autoFocus
                    />
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={saveEdit}
                        className="rounded-lg bg-navy px-3 py-1 text-xs font-semibold text-white transition active:scale-95"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="rounded-lg border border-[#e6ddcf] bg-white px-3 py-1 text-xs font-semibold text-slate-600 transition active:scale-95"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-1 text-sm leading-5 text-slate-600">{comment.text}</p>
                )}
              </div>
              {isOwnComment(comment) && (
                <div className="relative ml-2">
                  <button
                    onClick={() => setShowMenu(showMenu === comment.id ? null : comment.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-200 transition"
                  >
                    <MoreHorizontal size={16} className="text-slate-500" />
                  </button>
                  {showMenu === comment.id && (
                    <div className="absolute right-0 top-8 z-10 rounded-xl border border-[#e6ddcf] bg-white shadow-lg py-1 min-w-[120px]">
                      <button
                        onClick={() => startEdit(comment)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                      >
                        <Edit2 size={14} />
                        Edit
                      </button>
                      <button
                        onClick={() => deleteComment(comment.id)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      </AsyncState>
    </section>
  );
}
