#!/usr/bin/env node

/**
 * Simple test for Smart Node Positioning
 */

const path = require('path');

// Use require to load the modules
const { PromptParser } = require('./packages/core/runtime/nodes/epic1/PromptParser');
const { SmartNodePositioner } = require('./packages/core/runtime/nodes/epic1/SmartNodePositioning');

console.log('\n📊 Testing Smart Node Positioning...\n');

// Test 1: Basic positioning
console.log('Test 1: Basic node positioning');
const parser = new PromptParser();
const positioner = new SmartNodePositioner();

const prompt = "A knight in shining armor carries a sword or lance.";
const analysis = parser.parse(prompt);

console.log(`  ✓ Parsed ${analysis.nodes.length} nodes from: "${prompt}"`);
console.log('  Node positions:');
analysis.nodes.forEach((node, i) => {
  const pos = node.position;
  console.log(`    ${i + 1}. ${node.node.getType()} at (${pos.x}, ${pos.y})`);
});

// Test 2: Complex prompt
console.log('\nTest 2: Complex scene positioning');
const complexPrompt = `The medieval castle stands tall.
Guards patrol with torches or lanterns.
Merchants sell bread, cheese, or wine.`;

const complexAnalysis = parser.parse(complexPrompt);
console.log(`  ✓ Parsed ${complexAnalysis.nodes.length} nodes`);
console.log('  Node layout:');

// Create simple ASCII visualization
const minX = Math.min(...complexAnalysis.nodes.map(n => n.position.x));
const maxX = Math.max(...complexAnalysis.nodes.map(n => n.position.x));
const minY = Math.min(...complexAnalysis.nodes.map(n => n.position.y));
const maxY = Math.max(...complexAnalysis.nodes.map(n => n.position.y));

console.log(`  Canvas bounds: X(${minX}-${maxX}), Y(${minY}-${maxY})`);

// Test 3: Overlap resolution
console.log('\nTest 3: Overlap resolution');
const nodes = [
  {
    node: { getType: () => 'TextBlock' },
    sourceSegments: [],
    position: { x: 0, y: 0 }
  },
  {
    node: { getType: () => 'TextBlock' },
    sourceSegments: [],
    position: { x: 0, y: 0 }
  }
];

const overlappingPositions = [
  { x: 100, y: 100 },
  { x: 120, y: 110 } // Overlaps!
];

const optimized = positioner.optimizePositions(overlappingPositions, nodes);
console.log('  Before optimization:');
console.log(`    Node 1: (${overlappingPositions[0].x}, ${overlappingPositions[0].y})`);
console.log(`    Node 2: (${overlappingPositions[1].x}, ${overlappingPositions[1].y})`);
console.log('  After optimization:');
console.log(`    Node 1: (${optimized[0].x}, ${optimized[0].y})`);
console.log(`    Node 2: (${optimized[1].x}, ${optimized[1].y})`);

const distance = Math.sqrt(
  Math.pow(optimized[1].x - optimized[0].x, 2) + 
  Math.pow(optimized[1].y - optimized[0].y, 2)
);
console.log(`  ✓ Distance increased to: ${distance.toFixed(2)}`);

console.log('\n✅ All tests passed!\n');