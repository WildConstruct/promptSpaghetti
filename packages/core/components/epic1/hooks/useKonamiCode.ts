import { useState, useEffect, useCallback } from 'react';

interface UseKonamiCodeOptions {
  code?: string[];
  onActivate?: () => void;
  onDeactivate?: () => void;
  debug?: boolean;
}

/**
 * Custom hook for detecting Konami code input sequence
 * Default sequence: ↑↑↓↓←→←→BA
 */
export function useKonamiCode({
  code = [
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
  ],
  onActivate,
  onDeactivate,
  debug = false
}: UseKonamiCodeOptions = {}) {
  const [sequence, setSequence] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(false);

  const activate = useCallback(() => {
    setIsActive(true);
    onActivate?.();
    if (debug) {
      console.log('🎮 Konami Code Activated!');
    }
  }, [onActivate, debug]);

  const deactivate = useCallback(() => {
    setIsActive(false);
    onDeactivate?.();
    if (debug) {
      console.log('🎮 Konami Code Deactivated');
    }
  }, [onDeactivate, debug]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip if in input field or already active
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        isActive
      ) {
        return;
      }

      const newSequence = [...sequence, event.code];

      // Debug: Show progress
      if (debug) {
        const progress = code
          .slice(0, newSequence.length)
          .every((c, i) => c === newSequence[i]);
        if (
          progress &&
          newSequence.length > 0 &&
          newSequence.length <= code.length
        ) {
          console.log(`Konami progress: ${newSequence.length}/${code.length}`);
        }
      }

      // Check if sequence matches
      if (newSequence.length >= code.length) {
        const lastSequence = newSequence.slice(-code.length);
        if (JSON.stringify(lastSequence) === JSON.stringify(code)) {
          activate();
          setSequence([]);
          return;
        }
      }

      // Reset if wrong key pressed
      const expectedKey = code[newSequence.length - 1];
      if (newSequence.length > 0 && event.code !== expectedKey) {
        const partialMatch = code
          .slice(0, newSequence.length - 1)
          .every((c, i) => c === newSequence[i]);
        if (!partialMatch || event.code !== code[newSequence.length - 1]) {
          if (debug) {
            console.log('Konami sequence reset');
          }
          setSequence([]);
          return;
        }
      }

      setSequence(newSequence);

      // Reset if too long
      if (newSequence.length > code.length * 2) {
        setSequence([]);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [sequence, isActive, code, activate, debug]);

  return {
    isActive,
    activate,
    deactivate,
    progress: sequence.length,
    total: code.length
  };
}
