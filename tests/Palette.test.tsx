import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Palette } from '../packages/core/Palette';

describe('Palette component', () => {
  const nodes = [
    {
      id: 'WeightedChoice',
      label: 'WeightedChoice',
      icon: '🔀',
      tooltip: 'Branch'
    }
  ];
  it('renders node icons and tooltips', () => {
    render(
      <Palette nodes={nodes as unknown} collapsed={false} onToggle={() => {
        // No toggle action needed for test
      }} />
    );
    expect(screen.getByLabelText(/WeightedChoice/)).toBeTruthy();
  });

  it('sets drag data on dragStart', () => {
    const mockDragStart = jest.fn();
    render(
      <Palette
        nodes={nodes as unknown}
        collapsed={false}
        onToggle={() => {
          // No toggle action needed for test
        }}
        onDragStart={mockDragStart}
      />
    );
    const btn = screen.getByRole('button', { name: /WeightedChoice/ });
    fireEvent.dragStart(btn, {
      dataTransfer: {
        setData: jest.fn()
      }
    } as unknown as DragEvent);
    expect(mockDragStart).toHaveBeenCalledWith('WeightedChoice');
  });
});
