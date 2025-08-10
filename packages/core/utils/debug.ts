/**
 * Debug utilities for conditional logging
 */

// Enable debug logs via environment variable or localStorage
export const DEBUG =
  process.env.NODE_ENV === 'development' &&
  (process.env.REACT_APP_DEBUG === 'true' ||
    (typeof window !== 'undefined' &&
      window.localStorage?.getItem('DEBUG') === 'true'));

export const DEBUG_EPIC1 =
  DEBUG &&
  (process.env.REACT_APP_DEBUG_EPIC1 === 'true' ||
    (typeof window !== 'undefined' &&
      window.localStorage?.getItem('DEBUG_EPIC1') === 'true'));

export const DEBUG_EXECUTION =
  DEBUG &&
  (process.env.REACT_APP_DEBUG_EXECUTION === 'true' ||
    (typeof window !== 'undefined' &&
      window.localStorage?.getItem('DEBUG_EXECUTION') === 'true'));

/**
 * Conditional debug logger
 */
export const debugLog = (...args: any[]) => {
  if (DEBUG) {
    console.log(...args);
  }
};

/**
 * Epic1-specific debug logger
 */
export const debugLogEpic1 = (...args: any[]) => {
  if (DEBUG_EPIC1) {
    console.log(...args);
  }
};

/**
 * Execution-specific debug logger
 */
export const debugLogExecution = (...args: any[]) => {
  if (DEBUG_EXECUTION) {
    console.log(...args);
  }
};
