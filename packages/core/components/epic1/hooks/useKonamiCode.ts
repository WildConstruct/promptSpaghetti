import { useState, useEffect, useRef, useCallback } from 'react';

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
  const [isActive, setIsActive] = useState(false);
  const [progress, setProgress] = useState(0);

  const codeRef = useRef(code);
  const progressRef = useRef(0);
  const historyRef = useRef<string[]>([]);
  const activeRef = useRef(false);
  const onActivateRef = useRef(onActivate);
  const onDeactivateRef = useRef(onDeactivate);
  const debugRef = useRef(debug);

  useEffect(() => {
    codeRef.current = code;
  }, [code]);

  useEffect(() => {
    onActivateRef.current = onActivate;
  }, [onActivate]);

  useEffect(() => {
    onDeactivateRef.current = onDeactivate;
  }, [onDeactivate]);

  useEffect(() => {
    debugRef.current = debug;
  }, [debug]);

  const resetProgress = useCallback(() => {
    progressRef.current = 0;
    historyRef.current = [];
    setProgress(0);
  }, []);

  const activate = useCallback(() => {
    setIsActive(true);
    activeRef.current = true;
    onActivateRef.current?.();
    if (debugRef.current) {
      console.log('🎮 Konami Code Activated!');
    }
  }, []);

  const deactivate = useCallback(() => {
    setIsActive(false);
    activeRef.current = false;
    resetProgress();
    onDeactivateRef.current?.();
    if (debugRef.current) {
      console.log('🎮 Konami Code Deactivated');
    }
  }, [resetProgress]);

  useEffect(() => {
    resetProgress();
    activeRef.current = isActive;
  }, [isActive, resetProgress]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (activeRef.current) {
        return;
      }

      const target = event.target as HTMLElement | null;
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') {
        return;
      }

      const sequence = codeRef.current;
      if (sequence.length === 0) {
        return;
      }

      const history = historyRef.current;
      history.push(event.code);
      if (history.length > sequence.length) {
        history.shift();
      }

      const maxLen = Math.min(sequence.length, history.length);
      let nextIndex = 0;

      for (let len = maxLen; len > 0; len--) {
        let matches = true;
        for (let i = 0; i < len; i++) {
          if (history[history.length - len + i] !== sequence[i]) {
            matches = false;
            break;
          }
        }
        if (matches) {
          nextIndex = len;
          break;
        }
      }

      progressRef.current = nextIndex;
      setProgress(nextIndex);

      if (debugRef.current) {
        console.debug(`Konami progress: ${nextIndex}/${sequence.length}`);
      }

      if (nextIndex >= sequence.length) {
        resetProgress();
        activate();
      }
    };

    const listener = (event: KeyboardEvent) => handler(event);
    document.addEventListener('keydown', listener);
    return () => document.removeEventListener('keydown', listener);
  }, [activate, resetProgress]);

  return {
    isActive,
    activate,
    deactivate,
    progress,
    total: codeRef.current.length
  };
}
