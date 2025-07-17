// server/src/engine.ts
// Deterministic depth-first graph executor (Story 3.1)

import { Graph, Node, NodeTypeEnum } from '../../packages/core/graphSchema';
import {
  ConcatNode,
  ExecutionContext,
  GetVariableNode,
  IncludeNode,
  OutputNode,
  RuntimeNode,
  SetVariableNode,
  WeightedChoiceNode,
  // Epic 7 Advanced Node Capabilities
  AdvancedExecutionContext,
  AdvancedExecutionUtils,
} from '../../packages/core/runtime';

// Import advanced nodes directly to avoid circular dependencies
import { WeightedAdvancedNode } from '../../packages/core/runtime/nodes/WeightedAdvanced';
import { ConditionalNode } from '../../packages/core/runtime/nodes/Conditional';
import { SequentialNode, createSequencePattern } from '../../packages/core/runtime/nodes/Sequential';
import { MarkovNode, createTransitionMatrix } from '../../packages/core/runtime/nodes/Markov';
// Temporarily disabled due to compilation issues
// import { PythonTransformNode } from '../../packages/core/runtime/nodes/PythonTransform';

// Epic 8.4 Extension System imports
import { ExtensionLifecycleManager } from '../../packages/core/extensions/ExtensionLifecycleManager';
import { BaseExtension, NodeExtension } from '../../packages/core/extensions/interfaces/ExtensionInterfaces';

/**
 * Execute a graph and return the output(s) from all Output nodes (ordered by id).
 * Automatically detects and supports both basic and advanced nodes.
 */
export async function executeGraph(graph: Graph): Promise<string[]> {
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

  async function dfs(nodeId: string): Promise<any> {
    if (memo.has(nodeId)) return memo.get(nodeId);
    const node = nodeMap.get(nodeId);
    if (!node) throw new Error(`Node ${nodeId} not found`);

    // Resolve inputs first (depth-first)
    const resolvedInputs: any[] = [];
    if (node.inputs) {
      for (const inId of node.inputs) {
        resolvedInputs.push(await dfs(inId));
      }
    }

    // Instantiate runtime node per type
    const runtime = createRuntime(node, resolvedInputs);
    const result = await runtime.run(ctx as any); // Cast needed for context compatibility
    memo.set(nodeId, result);
    return result;
  }

  // Evaluate all output nodes in insertion order
  const outputs: string[] = [];
  for (const n of graph.nodes) {
    if (n.type === 'Output') {
      const value = await dfs(n.id);
      outputs.push(value);
    }
  }
  return outputs;
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

function createRuntime(node: Node, resolvedInputs: any[]): RuntimeNode<any> {
  switch (node.type) {
    // Basic Epic 3 nodes
    case 'WeightedChoice':
      return new WeightedChoiceNode(node.id, node.choices);
    case 'Concat':
      return new ConcatNode(node.id, resolvedInputs as string[]);
    case 'Output':
      return new OutputNode(node.id, resolvedInputs[0]);
    case 'Include':
      return new IncludeNode(node.id, node.name, {});
    case 'SetVariable':
      return new SetVariableNode(node.id, node.key, node.value);
    case 'GetVariable':
      return new GetVariableNode(node.id, node.key);
    
    // Epic 7 Advanced nodes
    case 'WeightedAdvanced':
      return new WeightedAdvancedNode(
        node.id,
        node.choices || [],
        node.distributionConfig || { type: 'linear', normalize: true }
      );
    
    case 'Conditional':
      return new ConditionalNode(
        node.id,
        node.branches || [],
        node.defaultOutput || '',
        node.conditionalConfig || {}
      );
    
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
    // case 'PythonTransform':
    //   return new PythonTransformNode(node.id, {
    //     code: node.code,
    //     timeout: node.timeout,
    //     memoryLimit: node.memoryLimit,
    //     allowedModules: node.allowedModules,
    //     pythonConfig: node.pythonConfig
    //   });
    
    default:
      // Epic 8.4 Extension System - Try to find extension nodes
      const extensionNode = tryCreateExtensionNode(node, resolvedInputs);
      if (extensionNode) {
        return extensionNode;
      }
      // Exhaustive check
      const _exhaustive: never = node;
      throw new Error(`Unsupported node type ${(node as any).type}`);
  }
}

/**
 * Try to create a runtime node from an extension
 */
function tryCreateExtensionNode(node: Node, resolvedInputs: any[]): RuntimeNode<any> | null {
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
