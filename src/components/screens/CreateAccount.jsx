import { useState } from 'react';
import { ArrowLeft, User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import TopLogo from '../TopLogo';

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
    <div className="flex h-full flex-col overflow-y-auto bg-sand px-6 pb-8">
      <button onClick={onBack} className="mt-3 w-fit text-navy">
        <ArrowLeft size={22} />
      </button>
      <div className="mt-4 text-center">
        <TopLogo small />
      </div>
      <h1 className="mt-6 font-serif text-3xl leading-tight text-navy">Create Account</h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">Join a community of believers walking in prayer.</p>
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
      <div className="mt-5 space-y-3">
        <div className="flex items-center gap-3 rounded-2xl border border-[#e6ddcf] bg-white/80 px-4 py-3">
          <User size={18} className="text-slate-400" />
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Display name" className="w-full bg-transparent text-sm outline-none" />
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-[#e6ddcf] bg-white/80 px-4 py-3">
          <Mail size={18} className="text-slate-400" />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full bg-transparent text-sm outline-none" />
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-[#e6ddcf] bg-white/80 px-4 py-3">
          <Lock size={18} className="text-slate-400" />
          <input type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full bg-transparent text-sm outline-none" />
          <button onClick={() => setShowPass((s) => !s)} className="text-slate-400">{showPass ? <EyeOff size={18} /> : <Eye size={18} />}</button>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-[#e6ddcf] bg-white/80 px-4 py-3">
          <Lock size={18} className="text-slate-400" />
          <input type={showPass ? 'text' : 'password'} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm password" className="w-full bg-transparent text-sm outline-none" />
        </div>
      </div>
      <button onClick={submit} className="mt-auto rounded-2xl bg-navy py-4 font-semibold text-white transition hover:bg-[#0a3358]">
        Create Account
      </button>
      <p className="mt-4 text-center text-[11px] leading-5 text-slate-500">
        By creating an account, you agree to our <button className="font-semibold text-navy">Terms of Use</button> and <button className="font-semibold text-navy">Privacy Policy</button>.
      </p>
    </div>
  );
}
