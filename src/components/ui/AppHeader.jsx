import { ArrowLeft } from 'lucide-react';

export default function AppHeader({ title, onBack, rightAction, className = '' }) {
  return (
    <div className={`flex items-center justify-between px-5 pt-4 ${className}`}>
      <button onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-full border border-ivory/15 bg-ivory/10 text-ivory backdrop-blur transition active:scale-95">
        <ArrowLeft size={20} />
      </button>
      <h1 className="font-serif text-xl text-ivory">{title}</h1>
      <div className="h-9 w-9">
        {rightAction}
      </div>
    </div>
  );
}
