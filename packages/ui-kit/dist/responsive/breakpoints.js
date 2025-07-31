/**
 * Enhanced breakpoint management system
 */
export const defaultBreakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 1024,
  xl: 1280,
  xxl: 1536,
};
export const defaultBreakpointConfig = {
  breakpoints: defaultBreakpoints,
  defaultBreakpoint: 'md',
  mobileFirst: true,
};
/**
 * Get the current breakpoint based on viewport width
 */
export function getCurrentBreakpoint(width, breakpoints = defaultBreakpoints) {
  const sortedBreakpoints = Object.entries(breakpoints).sort(([, a], [, b]) => b - a);
  for (const [key, value] of sortedBreakpoints) {
    if (width >= value) {
      return key;
    }
  }
  return 'xs';
}
/**
 * Check if viewport matches a specific breakpoint
 */
export function matchesBreakpoint(width, breakpoint, breakpoints = defaultBreakpoints) {
  const current = getCurrentBreakpoint(width, breakpoints);
  const sortedKeys = Object.keys(breakpoints);
  const currentIndex = sortedKeys.indexOf(current);
  const targetIndex = sortedKeys.indexOf(breakpoint);
  return currentIndex >= targetIndex;
}
/**
 * Generate media query for a breakpoint
 */
export function createMediaQuery(breakpoint, type = 'up', breakpoints = defaultBreakpoints) {
  const value = breakpoints[breakpoint];
  const sortedKeys = Object.keys(breakpoints);
  const index = sortedKeys.indexOf(breakpoint);
  switch (type) {
    case 'up':
      return `(min-width: ${value}px)`;
    case 'down':
      const nextBreakpoint = sortedKeys[index + 1];
      const maxWidth = nextBreakpoint ? breakpoints[nextBreakpoint] - 1 : Infinity;
      return maxWidth === Infinity ? '(min-width: 0px)' : `(max-width: ${maxWidth}px)`;
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
export function resolveResponsiveValue(values, currentBreakpoint, defaultValue) {
  const sortedKeys = Object.keys(defaultBreakpoints);
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
export function createResponsiveStyles(property, values, transform, breakpoints = defaultBreakpoints) {
  const styles = {};
  const sortedEntries = Object.entries(values)
    .filter(([, value]) => value !== undefined)
    .sort(([a], [b]) => breakpoints[a] - breakpoints[b]);
  // Base style (smallest breakpoint)
  const [firstKey, firstValue] = sortedEntries[0] || [];
  if (firstKey && firstValue !== undefined) {
    styles[property] = transform ? transform(firstValue) : firstValue;
  }
  // Media query styles
  sortedEntries.slice(1).forEach(([key, value]) => {
    if (value !== undefined) {
      const mediaQuery = `@media ${createMediaQuery(key, 'up', breakpoints)}`;
      styles[mediaQuery] = {
        [property]: transform ? transform(value) : value,
      };
    }
  });
  return styles;
}
/**
 * Breakpoint helper utilities
 */
export const breakpoints = {
  up: (bp, bps = defaultBreakpoints) => createMediaQuery(bp, 'up', bps),
  down: (bp, bps = defaultBreakpoints) => createMediaQuery(bp, 'down', bps),
  only: (bp, bps = defaultBreakpoints) => createMediaQuery(bp, 'only', bps),
  between: (start, end, bps = defaultBreakpoints) => {
    const min = bps[start];
    const max = bps[end] - 1;
    return `(min-width: ${min}px) and (max-width: ${max}px)`;
  },
};
//# sourceMappingURL=breakpoints.js.map
