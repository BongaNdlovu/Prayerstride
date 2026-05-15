import { renderHook, act } from '@testing-library/react';
import { usePersistentState } from './usePersistentState';

describe('usePersistentState', () => {
  beforeEach(() => {
    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      clear: vi.fn(),
    };
    global.localStorage = localStorageMock;
    vi.clearAllMocks();
  });

  it('should initialize with default value when no stored value exists', () => {
    global.localStorage.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => usePersistentState('test-key', 'default'));
    
    expect(result.current[0]).toBe('default');
    expect(global.localStorage.getItem).toHaveBeenCalledWith('test-key');
  });

  it('should load stored value from localStorage', () => {
    global.localStorage.getItem.mockReturnValue(JSON.stringify('stored-value'));
    
    const { result } = renderHook(() => usePersistentState('test-key', 'default'));
    
    expect(result.current[0]).toBe('stored-value');
  });

  it('should parse JSON stored values', () => {
    const storedObject = { name: 'test', count: 42 };
    global.localStorage.getItem.mockReturnValue(JSON.stringify(storedObject));
    
    const { result } = renderHook(() => usePersistentState('test-key', {}));
    
    expect(result.current[0]).toEqual(storedObject);
  });

  it('should handle JSON parse errors gracefully', () => {
    global.localStorage.getItem.mockReturnValue('invalid-json');
    
    const { result } = renderHook(() => usePersistentState('test-key', 'default'));
    
    expect(result.current[0]).toBe('default');
  });

  it('should update state and localStorage on setValue', () => {
    global.localStorage.getItem.mockReturnValue(null);
    global.localStorage.setItem.mockImplementation(() => {});
    
    const { result } = renderHook(() => usePersistentState('test-key', 'default'));
    
    act(() => {
      result.current[1]('new-value');
    });
    
    expect(result.current[0]).toBe('new-value');
    expect(global.localStorage.setItem).toHaveBeenCalledWith('test-key', JSON.stringify('new-value'));
  });

  it('should handle localStorage setItem errors gracefully', () => {
    global.localStorage.getItem.mockReturnValue(null);
    global.localStorage.setItem.mockImplementation(() => {
      throw new Error('Storage quota exceeded');
    });
    
    const { result } = renderHook(() => usePersistentState('test-key', 'default'));
    
    act(() => {
      result.current[1]('new-value');
    });
    
    // Should not throw, state should still update
    expect(result.current[0]).toBe('new-value');
  });

  it('should work with complex objects', () => {
    const complexObject = { nested: { data: [1, 2, 3] } };
    global.localStorage.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => usePersistentState('test-key', {}));
    
    act(() => {
      result.current[1](complexObject);
    });
    
    expect(result.current[0]).toEqual(complexObject);
    expect(global.localStorage.setItem).toHaveBeenCalledWith('test-key', JSON.stringify(complexObject));
  });

  it('should work with arrays', () => {
    const array = [1, 2, 3, 4, 5];
    global.localStorage.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => usePersistentState('test-key', []));
    
    act(() => {
      result.current[1](array);
    });
    
    expect(result.current[0]).toEqual(array);
  });

  it('should work with boolean values', () => {
    global.localStorage.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => usePersistentState('test-key', false));
    
    act(() => {
      result.current[1](true);
    });
    
    expect(result.current[0]).toBe(true);
    expect(global.localStorage.setItem).toHaveBeenCalledWith('test-key', JSON.stringify(true));
  });
});
