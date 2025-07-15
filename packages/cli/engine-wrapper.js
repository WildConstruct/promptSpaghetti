/**
 * A wrapper for the engine.ts functionality that handles TypeScript compilation issues
 * when running via CLI
 */
const fs = require('fs');
const path = require('path');
const { executeGraph: originalExecuteGraph } = require('../../server/src/engine');

/**
 * Execute a graph from a file path
 * @param {string} graphPath - Path to the graph JSON file
 * @param {object} options - Options including seed value
 * @returns {Promise<string[]>} - Output from graph execution
 */
async function executeGraphFromFile(graphPath, options = {}) {
  if (!fs.existsSync(graphPath)) {
    throw new Error(`Graph file not found: ${graphPath}`);
  }
  
  const raw = fs.readFileSync(graphPath, 'utf-8');
  const graph = JSON.parse(raw);
  
  if (options.seed !== undefined) {
    graph.seed = options.seed;
  }
  
  return originalExecuteGraph(graph);
}

module.exports = {
  executeGraphFromFile,
};
