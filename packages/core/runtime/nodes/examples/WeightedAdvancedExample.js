"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.demonstrateWeightedAdvanced = demonstrateWeightedAdvanced;
const WeightedAdvanced_1 = require("../WeightedAdvanced");
const advanced_1 = require("../../advanced");
function demonstrateWeightedAdvanced() {
    console.log('=== WeightedAdvanced Node Demonstration ===\n');
    console.log('1. Linear Distribution (default):');
    const choices = [
        { value: 'Common Item', weight: 50 },
        { value: 'Uncommon Item', weight: 30 },
        { value: 'Rare Item', weight: 15 },
        { value: 'Epic Item', weight: 4 },
        { value: 'Legendary Item', weight: 1 }
    ];
    const linearNode = new WeightedAdvanced_1.WeightedAdvancedNode('loot-linear', choices, WeightedAdvanced_1.DistributionPresets.linear);
    const linearResults = generateResults(linearNode, 'Linear', 1000);
    console.log(linearResults);
    console.log('\n2. Exponential Distribution (factor=2):');
    const expNode = new WeightedAdvanced_1.WeightedAdvancedNode('loot-exp', choices, WeightedAdvanced_1.DistributionPresets.exponential);
    const expResults = generateResults(expNode, 'Exponential', 1000);
    console.log(expResults);
    console.log('\n3. Gaussian Distribution (mean=0.5, std=0.2):');
    const gaussianNode = new WeightedAdvanced_1.WeightedAdvancedNode('loot-gaussian', choices, WeightedAdvanced_1.DistributionPresets.gaussian);
    const gaussianResults = generateResults(gaussianNode, 'Gaussian', 1000);
    console.log(gaussianResults);
    console.log('\n4. Custom Configuration (exponential factor=3, min weight=0.5):');
    const customNode = (0, WeightedAdvanced_1.createWeightedAdvancedNode)('loot-custom', choices, {
        type: 'exponential',
        parameters: { factor: 3 },
        normalize: true,
        minWeight: 0.5
    });
    const customResults = generateResults(customNode, 'Custom', 1000);
    console.log(customResults);
    console.log('\n5. Performance & Determinism:');
    demonstratePerformanceAndDeterminism();
}
function generateResults(node, distributionName, samples) {
    const results = [];
    const startTime = performance.now();
    for (let i = 0; i < samples; i++) {
        const ctx = advanced_1.AdvancedExecutionUtils.enhanceContext({
            variables: {},
            seed: i
        });
        results.push(node.run(ctx));
    }
    const endTime = performance.now();
    const executionTime = endTime - startTime;
    const counts = results.reduce((acc, result) => {
        acc[result] = (acc[result] || 0) + 1;
        return acc;
    }, {});
    const percentages = Object.entries(counts)
        .map(([item, count]) => ({
        item,
        count,
        percentage: ((count / samples) * 100).toFixed(1)
    }))
        .sort((a, b) => b.count - a.count);
    return {
        distribution: distributionName,
        samples,
        executionTime: `${executionTime.toFixed(2)}ms`,
        results: percentages,
        validation: node.validate()
    };
}
function demonstratePerformanceAndDeterminism() {
    const choices = [
        { value: 'Fast', weight: 3 },
        { value: 'Medium', weight: 2 },
        { value: 'Slow', weight: 1 }
    ];
    const node = (0, WeightedAdvanced_1.createWeightedAdvancedNode)('perf-test', choices);
    console.log('  Determinism Test (same seed should produce same result):');
    const seed = 42;
    const results = [];
    for (let i = 0; i < 5; i++) {
        const ctx = advanced_1.AdvancedExecutionUtils.enhanceContext({
            variables: {},
            seed
        });
        results.push(node.run(ctx));
    }
    console.log(`    Seed ${seed}: [${results.join(', ')}]`);
    console.log(`    All same: ${results.every(r => r === results[0])}`);
    console.log('\n  Performance Test (1000 executions):');
    const startTime = performance.now();
    for (let i = 0; i < 1000; i++) {
        const ctx = advanced_1.AdvancedExecutionUtils.enhanceContext({
            variables: {},
            seed: i
        });
        node.run(ctx);
    }
    const endTime = performance.now();
    const avgTime = (endTime - startTime) / 1000;
    console.log(`    Average execution time: ${avgTime.toFixed(4)}ms per call`);
    console.log(`    Total time: ${(endTime - startTime).toFixed(2)}ms`);
    console.log('\n  Validation Test:');
    const validation = node.validate();
    console.log(`    Valid: ${validation.valid}`);
    console.log(`    Errors: ${validation.errors.length}`);
    console.log(`    Warnings: ${validation.warnings.length}`);
}
if (require.main === module) {
    demonstrateWeightedAdvanced();
}
//# sourceMappingURL=WeightedAdvancedExample.js.map