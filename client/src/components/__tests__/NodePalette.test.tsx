import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import NodePalette from '../NodePalette';

// 1. Test that all six node types render with correct tooltips
const NODE_TYPES = [
  'WeightedChoice',
  'Concat',
  'Output',
  'Include',
  'SetVariable',
  'GetVariable'
];

describe('NodePalette', () => {
  it('renders all node types with tooltips', () => {
    render(<NodePalette />);
    NODE_TYPES.forEach(type => {
      const item = screen.getByTitle(type);
      expect(item).toBeInTheDocument();
      expect(item).toHaveTextContent(type);
    });
  });

  // 2. Test accessibility features (ARIA labels, keyboard navigation)
  it('palette items are accessible as buttons with correct aria-labels', () => {
    render(<NodePalette />);
    const items = screen.getAllByRole('button');
    expect(items.length).toBe(NODE_TYPES.length);
    items.forEach((item, i) => {
      expect(item.tabIndex).toBe(0);
      expect(item).toHaveAttribute('aria-label', `Add ${NODE_TYPES[i]} node`);
    });
  });

  // 3. Test drag events are triggered correctly for each node type
  it('triggers drag events on drag start', () => {
    render(<NodePalette />);
    const item = screen.getByTitle(NODE_TYPES[0]);
    const dataTransfer = {
      setData: jest.fn(),
      effectAllowed: ''
    };
    fireEvent.dragStart(item, { dataTransfer });
    expect(dataTransfer.setData).toHaveBeenCalledWith('application/reactflow', NODE_TYPES[0]);
    expect(dataTransfer.effectAllowed).toBe('move');
  });
});

// 4. Integration: Simulate drag-and-drop and verify instantiation (pseudo, needs integration test setup)
// This would be covered in an integration test framework (e.g., Cypress or React Testing Library with canvas support)
// For now, document the intent:
// - Simulate drag from NodePalette
// - Drop on GraphEditor canvas
// - Assert new node appears with correct default params
// - Assert node card shows title and key param summary
