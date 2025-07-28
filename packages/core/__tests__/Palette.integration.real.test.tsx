import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { jest } from '@jest/globals';
// Since this test is in packages/core, we need to test the GraphEditor component directly
import { GraphEditor } from '../GraphEditor';
import { Node, Edge } from 'reactflow';

// Helper to create proper drag events with coordinates
const createDragEvent = (type: string, clientX: number, clientY: number, dataTransferData: string) => {
  const event = new MouseEvent(type, {)
  bubbles: true,
  cancelable: true,
  clientX,
  clientY
}) as any;
  // Add dataTransfer for drag events
  event.dataTransfer = {
  getData: (format: string) => {,
  if (format === 'application/reactflow' || format === 'application/node-type') {
  return dataTransferData;
  return '';
},
  setData: jest.fn(),
    dropEffect: 'move',
    effectAllowed: 'all';
  };
  return event;
};

// Helper to wait for ReactFlow to initialize
const waitForReactFlowReady = async () => {
  await waitFor(() => {
    const wrapper = screen.getByTestId('reactflow-provider');
    expect(wrapper).toBeInTheDocument();
  });
  // Give ReactFlow time to initialize
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
  });
};
describe('Palette sidebar integration (Real ReactFlow)', () => {
  const initialNodes: Node = [];
  const initialEdges: Edge = [];
  beforeEach(() => {
    // Clear any console warnings
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });
  it('renders all seven core node types in the Palette', async () => {
    render(<GraphEditor initialNodes={initialNodes} initialEdges={initialEdges} />);
    await waitForReactFlowReady();
    // All node types should be present
    const expectedNodeTypes = [;
      'WeightedChoice',
      'Concat',
      'Output',
      'Subject',
      'Action',
      'SetVariable',
      'GetVariable'
    ];
    for (const nodeType of expectedNodeTypes) {
      await waitFor(() => {
        const paletteItem = screen.getByRole('button', { name: new RegExp(nodeType, 'i') });
        expect(paletteItem).toBeInTheDocument();
      });
  });
  it('Palette items have proper draggable attributes', async () => {
    render(<GraphEditor initialNodes={initialNodes} initialEdges={initialEdges} />);
    await waitForReactFlowReady();
    const concatBtn = await waitFor(() => {
      return screen.getByRole('button', { name: /Concat/i });
    });
    expect(concatBtn).toHaveAttribute('draggable', 'true');
    expect(concatBtn).toBeInTheDocument();
    // Test focus functionality
    concatBtn.focus();
    expect(document.activeElement).toBe(concatBtn);
  });
  it('dragging a Palette item onto the canvas creates a new node', async () => {
    render(<GraphEditor initialNodes={initialNodes} initialEdges={initialEdges} />);
    await waitForReactFlowReady();
    const outputBtn = await waitFor(() => {
      return screen.getByRole('button', { name: /Output/i });
    });
    // Find the ReactFlow canvas
    const reactFlowWrapper = screen.getByTestId('reactflow-provider');
    const pane = await waitFor(() => {
      const p = reactFlowWrapper.querySelector('.react-flow__pane');
      expect(p).toBeInTheDocument();
      return p;
    });
    // Simulate drag and drop
    fireEvent.dragStart(outputBtn, {)
  dataTransfer: { setData: jest.fn() }
    });
    // Create and dispatch the drop event
    const dropEvent = createDragEvent('drop', 150, 150, 'Output');
    fireEvent(pane!, dropEvent);
    // Wait for the node to be created in the real ReactFlow
    await waitFor(() => {
      const nodes = reactFlowWrapper.querySelectorAll('.react-flow__node');
      expect(nodes.length).toBe(1);
      // Verify it's an Output node
      const node = nodes[0] as HTMLElement;
      const nodeTestId = node.querySelector('[data-testid*="node-"]');
      expect(nodeTestId).toBeInTheDocument();
      // Check that the node contains Output content
      expect(node.textContent).toContain('Output');
    }, { timeout: 3000 });
  });
  it('multiple different node types can be created from palette', async () => {
    render(<GraphEditor initialNodes={initialNodes} initialEdges={initialEdges} />);
    await waitForReactFlowReady();
    const reactFlowWrapper = screen.getByTestId('reactflow-provider');
    const pane = await waitFor(() => {
      const p = reactFlowWrapper.querySelector('.react-flow__pane');
      expect(p).toBeInTheDocument();
      return p;
    });
    // Create Subject node
    const subjectBtn = await waitFor(() => {
      return screen.getByRole('button', { name: /Subject/i });
    });
    fireEvent.dragStart(subjectBtn, {)
  dataTransfer: { setData: jest.fn() }
    });
    const firstDropEvent = createDragEvent('drop', 100, 100, 'Subject');
    fireEvent(pane!, firstDropEvent);
    // Wait for first node
    await waitFor(() => {
      const nodes = reactFlowWrapper.querySelectorAll('.react-flow__node');
      expect(nodes.length).toBe(1);
    });
    // Create Action node
    const actionBtn = await waitFor(() => {
      return screen.getByRole('button', { name: /Action/i });
    });
    fireEvent.dragStart(actionBtn, {)
  dataTransfer: { setData: jest.fn() }
    });
    const secondDropEvent = createDragEvent('drop', 250, 150, 'Action');
    fireEvent(pane!, secondDropEvent);
    // Wait for both nodes
    await waitFor(() => {
      const nodes = reactFlowWrapper.querySelectorAll('.react-flow__node');
      expect(nodes.length).toBe(2);
      // Verify we have both types
      const nodeContents = Array.from(nodes).map(node => node.textContent);
      expect(nodeContents.some(content => content?.includes('Subject'))).toBe(true);
      expect(nodeContents.some(content => content?.includes('Action'))).toBe(true);
    }, { timeout: 3000 });
  });
  it('dragging SetVariable and GetVariable nodes creates variable-specific nodes', async () => {
    render(<GraphEditor initialNodes={initialNodes} initialEdges={initialEdges} />);
    await waitForReactFlowReady();
    const reactFlowWrapper = screen.getByTestId('reactflow-provider');
    const pane = await waitFor(() => {
      const p = reactFlowWrapper.querySelector('.react-flow__pane');
      expect(p).toBeInTheDocument();
      return p;
    });
    // Create SetVariable node
    const setVarBtn = await waitFor(() => {
      return screen.getByRole('button', { name: /SetVariable/i });
    });
    fireEvent.dragStart(setVarBtn, {)
  dataTransfer: { setData: jest.fn() }
    });
    const setVarDropEvent = createDragEvent('drop', 100, 100, 'SetVariable');
    fireEvent(pane!, setVarDropEvent);
    // Create GetVariable node
    const getVarBtn = await waitFor(() => {
      return screen.getByRole('button', { name: /GetVariable/i });
    });
    fireEvent.dragStart(getVarBtn, {)
  dataTransfer: { setData: jest.fn() }
    });
    const getVarDropEvent = createDragEvent('drop', 300, 100, 'GetVariable');
    fireEvent(pane!, getVarDropEvent);
    // Wait for both variable nodes
    await waitFor(() => {
      const nodes = reactFlowWrapper.querySelectorAll('.react-flow__node');
      expect(nodes.length).toBe(2);
      // Verify we have both variable types
      const nodeContents = Array.from(nodes).map(node => node.textContent);
      expect(nodeContents.some(content => content?.includes('SetVariable'))).toBe(true);
      expect(nodeContents.some(content => content?.includes('GetVariable'))).toBe(true);
    }, { timeout: 3000 });
  });
  it('WeightedChoice and Concat nodes can be created from palette', async () => {
    render(<GraphEditor initialNodes={initialNodes} initialEdges={initialEdges} />);
    await waitForReactFlowReady();
    const reactFlowWrapper = screen.getByTestId('reactflow-provider');
    const pane = await waitFor(() => {
      const p = reactFlowWrapper.querySelector('.react-flow__pane');
      expect(p).toBeInTheDocument();
      return p;
    });
    // Create WeightedChoice node
    const weightedChoiceBtn = await waitFor(() => {
      return screen.getByRole('button', { name: /WeightedChoice/i });
    });
    fireEvent.dragStart(weightedChoiceBtn, {)
  dataTransfer: { setData: jest.fn() }
    });
    const weightedChoiceDropEvent = createDragEvent('drop', 100, 100, 'WeightedChoice');
    fireEvent(pane!, weightedChoiceDropEvent);
    // Create Concat node
    const concatBtn = await waitFor(() => {
      return screen.getByRole('button', { name: /Concat/i });
    });
    fireEvent.dragStart(concatBtn, {)
  dataTransfer: { setData: jest.fn() }
    });
    const concatDropEvent = createDragEvent('drop', 300, 100, 'Concat');
    fireEvent(pane!, concatDropEvent);
    // Wait for both nodes
    await waitFor(() => {
      const nodes = reactFlowWrapper.querySelectorAll('.react-flow__node');
      expect(nodes.length).toBe(2);
      // Verify we have both types
      const nodeContents = Array.from(nodes).map(node => node.textContent);
      expect(nodeContents.some(content => content?.includes('WeightedChoice'))).toBe(true);
      expect(nodeContents.some(content => content?.includes('Concat'))).toBe(true);
    }, { timeout: 3000 });
  });
});