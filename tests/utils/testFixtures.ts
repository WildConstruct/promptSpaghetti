/**
 * Test Fixtures and Sample Data
 * Pre-configured test data for consistent testing
 */

export interface TestGraph {
  nodes: TestNode[];
  edges: TestEdge[];
}

export interface TestNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: any;
}

export interface TestEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
}

// Sample Graph Fixtures
export const simpleLinearGraph: TestGraph = {
  nodes: [
    {
      id: 'start-node',
      type: 'WeightedChoice',
      position: { x: 100, y: 100 },
      data: {
        label: 'Start Node',
        choices: ['Option A', 'Option B'],
        weights: [0.6, 0.4]
      }
    },
    {
      id: 'middle-node',
      type: 'Concat',
      position: { x: 300, y: 100 },
      data: {
        label: 'Middle Node',
        separator: ' | '
      }
    },
    {
      id: 'end-node',
      type: 'Output',
      position: { x: 500, y: 100 },
      data: {
        label: 'End Node',
        template: 'Result: {{value}}'
      }
    }
  ],
  edges: [
    {
      id: 'edge-1',
      source: 'start-node',
      target: 'middle-node'
    },
    {
      id: 'edge-2',
      source: 'middle-node',
      target: 'end-node'
    }
  ]
};

export const branchingGraph: TestGraph = {
  nodes: [
    {
      id: 'root',
      type: 'WeightedChoice',
      position: { x: 200, y: 50 },
      data: {
        label: 'Root',
        choices: ['Path A', 'Path B', 'Path C'],
        weights: [0.5, 0.3, 0.2]
      }
    },
    {
      id: 'branch-a',
      type: 'Concat',
      position: { x: 100, y: 200 },
      data: {
        label: 'Branch A',
        separator: ' -> '
      }
    },
    {
      id: 'branch-b',
      type: 'Include',
      position: { x: 200, y: 200 },
      data: {
        label: 'Branch B',
        bundleName: 'sub-graph'
      }
    },
    {
      id: 'branch-c',
      type: 'SetVariable',
      position: { x: 300, y: 200 },
      data: {
        label: 'Branch C',
        variableName: 'result',
        value: 'Branch C Result'
      }
    },
    {
      id: 'output',
      type: 'Output',
      position: { x: 200, y: 350 },
      data: {
        label: 'Final Output',
        template: 'Final: {{value}}'
      }
    }
  ],
  edges: [
    { id: 'edge-1', source: 'root', target: 'branch-a' },
    { id: 'edge-2', source: 'root', target: 'branch-b' },
    { id: 'edge-3', source: 'root', target: 'branch-c' },
    { id: 'edge-4', source: 'branch-a', target: 'output' },
    { id: 'edge-5', source: 'branch-b', target: 'output' },
    { id: 'edge-6', source: 'branch-c', target: 'output' }
  ]
};

export const complexGraph: TestGraph = {
  nodes: [
    {
      id: 'input-1',
      type: 'WeightedChoice',
      position: { x: 50, y: 100 },
      data: {
        choices: ['Hello', 'Hi', 'Greetings'],
        weights: [0.5, 0.3, 0.2]
      }
    },
    {
      id: 'input-2', 
      type: 'WeightedChoice',
      position: { x: 50, y: 300 },
      data: {
        choices: ['World', 'Universe', 'Everyone'],
        weights: [0.6, 0.25, 0.15]
      }
    },
    {
      id: 'concat-1',
      type: 'Concat',
      position: { x: 250, y: 200 },
      data: {
        separator: ' '
      }
    },
    {
      id: 'variable-set',
      type: 'SetVariable',
      position: { x: 450, y: 200 },
      data: {
        variableName: 'greeting',
        value: '{{value}}'
      }
    },
    {
      id: 'variable-get',
      type: 'GetVariable',
      position: { x: 650, y: 200 },
      data: {
        variableName: 'greeting'
      }
    },
    {
      id: 'output',
      type: 'Output',
      position: { x: 850, y: 200 },
      data: {
        template: 'Final greeting: {{value}}!'
      }
    }
  ],
  edges: [
    { id: 'e1', source: 'input-1', target: 'concat-1' },
    { id: 'e2', source: 'input-2', target: 'concat-1' },
    { id: 'e3', source: 'concat-1', target: 'variable-set' },
    { id: 'e4', source: 'variable-set', target: 'variable-get' },
    { id: 'e5', source: 'variable-get', target: 'output' }
  ]
};

// Large graph for performance testing
export const createLargeGraph = (nodeCount = 100): TestGraph => {
  const nodes: TestNode[] = [];
  const edges: TestEdge[] = [];
  
  const nodeTypes = ['WeightedChoice', 'Concat', 'Output', 'Include', 'SetVariable', 'GetVariable'];
  const gridSize = Math.ceil(Math.sqrt(nodeCount));
  
  for (let i = 0; i < nodeCount; i++) {
    const nodeType = nodeTypes[i % nodeTypes.length];
    const x = (i % gridSize) * 150 + 100;
    const y = Math.floor(i / gridSize) * 120 + 100;
    
    const baseData = {
      label: `Node ${i}`
    };

    let specificData = {};
    switch (nodeType) {
    case 'WeightedChoice':
      specificData = {
        choices: [`Option ${i}A`, `Option ${i}B`],
        weights: [0.7, 0.3]
      };
      break;
    case 'Concat':
      specificData = { separator: ' | ' };
      break;
    case 'Output':
      specificData = { template: `Output ${i}: {{value}}` };
      break;
    case 'Include':
      specificData = { bundleName: `bundle-${i}` };
      break;
    case 'SetVariable':
      specificData = {
        variableName: `var${i}`,
        value: `value${i}`
      };
      break;
    case 'GetVariable':
      specificData = { variableName: `var${Math.max(0, i-1)}` };
      break;
    }
    
    nodes.push({
      id: `node-${i}`,
      type: nodeType,
      position: { x, y },
      data: { ...baseData, ...specificData }
    });
    
    // Create some connections
    if (i > 0 && i % 3 !== 0) {
      edges.push({
        id: `edge-${i}`,
        source: `node-${i - 1}`,
        target: `node-${i}`
      });
    }
    
    // Add some branching connections
    if (i > 5 && i % 7 === 0) {
      edges.push({
        id: `edge-branch-${i}`,
        source: `node-${i - 5}`,
        target: `node-${i}`
      });
    }
  }
  
  return { nodes, edges };
};

// User Test Fixtures
export interface TestUser {
  id: string;
  username: string;
  email: string;
  role: string;
  permissions: string[];
  preferences: Record<string, any>;
}

export const testUsers: TestUser[] = [
  {
    id: 'user-1',
    username: 'testuser1',
    email: 'test1@example.com',
    role: 'admin',
    permissions: ['create', 'read', 'update', 'delete', 'share'],
    preferences: {
      theme: 'dark',
      notifications: true,
      autoSave: true
    }
  },
  {
    id: 'user-2', 
    username: 'testuser2',
    email: 'test2@example.com',
    role: 'editor',
    permissions: ['create', 'read', 'update', 'share'],
    preferences: {
      theme: 'light',
      notifications: false,
      autoSave: false
    }
  },
  {
    id: 'user-3',
    username: 'testuser3',
    email: 'test3@example.com',
    role: 'viewer',
    permissions: ['read'],
    preferences: {
      theme: 'auto',
      notifications: true,
      autoSave: true
    }
  }
];

// API Response Fixtures
export const apiResponses = {
  success: {
    status: 'success',
    data: { message: 'Operation completed successfully' },
    timestamp: '2024-01-01T00:00:00Z'
  },
  error: {
    status: 'error',
    error: {
      code: 'VALIDATION_ERROR',
      message: 'Invalid input provided',
      details: ['Field "name" is required']
    },
    timestamp: '2024-01-01T00:00:00Z'
  },
  unauthorized: {
    status: 'error',
    error: {
      code: 'UNAUTHORIZED',
      message: 'Authentication required'
    },
    timestamp: '2024-01-01T00:00:00Z'
  },
  graphValidation: {
    valid: true,
    errors: [],
    warnings: ['Node "output-1" has no connections'],
    metrics: {
      nodeCount: 5,
      edgeCount: 4,
      cycles: 0,
      unreachableNodes: 0
    }
  },
  graphExecution: {
    results: [
      'Hello World!',
      'Hi Universe!', 
      'Greetings Everyone!'
    ],
    seed: 1234,
    executionTime: 150,
    metadata: {
      nodesExecuted: 5,
      variablesSet: ['greeting'],
      warnings: []
    }
  }
};

// Test Scenarios for Edge Cases
export const edgeCaseGraphs = {
  // Graph with cycles (invalid)
  cyclicGraph: {
    nodes: [
      {
        id: 'a',
        type: 'WeightedChoice',
        position: { x: 100, y: 100 },
        data: { choices: ['A'], weights: [1.0] }
      },
      {
        id: 'b', 
        type: 'Concat',
        position: { x: 200, y: 100 },
        data: { separator: '-' }
      }
    ],
    edges: [
      { id: 'e1', source: 'a', target: 'b' },
      { id: 'e2', source: 'b', target: 'a' } // Creates cycle
    ]
  },
  
  // Empty graph
  emptyGraph: {
    nodes: [],
    edges: []
  },
  
  // Single node (no connections)
  isolatedNode: {
    nodes: [
      {
        id: 'lonely',
        type: 'Output',
        position: { x: 100, y: 100 },
        data: { template: 'Isolated: {{value}}' }
      }
    ],
    edges: []
  },
  
  // Disconnected components
  disconnectedGraph: {
    nodes: [
      {
        id: 'comp1-1',
        type: 'WeightedChoice', 
        position: { x: 100, y: 100 },
        data: { choices: ['A'], weights: [1.0] }
      },
      {
        id: 'comp1-2',
        type: 'Output',
        position: { x: 200, y: 100 },
        data: { template: 'Component 1: {{value}}' }
      },
      {
        id: 'comp2-1',
        type: 'WeightedChoice',
        position: { x: 100, y: 300 },
        data: { choices: ['B'], weights: [1.0] }
      },
      {
        id: 'comp2-2',
        type: 'Output',
        position: { x: 200, y: 300 },
        data: { template: 'Component 2: {{value}}' }
      }
    ],
    edges: [
      { id: 'e1', source: 'comp1-1', target: 'comp1-2' },
      { id: 'e2', source: 'comp2-1', target: 'comp2-2' }
    ]
  }
};

// Performance Test Data
export const performanceTestData = {
  seeds: [1234, 5678, 9101, 1121, 3141, 5926, 5358, 9793],
  expectedExecutionTime: {
    small: 50,    // < 10 nodes
    medium: 150,  // 10-50 nodes  
    large: 500,   // 50-200 nodes
    xlarge: 2000  // 200+ nodes
  },
  memoryThresholds: {
    small: 10 * 1024 * 1024,   // 10MB
    medium: 50 * 1024 * 1024,  // 50MB
    large: 200 * 1024 * 1024,  // 200MB
    xlarge: 500 * 1024 * 1024  // 500MB
  }
};

// Export fixtures by category
export const fixtures = {
  graphs: {
    simple: simpleLinearGraph,
    branching: branchingGraph,
    complex: complexGraph,
    large: createLargeGraph,
    edgeCases: edgeCaseGraphs
  },
  users: testUsers,
  api: apiResponses,
  performance: performanceTestData
};