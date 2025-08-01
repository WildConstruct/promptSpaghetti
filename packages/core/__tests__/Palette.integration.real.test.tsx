import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { jest } from '@jest/globals';
// Since this test is in packages/core, we need to test the GraphEditor component directly
import { GraphEditor } from '../GraphEditor';
import { Node, Edge } from 'reactflow';

// Helper to create proper drag events with coordinates
const createDragEvent = (type: string, clientX: number, clientY: number, dataTransferData: string) => { const event = new MouseEvent(type, {)
  bubbles: true,
  cancelable: true,
  clientX }
  clientY
}) as any;
  // Add dataTransfer for drag events
  event.dataTransfer = { getData: (format: string) => { }
  if (format === 'application/reactflow' || format === 'application/node-type') { return dataTransferData;
  return '' },
  setData: jest.fn(),
    dropEffect: 'move',
    effectAllowed: 'all';
  };
  return event;
};

// Helper to wait for ReactFlow to initialize
const waitForReactFlowReady = () => { return null; });
    // Create and dispatch the drop event
    const dropEvent = createDragEvent('drop', 150, 150, 'Output');
    fireEvent(pane!, dropEvent);
    // Wait for the node to be created in the real ReactFlow
    await waitFor(() => { const nodes = reactFlowWrapper.querySelectorAll('.react-flow__node');
      expect(nodes.length).toBe(1);
      // Verify it's an Output node
      const node = nodes[0] as HTMLElement;
      const nodeTestId = node.querySelector('[data-testid*="node-"]');
      expect(nodeTestId).toBeInTheDocument();
      // Check that the node contains Output content
      expect(node.textContent).toContain('Output') }, { timeout: 3000 });
  });
  it('multiple different node types can be created from palette', async () => {
    render(<GraphEditor initialNodes={initialNodes} initialEdges={initialEdges} />);
    await waitForReactFlowReady();
    const reactFlowWrapper = screen.getByTestId('reactflow-provider');
    const pane = await waitFor(() => { const p = reactFlowWrapper.querySelector('.react-flow__pane');
      expect(p).toBeInTheDocument();
      return p });
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
    await waitFor(() => { const nodes = reactFlowWrapper.querySelectorAll('.react-flow__node');
      expect(nodes.length).toBe(1) });
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
    await waitFor(() => { const nodes = reactFlowWrapper.querySelectorAll('.react-flow__node');
      expect(nodes.length).toBe(2);
      // Verify we have both types
      const nodeContents = Array.from(nodes).map(node => node.textContent);
      expect(nodeContents.some(content => content?.includes('Subject'))).toBe(true);
      expect(nodeContents.some(content => content?.includes('Action'))).toBe(true) }, { timeout: 3000 });
  });
  it('dragging SetVariable and GetVariable nodes creates variable-specific nodes', async () => {
    render(<GraphEditor initialNodes={initialNodes} initialEdges={initialEdges} />);
    await waitForReactFlowReady();
    const reactFlowWrapper = screen.getByTestId('reactflow-provider');
    const pane = await waitFor(() => { const p = reactFlowWrapper.querySelector('.react-flow__pane');
      expect(p).toBeInTheDocument();
      return p });
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
    await waitFor(() => { const nodes = reactFlowWrapper.querySelectorAll('.react-flow__node');
      expect(nodes.length).toBe(2);
      // Verify we have both variable types
      const nodeContents = Array.from(nodes).map(node => node.textContent);
      expect(nodeContents.some(content => content?.includes('SetVariable'))).toBe(true);
      expect(nodeContents.some(content => content?.includes('GetVariable'))).toBe(true) }, { timeout: 3000 });
  });
  it('WeightedChoice and Concat nodes can be created from palette', async () => {
    render(<GraphEditor initialNodes={initialNodes} initialEdges={initialEdges} />);
    await waitForReactFlowReady();
    const reactFlowWrapper = screen.getByTestId('reactflow-provider');
    const pane = await waitFor(() => { const p = reactFlowWrapper.querySelector('.react-flow__pane');
      expect(p).toBeInTheDocument();
      return p });
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
    await waitFor(() => { const nodes = reactFlowWrapper.querySelectorAll('.react-flow__node');
      expect(nodes.length).toBe(2);
      // Verify we have both types
      const nodeContents = Array.from(nodes).map(node => node.textContent);
      expect(nodeContents.some(content => content?.includes('WeightedChoice'))).toBe(true);
      expect(nodeContents.some(content => content?.includes('Concat'))).toBe(true) }, { timeout: 3000 });
  });
});