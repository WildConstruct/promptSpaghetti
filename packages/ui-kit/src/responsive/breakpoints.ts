/**
 * Enhanced breakpoint management system
 */

import { Theme } from '../types';

export interface Breakpoints {
  xs: number;      // Extra small devices (phones) < 576px
  sm: number;      // Small devices (landscape phones) >= 576px
  md: number;      // Medium devices (tablets) >= 768px
  lg: number;      // Large devices (desktops) >= 1024px
  xl: number;      // Extra large devices (large desktops) >= 1280px
  xxl: number;     // Extra extra large devices >= 1536px
}

export const defaultBreakpoints: Breakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 1024,
  xl: 1280,
  xxl: 1536
};

export type BreakpointKey = keyof Breakpoints;

export interface BreakpointConfig {
  breakpoints: Breakpoints;
  defaultBreakpoint: BreakpointKey;
  mobileFirst: boolean;
}

export const defaultBreakpointConfig: BreakpointConfig = {
  breakpoints: defaultBreakpoints,
  defaultBreakpoint: 'md',
  mobileFirst: true
};

/**
 * Get the current breakpoint based on viewport width
 */
export function getCurrentBreakpoint(
  width: number, 
  breakpoints: Breakpoints = defaultBreakpoints
): BreakpointKey {
  const sortedBreakpoints = Object.entries(breakpoints)
    .sort(([, a], [, b]) => b - a);
  
  for (const [key, value] of sortedBreakpoints) {
    if (width >= value) {
      return key as BreakpointKey;
    }
  }
  
  return 'xs';
}

/**
 * Check if viewport matches a specific breakpoint
 */
export function matchesBreakpoint(
  width: number,
  breakpoint: BreakpointKey,
  breakpoints: Breakpoints = defaultBreakpoints
): boolean {
  const current = getCurrentBreakpoint(width, breakpoints);
  const sortedKeys = Object.keys(breakpoints) as BreakpointKey[];
  const currentIndex = sortedKeys.indexOf(current);
  const targetIndex = sortedKeys.indexOf(breakpoint);
  
  return currentIndex >= targetIndex;
}

/**
 * Generate media query for a breakpoint
 */
export function createMediaQuery(
  breakpoint: BreakpointKey,
  type: 'up' | 'down' | 'only' = 'up',
  breakpoints: Breakpoints = defaultBreakpoints
): string {
  const value = breakpoints[breakpoint];
  const sortedKeys = Object.keys(breakpoints) as BreakpointKey[];
  const index = sortedKeys.indexOf(breakpoint);
  
  switch (type) {
    case 'up':
      return `(min-width: ${value}px)`;
    
    case 'down':
      const nextBreakpoint = sortedKeys[index + 1];
      const maxWidth = nextBreakpoint ? breakpoints[nextBreakpoint] - 1 : Infinity;
      return maxWidth === Infinity 
        ? `(min-width: 0px)` 
        : `(max-width: ${maxWidth}px)`;
    
    case 'only':
      const nextBp = sortedKeys[index + 1];
      if (!nextBp) {
        return `(min-width: ${value}px)`;
      }
      const max = breakpoints[nextBp] - 1;
      return `(min-width: ${value}px) and (max-width: ${max}px)`;
    
    default:
      return `(min-width: ${value}px)`;
  }
}

/**
 * Resolve a responsive value based on current breakpoint
 */
export function resolveResponsiveValue<T>(
  values: Partial<Record<BreakpointKey, T>>,
  currentBreakpoint: BreakpointKey,
  defaultValue?: T
): T | undefined {
  const sortedKeys = Object.keys(defaultBreakpoints) as BreakpointKey[];
  const currentIndex = sortedKeys.indexOf(currentBreakpoint);
  
  // Check from current breakpoint down to find a value
  for (let i = currentIndex; i >= 0; i--) {
    const key = sortedKeys[i];
    if (values[key] !== undefined) {
      return values[key];
    }
  }
  
  return defaultValue;
}

/**
 * Create CSS object with responsive values
 */
export function createResponsiveStyles<T>(
  property: string,
  values: Partial<Record<BreakpointKey, T>>,
  transform?: (value: T) => string | number,
  breakpoints: Breakpoints = defaultBreakpoints
): Record<string, any> {
  const styles: Record<string, any> = {};
  const sortedEntries = Object.entries(values)
    .filter(([, value]) => value !== undefined)
    .sort(([a], [b]) => breakpoints[a as BreakpointKey] - breakpoints[b as BreakpointKey]);
  
  // Base style (smallest breakpoint)
  const [firstKey, firstValue] = sortedEntries[0] || [];
  if (firstKey && firstValue !== undefined) {
    styles[property] = transform ? transform(firstValue) : firstValue;
  }
  
  // Media query styles
  sortedEntries.slice(1).forEach(([key, value]) => {
    if (value !== undefined) {
      const mediaQuery = `@media ${createMediaQuery(key as BreakpointKey, 'up', breakpoints)}`;
      styles[mediaQuery] = {
        [property]: transform ? transform(value) : value
      };
    }
  });
  
  return styles;
}

/**
 * Breakpoint helper utilities
 */
export const breakpoints = {
  up: (bp: BreakpointKey, bps = defaultBreakpoints) => 
    createMediaQuery(bp, 'up', bps),
  
  down: (bp: BreakpointKey, bps = defaultBreakpoints) => 
    createMediaQuery(bp, 'down', bps),
  
  only: (bp: BreakpointKey, bps = defaultBreakpoints) => 
    createMediaQuery(bp, 'only', bps),
  
  between: (start: BreakpointKey, end: BreakpointKey, bps = defaultBreakpoints) => {
    const min = bps[start];
    const max = bps[end] - 1;
    return `(min-width: ${min}px) and (max-width: ${max}px)`;
  }
};