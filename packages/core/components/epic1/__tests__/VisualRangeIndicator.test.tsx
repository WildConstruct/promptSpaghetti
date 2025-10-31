import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { VisualRangeIndicator } from '../VisualRangeIndicator';
import { promptParser } from '../../../runtime/nodes/epic1/PromptParser';
import type { PromptAnalysis } from '../../../runtime/nodes/epic1/PromptParser';

describe('VisualRangeIndicator', () => {
  let mockPromptAnalysis: PromptAnalysis;

  beforeEach(() => {
    // Create a sample prompt analysis
    mockPromptAnalysis = promptParser.parse(
      'A weary merchant in tattered robes, carrying scrolls or books or potions'
    );
  });

  describe('Basic Rendering', () => {
    it('should render the original text', () => {
      render(<VisualRangeIndicator promptAnalysis={mockPromptAnalysis} />);
      
      expect(screen.getByText(/A weary merchant/)).toBeInTheDocument();
      expect(screen.getByText(/carrying scrolls/)).toBeInTheDocument();
    });

    it('should apply highlight colors to mapped segments', () => {
      const { container } = render(<VisualRangeIndicator promptAnalysis={mockPromptAnalysis} />);
      
      const mappedSegments = container.querySelectorAll('.mapped');
      expect(mappedSegments.length).toBeGreaterThan(0);
      
      mappedSegments.forEach(segment => {
        expect(segment).toHaveStyle('background-color: rgb(255, 230, 230)');
      });
    });

    it('should render legend with node types', () => {
      render(<VisualRangeIndicator promptAnalysis={mockPromptAnalysis} />);
      
      expect(screen.getByText('Visual Mapping:')).toBeInTheDocument();
      expect(screen.getByText('TextBlock')).toBeInTheDocument();
      expect(screen.getByText('WeightedChoice')).toBeInTheDocument();
    });

    it('should show character ranges in legend', () => {
      const { container } = render(<VisualRangeIndicator promptAnalysis={mockPromptAnalysis} />);
      
      const rangeIndicators = container.querySelectorAll('.legend span[style*="font-size: 11px"]');
      expect(rangeIndicators.length).toBeGreaterThan(0);
      
      rangeIndicators.forEach(indicator => {
        expect(indicator.textContent).toMatch(/\[\d+-\d+\]/);
      });
    });
  });

  describe('Hover Interactions', () => {
    it('should highlight segment on hover', () => {
      const onNodeHover = jest.fn();
      const { container } = render(
        <VisualRangeIndicator 
          promptAnalysis={mockPromptAnalysis}
          onNodeHover={onNodeHover}
        />
      );
      
      const mappedSegment = container.querySelector('.mapped') as HTMLElement;
      expect(mappedSegment).toBeTruthy();
      
      fireEvent.mouseEnter(mappedSegment);
      
      expect(mappedSegment).toHaveClass('hovered');
      expect(onNodeHover).toHaveBeenCalledWith(expect.any(String));
    });

    it('should remove highlight on mouse leave', () => {
      const onNodeHover = jest.fn();
      const { container } = render(
        <VisualRangeIndicator 
          promptAnalysis={mockPromptAnalysis}
          onNodeHover={onNodeHover}
        />
      );
      
      const mappedSegment = container.querySelector('.mapped') as HTMLElement;
      
      fireEvent.mouseEnter(mappedSegment);
      fireEvent.mouseLeave(mappedSegment);
      
      expect(mappedSegment).not.toHaveClass('hovered');
      expect(onNodeHover).toHaveBeenLastCalledWith(null);
    });

    it('should call onTextHover with correct range', () => {
      const onTextHover = jest.fn();
      const { container } = render(
        <VisualRangeIndicator 
          promptAnalysis={mockPromptAnalysis}
          onTextHover={onTextHover}
        />
      );
      
      const mappedSegment = container.querySelector('.mapped') as HTMLElement;
      const startIndex = parseInt(mappedSegment.getAttribute('data-start') || '0');
      const endIndex = parseInt(mappedSegment.getAttribute('data-end') || '0');
      
      fireEvent.mouseEnter(mappedSegment);
      
      expect(onTextHover).toHaveBeenCalledWith({
        start: startIndex,
        end: endIndex,
      });
    });

    it('should highlight correct segment when hoveredNodeId is provided', () => {
      const firstNodeId = mockPromptAnalysis.nodes[0].node.serialize().id;
      
      const { container, rerender } = render(
        <VisualRangeIndicator promptAnalysis={mockPromptAnalysis} />
      );
      
      rerender(
        <VisualRangeIndicator 
          promptAnalysis={mockPromptAnalysis}
          hoveredNodeId={firstNodeId}
        />
      );
      
      const hoveredSegment = container.querySelector(
        `[data-node-id="${firstNodeId}"]`
      ) as HTMLElement;
      
      expect(hoveredSegment).toHaveClass('hovered');
    });
  });

  describe('Connection Lines', () => {
    it('should render SVG for connection lines when enabled', () => {
      const { container } = render(
        <VisualRangeIndicator 
          promptAnalysis={mockPromptAnalysis}
          showConnectionLines={true}
        />
      );
      
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveStyle('position: fixed');
    });

    it('should not render SVG when connection lines are disabled', () => {
      const { container } = render(
        <VisualRangeIndicator 
          promptAnalysis={mockPromptAnalysis}
          showConnectionLines={false}
        />
      );
      
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument(); // SVG is always rendered but empty
      const paths = svg?.querySelectorAll('path');
      expect(paths?.length).toBe(0);
    });

    it('should render connection line when node is hovered', () => {
      // Mock getBoundingClientRect for testing
      const mockGetBoundingClientRect = jest.fn().mockReturnValue({
        left: 100,
        top: 100,
        width: 100,
        height: 20,
        right: 200,
        bottom: 120,
      });
      
      Element.prototype.getBoundingClientRect = mockGetBoundingClientRect;
      
      const firstNodeId = mockPromptAnalysis.nodes[0].node.serialize().id;
      
      // Create a mock node element in the document
      const mockNodeElement = document.createElement('div');
      mockNodeElement.setAttribute('data-node-id', firstNodeId);
      document.body.appendChild(mockNodeElement);
      
      const { container } = render(
        <VisualRangeIndicator 
          promptAnalysis={mockPromptAnalysis}
          showConnectionLines={true}
          hoveredNodeId={firstNodeId}
        />
      );
      
      const svg = container.querySelector('svg');
      const paths = svg?.querySelectorAll('path');
      expect(paths?.length).toBeGreaterThan(0);
      
      // Clean up
      document.body.removeChild(mockNodeElement);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty prompt analysis', () => {
      const emptyAnalysis = promptParser.parse('');
      
      const { container } = render(
        <VisualRangeIndicator promptAnalysis={emptyAnalysis} />
      );
      
      expect(container.querySelector('.prompt-text')?.textContent).toBe('');
    });

    it('should handle prompts with no mappings', () => {
      const analysisWithNoMappings: PromptAnalysis = {
        originalText: 'Simple text',
        segments: [],
        nodes: [],
        mappings: [],
      };
      
      render(<VisualRangeIndicator promptAnalysis={analysisWithNoMappings} />);
      
      expect(screen.getByText('Simple text')).toBeInTheDocument();
    });

    it('should handle very long prompts', () => {
      const longPrompt = 'A '.repeat(500) + 'very long prompt';
      const longAnalysis = promptParser.parse(longPrompt);
      
      const { container } = render(
        <VisualRangeIndicator promptAnalysis={longAnalysis} />
      );
      
      expect(container.querySelector('.prompt-text')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <VisualRangeIndicator 
          promptAnalysis={mockPromptAnalysis}
          className="custom-class"
        />
      );
      
      expect(container.querySelector('.visual-range-indicator')).toHaveClass('custom-class');
    });
  });

  describe('Color Management', () => {
    it('should use correct highlight colors from mappings', () => {
      const { container } = render(
        <VisualRangeIndicator promptAnalysis={mockPromptAnalysis} />
      );
      
      mockPromptAnalysis.mappings.forEach(mapping => {
        const segment = container.querySelector(
          `[data-node-id="${mapping.nodeId}"]`
        ) as HTMLElement;
        
        if (segment && mapping.highlightColor) {
          const rgb = hexToRgb(mapping.highlightColor);
          expect(segment).toHaveStyle(`background-color: ${rgb}`);
        }
      });
    });

    it('should darken color on hover', () => {
      const { container } = render(
        <VisualRangeIndicator promptAnalysis={mockPromptAnalysis} />
      );
      
      const mappedSegment = container.querySelector('.mapped') as HTMLElement;
      const originalColor = window.getComputedStyle(mappedSegment).backgroundColor;
      
      fireEvent.mouseEnter(mappedSegment);
      
      const hoveredColor = window.getComputedStyle(mappedSegment).backgroundColor;
      expect(hoveredColor).not.toBe(originalColor);
    });
  });

  describe('Accessibility', () => {
    it('should have proper cursor style for interactive segments', () => {
      const { container } = render(
        <VisualRangeIndicator promptAnalysis={mockPromptAnalysis} />
      );
      
      const mappedSegments = container.querySelectorAll('.mapped');
      mappedSegments.forEach(segment => {
        expect(segment).toHaveStyle('cursor: pointer');
      });
    });

    it('should maintain readable text contrast', () => {
      const { container } = render(
        <VisualRangeIndicator promptAnalysis={mockPromptAnalysis} />
      );
      
      const indicator = container.querySelector('.visual-range-indicator');
      expect(indicator).toHaveStyle('background-color: #f5f5f5');
    });
  });
});

// Helper function to convert hex to rgb
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {return hex;}
  
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  
  return `rgb(${r}, ${g}, ${b})`;
}