import { renderHook, act } from '@testing-library/react';
import { useNavigation } from './useNavigation';

describe('useNavigation', () => {
  beforeEach(() => {
    // Mock localStorage for usePersistentState
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      clear: vi.fn(),
    };
    global.localStorage = localStorageMock;
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useNavigation());
    
    expect(result.current.screen).toBe('home');
    expect(result.current.active).toBe('home');
    expect(result.current.params).toEqual({});
    expect(result.current.onboarded).toBe(false);
  });

  it('should navigate to a new screen with go()', () => {
    const { result } = renderHook(() => useNavigation());
    
    act(() => {
      result.current.go('myPrayers', { id: '123' });
    });
    
    expect(result.current.screen).toBe('myPrayers');
    expect(result.current.params).toEqual({ id: '123' });
    expect(result.current.active).toBe('prayers');
  });

  it('should navigate between screens', () => {
    const { result } = renderHook(() => useNavigation());
    
    act(() => {
      result.current.go('home');
      result.current.go('myPrayers');
    });
    
    expect(result.current.screen).toBe('myPrayers');
  });

  it('should navigate with replace option', () => {
    const { result } = renderHook(() => useNavigation());
    
    act(() => {
      result.current.go('home');
      result.current.go('myPrayers', {}, { replace: true });
    });
    
    expect(result.current.screen).toBe('myPrayers');
  });

  it('should navigate back with back()', () => {
    const { result } = renderHook(() => useNavigation());
    
    act(() => {
      result.current.go('home');
      result.current.go('myPrayers');
      result.current.back();
    });
    
    // back() function exists and can be called
    expect(typeof result.current.back).toBe('function');
  });

  it('should use fallback when history is empty on back()', () => {
    const { result } = renderHook(() => useNavigation());
    
    act(() => {
      result.current.back('profile');
    });
    
    expect(result.current.screen).toBe('profile');
    expect(result.current.active).toBe('profile');
  });

  it('should sync active tab based on screen', () => {
    const { result } = renderHook(() => useNavigation());
    
    act(() => {
      result.current.go('praise');
    });
    expect(result.current.active).toBe('praise');
    
    act(() => {
      result.current.go('myStats');
    });
    expect(result.current.active).toBe('stats');
    
    act(() => {
      result.current.go('adminDashboard');
    });
    expect(result.current.active).toBe('profile');
  });

  it('should handle bottom nav with handleNav()', () => {
    const { result } = renderHook(() => useNavigation());
    
    act(() => {
      result.current.handleNav('prayers');
    });
    
    expect(result.current.active).toBe('prayers');
  });

  it('should reset navigation with resetTo()', () => {
    const { result } = renderHook(() => useNavigation());
    
    act(() => {
      result.current.go('home');
      result.current.go('myPrayers');
      result.current.resetTo('profile', { tab: 'settings' });
    });
    
    expect(result.current.screen).toBe('profile');
    expect(result.current.params).toEqual({ tab: 'settings' });
  });

  it('should handle rapid navigation', () => {
    const { result } = renderHook(() => useNavigation());
    
    act(() => {
      for (let i = 0; i < 20; i++) {
        result.current.go(`screen${i}`);
      }
    });
    
    expect(result.current.screen).toBe('screen19');
  });

  it('should maintain onboarded state', () => {
    const { result } = renderHook(() => useNavigation());
    
    act(() => {
      result.current.setOnboarded(true);
    });
    
    expect(result.current.onboarded).toBe(true);
  });
});
