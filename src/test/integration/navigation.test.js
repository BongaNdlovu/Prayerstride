import { renderHook, act } from '@testing-library/react';
import { useNavigation } from '../../hooks/useNavigation';

describe('Navigation Integration Tests', () => {
  beforeEach(() => {
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      clear: vi.fn(),
    };
    global.localStorage = localStorageMock;
  });

  it('should complete full navigation flow from home to detail and back', () => {
    const { result } = renderHook(() => useNavigation());
    
    // Start at home
    expect(result.current.screen).toBe('home');
    
    // Navigate to prayers tab
    act(() => {
      result.current.handleNav('prayers');
    });
    expect(result.current.active).toBe('prayers');
    
    // Navigate to detail screen
    act(() => {
      result.current.go('detail', { id: 'prayer-123' });
    });
    expect(result.current.screen).toBe('detail');
    expect(result.current.params).toEqual({ id: 'prayer-123' });
    
    // Navigate back - should go to myPrayers (the prayers tab screen)
    act(() => {
      result.current.back();
    });
    expect(result.current.screen).toBe('myPrayers');
  });

  it('should handle navigation between multiple screens', () => {
    const { result } = renderHook(() => useNavigation());
    
    act(() => {
      result.current.go('myPrayers');
      result.current.go('detail', { id: '1' });
      result.current.go('praise');
    });
    
    expect(result.current.screen).toBe('praise');
  });

  it('should reset navigation when using bottom nav', () => {
    const { result } = renderHook(() => useNavigation());
    
    act(() => {
      result.current.go('home');
      result.current.go('myPrayers');
      result.current.go('detail');
    });
    
    act(() => {
      result.current.handleNav('praise');
    });
    
    expect(result.current.screen).toBe('praise');
  });

  it('should handle admin dashboard navigation from profile', () => {
    const { result } = renderHook(() => useNavigation());
    
    act(() => {
      result.current.handleNav('profile');
    });
    expect(result.current.active).toBe('profile');
    
    act(() => {
      result.current.go('adminDashboard');
    });
    expect(result.current.screen).toBe('adminDashboard');
    expect(result.current.active).toBe('profile');
  });

  it('should handle prayer creation flow', () => {
    const { result } = renderHook(() => useNavigation());
    
    act(() => {
      result.current.handleNav('create');
    });
    expect(result.current.screen).toBe('create');
    
    act(() => {
      result.current.go('detail', { request: { id: 'new-prayer' } });
    });
    expect(result.current.screen).toBe('detail');
  });

  it('should handle testimony creation flow', () => {
    const { result } = renderHook(() => useNavigation());
    
    act(() => {
      result.current.go('detail', { request: { id: 'prayer-123', answered: true } });
    });
    expect(result.current.screen).toBe('detail');
    
    act(() => {
      result.current.go('createTestimony', { prayerId: 'prayer-123' });
    });
    expect(result.current.screen).toBe('createTestimony');
    expect(result.current.params).toEqual({ prayerId: 'prayer-123' });
  });

  it('should handle report details navigation', () => {
    const { result } = renderHook(() => useNavigation());
    
    act(() => {
      result.current.handleNav('profile');
    });
    act(() => {
      result.current.go('adminDashboard');
    });
    act(() => {
      result.current.go('reportDetails', { reportId: 'report-123' });
    });
    
    expect(result.current.screen).toBe('reportDetails');
    expect(result.current.active).toBe('profile');
  });

  it('should handle fallback when history is empty', () => {
    const { result } = renderHook(() => useNavigation());
    
    act(() => {
      result.current.back('profile');
    });
    
    expect(result.current.screen).toBe('profile');
  });

  it('should handle rapid navigation', () => {
    const { result } = renderHook(() => useNavigation());
    
    act(() => {
      for (let i = 0; i < 10; i++) {
        result.current.go(`screen-${i}`);
      }
    });
    
    expect(result.current.screen).toBe('screen-9');
  });

  it('should handle resetTo for deep linking', () => {
    const { result } = renderHook(() => useNavigation());
    
    act(() => {
      result.current.go('home');
      result.current.go('myPrayers');
      result.current.go('detail');
    });
    
    act(() => {
      result.current.resetTo('praiseDetail', { testimonyId: 'testimony-123' });
    });
    
    expect(result.current.screen).toBe('praiseDetail');
    expect(result.current.params).toEqual({ testimonyId: 'testimony-123' });
  });
});
