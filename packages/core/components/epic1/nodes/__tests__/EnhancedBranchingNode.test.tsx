import React from 'react';
import { render, screen } from '@testing-library/react';
import type { NodeProps } from 'reactflow';
import { EnhancedBranchingNode } from '../EnhancedBranchingNode';
import { useIntelligence } from '../../contexts/IntelligenceContext';

jest.mock('reactflow', () => ({
  Handle: () => null,
  Position: {
    Left: 'left',
    Right: 'right'
  }
}));

jest.mock('../BaseEditableNode', () => ({
  BaseEditableNode: ({ children, data }: any) => (
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
      } as any,
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
});
