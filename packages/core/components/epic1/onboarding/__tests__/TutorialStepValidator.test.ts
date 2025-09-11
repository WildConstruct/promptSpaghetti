/**
 * Tests for TutorialStepValidator
 * Tests validation logic for tutorial step prerequisites
 */

import { jest } from '@jest/globals';
import {
  TutorialStepValidator,
  TutorialValidationContext
} from '../TutorialStepValidator';

describe('TutorialStepValidator', () => {
  describe('validateStep', () => {
    it('should validate nodes-created step with nodes present', () => {
      const context: TutorialValidationContext = {
        nodes: [
          { id: 'tutorial-choice-1', type: 'weightedChoice' },
          { id: 'tutorial-text-1', type: 'textBlock' }
        ],
        edges: []
      };

      const result = TutorialStepValidator.validateStep(
        'nodes-created',
        context
      );
      expect(result.isValid).toBe(true);
    });

    it('should fail nodes-created validation with no nodes', () => {
      const context: TutorialValidationContext = {
        nodes: [],
        edges: []
      };

      const result = TutorialStepValidator.validateStep(
        'nodes-created',
        context
      );
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('No nodes found');
      expect(result.canRecover).toBe(true);
      expect(result.recoveryMessage).toBeDefined();
    });

    it('should fail nodes-created validation with no tutorial nodes', () => {
      const context: TutorialValidationContext = {
        nodes: [
          { id: 'user-node-1', type: 'textBlock' } // Not a tutorial node
        ],
        edges: []
      };

      const result = TutorialStepValidator.validateStep(
        'nodes-created',
        context
      );
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('No tutorial-generated nodes found');
    });

    it('should validate inline-edit step with weighted choice nodes', () => {
      const context: TutorialValidationContext = {
        nodes: [
          { id: 'tutorial-choice-1', type: 'weightedChoice' },
          { id: 'tutorial-text-1', type: 'textBlock' }
        ],
        edges: []
      };

      const result = TutorialStepValidator.validateStep('inline-edit', context);
      expect(result.isValid).toBe(true);
    });

    it('should fail inline-edit validation without weighted choice nodes', () => {
      const context: TutorialValidationContext = {
        nodes: [
          { id: 'tutorial-text-1', type: 'textBlock' },
          { id: 'tutorial-text-2', type: 'textBlock' }
        ],
        edges: []
      };

      const result = TutorialStepValidator.validateStep('inline-edit', context);
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('No weighted choice nodes found');
      expect(result.canRecover).toBe(true);
    });

    it('should validate preview-update step with nodes and edges', () => {
      const context: TutorialValidationContext = {
        nodes: [
          { id: 'node-1', type: 'textBlock' },
          { id: 'node-2', type: 'weightedChoice' }
        ],
        edges: [{ id: 'edge-1', source: 'node-1', target: 'node-2' }]
      };

      const result = TutorialStepValidator.validateStep(
        'preview-update',
        context
      );
      expect(result.isValid).toBe(true);
    });

    it('should fail preview-update validation with no nodes', () => {
      const context: TutorialValidationContext = {
        nodes: [],
        edges: []
      };

      const result = TutorialStepValidator.validateStep(
        'preview-update',
        context
      );
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('No nodes in the graph');
    });

    it('should fail preview-update validation with no edges', () => {
      const context: TutorialValidationContext = {
        nodes: [
          { id: 'node-1', type: 'textBlock' },
          { id: 'node-2', type: 'weightedChoice' }
        ],
        edges: []
      };

      const result = TutorialStepValidator.validateStep(
        'preview-update',
        context
      );
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('No connections between nodes');
    });

    it('should fail preview-update validation with isolated nodes', () => {
      const context: TutorialValidationContext = {
        nodes: [
          { id: 'node-1', type: 'textBlock' },
          { id: 'node-2', type: 'weightedChoice' },
          { id: 'node-3', type: 'textBlock' }
        ],
        edges: [
          { id: 'edge-1', source: 'node-1', target: 'node-2' }
          // node-3 is isolated
        ]
      };

      const result = TutorialStepValidator.validateStep(
        'preview-update',
        context
      );
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('Some nodes are not connected');
    });

    it('should validate empty-canvas step regardless of content', () => {
      const context: TutorialValidationContext = {
        nodes: [],
        edges: []
      };

      const result = TutorialStepValidator.validateStep(
        'empty-canvas',
        context
      );
      expect(result.isValid).toBe(true);
    });

    it('should validate paste-prompt step regardless of content', () => {
      const context: TutorialValidationContext = {
        nodes: [],
        edges: []
      };

      const result = TutorialStepValidator.validateStep(
        'paste-prompt',
        context
      );
      expect(result.isValid).toBe(true);
    });

    it('should return valid result for unknown step', () => {
      const context: TutorialValidationContext = {
        nodes: [],
        edges: []
      };

      const result = TutorialStepValidator.validateStep(
        'unknown-step',
        context
      );
      expect(result.isValid).toBe(true);
    });
  });

  describe('getValidationErrorMessage', () => {
    it('should return empty string for valid results', () => {
      const result = { isValid: true };
      const message = TutorialStepValidator.getValidationErrorMessage(result);
      expect(message).toBe('');
    });

    it('should format error message with recovery info', () => {
      const result = {
        isValid: false,
        message: 'Test error',
        recoveryMessage: 'Try this action',
        canRecover: true
      };

      const message = TutorialStepValidator.getValidationErrorMessage(result);
      expect(message).toContain('Test error');
      expect(message).toContain('Try this action');
    });

    it('should handle missing recovery message', () => {
      const result = {
        isValid: false,
        message: 'Test error'
      };

      const message = TutorialStepValidator.getValidationErrorMessage(result);
      expect(message).toBe('Test error');
    });
  });

  describe('canRecover', () => {
    it('should return true for recoverable errors', () => {
      const result = {
        isValid: false,
        canRecover: true,
        recoveryAction: () => console.log('recovery')
      };

      const canRecover = TutorialStepValidator.canRecover(result);
      expect(canRecover).toBe(true);
    });

    it('should return false for non-recoverable errors', () => {
      const result = {
        isValid: false,
        canRecover: false
      };

      const canRecover = TutorialStepValidator.canRecover(result);
      expect(canRecover).toBe(false);
    });

    it('should return false for valid results', () => {
      const result = { isValid: true };

      const canRecover = TutorialStepValidator.canRecover(result);
      expect(canRecover).toBe(false);
    });

    it('should return false when recovery action is missing', () => {
      const result = {
        isValid: false,
        canRecover: true
      };

      const canRecover = TutorialStepValidator.canRecover(result);
      expect(canRecover).toBe(false);
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle empty context gracefully', () => {
      const context: TutorialValidationContext = {
        nodes: [],
        edges: []
      };

      const result = TutorialStepValidator.validateStep(
        'nodes-created',
        context
      );
      expect(result.isValid).toBe(false);
      expect(result.message).toBeDefined();
    });

    it('should handle missing nodes array', () => {
      const context = {} as TutorialValidationContext;

      const result = TutorialStepValidator.validateStep(
        'nodes-created',
        context
      );
      expect(result.isValid).toBe(false);
    });

    it('should handle missing edges array', () => {
      const context = { nodes: [] } as TutorialValidationContext;

      const result = TutorialStepValidator.validateStep(
        'preview-update',
        context
      );
      expect(result.isValid).toBe(false);
    });

    it('should handle malformed node objects', () => {
      const context: TutorialValidationContext = {
        nodes: [
          { id: undefined, type: 'textBlock' },
          null,
          { id: 'node-1' }
        ] as any,
        edges: []
      };

      const result = TutorialStepValidator.validateStep(
        'nodes-created',
        context
      );
      // Should not throw error, should handle gracefully
      expect(typeof result.isValid).toBe('boolean');
    });

    it('should handle malformed edge objects', () => {
      const context: TutorialValidationContext = {
        nodes: [{ id: 'node-1', type: 'textBlock' }],
        edges: [
          { source: 'node-1' }, // Missing target
          null,
          { source: 'node-1', target: 'invalid' }
        ] as any
      };

      const result = TutorialStepValidator.validateStep(
        'preview-update',
        context
      );
      // Should not throw error, should handle gracefully
      expect(typeof result.isValid).toBe('boolean');
    });
  });

  describe('Recovery mechanisms', () => {
    it('should provide helpful recovery messages', () => {
      const context: TutorialValidationContext = {
        nodes: [],
        edges: []
      };

      const result = TutorialStepValidator.validateStep(
        'nodes-created',
        context
      );

      expect(result.canRecover).toBe(true);
      expect(result.recoveryMessage).toBeDefined();
      expect(result.recoveryMessage).toContain('Try pasting the prompt again');
    });

    it('should provide specific recovery actions for different scenarios', () => {
      // Test different validation scenarios
      const scenarios = [
        {
          step: 'inline-edit',
          context: { nodes: [{ type: 'textBlock' }], edges: [] }
        },
        {
          step: 'preview-update',
          context: { nodes: [{ type: 'textBlock' }], edges: [] }
        }
      ];

      scenarios.forEach(({ step, context }) => {
        const result = TutorialStepValidator.validateStep(
          step,
          context as TutorialValidationContext
        );
        if (!result.isValid && result.canRecover) {
          expect(result.recoveryMessage).toBeDefined();
          expect(result.recoveryMessage.length).toBeGreaterThan(0);
        }
      });
    });
  });
});
