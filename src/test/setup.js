import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

const mockAuthState = vi.hoisted(() => ({
  user: { uid: 'test-user', displayName: 'Test User', email: 'test@example.com' },
}));

afterEach(() => {
  cleanup();
});

// Mock Firebase modules
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => ({ id: 'mock-collection' })),
  doc: vi.fn(() => ({ id: 'mock-doc' })),
  onSnapshot: vi.fn(),
  query: vi.fn(() => ({ id: 'mock-query' })),
  orderBy: vi.fn(() => ({ id: 'mock-query' })),
  where: vi.fn(() => ({ id: 'mock-query' })),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  writeBatch: vi.fn(() => ({
    set: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    commit: vi.fn(),
  })),
  serverTimestamp: vi.fn(() => new Date()),
}));

vi.mock('../lib/firebase', () => ({
  db: {},
}));

vi.mock('../mobile/firebase', () => ({
  app: {},
  auth: {
    currentUser: {
      getIdToken: vi.fn(async () => 'test-token'),
    },
  },
  db: {},
  storage: {},
}));

vi.mock('../contexts/AuthContext.jsx', () => ({
  useAuth: () => mockAuthState,
}));
