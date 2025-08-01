/**
 * Tests for Node Context Menu
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { NodeContextMenu, ContextMenuPosition } from '../NodeContextMenu';

describe('NodeContextMenu', () => {
  const mockOnClose = jest.fn();
  const mockOnSaveAsPreset = jest.fn();
  const mockOnDuplicate = jest.fn();
  const mockOnDelete = jest.fn();

  const defaultPosition: ContextMenuPosition = { x: 100, y: 100 };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders when position is provided', () => {
    const { getByText } = render(
      <NodeContextMenu
        nodeId="node-1"
        nodeType="textBlock"
        position={defaultPosition}
        onClose={mockOnClose}
        onSaveAsPreset={mockOnSaveAsPreset}
      />
    );

    expect(getByText('Save as Preset')).toBeInTheDocument();
    expect(getByText('textBlock')).toBeInTheDocument();
  });

  it('does not render when position is null', () => {
    const { container } = render(
      <NodeContextMenu
        nodeId="node-1"
        nodeType="textBlock"
        position={null}
        onClose={mockOnClose}
        onSaveAsPreset={mockOnSaveAsPreset}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('calls onSaveAsPreset when clicked', () => {
    const { getByText } = render(
      <NodeContextMenu
        nodeId="node-1"
        nodeType="textBlock"
        position={defaultPosition}
        onClose={mockOnClose}
        onSaveAsPreset={mockOnSaveAsPreset}
      />
    );

    fireEvent.click(getByText('Save as Preset'));

    expect(mockOnSaveAsPreset).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('renders optional actions when provided', () => {
    const { getByText } = render(
      <NodeContextMenu
        nodeId="node-1"
        nodeType="textBlock"
        position={defaultPosition}
        onClose={mockOnClose}
        onSaveAsPreset={mockOnSaveAsPreset}
        onDuplicate={mockOnDuplicate}
        onDelete={mockOnDelete}
      />
    );

    expect(getByText('Duplicate')).toBeInTheDocument();
    expect(getByText('Delete')).toBeInTheDocument();
  });

  it('calls onDuplicate when clicked', () => {
    const { getByText } = render(
      <NodeContextMenu
        nodeId="node-1"
        nodeType="textBlock"
        position={defaultPosition}
        onClose={mockOnClose}
        onSaveAsPreset={mockOnSaveAsPreset}
        onDuplicate={mockOnDuplicate}
      />
    );

    fireEvent.click(getByText('Duplicate'));

    expect(mockOnDuplicate).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onDelete when clicked', () => {
    const { getByText } = render(
      <NodeContextMenu
        nodeId="node-1"
        nodeType="textBlock"
        position={defaultPosition}
        onClose={mockOnClose}
        onSaveAsPreset={mockOnSaveAsPreset}
        onDelete={mockOnDelete}
      />
    );

    fireEvent.click(getByText('Delete'));

    expect(mockOnDelete).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('closes on outside click', async () => {
    const { container } = render(
      <NodeContextMenu
        nodeId="node-1"
        nodeType="textBlock"
        position={defaultPosition}
        onClose={mockOnClose}
        onSaveAsPreset={mockOnSaveAsPreset}
      />
    );

    // Click outside
    fireEvent.mouseDown(document.body);

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('closes on Escape key', async () => {
    render(
      <NodeContextMenu
        nodeId="node-1"
        nodeType="textBlock"
        position={defaultPosition}
        onClose={mockOnClose}
        onSaveAsPreset={mockOnSaveAsPreset}
      />
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('positions menu within viewport bounds', () => {
    // Mock window dimensions
    Object.defineProperty(window, 'innerWidth', { value: 500, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: 500, writable: true });

    const { container } = render(
      <NodeContextMenu
        nodeId="node-1"
        nodeType="textBlock"
        position={{ x: 450, y: 450 }}
        onClose={mockOnClose}
        onSaveAsPreset={mockOnSaveAsPreset}
      />
    );

    const menu = container.querySelector('.node-context-menu') as HTMLElement;
    const style = window.getComputedStyle(menu);

    // Menu should be adjusted to stay within viewport
    expect(parseInt(style.left)).toBeLessThan(350); // 500 - 200 (menu width)
    expect(parseInt(style.top)).toBeLessThan(350); // 500 - 200 (menu height)
  });

  it('shows correct node type', () => {
    const { getByText, rerender } = render(
      <NodeContextMenu
        nodeId="node-1"
        nodeType="textBlock"
        position={defaultPosition}
        onClose={mockOnClose}
        onSaveAsPreset={mockOnSaveAsPreset}
      />
    );

    expect(getByText('textBlock')).toBeInTheDocument();

    rerender(
      <NodeContextMenu
        nodeId="node-2"
        nodeType="weightedChoice"
        position={defaultPosition}
        onClose={mockOnClose}
        onSaveAsPreset={mockOnSaveAsPreset}
      />
    );

    expect(getByText('weightedChoice')).toBeInTheDocument();
  });
});