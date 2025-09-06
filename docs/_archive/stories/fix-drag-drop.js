/**
 * 🧪 Drag & Drop Debug and Fix Script
 * Run this in the browser console to diagnose and fix drag/drop issues
 */

// Debug drag and drop functionality
window.debugDragDrop = {
  // Monitor drag events
  monitorDragEvents: function() {
    console.log('🔍 Starting drag/drop monitoring...\n');
    
    // Find the React Flow canvas
    const canvas = document.querySelector('.react-flow__renderer');
    if (!canvas) {
      console.error('❌ React Flow canvas not found');
      return;
    }
    
    // Monitor drag events on the canvas
    canvas.addEventListener('dragover', (e) => {
      console.log('📥 DragOver event:', {
        clientX: e.clientX,
        clientY: e.clientY,
        dataTransfer: e.dataTransfer?.types
      });
    });
    
    canvas.addEventListener('drop', (e) => {
      console.log('📦 Drop event:', {
        clientX: e.clientX,
        clientY: e.clientY,
        dataTransfer: {
          types: e.dataTransfer?.types,
          nodeType: e.dataTransfer?.getData('application/node-type'),
          reactflow: e.dataTransfer?.getData('application/reactflow')
        }
      });
    });
    
    // Monitor drag start from palette
    document.querySelectorAll('.node-item').forEach(item => {
      item.addEventListener('dragstart', (e) => {
        const nodeType = item.querySelector('.node-label')?.textContent;
        console.log('🚀 DragStart:', nodeType);
      });
    });
    
    console.log('✅ Monitoring started. Try dragging a node.');
  },
  
  // Check React Flow instance
  checkReactFlowInstance: function() {
    console.log('🔍 Checking React Flow instance...\n');
    
    // Try to find React Flow instance through React DevTools
    const reactFlowWrapper = document.querySelector('.react-flow');
    if (!reactFlowWrapper) {
      console.error('❌ React Flow wrapper not found');
      return;
    }
    
    // Check if React Flow is initialized
    const hasViewport = document.querySelector('.react-flow__viewport');
    const hasRenderer = document.querySelector('.react-flow__renderer');
    const hasControls = document.querySelector('.react-flow__controls');
    
    console.log('React Flow Components:');
    console.log(`  Viewport: ${hasViewport ? '✅' : '❌'}`);
    console.log(`  Renderer: ${hasRenderer ? '✅' : '❌'}`);
    console.log(`  Controls: ${hasControls ? '✅' : '❌'}`);
    
    // Check for existing nodes
    const nodes = document.querySelectorAll('.react-flow__node');
    console.log(`\nExisting nodes: ${nodes.length}`);
    
    return {
      initialized: hasViewport && hasRenderer,
      nodeCount: nodes.length
    };
  },
  
  // Programmatically add a node (workaround)
  addNodeProgrammatically: function(nodeType = 'textBlock') {
    console.log(`🔧 Adding ${nodeType} node programmatically...\n`);
    
    // Create a synthetic drop event
    const canvas = document.querySelector('.react-flow__renderer');
    if (!canvas) {
      console.error('❌ Canvas not found');
      return;
    }
    
    // Get canvas center
    const rect = canvas.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    
    // Create drop event with data
    const dropEvent = new DragEvent('drop', {
      bubbles: true,
      cancelable: true,
      clientX: x,
      clientY: y
    });
    
    // Add data to the event
    Object.defineProperty(dropEvent, 'dataTransfer', {
      value: {
        getData: (type) => {
          if (type === 'application/node-type' || type === 'application/reactflow') {
            return nodeType;
          }
          return '';
        },
        types: ['application/node-type', 'application/reactflow'],
        dropEffect: 'move',
        effectAllowed: 'all'
      }
    });
    
    // Dispatch the drop event
    canvas.dispatchEvent(dropEvent);
    console.log(`✅ Drop event dispatched for ${nodeType} at (${x.toFixed(0)}, ${y.toFixed(0)})`);
  },
  
  // Fix common issues
  applyFixes: function() {
    console.log('🔧 Applying drag/drop fixes...\n');
    
    // 1. Ensure dragover prevention
    const renderer = document.querySelector('.react-flow__renderer');
    if (renderer) {
      renderer.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
      }, true);
      console.log('✅ Added dragover handler to renderer');
    }
    
    // 2. Ensure drop handling
    if (renderer) {
      renderer.addEventListener('drop', (e) => {
        e.preventDefault();
        console.log('Drop intercepted:', e.dataTransfer?.getData('application/node-type'));
      }, true);
      console.log('✅ Added drop handler to renderer');
    }
    
    // 3. Fix palette draggable items
    document.querySelectorAll('.node-item').forEach(item => {
      item.draggable = true;
      console.log(`✅ Made ${item.querySelector('.node-label')?.textContent} draggable`);
    });
    
    console.log('\n✅ Fixes applied. Try dragging again.');
  },
  
  // Test all node types
  testAllNodeTypes: function() {
    const nodeTypes = ['textBlock', 'weightedChoice', 'concat', 'variable', 'output'];
    let index = 0;
    
    console.log('🧪 Testing all node types...\n');
    
    const interval = setInterval(() => {
      if (index >= nodeTypes.length) {
        clearInterval(interval);
        console.log('\n✅ All node types tested');
        return;
      }
      
      const nodeType = nodeTypes[index];
      console.log(`Adding ${nodeType}...`);
      this.addNodeProgrammatically(nodeType);
      index++;
    }, 1000);
  },
  
  // Full diagnostic
  runFullDiagnostic: function() {
    console.log('🏥 Running full drag/drop diagnostic...\n');
    console.log('=' .repeat(50));
    
    // 1. Check React Flow
    const rfStatus = this.checkReactFlowInstance();
    
    // 2. Check palettes
    const nodePalette = document.querySelector('.node-palette');
    const assetLibrary = document.querySelector('.asset-library');
    console.log('\nPalettes:');
    console.log(`  Node Palette: ${nodePalette ? '✅' : '❌'}`);
    console.log(`  Asset Library: ${assetLibrary ? '✅' : '❌'}`);
    
    // 3. Check draggable items
    const draggableItems = document.querySelectorAll('[draggable="true"]');
    console.log(`\nDraggable items: ${draggableItems.length}`);
    
    // 4. Test synthetic drop
    console.log('\n🧪 Testing synthetic drop...');
    this.addNodeProgrammatically('output');
    
    // 5. Apply fixes
    console.log('\n🔧 Applying automatic fixes...');
    this.applyFixes();
    
    console.log('\n' + '=' .repeat(50));
    console.log('Diagnostic complete. Try dragging a node now.');
    console.log('If still not working, run: debugDragDrop.monitorDragEvents()');
  }
};

// Auto-run diagnostic
console.log('%c🧪 Drag & Drop Debug Tools Loaded', 'color: #00ff00; font-size: 16px; font-weight: bold');
console.log('\nAvailable commands:');
console.log('  debugDragDrop.runFullDiagnostic()    - Full diagnostic & auto-fix');
console.log('  debugDragDrop.monitorDragEvents()    - Monitor drag events');
console.log('  debugDragDrop.addNodeProgrammatically(type) - Add node directly');
console.log('  debugDragDrop.testAllNodeTypes()     - Test all node types');
console.log('  debugDragDrop.applyFixes()           - Apply fixes');
console.log('\nRunning diagnostic now...\n');

// Run diagnostic immediately
debugDragDrop.runFullDiagnostic();