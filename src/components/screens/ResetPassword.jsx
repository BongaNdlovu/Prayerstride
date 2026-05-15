import { useState } from 'react';
import { ArrowLeft, Mail, Send } from 'lucide-react';
import TopLogo from '../TopLogo';
import SceneImage from '../ui/SceneImage';

export default function ResetPassword({ onBack, onSend }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!email.trim()) {
      setError('Please enter your email.');
      return;
    }
    setError('');
    setBusy(true);
    try {
      await onSend?.(email.trim());
      setSent(true);
    } catch {
      setError('We could not send a reset link right now. Please check the email and try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="cinematic-bg relative flex h-full flex-col overflow-y-auto px-6 pb-8 text-ivory">
      <SceneImage scene="bible" className="absolute inset-0 opacity-75" />
      <div className="absolute inset-0 bg-ink/64" />
      <button onClick={onBack} className="relative z-10 mt-3 w-fit text-ivory">
        <ArrowLeft size={22} />
      </button>
      <div className="relative z-10 mt-6 text-center">
        <TopLogo small />
      </div>
      <h1 className="relative z-10 mt-8 font-serif text-3xl leading-tight text-ivory">Reset Password</h1>
      <p className="relative z-10 mt-2 text-sm leading-6 text-ivory/70">Enter your email and we will send you a link to reset your password.</p>
      {sent ? (
        <div className="glass-panel relative z-10 mt-8 rounded-2xl p-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-candle text-ink">
            <Send size={24} />
          </div>
          <p className="mt-4 font-semibold text-ivory">Check your inbox</p>
          <p className="mt-1 text-sm text-ivory/65">If an account exists, you will receive a reset link shortly.</p>
        </div>
      ) : (
        <>
          {error && <p className="relative z-10 mt-3 rounded-2xl border border-red-300/30 bg-red-950/35 px-4 py-3 text-sm text-red-100">{error}</p>}
          <div className="relative z-10 mt-6">
            <div className="flex items-center gap-3 rounded-2xl border border-ivory/15 bg-ivory/10 px-4 py-3 backdrop-blur">
              <Mail size={18} className="text-candle" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full bg-transparent text-sm text-ivory outline-none placeholder:text-ivory/45" />
            </div>
          </div>
          <button disabled={busy} onClick={submit} className="cinematic-button relative z-10 mt-6 w-full rounded-2xl py-4 font-semibold text-ink transition active:scale-[0.98] disabled:opacity-60">
            {busy ? 'Sending...' : 'Send reset link'}
          </button>
        </>
      )}
      <button onClick={onBack} className="relative z-10 mt-4 text-center text-sm font-semibold text-ivory/58">
        Back to sign in
      </button>
    </div>
  );
}
