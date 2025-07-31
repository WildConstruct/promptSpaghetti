// Bridge module to load ESM core modules for CommonJS server
// This allows the CommonJS server to use the ESM core package

let coreModules = null;
let advancedModules = null;
let executionTracker = null;
let advancedNodes = {};
let extensions = null;
let templates = null;

async function loadCoreModules() {
  if (!coreModules) {
    try {
      // Load core runtime modules
      coreModules = await import('../../../../packages/core/dist/packages/core/runtime/index.js');
      advancedModules = await import('../../../../packages/core/dist/packages/core/runtime/advanced.js');

      // Load execution tracking
      executionTracker = await import('../../../../packages/core/dist/packages/core/execution/ExecutionTracker.js');

      // Load advanced nodes
      advancedNodes.WeightedAdvanced = await import(
        '../../../../packages/core/dist/packages/core/runtime/nodes/WeightedAdvanced.js'
      );
      advancedNodes.Conditional = await import(
        '../../../../packages/core/dist/packages/core/runtime/nodes/Conditional.js'
      );
      advancedNodes.Sequential = await import(
        '../../../../packages/core/dist/packages/core/runtime/nodes/Sequential.js'
      );
      advancedNodes.Markov = await import('../../../../packages/core/dist/packages/core/runtime/nodes/Markov.js');

      // Load extension system
      extensions = await import('../../../../packages/core/dist/packages/core/extensions/ExtensionLifecycleManager.js');

      // Load templates
      templates = await import('../../../../packages/core/dist/packages/core/utils/templateParser.js');
    } catch (error) {
      console.error('Failed to load core modules:', error);
      throw error;
    }
  }

  return {
    // Core runtime
    ConcatNode: coreModules.ConcatNode,
    ExecutionContext: coreModules.ExecutionContext,
    GetVariableNode: coreModules.GetVariableNode,
    IncludeNode: coreModules.IncludeNode,
    OutputNode: coreModules.OutputNode,
    RuntimeNode: coreModules.RuntimeNode,
    SetVariableNode: coreModules.SetVariableNode,
    WeightedChoiceNode: coreModules.WeightedChoiceNode,

    // Advanced runtime
    AdvancedExecutionContext: advancedModules.AdvancedExecutionContext,
    AdvancedExecutionUtils: advancedModules.AdvancedExecutionUtils,

    // Execution tracking
    GraphExecutionTracker: executionTracker.GraphExecutionTracker,

    // Advanced nodes
    WeightedAdvancedNode: advancedNodes.WeightedAdvanced.WeightedAdvancedNode,
    ConditionalNode: advancedNodes.Conditional.ConditionalNode,
    SequentialNode: advancedNodes.Sequential.SequentialNode,
    createSequencePattern: advancedNodes.Sequential.createSequencePattern,
    MarkovNode: advancedNodes.Markov.MarkovNode,
    createTransitionMatrix: advancedNodes.Markov.createTransitionMatrix,

    // Extensions
    ExtensionLifecycleManager: extensions.ExtensionLifecycleManager,

    // Templates
    parseTemplate: templates.parseTemplate,
    substituteVariables: templates.substituteVariables,
  };
}

module.exports = { loadCoreModules };
