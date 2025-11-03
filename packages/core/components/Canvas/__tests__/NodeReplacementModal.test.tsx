import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
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

  const renderModal = (
    override: Partial<React.ComponentProps<typeof NodeReplacementModal>> = {}
  ) => render(<NodeReplacementModal {...defaultProps} {...override} />);

  const createUser = () => {
    const user = userEvent.setup();
    return {
      click: async (element: Element) => {
        await act(async () => {
          await user.click(element);
        });
      },
      type: async (element: HTMLElement, text: string) => {
        await act(async () => {
          await user.type(element, text);
        });
      },
      keyboard: async (input: string) => {
        await act(async () => {
          await user.keyboard(input);
        });
      },
      selectOptions: async (
        element: HTMLSelectElement,
        values: string | string[]
      ) => {
        await act(async () => {
          await user.selectOptions(element, values);
        });
      }
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render when open', () => {
      renderModal();
      expect(screen.getByTestId('node-replacement-modal')).toBeInTheDocument();
    });

    it('should not render when closed', () => {
      renderModal({ isOpen: false });
      expect(
        screen.queryByTestId('node-replacement-modal')
      ).not.toBeInTheDocument();
    });

    it('should display selected node information', () => {
      renderModal();
      expect(screen.getByText(/replacing.*text block/i)).toBeInTheDocument();
      expect(screen.getByText('Original text')).toBeInTheDocument();
    });

    it('should show all available node types', () => {
      renderModal();

      mockNodeTypes.forEach(nodeType => {
        expect(
          screen.getByTestId(`node-type-${nodeType.type}`)
        ).toBeInTheDocument();
      });
    });
  });

  describe('Node Selection', () => {
    it('should highlight compatible node types', () => {
      renderModal();

      const textBlockOption = screen.getByTestId('node-type-textBlock');
      const outputOption = screen.getByTestId('node-type-output');

      expect(textBlockOption).toHaveClass('compatible');
      expect(outputOption).toHaveClass('compatible');
    });

    it('should allow selecting a replacement type', async () => {
      renderModal();
      const user = createUser();

      const outputOption = screen.getByTestId('node-type-output');
      await user.click(outputOption);

      await waitFor(() => expect(outputOption).toHaveClass('selected'));
    });

    it('should show preview of replacement', async () => {
      renderModal();
      const user = createUser();

      const outputOption = screen.getByTestId('node-type-output');
      await user.click(outputOption);

      const preview = await screen.findByTestId('replacement-preview');
      expect(preview).toHaveTextContent(
        /output node will replace the current node/i
      );
    });
  });

  describe('Replacement Actions', () => {
    it('should handle single node replacement', async () => {
      renderModal();
      const user = createUser();

      const outputOption = screen.getByTestId('node-type-output');
      await user.click(outputOption);

      const replaceButton = screen.getByRole('button', {
        name: /^replace node$/i
      });
      await user.click(replaceButton);

      await waitFor(() =>
        expect(defaultProps.onReplace).toHaveBeenCalledWith(
          'node-1',
          'output',
          expect.any(Object)
        )
      );
      await waitFor(() => expect(defaultProps.onClose).toHaveBeenCalled());
    });

    it('should handle batch replacement of same type', async () => {
      renderModal();
      const user = createUser();

      const outputOption = screen.getByTestId('node-type-output');
      await user.click(outputOption);

      const batchCheckbox = screen.getByLabelText(
        /replace all text block nodes/i
      );
      await user.click(batchCheckbox);

      const replaceButton = screen.getByRole('button', {
        name: /replace all/i
      });
      await user.click(replaceButton);

      await waitFor(() =>
        expect(defaultProps.onBatchReplace).toHaveBeenCalledWith(
          'textBlock',
          'output',
          expect.any(Object)
        )
      );
    });

    it('should show confirmation for batch operations', async () => {
      renderModal();
      const user = createUser();

      const outputOption = screen.getByTestId('node-type-output');
      await user.click(outputOption);

      const batchCheckbox = screen.getByLabelText(/replace all/i);
      await user.click(batchCheckbox);

      expect(
        screen.getByText(/this will replace \d+ nodes/i)
      ).toBeInTheDocument();
    });
  });

  describe('Data Migration', () => {
    it('should show data migration options when applicable', async () => {
      renderModal();
      const user = createUser();

      const variableOption = screen.getByTestId('node-type-variable');
      await user.click(variableOption);

      expect(screen.getByText(/migrate data/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/preserve content/i)).toBeInTheDocument();
    });

    it('should handle data transformation', async () => {
      renderModal();
      const user = createUser();

      const variableOption = screen.getByTestId('node-type-variable');
      await user.click(variableOption);

      const preserveCheckbox = screen.getByLabelText(/preserve content/i);
      await user.click(preserveCheckbox);

      const replaceButton = screen.getByRole('button', {
        name: /^replace node$/i
      });
      await user.click(replaceButton);

      await waitFor(() =>
        expect(defaultProps.onReplace).toHaveBeenCalledWith(
          'node-1',
          'variable',
          expect.objectContaining({
            preserveData: true,
            dataMapping: expect.any(Object)
          })
        )
      );
    });

    it('should warn about data loss', async () => {
      renderModal();
      const user = createUser();

      const outputOption = screen.getByTestId('node-type-output');
      await user.click(outputOption);

      expect(
        screen.getByText(/warning: some connections may be lost/i)
      ).toBeInTheDocument();
    });
  });

  describe('Search and Filter', () => {
    it('should filter node types by search', async () => {
      renderModal();
      const user = createUser();

      const searchInput = screen.getByPlaceholderText(
        /search node types/i
      ) as HTMLInputElement;
      await user.type(searchInput, 'weight');

      await waitFor(() => {
        expect(
          screen.getByTestId('node-type-weightedChoice')
        ).toBeInTheDocument();
        expect(
          screen.queryByTestId('node-type-textBlock')
        ).not.toBeInTheDocument();
        expect(
          screen.queryByTestId('node-type-variable')
        ).not.toBeInTheDocument();
      });
    });

    it('should show categories', () => {
      renderModal();

      expect(
        screen.getByRole('heading', { name: /basic nodes/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { name: /flow control/i })
      ).toBeInTheDocument();
    });

    it('should filter by category', async () => {
      renderModal();
      const user = createUser();

      const categoryFilter = screen.getByLabelText(
        /filter by category/i
      ) as HTMLSelectElement;
      await user.selectOptions(categoryFilter, 'flow');

      expect(
        screen.getByTestId('node-type-weightedChoice')
      ).toBeInTheDocument();
      expect(
        screen.queryByTestId('node-type-textBlock')
      ).not.toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should close on Escape key', async () => {
      renderModal();
      const user = createUser();

      await user.keyboard('{Escape}');

      await waitFor(() => expect(defaultProps.onClose).toHaveBeenCalled());
    });

    it('should navigate options with arrow keys', async () => {
      renderModal();
      const user = createUser();

      const firstOption = screen.getByTestId(
        'node-type-textBlock'
      ) as HTMLButtonElement;
      firstOption.focus();

      await user.keyboard('{ArrowDown}');

      const secondOption = screen.getByTestId('node-type-variable');
      expect(document.activeElement).toBe(secondOption);
    });

    it('should select with Enter key', async () => {
      renderModal();
      const user = createUser();

      const outputOption = screen.getByTestId(
        'node-type-output'
      ) as HTMLButtonElement;
      outputOption.focus();

      await user.keyboard('{Enter}');

      await waitFor(() => expect(outputOption).toHaveClass('selected'));
    });
  });

  describe('Validation', () => {
    it('should disable replace button without selection', () => {
      renderModal();

      const replaceButton = screen.getByRole('button', {
        name: /^replace node$/i
      });
      expect(replaceButton).toBeDisabled();
    });

    it('should validate node connections compatibility', () => {
      const nodeWithConnections = {
        ...mockNodes[0],
        data: { ...mockNodes[0].data, inputs: ['input1'], outputs: ['output1'] }
      };

      renderModal({ selectedNode: nodeWithConnections });

      const incompatibleOption = screen.getByTestId('node-type-output');
      expect(incompatibleOption).toHaveClass('incompatible');
      expect(incompatibleOption).toHaveAttribute(
        'title',
        expect.stringContaining('Cannot replace with output')
      );
    });

    it('should show connection warnings', async () => {
      renderModal();
      const user = createUser();

      const outputOption = screen.getByTestId('node-type-output');
      await user.click(outputOption);

      expect(screen.getByText(/connections.*adjusted/i)).toBeInTheDocument();
    });
  });

  describe('Undo Support', () => {
    it('should show undo information', () => {
      renderModal();

      expect(
        screen.getByText(/this action can be undone/i)
      ).toBeInTheDocument();
    });

    it('should track replacement history', async () => {
      const user = createUser();
      const { rerender } = renderModal();

      const outputOption = screen.getByTestId('node-type-output');
      await user.click(outputOption);

      const replaceButton = screen.getByRole('button', {
        name: /^replace node$/i
      });
      await user.click(replaceButton);

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

      renderModal({ availableNodeTypes: manyNodeTypes });

      expect(screen.getByText('Node Type 0')).toBeInTheDocument();
      expect(screen.getByText('Node Type 99')).toBeInTheDocument();
    });

    it('should debounce search input', async () => {
      const onSearch = jest.fn();
      renderModal({ onSearch });

      const user = createUser();
      const searchInput = screen.getByPlaceholderText(
        /search/i
      ) as HTMLInputElement;

      await user.type(searchInput, 'test');

      await waitFor(() => {
        expect(onSearch).toHaveBeenCalledTimes(1);
      });
    });
  });
});
