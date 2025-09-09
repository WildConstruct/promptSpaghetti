/**
 * 🧪 Quick Fix: Add Output Node Programmatically
 *
 * Since drag & drop isn't working, this script adds an Output node directly
 * Run this in the browser console while the editor is open
 */

// Function to add an Output node to the current graph
function addOutputNode() {
  // Find the React Flow instance
  const reactFlowWrapper = document.querySelector('.react-flow');
  if (!reactFlowWrapper) {
    console.error(
      '❌ React Flow editor not found. Make sure the editor is loaded.'
    );
    return;
  }

  // Get React Flow instance from the wrapper
  const reactFlowInstance =
    reactFlowWrapper.__reactInternalInstance ||
    reactFlowWrapper._reactInternalFiber;

  if (!reactFlowInstance) {
    console.error('❌ Could not access React Flow instance');
    return;
  }

  // Create a new Output node
  const newOutputNode = {
    id: `output-${Date.now()}`,
    type: 'output',
    position: { x: 400, y: 200 },
    data: {
      nodeType: 'output',
      value: 'Output',
      label: 'Output'
    }
  };

  console.log('✅ Output node configuration:', newOutputNode);

  // Try to dispatch the node addition through React DevTools
  // This is a workaround since direct manipulation isn't working
  console.log(`
To add the Output node manually:

1. Open React DevTools
2. Find the Epic1GraphEditor component
3. In the console, run:
   
   $r.setNodes(nodes => [...nodes, ${JSON.stringify(newOutputNode, null, 2)}])

4. Connect your existing nodes to this new Output node
`);

  // Alternative approach using browser events
  const addNodeEvent = new CustomEvent('addNode', {
    detail: newOutputNode
  });
  document.dispatchEvent(addNodeEvent);

  console.log(
    '📤 Dispatched addNode event. If the editor listens for this event, the node will be added.'
  );
}

// More direct approach - simulate a drop event
function simulateOutputNodeDrop() {
  const canvas = document.querySelector('.react-flow__renderer');
  if (!canvas) {
    console.error('❌ Canvas not found');
    return;
  }

  // Create a fake drag event
  const dropEvent = new DragEvent('drop', {
    bubbles: true,
    cancelable: true,
    dataTransfer: new DataTransfer()
  });

  // Set the node type in the dataTransfer
  dropEvent.dataTransfer.setData('application/reactflow', 'output');
  dropEvent.dataTransfer.setData('application/node-type', 'output');

  // Set drop coordinates (center of viewport)
  Object.defineProperty(dropEvent, 'clientX', { value: window.innerWidth / 2 });
  Object.defineProperty(dropEvent, 'clientY', {
    value: window.innerHeight / 2
  });

  // Dispatch the drop event
  canvas.dispatchEvent(dropEvent);

  console.log('✅ Simulated drop event for Output node');
}

// Quick diagnostic to check current nodes
function checkForOutputNode() {
  const hasOutput = Array.from(
    document.querySelectorAll('.epic1-editable-node')
  ).some(node => node.classList.contains('output'));

  if (hasOutput) {
    console.log('✅ Output node found in the graph');

    // Check if it's connected
    const edges = document.querySelectorAll('.react-flow__edge');
    console.log(`📊 Total edges in graph: ${edges.length}`);

    // Check preview panel
    const previewPanel = document.querySelector('.preview-panel');
    if (previewPanel) {
      console.log('✅ Preview panel is visible');

      const results = previewPanel.querySelectorAll('.preview-result');
      if (results.length > 0) {
        console.log(`✅ Preview showing ${results.length} result(s)`);
      } else {
        console.log('⚠️ Preview panel exists but no results shown');
        console.log('   → Make sure Output node is connected to other nodes');
      }
    } else {
      console.log('❌ Preview panel not visible. Press "P" to toggle preview');
    }
  } else {
    console.log('❌ No Output node in graph');
    console.log(
      '   → Run addOutputNode() or simulateOutputNodeDrop() to add one'
    );
  }
}

// Export functions to window for console access
window.epic1Debug = {
  addOutputNode,
  simulateOutputNodeDrop,
  checkForOutputNode,

  // Quick fix - adds Output node and checks status
  quickFix: function () {
    console.log('🔧 Running Epic1 Output Quick Fix...\n');

    // First check current status
    this.checkForOutputNode();

    // If no output node, try to add one
    const hasOutput = document.querySelector('.epic1-editable-node.output');
    if (!hasOutput) {
      console.log('\n🔄 Attempting to add Output node...');
      this.simulateOutputNodeDrop();

      // Check again after a delay
      setTimeout(() => {
        console.log('\n📋 Final status check:');
        this.checkForOutputNode();
      }, 500);
    }
  }
};

console.log(`
🧪 Epic1 Output Node Debug Tools Loaded!

Commands available:
- epic1Debug.quickFix()           - Automated fix attempt
- epic1Debug.checkForOutputNode() - Check current status  
- epic1Debug.addOutputNode()      - Instructions to add Output node
- epic1Debug.simulateOutputNodeDrop() - Simulate drag & drop

Run: epic1Debug.quickFix() to start
`);

// Auto-run diagnostic
epic1Debug.checkForOutputNode();
