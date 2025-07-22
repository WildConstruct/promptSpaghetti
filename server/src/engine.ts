// server/src/engine.ts
// Deterministic depth-first graph executor (Story 3.1)
// Epic 13 - Enhanced with comprehensive analytics collection

import { Graph, Node, NodeTypeEnum } from '../../packages/core/graphSchema';
import {
  ConcatNode,
  ExecutionContext,
  GetVariableNode,
  IncludeNode,
  OutputNode,
  RuntimeNode,
  SetVariableNode,
  WeightedChoiceNode
} from '../../packages/core/runtime/index.js';

// Import advanced capabilities separately
import {
  AdvancedExecutionContext,
  AdvancedExecutionUtils
} from '../../packages/core/runtime/advanced.js';

// Epic 13 Analytics Integration
import { AnalyticsCollector, AnalyticsEventType } from './analytics/AnalyticsCollector';
import { AnalyticsDAO } from './database/analytics-dao';
import { getDatabase } from './database/connection';
import { v4 as uuidv4 } from 'uuid';

// Epic 8.5 Execution Path Tracking
import { GraphExecutionTracker } from '../../packages/core/execution/ExecutionTracker';
import { NodeExecutionStep, RandomChoiceInfo, ExecutionInput } from '../../packages/core/types/ExecutionPath';

// Import advanced nodes directly to avoid circular dependencies
import { WeightedAdvancedNode } from '../../packages/core/runtime/nodes/WeightedAdvanced.js';
import { ConditionalNode } from '../../packages/core/runtime/nodes/Conditional.js';
import { SequentialNode, createSequencePattern } from '../../packages/core/runtime/nodes/Sequential.js';
import { MarkovNode, createTransitionMatrix } from '../../packages/core/runtime/nodes/Markov.js';
// Temporarily disabled due to compilation issues
// import { PythonTransformNode } from '../../packages/core/runtime/nodes/PythonTransform.js';

// Epic 8.4 Extension System imports
import { ExtensionLifecycleManager } from '../../packages/core/extensions/ExtensionLifecycleManager';
import { BaseExtension, NodeExtension } from '../../packages/core/extensions/interfaces/ExtensionInterfaces';

// Epic 8.2 Template Processing imports  
import { parseTemplate, substituteVariables } from '../../packages/core/utils/templateParser.js';

// Global analytics collector instance
let analyticsCollector: AnalyticsCollector | null = null;
let analyticsDAO: AnalyticsDAO | null = null;

/**
 * Process template variables and substitute them with context values
 * Backward compatible - returns original template if processing fails
 */
function processTemplate(template: string, ctx: ExecutionContext): string {
  // Safety checks for backward compatibility
  if (!template || typeof template !== 'string' || !template.includes('{')) {
    return template;
  }
  
  // Ensure context is valid
  if (!ctx || !ctx.variables) {
    return template;
  }
  
  try {
    const parseResult = parseTemplate(template);
    
    // If template is invalid or has no variables, return original
    if (!parseResult.isValid || parseResult.variables.length === 0) {
      return template;
    }
    
    // Build variable values from execution context
    const variableValues: Record<string, string> = {};
    let hasReplacements = false;
    
    for (const variable of parseResult.variables) {
      if (variable.isValid && variable.name) {
        // Get value from execution context
        const value = ctx.variables[variable.name];
        if (value !== undefined && value !== null) {
          variableValues[variable.name] = String(value);
          hasReplacements = true;
        } else if (variable.defaultValue) {
          // Use inferred default value
          variableValues[variable.name] = variable.defaultValue;
          hasReplacements = true;
        }
      }
    }
    
    // Only substitute if we have actual replacements
    if (hasReplacements) {
      return substituteVariables(template, variableValues);
    }
  } catch (error) {
    console.warn('Template processing failed, returning original template:', error);
  }
  
  // Return original template if anything fails (backward compatibility)
  return template;
}

/**
 * Initialize analytics collection for execution engine
 */
export function initializeAnalytics(): void {
  try {
    const db = getDatabase();
    analyticsDAO = new AnalyticsDAO(db);
    analyticsDAO.initializeSchema();
    
    analyticsCollector = new AnalyticsCollector({
      enabled: process.env.ANALYTICS_ENABLED !== 'false',
      sampleRate: parseFloat(process.env.ANALYTICS_SAMPLE_RATE || '1.0'),
      privacyMode: process.env.ANALYTICS_PRIVACY_MODE === 'true'
    });

    // Set up event storage handler
    analyticsCollector.on('events_flushed', (events) => {
      if (analyticsDAO) {
        events.forEach((event: any) => analyticsDAO.storeEvent(event));
      }
    });

    console.log('Analytics collection initialized for execution engine');
  } catch (error) {
    console.error('Failed to initialize analytics:', error);
  }
}

/**
 * Execute a graph and return the output(s) from all Output nodes (ordered by id).
 * Automatically detects and supports both basic and advanced nodes.
 * Epic 13 - Enhanced with comprehensive analytics collection.
 * Epic 8.5 - Returns execution path data for visualization.
 */
export async function executeGraph(graph: Graph, sessionId?: string, userId?: number): Promise<{
  outputs: string[];
  executionPath?: ExecutionPath;
}> {
  const graphId = graph.id || uuidv4();
  const executionId = uuidv4();
  const currentSessionId = sessionId || uuidv4();
  const startTime = Date.now();
  
  // Epic 8.5: Initialize execution tracking
  const tracker = GraphExecutionTracker.getInstance();
  const trackingId = tracker.startTracking(graph.seed ?? Date.now());
  
  // Record graph execution start
  if (analyticsCollector) {
    analyticsCollector.recordGraphExecutionStart(
      graphId,
      graph.nodes.length,
      graph.edges?.length || 0,
      graph.seed
    );
  }

  try {
    // Check if graph contains advanced nodes
    const hasAdvancedNodes = graph.nodes.some(node => isAdvancedNodeType(node.type));
    
    // Create appropriate execution context
    const ctx = hasAdvancedNodes 
      ? AdvancedExecutionUtils.enhanceContext({ 
        variables: {}, 
        seed: graph.seed ?? Date.now() 
      })
      : { variables: {}, seed: graph.seed ?? Date.now() } as ExecutionContext;

    const nodeMap = new Map<string, Node>();
    graph.nodes.forEach((n) => nodeMap.set(n.id, n));

    const memo = new Map<string, any>();

    async function dfs(nodeId: string, depth: number = 0): Promise<any> {
      // SECURITY FIX: Prevent stack overflow with depth protection
      if (depth > 1000) {
        throw new Error(`Maximum execution depth exceeded (${depth}). Possible infinite recursion in graph at node ${nodeId}`);
      }
      
      if (memo.has(nodeId)) return memo.get(nodeId);
      const node = nodeMap.get(nodeId);
      if (!node) throw new Error(`Node ${nodeId} not found`);

      // Record node execution start
      const nodeStartTime = Date.now();
      if (analyticsCollector) {
        analyticsCollector.recordEvent({
          id: uuidv4(),
          type: AnalyticsEventType.NODE_EXECUTION_START,
          timestamp: nodeStartTime,
          sessionId: currentSessionId,
          userId,
          metadata: {
            nodeId,
            nodeType: node.type,
            graphId,
            executionId
          }
        });
      }

      try {
        // Resolve inputs first (depth-first)
        const resolvedInputs: any[] = [];
        const executionInputs: ExecutionInput[] = [];
        if (node.inputs) {
          for (let i = 0; i < node.inputs.length; i++) {
            const inId = node.inputs[i];
            const inputValue = await dfs(inId, depth + 1);
            resolvedInputs.push(inputValue);
            
            // Epic 8.5: Track execution inputs
            executionInputs.push({
              sourceNodeId: inId,
              value: inputValue,
              inputIndex: i
            });
          }
        }

        // Instantiate runtime node per type
        const runtime = createRuntime(node, resolvedInputs, ctx);
        const result = await runtime.run(ctx as any); // Cast needed for context compatibility
        memo.set(nodeId, result);

        // Record successful node execution
        const nodeEndTime = Date.now();
        const executionTimeMs = nodeEndTime - nodeStartTime;
        
        // Epic 8.5: Record execution step
        const executionStep: NodeExecutionStep = {
          nodeId,
          nodeType: node.type,
          stepIndex: 0, // Will be set by tracker
          timestamp: nodeStartTime,
          executionTimeMs,
          inputs: executionInputs,
          output: result
        };
        
        // Check if this is a randomization node and capture choice info
        if (isRandomizationNode(node.type)) {
          const randomChoice = extractRandomChoiceInfo(node, result, resolvedInputs);
          if (randomChoice) {
            executionStep.randomChoice = randomChoice;
            tracker.recordRandomChoice(trackingId, randomChoice);
          }
        }
        
        tracker.recordNodeExecution(trackingId, executionStep);
        
        if (analyticsCollector) {
          analyticsCollector.recordNodeExecution(
            nodeId,
            node.type,
            graphId,
            executionTimeMs,
            true, // success
            JSON.stringify(resolvedInputs).length,
            JSON.stringify(result).length
          );
        }

        return result;
      } catch (error) {
        // Record failed node execution
        const nodeEndTime = Date.now();
        const executionTimeMs = nodeEndTime - nodeStartTime;
        
        if (analyticsCollector) {
          analyticsCollector.recordNodeExecution(
            nodeId,
            node.type,
            graphId,
            executionTimeMs,
            false, // success
            undefined,
            undefined,
            error instanceof Error ? error.message : String(error)
          );
        }
        
        throw error;
      }
    }

    // Evaluate all output nodes in insertion order
    const outputs: string[] = [];
    for (const n of graph.nodes) {
      if (n.type === 'Output') {
        const value = await dfs(n.id, 0); // Start depth at 0 for output nodes
        outputs.push(value);
      }
    }

    // Record successful graph execution
    const endTime = Date.now();
    const executionTimeMs = endTime - startTime;
    const totalOutputLength = outputs.reduce((sum, output) => sum + output.length, 0);

    if (analyticsCollector) {
      analyticsCollector.recordGraphExecutionComplete(
        graphId,
        executionTimeMs,
        totalOutputLength,
        graph.nodes.length,
        countGraphConnections(graph)
      );
    }

    // Store graph execution record in database
    if (analyticsDAO) {
      analyticsDAO.storeGraphExecution({
        executionId,
        graphId,
        sessionId: currentSessionId,
        userId,
        startTime,
        endTime,
        executionTimeMs,
        nodeCount: graph.nodes.length,
        connectionCount: countGraphConnections(graph),
        success: true,
        outputLength: totalOutputLength,
        seedValue: typeof graph.seed === 'number' ? graph.seed : undefined
      });
    }

    // Epic 8.5: Finish execution tracking and get execution path
    const executionPath = tracker.finishTracking(trackingId, outputs.join('\n'));

    return {
      outputs,
      executionPath
    };

  } catch (error) {
    // Record failed graph execution
    const endTime = Date.now();
    const executionTimeMs = endTime - startTime;

    if (analyticsCollector) {
      analyticsCollector.recordGraphExecutionError(
        graphId,
        error instanceof Error ? error.message : String(error),
        graph.nodes.length,
        countGraphConnections(graph),
        executionTimeMs
      );
    }

    // Store failed graph execution record in database
    if (analyticsDAO) {
      analyticsDAO.storeGraphExecution({
        executionId,
        graphId,
        sessionId: currentSessionId,
        userId,
        startTime,
        endTime,
        executionTimeMs,
        nodeCount: graph.nodes.length,
        connectionCount: countGraphConnections(graph),
        success: false,
        errorMessage: error instanceof Error ? error.message : String(error),
        seedValue: typeof graph.seed === 'number' ? graph.seed : undefined
      });
    }

    throw error;
  }
}

/**
 * Legacy wrapper for backward compatibility - returns just the output strings
 */
export async function executeGraphLegacy(graph: Graph, sessionId?: string, userId?: number): Promise<string[]> {
  const result = await executeGraph(graph, sessionId, userId);
  return result.outputs;
}

/**
 * Count the number of connections (edges) in a graph
 */
function countGraphConnections(graph: Graph): number {
  let connectionCount = 0;
  for (const node of graph.nodes) {
    if (node.inputs && node.inputs.length > 0) {
      connectionCount += node.inputs.length;
    }
  }
  return connectionCount;
}

/**
 * Check if a node type is an advanced node that requires AdvancedExecutionContext
 */
function isAdvancedNodeType(nodeType: string): boolean {
  const advancedNodeTypes = ['WeightedAdvanced', 'Conditional', 'Sequential', 'Markov']; // PythonTransform temporarily disabled
  
  // Check built-in advanced nodes
  if (advancedNodeTypes.includes(nodeType)) {
    return true;
  }
  
  // Check extension nodes - assume extensions might use advanced features
  try {
    const extensions = ExtensionLifecycleManager.getActiveExtensions();
    for (const extension of extensions) {
      if (extension.extensionType === 'node') {
        const nodeExtension = extension as NodeExtension;
        const nodeTypes = nodeExtension.getNodeTypes();
        if (nodeTypes.some(type => type.id === nodeType)) {
          return true; // Assume extension nodes use advanced context for safety
        }
      }
    }
  } catch (error) {
    // Ignore errors in extension checking
  }
  
  return false;
}

function createRuntime(node: Node, resolvedInputs: any[], ctx: ExecutionContext): RuntimeNode<any> {
  switch (node.type) {
  // Basic Epic 3 nodes
  case 'WeightedChoice':
    return new WeightedChoiceNode(node.id, node.choices);
  case 'Concat':
    return new ConcatNode(node.id, resolvedInputs as string[]);
  case 'Output': {
    // Process template if available, otherwise use first input (backward compatibility)
    let output = resolvedInputs[0];
    if (node.template && node.template.trim()) {
      const processedTemplate = processTemplate(node.template, ctx);
      // Only use processed template if it's different and valid
      output = processedTemplate || output;
    }
    return new OutputNode(node.id, output);
  }
  case 'Include':
    return new IncludeNode(node.id, node.name, {});
  case 'SetVariable': {
    // Process template if available, otherwise use node.value (backward compatibility)
    let value = node.value;
    if (node.template && node.template.trim()) {
      const processedTemplate = processTemplate(node.template, ctx);
      // Only use processed template if it's different and valid
      value = processedTemplate || value;
    }
    return new SetVariableNode(node.id, node.key, value);
  }
  case 'GetVariable':
    return new GetVariableNode(node.id, node.key);
    
    // Epic 7 Advanced nodes
  case 'WeightedAdvanced':
    return new WeightedAdvancedNode(
      node.id,
      node.choices || [],
      node.distributionConfig || { type: 'linear', normalize: true }
    );
    
  case 'Conditional': {
    // Convert schema config to runtime config
    const config: any = { ...node.conditionalConfig };
    if (config.customFunctions) {
      // Convert non-function values to constant functions
      const funcs: Record<string, (...args: any[]) => any> = {};
      for (const [key, value] of Object.entries(config.customFunctions)) {
        if (typeof value === 'function') {
          funcs[key] = value;
        } else {
          // Convert constants to functions that return the constant
          funcs[key] = () => value;
        }
      }
      config.customFunctions = funcs;
    }
    return new ConditionalNode(
      node.id,
      node.branches || [],
      node.defaultOutput || '',
      config
    );
  }
    
  case 'Sequential':
    const patternConfig = node.pattern?.config || {};
    const pattern = createSequencePattern(
      node.pattern?.type || 'linear',
      patternConfig
    );
    return new SequentialNode(
      node.id,
      node.sequence || [],
      pattern
    );
    
  case 'Markov':
    // Handle empty states by providing a minimal default configuration
    const states = node.states && node.states.length > 0 ? node.states : ['default'];
    const transitions = node.transitions && Object.keys(node.transitions).length > 0 
      ? node.transitions 
      : { default: { default: 1.0 } };
      
    const transitionMatrix = createTransitionMatrix({
      states,
      transitions,
      initialState: node.initialState || states[0]
    });
    return new MarkovNode(
      node.id,
      transitionMatrix,
      node.markovConfig || {}
    );
    
    // Epic 8 Python Integration - Temporarily disabled
  case 'PythonTransform':
    throw new Error('PythonTransform node is not yet implemented');
    
  default:
    // Epic 8.4 Extension System - Try to find extension nodes
    const extensionNode = tryCreateExtensionNode(node, resolvedInputs, ctx);
    if (extensionNode) {
      return extensionNode;
    }
    // Exhaustive check
    throw new Error(`Unsupported node type ${(node as any).type}`);
  }
}

/**
 * Check if a node type involves randomization for execution path tracking
 */
function isRandomizationNode(nodeType: string): boolean {
  const randomizationTypes = [
    'WeightedChoice',
    'WeightedAdvanced',
    'Conditional',
    'Sequential',
    'Markov'
  ];
  return randomizationTypes.includes(nodeType);
}

/**
 * Extract random choice information for execution path tracking
 */
function extractRandomChoiceInfo(node: Node, result: any, resolvedInputs: any[]): RandomChoiceInfo | null {
  try {
    switch (node.type) {
      case 'WeightedChoice': {
        const choices = node.choices as string[] || [];
        const weights = node.weights as number[] || [];
        const selectedIndex = choices.indexOf(result);
        
        if (selectedIndex >= 0) {
          const weight = weights[selectedIndex] || 1;
          const totalWeight = weights.reduce((sum, w) => sum + w, 0);
          const probability = totalWeight > 0 ? weight / totalWeight : 1 / choices.length;
          
          return {
            choiceType: 'weighted',
            availableOptions: choices,
            selectedOption: result,
            selectionReason: `Selected "${result}" with weight ${weight}`,
            probability,
            weight
          };
        }
        break;
      }
      
      case 'WeightedAdvanced': {
        const choices = node.choices as string[] || [];
        if (choices.includes(result)) {
          return {
            choiceType: 'weighted',
            availableOptions: choices,
            selectedOption: result,
            selectionReason: `Advanced weighted selection of "${result}"`
          };
        }
        break;
      }
      
      case 'Conditional': {
        const branches = node.branches as any[] || [];
        return {
          choiceType: 'conditional',
          availableOptions: branches.map((b, i) => `Branch ${i + 1}: ${b.condition || 'default'}`),
          selectedOption: result,
          selectionReason: `Conditional evaluation resulted in "${result}"`
        };
      }
      
      case 'Sequential': {
        const sequence = node.sequence as string[] || [];
        return {
          choiceType: 'sequential',
          availableOptions: sequence,
          selectedOption: result,
          selectionReason: `Sequential selection of "${result}"`
        };
      }
      
      case 'Markov': {
        const states = node.states as string[] || [];
        return {
          choiceType: 'markov',
          availableOptions: states,
          selectedOption: result,
          selectionReason: `Markov state transition to "${result}"`
        };
      }
    }
  } catch (error) {
    console.warn(`Failed to extract random choice info for ${node.type}:`, error);
  }
  
  return null;
}

/**
 * Try to create a runtime node from an extension
 */
function tryCreateExtensionNode(node: Node, resolvedInputs: any[], ctx: ExecutionContext): RuntimeNode<any> | null {
  try {
    // Get all active node extensions
    const extensions = ExtensionLifecycleManager.getActiveExtensions();
    
    for (const extension of extensions) {
      if (extension.extensionType === 'node') {
        const nodeExtension = extension as NodeExtension;
        const nodeTypes = nodeExtension.getNodeTypes();
        
        // Check if this extension provides the node type
        const nodeTypeInfo = nodeTypes.find(type => type.id === node.type);
        if (nodeTypeInfo) {
          // Create the extension node instance  
          // Convert node properties to config object (excluding id, type, and inputs)
          const { id, type, inputs, ...nodeConfig } = node;
          const extensionNode = nodeExtension.createNode(node.type, node.id, nodeConfig);
          
          // Wrap in a RuntimeNode adapter if needed
          if (extensionNode && typeof extensionNode.run === 'function') {
            return extensionNode as RuntimeNode<any>;
          }
        }
      }
    }
    
    return null;
  } catch (error) {
    console.warn(`Failed to create extension node for type ${node.type}:`, error);
    return null;
  }
}
