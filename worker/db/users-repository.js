import { utcNowIso } from './time.js';

function parseMetadataJson(value) {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function rowToProfile(row) {
  if (!row) return null;
  const metadata = parseMetadataJson(row.metadata_json);
  return {
    id: row.uid,
    uid: row.uid,
    email: row.email ?? null,
    displayName: row.display_name ?? null,
    handle: row.handle ?? null,
    bio: row.bio ?? null,
    photoURL: row.photo_url ?? null,
    role: row.role || 'user',
    owner: row.owner === 1,
    suspended: row.suspended === 1,
    suspendedReason: metadata.suspendedReason ?? null,
    registrationState: row.registration_state ?? null,
    communityAccess: row.community_access ?? null,
    dateOfBirth: row.date_of_birth ?? null,
    ageBand: row.age_band ?? null,
    guardianEmail: row.guardian_email ?? null,
    isSeventhDayAdventist: row.is_seventh_day_adventist === 1 ? true : row.is_seventh_day_adventist === 0 ? false : null,
    churchName: row.church_name ?? null,
    termsAcceptedAt: row.terms_accepted_at ?? null,
    termsVersion: row.terms_version ?? null,
    privacyVersion: row.privacy_version ?? null,
    avatarPublic: row.avatar_public !== 0,
    deletedAt: row.deleted_at ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function moderationMetadata(data = {}) {
  const metadata = {};
  if (data.suspendedReason) {
    metadata.suspendedReason = String(data.suspendedReason).slice(0, 240);
  }
  return Object.keys(metadata).length ? JSON.stringify(metadata) : null;
}

export function profileFromFirestore(uid, data = {}) {
  const now = utcNowIso();
  return {
    uid,
    email: data.email ?? null,
    display_name: data.displayName ?? null,
    handle: data.handle ?? null,
    bio: data.bio ?? null,
    photo_url: data.photoURL ?? null,
    role: data.role || 'user',
    owner: data.owner === true ? 1 : 0,
    suspended: data.suspended === true ? 1 : 0,
    registration_state: data.registrationState ?? null,
    community_access: data.communityAccess ?? null,
    date_of_birth: data.dateOfBirth ?? null,
    age_band: data.ageBand ?? null,
    guardian_email: data.guardianEmail ?? null,
    is_seventh_day_adventist: data.isSeventhDayAdventist === true ? 1 : data.isSeventhDayAdventist === false ? 0 : null,
    church_name: data.churchName ?? null,
    terms_accepted_at: data.termsAcceptedAt ?? null,
    terms_version: data.termsVersion ?? null,
    privacy_version: data.privacyVersion ?? null,
    avatar_public: data.avatarPublic === false ? 0 : 1,
    deleted_at: data.deletedAt ?? null,
    created_at: data.createdAt || now,
    updated_at: data.updatedAt || now,
    metadata_json: moderationMetadata(data),
  };
}

export async function getUserByUid(env, uid) {
  if (!env.DB) return null;
  const row = await env.DB.prepare('SELECT * FROM users WHERE uid = ?').bind(uid).first();
  return rowToProfile(row);
}

export async function upsertUser(env, record) {
  if (!env.DB) return;
  const now = utcNowIso();
  const createdAt = record.created_at || now;
  const updatedAt = record.updated_at || now;
  await env.DB.prepare(
    `INSERT INTO users (
      uid, email, display_name, handle, bio, photo_url, role, owner, suspended,
      registration_state, community_access, date_of_birth, age_band, guardian_email,
      is_seventh_day_adventist, church_name, terms_accepted_at, terms_version, privacy_version,
      avatar_public, deleted_at, created_at, updated_at, metadata_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(uid) DO UPDATE SET
      email = excluded.email,
      display_name = excluded.display_name,
      handle = excluded.handle,
      bio = excluded.bio,
      photo_url = excluded.photo_url,
      role = excluded.role,
      owner = excluded.owner,
      suspended = excluded.suspended,
      registration_state = excluded.registration_state,
      community_access = excluded.community_access,
      date_of_birth = excluded.date_of_birth,
      age_band = excluded.age_band,
      guardian_email = excluded.guardian_email,
      is_seventh_day_adventist = excluded.is_seventh_day_adventist,
      church_name = excluded.church_name,
      terms_accepted_at = excluded.terms_accepted_at,
      terms_version = excluded.terms_version,
      privacy_version = excluded.privacy_version,
      avatar_public = excluded.avatar_public,
      deleted_at = excluded.deleted_at,
      updated_at = excluded.updated_at,
      metadata_json = excluded.metadata_json`,
  ).bind(
    record.uid,
    record.email ?? null,
    record.display_name ?? null,
    record.handle ?? null,
    record.bio ?? null,
    record.photo_url ?? null,
    record.role || 'user',
    record.owner ?? 0,
    record.suspended ?? 0,
    record.registration_state ?? null,
    record.community_access ?? null,
    record.date_of_birth ?? null,
    record.age_band ?? null,
    record.guardian_email ?? null,
    record.is_seventh_day_adventist ?? null,
    record.church_name ?? null,
    record.terms_accepted_at ?? null,
    record.terms_version ?? null,
    record.privacy_version ?? null,
    record.avatar_public ?? 1,
    record.deleted_at ?? null,
    createdAt,
    updatedAt,
    record.metadata_json ?? null,
  ).run();
}

export async function updateUserProfileFields(env, uid, fields) {
  const existing = await getUserByUid(env, uid);
  if (!existing && !fields.firestoreFallback) {
    return null;
  }
  const base = existing
    ? profileFromFirestore(uid, existing)
    : profileFromFirestore(uid, fields.firestoreFallback || {});
  const next = {
    ...base,
    display_name: fields.displayName !== undefined ? fields.displayName : base.display_name,
    handle: fields.handle !== undefined ? fields.handle : base.handle,
    bio: fields.bio !== undefined ? fields.bio : base.bio,
    photo_url: fields.photoURL !== undefined ? fields.photoURL : base.photo_url,
    updated_at: utcNowIso(),
  };
  await upsertUser(env, next);
  return getUserByUid(env, uid);
}

export function canServePublicAvatar(profile) {
  if (!profile) return false;
  if (profile.deletedAt) return false;
  if (profile.suspended) return false;
  if (profile.avatarPublic === false) return false;
  return Boolean(profile.photoURL);
}
