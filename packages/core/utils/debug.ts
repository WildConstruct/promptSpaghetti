/**
 * Debug utilities for conditional logging
 */

// Enable debug logs via environment variable or localStorage
const getDebugFlag = (key: string): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    return window.localStorage?.getItem(key) === 'true';
  } catch {
    return false;
  }
};

export const DEBUG =
  process.env.NODE_ENV === 'development' &&
  (process.env.REACT_APP_DEBUG === 'true' || getDebugFlag('DEBUG'));

export const DEBUG_EPIC1 =
  DEBUG &&
  (process.env.REACT_APP_DEBUG_EPIC1 === 'true' ||
    getDebugFlag('DEBUG_EPIC1'));

export const DEBUG_EXECUTION =
  DEBUG &&
  (process.env.REACT_APP_DEBUG_EXECUTION === 'true' ||
    getDebugFlag('DEBUG_EXECUTION'));

/**
 * Conditional debug logger
 */
export const debugLog = (...args: unknown[]) => {
  if (DEBUG) {
    console.log(...args);
  }
};

/**
 * Epic1-specific debug logger
 */
export const debugLogEpic1 = (...args: unknown[]) => {
  if (DEBUG_EPIC1) {
    console.log(...args);
  }
};

/**
 * Execution-specific debug logger
 */
export const debugLogExecution = (...args: unknown[]) => {
  if (DEBUG_EXECUTION) {
    console.log(...args);
  }
};
