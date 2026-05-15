import { useState } from 'react';
import { ArrowLeft, Camera, Save, X } from 'lucide-react';
import AppScreen from '../ui/AppScreen';
import AppHeader from '../ui/AppHeader';
import { usePersistentState } from '../../hooks/usePersistentState';
import { storage } from '../../lib/firebase';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

export default function EditProfile({ onBack, activeTab, onNavigate, user, setUser }) {
  const [profile, setProfile] = usePersistentState(`profile:${user?.id || 'guest'}`, {
    name: user?.name || '',
    handle: user?.handle || '',
    bio: '',
  });
  const [name, setName] = useState(profile.name || user?.name || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [handle, setHandle] = useState(profile.handle || user?.handle || '');
  const [previewAvatar, setPreviewAvatar] = useState(user?.photoURL || profile.photoURL || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/') || file.size > 2 * 1024 * 1024) {
      setError('Choose an image under 2 MB.');
      return;
    }
    setError('');
    setAvatarFile(file);
    setPreviewAvatar(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setBusy(true);
    setError('');
    try {
      let photoURL = user?.photoURL || profile.photoURL || null;
      if (avatarFile && user?.id) {
        const extension = avatarFile.name.split('.').pop() || 'jpg';
        const avatarRef = ref(storage, `avatars/${user.id}/profile.${extension}`);
        await uploadBytes(avatarRef, avatarFile, { contentType: avatarFile.type });
        photoURL = await getDownloadURL(avatarRef);
      }
      const nextProfile = { name: name.trim(), handle: handle.trim(), bio: bio.trim(), photoURL };
      if (setUser) {
        await setUser(nextProfile);
      }
      setProfile(nextProfile);
      onBack();
    } catch {
      setError('We could not update your profile. Please try again.');
    } finally {
      setBusy(false);
    }
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
        {error && <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

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
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-navy py-4 font-semibold text-white transition active:scale-[0.98] disabled:opacity-60"
          >
            <Save size={18} />
            {busy ? 'Saving...' : 'Save Changes'}
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
