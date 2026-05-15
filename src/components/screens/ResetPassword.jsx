import { useState } from 'react';
import { ArrowLeft, Mail, Send } from 'lucide-react';
import TopLogo from '../TopLogo';

export default function ResetPassword({ onBack, onSend }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const submit = () => {
    if (!email.trim()) {
      setError('Please enter your email.');
      return;
    }
    setError('');
    setSent(true);
    onSend?.();
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-sand px-6 pb-8">
      <button onClick={onBack} className="mt-3 w-fit text-navy">
        <ArrowLeft size={22} />
      </button>
      <div className="mt-6 text-center">
        <TopLogo small />
      </div>
      <h1 className="mt-8 font-serif text-3xl leading-tight text-navy">Reset Password</h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">Enter your email and we will send you a link to reset your password.</p>
      {sent ? (
        <div className="mt-8 rounded-2xl border border-[#e6ddcf] bg-white/80 p-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#e8f0f6] text-navy">
            <Send size={24} />
          </div>
          <p className="mt-4 font-semibold text-navy">Check your inbox</p>
          <p className="mt-1 text-sm text-slate-600">If an account exists, you will receive a reset link shortly.</p>
        </div>
      ) : (
        <>
          {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
          <div className="mt-6">
            <div className="flex items-center gap-3 rounded-2xl border border-[#e6ddcf] bg-white/80 px-4 py-3">
              <Mail size={18} className="text-slate-400" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full bg-transparent text-sm outline-none" />
            </div>
          </div>
          <button onClick={submit} className="mt-6 w-full rounded-2xl bg-navy py-4 font-semibold text-white transition hover:bg-[#0a3358]">
            Send reset link
          </button>
        </>
      )}
      <button onClick={onBack} className="mt-4 text-center text-sm font-semibold text-slate-500">
        Back to sign in
      </button>
    </div>
  );
}
