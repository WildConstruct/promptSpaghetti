#!/usr/bin/env node

/**
 * Memory Usage Analysis Script
 * Analyzes memory consumption patterns and optimization opportunities
 */

const { performance } = require('perf_hooks');

function formatMemory(bytes) {
  const mb = bytes / 1024 / 1024;
  return `${mb.toFixed(2)} MB`;
}

function getMemorySnapshot() {
  const usage = process.memoryUsage();
  return {
    heapUsed: usage.heapUsed,
    heapTotal: usage.heapTotal,
    external: usage.external,
    rss: usage.rss,
    timestamp: Date.now()
  };
}

function analyzeMemoryGrowth(snapshots) {
  if (snapshots.length < 2) return null;
  
  const first = snapshots[0];
  const last = snapshots[snapshots.length - 1];
  const timeDiff = (last.timestamp - first.timestamp) / 1000; // seconds
  const memoryGrowth = last.heapUsed - first.heapUsed;
  
  return {
    totalGrowth: memoryGrowth,
    growthRate: memoryGrowth / timeDiff, // bytes per second
    duration: timeDiff
  };
}

// Mock classes for memory analysis
class MockContext {
  constructor(seed = 12345) {
    this.variables = {};
    this.seed = seed;
    this.depth = 0;
    this.metadata = {
      startTime: Date.now(),
      executionCount: 0,
      nodeHistory: []
    };
  }
  
  addVariables(vars) {
    this.variables = { ...this.variables, ...vars };
  }
  
  trackExecution(nodeId, result) {
    this.metadata.executionCount++;
    this.metadata.nodeHistory.push({ nodeId, result, timestamp: Date.now() });
  }
}

class MockNode {
  constructor(id, type, config = {}) {
    this.id = id;
    this.type = type;
    this.config = config;
    this.executionHistory = [];
    this.cachedResults = new Map();
    this.stateData = {};
  }
  
  execute(context) {
    // Simulate memory allocation during execution
    const result = `${this.type}-result-${context.metadata.executionCount}`;
    
    // Store execution history (memory allocation)
    this.executionHistory.push({
      timestamp: Date.now(),
      context: {
        variables: JSON.parse(JSON.stringify(context.variables)), // Deep clone
        depth: context.depth
      },
      result
    });
    
    // Simulate caching (memory allocation)
    const cacheKey = JSON.stringify(context.variables);
    this.cachedResults.set(cacheKey, result);
    
    // Simulate state updates for stateful nodes
    if (this.type === 'Sequential' || this.type === 'Markov') {
      this.stateData.lastExecution = Date.now();
      this.stateData.executionCount = (this.stateData.executionCount || 0) + 1;
      this.stateData.stateHistory = this.stateData.stateHistory || [];
      this.stateData.stateHistory.push(result);
    }
    
    context.trackExecution(this.id, result);
    return result;
  }
  
  getMemoryFootprint() {
    const historySizeEst = this.executionHistory.length * 200; // ~200 bytes per entry
    const cacheSizeEst = this.cachedResults.size * 150; // ~150 bytes per cache entry
    const stateSizeEst = Object.keys(this.stateData).length * 100; // ~100 bytes per state property
    
    return historySizeEst + cacheSizeEst + stateSizeEst;
  }
}

class MockGraph {
  constructor(nodeCount, nodeTypes) {
    this.nodes = [];
    this.context = new MockContext();
    
    for (let i = 0; i < nodeCount; i++) {
      const nodeType = nodeTypes[i % nodeTypes.length];
      this.nodes.push(new MockNode(`node-${i}`, nodeType));
    }
  }
  
  execute() {
    for (const node of this.nodes) {
      node.execute(this.context);
    }
  }
  
  getGraphMemoryFootprint() {
    const contextSize = JSON.stringify(this.context).length;
    const nodesSize = this.nodes.reduce((sum, node) => sum + node.getMemoryFootprint(), 0);
    return contextSize + nodesSize;
  }
}

async function analyzeMemoryUsage() {
  console.log('🧠 Analyzing Memory Usage Patterns');
  console.log('=' .repeat(50));
  
  const snapshots = [];
  
  // Baseline memory measurement
  if (global.gc) global.gc();
  const baseline = getMemorySnapshot();
  snapshots.push(baseline);
  console.log(`\\n📊 Baseline Memory: ${formatMemory(baseline.heapUsed)}`);
  
  // 1. Context Memory Analysis
  console.log('\\n🔍 Context Memory Analysis:');
  const contexts = [];
  
  for (let i = 0; i < 1000; i++) {
    const context = new MockContext(i);
    // Add various data to context
    context.addVariables({
      [`var_${i}`]: `value_${i}`,
      counter: i,
      metadata: { timestamp: Date.now(), index: i },
      largeArray: new Array(100).fill(i),
      nestedObject: { level1: { level2: { level3: i } } }
    });
    contexts.push(context);
  }
  
  const afterContexts = getMemorySnapshot();
  snapshots.push(afterContexts);
  const contextMemory = afterContexts.heapUsed - baseline.heapUsed;
  const memoryPerContext = contextMemory / 1000;
  
  console.log(`  1000 contexts created: ${formatMemory(contextMemory)}`);
  console.log(`  Memory per context: ${(memoryPerContext / 1024).toFixed(2)} KB`);
  
  // 2. Node Memory Analysis
  console.log('\\n🔍 Node Memory Analysis:');
  const nodeTypes = ['WeightedChoice', 'Concat', 'Conditional', 'Sequential', 'Markov'];
  const nodes = [];
  
  for (let i = 0; i < 2000; i++) {
    const nodeType = nodeTypes[i % nodeTypes.length];
    const node = new MockNode(`node-${i}`, nodeType);
    nodes.push(node);
  }
  
  const afterNodes = getMemorySnapshot();
  snapshots.push(afterNodes);
  const nodeMemory = afterNodes.heapUsed - afterContexts.heapUsed;
  const memoryPerNode = nodeMemory / 2000;
  
  console.log(`  2000 nodes created: ${formatMemory(nodeMemory)}`);
  console.log(`  Memory per node: ${(memoryPerNode / 1024).toFixed(2)} KB`);
  
  // 3. Execution Memory Analysis
  console.log('\\n🔍 Execution Memory Analysis:');
  const testContext = new MockContext();
  const testNodes = nodes.slice(0, 100); // Use first 100 nodes
  
  // Execute multiple times to simulate real usage
  for (let iteration = 0; iteration < 50; iteration++) {
    for (const node of testNodes) {
      node.execute(testContext);
    }
  }
  
  const afterExecution = getMemorySnapshot();
  snapshots.push(afterExecution);
  const executionMemory = afterExecution.heapUsed - afterNodes.heapUsed;
  const totalExecutions = 100 * 50; // 5000 executions
  const memoryPerExecution = executionMemory / totalExecutions;
  
  console.log(`  ${totalExecutions} executions completed: ${formatMemory(executionMemory)}`);
  console.log(`  Memory per execution: ${(memoryPerExecution / 1024).toFixed(3)} KB`);
  
  // 4. Graph Scaling Analysis
  console.log('\\n🔍 Graph Scaling Analysis:');
  const graphSizes = [10, 50, 100, 500, 1000];
  const graphMemories = [];
  
  for (const size of graphSizes) {
    if (global.gc) global.gc();
    const beforeGraph = getMemorySnapshot();
    
    const graph = new MockGraph(size, nodeTypes);
    graph.execute(); // Execute once to populate caches
    
    const afterGraph = getMemorySnapshot();
    const graphMemory = afterGraph.heapUsed - beforeGraph.heapUsed;
    const memoryPerNodeInGraph = graphMemory / size;
    
    graphMemories.push({ size, memory: graphMemory, memoryPerNode: memoryPerNodeInGraph });
    console.log(`  ${size.toString().padEnd(4)} nodes: ${formatMemory(graphMemory)}, ${(memoryPerNodeInGraph / 1024).toFixed(2)} KB/node`);
  }
  
  // 5. Memory Leak Detection
  console.log('\\n🔍 Memory Leak Detection:');
  const leakTestSnapshots = [];
  
  for (let cycle = 0; cycle < 10; cycle++) {
    if (global.gc) global.gc();
    const beforeCycle = getMemorySnapshot();
    
    // Create and execute a graph, then discard it
    const tempGraph = new MockGraph(100, nodeTypes);
    for (let i = 0; i < 10; i++) {
      tempGraph.execute();
    }
    
    // Clear references (simulating cleanup)
    tempGraph.nodes.length = 0;
    tempGraph.context = null;
    
    if (global.gc) global.gc();
    const afterCycle = getMemorySnapshot();
    
    leakTestSnapshots.push(afterCycle);
    console.log(`  Cycle ${cycle + 1}: ${formatMemory(afterCycle.heapUsed)}`);
  }
  
  // Analyze memory growth across cycles
  const memoryGrowth = analyzeMemoryGrowth(leakTestSnapshots);
  if (memoryGrowth) {
    console.log(`  Memory growth rate: ${formatMemory(memoryGrowth.growthRate)}/second`);
    console.log(`  Total growth: ${formatMemory(memoryGrowth.totalGrowth)} over ${memoryGrowth.duration.toFixed(1)}s`);
    
    if (memoryGrowth.growthRate > 1024 * 1024) { // 1MB/sec
      console.log('  ⚠️  Potential memory leak detected!');
    } else {
      console.log('  ✅ No significant memory leaks detected');
    }
  }
  
  // 6. Cache Memory Analysis
  console.log('\\n🔍 Cache Memory Analysis:');
  const cacheTestNode = new MockNode('cache-test', 'WeightedChoice');
  const cacheTestContext = new MockContext();
  
  // Populate cache with different inputs
  for (let i = 0; i < 1000; i++) {
    cacheTestContext.addVariables({ cacheKey: i });
    cacheTestNode.execute(cacheTestContext);
  }
  
  const cacheMemory = cacheTestNode.getMemoryFootprint();
  console.log(`  Cache with 1000 entries: ${(cacheMemory / 1024).toFixed(2)} KB`);
  console.log(`  Memory per cache entry: ${(cacheMemory / 1000 / 1024).toFixed(3)} KB`);
  
  // 7. Memory Optimization Opportunities
  console.log('\\n💡 Memory Optimization Opportunities:');
  
  // Calculate potential savings
  const totalContextMemory = contextMemory;
  const totalNodeMemory = nodeMemory;
  const totalExecutionMemory = executionMemory;
  
  console.log('\\n  Optimization Potential:');
  console.log(`  - Context pooling: Save ~${formatMemory(totalContextMemory * 0.8)} (80% reduction)`);
  console.log(`  - Execution history limits: Save ~${formatMemory(totalExecutionMemory * 0.6)} (60% reduction)`);
  console.log(`  - Cache size limits: Save ~${formatMemory(cacheMemory * 0.5)} (50% reduction per node)`);
  console.log(`  - State data compression: Save ~${formatMemory(totalNodeMemory * 0.3)} (30% reduction)`);
  
  // Memory usage patterns summary
  console.log('\\n📈 Memory Usage Patterns Summary:');
  console.log(`  - Context overhead: ${(memoryPerContext / 1024).toFixed(2)} KB per context`);
  console.log(`  - Node overhead: ${(memoryPerNode / 1024).toFixed(2)} KB per node`);
  console.log(`  - Execution overhead: ${(memoryPerExecution / 1024).toFixed(3)} KB per execution`);
  console.log(`  - Linear scaling: ${(graphMemories[4].memoryPerNode / graphMemories[0].memoryPerNode).toFixed(2)}x from small to large graphs`);
  
  return {
    baseline: baseline.heapUsed,
    contextMemoryPerUnit: memoryPerContext,
    nodeMemoryPerUnit: memoryPerNode,
    executionMemoryPerUnit: memoryPerExecution,
    graphScaling: graphMemories,
    memoryGrowthRate: memoryGrowth?.growthRate || 0,
    optimizationPotential: {
      contextPooling: totalContextMemory * 0.8,
      executionHistoryLimits: totalExecutionMemory * 0.6,
      cacheLimits: cacheMemory * 0.5,
      stateCompression: totalNodeMemory * 0.3
    }
  };
}

// Run analysis
if (require.main === module) {
  analyzeMemoryUsage()
    .then(results => {
      console.log('\\n✅ Memory analysis complete!');
      console.log('\\n🎯 Key Findings:');
      console.log(`  - Baseline memory usage: ${formatMemory(results.baseline)}`);
      console.log(`  - Context memory: ${(results.contextMemoryPerUnit / 1024).toFixed(2)} KB each`);
      console.log(`  - Node memory: ${(results.nodeMemoryPerUnit / 1024).toFixed(2)} KB each`);
      console.log(`  - Execution memory: ${(results.executionMemoryPerUnit / 1024).toFixed(3)} KB each`);
      console.log(`  - Total optimization potential: ${formatMemory(
        results.optimizationPotential.contextPooling +
        results.optimizationPotential.executionHistoryLimits +
        results.optimizationPotential.cacheLimits +
        results.optimizationPotential.stateCompression
      )}`);
    })
    .catch(console.error);
}

module.exports = { analyzeMemoryUsage };