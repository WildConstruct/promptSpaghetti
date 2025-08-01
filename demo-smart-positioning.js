#!/usr/bin/env node

/**
 * Demo: Smart Node Positioning for Epic 1
 * 
 * Shows how the intelligent positioning algorithm places nodes
 * to minimize overlaps and create natural flow.
 */

const { PromptParser } = require('./packages/core/runtime/nodes/epic1/PromptParser');
const chalk = require('chalk');

// Test prompts
const testPrompts = [
  {
    name: "Simple narrative",
    prompt: "A weary merchant walks through the marketplace."
  },
  {
    name: "List with choices",
    prompt: "The knight carries a sword, shield, or lance, wearing shining armor."
  },
  {
    name: "Complex scene",
    prompt: "In the ancient castle courtyard, guards patrol with torches or lanterns, while merchants sell bread, cheese, or wine, and nobles discuss politics or warfare."
  },
  {
    name: "Multi-line description",
    prompt: `The medieval village awakens at dawn.
Farmers head to the fields with plows or scythes.
Blacksmiths fire up their forges.
Children play with sticks or hoops in the square.`
  }
];

console.log(chalk.cyan.bold('\n🎯 Smart Node Positioning Demo\n'));

const parser = new PromptParser();

testPrompts.forEach((test, index) => {
  console.log(chalk.yellow(`\n${index + 1}. ${test.name}:`));
  console.log(chalk.gray(`   "${test.prompt}"\n`));
  
  try {
    const analysis = parser.parse(test.prompt);
    
    console.log(chalk.green(`   ✓ Generated ${analysis.nodes.length} nodes`));
    
    // Create ASCII visualization of node positions
    const canvas = createAsciiCanvas(analysis.nodes);
    console.log(chalk.blue('\n   Node Layout:'));
    console.log(canvas);
    
    // Show node details
    console.log(chalk.magenta('\n   Node Details:'));
    analysis.nodes.forEach((genNode, idx) => {
      const node = genNode.node;
      const pos = genNode.position;
      const type = node.getType();
      const content = getNodeContent(node);
      
      console.log(chalk.white(`     ${idx + 1}. ${type} at (${pos.x}, ${pos.y})`));
      console.log(chalk.gray(`        "${content}"`));
    });
    
    // Show grouping information
    const groups = identifyGroups(analysis.nodes);
    if (groups.length > 1) {
      console.log(chalk.cyan('\n   Node Groups:'));
      groups.forEach((group, idx) => {
        console.log(chalk.white(`     Group ${idx + 1}: Nodes ${group.join(', ')}`));
      });
    }
    
  } catch (error) {
    console.log(chalk.red(`   ✗ Error: ${error.message}`));
  }
});

console.log(chalk.cyan.bold('\n✨ Smart Positioning Features:\n'));
console.log(chalk.white('  • Diagonal flow for natural reading'));
console.log(chalk.white('  • Related nodes grouped together'));
console.log(chalk.white('  • Minimized overlaps'));
console.log(chalk.white('  • Output node at bottom-right'));
console.log(chalk.white('  • Responsive to canvas width'));

console.log(chalk.gray('\n  (Run with different prompts to see various layouts)\n'));

// Helper functions

function createAsciiCanvas(nodes) {
  if (nodes.length === 0) return '     (empty)';
  
  // Find bounds
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  
  nodes.forEach(genNode => {
    const pos = genNode.position;
    minX = Math.min(minX, pos.x);
    maxX = Math.max(maxX, pos.x);
    minY = Math.min(minY, pos.y);
    maxY = Math.max(maxY, pos.y);
  });
  
  // Scale to fit in terminal
  const scaleX = 60 / (maxX - minX || 1);
  const scaleY = 20 / (maxY - minY || 1);
  
  // Create grid
  const grid = Array(22).fill(null).map(() => Array(62).fill(' '));
  
  // Place nodes
  nodes.forEach((genNode, idx) => {
    const pos = genNode.position;
    const x = Math.round((pos.x - minX) * scaleX) + 1;
    const y = Math.round((pos.y - minY) * scaleY) + 1;
    
    if (x >= 0 && x < 62 && y >= 0 && y < 22) {
      const symbol = getNodeSymbol(genNode.node);
      grid[y][x] = symbol;
      
      // Add index if space allows
      if (x + 1 < 62) {
        grid[y][x + 1] = String(idx + 1)[0];
      }
    }
  });
  
  // Add border
  const border = '     ' + '─'.repeat(62);
  const rows = grid.map(row => '     │' + row.join('') + '│');
  
  return [border, ...rows, border].join('\n');
}

function getNodeSymbol(node) {
  const type = node.getType();
  switch (type) {
    case 'TextBlock': return '◼';
    case 'WeightedChoice': return '◆';
    case 'Concat': return '⬟';
    case 'Variable': return '◯';
    case 'Output': return '◎';
    default: return '•';
  }
}

function getNodeContent(node) {
  const data = node.serialize();
  
  switch (data.type) {
    case 'TextBlock':
      return data.data.text || '(empty)';
    case 'WeightedChoice':
      return data.data.options.map(opt => opt.text).join(' | ');
    case 'Concat':
      return `[${data.data.separator || ' '}]`;
    case 'Variable':
      return data.data.name || '{{var}}';
    case 'Output':
      return '(output)';
    default:
      return '(unknown)';
  }
}

function identifyGroups(nodes) {
  const groups = [];
  const visited = new Set();
  
  nodes.forEach((genNode, idx) => {
    if (visited.has(idx)) return;
    
    const group = [idx];
    visited.add(idx);
    
    // Find nodes close to this one
    nodes.forEach((otherNode, otherIdx) => {
      if (otherIdx === idx || visited.has(otherIdx)) return;
      
      const dist = calculateDistance(genNode.position, otherNode.position);
      if (dist < 150) { // Threshold for grouping
        group.push(otherIdx);
        visited.add(otherIdx);
      }
    });
    
    if (group.length > 1 || groups.length === 0) {
      groups.push(group);
    }
  });
  
  return groups;
}

function calculateDistance(pos1, pos2) {
  return Math.sqrt(
    Math.pow(pos2.x - pos1.x, 2) + 
    Math.pow(pos2.y - pos1.y, 2)
  );
}