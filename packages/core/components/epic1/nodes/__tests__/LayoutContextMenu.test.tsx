import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { LayoutContextMenu } from '../LayoutContextMenu';

const defaultProps = {
  mode: 'node' as const,
  position: { x: 100, y: 120 },
  nodeType: 'textBlock',
  selectedCount: 3,
  totalNodeCount: 4,
  onClose: jest.fn(),
  onNeatenSelection: jest.fn(),
  onCleanupSelection: jest.fn(),
  onAlignHorizontal: jest.fn(),
  onAlignVertical: jest.fn(),
  onDistributeHorizontal: jest.fn(),
  onDistributeVertical: jest.fn(),
  onDuplicate: jest.fn(),
  onDelete: jest.fn(),
  onNeatenAll: jest.fn(),
  onCleanupAll: jest.fn(),
  onFitView: jest.fn(),
  onSetGridSize: jest.fn(),
  onSetRowSnap: jest.fn()
};

function renderMenu(
  props: Partial<React.ComponentProps<typeof LayoutContextMenu>> = {}
) {
  const mergedProps = { ...defaultProps, ...props };
  return render(<LayoutContextMenu {...mergedProps} />);
}

describe('LayoutContextMenu', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders node layout actions', () => {
    renderMenu();

    expect(screen.getByRole('menu', { name: 'Graph context menu' })).toBeInTheDocument();
    expect(screen.getByText('Text Block')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Neaten Selection' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Clean Up Selection' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Align Horizontal' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Distribute Vertical' })).toBeEnabled();
  });

  it('runs selection cleanup and closes after an action', () => {
    renderMenu();

    fireEvent.click(screen.getByRole('button', { name: 'Neaten Selection' }));

    expect(defaultProps.onNeatenSelection).toHaveBeenCalledTimes(1);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('disables align and distribute actions when the selection is too small', () => {
    renderMenu({ selectedCount: 1 });

    expect(
      screen.getByRole('button', { name: 'Align Horizontal (2+ nodes)' })
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Distribute Vertical (3+ nodes)' })
    ).toBeDisabled();

    fireEvent.click(
      screen.getByRole('button', { name: 'Align Horizontal (2+ nodes)' })
    );
    expect(defaultProps.onAlignHorizontal).not.toHaveBeenCalled();
  });

  it('renders canvas cleanup actions and preset controls', () => {
    renderMenu({ mode: 'canvas', selectedCount: 0 });

    fireEvent.click(screen.getByRole('button', { name: 'Clean Up All' }));
    expect(defaultProps.onCleanupAll).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Grid 40' }));
    expect(defaultProps.onSetGridSize).toHaveBeenCalledWith(40);
  });

  it('closes on Escape and outside click', () => {
    renderMenu();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);

    fireEvent.mouseDown(document.body);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(2);
  });

  it('does not render without an active mode or position', () => {
    const { rerender } = renderMenu({ mode: null });
    expect(screen.queryByTestId('layout-context-menu')).not.toBeInTheDocument();

    rerender(<LayoutContextMenu {...defaultProps} position={null} />);
    expect(screen.queryByTestId('layout-context-menu')).not.toBeInTheDocument();
  });
});
