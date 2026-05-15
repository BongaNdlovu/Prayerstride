import { renderHook, waitFor } from '@testing-library/react';
import { usePrayers, addPrayer, markAnswered, updatePrayer, deletePrayer } from './usePrayers';
import { addDoc, deleteDoc, onSnapshot, updateDoc } from 'firebase/firestore';

const mockAuthState = vi.hoisted(() => ({
  user: { uid: 'test-user', displayName: 'Test User', email: 'test@example.com' },
}));

vi.mock('../contexts/AuthContext.jsx', () => ({
  useAuth: () => mockAuthState,
}));

vi.mock('../lib/firebase', () => ({
  db: {},
}));

describe('usePrayers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    onSnapshot.mockReset();
    onSnapshot.mockReturnValue(vi.fn());
  });

  it('should set loading to true when user exists', () => {
    const { result } = renderHook(() => usePrayers());
    
    expect(result.current.loading).toBe(true);
  });

  it('should map prayer document correctly', () => {
    onSnapshot.mockImplementation((queryRef, next) => {
      next({
        docs: [
          {
            id: 'prayer-1',
            data: () => ({
              title: 'Healing',
              body: 'Please pray for healing.',
              authorUid: 'test-user',
              authorName: 'Test User',
              isAnonymous: false,
              prayedCount: 4,
              status: 'active',
              privacy: 'community',
              urgent: true,
              allowShare: true,
            }),
          },
        ],
      });
      return vi.fn();
    });

    const { result } = renderHook(() => usePrayers());

    expect(result.current.prayers).toEqual([
      expect.objectContaining({
        id: 'prayer-1',
        title: 'Healing',
        text: 'Please pray for healing.',
        body: 'Please pray for healing.',
        userId: 'test-user',
        name: 'Test User',
        count: 4,
        urgent: true,
        urgency: true,
        answered: false,
      }),
    ]);
    expect(result.current.loading).toBe(false);
  });

  it('should set answered status based on status field', async () => {
    onSnapshot.mockImplementation((queryRef, next) => {
      next({
        docs: [
          {
            id: 'answered-prayer',
            data: () => ({
              title: 'Answered',
              body: 'God provided.',
              authorUid: 'test-user',
              authorName: 'Test User',
              status: 'answered',
            }),
          },
        ],
      });
      return vi.fn();
    });

    const { result } = renderHook(() => usePrayers());

    await waitFor(() => {
      expect(result.current.prayers[0].answered).toBe(true);
    });
  });

  it('should handle anonymous prayers', () => {
    onSnapshot.mockImplementation((queryRef, next) => {
      next({
        docs: [
          {
            id: 'anonymous-prayer',
            data: () => ({
              title: 'Private request',
              body: 'Unspoken',
              authorUid: 'test-user',
              authorName: 'Test User',
              isAnonymous: true,
              status: 'active',
            }),
          },
        ],
      });
      return vi.fn();
    });

    const { result } = renderHook(() => usePrayers());

    expect(result.current.prayers[0]).toEqual(
      expect.objectContaining({
        name: 'Anonymous',
        anonymous: true,
        isAnonymous: true,
      }),
    );
  });
});

describe('addPrayer', () => {
  it('should throw error when user is not provided', async () => {
    await expect(addPrayer({}, null)).rejects.toThrow('You must be signed in to create a prayer.');
  });

  it('should call addDoc with correct data structure', async () => {
    const user = { uid: 'test-user', displayName: 'Test User', email: 'test@example.com' };
    const prayerData = {
      title: 'Test Prayer',
      body: 'Test body',
      isAnonymous: false,
      privacy: 'community',
      urgent: true,
    };
    
    addDoc.mockResolvedValue({ id: 'new-prayer-id' });
    
    await addPrayer(prayerData, user);
    
    expect(addDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        title: 'Test Prayer',
        body: 'Test body',
        authorUid: 'test-user',
        authorName: 'Test User',
        isAnonymous: false,
        status: 'active',
        privacy: 'community',
        urgent: true,
      })
    );
  });

  it('should handle both text and body fields', async () => {
    const user = { uid: 'test-user', displayName: 'Test User' };
    const prayerData = { title: 'Test', text: 'Test text' };
    
    addDoc.mockResolvedValue({ id: 'new-id' });
    
    await addPrayer(prayerData, user);
    
    expect(addDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        body: 'Test text',
      })
    );
  });

  it('should handle both urgent and urgency fields', async () => {
    const user = { uid: 'test-user', displayName: 'Test User' };
    const prayerData = { title: 'Test', urgency: true };
    
    addDoc.mockResolvedValue({ id: 'new-id' });
    
    await addPrayer(prayerData, user);
    
    expect(addDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        urgent: true,
      })
    );
  });
});

describe('markAnswered', () => {
  it('should call updateDoc with status answered', async () => {
    updateDoc.mockResolvedValue();
    
    await markAnswered('prayer-123');
    
    expect(updateDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        status: 'answered',
      })
    );
  });
});

describe('updatePrayer', () => {
  it('should throw error when prayerId is missing', async () => {
    await expect(updatePrayer(null, {})).rejects.toThrow('Missing prayer request.');
  });

  it('should call updateDoc with correct data', async () => {
    updateDoc.mockResolvedValue();
    
    await updatePrayer('prayer-123', {
      title: 'Updated Title',
      body: 'Updated body',
      privacy: 'private',
    });
    
    expect(updateDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        title: 'Updated Title',
        body: 'Updated body',
        privacy: 'private',
      })
    );
  });
});

describe('deletePrayer', () => {
  it('should throw error when prayerId is missing', async () => {
    await expect(deletePrayer(null)).rejects.toThrow('Missing prayer request.');
  });

  it('should call deleteDoc with correct reference', async () => {
    deleteDoc.mockResolvedValue();
    
    await deletePrayer('prayer-123');
    
    expect(deleteDoc).toHaveBeenCalledWith(expect.anything());
  });
});
