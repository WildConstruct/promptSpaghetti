import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import type { NodeProps } from 'reactflow';
import { EnhancedBranchingNode } from '../EnhancedBranchingNode';
import type { NodeIntelligenceService } from '../../../../services/llm';
import { useIntelligence } from '../../contexts/IntelligenceContext';
import type { BaseEditableNodeProps } from '../BaseEditableNode';

jest.mock('reactflow', () => ({
  Handle: () => null,
  useUpdateNodeInternals: () => jest.fn(),
  Position: {
    Left: 'left',
    Right: 'right'
  }
}));

jest.mock('../BaseEditableNode', () => ({
  BaseEditableNode: ({
    children,
    data
  }: Pick<BaseEditableNodeProps, 'children' | 'data'>) => (
    <div data-testid="base-editable-node">
      {children({
        isEditing: true,
        confirmEdit: jest.fn(),
        cancelEdit: jest.fn(),
        value: data?.value ?? '',
        editBuffer: data?.value ?? '',
        updateBuffer: jest.fn()
      })}
    </div>
  )
}));

jest.mock('../../contexts/IntelligenceContext', () => ({
  useIntelligence: jest.fn()
}));

describe('EnhancedBranchingNode', () => {
  const mockUseIntelligence = useIntelligence as jest.MockedFunction<
    typeof useIntelligence
  >;

  const defaultProps: NodeProps = {
    id: 'weighted-choice-1',
    type: 'weightedChoice',
    selected: false,
    dragging: false,
    zIndex: 0,
    xPos: 0,
    yPos: 0,
    isConnectable: true,
    data: {
      nodeType: 'weightedChoice',
      title: 'Weighted Choice',
      onEdit: jest.fn()
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(global, 'ResizeObserver', {
      value: class ResizeObserver {
        observe() {
          return undefined;
        }
        unobserve() {
          return undefined;
        }
        disconnect() {
          return undefined;
        }
      },
      writable: true,
      configurable: true
    });
    mockUseIntelligence.mockReturnValue({
      nodeIntelligence: {
        populateChoices: jest.fn(),
        optimizeWeights: jest.fn(),
        getInspiration: jest.fn()
      } as Pick<
        NodeIntelligenceService,
        'populateChoices' | 'optimizeWeights' | 'getInspiration'
      >,
      textRefinement: null,
      graphAnalyzer: null,
      metadataExtractor: null,
      similarityEngine: null,
      costTracker: null,
      consentGiven: false,
      isOffline: true,
      setConsent: jest.fn()
    });
  });

  it('shows offline suggestion tools for blank nodes without remote AI consent', () => {
    render(<EnhancedBranchingNode {...defaultProps} />);

    expect(
      screen.getByRole('button', { name: /populate choices/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /need inspiration\?/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /optimize weights/i })
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(/offline suggestions available/i)
    ).toBeInTheDocument();
  });

  it('uses label as the editable display title before legacy title', () => {
    render(
      <EnhancedBranchingNode
        {...defaultProps}
        data={{
          ...defaultProps.data,
          label: 'Age',
          title: 'Weighted Choice'
        }}
      />
    );

    expect(screen.getByText('AGE')).toBeInTheDocument();
  });

  it('persists title edits through the title-specific callback', () => {
    const onEdit = jest.fn();
    const onTitleEdit = jest.fn();
    const { container } = render(
      <EnhancedBranchingNode
        {...defaultProps}
        data={{
          ...defaultProps.data,
          label: 'Weighted Choice',
          title: 'Weighted Choice',
          onEdit,
          onTitleEdit
        }}
      />
    );

    const editButton = container.querySelector(
      '.title-edit-btn'
    ) as HTMLButtonElement;
    fireEvent.click(editButton);

    const input = screen.getByDisplayValue('Weighted Choice');
    fireEvent.change(input, { target: { value: 'Sex' } });
    fireEvent.blur(input);

    expect(onTitleEdit).toHaveBeenCalledWith('Sex');
    expect(onEdit).not.toHaveBeenCalled();
  });

  it('falls back to the default title when a title edit is blank', () => {
    const onTitleEdit = jest.fn();
    const { container } = render(
      <EnhancedBranchingNode
        {...defaultProps}
        data={{
          ...defaultProps.data,
          label: 'Weighted Choice',
          onTitleEdit
        }}
      />
    );

    const editButton = container.querySelector(
      '.title-edit-btn'
    ) as HTMLButtonElement;
    fireEvent.click(editButton);

    const input = screen.getByDisplayValue('Weighted Choice');
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onTitleEdit).toHaveBeenCalledWith('Weighted Choice');
  });
});
