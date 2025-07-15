import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { jest } from '@jest/globals';
import userEvent from '@testing-library/user-event';
import App from '../../App';

// Use the shared manual mock defined in __tests__/__mocks__/reactFlowMock.tsx
jest.mock('reactflow');

// Import the mock - we don't need to mock the module again since it's done in the mock file


// TypeScript interfaces for test helper functions
interface Position {
  x: number;
  y: number;
}

interface Node {
  id: string;
  data: {
    nodeType: string;
    label: string;
  };
  position: Position;
  selected: boolean;
}

interface Edge {
  id: string;
  source: string;
  target: string;
}

interface ReactFlowProps {
  nodes: Node[];
  edges: Edge[];
  onNodeClick: (event: React.MouseEvent, node: Node) => void;
  onPaneClick: () => void;
  onNodesChange: () => void;
  onDrop: (event: React.DragEvent) => void;
  onDragOver: (event: React.DragEvent) => void;
  children: React.ReactNode;
}

describe('Node Selection Bug Fixes', () => {
  /**
   * Test for Issue #1: Node selection should update the inspector
   */
  test('selecting a node properly updates the inspector panel', async () => {
    render(<App />);

    // Create a test node first
    const subjectNode = screen.getByText('Subject');
    fireEvent.dragStart(subjectNode, {
      dataTransfer: {
        setData: jest.fn((type, data) => {
          console.log('Setting data transfer:', type, data);
        })
      }
    });

    // Drop the node onto the canvas - use the reactflow pane
    const dropArea = screen.getByTestId('rf__wrapper').querySelector('.react-flow__pane');
    if (!dropArea) throw new Error('Could not find .react-flow__pane element');
    fireEvent.drop(dropArea, {
      dataTransfer: {
        getData: jest.fn((type) => {
          console.log('Getting data transfer:', type);
          return 'Subject';
        })
      },
      clientX: 200,
      clientY: 150,
      preventDefault: jest.fn()
    });

    // Wait for the node to be created
    let createdNode: HTMLElement | null = null;
    await waitFor(() => {
      createdNode = screen.getByTestId(/^node-Subject/) as HTMLElement;
      expect(createdNode).toBeInTheDocument();
    });

    // Click on the node to select it
    if (!createdNode) throw new Error('Node was not created');
    fireEvent.click(createdNode);

    // Verify inspector panel shows the node's data
    await waitFor(() => {
      // Inspector header should be visible
      expect(screen.getByText('Inspector')).toBeInTheDocument();

      // Should show node type
      expect(screen.getByText('Node Type')).toBeInTheDocument();
      expect(screen.getByText('Subject')).toBeInTheDocument();

      // Should have label field
      const labelInput = screen.getByLabelText('Label');
      expect(labelInput).toBeInTheDocument();
      expect(labelInput).toHaveValue('Subject');
    });

    // Verify node has selected styling
    expect(createdNode).toHaveClass('selected');
  });

  /**
   * Test for Issue #2: Node dropping position should be correct
   */
  test('nodes should be positioned correctly when dropped', async () => {
    render(<App />);

    // Create a test node with specific coordinates
    const actionNode = screen.getByText('Action');
    fireEvent.dragStart(actionNode, {
      dataTransfer: { setData: jest.fn() }
    });

    const dropArea = screen.getByTestId('react-flow-pane');
    fireEvent.drop(dropArea, {
      dataTransfer: { getData: jest.fn(() => 'Action') },
      clientX: 300,
      clientY: 200,
      preventDefault: jest.fn()
    });

    // Wait for node to be created
    let createdNode: HTMLElement | null = null;
    await waitFor(() => {
      createdNode = screen.getByTestId(/^node-Action/) as HTMLElement;
      expect(createdNode).toBeInTheDocument();
    });

    // Verify the node position matches expected coordinates
    if (!createdNode) throw new Error('Node was not created');
    // Note: This test will fail if the project function in App.tsx isn't correctly implemented
    expect(createdNode).toHaveStyle({ left: '200px' }); // 300 - 100 from mock project function
    expect(createdNode).toHaveStyle({ top: '150px' });  // 200 - 50 from mock project function
  });

  /**
   * Test for Issue #3: Cursor should change based on interaction mode
   */
  test('cursor style should change based on interaction mode', async () => {
    render(<App />);

    // Check initial cursor style on nodes
    const actionNode = screen.getByText('Action');
    fireEvent.dragStart(actionNode, {
      dataTransfer: { setData: jest.fn() }
    });

    const dropArea = screen.getByTestId('react-flow-pane');
    fireEvent.drop(dropArea, {
      dataTransfer: { getData: jest.fn(() => 'Action') },
      clientX: 300,
      clientY: 200,
      preventDefault: jest.fn()
    });

    // Wait for node to be created
    let createdNode: HTMLElement | null = null;
    await waitFor(() => {
      createdNode = screen.getByTestId(/^node-Action/) as HTMLElement;
      expect(createdNode).toBeInTheDocument();
    });

    // Check that cursor style is 'grab' for nodes
    if (!createdNode) throw new Error('Node was not created');
    expect(createdNode).toHaveStyle({ cursor: 'grab' });

    // Future enhancement: Test cursor style changes during different interaction modes
  });

  /**
   * Test for Issue #4: Multiple nodes should not all drop off-screen
   */
  test('multiple nodes can be added at proper positions', async () => {
    render(<App />);

    // Drop first node
    const subjectNode = screen.getByText('Subject');
    fireEvent.dragStart(subjectNode, {
      dataTransfer: { setData: jest.fn() }
    });

    const dropArea = screen.getByTestId('react-flow-pane');
    fireEvent.drop(dropArea, {
      dataTransfer: { getData: jest.fn(() => 'Subject') },
      clientX: 100,
      clientY: 100,
      preventDefault: jest.fn()
    });

    // Wait for first node
    await waitFor(() => {
      const node1 = screen.getByTestId(/^node-Subject/);
      expect(node1).toBeInTheDocument();
    });

    // Drop second node
    const actionNode = screen.getByText('Action');
    fireEvent.dragStart(actionNode, {
      dataTransfer: { setData: jest.fn() }
    });

    // Get the pane again to ensure it's still in the DOM
    const flowPane = screen.getByTestId('rf__wrapper').querySelector('.react-flow__pane');
    if (!flowPane) throw new Error('Could not find .react-flow__pane element');
    fireEvent.drop(flowPane, {
      dataTransfer: { getData: jest.fn(() => 'Action') },
      clientX: 200,
      clientY: 200,
      preventDefault: jest.fn()
    });

    // Wait for second node
    await waitFor(() => {
      const node2 = screen.getByTestId(/^node-Action/);
      expect(node2).toBeInTheDocument();
    });

    // We should have two nodes with different positions
    const nodes = screen.getAllByTestId(/^node-/);
    expect(nodes).toHaveLength(2);

    // Type guard to ensure we're working with HTMLElements
    const areHTMLElements = nodes.every(node => node instanceof HTMLElement);
    expect(areHTMLElements).toBe(true);

    if (areHTMLElements && nodes.length >= 2) {
      // Nodes should have different positions - we compare positions manually
      const node1Style = window.getComputedStyle(nodes[0] as HTMLElement);
      const node2Style = window.getComputedStyle(nodes[1] as HTMLElement);
      expect(node1Style.left).not.toBe(node2Style.left);
      expect(node1Style.top).not.toBe(node2Style.top);
    }
  });
});
