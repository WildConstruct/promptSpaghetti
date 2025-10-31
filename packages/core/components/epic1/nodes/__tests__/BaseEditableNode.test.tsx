import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BaseEditableNode } from '../BaseEditableNode';
import { NodeProps } from 'reactflow';

// Mock React Flow hooks
jest.mock('reactflow', () => ({
  ...jest.requireActual('reactflow'),
  Handle: ({ type, position }: { type?: string; position?: string }) => (
    <div data-testid={`handle-${type}`} />
  ),
  Position: {
    Left: 'left',
    Right: 'right',
  },
}));

describe('BaseEditableNode', () => {
  const defaultProps: NodeProps = {
    id: 'test-node',
    data: {
      value: 'Test value',
      nodeType: 'test',
      onEdit: jest.fn(),
      onEditStart: jest.fn(),
      onEditEnd: jest.fn(),
    },
    selected: false,
    type: 'test',
    xPos: 0,
    yPos: 0,
    zIndex: 0,
    isConnectable: true,
    dragging: false,
  };

  const renderNode = (props = {}) => {
    const mergedProps = { ...defaultProps, ...props };
    return render(
      <BaseEditableNode {...mergedProps}>
        {({ isEditing, value, editBuffer, updateBuffer, confirmEdit, cancelEdit }) => (
          <div>
            {isEditing ? (
              <input
                data-testid="edit-input"
                value={editBuffer}
                onChange={(e) => updateBuffer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {confirmEdit();}
                  if (e.key === 'Escape') {cancelEdit();}
                }}
              />
            ) : (
              <div data-testid="display-value">{value}</div>
            )}
          </div>
        )}
      </BaseEditableNode>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders in display mode by default', () => {
    renderNode();
    expect(screen.getByTestId('display-value')).toHaveTextContent('Test value');
    expect(screen.queryByTestId('edit-input')).not.toBeInTheDocument();
  });

  test('enters edit mode on click', async () => {
    renderNode();
    const node = screen.getByTestId('display-value').parentElement?.parentElement;
    
    if (node) {
      fireEvent.click(node);
    }
    
    await waitFor(() => {
      expect(screen.getByTestId('edit-input')).toBeInTheDocument();
    });
    expect(defaultProps.data.onEditStart).toHaveBeenCalled();
  });

  test('updates edit buffer on input change', async () => {
    renderNode();
    const node = screen.getByTestId('display-value').parentElement?.parentElement;
    
    if (node) {
      fireEvent.click(node);
    }
    
    const input = await screen.findByTestId('edit-input');
    await userEvent.clear(input);
    await userEvent.type(input, 'New value');
    
    expect(input).toHaveValue('New value');
  });

  test('confirms edit on Enter key', async () => {
    renderNode();
    const node = screen.getByTestId('display-value').parentElement?.parentElement;
    
    if (node) {
      fireEvent.click(node);
    }
    
    const input = await screen.findByTestId('edit-input');
    await userEvent.clear(input);
    await userEvent.type(input, 'New value');
    
    fireEvent.keyDown(input, { key: 'Enter' });
    
    expect(defaultProps.data.onEdit).toHaveBeenCalledWith('New value');
    expect(defaultProps.data.onEditEnd).toHaveBeenCalled();
  });

  test('cancels edit on Escape key', async () => {
    renderNode();
    const node = screen.getByTestId('display-value').parentElement?.parentElement;
    
    if (node) {
      fireEvent.click(node);
    }
    
    const input = await screen.findByTestId('edit-input');
    await userEvent.clear(input);
    await userEvent.type(input, 'New value');
    
    fireEvent.keyDown(input, { key: 'Escape' });
    
    expect(defaultProps.data.onEdit).not.toHaveBeenCalled();
    expect(defaultProps.data.onEditEnd).toHaveBeenCalled();
    
    await waitFor(() => {
      expect(screen.getByTestId('display-value')).toHaveTextContent('Test value');
    });
  });

  test('confirms edit on click outside', async () => {
    renderNode();
    const node = screen.getByTestId('display-value').parentElement?.parentElement;
    
    if (node) {
      fireEvent.click(node);
    }
    
    const input = await screen.findByTestId('edit-input');
    await userEvent.clear(input);
    await userEvent.type(input, 'New value');
    
    // Click outside the node
    fireEvent.mouseDown(document.body);
    
    expect(defaultProps.data.onEdit).toHaveBeenCalledWith('New value');
    expect(defaultProps.data.onEditEnd).toHaveBeenCalled();
  });

  test('applies editing class when in edit mode', async () => {
    renderNode();
    const node = screen.getByTestId('display-value').parentElement?.parentElement;
    
    expect(node).not.toHaveClass('editing');
    
    if (node) {
      fireEvent.click(node);
    }
    
    await waitFor(() => {
      expect(node).toHaveClass('editing');
    });
  });

  test('applies selected class when selected', () => {
    renderNode({ selected: true });
    const node = screen.getByTestId('display-value').parentElement?.parentElement;
    
    expect(node).toHaveClass('selected');
  });

  test('renders handles', () => {
    renderNode();
    
    expect(screen.getByTestId('handle-target')).toBeInTheDocument();
    expect(screen.getByTestId('handle-source')).toBeInTheDocument();
  });

  test('shows edit indicator when editing', async () => {
    renderNode();
    const node = screen.getByTestId('display-value').parentElement?.parentElement;
    
    if (node) {
      fireEvent.click(node);
    }
    
    await waitFor(() => {
      const editIndicator = node?.querySelector('.epic1-edit-indicator');
      expect(editIndicator).toBeInTheDocument();
    });
  });

  test('shows selected indicator when selected but not editing', () => {
    renderNode({ selected: true });
    const node = screen.getByTestId('display-value').parentElement?.parentElement;
    
    const selectedIndicator = node?.querySelector('.epic1-selected-indicator');
    expect(selectedIndicator).toBeInTheDocument();
  });
});