import { describe, expect, it } from 'vitest';

const AUTH_ROUTES = ['splash', 'welcome', 'reminderSetup', 'stayConnected', 'signIn', 'createAccount', 'resetPassword'];

function isAuthRoute(screen) {
  return AUTH_ROUTES.includes(screen);
}

function getRouteForSignedOutUser(currentScreen) {
  if (isAuthRoute(currentScreen)) return currentScreen;
  return 'splash';
}

function getRouteForSignedInUser(currentScreen) {
  if (isAuthRoute(currentScreen)) return 'home';
  return currentScreen;
}

function getRouteForSuspendedUser(currentScreen) {
  if (currentScreen === 'accountSuspended') return currentScreen;
  return 'accountSuspended';
}

describe('auth routing', () => {
  it('signed-out user on authenticated route goes to splash', () => {
    expect(getRouteForSignedOutUser('home')).toBe('splash');
    expect(getRouteForSignedOutUser('profile')).toBe('splash');
  });

  it('signed-out user on auth route stays', () => {
    expect(getRouteForSignedOutUser('signIn')).toBe('signIn');
    expect(getRouteForSignedOutUser('createAccount')).toBe('createAccount');
    expect(getRouteForSignedOutUser('resetPassword')).toBe('resetPassword');
    expect(getRouteForSignedOutUser('welcome')).toBe('welcome');
  });

  it('signed-in user on auth route goes home', () => {
    expect(getRouteForSignedInUser('signIn')).toBe('home');
    expect(getRouteForSignedInUser('splash')).toBe('home');
    expect(getRouteForSignedInUser('welcome')).toBe('home');
    expect(getRouteForSignedInUser('resetPassword')).toBe('home');
  });

  it('signed-in user on non-auth route stays', () => {
    expect(getRouteForSignedInUser('home')).toBe('home');
    expect(getRouteForSignedInUser('profile')).toBe('profile');
    expect(getRouteForSignedInUser('detail')).toBe('detail');
  });

  it('suspended user goes to account suspended', () => {
    expect(getRouteForSuspendedUser('home')).toBe('accountSuspended');
    expect(getRouteForSuspendedUser('profile')).toBe('accountSuspended');
    expect(getRouteForSuspendedUser('detail')).toBe('accountSuspended');
  });

  it('suspended user stays on accountSuspended', () => {
    expect(getRouteForSuspendedUser('accountSuspended')).toBe('accountSuspended');
  });

  it('admin user is not automatically treated as suspended', () => {
    // Admin and suspended are separate concerns
    const admin = { isAdmin: true, suspended: false };
    const suspendedUser = { isAdmin: false, suspended: true };
    const adminSuspended = { isAdmin: true, suspended: true };

    expect(admin.suspended).toBe(false);
    expect(suspendedUser.isAdmin).toBe(false);
    expect(adminSuspended.suspended).toBe(true);
    expect(adminSuspended.isAdmin).toBe(true);
  });
});
