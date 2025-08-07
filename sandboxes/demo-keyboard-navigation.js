/**
 * Simple demo of keyboard navigation concepts for Epic 1
 */

// Mock data representing nodes in edit mode
const mockNodes = [
  { id: 'node-1', type: 'TextBlock', value: 'A weary merchant in tattered robes,', position: { x: 100, y: 100 }, isEditing: true },
  { id: 'node-2', type: 'WeightedChoice', value: [
    { text: 'carrying scrolls', weight: 33 },
    { text: 'books', weight: 33 },
    { text: 'potions', weight: 34 }
  ], position: { x: 350, y: 100 }, isEditing: true },
  { id: 'node-3', type: 'Output', value: null, position: { x: 600, y: 100 }, isEditing: false }
];

// ANSI colors for terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  bgBlue: '\x1b[44m',
  bgGreen: '\x1b[42m',
  white: '\x1b[37m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  green: '\x1b[32m'
};

console.log(`\n${colors.bright}${colors.cyan}Epic 1: Keyboard Navigation Demo${colors.reset}`);
console.log('='.repeat(50));

// Simulate tab order calculation
function getTabOrder(nodes) {
  return nodes
    .filter(n => n.isEditing)
    .sort((a, b) => {
      // Sort by Y position first (top to bottom)
      if (Math.abs(a.position.y - b.position.y) > 20) {
        return a.position.y - b.position.y;
      }
      // Then by X position (left to right)
      return a.position.x - b.position.x;
    });
}

const tabOrder = getTabOrder(mockNodes);

console.log(`\n${colors.bright}Nodes in Tab Order:${colors.reset}`);
tabOrder.forEach((node, index) => {
  console.log(`${index + 1}. ${colors.yellow}${node.id}${colors.reset} (${node.type}) at position (${node.position.x}, ${node.position.y})`);
});

// Simulate keyboard navigation
class KeyboardNavigator {
  constructor(nodes) {
    this.editableNodes = getTabOrder(nodes);
    this.currentIndex = -1;
    this.originalValues = new Map();
    
    // Store original values for cancel functionality
    this.editableNodes.forEach(node => {
      this.originalValues.set(node.id, JSON.parse(JSON.stringify(node.value)));
    });
  }

  autoFocus() {
    if (this.editableNodes.length > 0 && this.currentIndex === -1) {
      this.currentIndex = 0;
      const node = this.editableNodes[0];
      console.log(`\n${colors.bgGreen}${colors.white} AUTO-FOCUS ${colors.reset} → ${node.id}`);
      return node;
    }
    return null;
  }

  navigateNext() {
    if (this.editableNodes.length === 0) return null;
    
    this.currentIndex = (this.currentIndex + 1) % this.editableNodes.length;
    const node = this.editableNodes[this.currentIndex];
    console.log(`\n${colors.bgBlue}${colors.white} TAB ${colors.reset} → ${node.id}`);
    return node;
  }

  navigatePrevious() {
    if (this.editableNodes.length === 0) return null;
    
    this.currentIndex = this.currentIndex - 1;
    if (this.currentIndex < 0) {
      this.currentIndex = this.editableNodes.length - 1;
    }
    const node = this.editableNodes[this.currentIndex];
    console.log(`\n${colors.bgBlue}${colors.white} SHIFT+TAB ${colors.reset} → ${node.id}`);
    return node;
  }

  cancelEdits() {
    console.log(`\n${colors.bright}${colors.yellow}ESCAPE pressed - Cancelling all edits${colors.reset}`);
    this.editableNodes.forEach(node => {
      const original = this.originalValues.get(node.id);
      console.log(`  Reverting ${node.id} to original value`);
      node.value = original;
      node.isEditing = false;
    });
  }

  confirmAllEdits() {
    console.log(`\n${colors.bright}${colors.green}Canvas clicked - Confirming all edits${colors.reset}`);
    this.editableNodes.forEach(node => {
      console.log(`  ✓ Confirmed ${node.id}`);
      node.isEditing = false;
    });
    this.originalValues.clear();
  }
}

// Demo the navigation
console.log(`\n${colors.bright}Simulating Navigation:${colors.reset}`);

const navigator = new KeyboardNavigator(mockNodes);

// Auto-focus first node
navigator.autoFocus();

// Simulate tab navigation
console.log('\nUser presses Tab...');
navigator.navigateNext();

console.log('\nUser presses Tab again...');
navigator.navigateNext();

console.log('\nUser presses Tab once more (wraps to first)...');
navigator.navigateNext();

console.log('\nUser presses Shift+Tab...');
navigator.navigatePrevious();

// Show escape functionality
console.log('\n' + '='.repeat(50));
console.log(`${colors.bright}Escape Key Demo:${colors.reset}`);

// Simulate editing a value
mockNodes[0].value = 'EDITED TEXT';
console.log(`\nUser edited ${mockNodes[0].id}: "${mockNodes[0].value}"`);

navigator.cancelEdits();
console.log(`After escape: "${mockNodes[0].value}"`);

// Show canvas click functionality
console.log('\n' + '='.repeat(50));
console.log(`${colors.bright}Canvas Click Demo:${colors.reset}`);

mockNodes[0].isEditing = true;
mockNodes[1].isEditing = true;
mockNodes[0].value = 'Final edited text';

navigator.confirmAllEdits();

// Summary
console.log('\n' + '='.repeat(50));
console.log(`${colors.bright}${colors.green}Key Features Implemented:${colors.reset}`);
console.log('✅ Auto-focus on first editable node');
console.log('✅ Tab/Shift+Tab navigation with wrapping');
console.log('✅ Visual position-based tab order');
console.log('✅ Escape key cancels edits and restores values');
console.log('✅ Canvas click confirms all edits');
console.log('✅ Only navigate between nodes in edit mode');

console.log(`\n${colors.dim}Integration: Use the useKeyboardNavigation hook in React components${colors.reset}`);
console.log(`${colors.dim}Example: import { useKeyboardNavigation } from '@packages/core/components/epic1'${colors.reset}\n`);