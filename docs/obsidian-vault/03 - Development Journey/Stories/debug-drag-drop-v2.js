/**
 * 🧪 Drag & Drop Debugger V2
 * Focused on finding why drag/drop isn't working
 */

window.dragDebug = {
  // Test if drag events are firing
  testDragEvents: function () {
    console.log('🔍 Testing drag events...\n');

    // Find draggable items
    const palette = document.querySelector('.node-palette');
    const items = document.querySelectorAll('.node-item');

    console.log(`Node Palette: ${palette ? '✅ Found' : '❌ Not found'}`);
    console.log(`Draggable items: ${items.length}`);

    // Check if items are draggable
    items.forEach(item => {
      const label = item.querySelector('.node-label')?.textContent;
      const isDraggable = item.draggable;
      console.log(`  ${label}: draggable=${isDraggable}`);
    });

    // Monitor drag start
    let dragStartFired = false;
    items.forEach(item => {
      item.addEventListener(
        'dragstart',
        e => {
          dragStartFired = true;
          console.log('✅ DragStart fired!', e.dataTransfer?.types);
        },
        { once: true }
      );
    });

    // Monitor drop zone
    const canvas = document.querySelector('.react-flow__renderer');
    if (canvas) {
      canvas.addEventListener(
        'dragover',
        e => {
          console.log('✅ DragOver on canvas', e);
        },
        { once: true }
      );

      canvas.addEventListener(
        'drop',
        e => {
          console.log('✅ Drop on canvas', {
            types: e.dataTransfer?.types,
            data: e.dataTransfer?.getData('application/node-type')
          });
        },
        { once: true }
      );
    }

    console.log('\n📋 Now try dragging a node from the palette...');
  },

  // Check React Flow instance
  checkReactFlow: function () {
    console.log('🔍 Checking React Flow setup...\n');

    // Look for React Flow instance in the global scope
    const rf = document.querySelector('.react-flow');
    console.log(`React Flow element: ${rf ? '✅' : '❌'}`);

    // Check if onDrop handler is attached
    const hasDropHandler =
      rf?._reactInternalInstance || rf?.__reactInternalFiber;
    console.log(
      `React handlers attached: ${hasDropHandler ? 'Maybe' : 'Unknown'}`
    );

    // Check for DnD provider
    const dndContext = document.querySelector('[data-rbd-droppable-id]');
    console.log(
      `DnD context: ${dndContext ? '✅ Found' : '⚠️ Not found (might be React DnD)'}`
    );

    return rf;
  },

  // Try to trigger drop programmatically with proper setup
  simulateDrop: function (nodeType = 'output') {
    console.log(`🎯 Simulating drop of ${nodeType}...\n`);

    const canvas = document.querySelector('.react-flow__pane');
    if (!canvas) {
      console.error('❌ Canvas pane not found');
      return;
    }

    // Get center position
    const rect = canvas.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    // First, trigger dragover to prepare
    const dragOverEvent = new DragEvent('dragover', {
      bubbles: true,
      cancelable: true,
      clientX: x,
      clientY: y
    });
    canvas.dispatchEvent(dragOverEvent);
    console.log('Dispatched dragover');

    // Then trigger drop
    const dropEvent = new DragEvent('drop', {
      bubbles: true,
      cancelable: true,
      clientX: x,
      clientY: y,
      dataTransfer: new DataTransfer()
    });

    // Try to set data (might not work due to security)
    try {
      dropEvent.dataTransfer.setData('application/node-type', nodeType);
      dropEvent.dataTransfer.setData('application/reactflow', nodeType);
    } catch (e) {
      console.warn('Could not set dataTransfer data:', e);
    }

    canvas.dispatchEvent(dropEvent);
    console.log('Dispatched drop event');
  },

  // Check what's preventing drops
  diagnose: function () {
    console.log('🏥 Full Drag & Drop Diagnosis\n');
    console.log('='.repeat(50));

    // 1. Check palette
    const palette = document.querySelector('.node-palette');
    const assetLib = document.querySelector('.asset-library');
    console.log('\n1. SOURCE ELEMENTS:');
    console.log(`   Node Palette: ${palette ? '✅' : '❌'}`);
    console.log(`   Asset Library: ${assetLib ? '✅' : '❌'}`);

    // 2. Check draggable items
    const items = document.querySelectorAll('.node-item');
    console.log(`   Draggable items: ${items.length}`);

    // 3. Check drop target
    console.log('\n2. DROP TARGET:');
    const pane = document.querySelector('.react-flow__pane');
    const renderer = document.querySelector('.react-flow__renderer');
    const viewport = document.querySelector('.react-flow__viewport');
    console.log(`   Pane: ${pane ? '✅' : '❌'}`);
    console.log(`   Renderer: ${renderer ? '✅' : '❌'}`);
    console.log(`   Viewport: ${viewport ? '✅' : '❌'}`);

    // 4. Check for blocking elements
    console.log('\n3. POTENTIAL BLOCKERS:');
    const overlays = document.querySelectorAll('.react-flow__zoompane');
    console.log(`   Zoom pane overlays: ${overlays.length}`);

    // Check z-index issues
    if (pane) {
      const paneStyle = window.getComputedStyle(pane);
      console.log(`   Pane z-index: ${paneStyle.zIndex}`);
      console.log(`   Pane pointer-events: ${paneStyle.pointerEvents}`);
    }

    // 5. Check console for drop events
    console.log('\n4. DROP EVENT LOGGING:');
    console.log('   Check console for "Drop event:" messages when dragging');

    console.log('\n' + '='.repeat(50));
    console.log('Diagnosis complete.\n');

    // Provide solution
    console.log('📝 POSSIBLE SOLUTIONS:');
    console.log('1. The drop handlers ARE attached (we see the console.log)');
    console.log('2. The issue might be that reactFlowInstance is null');
    console.log('3. Try: Click on the canvas first, then drag a node');
    console.log('4. Or use keyboard shortcut if available');

    return {
      hasSource: items.length > 0,
      hasTarget: !!pane,
      readyForDrop: items.length > 0 && !!pane
    };
  }
};

console.log(
  '%c🐛 Drag & Drop Debugger V2 Loaded',
  'color: #ff9900; font-size: 16px; font-weight: bold'
);
console.log('\nCommands:');
console.log('  dragDebug.diagnose()      - Full diagnosis');
console.log('  dragDebug.testDragEvents() - Monitor drag events');
console.log('  dragDebug.simulateDrop()  - Try synthetic drop');
console.log('\nRunning diagnosis...\n');

dragDebug.diagnose();
