/**
 * Tutorial Step Validator
 * Validates prerequisites for tutorial steps to prevent failures
 */

export interface StepValidationResult {
  isValid: boolean;
  message?: string;
  canRecover?: boolean;
  recoveryAction?: () => void;
  recoveryMessage?: string;
}

export interface TutorialValidationContext {
  nodes: any[];
  edges: any[];
  tutorialState?: any;
  currentUser?: any;
  graphState?: any;
}

/**
 * Tutorial Step Validator Class
 * Provides validation logic for tutorial step prerequisites
 */
export class TutorialStepValidator {

  /**
   * Validate step prerequisites
   */
  static validateStep(stepId: string, context: TutorialValidationContext): StepValidationResult {
    console.log(`[TutorialStepValidator] Validating step: ${stepId}`, context);

    switch (stepId) {
      case 'nodes-created':
        return this.validateNodesCreated(context);
      case 'inline-edit':
        return this.validateInlineEdit(context);
      case 'preview-update':
        return this.validatePreviewUpdate(context);
      case 'empty-canvas':
        return this.validateEmptyCanvas(context);
      case 'paste-prompt':
        return this.validatePastePrompt(context);
      default:
        return { isValid: true };
    }
  }

  /**
   * Validate that nodes were actually created
   */
  private static validateNodesCreated(context: TutorialValidationContext): StepValidationResult {
    const { nodes } = context;

    if (!nodes || nodes.length === 0) {
      return {
        isValid: false,
        message: 'No nodes found. The prompt parsing may have failed.',
        canRecover: true,
        recoveryAction: () => {
          // Could restart tutorial or provide manual node creation option
          console.log('[TutorialStepValidator] Recovery: Could restart prompt parsing');
        },
        recoveryMessage: 'Try pasting the prompt again or restart the tutorial.'
      };
    }

    // Check for tutorial-created nodes
    const tutorialNodes = nodes.filter(node =>
      node.id && node.id.includes('tutorial-')
    );

    if (tutorialNodes.length === 0) {
      return {
        isValid: false,
        message: 'No tutorial-generated nodes found.',
        canRecover: true,
        recoveryAction: () => {
          console.log('[TutorialStepValidator] Recovery: Could trigger prompt parsing again');
        },
        recoveryMessage: 'The prompt may not have been parsed correctly. Try the tutorial again.'
      };
    }

    return { isValid: true };
  }

  /**
   * Validate that there are editable nodes available
   */
  private static validateInlineEdit(context: TutorialValidationContext): StepValidationResult {
    const { nodes } = context;

    if (!nodes || nodes.length === 0) {
      return {
        isValid: false,
        message: 'No nodes available to edit.',
        canRecover: false,
        recoveryMessage: 'Please complete the previous tutorial steps first.'
      };
    }

    const hasWeightedChoice = nodes.some(node =>
      node.type === 'weightedChoice' ||
      (node.data && node.data.nodeType === 'weightedChoice')
    );

    if (!hasWeightedChoice) {
      return {
        isValid: false,
        message: 'No weighted choice nodes found to edit.',
        canRecover: true,
        recoveryAction: () => {
          console.log('[TutorialStepValidator] Recovery: Could guide user to create weighted choice node');
        },
        recoveryMessage: 'Try creating a weighted choice node first by using the prompt with {option1|option2} syntax.'
      };
    }

    return { isValid: true };
  }

  /**
   * Validate that the graph is ready for preview
   */
  private static validatePreviewUpdate(context: TutorialValidationContext): StepValidationResult {
    const { nodes, edges } = context;

    if (!nodes || nodes.length === 0) {
      return {
        isValid: false,
        message: 'No nodes in the graph to preview.',
        canRecover: false,
        recoveryMessage: 'Please create some nodes first by completing earlier tutorial steps.'
      };
    }

    if (!edges || edges.length === 0) {
      return {
        isValid: false,
        message: 'No connections between nodes found.',
        canRecover: true,
        recoveryAction: () => {
          console.log('[TutorialStepValidator] Recovery: Could guide user to connect nodes');
        },
        recoveryMessage: 'Try connecting your nodes together to create a complete graph.'
      };
    }

    // Check if nodes are properly connected
    const connectedNodeIds = new Set();
    edges.forEach(edge => {
      connectedNodeIds.add(edge.source);
      connectedNodeIds.add(edge.target);
    });

    const isolatedNodes = nodes.filter(node =>
      !connectedNodeIds.has(node.id)
    );

    if (isolatedNodes.length > 0) {
      return {
        isValid: false,
        message: 'Some nodes are not connected to the graph.',
        canRecover: true,
        recoveryAction: () => {
          console.log('[TutorialStepValidator] Recovery: Could highlight isolated nodes');
        },
        recoveryMessage: `${isolatedNodes.length} node(s) are not connected. Try connecting all nodes together.`
      };
    }

    return { isValid: true };
  }

  /**
   * Validate that the canvas is empty for initial tutorial step
   */
  private static validateEmptyCanvas(context: TutorialValidationContext): StepValidationResult {
    const { nodes } = context;

    // For the empty canvas step, we actually want it to be empty
    // But we should allow some tolerance for tutorial-generated content
    const nonTutorialNodes = nodes.filter(node =>
      !node.id || !node.id.includes('tutorial-')
    );

    if (nonTutorialNodes.length > 5) {
      console.warn('[TutorialStepValidator] Many non-tutorial nodes found, but allowing tutorial to proceed');
    }

    // This step is always valid - the canvas state doesn't matter for the initial step
    return { isValid: true };
  }

  /**
   * Validate that the paste functionality is ready
   */
  private static validatePastePrompt(context: TutorialValidationContext): StepValidationResult {
    // This step is about preparing to paste, so it's always valid
    // The actual validation happens when the paste occurs
    return { isValid: true };
  }

  /**
   * Get a user-friendly error message for validation failures
   */
  static getValidationErrorMessage(result: StepValidationResult): string {
    if (result.isValid) return '';

    const baseMessage = result.message || 'Step validation failed';
    const recoveryMessage = result.recoveryMessage ? `\n\n${result.recoveryMessage}` : '';

    return `${baseMessage}${recoveryMessage}`;
  }

  /**
   * Check if a step can proceed with recovery options
   */
  static canRecover(result: StepValidationResult): boolean {
    return result.canRecover === true && !!result.recoveryAction;
  }
}

export default TutorialStepValidator;
