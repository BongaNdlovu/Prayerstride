import { runDualWrite } from './db/dual-write.js';
import {
  getUserByUid,
  profileFromFirestore,
  upsertUser,
} from './db/users-repository.js';
import { utcNowIso } from './db/time.js';

const BIO_MAX = 150;
const HANDLE_MAX = 40;

export function avatarUrlForUid(env, request, uid) {
  const base = String(env.API_PUBLIC_URL || '').replace(/\/$/, '')
    || new URL(request.url).origin;
  return `${base}/avatars/${encodeURIComponent(uid)}/profile.jpg`;
}

function normalizeHandle(value) {
  const trimmed = value != null ? String(value).trim() : '';
  if (!trimmed) return null;
  const handle = trimmed.startsWith('@') ? trimmed : `@${trimmed}`;
  return handle.slice(0, HANDLE_MAX);
}

export function serializeProfile(profile) {
  if (!profile) return null;
  return {
    id: profile.id || profile.uid,
    uid: profile.uid || profile.id,
    email: profile.email ?? null,
    displayName: profile.displayName ?? null,
    handle: profile.handle ?? null,
    bio: profile.bio ?? null,
    photoURL: profile.photoURL ?? null,
    role: profile.role || 'user',
    owner: profile.owner === true,
    suspended: profile.suspended === true,
    suspendedReason: profile.suspendedReason ?? null,
    registrationState: profile.registrationState ?? null,
    communityAccess: profile.communityAccess ?? null,
    dateOfBirth: profile.dateOfBirth ?? null,
    ageBand: profile.ageBand ?? null,
    guardianEmail: profile.guardianEmail ?? null,
    isSeventhDayAdventist: profile.isSeventhDayAdventist ?? null,
    churchName: profile.churchName ?? null,
    termsAcceptedAt: profile.termsAcceptedAt ?? null,
    termsVersion: profile.termsVersion ?? null,
    privacyVersion: profile.privacyVersion ?? null,
    avatarPublic: profile.avatarPublic !== false,
    createdAt: profile.createdAt ?? null,
    updatedAt: profile.updatedAt ?? null,
  };
}

export async function hydrateUserFromFirestore(env, uid, firestoreApi) {
  const userDoc = await firestoreApi.getDocument(env, firestoreApi.docName(env, 'users', uid));
  if (!userDoc.exists) return null;
  const data = firestoreApi.fromFirestoreFields(userDoc.fields);
  const record = profileFromFirestore(uid, {
    ...data,
    email: data.email ?? null,
    createdAt: data.createdAt || utcNowIso(),
    updatedAt: data.updatedAt || utcNowIso(),
  });
  await upsertUser(env, record);
  return getUserByUid(env, uid);
}

function overlayProfileFromFirestore(profile, firestoreData) {
  if (!firestoreData) return profile;
  return {
    ...profile,
    role: firestoreData.role || profile.role,
    owner: firestoreData.owner === true,
    suspended: firestoreData.suspended === true,
    suspendedReason: firestoreData.suspendedReason ?? profile.suspendedReason ?? null,
    registrationState: firestoreData.registrationState ?? profile.registrationState,
    communityAccess: firestoreData.communityAccess ?? profile.communityAccess,
  };
}

export async function getMyProfile(env, user, firestoreApi) {
  const userDoc = await firestoreApi.getDocument(env, firestoreApi.docName(env, 'users', user.uid));
  const firestoreData = userDoc.exists
    ? firestoreApi.fromFirestoreFields(userDoc.fields)
    : null;

  let profile = await getUserByUid(env, user.uid);
  if (!profile && firestoreData) {
    profile = await hydrateUserFromFirestore(env, user.uid, firestoreApi);
  } else if (profile && firestoreData) {
    profile = overlayProfileFromFirestore(profile, firestoreData);
  }

  if (!profile) {
    return { status: 404, body: { error: 'User profile not found.' } };
  }
  return { status: 200, body: { profile: serializeProfile(profile) } };
}

export async function updateMyProfile(env, user, body, firestoreApi) {
  const displayName = body.displayName != null ? String(body.displayName).trim() : undefined;
  if (displayName !== undefined && !displayName) {
    return { status: 400, body: { error: 'Display name is required.' } };
  }

  let handle;
  if (body.handle !== undefined) {
    handle = normalizeHandle(body.handle);
  }

  let bio;
  if (body.bio !== undefined) {
    const trimmed = String(body.bio).trim();
    bio = trimmed ? trimmed.slice(0, BIO_MAX) : null;
  }

  const userDoc = await firestoreApi.getDocument(env, firestoreApi.docName(env, 'users', user.uid));
  if (!userDoc.exists) {
    return { status: 404, body: { error: 'User profile not found.' } };
  }

  const existing = firestoreApi.fromFirestoreFields(userDoc.fields);
  const now = utcNowIso();
  const nextFirestore = {
    ...existing,
    ...(displayName !== undefined ? { displayName } : {}),
    ...(handle !== undefined ? { handle } : {}),
    ...(bio !== undefined ? { bio } : {}),
    ...(body.photoURL !== undefined ? { photoURL: body.photoURL || null } : {}),
    updatedAt: now,
  };

  const photoURL = body.photoURL !== undefined
    ? (body.photoURL || null)
    : (existing.photoURL || null);

  await runDualWrite(
    env,
    {
      feature: 'profile',
      entityType: 'users',
      entityId: user.uid,
      operation: 'update-profile',
    },
    async () => {
      await firestoreApi.firestoreCommit(env, [{
        update: {
          name: userDoc.name,
          fields: firestoreApi.toFirestoreFields(nextFirestore),
        },
      }]);
    },
    async () => {
      const current = await getUserByUid(env, user.uid)
        || await hydrateUserFromFirestore(env, user.uid, firestoreApi);
      const record = profileFromFirestore(user.uid, {
        ...(current || existing),
        displayName: displayName !== undefined ? displayName : (current?.displayName ?? existing.displayName),
        handle: handle !== undefined ? handle : (current?.handle ?? existing.handle),
        bio: bio !== undefined ? bio : (current?.bio ?? existing.bio),
        photoURL: body.photoURL !== undefined ? photoURL : (current?.photoURL ?? existing.photoURL),
        email: existing.email ?? user.email ?? null,
        updatedAt: now,
        createdAt: current?.createdAt || existing.createdAt || now,
      });
      await upsertUser(env, record);
    },
  );

  let profile = await getUserByUid(env, user.uid);
  if (!profile) {
    profile = await hydrateUserFromFirestore(env, user.uid, firestoreApi);
  }

  return {
    status: 200,
    body: { profile: serializeProfile(profile) },
  };
}

export async function updateMyProfilePhoto(env, user, photoURL, firestoreApi) {
  return updateMyProfile(env, user, { photoURL }, firestoreApi);
}
