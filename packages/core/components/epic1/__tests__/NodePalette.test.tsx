import React from 'react';
import { render, screen } from '@testing-library/react';
import { NodePalette, nodeTypes } from '../NodePalette';

describe('NodePalette', () => {
  it('places Note immediately after Region Box in the organization tools', () => {
    const regionIndex = nodeTypes.findIndex(node => node.type === 'enhancedBoundingBox');
    const noteIndex = nodeTypes.findIndex(node => node.type === 'postItNote');

    expect(regionIndex).toBeGreaterThanOrEqual(0);
    expect(noteIndex).toBe(regionIndex + 1);
    expect(nodeTypes[noteIndex]).toMatchObject({
      label: 'Note',
      category: 'Organization',
    });
  });

  it('renders a draggable Note item', () => {
    render(<NodePalette />);

    expect(screen.getByText('Note')).toBeInTheDocument();
  });
});
