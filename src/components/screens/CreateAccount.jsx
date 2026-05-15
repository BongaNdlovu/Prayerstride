import { useState } from 'react';
import { ArrowLeft, User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import TopLogo from '../TopLogo';
import SceneImage from '../ui/SceneImage';

export default function CreateAccount({ onBack, onCreate }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  const submit = () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    const result = onCreate?.({ name: name.trim(), email: email.trim(), password });
    if (result?.error) {
      setError(result.error);
      return;
    }
    setError('');
  };

  return (
    <div className="cinematic-bg relative flex h-full flex-col overflow-y-auto px-6 pb-8 text-ivory">
      <SceneImage scene="community" className="absolute inset-0 opacity-75" />
      <div className="absolute inset-0 bg-ink/64" />
      <button onClick={onBack} className="relative z-10 mt-3 w-fit text-ivory">
        <ArrowLeft size={22} />
      </button>
      <div className="relative z-10 mt-4 text-center">
        <TopLogo small />
      </div>
      <h1 className="relative z-10 mt-6 font-serif text-3xl leading-tight text-ivory">Create Account</h1>
      <p className="relative z-10 mt-2 text-sm leading-6 text-ivory/70">Join a community of believers walking in prayer.</p>
      {error && <p className="relative z-10 mt-3 rounded-2xl border border-red-300/30 bg-red-950/35 px-4 py-3 text-sm text-red-100">{error}</p>}
      <div className="relative z-10 mt-5 space-y-3">
        <div className="flex items-center gap-3 rounded-2xl border border-ivory/15 bg-ivory/10 px-4 py-3 backdrop-blur">
          <User size={18} className="text-candle" />
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Display name" className="w-full bg-transparent text-sm text-ivory outline-none placeholder:text-ivory/45" />
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-ivory/15 bg-ivory/10 px-4 py-3 backdrop-blur">
          <Mail size={18} className="text-candle" />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full bg-transparent text-sm text-ivory outline-none placeholder:text-ivory/45" />
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-ivory/15 bg-ivory/10 px-4 py-3 backdrop-blur">
          <Lock size={18} className="text-candle" />
          <input type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full bg-transparent text-sm text-ivory outline-none placeholder:text-ivory/45" />
          <button onClick={() => setShowPass((s) => !s)} className="text-ivory/55">{showPass ? <EyeOff size={18} /> : <Eye size={18} />}</button>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-ivory/15 bg-ivory/10 px-4 py-3 backdrop-blur">
          <Lock size={18} className="text-candle" />
          <input type={showPass ? 'text' : 'password'} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm password" className="w-full bg-transparent text-sm text-ivory outline-none placeholder:text-ivory/45" />
        </div>
      </div>
      <button onClick={submit} className="cinematic-button relative z-10 mt-auto rounded-2xl py-4 font-semibold text-ink transition active:scale-[0.98]">
        Create Account
      </button>
      <p className="relative z-10 mt-4 text-center text-[11px] leading-5 text-ivory/58">
        By creating an account, you agree to our <button className="font-semibold text-candle">Terms of Use</button> and <button className="font-semibold text-candle">Privacy Policy</button>.
      </p>
    </div>
  );
}
