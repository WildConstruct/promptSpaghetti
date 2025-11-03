import { renderHook, act } from '@testing-library/react';
import { useKonamiCode } from '../useKonamiCode';

const triggerKey = (code: string, target?: HTMLElement) => {
  const event = new KeyboardEvent('keydown', { code, bubbles: true });
  if (target) {
    target.dispatchEvent(event);
  } else {
    document.dispatchEvent(event);
  }
};

describe('useKonamiCode', () => {
  const konamiSequence = [
    'ArrowUp',
    'ArrowUp',
    'ArrowDown',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'ArrowLeft',
    'ArrowRight',
    'KeyB',
    'KeyA'
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with inactive state', () => {
    const { result } = renderHook(() => useKonamiCode());

    expect(result.current.isActive).toBe(false);
    expect(result.current.progress).toBe(0);
    expect(result.current.total).toBe(konamiSequence.length);
  });

  it('should activate when correct sequence is entered', () => {
    const onActivate = jest.fn();
    const { result } = renderHook(() => useKonamiCode({ onActivate }));

    act(() => {
      konamiSequence.forEach(code => triggerKey(code));
    });

    expect(onActivate).toHaveBeenCalledTimes(1);
    expect(result.current.isActive).toBe(true);
  });

  it('should reset sequence on wrong key', () => {
    const { result } = renderHook(() => useKonamiCode());

    act(() => {
      triggerKey('ArrowUp');
      triggerKey('ArrowUp');
      triggerKey('ArrowLeft'); // wrong
    });

    expect(result.current.progress).toBe(0);
    expect(result.current.isActive).toBe(false);
  });

  it('should skip when typing in input fields', () => {
    const onActivate = jest.fn();
    renderHook(() => useKonamiCode({ onActivate }));

    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    act(() => {
      triggerKey('ArrowUp', input);
      triggerKey('ArrowUp', input);
    });

    expect(onActivate).not.toHaveBeenCalled();
    document.body.removeChild(input);
  });

  it('should support custom code sequences', () => {
    const onActivate = jest.fn();
    const customCode = ['KeyA', 'KeyB', 'KeyC'];

    const { result } = renderHook(() =>
      useKonamiCode({
        code: customCode,
        onActivate
      })
    );

    expect(result.current.total).toBe(customCode.length);

    act(() => {
      customCode.forEach(code => triggerKey(code));
    });

    expect(onActivate).toHaveBeenCalledTimes(1);
  });

  it('should call deactivate when manually deactivated', () => {
    const onDeactivate = jest.fn();
    const { result } = renderHook(() => useKonamiCode({ onDeactivate }));

    act(() => {
      result.current.activate();
    });

    expect(result.current.isActive).toBe(true);

    act(() => {
      result.current.deactivate();
    });

    expect(result.current.isActive).toBe(false);
    expect(onDeactivate).toHaveBeenCalledTimes(1);
  });

  it('should ignore additional sequences while active until deactivated', () => {
    const onActivate = jest.fn();
    const { result } = renderHook(() => useKonamiCode({ onActivate }));

    act(() => {
      konamiSequence.forEach(code => triggerKey(code));
      konamiSequence.forEach(code => triggerKey(code));
    });

    expect(onActivate).toHaveBeenCalledTimes(1);
    expect(result.current.isActive).toBe(true);

    act(() => {
      result.current.deactivate();
    });

    act(() => {
      konamiSequence.forEach(code => triggerKey(code));
    });

    expect(onActivate).toHaveBeenCalledTimes(2);
  });

  it('should handle overlapping prefix sequences without losing progress', () => {
    const { result } = renderHook(() => useKonamiCode());

    act(() => {
      triggerKey('ArrowUp');
      triggerKey('ArrowUp');
      triggerKey('ArrowUp'); // restart from first key
      triggerKey('ArrowDown');
    });

    expect(result.current.progress).toBe(3);
  });

  it('should clean up event listeners on unmount', () => {
    const onActivate = jest.fn();
    const { unmount } = renderHook(() => useKonamiCode({ onActivate }));

    unmount();

    act(() => {
      konamiSequence.forEach(code => triggerKey(code));
    });

    expect(onActivate).not.toHaveBeenCalled();
  });
});
