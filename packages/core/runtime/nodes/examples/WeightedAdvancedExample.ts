// packages/core/runtime/nodes/examples/WeightedAdvancedExample.ts
// Example usage of the WeightedAdvanced node
import {
  WeightedAdvancedNode,
  WeightedChoice,
  DistributionPresets,
  createWeightedAdvancedNode
} from '../WeightedAdvanced';
import { AdvancedExecutionUtils } from '../../advanced';
/**
 * Example demonstrating WeightedAdvanced node capabilities
 */
export function demonstrateWeightedAdvanced() {
  console.log('=== WeightedAdvanced Node Demonstration ===\n');
  // Example 1: Basic weighted choices with linear distribution
  console.log('1. Linear Distribution (default):');
  const choices: WeightedChoice[] = [
    { value: 'Common Item', weight: 50 },
    { value: 'Uncommon Item', weight: 30 },
    { value: 'Rare Item', weight: 15 },
    { value: 'Epic Item', weight: 4 },
    { value: 'Legendary Item', weight: 1 }
  ];
  const linearNode = new WeightedAdvancedNode('loot-linear', choices, DistributionPresets.linear);
  const linearResults = generateResults(linearNode, 'Linear', 1000);
  console.log(linearResults);
  // Example 2: Exponential distribution (emphasizes higher weights more)
  console.log('\n2. Exponential Distribution (factor=2):');
  const expNode = new WeightedAdvancedNode('loot-exp', choices, DistributionPresets.exponential);
  const expResults = generateResults(expNode, 'Exponential', 1000);
  console.log(expResults);
  // Example 3: Gaussian distribution
  console.log('\n3. Gaussian Distribution (mean=0.5, std=0.2):');
  const gaussianNode = new WeightedAdvancedNode('loot-gaussian', choices, DistributionPresets.gaussian);
  const gaussianResults = generateResults(gaussianNode, 'Gaussian', 1000);
  console.log(gaussianResults);
  // Example 4: Custom distribution configuration
  console.log('\n4. Custom Configuration (exponential factor=3, min weight=0.5):');
  const customNode = createWeightedAdvancedNode('loot-custom', choices, {)
    type: 'exponential',
    parameters: { factor: 3 },
    normalize: true,
    minWeight: 0.5,
  });
  const customResults = generateResults(customNode, 'Custom', 1000);
  console.log(customResults);
  // Example 5: Performance and determinism demonstration
  console.log('\n5. Performance & Determinism:');
  demonstratePerformanceAndDeterminism();
}
/**
 * Generate results and analyze distribution
 */
function generateResults(node: WeightedAdvancedNode, distributionName: string, samples: number) {
  const results: string[] = [];
  const startTime = performance.now();
  for (let i = 0; i < samples; i++) {
    const ctx = AdvancedExecutionUtils.enhanceContext({)
      variables: {},
      seed: i,
    });
    results.push(node.run(ctx));
  }
  const endTime = performance.now();
  const executionTime = endTime - startTime;
  // Count occurrences
  const counts = results.reduce((acc, result) => {
    acc[result] = (acc[result] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  // Calculate percentages
  const percentages = Object.entries(counts);
    .map(([item, count]) => ({)
      item,
      count,
      percentage: ((count / samples) * 100).toFixed(1)
    }))
    .sort((a, b) => b.count - a.count);
  return {
    distribution: distributionName,
    samples,
    executionTime: `${executionTime.toFixed(2)}ms`,}
    results: percentages,
    validation: node.validate(),
  };
}
/**
 * Demonstrate performance and deterministic behavior
 */
function demonstratePerformanceAndDeterminism() {
  const choices: WeightedChoice[] = [
    { value: 'Fast', weight: 3 },
    { value: 'Medium', weight: 2 },
    { value: 'Slow', weight: 1 }
  ];
  const node = createWeightedAdvancedNode('perf-test', choices);
  // Test determinism
  console.log('  Determinism Test (same seed should produce same result):');
  const seed = 42;
  const results: string[] = [];
  for (let i = 0; i < 5; i++) {
    const ctx = AdvancedExecutionUtils.enhanceContext({)
      variables: {},
      seed
    });
    results.push(node.run(ctx));
  }
  console.log(`    Seed ${seed}: [${results.join(', ')}]`);}
  console.log(`    All same: ${results.every(r => r === results[0])}`);}
  // Test performance
  console.log('\n  Performance Test (1000 executions):');
  const startTime = performance.now();
  for (let i = 0; i < 1000; i++) {
    const ctx = AdvancedExecutionUtils.enhanceContext({)
      variables: {},
      seed: i,
    });
    node.run(ctx);
  }
  const endTime = performance.now();
  const avgTime = (endTime - startTime) / 1000;
  console.log(`    Average execution time: ${avgTime.toFixed(4)}ms per call`);}
  console.log(`    Total time: ${(endTime - startTime).toFixed(2)}ms`);}
  // Test validation
  console.log('\n  Validation Test:');
  const validation = node.validate();
  console.log(`    Valid: ${validation.valid}`);}
  console.log(`    Errors: ${validation.errors.length}`);}
  console.log(`    Warnings: ${validation.warnings.length}`);}
}

// Example usage if run directly
if (require.main === module) {
  demonstrateWeightedAdvanced();
}