/**
 * Execution Path Tracker
 * Epic 8.5: Real-Time Multi-Seed Preview - Task 2: Execution Path Visualization
 *
 * Tracks the execution path of graph processing for visualization
 */
import { EXECUTION_PATH_COLORS } from '../types/ExecutionPath.js';
export class GraphExecutionTracker {
  constructor() {
    this.activeExecutions = new Map();
    this.executionCounter = 0;
  }
  static getInstance() {
    if (!GraphExecutionTracker.instance) {
      GraphExecutionTracker.instance = new GraphExecutionTracker();
    }
    return GraphExecutionTracker.instance;
  }
  /**
   * Start tracking a new execution
   */
  startTracking(seed) {
    const executionId = `exec_${seed}_${this.executionCounter++}_${Date.now()}`;
    const execution = {
      id: executionId,
      seed,
      startTime: Date.now(),
      steps: [],
      nodeExecutionOrder: [],
      randomizationPoints: [],
    };
    this.activeExecutions.set(executionId, execution);
    return executionId;
  }
  /**
   * Record a node execution step
   */
  recordNodeExecution(executionId, step) {
    const execution = this.activeExecutions.get(executionId);
    if (!execution) {
      console.warn(`Execution ${executionId} not found for node recording`);
      return;
    }
    execution.steps = execution.steps || [];
    execution.nodeExecutionOrder = execution.nodeExecutionOrder || [];
    // Add step to execution path
    execution.steps.push({
      ...step,
      stepIndex: execution.steps.length,
    });
    // Track node execution order
    if (!execution.nodeExecutionOrder.includes(step.nodeId)) {
      execution.nodeExecutionOrder.push(step.nodeId);
    }
  }
  /**
   * Record a random choice made during execution
   */
  recordRandomChoice(executionId, choice) {
    const execution = this.activeExecutions.get(executionId);
    if (!execution) {
      console.warn(`Execution ${executionId} not found for random choice recording`);
      return;
    }
    execution.randomizationPoints = execution.randomizationPoints || [];
    execution.randomizationPoints.push(choice);
    // Also add this info to the current step if it exists
    const currentStep = execution.steps?.[execution.steps.length - 1];
    if (currentStep) {
      currentStep.randomChoice = choice;
    }
  }
  /**
   * Finish tracking and return complete execution path
   */
  finishTracking(executionId, output) {
    const execution = this.activeExecutions.get(executionId);
    if (!execution) {
      throw new Error(`Execution ${executionId} not found`);
    }
    const endTime = Date.now();
    const completePath = {
      id: executionId,
      seed: execution.seed,
      startTime: execution.startTime,
      endTime,
      totalExecutionTime: endTime - execution.startTime,
      steps: execution.steps || [],
      finalOutput: output,
      nodeExecutionOrder: execution.nodeExecutionOrder || [],
      randomizationPoints: execution.randomizationPoints || [],
    };
    // Clean up
    this.activeExecutions.delete(executionId);
    return completePath;
  }
  /**
   * Get current execution path (for debugging)
   */
  getExecutionPath(executionId) {
    const execution = this.activeExecutions.get(executionId);
    if (!execution) {return null;}
    return {
      id: executionId,
      seed: execution.seed,
      startTime: execution.startTime,
      endTime: Date.now(),
      totalExecutionTime: Date.now() - execution.startTime,
      steps: execution.steps || [],
      finalOutput: '',
      nodeExecutionOrder: execution.nodeExecutionOrder || [],
      randomizationPoints: execution.randomizationPoints || [],
    };
  }
  /**
   * Clear tracking data
   */
  clearTracker(executionId) {
    this.activeExecutions.delete(executionId);
  }
  /**
   * Clear all tracking data (cleanup)
   */
  clearAllTrackers() {
    this.activeExecutions.clear();
  }
  /**
   * Get statistics about active executions
   */
  getTrackingStats() {
    return {
      activeExecutions: this.activeExecutions.size,
      totalExecutionsTracked: this.executionCounter,
    };
  }
}
/**
 * Utility functions for execution path analysis
 */
export class ExecutionPathAnalyzer {
  /**
   * Calculate execution path variance across multiple results
   */
  static calculatePathVariance(paths) {
    if (paths.length <= 1) {return 0;}
    const nodeUsageCounts = new Map();
    const totalPaths = paths.length;
    // Count how often each node is used
    paths.forEach(path => {
      path.nodeExecutionOrder.forEach(nodeId => {
        nodeUsageCounts.set(nodeId, (nodeUsageCounts.get(nodeId) || 0) + 1);
      });
    });
    // Calculate variance based on node usage diversity
    let totalVariance = 0;
    nodeUsageCounts.forEach(count => {
      const probability = count / totalPaths;
      totalVariance += probability * (1 - probability);
    });
    return totalVariance / nodeUsageCounts.size;
  }
  /**
   * Find common execution patterns
   */
  static findCommonPatterns(paths) {
    if (paths.length === 0) {
      return { commonNodes: [], divergencePoints: [], sharedSequences: [] };
    }
    const nodeFrequency = new Map();
    const sequences = new Map();
    // Count node frequencies
    paths.forEach(path => {
      path.nodeExecutionOrder.forEach(nodeId => {
        nodeFrequency.set(nodeId, (nodeFrequency.get(nodeId) || 0) + 1);
      });
      // Track sequential patterns
      for (let i = 0; i < path.nodeExecutionOrder.length - 1; i++) {
        const sequence = `${path.nodeExecutionOrder[i]}->${path.nodeExecutionOrder[i + 1]}`;
        sequences.set(sequence, (sequences.get(sequence) || 0) + 1);
      }
    });
    const totalPaths = paths.length;
    // Common nodes (appear in >50% of paths)
    const commonNodes = Array.from(nodeFrequency.entries())
      .filter(([_, count]) => count > totalPaths * 0.5)
      .map(([nodeId, _]) => nodeId);
    // Divergence points (nodes with high randomization)
    const divergencePoints = Array.from(nodeFrequency.entries())
      .filter(([_, count]) => count < totalPaths * 0.8 && count > totalPaths * 0.2)
      .map(([nodeId, _]) => nodeId);
    // Shared sequences (appear in >30% of paths)
    const sharedSequences = Array.from(sequences.entries())
      .filter(([_, count]) => count > totalPaths * 0.3)
      .map(([sequence, _]) => sequence.split('->'));
    return { commonNodes, divergencePoints, sharedSequences };
  }
  /**
   * Assign colors to execution paths
   */
  static assignPathColors(paths) {
    const colorMap = new Map();
    paths.forEach((path, index) => {
      const colorIndex = index % EXECUTION_PATH_COLORS.length;
      colorMap.set(path.id, EXECUTION_PATH_COLORS[colorIndex]);
    });
    return colorMap;
  }
  /**
   * Generate debugging information for an execution path
   */
  static generateDebugInfo(path) {
    const performanceBreakdown = {};
    const nodeExecutionTimes = {};
    // Calculate performance breakdown by node type
    path.steps.forEach(step => {
      performanceBreakdown[step.nodeType] = (performanceBreakdown[step.nodeType] || 0) + step.executionTimeMs;
      nodeExecutionTimes[step.nodeId] = (nodeExecutionTimes[step.nodeId] || 0) + step.executionTimeMs;
    });
    // Find bottleneck nodes (top 20% execution time)
    const sortedNodes = Object.entries(nodeExecutionTimes).sort(([, timeA], [, timeB]) => timeB - timeA);
    const bottleneckCount = Math.max(1, Math.ceil(sortedNodes.length * 0.2));
    const bottleneckNodes = sortedNodes.slice(0, bottleneckCount).map(([nodeId]) => nodeId);
    // Generate randomization summary
    const randomChoices = path.randomizationPoints;
    const randomizationSummary =
      randomChoices.length === 0
        ? 'No randomization points detected'
        : `${randomChoices.length} randomization point(s): ${randomChoices.map(c => c.choiceType).join(', ')}`;
    return {
      performanceBreakdown,
      bottleneckNodes,
      randomizationSummary,
    };
  }
}
export default GraphExecutionTracker;
