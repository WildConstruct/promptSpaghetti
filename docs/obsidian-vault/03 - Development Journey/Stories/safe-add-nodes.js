/**
 * 🧪 Safe Node Addition Script
 * This script safely adds nodes without conflicting with React DnD
 */

window.safeAddNode = {
  // Add a node using React's state management
  addNode: function (nodeType = 'output', x = 200, y = 200) {
    console.log(`Adding ${nodeType} node at (${x}, ${y})...`);

    // Find the React component instance using React DevTools
    // This is safer than dispatching synthetic events
    const reactDevTools = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!reactDevTools) {
      console.error(
        'React DevTools not found. Please install React DevTools extension.'
      );
      console.log(
        'Alternative: Use the UI buttons if they work, or try refreshing the page.'
      );
      return;
    }

    // Try to find the Epic1GraphEditor component
    console.log('Looking for Epic1GraphEditor component...');

    // Manual workaround - create node definition
    const nodeId = `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const nodeData = {
      id: nodeId,
      type: nodeType,
      position: { x, y },
      data: this.getNodeData(nodeType)
    };

    console.log('Node configuration:', nodeData);
    console.log('\nTo add this node manually:');
    console.log('1. Open React DevTools');
    console.log('2. Find Epic1GraphEditorInner component');
    console.log('3. In the console, run:');
    console.log(
      `   $r.setNodes(nodes => [...nodes, ${JSON.stringify(nodeData, null, 2)}])`
    );

    return nodeData;
  },

  // Get default data for node type
  getNodeData: function (nodeType) {
    const configs = {
      textBlock: {
        nodeType: 'textBlock',
        value: 'Hello World',
        text: 'Hello World'
      },
      weightedChoice: {
        nodeType: 'weightedChoice',
        value: JSON.stringify(
          [
            { text: 'Option 1', weight: 1 },
            { text: 'Option 2', weight: 1 }
          ],
          null,
          2
        ),
        options: [
          { text: 'Option 1', weight: 1 },
          { text: 'Option 2', weight: 1 }
        ]
      },
      concat: {
        nodeType: 'concat',
        value: ' ',
        separator: ' '
      },
      variable: {
        nodeType: 'variable',
        value: 'myVariable',
        variableName: 'myVariable',
        mode: 'both'
      },
      setVariable: {
        nodeType: 'setVariable',
        value: 'myVariable',
        variableName: 'myVariable',
        mode: 'set'
      },
      getVariable: {
        nodeType: 'getVariable',
        value: 'myVariable',
        variableName: 'myVariable',
        mode: 'get'
      },
      output: {
        nodeType: 'output',
        value: 'Output',
        label: 'Output'
      }
    };

    return configs[nodeType] || configs.textBlock;
  },

  // Create a complete test graph
  createTestGraph: function () {
    console.log('Creating test graph with connected nodes...');

    const nodes = [
      this.addNode('textBlock', 100, 100),
      this.addNode('output', 400, 100)
    ];

    const edge = {
      id: `edge-${Date.now()}`,
      source: nodes[0].id,
      target: nodes[1].id,
      sourceHandle: 'output',
      targetHandle: 'input'
    };

    console.log('\nTest graph created:');
    console.log('Nodes:', nodes);
    console.log('Edge:', edge);
    console.log('\nTo connect them, you also need to add the edge using:');
    console.log(
      `   $r.setEdges(edges => [...edges, ${JSON.stringify(edge, null, 2)}])`
    );

    return { nodes, edge };
  },

  // Check current graph status
  checkStatus: function () {
    console.log('🔍 Checking graph status...\n');

    // Check for nodes
    const nodeElements = document.querySelectorAll('.react-flow__node');
    console.log(`Nodes in graph: ${nodeElements.length}`);

    nodeElements.forEach((node, i) => {
      const label =
        node.querySelector('.epic1-node-type-label')?.textContent ||
        node.querySelector('.node-label')?.textContent ||
        'Unknown';
      console.log(`  ${i + 1}. ${label}`);
    });

    // Check for edges
    const edgeElements = document.querySelectorAll('.react-flow__edge');
    console.log(`\nEdges in graph: ${edgeElements.length}`);

    // Check for preview panel
    const previewPanel = document.querySelector('.preview-panel');
    console.log(
      `\nPreview panel: ${previewPanel ? 'Visible' : 'Hidden (press P to toggle)'}`
    );

    if (previewPanel) {
      const results = previewPanel.querySelectorAll('.preview-result');
      console.log(`Preview results: ${results.length}`);
    }

    // Check for output nodes
    const outputNodes = document.querySelectorAll(
      '.epic1-editable-node.output'
    );
    if (outputNodes.length === 0) {
      console.log('\n⚠️ No Output nodes found!');
      console.log('Run: safeAddNode.addNode("output") to add one');
    } else {
      console.log(`\n✅ ${outputNodes.length} Output node(s) found`);
    }

    return {
      nodes: nodeElements.length,
      edges: edgeElements.length,
      hasOutput: outputNodes.length > 0,
      previewVisible: !!previewPanel
    };
  },

  // Quick fix - add output node if missing
  quickFix: function () {
    console.log('🔧 Quick Fix - Checking for common issues...\n');

    const status = this.checkStatus();

    if (!status.hasOutput) {
      console.log('Adding missing Output node...');
      this.addNode('output', 400, 200);
    }

    if (!status.previewVisible) {
      console.log('\n⚠️ Preview panel is hidden. Press "P" key to show it.');
    }

    if (status.nodes === 0) {
      console.log('\nNo nodes found. Creating test graph...');
      this.createTestGraph();
    }

    console.log(
      '\n✅ Quick fix complete. Check React DevTools to manually add nodes if needed.'
    );
  }
};

// Show instructions
console.log(
  '%c🧪 Safe Node Addition Tools Loaded',
  'color: #00ff00; font-size: 16px; font-weight: bold'
);
console.log('\nCommands:');
console.log('  safeAddNode.quickFix()         - Auto-detect and fix issues');
console.log('  safeAddNode.checkStatus()      - Check current graph');
console.log('  safeAddNode.addNode(type, x, y) - Get node config');
console.log('  safeAddNode.createTestGraph()  - Create test nodes');
console.log(
  '\nNote: After getting node config, use React DevTools to add nodes.'
);
console.log('\nRunning status check...\n');

// Auto-check status
safeAddNode.checkStatus();
