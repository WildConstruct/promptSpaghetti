/**
 * Responsive utility functions and hooks
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { BreakpointKey, getCurrentBreakpoint, defaultBreakpoints } from './breakpoints';
import { getDeviceInfo, DeviceInfo } from './device';

/**
 * Enhanced responsive hook with device info
 */
export function useEnhancedResponsive() {
  const [state, setState] = useState(() => {
    if (typeof window === 'undefined') {
      return {
        width: 1920,
        height: 1080,
        breakpoint: 'xl' as BreakpointKey,
        device: null as DeviceInfo | null,
      };
    }

    return {
      width: window.innerWidth,
      height: window.innerHeight,
      breakpoint: getCurrentBreakpoint(window.innerWidth),
      device: getDeviceInfo(),
    };
  });

  useEffect(() => {
    const updateState = () => {
      setState({
        width: window.innerWidth,
        height: window.innerHeight,
        breakpoint: getCurrentBreakpoint(window.innerWidth),
        device: getDeviceInfo(),
      });
    };

    window.addEventListener('resize', updateState);
    window.addEventListener('orientationchange', updateState);

    return () => {
      window.removeEventListener('resize', updateState);
      window.removeEventListener('orientationchange', updateState);
    };
  }, []);

  return state;
}

/**
 * Hook for conditional rendering based on breakpoints
 */
export function useBreakpointValue<T>(values: Partial<Record<BreakpointKey, T>>, defaultValue?: T): T | undefined {
  const { breakpoint } = useEnhancedResponsive();

  return useMemo(() => {
    const sortedKeys = Object.keys(defaultBreakpoints) as BreakpointKey[];
    const currentIndex = sortedKeys.indexOf(breakpoint);

    // Check from current breakpoint down
    for (let i = currentIndex; i >= 0; i--) {
      const key = sortedKeys[i];
      if (values[key] !== undefined) {
        return values[key];
      }
    }

    return defaultValue;
  }, [breakpoint, values, defaultValue]);
}

/**
 * Hook for matching specific breakpoints
 */
export function useBreakpointMatch(
  query:
    | BreakpointKey
    | BreakpointKey[]
    | {
        min?: BreakpointKey;
        max?: BreakpointKey;
        only?: BreakpointKey;
      }
): boolean {
  const { breakpoint } = useEnhancedResponsive();

  return useMemo(() => {
    const sortedKeys = Object.keys(defaultBreakpoints) as BreakpointKey[];
    const currentIndex = sortedKeys.indexOf(breakpoint);

    // Array of breakpoints
    if (Array.isArray(query)) {
      return query.includes(breakpoint);
    }

    // Single breakpoint
    if (typeof query === 'string') {
      return breakpoint === query;
    }

    // Range query
    const { min, max, only } = query;

    if (only) {
      return breakpoint === only;
    }

    const minIndex = min ? sortedKeys.indexOf(min) : 0;
    const maxIndex = max ? sortedKeys.indexOf(max) : sortedKeys.length - 1;

    return currentIndex >= minIndex && currentIndex <= maxIndex;
  }, [breakpoint, query]);
}

/**
 * Hook for device-specific rendering
 */
export function useDeviceDetection() {
  const { device } = useEnhancedResponsive();

  return useMemo(
    () => ({
      isMobile: device?.type === 'mobile',
      isTablet: device?.type === 'tablet',
      isDesktop: device?.type === 'desktop',
      isTV: device?.type === 'tv',
      isTouch: device?.touch || false,
      isRetina: device?.retina || false,
      isPortrait: device?.orientation === 'portrait',
      isLandscape: device?.orientation === 'landscape',
      isIOS: device?.os === 'ios',
      isAndroid: device?.os === 'android',
      isWindows: device?.os === 'windows',
      isMacOS: device?.os === 'macos',
      isChrome: device?.browser === 'chrome',
      isSafari: device?.browser === 'safari',
      isFirefox: device?.browser === 'firefox',
      device,
    }),
    [device]
  );
}

/**
 * Utility for creating responsive class names
 */
export function responsiveClasses(
  baseClass: string,
  modifiers: Partial<Record<BreakpointKey, string | string[]>>
): string {
  const classes: string[] = [baseClass];

  Object.entries(modifiers).forEach(([breakpoint, modifier]) => {
    if (modifier) {
      const mods = Array.isArray(modifier) ? modifier : [modifier];
      mods.forEach(mod => {
        classes.push(`${breakpoint}:${mod}`);
      });
    }
  });

  return classes.join(' ');
}

/**
 * Utility for responsive spacing
 */
export function responsiveSpacing(values: Partial<Record<BreakpointKey, number | string>>): string {
  const { breakpoint } = useEnhancedResponsive();
  const value = useBreakpointValue(values);

  if (typeof value === 'number') {
    return `${value * 8}px`; // Base 8px grid
  }

  return value || '0';
}

/**
 * Create responsive style object
 */
export function responsiveStyle<T extends Record<string, any>>(styles: Partial<Record<BreakpointKey, T>>): T {
  const { breakpoint } = useEnhancedResponsive();
  const style = useBreakpointValue(styles);
  return style || ({} as T);
}

/**
 * Visibility utilities
 */
export function useVisibility(config: {
  showOn?: BreakpointKey | BreakpointKey[];
  hideOn?: BreakpointKey | BreakpointKey[];
}): boolean {
  const { breakpoint } = useEnhancedResponsive();

  if (config.hideOn) {
    const hideBreakpoints = Array.isArray(config.hideOn) ? config.hideOn : [config.hideOn];
    if (hideBreakpoints.includes(breakpoint)) {
      return false;
    }
  }

  if (config.showOn) {
    const showBreakpoints = Array.isArray(config.showOn) ? config.showOn : [config.showOn];
    return showBreakpoints.includes(breakpoint);
  }

  return true;
}

/**
 * Container query hook (polyfill)
 */
export function useContainerQuery(
  ref: React.RefObject<HTMLElement>,
  queries: Record<string, number>
): Record<string, boolean> {
  const [matches, setMatches] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!ref.current) return;

    const checkQueries = () => {
      if (!ref.current) return;

      const width = ref.current.offsetWidth;
      const newMatches: Record<string, boolean> = {};

      Object.entries(queries).forEach(([name, minWidth]) => {
        newMatches[name] = width >= minWidth;
      });

      setMatches(newMatches);
    };

    const observer = new ResizeObserver(checkQueries);
    observer.observe(ref.current);
    checkQueries();

    return () => observer.disconnect();
  }, [ref, queries]);

  return matches;
}

/**
 * Performance-optimized resize observer
 */
export function useResizeObserver<T extends HTMLElement>(
  callback: (entry: ResizeObserverEntry) => void,
  options?: { debounce?: number; throttle?: number }
): React.RefObject<T> {
  const ref = useRef<T>(null);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!ref.current) return;

    let timeoutId: NodeJS.Timeout;
    let lastCall = 0;

    const handleResize = (entries: ResizeObserverEntry[]) => {
      const entry = entries[0];

      if (options?.throttle) {
        const now = Date.now();
        if (now - lastCall < options.throttle) return;
        lastCall = now;
        callbackRef.current(entry);
      } else if (options?.debounce) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => callbackRef.current(entry), options.debounce);
      } else {
        callbackRef.current(entry);
      }
    };

    const observer = new ResizeObserver(handleResize);
    observer.observe(ref.current);

    return () => {
      observer.disconnect();
      clearTimeout(timeoutId);
    };
  }, [options?.debounce, options?.throttle]);

  return ref;
}
