/**
 * Quick demo of visual range indicators concept
 */

// Mock prompt analysis result
const promptAnalysis = {
  originalText: 'A weary merchant in tattered robes, carrying scrolls or books or potions',
  segments: [
    {
      text: 'A weary merchant in tattered robes,',
      startIndex: 0,
      endIndex: 35,
      suggestedNodeType: 'TextBlock',
      confidence: 0.9
    },
    {
      text: 'carrying scrolls or books or potions',
      startIndex: 36,
      endIndex: 72,
      suggestedNodeType: 'WeightedChoice',
      confidence: 0.95,
      metadata: {
        alternatives: ['carrying scrolls', 'books', 'potions']
      }
    }
  ],
  mappings: [
    {
      nodeId: 'node-1',
      startIndex: 0,
      endIndex: 35,
      highlightColor: '#FFE6E6'
    },
    {
      nodeId: 'node-2',
      startIndex: 36,
      endIndex: 72,
      highlightColor: '#E6F3FF'
    }
  ],
  nodes: [
    {
      node: { 
        id: 'node-1', 
        type: 'TextBlock',
        value: 'A weary merchant in tattered robes,'
      }
    },
    {
      node: { 
        id: 'node-2', 
        type: 'WeightedChoice',
        value: [
          { text: 'carrying scrolls', weight: 33 },
          { text: 'books', weight: 33 },
          { text: 'potions', weight: 34 }
        ]
      }
    },
    {
      node: { 
        id: 'node-3', 
        type: 'Output',
        value: null
      }
    }
  ]
};

// ANSI colors
const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  bgRed: '\x1b[41m',
  bgBlue: '\x1b[44m',
  black: '\x1b[30m',
  green: '\x1b[32m',
  cyan: '\x1b[36m'
};

console.log(`\n${COLORS.bright}${COLORS.green}Visual Range Indicator Demo${COLORS.reset}`);
console.log('='.repeat(50));

// Display original text
console.log(`\n${COLORS.bright}Original Text:${COLORS.reset}`);
console.log(`"${promptAnalysis.originalText}"`);

// Display with highlighting
console.log(`\n${COLORS.bright}Text with Visual Mapping:${COLORS.reset}`);
let coloredText = '';
let lastEnd = 0;

promptAnalysis.mappings.forEach(mapping => {
  // Add unmapped text
  if (mapping.startIndex > lastEnd) {
    coloredText += promptAnalysis.originalText.slice(lastEnd, mapping.startIndex);
  }
  
  // Add mapped text with color
  const bgColor = mapping.highlightColor === '#FFE6E6' ? COLORS.bgRed : COLORS.bgBlue;
  const text = promptAnalysis.originalText.slice(mapping.startIndex, mapping.endIndex);
  coloredText += `${bgColor}${COLORS.black}${text}${COLORS.reset}`;
  
  lastEnd = mapping.endIndex;
});

console.log(coloredText);

// Display node mappings
console.log(`\n${COLORS.bright}Generated Nodes:${COLORS.reset}`);
promptAnalysis.nodes.forEach((genNode, index) => {
  const node = genNode.node;
  const mapping = promptAnalysis.mappings.find(m => m.nodeId === node.id);
  
  console.log(`\n${index + 1}. ${COLORS.cyan}${node.type}${COLORS.reset} (${node.id})`);
  
  if (mapping) {
    const mappedText = promptAnalysis.originalText.slice(mapping.startIndex, mapping.endIndex);
    console.log(`   Maps to: "${mappedText}" [${mapping.startIndex}-${mapping.endIndex}]`);
  }
  
  if (node.type === 'TextBlock') {
    console.log(`   Content: "${node.value}"`);
  } else if (node.type === 'WeightedChoice') {
    console.log(`   Options:`);
    node.value.forEach(opt => {
      console.log(`   • ${opt.text} (${opt.weight}%)`);
    });
  } else if (node.type === 'Output') {
    console.log(`   Status: Locked (end node)`);
  }
});

// Simulate hover interaction
console.log(`\n${COLORS.bright}Hover Simulation:${COLORS.reset}`);
console.log('When hovering over "carrying scrolls or books or potions":');
console.log('• The text highlights in blue');
console.log('• The WeightedChoice node highlights');
console.log('• A connection line appears between them');

console.log(`\n${COLORS.bright}Key Features:${COLORS.reset}`);
console.log('✅ Color-coded text segments');
console.log('✅ Hover highlighting');
console.log('✅ Visual connection lines');
console.log('✅ Character range tracking');
console.log('✅ Bi-directional hover (text ↔ node)');

console.log('\n✨ Demo complete!\n');