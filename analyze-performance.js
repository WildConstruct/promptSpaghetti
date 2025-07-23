#!/usr/bin/env node

/**
 * Performance Analysis Script
 * Analyzes execution patterns across different node types
 */

const { performance } = require('perf_hooks');
const seedrandom = require('seedrandom');

// Mock node classes for analysis
class MockExecutionContext {
  constructor(seed = 12345) {
    this.variables = {};
    this.seed = seed;
    this.depth = 0;
    this.prng = seedrandom(seed);
  }
  
  random() {
    return this.prng();
  }
}

class MockBasicNode {
  constructor(id, type) {
    this.id = id;
    this.type = type;
  }
  
  async execute(context) {
    // Simulate basic node execution
    const start = performance.now();
    
    switch(this.type) {
    case 'WeightedChoice':
      // Simulate weighted random selection
      const choices = ['A', 'B', 'C'];
      const weights = [0.5, 0.3, 0.2];
      let r = context.random();
      for (let i = 0; i < choices.length; i++) {
        if (r < weights[i]) {
          return choices[i];
        }
        r -= weights[i];
      }
      return choices[choices.length - 1];
        
    case 'Concat':
      // Simulate string concatenation
      const parts = ['Hello', ' ', 'World'];
      return parts.join('');
        
    case 'Output':
      // Simulate output passthrough
      return 'output-value';
        
    case 'SetVariable':
      // Simulate variable setting with security validation
      const value = 'test-value';
      // Simulate JSON deep clone for security
      context.variables['testKey'] = JSON.parse(JSON.stringify(value));
      return;
        
    case 'GetVariable':
      // Simulate variable retrieval with validation
      return context.variables['testKey'] || 'default';
        
    default:
      return 'unknown';
    }
  }
}

class MockAdvancedNode {
  constructor(id, type) {
    this.id = id;
    this.type = type;
  }
  
  async execute(context) {
    const start = performance.now();
    
    switch(this.type) {
    case 'WeightedAdvanced':
      // Simulate advanced weighted distribution calculation
      const choices = ['choice1', 'choice2', 'choice3', 'choice4'];
      const weights = [1, 2, 3, 4];
        
      // Simulate exponential distribution calculation
      const expWeights = weights.map(w => Math.exp(w * 0.5));
      const totalWeight = expWeights.reduce((sum, w) => sum + w, 0);
      const normalizedWeights = expWeights.map(w => w / totalWeight);
        
      let r = context.random();
      for (let i = 0; i < choices.length; i++) {
        if (r < normalizedWeights[i]) {
          return choices[i];
        }
        r -= normalizedWeights[i];
      }
      return choices[choices.length - 1];
        
    case 'Conditional':
      // Simulate expression evaluation
      const condition = 'getValue("counter") > 5';
      // Simulate parsing and evaluation overhead
      const counter = context.variables.counter || 0;
      const result = counter > 5;
      return result ? 'true-branch' : 'false-branch';
        
    case 'Sequential':
      // Simulate stateful sequence processing
      const sequence = ['seq1', 'seq2', 'seq3', 'seq4'];
      const index = (context.variables.sequenceIndex || 0) % sequence.length;
      context.variables.sequenceIndex = index + 1;
      return sequence[index];
        
    case 'Markov':
      // Simulate matrix transition calculation
      const states = ['state1', 'state2', 'state3'];
      const currentState = context.variables.markovState || 'state1';
        
      // Simulate transition matrix lookup and calculation
      const transitions = {
        'state1': { 'state2': 0.7, 'state3': 0.3 },
        'state2': { 'state1': 0.4, 'state3': 0.6 },
        'state3': { 'state1': 0.5, 'state2': 0.5 }
      };
        
      const currentTransitions = transitions[currentState] || {};
      let rMarkov = context.random();
        
      for (const [nextState, probability] of Object.entries(currentTransitions)) {
        if (rMarkov < probability) {
          context.variables.markovState = nextState;
          return nextState;
        }
        rMarkov -= probability;
      }
        
      return currentState;
        
    default:
      return 'unknown-advanced';
    }
  }
}

async function measureExecutionTime(fn) {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  return {
    result,
    duration: end - start
  };
}

async function analyzeNodePerformance() {
  console.log('🔍 Analyzing Node Performance Patterns');
  console.log('=' .repeat(50));
  
  const iterations = 1000;
  const results = {};
  
  // Basic node types
  const basicNodeTypes = ['WeightedChoice', 'Concat', 'Output', 'SetVariable', 'GetVariable'];
  const advancedNodeTypes = ['WeightedAdvanced', 'Conditional', 'Sequential', 'Markov'];
  
  // Test basic nodes
  console.log('\\n📊 Basic Node Performance:');
  for (const nodeType of basicNodeTypes) {
    const node = new MockBasicNode(`test-${nodeType}`, nodeType);
    const context = new MockExecutionContext();
    const times = [];
    
    // Warmup
    for (let i = 0; i < 10; i++) {
      await node.execute(context);
    }
    
    // Measure
    for (let i = 0; i < iterations; i++) {
      const { duration } = await measureExecutionTime(() => node.execute(context));
      times.push(duration);
    }
    
    const avg = times.reduce((sum, t) => sum + t, 0) / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);
    const opsPerSec = 1000 / avg;
    
    results[nodeType] = { avg, min, max, opsPerSec };
    
    console.log(`  ${nodeType.padEnd(15)}: ${avg.toFixed(3)}ms avg, ${opsPerSec.toFixed(0)} ops/sec`);
  }
  
  // Test advanced nodes
  console.log('\\n📊 Advanced Node Performance:');
  for (const nodeType of advancedNodeTypes) {
    const node = new MockAdvancedNode(`test-${nodeType}`, nodeType);
    const context = new MockExecutionContext();
    const times = [];
    
    // Warmup
    for (let i = 0; i < 10; i++) {
      await node.execute(context);
    }
    
    // Measure
    for (let i = 0; i < iterations; i++) {
      const { duration } = await measureExecutionTime(() => node.execute(context));
      times.push(duration);
    }
    
    const avg = times.reduce((sum, t) => sum + t, 0) / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);
    const opsPerSec = 1000 / avg;
    
    results[nodeType] = { avg, min, max, opsPerSec };
    
    console.log(`  ${nodeType.padEnd(15)}: ${avg.toFixed(3)}ms avg, ${opsPerSec.toFixed(0)} ops/sec`);
  }
  
  // Memory usage analysis
  console.log('\\n💾 Memory Usage Analysis:');
  const initialMemory = process.memoryUsage().heapUsed;
  
  // Create many node instances
  const nodes = [];
  for (let i = 0; i < 1000; i++) {
    nodes.push(new MockBasicNode(`node-${i}`, 'WeightedChoice'));
    nodes.push(new MockAdvancedNode(`adv-node-${i}`, 'WeightedAdvanced'));
  }
  
  const afterCreation = process.memoryUsage().heapUsed;
  const memoryPerNode = (afterCreation - initialMemory) / 2000 / 1024; // KB per node
  
  console.log(`  Memory per node: ${memoryPerNode.toFixed(2)} KB`);
  console.log(`  Total memory for 2000 nodes: ${((afterCreation - initialMemory) / 1024 / 1024).toFixed(2)} MB`);
  
  // Graph execution simulation
  console.log('\\n🔗 Graph Execution Simulation:');
  const graphSizes = [10, 50, 100, 500];
  
  for (const graphSize of graphSizes) {
    const context = new MockExecutionContext();
    const graphNodes = [];
    
    // Create mixed graph
    for (let i = 0; i < graphSize; i++) {
      if (i % 4 === 0) {
        graphNodes.push(new MockBasicNode(`graph-${i}`, 'WeightedChoice'));
      } else if (i % 4 === 1) {
        graphNodes.push(new MockBasicNode(`graph-${i}`, 'Concat'));
      } else if (i % 4 === 2) {
        graphNodes.push(new MockAdvancedNode(`graph-${i}`, 'Conditional'));
      } else {
        graphNodes.push(new MockAdvancedNode(`graph-${i}`, 'Sequential'));
      }
    }
    
    const { duration } = await measureExecutionTime(async () => {
      for (const node of graphNodes) {
        await node.execute(context);
      }
    });
    
    const opsPerSec = (graphSize * 1000) / duration;
    console.log(`  ${graphSize.toString().padEnd(3)} nodes: ${duration.toFixed(2)}ms total, ${opsPerSec.toFixed(0)} ops/sec`);
  }
  
  // Performance bottleneck analysis
  console.log('\\n🚨 Performance Bottleneck Analysis:');
  
  // Test JSON serialization overhead (security deep clone)
  const testObject = { key: 'value', nested: { array: [1, 2, 3], flag: true } };
  const jsonTimes = [];
  for (let i = 0; i < 1000; i++) {
    const { duration } = await measureExecutionTime(() => {
      return JSON.parse(JSON.stringify(testObject));
    });
    jsonTimes.push(duration);
  }
  const avgJsonTime = jsonTimes.reduce((sum, t) => sum + t, 0) / jsonTimes.length;
  console.log(`  JSON serialization overhead: ${avgJsonTime.toFixed(3)}ms avg`);
  
  // Test context creation overhead
  const contextTimes = [];
  for (let i = 0; i < 1000; i++) {
    const { duration } = await measureExecutionTime(() => {
      return new MockExecutionContext(i);
    });
    contextTimes.push(duration);
  }
  const avgContextTime = contextTimes.reduce((sum, t) => sum + t, 0) / contextTimes.length;
  console.log(`  Context creation overhead: ${avgContextTime.toFixed(3)}ms avg`);
  
  // Test random number generation
  const rngTimes = [];
  const rng = seedrandom('test-seed');
  for (let i = 0; i < 1000; i++) {
    const { duration } = await measureExecutionTime(() => {
      return rng();
    });
    rngTimes.push(duration);
  }
  const avgRngTime = rngTimes.reduce((sum, t) => sum + t, 0) / rngTimes.length;
  console.log(`  Random number generation: ${avgRngTime.toFixed(3)}ms avg`);
  
  console.log('\\n✅ Performance analysis complete!');
  
  return results;
}

// Run analysis
if (require.main === module) {
  analyzeNodePerformance().catch(console.error);
}

module.exports = { analyzeNodePerformance };