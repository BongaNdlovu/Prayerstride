import { Lock, ArrowLeft } from 'lucide-react';

export default function AccountSuspended({ onAppeal, onSignIn }) {
  return (
    <div className="flex h-full flex-col items-center justify-center overflow-y-auto bg-sand px-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-700">
        <Lock size={36} />
      </div>
      <h1 className="mt-6 font-serif text-3xl text-navy">Account Suspended</h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">This account has been suspended for violating PrayerStride&apos;s community guidelines. If you believe this is a mistake, you can appeal our decision.</p>
      <button onClick={onAppeal} className="mt-8 w-full rounded-2xl bg-navy py-4 font-semibold text-white transition hover:bg-[#0a3358]">
        Appeal Decision
      </button>
      <button onClick={onSignIn} className="mt-3 text-sm font-semibold text-slate-500">
        Back to Sign In
      </button>
    </div>
  );
}
