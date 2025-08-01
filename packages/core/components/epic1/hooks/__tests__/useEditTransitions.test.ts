/**
 * Tests for useEditTransitions hook
 */

import { renderHook, act } from '@testing-library/react-hooks';
import { useEditTransitions, useWeightedOptionTransitions } from '../useEditTransitions';

// Mock timers
jest.useFakeTimers();

describe('useEditTransitions', () => {
  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('edit mode transitions', () => {
    it('triggers entering edit animation when isEditing becomes true', () => {
      const { result, rerender } = renderHook(
        ({ isEditing }) => useEditTransitions({ isEditing }),
        { initialProps: { isEditing: false } }
      );

      expect(result.current.transitionState.isEnteringEdit).toBe(false);
      expect(result.current.animationClasses).toBe('');

      // Enter edit mode
      rerender({ isEditing: true });

      expect(result.current.transitionState.isEnteringEdit).toBe(true);
      expect(result.current.animationClasses).toContain('epic1-entering-edit');

      // Animation should clear after timeout
      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current.transitionState.isEnteringEdit).toBe(false);
      expect(result.current.animationClasses).toBe('');
    });

    it('triggers exiting edit animation when isEditing becomes false', () => {
      const { result, rerender } = renderHook(
        ({ isEditing }) => useEditTransitions({ isEditing }),
        { initialProps: { isEditing: true } }
      );

      // Exit edit mode
      rerender({ isEditing: false });

      expect(result.current.transitionState.isExitingEdit).toBe(true);
      expect(result.current.animationClasses).toContain('epic1-exiting-edit');

      // Animation should clear after timeout
      act(() => {
        jest.advanceTimersByTime(250);
      });

      expect(result.current.transitionState.isExitingEdit).toBe(false);
      expect(result.current.animationClasses).toBe('');
    });
  });

  describe('focus transitions', () => {
    it('adds tab focus class when focused', () => {
      const { result, rerender } = renderHook(
        ({ isFocused }) => useEditTransitions({ isEditing: false, isFocused }),
        { initialProps: { isFocused: false } }
      );

      rerender({ isFocused: true });

      expect(result.current.transitionState.hasTabFocus).toBe(true);
      expect(result.current.animationClasses).toContain('epic1-tab-focus');
    });

    it('adds tab blur class when losing focus', () => {
      const { result, rerender } = renderHook(
        ({ isFocused }) => useEditTransitions({ isEditing: false, isFocused }),
        { initialProps: { isFocused: true } }
      );

      rerender({ isFocused: false });

      expect(result.current.transitionState.hasTabFocus).toBe(false);
      expect(result.current.animationClasses).toContain('epic1-tab-blur');
    });
  });

  describe('value confirmation animations', () => {
    it('triggers value confirmed animation', () => {
      const { result } = renderHook(() => 
        useEditTransitions({ isEditing: false })
      );

      act(() => {
        result.current.triggerValueConfirmed();
      });

      expect(result.current.transitionState.isValueConfirmed).toBe(true);
      expect(result.current.animationClasses).toContain('epic1-value-confirmed');

      // Animation should clear after timeout
      act(() => {
        jest.advanceTimersByTime(400);
      });

      expect(result.current.transitionState.isValueConfirmed).toBe(false);
    });

    it('triggers value cancelled animation', () => {
      const { result } = renderHook(() => 
        useEditTransitions({ isEditing: false })
      );

      act(() => {
        result.current.triggerValueCancelled();
      });

      expect(result.current.transitionState.isValueCancelled).toBe(true);
      expect(result.current.animationClasses).toContain('epic1-value-cancelled');

      // Animation should clear after timeout
      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current.transitionState.isValueCancelled).toBe(false);
    });
  });

  describe('error state', () => {
    it('adds error class when hasError is true', () => {
      const { result } = renderHook(() => 
        useEditTransitions({ isEditing: false, hasError: true })
      );

      expect(result.current.transitionState.hasError).toBe(true);
      expect(result.current.animationClasses).toContain('epic1-input-error');
    });
  });

  describe('animation cleanup', () => {
    it('clears timeouts on unmount', () => {
      const { result, unmount } = renderHook(() => 
        useEditTransitions({ isEditing: false })
      );

      act(() => {
        result.current.triggerValueConfirmed();
      });

      unmount();

      // Should not throw or cause memory leaks
      act(() => {
        jest.advanceTimersByTime(1000);
      });
    });
  });
});

describe('useWeightedOptionTransitions', () => {
  it('animates option addition', () => {
    const { result } = renderHook(() => useWeightedOptionTransitions());

    act(() => {
      result.current.animateOptionAdd(0);
    });

    expect(result.current.getOptionClass(0, false)).toBe('epic1-weighted-option-entering');

    // Animation should clear after timeout
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current.getOptionClass(0, false)).toBe('');
  });

  it('animates option removal with callback', () => {
    const { result } = renderHook(() => useWeightedOptionTransitions());
    const onComplete = jest.fn();

    act(() => {
      result.current.animateOptionRemove(1, onComplete);
    });

    expect(result.current.getOptionClass(1, true)).toBe('epic1-weighted-option-exiting');
    expect(onComplete).not.toHaveBeenCalled();

    // Callback should fire after animation
    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(onComplete).toHaveBeenCalled();
    expect(result.current.getOptionClass(1, true)).toBe('');
  });

  it('handles multiple animations simultaneously', () => {
    const { result } = renderHook(() => useWeightedOptionTransitions());

    act(() => {
      result.current.animateOptionAdd(0);
      result.current.animateOptionAdd(1);
      result.current.animateOptionAdd(2);
    });

    expect(result.current.getOptionClass(0, false)).toBe('epic1-weighted-option-entering');
    expect(result.current.getOptionClass(1, false)).toBe('epic1-weighted-option-entering');
    expect(result.current.getOptionClass(2, false)).toBe('epic1-weighted-option-entering');

    // Clear first animation
    act(() => {
      jest.advanceTimersByTime(150);
    });

    // Add another while others are still animating
    act(() => {
      result.current.animateOptionAdd(3);
    });

    expect(result.current.getOptionClass(3, false)).toBe('epic1-weighted-option-entering');

    // Clear all animations
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current.getOptionClass(0, false)).toBe('');
    expect(result.current.getOptionClass(1, false)).toBe('');
    expect(result.current.getOptionClass(2, false)).toBe('');
    expect(result.current.getOptionClass(3, false)).toBe('');
  });
});