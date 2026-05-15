import { useState } from 'react';
import { ArrowLeft, Camera, Save, X } from 'lucide-react';
import AppScreen from '../ui/AppScreen';
import AppHeader from '../ui/AppHeader';
import { usePersistentState } from '../../hooks/usePersistentState';

export default function EditProfile({ onBack, activeTab, onNavigate, user, setUser }) {
  const [profile, setProfile] = usePersistentState(`profile:${user?.id || 'guest'}`, {
    name: user?.name || '',
    handle: user?.handle || '',
    bio: '',
  });
  const [name, setName] = useState(profile.name || user?.name || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [handle, setHandle] = useState(profile.handle || user?.handle || '');
  const [avatar, setAvatar] = usePersistentState(`profile:${user?.id || 'guest'}:avatar`, '');
  const [previewAvatar, setPreviewAvatar] = useState(avatar);

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewAvatar(reader.result);
      setAvatar(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    const nextProfile = { name: name.trim(), handle: handle.trim(), bio: bio.trim(), photoURL: previewAvatar || null };
    setProfile(nextProfile);
    if (setUser) {
      try {
        await setUser(nextProfile);
      } catch (err) {
        console.error('Failed to update profile:', err);
      }
    }
    onBack();
  };

  return (
    <AppScreen activeTab={activeTab} onNavigate={onNavigate}>
      <AppHeader title="Edit Profile" onBack={onBack} />
      <div className="mt-4 px-5 space-y-6">
        <div className="flex flex-col items-center">
          <label className="relative cursor-pointer">
            {previewAvatar ? (
              <img src={previewAvatar} alt="" className="h-24 w-24 rounded-full object-cover" />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#ded3c4] text-navy">
                <Camera size={32} />
              </div>
            )}
            <span className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-navy text-white shadow-sm">
              <Camera size={16} />
            </span>
            <input type="file" accept="image/*" onChange={handleAvatarChange} className="sr-only" />
          </label>
          <p className="mt-3 text-xs text-slate-500">Tap to change photo</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Display Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-2xl border border-[#e6ddcf] bg-white px-4 py-3 text-sm outline-none focus:border-navy"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Username</label>
            <div className="flex items-center rounded-2xl border border-[#e6ddcf] bg-white px-4 py-3">
              <span className="text-slate-400">@</span>
              <input
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                className="flex-1 ml-1 text-sm outline-none focus:border-navy"
                placeholder="username"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full rounded-2xl border border-[#e6ddcf] bg-white px-4 py-3 text-sm outline-none focus:border-navy resize-none"
              rows={3}
              placeholder="Tell us about yourself..."
              maxLength={150}
            />
            <p className="mt-1 text-right text-xs text-slate-400">{bio.length}/150</p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleSave}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-navy py-4 font-semibold text-white transition active:scale-[0.98]"
          >
            <Save size={18} />
            Save Changes
          </button>
          <button
            onClick={onBack}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#e6ddcf] bg-white/75 py-4 font-semibold text-slate-700 transition active:scale-[0.98]"
          >
            <X size={18} />
            Cancel
          </button>
        </div>
      </div>
    </AppScreen>
  );
}
