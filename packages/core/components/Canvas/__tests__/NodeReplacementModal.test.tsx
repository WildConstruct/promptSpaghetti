import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { NodeReplacementModal } from '../NodeReplacementModal';
import { NodeType } from '../../../types';

describe('NodeReplacementModal', () => {
  const mockNodes = [
    {
      id: 'node-1',
      type: 'textBlock',
      data: { content: 'Original text' },
      position: { x: 0, y: 0 }
    },
    {
      id: 'node-2',
      type: 'variable',
      data: { name: 'heroName' },
      position: { x: 100, y: 0 }
    },
    {
      id: 'node-3',
      type: 'weightedChoice',
      data: { options: ['A', 'B'] },
      position: { x: 200, y: 0 }
    }
  ];

  const mockNodeTypes: NodeType[] = [
    { type: 'textBlock', label: 'Text Block', icon: '📝' },
    { type: 'variable', label: 'Variable', icon: '🔤' },
    { type: 'weightedChoice', label: 'Weighted Choice', icon: '⚖️' },
    { type: 'output', label: 'Output', icon: '📤' },
    { type: 'concat', label: 'Concatenate', icon: '🔗' }
  ];

  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    selectedNode: mockNodes[0],
    availableNodeTypes: mockNodeTypes,
    onReplace: jest.fn(),
    onBatchReplace: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render when open', () => {
      render(<NodeReplacementModal {...defaultProps} />);
      expect(screen.getByTestId('node-replacement-modal')).toBeInTheDocument();
    });

    it('should not render when closed', () => {
      render(<NodeReplacementModal {...defaultProps} isOpen={false} />);
      expect(
        screen.queryByTestId('node-replacement-modal')
      ).not.toBeInTheDocument();
    });

    it('should display selected node information', () => {
      render(<NodeReplacementModal {...defaultProps} />);
      expect(screen.getByText(/replacing.*text block/i)).toBeInTheDocument();
      expect(screen.getByText('Original text')).toBeInTheDocument();
    });

    it('should show all available node types', () => {
      render(<NodeReplacementModal {...defaultProps} />);

      mockNodeTypes.forEach(nodeType => {
        expect(screen.getByText(nodeType.label)).toBeInTheDocument();
      });
    });
  });

  describe('Node Selection', () => {
    it('should highlight compatible node types', () => {
      render(<NodeReplacementModal {...defaultProps} />);

      const textBlockOption = screen.getByTestId('node-type-textBlock');
      const outputOption = screen.getByTestId('node-type-output');

      expect(textBlockOption).toHaveClass('compatible');
      expect(outputOption).toHaveClass('compatible');
    });

    it('should allow selecting a replacement type', () => {
      render(<NodeReplacementModal {...defaultProps} />);

      const outputOption = screen.getByTestId('node-type-output');
      fireEvent.click(outputOption);

      expect(outputOption).toHaveClass('selected');
    });

    it('should show preview of replacement', async () => {
      render(<NodeReplacementModal {...defaultProps} />);

      const outputOption = screen.getByTestId('node-type-output');
      fireEvent.click(outputOption);

      await waitFor(() => {
        expect(screen.getByText(/preview/i)).toBeInTheDocument();
        expect(screen.getByText(/output node/i)).toBeInTheDocument();
      });
    });
  });

  describe('Replacement Actions', () => {
    it('should handle single node replacement', async () => {
      render(<NodeReplacementModal {...defaultProps} />);

      const outputOption = screen.getByTestId('node-type-output');
      fireEvent.click(outputOption);

      const replaceButton = screen.getByText(/replace node/i);
      fireEvent.click(replaceButton);

      expect(defaultProps.onReplace).toHaveBeenCalledWith(
        'node-1',
        'output',
        expect.any(Object)
      );
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should handle batch replacement of same type', async () => {
      render(<NodeReplacementModal {...defaultProps} />);

      const outputOption = screen.getByTestId('node-type-output');
      fireEvent.click(outputOption);

      const batchCheckbox = screen.getByLabelText(
        /replace all text block nodes/i
      );
      fireEvent.click(batchCheckbox);

      const replaceButton = screen.getByText(/replace all/i);
      fireEvent.click(replaceButton);

      expect(defaultProps.onBatchReplace).toHaveBeenCalledWith(
        'textBlock',
        'output',
        expect.any(Object)
      );
    });

    it('should show confirmation for batch operations', async () => {
      render(<NodeReplacementModal {...defaultProps} />);

      const outputOption = screen.getByTestId('node-type-output');
      fireEvent.click(outputOption);

      const batchCheckbox = screen.getByLabelText(/replace all/i);
      fireEvent.click(batchCheckbox);

      expect(
        screen.getByText(/this will replace \d+ nodes/i)
      ).toBeInTheDocument();
    });
  });

  describe('Data Migration', () => {
    it('should show data migration options when applicable', () => {
      render(<NodeReplacementModal {...defaultProps} />);

      const variableOption = screen.getByTestId('node-type-variable');
      fireEvent.click(variableOption);

      expect(screen.getByText(/migrate data/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/preserve content/i)).toBeInTheDocument();
    });

    it('should handle data transformation', async () => {
      render(<NodeReplacementModal {...defaultProps} />);

      const variableOption = screen.getByTestId('node-type-variable');
      fireEvent.click(variableOption);

      const preserveCheckbox = screen.getByLabelText(/preserve content/i);
      fireEvent.click(preserveCheckbox);

      const replaceButton = screen.getByText(/replace node/i);
      fireEvent.click(replaceButton);

      expect(defaultProps.onReplace).toHaveBeenCalledWith(
        'node-1',
        'variable',
        expect.objectContaining({
          preserveData: true,
          dataMapping: expect.any(Object)
        })
      );
    });

    it('should warn about data loss', () => {
      render(<NodeReplacementModal {...defaultProps} />);

      const outputOption = screen.getByTestId('node-type-output');
      fireEvent.click(outputOption);

      expect(screen.getByText(/warning.*data.*lost/i)).toBeInTheDocument();
    });
  });

  describe('Search and Filter', () => {
    it('should filter node types by search', async () => {
      render(<NodeReplacementModal {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText(/search node types/i);
      await userEvent.type(searchInput, 'weight');

      await waitFor(() => {
        expect(screen.getByText('Weighted Choice')).toBeInTheDocument();
        expect(screen.queryByText('Text Block')).not.toBeInTheDocument();
        expect(screen.queryByText('Variable')).not.toBeInTheDocument();
      });
    });

    it('should show categories', () => {
      render(<NodeReplacementModal {...defaultProps} />);

      expect(screen.getByText(/basic nodes/i)).toBeInTheDocument();
      expect(screen.getByText(/flow control/i)).toBeInTheDocument();
    });

    it('should filter by category', () => {
      render(<NodeReplacementModal {...defaultProps} />);

      const categoryFilter = screen.getByLabelText(/filter by category/i);
      fireEvent.change(categoryFilter, { target: { value: 'flow' } });

      expect(screen.getByText('Weighted Choice')).toBeInTheDocument();
      expect(screen.queryByText('Text Block')).not.toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should close on Escape key', () => {
      render(<NodeReplacementModal {...defaultProps} />);

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should navigate options with arrow keys', () => {
      render(<NodeReplacementModal {...defaultProps} />);

      const firstOption = screen.getByTestId('node-type-textBlock');
      firstOption.focus();

      fireEvent.keyDown(firstOption, { key: 'ArrowDown' });

      const secondOption = screen.getByTestId('node-type-variable');
      expect(document.activeElement).toBe(secondOption);
    });

    it('should select with Enter key', () => {
      render(<NodeReplacementModal {...defaultProps} />);

      const outputOption = screen.getByTestId('node-type-output');
      outputOption.focus();

      fireEvent.keyDown(outputOption, { key: 'Enter' });

      expect(outputOption).toHaveClass('selected');
    });
  });

  describe('Validation', () => {
    it('should disable replace button without selection', () => {
      render(<NodeReplacementModal {...defaultProps} />);

      const replaceButton = screen.getByText(/replace node/i);
      expect(replaceButton).toBeDisabled();
    });

    it('should validate node connections compatibility', () => {
      const nodeWithConnections = {
        ...mockNodes[0],
        data: { ...mockNodes[0].data, inputs: ['input1'], outputs: ['output1'] }
      };

      render(
        <NodeReplacementModal
          {...defaultProps}
          selectedNode={nodeWithConnections}
        />
      );

      const incompatibleOption = screen.getByTestId('node-type-output');
      expect(incompatibleOption).toHaveClass('incompatible');
      expect(incompatibleOption).toHaveAttribute(
        'title',
        expect.stringContaining('incompatible')
      );
    });

    it('should show connection warnings', () => {
      render(<NodeReplacementModal {...defaultProps} />);

      const outputOption = screen.getByTestId('node-type-output');
      fireEvent.click(outputOption);

      expect(screen.getByText(/connections.*adjusted/i)).toBeInTheDocument();
    });
  });

  describe('Undo Support', () => {
    it('should show undo information', () => {
      render(<NodeReplacementModal {...defaultProps} />);

      expect(
        screen.getByText(/this action can be undone/i)
      ).toBeInTheDocument();
    });

    it('should track replacement history', async () => {
      const { rerender } = render(<NodeReplacementModal {...defaultProps} />);

      const outputOption = screen.getByTestId('node-type-output');
      fireEvent.click(outputOption);

      const replaceButton = screen.getByText(/replace node/i);
      fireEvent.click(replaceButton);

      // Simulate showing history
      rerender(<NodeReplacementModal {...defaultProps} showHistory={true} />);

      expect(screen.getByText(/recent replacements/i)).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should handle large node lists efficiently', () => {
      const manyNodeTypes = Array.from({ length: 100 }, (_, i) => ({
        type: `node-${i}`,
        label: `Node Type ${i}`,
        icon: '📦'
      }));

      render(
        <NodeReplacementModal
          {...defaultProps}
          availableNodeTypes={manyNodeTypes}
        />
      );

      expect(screen.getByText('Node Type 0')).toBeInTheDocument();
      expect(screen.getByText('Node Type 99')).toBeInTheDocument();
    });

    it('should debounce search input', async () => {
      const onSearch = jest.fn();
      render(<NodeReplacementModal {...defaultProps} onSearch={onSearch} />);

      const searchInput = screen.getByPlaceholderText(/search/i);

      await userEvent.type(searchInput, 'test');

      await waitFor(() => {
        // Should be called once after debounce, not 4 times
        expect(onSearch).toHaveBeenCalledTimes(1);
      });
    });
  });
});
