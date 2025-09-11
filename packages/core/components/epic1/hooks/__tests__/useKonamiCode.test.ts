import { renderHook, act } from '@testing-library/react';
import { useKonamiCode } from '../useKonamiCode';

describe('useKonamiCode', () => {
  beforeEach(() => {
    // Clear any existing event listeners
    document.removeEventListener('keydown', jest.fn());
  });

  it('should initialize with inactive state', () => {
    const { result } = renderHook(() => useKonamiCode());

    expect(result.current.isActive).toBe(false);
    expect(result.current.progress).toBe(0);
    expect(result.current.total).toBe(10); // Default Konami code length
  });

  it('should activate when correct sequence is entered', () => {
    const onActivate = jest.fn();
    const { result } = renderHook(() => useKonamiCode({ onActivate }));

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

    act(() => {
      konamiSequence.forEach(code => {
        const event = new KeyboardEvent('keydown', { code });
        document.dispatchEvent(event);
      });
    });

    expect(onActivate).toHaveBeenCalledTimes(1);
    expect(result.current.isActive).toBe(true);
  });

  it('should reset sequence on wrong key', () => {
    const { result } = renderHook(() => useKonamiCode({ debug: false }));

    act(() => {
      // Start with correct sequence
      document.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowUp' }));
      document.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowUp' }));
      // Wrong key
      document.dispatchEvent(
        new KeyboardEvent('keydown', { code: 'ArrowLeft' })
      );
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
      const event = new KeyboardEvent('keydown', {
        code: 'ArrowUp',
        target: input as any
      });
      document.dispatchEvent(event);
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

    expect(result.current.total).toBe(3);

    act(() => {
      customCode.forEach(code => {
        document.dispatchEvent(new KeyboardEvent('keydown', { code }));
      });
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
});
