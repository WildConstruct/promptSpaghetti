// Legacy entry point preserved for compatibility.
// The server now uses the streamlined engine-basic implementation, so we
// simply re-export the public API here to keep existing imports working.

export {
  executeGraph,
  executeGraphLegacy,
  initializeAnalytics
} from './engine-basic';
