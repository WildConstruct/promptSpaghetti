// Lightweight shim that re-exports the compiled engine implementation used by
// the production bundle. This keeps legacy CommonJS entry points functional
// without duplicating the large engine source in two languages.

const compiledEngine = require('../../temp-build/server/src/engine.js');

module.exports = {
  executeGraph: compiledEngine.executeGraph,
  executeGraphLegacy: compiledEngine.executeGraphLegacy,
  initializeAnalytics: compiledEngine.initializeAnalytics
};
