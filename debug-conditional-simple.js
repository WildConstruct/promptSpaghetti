// Import the conditional node and test it directly
const { ConditionalNode } = require('./packages/core/runtime/nodes/Conditional.ts');
const { AdvancedExecutionUtils } = require('./packages/core/runtime/advanced.ts');

console.log('Creating conditional node...');

const branches = [
  { condition: 'score > 90', output: 'excellent' },
  { condition: 'score > 70', output: 'good' },
  { condition: 'score > 50', output: 'average' }
];

const node = new ConditionalNode('test', branches, 'poor');

const context = AdvancedExecutionUtils.enhanceContext({
  variables: { score: 85 },
  seed: 12345
});

console.log('Context variables:', context.variables);
console.log('Running node...');

try {
  const result = node.run(context);
  console.log('Result:', result);
} catch (error) {
  console.error('Error:', error);
}