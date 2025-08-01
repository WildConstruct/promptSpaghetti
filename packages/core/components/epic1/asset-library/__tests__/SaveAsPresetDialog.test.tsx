/**
 * Tests for Save As Preset Dialog
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { SaveAsPresetDialog } from '../SaveAsPresetDialog';
import { EditableNodeData } from '../../nodes';
import { Preset } from '../types';

describe('SaveAsPresetDialog', () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();

  const mockNodeData: EditableNodeData = {
    value: 'test value',
    text: 'test text',
    nodeType: 'textBlock',
    isEditing: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders when open', () => {
    const { getByText, getByLabelText } = render(
      <SaveAsPresetDialog
        isOpen={true}
        nodeData={mockNodeData}
        nodeType="textBlock"
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    expect(getByText('Save as Preset')).toBeInTheDocument();
    expect(getByLabelText('Preset Name *')).toBeInTheDocument();
    expect(getByLabelText('Category')).toBeInTheDocument();
    expect(getByLabelText('Tags (comma-separated)')).toBeInTheDocument();
    expect(getByLabelText('Description')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    const { container } = render(
      <SaveAsPresetDialog
        isOpen={false}
        nodeData={mockNodeData}
        nodeType="textBlock"
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('saves preset with form data', () => {
    const { getByLabelText, getByText } = render(
      <SaveAsPresetDialog
        isOpen={true}
        nodeData={mockNodeData}
        nodeType="textBlock"
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    // Fill form
    fireEvent.change(getByLabelText('Preset Name *'), {
      target: { value: 'My Custom Preset' },
    });
    fireEvent.change(getByLabelText('Category'), {
      target: { value: 'character-occupations' },
    });
    fireEvent.change(getByLabelText('Tags (comma-separated)'), {
      target: { value: 'custom, test, example' },
    });
    fireEvent.change(getByLabelText('Description'), {
      target: { value: 'This is a test preset' },
    });

    // Save
    fireEvent.click(getByText('Save Preset'));

    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'My Custom Preset',
        category: 'character-occupations',
        tags: ['custom', 'test', 'example'],
        nodeType: 'textBlock',
        value: { text: 'test text' },
        metadata: expect.objectContaining({
          description: 'This is a test preset',
          author: 'user',
        }),
      })
    );
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('disables save button when name is empty', () => {
    const { getByText } = render(
      <SaveAsPresetDialog
        isOpen={true}
        nodeData={mockNodeData}
        nodeType="textBlock"
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    const saveButton = getByText('Save Preset');
    expect(saveButton).toBeDisabled();
  });

  it('enables save button when name is provided', () => {
    const { getByLabelText, getByText } = render(
      <SaveAsPresetDialog
        isOpen={true}
        nodeData={mockNodeData}
        nodeType="textBlock"
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    fireEvent.change(getByLabelText('Preset Name *'), {
      target: { value: 'Test Name' },
    });

    const saveButton = getByText('Save Preset');
    expect(saveButton).not.toBeDisabled();
  });

  it('closes without saving on cancel', () => {
    const { getByText } = render(
      <SaveAsPresetDialog
        isOpen={true}
        nodeData={mockNodeData}
        nodeType="textBlock"
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    fireEvent.click(getByText('Cancel'));

    expect(mockOnClose).toHaveBeenCalled();
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('shows preview of node data', () => {
    const { getByText } = render(
      <SaveAsPresetDialog
        isOpen={true}
        nodeData={mockNodeData}
        nodeType="textBlock"
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    expect(getByText('Preview')).toBeInTheDocument();
    expect(getByText('textBlock')).toBeInTheDocument();
  });

  it('handles weighted choice node type', () => {
    const weightedNodeData: EditableNodeData = {
      value: JSON.stringify([
        { text: 'option1', weight: 60 },
        { text: 'option2', weight: 40 },
      ]),
      options: [
        { text: 'option1', weight: 60 },
        { text: 'option2', weight: 40 },
      ],
      nodeType: 'weightedChoice',
      isEditing: false,
    };

    const { getByLabelText, getByText } = render(
      <SaveAsPresetDialog
        isOpen={true}
        nodeData={weightedNodeData}
        nodeType="weightedChoice"
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    fireEvent.change(getByLabelText('Preset Name *'), {
      target: { value: 'Weighted Test' },
    });
    fireEvent.click(getByText('Save Preset'));

    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({
        nodeType: 'weightedChoice',
        value: {
          options: [
            { text: 'option1', weight: 60 },
            { text: 'option2', weight: 40 },
          ],
        },
      })
    );
  });

  it('parses tags correctly', () => {
    const { getByLabelText, getByText } = render(
      <SaveAsPresetDialog
        isOpen={true}
        nodeData={mockNodeData}
        nodeType="textBlock"
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    fireEvent.change(getByLabelText('Preset Name *'), {
      target: { value: 'Test' },
    });

    // Test various tag formats
    fireEvent.change(getByLabelText('Tags (comma-separated)'), {
      target: { value: '  tag1  , tag2,tag3  ,  tag4  ' },
    });

    fireEvent.click(getByText('Save Preset'));

    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({
        tags: ['tag1', 'tag2', 'tag3', 'tag4'],
      })
    );
  });

  it('handles empty tags', () => {
    const { getByLabelText, getByText } = render(
      <SaveAsPresetDialog
        isOpen={true}
        nodeData={mockNodeData}
        nodeType="textBlock"
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    fireEvent.change(getByLabelText('Preset Name *'), {
      target: { value: 'Test' },
    });
    fireEvent.change(getByLabelText('Tags (comma-separated)'), {
      target: { value: '' },
    });

    fireEvent.click(getByText('Save Preset'));

    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({
        tags: [],
      })
    );
  });

  it('generates unique preset IDs', () => {
    const { getByLabelText, getByText, rerender } = render(
      <SaveAsPresetDialog
        isOpen={true}
        nodeData={mockNodeData}
        nodeType="textBlock"
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    // Save first preset
    fireEvent.change(getByLabelText('Preset Name *'), {
      target: { value: 'Preset 1' },
    });
    fireEvent.click(getByText('Save Preset'));

    const firstCall = mockOnSave.mock.calls[0][0] as Preset;

    // Reset and save second preset
    mockOnSave.mockClear();
    rerender(
      <SaveAsPresetDialog
        isOpen={true}
        nodeData={mockNodeData}
        nodeType="textBlock"
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    fireEvent.change(getByLabelText('Preset Name *'), {
      target: { value: 'Preset 2' },
    });
    fireEvent.click(getByText('Save Preset'));

    const secondCall = mockOnSave.mock.calls[0][0] as Preset;

    // IDs should be different
    expect(firstCall.id).not.toBe(secondCall.id);
  });
});