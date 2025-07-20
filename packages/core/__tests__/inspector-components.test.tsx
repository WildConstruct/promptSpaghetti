import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

// Import Inspector components
import { InspectorPanel } from '../components/Inspector/InspectorPanel';
import { InspectorPanelWithContext } from '../components/Inspector/InspectorPanelWithContext';
import { BaseNodeEditor } from '../components/Inspector/BaseNodeEditor';
import { TextFieldEditor } from '../components/Inspector/TextFieldEditor';
import { TextAreaEditor } from '../components/Inspector/TextAreaEditor';
import { SelectEditor } from '../components/Inspector/SelectEditor';
import { CollapsibleSection } from '../components/Inspector/CollapsibleSection';
import { PropertiesSection } from '../components/Inspector/PropertiesSection';
import { PreviewSection } from '../components/Inspector/PreviewSection';
import { VariationList } from '../components/Inspector/VariationList';
import { SimpleVariationList } from '../components/Inspector/SimpleVariationList';

// Import node-specific editors
import { WeightedChoiceEditor } from '../components/Inspector/editors/WeightedChoiceEditor';
import { ConcatEditor } from '../components/Inspector/editors/ConcatEditor';
import { OutputEditor } from '../components/Inspector/editors/OutputEditor';
import { VariableEditor } from '../components/Inspector/editors/VariableEditor';
import { SubjectEditor } from '../components/Inspector/editors/SubjectEditor';
import { ActionEditor } from '../components/Inspector/editors/ActionEditor';
import { PythonTransformEditor } from '../components/Inspector/editors/PythonTransformEditor';

// Mock dependencies
jest.mock('reactflow', () => ({
  useReactFlow: () => ({
    getNodes: jest.fn(() => []),
    getEdges: jest.fn(() => []),
    setNodes: jest.fn(),
    setEdges: jest.fn()
  })
}));

jest.mock('../hooks/useNodeUtils', () => ({
  useNodeUtils: () => ({
    updateNodeData: jest.fn(),
    deleteNode: jest.fn()
  })
}));

jest.mock('../graphStore', () => ({
  useGraphStore: () => ({
    selectedNodeId: 'test-node-id',
    nodes: [
      {
        id: 'test-node-id',
        type: 'WeightedChoice',
        data: {
          choices: [
            { weight: 0.5, value: 'Option A' },
            { weight: 0.5, value: 'Option B' }
          ]
        }
      }
    ],
    updateNode: jest.fn()
  })
}));

describe('Inspector Components - 80% Coverage Target', () => {
  describe('InspectorPanel', () => {
    it('should render with selected node', () => {
      render(
        <InspectorPanel
          selectedNodeId="test-node-id"
          onClose={() => {}}
        />
      );

      expect(screen.getByText(/Node Properties/i)).toBeInTheDocument();
    });

    it('should show "No node selected" when no node is selected', () => {
      render(
        <InspectorPanel
          selectedNodeId={null}
          onClose={() => {}}
        />
      );

      expect(screen.getByText(/No node selected/i)).toBeInTheDocument();
    });

    it('should call onClose when close button is clicked', () => {
      const onClose = jest.fn();
      render(
        <InspectorPanel
          selectedNodeId="test-node-id"
          onClose={onClose}
        />
      );

      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('BaseNodeEditor', () => {
    const mockNode = {
      id: 'test-node',
      type: 'TestNode',
      data: { testProp: 'testValue' }
    };

    it('should render node editor with title', () => {
      render(
        <BaseNodeEditor
          node={mockNode}
          title="Test Node Editor"
        >
          <div>Test Content</div>
        </BaseNodeEditor>
      );

      expect(screen.getByText('Test Node Editor')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should render description when provided', () => {
      render(
        <BaseNodeEditor
          node={mockNode}
          title="Test Node"
          description="This is a test description"
        >
          <div>Content</div>
        </BaseNodeEditor>
      );

      expect(screen.getByText('This is a test description')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <BaseNodeEditor
          node={mockNode}
          title="Test Node"
          className="custom-class"
        >
          <div>Content</div>
        </BaseNodeEditor>
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('TextFieldEditor', () => {
    it('should render with label and value', () => {
      render(
        <TextFieldEditor
          label="Test Label"
          value="Test Value"
          onChange={() => {}}
        />
      );

      expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Value')).toBeInTheDocument();
    });

    it('should call onChange when input changes', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();

      render(
        <TextFieldEditor
          label="Test"
          value=""
          onChange={onChange}
        />
      );

      const input = screen.getByRole('textbox');
      await user.type(input, 'New Value');

      expect(onChange).toHaveBeenCalledWith('New Value');
    });

    it('should show placeholder when provided', () => {
      render(
        <TextFieldEditor
          label="Test"
          value=""
          onChange={() => {}}
          placeholder="Enter value..."
        />
      );

      expect(screen.getByPlaceholderText('Enter value...')).toBeInTheDocument();
    });

    it('should be disabled when disabled prop is true', () => {
      render(
        <TextFieldEditor
          label="Test"
          value="Value"
          onChange={() => {}}
          disabled={true}
        />
      );

      expect(screen.getByRole('textbox')).toBeDisabled();
    });
  });

  describe('TextAreaEditor', () => {
    it('should render with label and value', () => {
      render(
        <TextAreaEditor
          label="Test TextArea"
          value="Multi\nLine\nText"
          onChange={() => {}}
        />
      );

      expect(screen.getByLabelText('Test TextArea')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Multi\nLine\nText')).toBeInTheDocument();
    });

    it('should respect rows prop', () => {
      render(
        <TextAreaEditor
          label="Test"
          value=""
          onChange={() => {}}
          rows={10}
        />
      );

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('rows', '10');
    });

    it('should handle onChange events', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();

      render(
        <TextAreaEditor
          label="Test"
          value=""
          onChange={onChange}
        />
      );

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'New Text');

      expect(onChange).toHaveBeenCalledWith('New Text');
    });
  });

  describe('SelectEditor', () => {
    const options = [
      { value: 'opt1', label: 'Option 1' },
      { value: 'opt2', label: 'Option 2' },
      { value: 'opt3', label: 'Option 3' }
    ];

    it('should render with label and options', () => {
      render(
        <SelectEditor
          label="Select Test"
          value="opt1"
          options={options}
          onChange={() => {}}
        />
      );

      expect(screen.getByLabelText('Select Test')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Option 1')).toBeInTheDocument();
    });

    it('should call onChange when selection changes', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();

      render(
        <SelectEditor
          label="Test"
          value="opt1"
          options={options}
          onChange={onChange}
        />
      );

      const select = screen.getByRole('combobox');
      await user.selectOptions(select, 'opt2');

      expect(onChange).toHaveBeenCalledWith('opt2');
    });

    it('should show placeholder when no value selected', () => {
      render(
        <SelectEditor
          label="Test"
          value=""
          options={options}
          onChange={() => {}}
          placeholder="Choose an option..."
        />
      );

      expect(screen.getByText('Choose an option...')).toBeInTheDocument();
    });
  });

  describe('CollapsibleSection', () => {
    it('should toggle content visibility when clicked', async () => {
      const user = userEvent.setup();

      render(
        <CollapsibleSection title="Test Section" defaultOpen={false}>
          <div>Hidden Content</div>
        </CollapsibleSection>
      );

      // Content should be hidden initially
      expect(screen.queryByText('Hidden Content')).not.toBeInTheDocument();

      // Click to expand
      const header = screen.getByText('Test Section');
      await user.click(header);

      // Content should be visible
      expect(screen.getByText('Hidden Content')).toBeInTheDocument();

      // Click to collapse
      await user.click(header);

      // Content should be hidden again
      expect(screen.queryByText('Hidden Content')).not.toBeInTheDocument();
    });

    it('should be open by default when defaultOpen is true', () => {
      render(
        <CollapsibleSection title="Test Section" defaultOpen={true}>
          <div>Visible Content</div>
        </CollapsibleSection>
      );

      expect(screen.getByText('Visible Content')).toBeInTheDocument();
    });
  });

  describe('WeightedChoiceEditor', () => {
    const mockNode = {
      id: 'weighted-node',
      type: 'WeightedChoice',
      data: {
        choices: [
          { weight: 0.6, value: 'Choice A' },
          { weight: 0.4, value: 'Choice B' }
        ]
      }
    };

    it('should render all choices', () => {
      render(<WeightedChoiceEditor node={mockNode} />);

      expect(screen.getByDisplayValue('Choice A')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Choice B')).toBeInTheDocument();
      expect(screen.getByDisplayValue('0.6')).toBeInTheDocument();
      expect(screen.getByDisplayValue('0.4')).toBeInTheDocument();
    });

    it('should add new choice when Add Choice button is clicked', async () => {
      const user = userEvent.setup();
      const updateNodeData = jest.fn();

      // Mock the hook
      jest.spyOn(require('../hooks/useNodeUtils'), 'useNodeUtils').mockReturnValue({
        updateNodeData,
        deleteNode: jest.fn()
      });

      render(<WeightedChoiceEditor node={mockNode} />);

      const addButton = screen.getByText(/Add Choice/i);
      await user.click(addButton);

      expect(updateNodeData).toHaveBeenCalledWith(
        'weighted-node',
        expect.objectContaining({
          choices: expect.arrayContaining([
            expect.objectContaining({ weight: 0.6, value: 'Choice A' }),
            expect.objectContaining({ weight: 0.4, value: 'Choice B' }),
            expect.objectContaining({ weight: 0, value: '' })
          ])
        })
      );
    });

    it('should remove choice when Remove button is clicked', async () => {
      const user = userEvent.setup();
      const updateNodeData = jest.fn();

      jest.spyOn(require('../hooks/useNodeUtils'), 'useNodeUtils').mockReturnValue({
        updateNodeData,
        deleteNode: jest.fn()
      });

      render(<WeightedChoiceEditor node={mockNode} />);

      const removeButtons = screen.getAllByText(/Remove/i);
      await user.click(removeButtons[0]);

      expect(updateNodeData).toHaveBeenCalledWith(
        'weighted-node',
        expect.objectContaining({
          choices: expect.arrayContaining([
            expect.objectContaining({ weight: 0.4, value: 'Choice B' })
          ])
        })
      );
    });
  });

  describe('VariationList', () => {
    const variations = ['Variation 1', 'Variation 2', 'Variation 3'];

    it('should render all variations', () => {
      render(
        <VariationList
          variations={variations}
          onChange={() => {}}
          placeholder="Enter variation..."
        />
      );

      variations.forEach(variation => {
        expect(screen.getByDisplayValue(variation)).toBeInTheDocument();
      });
    });

    it('should add new variation', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();

      render(
        <VariationList
          variations={variations}
          onChange={onChange}
          placeholder="Enter variation..."
        />
      );

      const addButton = screen.getByText(/Add Variation/i);
      await user.click(addButton);

      expect(onChange).toHaveBeenCalledWith([...variations, '']);
    });

    it('should remove variation', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();

      render(
        <VariationList
          variations={variations}
          onChange={onChange}
          placeholder="Enter variation..."
        />
      );

      const removeButtons = screen.getAllByRole('button', { name: /remove/i });
      await user.click(removeButtons[1]);

      expect(onChange).toHaveBeenCalledWith(['Variation 1', 'Variation 3']);
    });

    it('should update variation text', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();

      render(
        <VariationList
          variations={variations}
          onChange={onChange}
          placeholder="Enter variation..."
        />
      );

      const inputs = screen.getAllByRole('textbox');
      await user.clear(inputs[0]);
      await user.type(inputs[0], 'Updated Variation');

      expect(onChange).toHaveBeenLastCalledWith([
        'Updated Variation',
        'Variation 2',
        'Variation 3'
      ]);
    });
  });

  describe('PreviewSection', () => {
    it('should render preview content', () => {
      render(
        <PreviewSection
          nodeId="test-node"
          nodeType="WeightedChoice"
        />
      );

      expect(screen.getByText(/Preview/i)).toBeInTheDocument();
    });

    it('should show loading state', () => {
      render(
        <PreviewSection
          nodeId="test-node"
          nodeType="WeightedChoice"
          isLoading={true}
        />
      );

      expect(screen.getByText(/Loading preview.../i)).toBeInTheDocument();
    });

    it('should show error state', () => {
      render(
        <PreviewSection
          nodeId="test-node"
          nodeType="WeightedChoice"
          error="Failed to generate preview"
        />
      );

      expect(screen.getByText(/Failed to generate preview/i)).toBeInTheDocument();
    });
  });
});