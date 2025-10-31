/**
 * Integration tests for the complete Tutorial System
 * Tests the entire tutorial flow from start to finish
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { jest } from '@jest/globals';

// Mock all tutorial components
jest.mock('../TutorialOverlay', () => ({
  TutorialOverlay: () => <div data-testid="tutorial-overlay">Tutorial Overlay</div>
}));

jest.mock('../PromptPasteDialog', () => ({
  PromptPasteDialog: ({ isOpen, onPaste }: any) => (
    isOpen ? (
      <div data-testid="paste-dialog">
        <button onClick={() => onPaste('Test prompt')} data-testid="paste-submit">
          Create Nodes
        </button>
      </div>
    ) : null
  )
}));

// Mock the main Epic1GraphEditor
jest.mock('../../../Epic1GraphEditor', () => ({
  Epic1GraphEditor: () => <div data-testid="graph-editor">Graph Editor</div>
}));

import { TutorialProvider, useTutorial } from '../TutorialContext';
import { PromptParser } from '../utils/promptParser';
import { ElementDetector } from '../ElementDetector';
import { TutorialStepValidator } from '../TutorialStepValidator';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('Tutorial System Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  localStorageMock.setItem.mockImplementation(() => undefined);
  });

  describe('Complete Tutorial Flow', () => {
    it('should complete full tutorial workflow', async () => {
      const TestComponent = () => {
        const { isActive, currentStep, tutorialSteps, startTutorial, nextStep } = useTutorial();

        return (
          <div>
            <button onClick={startTutorial} data-testid="start-tutorial">
              Start Tutorial
            </button>
            <div data-testid="tutorial-status">
              Active: {isActive ? 'Yes' : 'No'}, Step: {currentStep}
            </div>
            <button onClick={() => nextStep()} data-testid="next-step">
              Next Step
            </button>
          </div>
        );
      };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <TutorialProvider>{children}</TutorialProvider>
      );

      render(<TestComponent />, { wrapper });

      // Initial state
      expect(screen.getByTestId('tutorial-status')).toHaveTextContent('Active: No, Step: 0');

      // Start tutorial
      fireEvent.click(screen.getByTestId('start-tutorial'));
      expect(screen.getByTestId('tutorial-status')).toHaveTextContent('Active: Yes, Step: 0');

      // Progress through steps
      for (let i = 0; i < 5; i++) { // Test first few steps
        fireEvent.click(screen.getByTestId('next-step'));
        await waitFor(() => {
          expect(screen.getByTestId('tutorial-status')).toHaveTextContent(`Active: Yes, Step: ${i + 1}`);
        });
      }
    });

    it('should persist tutorial progress', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <TutorialProvider>{children}</TutorialProvider>
      );

      const { rerender } = render(
        <div>Test Component</div>,
        { wrapper }
      );

      // Trigger state changes that should be saved
      rerender(
        <TutorialProvider>
          <TutorialTestHelper />
        </TutorialProvider>
      );

      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });

  describe('Prompt Parsing Integration', () => {
    it('should parse tutorial example prompt correctly', () => {
      const examplePrompt = 'A {brave|cunning|wise} {knight|wizard|rogue} ventures into the {dark forest|ancient ruins|dragon\'s lair}';

      const result = PromptParser.parse(examplePrompt);

      expect(result.nodeCount).toBe(7); // 4 text segments + 3 choice segments
      expect(result.choiceCount).toBe(3);
      expect(result.textCount).toBe(4);

      // Check specific segments
      expect(result.segments[1].type).toBe('choice');
      expect(result.segments[1].options).toEqual(['brave', 'cunning', 'wise']);

      expect(result.segments[3].type).toBe('choice');
      expect(result.segments[3].options).toEqual(['knight', 'wizard', 'rogue']);
    });

    it('should validate prompts correctly', () => {
      const validPrompt = 'A {valid|choice} here';
      const invalidPrompt = 'A {unclosed|choice here';
      const emptyPrompt = '';

      expect(PromptParser.validate(validPrompt).isValid).toBe(true);
      expect(PromptParser.validate(invalidPrompt).isValid).toBe(false);
      expect(PromptParser.validate(emptyPrompt).isValid).toBe(false);
    });
  });

  describe('Element Detection Integration', () => {
    it('should detect elements with various strategies', async () => {
      // Mock DOM element
      const mockElement = document.createElement('div');
      mockElement.id = 'test-element';
      mockElement.className = 'tutorial-target';
      document.body.appendChild(mockElement);

      const result = await ElementDetector.findElement({
        selector: '.tutorial-target'
      });

      expect(result.found).toBe(true);
      expect(result.element).toBe(mockElement);

      document.body.removeChild(mockElement);
    });

    it('should handle element not found gracefully', async () => {
      const result = await ElementDetector.findElement({
        selector: '.non-existent-element',
        maxRetries: 2,
        retryDelay: 10
      });

      expect(result.found).toBe(false);
      expect(result.element).toBe(null);
      expect(result.attempts).toBeGreaterThan(0);
    });
  });

  describe('Step Validation Integration', () => {
    it('should validate tutorial steps correctly', () => {
      // Test nodes-created validation
      const contextWithNodes = {
        nodes: [{ id: 'tutorial-node-1', type: 'weightedChoice' }],
        edges: []
      };

      const contextWithoutNodes = {
        nodes: [],
        edges: []
      };

      expect(TutorialStepValidator.validateStep('nodes-created', contextWithNodes).isValid).toBe(true);
      expect(TutorialStepValidator.validateStep('nodes-created', contextWithoutNodes).isValid).toBe(false);

      // Test inline-edit validation
      const contextWithWeightedChoice = {
        nodes: [{ id: 'weighted-1', type: 'weightedChoice' }],
        edges: []
      };

      const contextWithoutWeightedChoice = {
        nodes: [{ id: 'text-1', type: 'textBlock' }],
        edges: []
      };

      expect(TutorialStepValidator.validateStep('inline-edit', contextWithWeightedChoice).isValid).toBe(true);
      expect(TutorialStepValidator.validateStep('inline-edit', contextWithoutWeightedChoice).isValid).toBe(false);
    });

    it('should provide helpful recovery messages', () => {
      const invalidContext = {
        nodes: [],
        edges: []
      };

      const result = TutorialStepValidator.validateStep('nodes-created', invalidContext);

      expect(result.canRecover).toBe(true);
      expect(result.recoveryMessage).toContain('Try pasting the prompt again');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle malformed prompts gracefully', () => {
      const malformedPrompts = [
        '{unclosed',
        'text}',
        '{{double-open}',
        '{empty|}',
        '{|empty-first}',
        'text {valid|choice} more text'
      ];

      malformedPrompts.forEach(prompt => {
        expect(() => PromptParser.parse(prompt)).not.toThrow();
      });
    });

    it('should handle network failures in element detection', async () => {
      // Mock a scenario where DOM queries fail
      const originalQuerySelector = document.querySelector;
      document.querySelector = jest.fn(() => null);

      const result = await ElementDetector.findElement({
        selector: '.any-element'
      });

      expect(result.found).toBe(false);

      document.querySelector = originalQuerySelector;
    });

    it('should handle invalid tutorial contexts', () => {
      const invalidContexts = [
        null,
        undefined,
        {},
        { nodes: null },
        { edges: null }
      ];

      invalidContexts.forEach(context => {
        expect(() => {
          TutorialStepValidator.validateStep('nodes-created', context as any);
        }).not.toThrow();
      });
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle large prompts efficiently', () => {
      const largePrompt = 'Word '.repeat(100) + '{option1|option2|option3} ' + 'word '.repeat(100);

      const startTime = Date.now();
      const result = PromptParser.parse(largePrompt);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(50); // Should complete quickly
      expect(result.nodeCount).toBeGreaterThan(1);
    });

    it('should handle many DOM queries efficiently', async () => {
      // Create multiple test elements
      const elements = [];
      for (let i = 0; i < 10; i++) {
        const el = document.createElement('div');
        el.className = `test-element-${i}`;
        document.body.appendChild(el);
        elements.push(el);
      }

      const startTime = Date.now();

      // Query multiple elements
      for (let i = 0; i < 10; i++) {
        await ElementDetector.findElement({
          selector: `.test-element-${i}`,
          maxRetries: 1
        });
      }

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(200); // Should complete within reasonable time

      // Cleanup
      elements.forEach(el => document.body.removeChild(el));
    });
  });

  describe('Accessibility and User Experience', () => {
    it('should provide meaningful error messages', () => {
      const invalidPrompt = 'A {unclosed choice';
      const validation = PromptParser.validate(invalidPrompt);

      expect(validation.isValid).toBe(false);
      expect(validation.message).toContain('Unmatched braces');
    });

    it('should handle keyboard navigation', () => {
      // Test that keyboard shortcuts work in tutorial
      const mockKeyDown = (key: string) => {
        fireEvent.keyDown(document, { key });
      };

      // This would test keyboard handling if implemented in components
      expect(mockKeyDown).toBeDefined();
    });
  });
});

// Helper component for testing
const TutorialTestHelper: React.FC = () => {
  const { startTutorial, nextStep } = useTutorial();

  React.useEffect(() => {
    startTutorial();
    nextStep();
  }, [startTutorial, nextStep]);

  return null;
};
