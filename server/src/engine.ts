// server/src/engine.ts
// Deterministic depth-first graph executor (Story 3.1)
// Epic 13 - Enhanced with comprehensive analytics collection
// PERFORMANCE OPTIMIZATION: Batched analytics to reduce overhead

import { Graph, Node, NodeTypeEnum } from '../../packages/core/graphSchema';

// Interface for Conditional node branches



interface ConditionalBranch {
  condition: string;
  output: string;
  label?: string;
}

// Minimal engine for server startup - bypassing problematic imports
import { v4 as uuidv4 } from 'uuid';

// Temporarily stub out problematic imports for server startup
// TODO: Re-enable full functionality once module resolution is fixed

// Simplified engine for server startup
// Global analytics variables - stubbed for now  
let analyticsCollector: any = null;
let analyticsDAO: any = null;

// Stub RuntimeNode interface
interface RuntimeNode<T> {
  run(ctx: any): Promise<T> | T;
}

// Stub node implementations for server startup
class WeightedChoiceNode implements RuntimeNode<string> {
  constructor(private id: string, private choices: any[]) {}
  run(ctx: any): string {
    if (!this.choices || this.choices.length === 0) return '';
    // Simple random choice for now
    const choice = this.choices[Math.floor(Math.random() * this.choices.length)];
    return choice.text || choice.value || '';
  }
}

class ConcatNode implements RuntimeNode<string> {
  constructor(private id: string, private inputs: string[]) {}
  run(ctx: any): string {
    return this.inputs.filter(Boolean).join(' ');
  }
}

class OutputNode implements RuntimeNode<string> {
  private inputs: string[] = [];
  private value: string = '';
  
  constructor(private id: string) {}
  
  setInput(value: string | string[]): void {
    if (Array.isArray(value)) {
      this.inputs = value.map(v => String(v || ''));
      // Auto-concatenate multiple inputs with spaces
      this.value = this.inputs.filter(v => v).join(' ');
    } else {
      this.inputs = [String(value || '')];
      this.value = this.inputs[0];
    }
  }
  
  run(ctx: any): string {
    return this.value;
  }
}

class IncludeNode implements RuntimeNode<string> {
  constructor(private id: string, private name: string, private lookup: any) {}
  run(ctx: any): string {
    return this.lookup[this.name] || '';
  }
}

class SetVariableNode implements RuntimeNode<void> {
  constructor(private id: string, private key: string, private value: any) {}
  run(ctx: any): void {
    if (ctx.variables) {
      ctx.variables[this.key] = this.value;
    }
  }
}

class GetVariableNode implements RuntimeNode<any> {
  constructor(private id: string, private key: string) {}
  run(ctx: any): any {
    return ctx.variables?.[this.key];
  }
}

class TextBlockNode implements RuntimeNode<string> {
  constructor(private id: string, private text: string) {}
  run(ctx: any): string {
    return this.text || '';
  }
}

/**
 * Simplified stub for server startup
 */
function processTemplateVariables(template: string, executionContext: any): string {
  // Simple stub implementation
  return template || '';


/**
 * Simplified stub for server startup
 */
export function initializeAnalytics(): void {
  console.log('Analytics initialization skipped (stub mode)');
}

/**
 * Simplified stub for server startup  
 */
export async function executeGraph(graph: Graph, sessionId?: string, userId?: number): Promise<{
  outputs: string[];
  executionPath?: any;
}> {

  const graphId = graph.id || uuidv4();
  const executionId = uuidv4();
  const currentSessionId = sessionId || uuidv4();
  const startTime = Date.now();
  
  // PERFORMANCE OPTIMIZATION: Batched analytics collection
  const analyticsBuffer: Record<string, unknown>[] = [];
  const flushAnalytics = () => {
    if (analyticsCollector && analyticsBuffer.length > 0) {
      // Batch send all analytics events
      analyticsBuffer.forEach(event => {
        if (event.type === 'nodeExecution') {
          analyticsCollector.recordNodeExecution(
            event.nodeId,
            event.nodeType,
            event.graphId,
            event.executionTimeMs,
            event.success,
            event.error
          );
        } else if (event.type === 'event') {
          analyticsCollector.recordEvent(event.data);
        }
      });
      analyticsBuffer.length = 0; // Clear buffer
    }
  };
  
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


  try {
    // Check if graph contains advanced nodes
    const hasAdvancedNodes = graph.nodes.some(node => isAdvancedNodeType(node.type));
    
    // Create appropriate execution context
    const executionContext = hasAdvancedNodes 
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


      try {
        // Resolve inputs first (depth-first)
        const resolvedInputs: unknown[] = [];
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



        // Instantiate runtime node per type
        const runtimeNode = createRuntimeNode(node, resolvedInputs, executionContext);
        const result = await runtimeNode.run(executionContext as any); // Cast needed for context compatibility
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


        
        tracker.recordNodeExecution(trackingId, executionStep);
        
        // PERFORMANCE OPTIMIZATION: Buffer analytics instead of immediate recording
        analyticsBuffer.push({
          type: 'nodeExecution',
          nodeId,
          nodeType: node.type,
          graphId,
          executionTimeMs,
          success: true,
          error: undefined
        });

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

        
        throw error;



    // Evaluate all output nodes in insertion order
    const outputs: string[] = [];
    for (const n of graph.nodes) {
      if (n.type === 'Output') {
        const value = await dfs(n.id, 0); // Start depth at 0 for output nodes
        outputs.push(value);



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


    // Epic 8.5: Finish execution tracking and get execution path
    const executionPath = tracker.finishTracking(trackingId, outputs.join('\n'));
    
    // PERFORMANCE OPTIMIZATION: Flush batched analytics before returning
    flushAnalytics();

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


    throw error;



/**
 * Legacy wrapper for backward compatibility - returns just the output strings
 */
export async function executeGraphLegacy(graph: Graph, sessionId?: string, userId?: number): Promise<string[]> {

  const result = await executeGraph(graph, sessionId, userId);
  return result.outputs;


/**
 * Count the number of connections (edges) in a graph
 */
function countGraphConnections(graph: Graph): number {
  let connectionCount = 0;
  for (const node of graph.nodes) {
    if (node.inputs && node.inputs.length > 0) {
      connectionCount += node.inputs.length;


  return connectionCount;


/**
 * Check if a node type is an advanced node that requires AdvancedExecutionContext
 */
function isAdvancedNodeType(nodeType: string): boolean {
  const advancedNodeTypes = ['WeightedAdvanced', 'Conditional', 'Sequential', 'Markov']; // PythonTransform temporarily disabled
  
  // Check built-in advanced nodes
  if (advancedNodeTypes.includes(nodeType)) {
    return true;

  
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


function createRuntimeNode(
  node: Node,
  resolvedInputs: unknown[],
  executionContext: ExecutionContext
): RuntimeNode<unknown> {
  switch (node.type) {
  // Basic Epic 3 nodes
  case 'WeightedChoice':
    return new WeightedChoiceNode(node.id, node.choices);
  case 'Concat':
    return new ConcatNode(node.id, resolvedInputs as string[]);
  case 'Output': {
    // Process template if available, otherwise concatenate all inputs
    let output: string | string[];
    if (node.template && node.template.trim()) {
      const processedTemplate = processTemplateVariables(node.template, executionContext);
      // Use processed template if valid
      output = processedTemplate || resolvedInputs.join(' ');
    } else {
      // Pass all inputs to OutputNode for auto-concatenation
      output = resolvedInputs.length === 1 ? resolvedInputs[0] : resolvedInputs;
    }
    const outputNode = new OutputNode(node.id);
    outputNode.setInput(output);
    return outputNode;
  }

  case 'TextBlock':
    return new TextBlockNode(node.id, node.text || node.value || '');
  case 'Include':
    return new IncludeNode(node.id, node.name, {});
  case 'SetVariable': {
    // Process template if available, otherwise use node.value (backward compatibility)
    let value = node.value;
    if (node.template && node.template.trim()) {
      const processedTemplate = processTemplateVariables(node.template, executionContext);
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
    const config: Record<string, unknown> = { ...node.conditionalConfig };
    if (config.customFunctions) {
      // Convert non-function values to constant functions
      const funcs: Record<string, (...args: unknown[]) => unknown> = {};
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
    const extensionNode = tryCreateExtensionNode(node, resolvedInputs, executionContext);
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


/**
 * Extract random choice information for execution path tracking
 */
function extractRandomChoiceInfo(node: Node, result: unknown, resolvedInputs: unknown[]): RandomChoiceInfo | null {
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

      break;

      
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

      
    case 'Conditional': {
      const branches = (node.branches as ConditionalBranch[]) || [];
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

  
  return null;


/**
 * Try to create a runtime node from an extension
 */
function tryCreateExtensionNode(
  node: Node,
  resolvedInputs: unknown[],
  executionContext: ExecutionContext
): RuntimeNode<unknown> | null {
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


