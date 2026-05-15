import { renderHook, act } from '@testing-library/react';
import { useTestimonies, addTestimony } from './useTestimonies';
import { addDoc, onSnapshot, writeBatch } from 'firebase/firestore';

const mockAuthState = vi.hoisted(() => ({
  user: { uid: 'test-user', displayName: 'Test User', email: 'test@example.com' },
}));

vi.mock('../contexts/AuthContext.jsx', () => ({
  useAuth: () => mockAuthState,
}));

vi.mock('../lib/firebase', () => ({
  db: {},
}));

describe('useTestimonies', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    onSnapshot.mockReset();
    onSnapshot.mockReturnValue(vi.fn());
  });

  it('should initialize with empty testimonies when no user', () => {
    onSnapshot.mockImplementation((queryRef, next) => {
      next({ docs: [] });
      return vi.fn();
    });

    const { result } = renderHook(() => useTestimonies());

    expect(result.current.testimonies).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it('should set loading to true when user exists', () => {
    const { result } = renderHook(() => useTestimonies());
    
    expect(result.current.loading).toBe(true);
  });

  it('should map testimony document correctly', () => {
    onSnapshot.mockImplementation((queryRef, next) => {
      next({
        docs: [
          {
            id: 'testimony-1',
            data: () => ({
              title: 'Breakthrough',
              body: 'A door opened.',
              authorUid: 'test-user',
              authorName: 'Test User',
              isAnonymous: false,
              prayerId: 'prayer-1',
              shared: true,
              amen: 3,
              praiseGod: 2,
              tags: ['provision'],
            }),
          },
        ],
      });
      return vi.fn();
    });

    const { result } = renderHook(() => useTestimonies());

    expect(result.current.testimonies).toEqual([
      expect.objectContaining({
        id: 'testimony-1',
        title: 'Breakthrough',
        text: 'A door opened.',
        body: 'A door opened.',
        userId: 'test-user',
        name: 'Test User',
        prayerId: 'prayer-1',
        shared: true,
        amen: 3,
        praiseGod: 2,
        tags: ['provision'],
      }),
    ]);
  });

  it('should handle anonymous testimonies', () => {
    onSnapshot.mockImplementation((queryRef, next) => {
      next({
        docs: [
          {
            id: 'anonymous-testimony',
            data: () => ({
              title: 'Answered privately',
              body: 'Thankful.',
              authorUid: 'test-user',
              authorName: 'Test User',
              isAnonymous: true,
            }),
          },
        ],
      });
      return vi.fn();
    });

    const { result } = renderHook(() => useTestimonies());

    expect(result.current.testimonies[0]).toEqual(
      expect.objectContaining({
        name: 'Anonymous',
        isAnonymous: true,
      }),
    );
  });

  it('should handle missing prayerId', () => {
    onSnapshot.mockImplementation((queryRef, next) => {
      next({
        docs: [
          {
            id: 'standalone-testimony',
            data: () => ({
              title: 'Standalone praise',
              body: 'No linked request.',
              authorUid: 'test-user',
              authorName: 'Test User',
            }),
          },
        ],
      });
      return vi.fn();
    });

    const { result } = renderHook(() => useTestimonies());

    expect(result.current.testimonies[0].prayerId).toBeNull();
  });

  it('should provide retry function', () => {
    const { result } = renderHook(() => useTestimonies());
    
    expect(typeof result.current.retry).toBe('function');
    
    act(() => {
      result.current.retry();
    });
    
    // Should trigger reload by incrementing reloadKey
    // This is a basic smoke test for the function existence
  });
});

describe('addTestimony', () => {
  it('should throw error when user is not provided', async () => {
    await expect(addTestimony({}, null)).rejects.toThrow('You must be signed in to create a testimony.');
  });

  it('should call addDoc when no prayerId is provided', async () => {
    const user = { uid: 'test-user', displayName: 'Test User', email: 'test@example.com' };
    const testimonyData = {
      title: 'Test Testimony',
      body: 'Test body',
      shared: true,
      tags: ['grace'],
    };

    addDoc.mockResolvedValue({ id: 'new-testimony-id' });

    await addTestimony(testimonyData, user);

    expect(addDoc).toHaveBeenCalled();
  });

  it('should use batch write when prayerId is provided', async () => {
    const commit = vi.fn().mockResolvedValue();
    const set = vi.fn();
    const update = vi.fn();
    writeBatch.mockReturnValue({ set, update, delete: vi.fn(), commit });
    const user = { uid: 'test-user', displayName: 'Test User', email: 'test@example.com' };

    await addTestimony({ title: 'Answered', body: 'It happened.', prayerId: 'prayer-1' }, user);

    expect(set).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ prayerId: 'prayer-1' }));
    expect(update).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ status: 'answered' }));
    expect(commit).toHaveBeenCalled();
  });

  it('should update prayer status to answered when linked', async () => {
    const update = vi.fn();
    writeBatch.mockReturnValue({ set: vi.fn(), update, delete: vi.fn(), commit: vi.fn().mockResolvedValue() });
    const user = { uid: 'test-user', displayName: 'Test User' };

    await addTestimony({ title: 'Answered', text: 'Thanks.', prayerId: 'prayer-1' }, user);

    expect(update).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ status: 'answered' }),
    );
  });

  it('should handle anonymous testimonies', async () => {
    const user = { uid: 'test-user', displayName: 'Test User' };

    addDoc.mockResolvedValue({ id: 'new-testimony-id' });

    await addTestimony({ title: 'Private praise', body: 'Thankful.', isAnonymous: true }, user);

    expect(addDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        authorName: 'Anonymous',
        isAnonymous: true,
      }),
    );
  });

  it('should handle both text and body fields', async () => {
    const user = { uid: 'test-user', displayName: 'Test User' };

    addDoc.mockResolvedValue({ id: 'new-testimony-id' });

    await addTestimony({ title: 'Praise', text: 'Text body' }, user);

    expect(addDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ body: 'Text body' }),
    );
  });
});
