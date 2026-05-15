import { useState } from 'react';
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import TopLogo from '../TopLogo';
import SceneImage from '../ui/SceneImage';

export default function SignIn({ onBack, onSignIn, onForgot, onGoSignUp }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  const submit = () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }
    const result = onSignIn?.({ email: email.trim(), password });
    if (result?.error) {
      setError(result.error);
      return;
    }
    setError('');
  };

  return (
    <div className="cinematic-bg relative flex h-full flex-col overflow-y-auto px-6 pb-8 text-ivory">
      <SceneImage scene="texture" className="absolute inset-0 opacity-80" />
      <div className="absolute inset-0 bg-ink/58" />
      <button onClick={onBack} className="relative z-10 mt-3 w-fit text-ivory">
        <ArrowLeft size={22} />
      </button>
      <div className="relative z-10 mt-6 text-center">
        <TopLogo small />
      </div>
      <h1 className="relative z-10 mt-8 font-serif text-3xl leading-tight text-ivory">Sign In</h1>
      <p className="relative z-10 mt-2 text-sm leading-6 text-ivory/70">Welcome back to PrayerStride.</p>
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
      <div className="relative z-10 mt-6 space-y-3">
        <div className="flex items-center gap-3 rounded-2xl border border-ivory/15 bg-ivory/10 px-4 py-3 backdrop-blur">
          <Mail size={18} className="text-candle" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full bg-transparent text-sm text-ivory outline-none placeholder:text-ivory/45"
          />
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-ivory/15 bg-ivory/10 px-4 py-3 backdrop-blur">
          <Lock size={18} className="text-candle" />
          <input
            type={showPass ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full bg-transparent text-sm text-ivory outline-none placeholder:text-ivory/45"
          />
          <button onClick={() => setShowPass((s) => !s)} className="text-ivory/55">
            {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>
      <button onClick={onForgot} className="relative z-10 mt-3 text-right text-xs font-semibold text-candle">
        Forgot password?
      </button>
      <button onClick={submit} className="cinematic-button relative z-10 mt-auto rounded-2xl py-4 font-semibold text-ink transition active:scale-[0.98]">
        Sign In
      </button>
      <p className="relative z-10 mt-4 text-center text-xs text-ivory/58">
        Don&apos;t have an account?{' '}
        <button onClick={onGoSignUp} className="font-semibold text-candle">Sign up</button>
      </p>
    </div>
  );
}
