import { X, FileText, Heart, BookOpen } from 'lucide-react';

export default function QuickActions({ onClose, onCreateRequest, onCreateTestimony, onMyPrayers, onInvite }) {
  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/30 px-6 pb-28">
      <div className="w-full space-y-2">
        <div className="space-y-2 rounded-3xl bg-white/95 p-3 shadow-xl backdrop-blur">
          <button onClick={onCreateRequest} className="flex w-full items-center gap-3 rounded-2xl p-3 text-left transition active:bg-sand">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e8f0f6] text-navy"><FileText size={20} /></div>
            <div>
              <div className="font-semibold text-slate-900">Create Request</div>
              <div className="text-xs text-slate-500">Ask for prayer</div>
            </div>
          </button>
          <button onClick={onCreateTestimony} className="flex w-full items-center gap-3 rounded-2xl p-3 text-left transition active:bg-sand">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f3e6d2] text-gold"><Heart size={20} /></div>
            <div>
              <div className="font-semibold text-slate-900">Share Testimony</div>
              <div className="text-xs text-slate-500">Celebrate answered prayer</div>
            </div>
          </button>
          <button onClick={onMyPrayers} className="flex w-full items-center gap-3 rounded-2xl p-3 text-left transition active:bg-sand">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e8f0f6] text-navy"><BookOpen size={20} /></div>
            <div>
              <div className="font-semibold text-slate-900">My Prayers</div>
              <div className="text-xs text-slate-500">Manage your requests</div>
            </div>
          </button>
          <div className="rounded-2xl bg-sand p-3 text-xs leading-5 text-slate-500">
            Invites and following are disabled until the social backend is connected.
          </div>
        </div>
        <button onClick={onClose} className="flex h-12 w-full items-center justify-center rounded-3xl bg-white/95 font-semibold text-slate-700 shadow-xl backdrop-blur">
          <X size={20} />
        </button>
      </div>
    </div>
  );
}
